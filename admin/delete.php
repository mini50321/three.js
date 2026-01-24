<?php
require_once __DIR__ . '/classes/Database.php';

$db = new Database();
$id = $_GET['id'] ?? null;

if (!$id) {
    die("Experiment ID required");
}

try {
    $db->deleteExperiment($id);
    header("Location: index.php");
    exit;
} catch (Exception $e) {
    die("Error deleting experiment: " . $e->getMessage());
}
