<?php
echo "<h2>Test Extension Loading</h2>";

echo "<h3>Current extension_dir:</h3>";
$currentDir = ini_get('extension_dir');
echo "Value: <code>$currentDir</code><br>";

$phpDir = dirname(PHP_BINARY);
echo "PHP directory: <code>$phpDir</code><br>";

$resolvedPath = $phpDir . DIRECTORY_SEPARATOR . $currentDir;
echo "Resolved path: <code>$resolvedPath</code><br>";
echo "Path exists: " . (is_dir($resolvedPath) ? 'YES' : 'NO') . "<br>";

echo "<h3>Try loading extension manually:</h3>";
if (function_exists('dl')) {
    echo "dl() function is available<br>";
    $dllPath = $resolvedPath . DIRECTORY_SEPARATOR . 'php_pdo_sqlite.dll';
    if (file_exists($dllPath)) {
        echo "Attempting to load: <code>$dllPath</code><br>";
        $result = @dl('pdo_sqlite');
        if ($result) {
            echo "<span style='color: green;'>✓ Successfully loaded pdo_sqlite!</span><br>";
        } else {
            echo "<span style='color: red;'>✗ Failed to load. Error: " . error_get_last()['message'] . "</span><br>";
        }
    } else {
        echo "<span style='color: red;'>DLL file not found at: $dllPath</span><br>";
    }
} else {
    echo "<span style='color: orange;'>dl() function is disabled (this is normal for web server)</span><br>";
    echo "Extensions must be loaded via php.ini, not dynamically<br>";
}

echo "<h3>Check for Visual C++ Runtime:</h3>";
$vcredistFiles = [
    'C:\Windows\System32\msvcr120.dll',
    'C:\Windows\System32\msvcp120.dll',
    'C:\Windows\System32\vcruntime140.dll',
    'C:\Windows\System32\msvcp140.dll'
];

$found = false;
foreach ($vcredistFiles as $file) {
    if (file_exists($file)) {
        echo "✓ Found: " . basename($file) . "<br>";
        $found = true;
    }
}

if (!$found) {
    echo "<span style='color: orange;'>Visual C++ Runtime files not found in System32</span><br>";
    echo "You may need to install Visual C++ Redistributable<br>";
}

echo "<h3>Current php.ini Configuration:</h3>";
$iniFile = php_ini_loaded_file();
if ($iniFile && file_exists($iniFile)) {
    $iniContent = file_get_contents($iniFile);
    
    preg_match('/^extension_dir\s*=\s*(.+)$/m', $iniContent, $extDirMatch);
    $extDirInIni = isset($extDirMatch[1]) ? trim($extDirMatch[1], ' "\'') : 'Not found';
    echo "extension_dir in php.ini: <code>$extDirInIni</code><br>";
    
    preg_match('/^(extension=pdo_sqlite|;extension=pdo_sqlite)$/m', $iniContent, $pdoMatch);
    $pdoStatus = isset($pdoMatch[1]) ? $pdoMatch[1] : 'Not found';
    $pdoEnabled = strpos($pdoStatus, ';') === false;
    echo "pdo_sqlite: <code>$pdoStatus</code> - " . ($pdoEnabled ? '<span style="color: green;">ENABLED</span>' : '<span style="color: red;">DISABLED</span>') . "<br>";
    
    preg_match('/^(extension=sqlite3|;extension=sqlite3)$/m', $iniContent, $sqliteMatch);
    $sqliteStatus = isset($sqliteMatch[1]) ? $sqliteMatch[1] : 'Not found';
    $sqliteEnabled = strpos($sqliteStatus, ';') === false;
    echo "sqlite3: <code>$sqliteStatus</code> - " . ($sqliteEnabled ? '<span style="color: green;">ENABLED</span>' : '<span style="color: red;">DISABLED</span>') . "<br>";
} else {
    echo "Could not read php.ini file<br>";
}

echo "<h3>Recommended Fix:</h3>";
echo "<ol>";
echo "<li>Open <code>C:\\php\\php.ini</code> in a text editor (as Administrator)</li>";
echo "<li>Find line 758 (or search for <code>extension_dir</code>)</li>";
echo "<li>Change <code>extension_dir = \"ext\"</code> to one of these:<br>";
echo "&nbsp;&nbsp;Option 1: <code>extension_dir = \"C:\\php\\ext\"</code> (backslashes)<br>";
echo "&nbsp;&nbsp;Option 2: <code>extension_dir = \"C:/php/ext\"</code> (forward slashes)<br>";
echo "&nbsp;&nbsp;Option 3: <code>extension_dir = C:\\php\\ext</code> (no quotes)</li>";
echo "<li>Verify lines 935 and 946:<br>";
echo "&nbsp;&nbsp;Line 935: <code>extension=pdo_sqlite</code> (NO semicolon at start)<br>";
echo "&nbsp;&nbsp;Line 946: <code>extension=sqlite3</code> (NO semicolon at start)</li>";
echo "<li>Save the file</li>";
echo "<li><strong>IMPORTANT: Completely stop the PHP server (Ctrl+C in the terminal)</strong></li>";
echo "<li>Wait 5-10 seconds</li>";
echo "<li>Restart: <code>C:\\php\\php.exe -S 127.0.0.1:8000</code></li>";
echo "<li>Refresh this page to verify extensions are loaded</li>";
echo "</ol>";

echo "<h3>Alternative: Check Windows Event Viewer</h3>";
echo "If extensions still don't load after restart, check Windows Event Viewer for DLL load errors:<br>";
echo "<ol>";
echo "<li>Press Win+R, type <code>eventvwr.msc</code>, press Enter</li>";
echo "<li>Go to Windows Logs → Application</li>";
echo "<li>Look for errors related to <code>php_pdo_sqlite.dll</code> or <code>php_sqlite3.dll</code></li>";
echo "<li>These errors will show if there are missing dependencies</li>";
echo "</ol>";

