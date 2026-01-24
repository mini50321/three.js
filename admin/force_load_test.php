<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Force Extension Load Test</h2>";

echo "<h3>1. Check if extensions can be loaded via ini_set:</h3>";
$result1 = @ini_set('extension', 'pdo_sqlite');
echo "ini_set('extension', 'pdo_sqlite'): " . ($result1 !== false ? 'SUCCESS' : 'FAILED') . "<br>";
if ($result1 === false) {
    $error = error_get_last();
    echo "Error: " . ($error['message'] ?? 'Unknown') . "<br>";
}

echo "<h3>2. Check loaded extensions list:</h3>";
$allExts = get_loaded_extensions();
$pdoExts = array_filter($allExts, function($ext) {
    return stripos($ext, 'pdo') !== false || stripos($ext, 'sqlite') !== false;
});
echo "PDO/SQLite related extensions: " . (empty($pdoExts) ? 'NONE' : implode(', ', $pdoExts)) . "<br>";

echo "<h3>3. Try to create PDO SQLite connection directly:</h3>";
try {
    $testDb = new PDO('sqlite::memory:');
    echo "<span style='color: green;'>✓ SUCCESS! PDO SQLite is working!</span><br>";
    echo "This means the extension IS loaded, just not detected by extension_loaded()<br>";
    $testDb = null;
} catch (PDOException $e) {
    echo "<span style='color: red;'>✗ FAILED: " . $e->getMessage() . "</span><br>";
    echo "This confirms the extension is NOT loaded<br>";
} catch (Exception $e) {
    echo "<span style='color: red;'>✗ ERROR: " . $e->getMessage() . "</span><br>";
}

echo "<h3>4. Check extension_dir resolution:</h3>";
$extDir = ini_get('extension_dir');
$phpDir = dirname(PHP_BINARY);
echo "ini_get('extension_dir'): <code>$extDir</code><br>";
echo "PHP binary directory: <code>$phpDir</code><br>";

$possiblePaths = [
    $extDir,
    $phpDir . DIRECTORY_SEPARATOR . $extDir,
    'C:\\php\\ext',
    'C:/php/ext'
];

echo "Checking possible extension paths:<br>";
foreach ($possiblePaths as $path) {
    $dllPath = $path . DIRECTORY_SEPARATOR . 'php_pdo_sqlite.dll';
    $exists = file_exists($dllPath);
    $status = $exists ? '✓' : '✗';
    $color = $exists ? 'green' : 'red';
    echo "<span style='color: $color;'>$status</span> <code>$dllPath</code><br>";
}

echo "<h3>5. Check php.ini file directly:</h3>";
$iniFile = php_ini_loaded_file();
if ($iniFile && file_exists($iniFile)) {
    $content = file_get_contents($iniFile);
    
    preg_match('/^extension_dir\s*=\s*(.+)$/m', $content, $matches);
    if (isset($matches[1])) {
        $extDirInFile = trim($matches[1], ' "\'');
        echo "extension_dir in php.ini file: <code>" . htmlspecialchars($extDirInFile) . "</code><br>";
        
        if (substr($extDirInFile, -1) === '"' || substr($extDirInFile, 0, 1) === '"') {
            echo "<span style='color: red; font-weight: bold;'>✗ SYNTAX ERROR! extension_dir has extra quotes!</span><br>";
            echo "Fix: Remove extra quotes. Should be: <code>extension_dir = \"C:\\php\\ext\"</code><br>";
        }
        
        echo "Current runtime value: <code>" . ini_get('extension_dir') . "</code><br>";
        if ($extDirInFile !== ini_get('extension_dir')) {
            echo "<span style='color: orange;'>⚠️ Mismatch! php.ini says '$extDirInFile' but PHP reports '" . ini_get('extension_dir') . "'</span><br>";
            echo "This usually means the server wasn't restarted after changing php.ini<br>";
        }
    }
    
    $pdoLine = preg_match('/^extension\s*=\s*pdo_sqlite\s*$/m', $content);
    $sqliteLine = preg_match('/^extension\s*=\s*sqlite3\s*$/m', $content);
    
    echo "extension=pdo_sqlite in file: " . ($pdoLine ? '<span style="color: green;">YES</span>' : '<span style="color: red;">NO</span>') . "<br>";
    echo "extension=sqlite3 in file: " . ($sqliteLine ? '<span style="color: green;">YES</span>' : '<span style="color: red;">NO</span>') . "<br>";
}

echo "<h3>6. Final Test - Try Database Connection:</h3>";
try {
    require_once __DIR__ . '/config/database.php';
    $db = getDBConnection();
    echo "<span style='color: green; font-size: 18px; font-weight: bold;'>✓✓✓ SUCCESS! Database connection works! ✓✓✓</span><br>";
    echo "This means SQLite extensions ARE loaded and working!<br>";
    echo "The issue might be with extension_loaded() detection, but the extensions are functional.<br>";
} catch (Exception $e) {
    echo "<span style='color: red;'>✗ Database connection failed: " . $e->getMessage() . "</span><br>";
}

echo "<h3>7. IMPORTANT: Server Restart Required</h3>";
$extDirInFile = '';
$extDirRuntime = ini_get('extension_dir');
$iniFile = php_ini_loaded_file();
if ($iniFile && file_exists($iniFile)) {
    $content = file_get_contents($iniFile);
    preg_match('/^extension_dir\s*=\s*(.+)$/m', $content, $matches);
    if (isset($matches[1])) {
        $extDirInFile = trim($matches[1], ' "\'');
    }
}

if ($extDirInFile !== $extDirRuntime) {
    echo "<div style='background: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;'>";
    echo "<h4 style='color: #856404; margin-top: 0;'>⚠️ SERVER RESTART REQUIRED</h4>";
    echo "<p><strong>The PHP server MUST be restarted for changes to take effect!</strong></p>";
    echo "<p>php.ini says: <code>$extDirInFile</code><br>";
    echo "PHP reports: <code>$extDirRuntime</code></p>";
    echo "<p><strong>Steps to fix:</strong></p>";
    echo "<ol>";
    echo "<li>Go to the terminal where PHP server is running</li>";
    echo "<li>Press <strong>Ctrl+C</strong> to stop it</li>";
    echo "<li>Wait 5-10 seconds</li>";
    echo "<li>Run: <code>C:\\php\\php.exe -S 127.0.0.1:8000</code></li>";
    echo "<li>Refresh this page</li>";
    echo "</ol>";
    echo "</div>";
} else {
    echo "<span style='color: green;'>✓ extension_dir matches - server was restarted correctly</span><br>";
}

