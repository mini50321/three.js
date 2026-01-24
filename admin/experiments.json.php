<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/classes/Database.php';

header('Content-Type: application/json');

try {
    if (!class_exists('Database')) {
        throw new Exception('Database class not found');
    }
    
    $db = new Database();
    
    if (!method_exists($db, 'getAllExperiments')) {
        throw new Exception('getAllExperiments method not found');
    }
    
    $experiments = $db->getAllExperiments();

    if (!is_array($experiments)) {
        throw new Exception('getAllExperiments() did not return an array. Got: ' . gettype($experiments));
    }

    $output = [];
    foreach ($experiments as $exp) {
        try {
            if (!isset($exp['id'])) {
                continue;
            }
            $fullExp = $db->getExperiment($exp['id']);
            if ($fullExp) {
                $output[] = $fullExp;
            }
        } catch (Exception $e) {
            error_log('Error loading experiment ' . ($exp['id'] ?? 'unknown') . ': ' . $e->getMessage());
        }
    }

    echo json_encode($output, JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Database error',
        'details' => 'Database connection or query failed. Please check database configuration.'
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Failed to load experiments',
        'details' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Failed to load experiments',
        'details' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT);
}

