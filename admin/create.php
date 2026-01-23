<!DOCTYPE html>
<html>
<head>
<title>Create Experiment</title>
<link rel="stylesheet" href="css/admin.css">
</head>
<body>

<h2>Create Experiment</h2>

<form action="save.php" method="post" enctype="multipart/form-data">

<input type="hidden" name="mode" value="create">

<label>Title</label>
<input name="title" required>

<label>Subject</label>
<select name="subject">
<option>Chemistry</option>
<option>Physics</option>
<option>Biology</option>
</select>

<label>Class</label>
<select name="class">
<option>11</option>
<option>12</option>
</select>

<label>Upload GLB Models</label>
<input type="file" name="models[]" multiple accept=".glb">

<h3>Steps</h3>
<div id="steps"></div>

<button type="button" onclick="addStep()">+ Add Step</button><br><br>
<button class="btn">Save Experiment</button>

</form>

<script src="js/admin.js"></script>
</body>
</html>
