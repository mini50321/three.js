<?php
$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

if ($requestPath === '/admin' || $requestPath === '/admin/') {
    $adminIndex = __DIR__ . '/admin/index.php';
    if (file_exists($adminIndex)) {
        chdir(__DIR__ . '/admin');
        $_SERVER['SCRIPT_NAME'] = '/admin/index.php';
        $_SERVER['PHP_SELF'] = '/admin/index.php';
        require $adminIndex;
        return true;
    }
}

return false;

