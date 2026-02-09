<?php
// Support environment variables (for Render.com, Heroku, etc.)
define('DB_TYPE', getenv('DB_TYPE') ?: 'sqlite');
define('DB_SQLITE_PATH', getenv('DB_SQLITE_PATH') ?: __DIR__ . '/../../data/experiments.db');

define('DB_MYSQL_HOST', getenv('DB_MYSQL_HOST') ?: 'localhost');
define('DB_MYSQL_DBNAME', getenv('DB_MYSQL_DBNAME') ?: 'virtual_lab');
define('DB_MYSQL_USER', getenv('DB_MYSQL_USER') ?: 'root');
define('DB_MYSQL_PASS', getenv('DB_MYSQL_PASS') ?: '');

function getDBConnection() {
    try {
        if (DB_TYPE === 'sqlite') {
            if (!extension_loaded('pdo_sqlite')) {
                if (!extension_loaded('pdo')) {
                    throw new Exception("PDO extension is not loaded. Please enable extension=pdo in php.ini");
                }
                throw new Exception("PDO SQLite extension is not loaded. Please enable extension=pdo_sqlite in php.ini");
            }
            
            $dbPath = DB_SQLITE_PATH;
            $dbDir = dirname($dbPath);
            
            if (!is_dir($dbDir)) {
                if (!@mkdir($dbDir, 0755, true)) {
                    $error = error_get_last();
                    throw new Exception("Failed to create database directory: " . $dbDir . ". Error: " . ($error['message'] ?? 'Unknown error'));
                }
            }
            
            if (!is_writable($dbDir)) {
                throw new Exception("Database directory is not writable: " . $dbDir);
            }
            
            try {
                $db = new PDO('sqlite:' . $dbPath);
                $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                return $db;
            } catch (PDOException $e) {
                throw new Exception("Failed to create SQLite database: " . $e->getMessage() . " (Path: " . $dbPath . ")");
            }
        } else {
            if (!extension_loaded('pdo_mysql')) {
                throw new Exception("PDO MySQL extension is not loaded. Please enable extension=pdo_mysql in php.ini");
            }
            
            $dsn = "mysql:host=" . DB_MYSQL_HOST . ";dbname=" . DB_MYSQL_DBNAME . ";charset=utf8mb4";
            $db = new PDO($dsn, DB_MYSQL_USER, DB_MYSQL_PASS);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $db;
        }
    } catch (PDOException $e) {
        throw new Exception("Database connection failed: " . $e->getMessage());
    } catch (Exception $e) {
        throw $e;
    }
}

