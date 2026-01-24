<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>PHP Database Test</h2>";

echo "<h3>1. Extension Check:</h3>";
echo "PDO loaded: " . (extension_loaded('pdo') ? 'YES' : 'NO') . "<br>";
echo "PDO SQLite loaded: " . (extension_loaded('pdo_sqlite') ? 'YES' : 'NO') . "<br>";
echo "SQLite3 loaded: " . (extension_loaded('sqlite3') ? 'YES' : 'NO') . "<br>";

echo "<h3>2. Database Path Check:</h3>";
$dbPath = __DIR__ . '/../../data/experiments.db';
$dbDir = dirname($dbPath);
echo "Database path: " . $dbPath . "<br>";
echo "Database directory: " . $dbDir . "<br>";
echo "Directory exists: " . (is_dir($dbDir) ? 'YES' : 'NO') . "<br>";
echo "Directory writable: " . (is_writable($dbDir) ? 'YES' : 'NO') . "<br>";

if (!is_dir($dbDir)) {
    echo "Creating directory...<br>";
    if (mkdir($dbDir, 0755, true)) {
        echo "Directory created successfully!<br>";
    } else {
        echo "Failed to create directory!<br>";
        $error = error_get_last();
        echo "Error: " . ($error['message'] ?? 'Unknown') . "<br>";
    }
}

echo "<h3>3. Database Connection Test:</h3>";
try {
    if (!extension_loaded('pdo_sqlite')) {
        throw new Exception("PDO SQLite extension not loaded");
    }
    
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✓ Database connection successful!<br>";
    
    $db->exec("CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, name TEXT)");
    echo "✓ Table creation test successful!<br>";
    
    $stmt = $db->query("SELECT name FROM sqlite_master WHERE type='table'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "✓ Tables in database: " . implode(', ', $tables) . "<br>";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "<br>";
    echo "File: " . $e->getFile() . "<br>";
    echo "Line: " . $e->getLine() . "<br>";
}

echo "<h3>4. Database Configuration:</h3>";
require_once __DIR__ . '/config/database.php';
echo "DB_TYPE: " . DB_TYPE . "<br>";
echo "DB_SQLITE_PATH: " . DB_SQLITE_PATH . "<br>";

