<?php
echo "<h2>PHP Extension Check</h2>";

echo "<h3>Loaded Extensions:</h3>";
$allExtensions = get_loaded_extensions();
$sqliteExtensions = array_filter($allExtensions, function($ext) {
    return stripos($ext, 'sqlite') !== false || stripos($ext, 'pdo') !== false;
});

echo "<strong>PDO-related extensions:</strong><br>";
foreach ($sqliteExtensions as $ext) {
    echo "✓ " . $ext . "<br>";
}

if (empty($sqliteExtensions)) {
    echo "<strong style='color: red;'>No SQLite/PDO extensions found!</strong><br>";
}

echo "<h3>Extension Check Functions:</h3>";
echo "extension_loaded('pdo'): " . (extension_loaded('pdo') ? 'YES' : 'NO') . "<br>";
echo "extension_loaded('pdo_sqlite'): " . (extension_loaded('pdo_sqlite') ? 'YES' : 'NO') . "<br>";
echo "extension_loaded('sqlite3'): " . (extension_loaded('sqlite3') ? 'YES' : 'NO') . "<br>";

echo "<h3>PHP Configuration:</h3>";
echo "php.ini location: " . php_ini_loaded_file() . "<br>";
echo "Additional .ini files: " . php_ini_scanned_files() . "<br>";

echo "<h3>PDO Drivers:</h3>";
if (extension_loaded('pdo')) {
    $drivers = PDO::getAvailableDrivers();
    echo "Available PDO drivers: " . implode(', ', $drivers) . "<br>";
    if (!in_array('sqlite', $drivers)) {
        echo "<strong style='color: red;'>SQLite driver NOT available!</strong><br>";
    }
} else {
    echo "<strong style='color: red;'>PDO extension not loaded!</strong><br>";
}

echo "<h3>How to Fix:</h3>";
echo "<ol>";
echo "<li>Open this file in your php.ini: <strong>" . php_ini_loaded_file() . "</strong></li>";
echo "<li>Search for: <code>;extension=pdo_sqlite</code></li>";
echo "<li>Remove the semicolon: <code>extension=pdo_sqlite</code></li>";
echo "<li>Also uncomment: <code>extension=sqlite3</code></li>";
echo "<li>Save the file and restart your PHP server</li>";
echo "</ol>";

