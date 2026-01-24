<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>PHP Server Configuration Check</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h2 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        h3 { color: #666; margin-top: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        .box { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h2>🔍 PHP Web Server Configuration Diagnostic</h2>
        
        <h3>1. Which php.ini is the Web Server Using?</h3>
        <?php
        $loadedIni = php_ini_loaded_file();
        $scannedIni = php_ini_scanned_files();
        
        echo "<p><strong>Loaded php.ini:</strong> <code>" . ($loadedIni ?: 'None') . "</code></p>";
        
        if ($loadedIni && file_exists($loadedIni)) {
            echo "<p class='success'>✓ php.ini file exists and is readable</p>";
        } else {
            echo "<p class='error'>✗ php.ini file not found or not readable</p>";
        }
        
        if ($scannedIni) {
            echo "<p><strong>Additional scanned files:</strong> <code>$scannedIni</code></p>";
        }
        ?>
        
        <h3>2. Extension Directory Configuration</h3>
        <?php
        $extDir = ini_get('extension_dir');
        $phpDir = dirname(PHP_BINARY);
        $resolvedPath = $phpDir . DIRECTORY_SEPARATOR . $extDir;
        
        echo "<p><strong>extension_dir (runtime):</strong> <code>$extDir</code></p>";
        echo "<p><strong>PHP binary directory:</strong> <code>$phpDir</code></p>";
        echo "<p><strong>Resolved extension path:</strong> <code>$resolvedPath</code></p>";
        echo "<p>Path exists: " . (is_dir($resolvedPath) ? '<span class="success">✓ YES</span>' : '<span class="error">✗ NO</span>') . "</p>";
        
        if ($loadedIni && file_exists($loadedIni)) {
            $iniContent = file_get_contents($loadedIni);
            preg_match('/^extension_dir\s*=\s*(.+)$/m', $iniContent, $matches);
            if (isset($matches[1])) {
                $extDirInFile = trim($matches[1], ' "\'');
                echo "<p><strong>extension_dir in php.ini file:</strong> <code>" . htmlspecialchars($extDirInFile) . "</code></p>";
                
                if ($extDirInFile !== $extDir) {
                    echo "<p class='warning'>⚠️ MISMATCH! php.ini says '$extDirInFile' but PHP reports '$extDir'</p>";
                    echo "<p>This means the server needs to be restarted!</p>";
                } else {
                    echo "<p class='success'>✓ Values match</p>";
                }
            }
        }
        ?>
        
        <h3>3. Extension Loading Status</h3>
        <?php
        $extensions = get_loaded_extensions();
        $pdoLoaded = extension_loaded('pdo');
        $pdoSqliteLoaded = extension_loaded('pdo_sqlite');
        $sqlite3Loaded = extension_loaded('sqlite3');
        
        echo "<p>PDO: " . ($pdoLoaded ? '<span class="success">✓ LOADED</span>' : '<span class="error">✗ NOT LOADED</span>') . "</p>";
        echo "<p>PDO SQLite: " . ($pdoSqliteLoaded ? '<span class="success">✓ LOADED</span>' : '<span class="error">✗ NOT LOADED</span>') . "</p>";
        echo "<p>SQLite3: " . ($sqlite3Loaded ? '<span class="success">✓ LOADED</span>' : '<span class="error">✗ NOT LOADED</span>') . "</p>";
        
        if (!$pdoSqliteLoaded || !$sqlite3Loaded) {
            echo "<p class='error'>Extensions are NOT loaded in the web server!</p>";
        }
        ?>
        
        <h3>4. Check php.ini File Content</h3>
        <?php
        if ($loadedIni && file_exists($loadedIni)) {
            $iniContent = file_get_contents($loadedIni);
            
            preg_match('/^extension_dir\s*=\s*(.+)$/m', $iniContent, $extDirMatch);
            if (isset($extDirMatch[1])) {
                $extDirValue = trim($extDirMatch[1], ' "\'');
                echo "<p><strong>extension_dir in file:</strong> <code>" . htmlspecialchars($extDirValue) . "</code></p>";
                
                if (substr($extDirValue, -1) === '"' || substr($extDirValue, 0, 1) === '"' && substr($extDirValue, -1) === '"' && substr($extDirValue, -2, 1) !== '\\') {
                    echo "<p class='error'>✗ SYNTAX ERROR! extension_dir has extra quotes: <code>" . htmlspecialchars($extDirValue) . "</code></p>";
                }
            }
            
            preg_match('/^extension\s*=\s*pdo_sqlite\s*$/m', $iniContent, $pdoMatch);
            $pdoEnabled = !empty($pdoMatch);
            
            preg_match('/^;extension\s*=\s*pdo_sqlite\s*$/m', $iniContent, $pdoCommented);
            $pdoCommented = !empty($pdoCommented);
            
            if ($pdoEnabled) {
                $pdoLine = 'extension=pdo_sqlite';
            } elseif ($pdoCommented) {
                $pdoLine = ';extension=pdo_sqlite';
            } else {
                $pdoLine = 'NOT FOUND';
            }
            
            preg_match('/^extension\s*=\s*sqlite3\s*$/m', $iniContent, $sqliteMatch);
            $sqliteEnabled = !empty($sqliteMatch);
            
            preg_match('/^;extension\s*=\s*sqlite3\s*$/m', $iniContent, $sqliteCommented);
            $sqliteCommented = !empty($sqliteCommented);
            
            if ($sqliteEnabled) {
                $sqliteLine = 'extension=sqlite3';
            } elseif ($sqliteCommented) {
                $sqliteLine = ';extension=sqlite3';
            } else {
                $sqliteLine = 'NOT FOUND';
            }
            
            echo "<p><strong>pdo_sqlite line:</strong> <code>" . htmlspecialchars($pdoLine) . "</code> - ";
            echo ($pdoEnabled ? '<span class="success">ENABLED</span>' : '<span class="error">DISABLED</span>') . "</p>";
            
            echo "<p><strong>sqlite3 line:</strong> <code>" . htmlspecialchars($sqliteLine) . "</code> - ";
            echo ($sqliteEnabled ? '<span class="success">ENABLED</span>' : '<span class="error">DISABLED</span>') . "</p>";
        }
        ?>
        
        <h3>5. DLL Files Check</h3>
        <?php
        $extDir = ini_get('extension_dir');
        $phpDir = dirname(PHP_BINARY);
        $resolvedPath = $phpDir . DIRECTORY_SEPARATOR . $extDir;
        
        $pdoDll = $resolvedPath . DIRECTORY_SEPARATOR . 'php_pdo_sqlite.dll';
        $sqliteDll = $resolvedPath . DIRECTORY_SEPARATOR . 'php_sqlite3.dll';
        
        echo "<p>Checking: <code>$resolvedPath</code></p>";
        echo "<p>php_pdo_sqlite.dll: " . (file_exists($pdoDll) ? '<span class="success">✓ EXISTS</span>' : '<span class="error">✗ NOT FOUND</span>') . "</p>";
        echo "<p>php_sqlite3.dll: " . (file_exists($sqliteDll) ? '<span class="success">✓ EXISTS</span>' : '<span class="error">✗ NOT FOUND</span>') . "</p>";
        ?>
        
        <h3>6. Test Database Connection</h3>
        <?php
        try {
            if ($pdoSqliteLoaded) {
                $testDb = new PDO('sqlite::memory:');
                echo "<p class='success'>✓✓✓ SUCCESS! PDO SQLite connection works!</p>";
            } else {
                echo "<p class='error'>✗ Cannot test - pdo_sqlite extension not loaded</p>";
            }
        } catch (Exception $e) {
            echo "<p class='error'>✗ Connection failed: " . htmlspecialchars($e->getMessage()) . "</p>";
        }
        ?>
        
        <div class="box">
            <h3>🔧 How to Fix</h3>
            <?php if (!$pdoSqliteLoaded || !$sqlite3Loaded): ?>
                <ol>
                    <li><strong>Stop the PHP server completely:</strong>
                        <ul>
                            <li>Go to the terminal where PHP server is running</li>
                            <li>Press <code>Ctrl+C</code> to stop it</li>
                            <li>Wait 5-10 seconds to ensure it's fully stopped</li>
                        </ul>
                    </li>
                    <li><strong>Verify php.ini settings:</strong>
                        <ul>
                            <li>Open <code><?php echo htmlspecialchars($loadedIni ?: 'C:\\php\\php.ini'); ?></code></li>
                            <li>Find <code>extension_dir</code> (around line 758)</li>
                            <li>Make sure it says: <code>extension_dir = "C:\\php\\ext"</code></li>
                            <li>Find <code>extension=pdo_sqlite</code> (around line 935) - make sure there's NO semicolon at the start</li>
                            <li>Find <code>extension=sqlite3</code> (around line 946) - make sure there's NO semicolon at the start</li>
                        </ul>
                    </li>
                    <li><strong>Restart the server:</strong>
                        <pre>C:\php\php.exe -S 127.0.0.1:8000</pre>
                        <p><strong>Important:</strong> Use the full path <code>C:\php\php.exe</code> to ensure it uses the correct php.ini</p>
                    </li>
                    <li><strong>Refresh this page</strong> to verify extensions are now loaded</li>
                </ol>
            <?php else: ?>
                <p class='success'>✓ Everything looks good! Extensions are loaded.</p>
            <?php endif; ?>
        </div>
        
        <h3>7. Comparison: CLI vs Web Server</h3>
        <p>Run this command in PowerShell to see if CLI loads extensions:</p>
        <pre>C:\php\php.exe -m | Select-String -Pattern "pdo|sqlite"</pre>
        <p>If CLI shows extensions but web server doesn't, the web server needs to be restarted.</p>
    </div>
</body>
</html>

