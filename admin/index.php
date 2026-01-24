<?php
require_once __DIR__ . '/classes/Database.php';

$db = new Database();
$experiments = $db->getAllExperiments();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Virtual Lab - Admin Panel</title>
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Virtual Lab – Admin Panel</h1>
            <div style="display: flex; gap: 10px;">
                <a class="btn" href="../">Student View</a>
                <a class="btn" href="create.php">+ New Experiment</a>
            </div>
        </div>

        <?php if (empty($experiments)): ?>
        <div class="card" style="text-align: center; padding: 60px 20px;">
            <p style="color: #7f8c8d; font-size: 16px; margin-bottom: 20px;">No experiments yet. Create your first experiment to get started.</p>
            <a class="btn" href="create.php">Create First Experiment</a>
        </div>
        <?php else: ?>
        <div class="card" style="padding: 0; overflow: hidden;">
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Subject</th>
                        <th>Class</th>
                        <th>Steps</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($experiments as $exp): ?>
                    <tr>
                        <td><strong><?= htmlspecialchars($exp['title']) ?></strong></td>
                        <td><?= htmlspecialchars($exp['subject']) ?></td>
                        <td><?= htmlspecialchars($exp['class']) ?></td>
                        <td><?= $exp['step_count'] ?? 0 ?></td>
                        <td>
                            <div class="actions">
                                <a href="edit.php?id=<?= $exp['id'] ?>">Edit</a>
                                <a href="preview.php?id=<?= $exp['id'] ?>" target="_blank">Preview</a>
                                <a href="download.php?id=<?= $exp['id'] ?>">Download</a>
                                <a class="danger" href="delete.php?id=<?= $exp['id'] ?>" onclick="return confirm('Are you sure you want to delete this experiment?')">Delete</a>
                            </div>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php endif; ?>
    </div>
</body>
</html>
