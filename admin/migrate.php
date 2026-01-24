<?php
require_once __DIR__ . '/classes/Database.php';

$jsonFile = __DIR__ . '/experiments.json';

if (!file_exists($jsonFile)) {
    die("experiments.json file not found");
}

$data = json_decode(file_get_contents($jsonFile), true);

if (!$data || !is_array($data)) {
    die("Invalid JSON data");
}

$db = new Database();
$successCount = 0;
$errorCount = 0;

foreach ($data as $exp) {
    try {
        $existing = $db->getExperiment($exp['id']);
        if ($existing) {
            echo "Skipping experiment '{$exp['title']}' (ID: {$exp['id']}) - already exists<br>";
            continue;
        }
        
        $db->createExperiment($exp);
        $successCount++;
        echo "Migrated experiment '{$exp['title']}' (ID: {$exp['id']})<br>";
    } catch (Exception $e) {
        $errorCount++;
        echo "Error migrating experiment '{$exp['title']}' (ID: {$exp['id']}): " . $e->getMessage() . "<br>";
    }
}

echo "<br><strong>Migration complete!</strong><br>";
echo "Successfully migrated: {$successCount}<br>";
echo "Errors: {$errorCount}<br>";
echo "<br><a href='index.php'>Go to Admin Panel</a>";

