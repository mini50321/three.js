<?php
echo "<h2>PHP Extension Verification</h2>";

echo "<h3>1. Extension Directory:</h3>";
$extDir = ini_get('extension_dir');
echo "extension_dir setting: <strong>" . $extDir . "</strong><br>";

if (empty($extDir) || $extDir === './') {
    echo "<span style='color: red;'>⚠️ extension_dir is not set correctly!</span><br>";
    echo "It should be set to: <code>ext</code> (relative) or <code>C:\\php\\ext</code> (absolute)<br>";
}

echo "<h3>2. DLL File Check:</h3>";
$phpDir = dirname(PHP_BINARY);
$extPath = $extDir;
if (!is_dir($extPath) && is_dir($phpDir . DIRECTORY_SEPARATOR . $extDir)) {
    $extPath = $phpDir . DIRECTORY_SEPARATOR . $extDir;
}

$dllFiles = [
    'php_pdo_sqlite.dll',
    'php_sqlite3.dll'
];

foreach ($dllFiles as $dll) {
    $fullPath = $extPath . DIRECTORY_SEPARATOR . $dll;
    $exists = file_exists($fullPath);
    $status = $exists ? '✓ EXISTS' : '✗ MISSING';
    $color = $exists ? 'green' : 'red';
    echo "<span style='color: $color;'>$status</span>: $dll<br>";
    if (!$exists) {
        echo "&nbsp;&nbsp;&nbsp;&nbsp;Looked in: $fullPath<br>";
    }
}

echo "<h3>3. Extension Loading Status:</h3>";
echo "PDO loaded: " . (extension_loaded('pdo') ? '<span style="color: green;">YES</span>' : '<span style="color: red;">NO</span>') . "<br>";
echo "PDO SQLite loaded: " . (extension_loaded('pdo_sqlite') ? '<span style="color: green;">YES</span>' : '<span style="color: red;">NO</span>') . "<br>";
echo "SQLite3 loaded: " . (extension_loaded('sqlite3') ? '<span style="color: green;">YES</span>' : '<span style="color: red;">NO</span>') . "<br>";

echo "<h3>4. PDO Drivers:</h3>";
if (extension_loaded('pdo')) {
    $drivers = PDO::getAvailableDrivers();
    echo "Available drivers: " . implode(', ', $drivers) . "<br>";
    if (in_array('sqlite', $drivers)) {
        echo "<span style='color: green;'>✓ SQLite driver is available!</span><br>";
    } else {
        echo "<span style='color: red;'>✗ SQLite driver is NOT available</span><br>";
    }
} else {
    echo "<span style='color: red;'>✗ PDO extension not loaded</span><br>";
}

echo "<h3>5. PHP Configuration File:</h3>";
echo "Loaded php.ini: <strong>" . php_ini_loaded_file() . "</strong><br>";
echo "Scanned additional .ini files: " . (php_ini_scanned_files() ?: 'None') . "<br>";

echo "<h3>6. PHP Error Log (Last 20 lines):</h3>";
$errorLog = ini_get('error_log');
if ($errorLog && file_exists($errorLog)) {
    $lines = file($errorLog);
    $lastLines = array_slice($lines, -20);
    echo "<pre style='background: #f0f0f0; padding: 10px; max-height: 300px; overflow-y: auto;'>";
    echo htmlspecialchars(implode('', $lastLines));
    echo "</pre>";
} else {
    echo "Error log not found or not set.<br>";
    echo "Check Windows Event Viewer or PHP server console for errors.<br>";
}

echo "<h3>7. Troubleshooting Steps:</h3>";
echo "<ol>";
if (!extension_loaded('pdo_sqlite')) {
    echo "<li><strong>Verify DLL files exist:</strong><br>";
    echo "&nbsp;&nbsp;Look in: <code>$extPath</code><br>";
    echo "&nbsp;&nbsp;Files needed: <code>php_pdo_sqlite.dll</code> and <code>php_sqlite3.dll</code></li>";
    
    echo "<li><strong>Check extension_dir:</strong><br>";
    echo "&nbsp;&nbsp;Current value: <code>$extDir</code><br>";
    echo "&nbsp;&nbsp;Should resolve to: <code>$extPath</code></li>";
    
    echo "<li><strong>Verify php.ini syntax:</strong><br>";
    echo "&nbsp;&nbsp;Make sure <code>extension=pdo_sqlite</code> is on its own line (no semicolon)<br>";
    echo "&nbsp;&nbsp;Make sure <code>extension=sqlite3</code> is on its own line (no semicolon)</li>";
    
    echo "<li><strong>Check for missing dependencies:</strong><br>";
    echo "&nbsp;&nbsp;SQLite extensions may need Visual C++ Redistributable<br>";
    echo "&nbsp;&nbsp;Check Windows Event Viewer for DLL load errors</li>";
    
    echo "<li><strong>Restart PHP server:</strong><br>";
    echo "&nbsp;&nbsp;Stop the server completely (Ctrl+C)<br>";
    echo "&nbsp;&nbsp;Wait a few seconds<br>";
    echo "&nbsp;&nbsp;Restart: <code>C:\\php\\php.exe -S 127.0.0.1:8000</code></li>";
    
    echo "<li><strong>Try absolute path in php.ini:</strong><br>";
    echo "&nbsp;&nbsp;Change <code>extension_dir = \"ext\"</code> to <code>extension_dir = \"C:\\php\\ext\"</code><br>";
    echo "&nbsp;&nbsp;Or try: <code>extension_dir = \"C:/php/ext\"</code></li>";
}
echo "</ol>";

