<?php
$baseDir = __DIR__;
$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

$staticExtensions = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot', 'glb', 'json'];
$pathInfo = pathinfo($requestPath);
$extension = isset($pathInfo['extension']) ? strtolower($pathInfo['extension']) : '';

if (in_array($extension, $staticExtensions)) {
    $filePath = $baseDir . $requestPath;
    if (file_exists($filePath) && is_file($filePath)) {
        return false;
    }
}

if (strpos($requestPath, '/admin') === 0) {
    $adminPath = $baseDir . $requestPath;
    if ($requestPath === '/admin' || $requestPath === '/admin/') {
        $adminPath = $baseDir . '/admin/index.php';
    }
    
    if (file_exists($adminPath) && is_file($adminPath)) {
        chdir($baseDir . '/admin');
        $_SERVER['SCRIPT_NAME'] = $requestPath;
        $_SERVER['PHP_SELF'] = $requestPath;
        require $adminPath;
        return true;
    }
}

$filePath = $baseDir . $requestPath;
if ($requestPath === '/' || $requestPath === '') {
    $filePath = $baseDir . '/index.html';
}

if (file_exists($filePath) && is_file($filePath)) {
    return false;
}

return false;

