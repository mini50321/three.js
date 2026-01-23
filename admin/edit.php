<?php
$data = json_decode(file_get_contents("experiments.json"), true);
$id = $_GET['id'];

$exp = null;
foreach ($data as $e) {
    if ($e['id'] === $id) $exp = $e;
}
if (!$exp) die("Experiment not found");
?>

<!DOCTYPE html>
<html>
<head>
<title>Edit Experiment</title>
<link rel="stylesheet" href="css/admin.css">
</head>
<body>

<h2>Edit Experiment</h2>

<form action="save.php" method="post">

<input type="hidden" name="mode" value="edit">
<input type="hidden" name="id" value="<?= $exp['id'] ?>">

<label>Title</label>
<input name="title" value="<?= htmlspecialchars($exp['title']) ?>">

<label>Subject</label>
<input name="subject" value="<?= $exp['subject'] ?>">

<label>Class</label>
<input name="class" value="<?= $exp['class'] ?>">

<h3>Steps</h3>
<div id="steps">
<?php foreach ($exp['steps'] as $i => $s): ?>
<div class="step">
<input name="steps[<?= $i ?>][instruction]" value="<?= htmlspecialchars($s['instruction']) ?>">
<input name="steps[<?= $i ?>][equipment]" value="<?= $s['equipment'] ?>">
<select name="steps[<?= $i ?>][action]">
<option <?= $s['action']=='tilt'?'selected':'' ?>>tilt</option>
<option <?= $s['action']=='pour'?'selected':'' ?>>pour</option>
<option <?= $s['action']=='heat'?'selected':'' ?>>heat</option>
<option <?= $s['action']=='stir'?'selected':'' ?>>stir</option>
</select>
<button type="button" onclick="this.parentNode.remove()">Remove</button>
</div>
<?php endforeach; ?>
</div>

<button type="button" onclick="addStep()">+ Add Step</button><br><br>
<button class="btn">Update</button>

</form>

<script src="js/admin.js"></script>
</body>
</html>
