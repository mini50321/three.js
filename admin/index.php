<?php
$data = file_exists("experiments.json")
    ? json_decode(file_get_contents("experiments.json"), true)
    : [];
?>

<!DOCTYPE html>
<html>
<head>
<title>Lab Admin</title>
<link rel="stylesheet" href="css/admin.css">
</head>
<body>

<h1>Virtual Lab – Admin Panel</h1>
<a class="btn" href="create.php">+ New Experiment</a>

<table>
<tr>
<th>Title</th>
<th>Subject</th>
<th>Class</th>
<th>Actions</th>
</tr>

<?php foreach ($data as $exp): ?>
<tr>
<td><?= htmlspecialchars($exp['title']) ?></td>
<td><?= $exp['subject'] ?></td>
<td><?= $exp['class'] ?></td>
<td>
<a href="edit.php?id=<?= $exp['id'] ?>">Edit</a> |
<a href="preview.php?id=<?= $exp['id'] ?>" target="_blank">Preview</a> |
<a href="download.php?id=<?= $exp['id'] ?>">Download JSON</a> |
<a class="danger" href="delete.php?id=<?= $exp['id'] ?>" onclick="return confirm('Delete experiment?')">Delete</a>
</td>
</tr>
<?php endforeach; ?>

</table>

</body>
</html>
