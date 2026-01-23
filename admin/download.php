<?php
$data = json_decode(file_get_contents("experiments.json"), true);
$id = $_GET['id'];

foreach ($data as $exp) {
    if ($exp['id'] === $id) {
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="'.$id.'.json"');
        echo json_encode($exp, JSON_PRETTY_PRINT);
        exit;
    }
}
