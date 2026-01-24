<?php
require_once __DIR__ . '/classes/Database.php';

$db = new Database();
$id = $_GET['id'] ?? null;

if (!$id) {
    die("Experiment ID required");
}

$exp = $db->getExperiment($id);

if (!$exp) {
    die("Experiment not found");
}

header('Content-Type: application/json');
header('Content-Disposition: attachment; filename="experiment_' . $id . '.json"');
echo json_encode($exp, JSON_PRETTY_PRINT);
