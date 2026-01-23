<?php
$data = json_decode(file_get_contents("experiments.json"), true);
$id = $_GET['id'];

$data = array_filter($data, fn($e) => $e['id'] !== $id);
file_put_contents("experiments.json", json_encode(array_values($data), JSON_PRETTY_PRINT));

header("Location: index.php");
