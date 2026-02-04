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
    <link rel="stylesheet" href="css/admin.css?v=<?= time() ?>">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Virtual Lab – Admin Panel</h1>
            <div style="display: flex; gap: 12px; align-items: center;">
                <a class="btn" href="../" style="text-decoration: none;">Student View</a>
                <a class="btn" href="create.php" style="text-decoration: none;">+ New Experiment</a>
            </div>
        </div>

        <?php if (empty($experiments)): ?>
        <div class="card" style="text-align: center; padding: 80px 40px;">
            <div style="margin-bottom: 24px; opacity: 0.5;">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #64748b; margin: 0 auto;">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
            </div>
            <p style="color: #64748b; font-size: 16px; margin-bottom: 24px; line-height: 1.6;">No experiments yet. Create your first experiment to get started.</p>
            <a class="btn" href="create.php" style="text-decoration: none;">Create First Experiment</a>
        </div>
        <?php else: ?>
        <div class="card" style="padding: 0; overflow: hidden;">
            <div style="padding: 24px; border-bottom: 2px solid #e2e8f0; background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.08) 100%);">
                <h2 style="margin: 0; font-size: 20px; color: #1e293b; font-weight: 700;">Experiments (<?= count($experiments) ?>)</h2>
            </div>
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 35%;">Title</th>
                            <th style="width: 15%;">Subject</th>
                            <th style="width: 10%;">Class</th>
                            <th style="width: 10%; text-align: center;">Steps</th>
                            <th style="width: 30%;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($experiments as $exp): ?>
                        <tr>
                            <td style="font-weight: 600; color: #1e293b;"><?= htmlspecialchars($exp['title']) ?></td>
                            <td style="color: #475569;"><?= htmlspecialchars($exp['subject']) ?></td>
                            <td style="color: #64748b;">
                                <?php if (!empty($exp['class'])): ?>
                                    <span style="display: inline-block; padding: 6px 12px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border-radius: 6px; font-size: 12px; font-weight: 600; color: #667eea;">Class <?= htmlspecialchars($exp['class']) ?></span>
                                <?php else: ?>
                                    <span style="color: #94a3b8;">—</span>
                                <?php endif; ?>
                            </td>
                            <td style="text-align: center; color: #475569; font-weight: 600;"><?= $exp['step_count'] ?? 0 ?></td>
                            <td>
                                <div class="actions">
                                    <a href="edit.php?id=<?= $exp['id'] ?>" style="text-decoration: none;">Edit</a>
                                    <a href="download.php?id=<?= $exp['id'] ?>" style="text-decoration: none;">Download</a>
                                    <a class="danger" href="delete.php?id=<?= $exp['id'] ?>" onclick="return confirm('Are you sure you want to delete this experiment?')" style="text-decoration: none;">Delete</a>
                                </div>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
        <?php endif; ?>
    </div>
</body>
</html>
