<?php
$data = file_exists("experiments.json")
    ? json_decode(file_get_contents("experiments.json"), true)
    : [];

if ($_POST['mode'] === 'create') {

    $models = [];
    if (!empty($_FILES['models']['name'][0])) {
        foreach ($_FILES['models']['tmp_name'] as $i => $tmp) {
            $name = basename($_FILES['models']['name'][$i]);
            $path = "uploads/models/" . $name;
            move_uploaded_file($tmp, $path);
            $models[] = "/admin/" . $path;
        }
    }

    $data[] = [
        "id" => uniqid("exp_"),
        "title" => $_POST['title'],
        "subject" => $_POST['subject'],
        "class" => $_POST['class'],
        "models" => $models,
        "steps" => $_POST['steps'] ?? []
    ];

} else {

    foreach ($data as &$e) {
        if ($e['id'] === $_POST['id']) {
            $e['title'] = $_POST['title'];
            $e['subject'] = $_POST['subject'];
            $e['class'] = $_POST['class'];
            $e['steps'] = $_POST['steps'];
        }
    }
}

file_put_contents("experiments.json", json_encode($data, JSON_PRETTY_PRINT));
header("Location: index.php");
