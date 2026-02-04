<?php
require_once __DIR__ . '/classes/Database.php';

$db = new Database();
$id = $_GET['id'] ?? null;

if (!$id) {
    die("Experiment ID required");
}

$exp = $db->getExperiment($id);

if (!$exp) {
    die("Experiment not found");
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Experiment - Virtual Lab Admin</title>
    <link rel="stylesheet" href="css/admin.css?v=<?= time() ?>">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Edit Experiment</h1>
            <a href="index.php" class="btn">← Back to List</a>
        </div>

        <div class="card">
            <form action="save.php" method="post" enctype="multipart/form-data">
                <input type="hidden" name="mode" value="edit">
                <input type="hidden" name="id" value="<?= $exp['id'] ?>">

                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" value="<?= htmlspecialchars($exp['title']) ?>" required>
                </div>

                <div class="form-group">
                    <label>Subject</label>
                    <select name="subject">
                        <option value="Chemistry" <?= $exp['subject']=='Chemistry'?'selected':'' ?>>Chemistry</option>
                        <option value="Physics" <?= $exp['subject']=='Physics'?'selected':'' ?>>Physics</option>
                        <option value="Biology" <?= $exp['subject']=='Biology'?'selected':'' ?>>Biology</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Class</label>
                    <select name="class">
                        <option value="1" <?= $exp['class']=='1'?'selected':'' ?>>1</option>
                        <option value="2" <?= $exp['class']=='2'?'selected':'' ?>>2</option>
                        <option value="3" <?= $exp['class']=='3'?'selected':'' ?>>3</option>
                        <option value="4" <?= $exp['class']=='4'?'selected':'' ?>>4</option>
                        <option value="5" <?= $exp['class']=='5'?'selected':'' ?>>5</option>
                        <option value="6" <?= $exp['class']=='6'?'selected':'' ?>>6</option>
                        <option value="7" <?= $exp['class']=='7'?'selected':'' ?>>7</option>
                        <option value="8" <?= $exp['class']=='8'?'selected':'' ?>>8</option>
                        <option value="9" <?= $exp['class']=='9'?'selected':'' ?>>9</option>
                        <option value="10" <?= $exp['class']=='10'?'selected':'' ?>>10</option>
                        <option value="11" <?= $exp['class']=='11'?'selected':'' ?>>11</option>
                        <option value="12" <?= $exp['class']=='12'?'selected':'' ?>>12</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Upload GLB Models</label>
                    <input type="file" id="model-upload-input" name="models[]" multiple accept=".glb">
                    <small>Select one or more .glb model files. You can select multiple files at once (hold Ctrl/Cmd while clicking). Leave empty to keep existing models.</small>
                    <div id="selected-models-list" style="margin-top: 12px;"></div>
                    <?php if (!empty($exp['models']) && is_array($exp['models'])): ?>
                        <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 10px; border: 2px solid #e2e8f0;">
                            <strong style="display: block; margin-bottom: 12px; color: #1e293b; font-size: 14px;">Current Models:</strong>
                            <ul style="margin: 0; padding-left: 24px; color: #475569; line-height: 1.8;">
                                <?php foreach ($exp['models'] as $modelPath): ?>
                                    <li><?= htmlspecialchars(basename($modelPath)) ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endif; ?>
                </div>
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        const fileInput = document.getElementById('model-upload-input');
                        const selectedList = document.getElementById('selected-models-list');
                        const selectedFiles = new DataTransfer();
                        
                        function updateSelectedFilesDisplay() {
                            if (fileInput.files.length === 0) {
                                selectedList.innerHTML = '';
                                return;
                            }
                            
                            let html = '<div style="margin-top: 10px; padding: 10px; background: #e8f4f8; border-radius: 6px; border: 1px solid #b3d9e6;">';
                            html += '<strong style="display: block; margin-bottom: 8px; color: #2c3e50;">Selected Files (' + fileInput.files.length + '):</strong>';
                            html += '<ul style="margin: 0; padding-left: 20px; color: #2c3e50;">';
                            
                            for (let i = 0; i < fileInput.files.length; i++) {
                                html += '<li style="margin-bottom: 5px; display: flex; align-items: center; gap: 10px;">';
                                html += '<span>' + fileInput.files[i].name + '</span>';
                                html += '<button type="button" onclick="removeFileFromSelection(' + i + ')" style="padding: 2px 8px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">Remove</button>';
                                html += '</li>';
                            }
                            
                            html += '</ul></div>';
                            selectedList.innerHTML = html;
                        }
                        
                        window.removeFileFromSelection = function(index) {
                            const dt = new DataTransfer();
                            for (let i = 0; i < fileInput.files.length; i++) {
                                if (i !== index) {
                                    dt.items.add(fileInput.files[i]);
                                }
                            }
                            fileInput.files = dt.files;
                            updateSelectedFilesDisplay();
                        };
                        
                        fileInput.addEventListener('change', function() {
                            updateSelectedFilesDisplay();
                        });
                    });
                </script>

                <h3>Initial State Configuration</h3>
                <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 15px;">Configure the starting properties of objects (volume, temperature, contents) when the experiment begins.</p>
                <div id="initial-states"></div>
                <div style="margin-top: 15px;">
                    <button type="button" onclick="addInitialState()" class="btn btn-secondary">+ Add Initial State</button>
                </div>
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        const initialStateData = <?= json_encode($exp['initialState'] ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
                        if (typeof loadInitialStates === 'function') {
                            loadInitialStates(initialStateData);
                        }
                    });
                </script>

                <h3>Chemical Reactions</h3>
                <p>Define chemical reactions that occur when substances mix. The liquid color will change based on reactions.</p>
                <div id="reactions"></div>
                <div style="margin-top: 20px;">
                    <button type="button" onclick="addReaction()" class="btn btn-secondary">+ Add Reaction</button>
                </div>
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        const reactionsData = <?= json_encode($exp['reactions'] ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
                        if (typeof loadReactions === 'function') {
                            loadReactions(reactionsData);
                        }
                    });
                </script>

                <h3>Experiment Steps</h3>
                <div id="steps">
                <?php foreach ($exp['steps'] as $i => $s): ?>
                <div class="step-card">
                    <div class="step-header">
                        <input type="text" name="steps[<?= $i ?>][instruction]" value="<?= htmlspecialchars($s['instruction']) ?>" placeholder="Step instruction" required>
                        <input type="text" name="steps[<?= $i ?>][equipment]" value="<?= htmlspecialchars($s['equipment']) ?>" placeholder="Equipment name" required>
                        <select name="steps[<?= $i ?>][action]" required>
                            <option value="tilt" <?= $s['action']=='tilt'?'selected':'' ?>>Tilt</option>
                            <option value="pour" <?= $s['action']=='pour'?'selected':'' ?>>Pour</option>
                            <option value="heat" <?= $s['action']=='heat'?'selected':'' ?>>Heat</option>
                            <option value="stir" <?= $s['action']=='stir'?'selected':'' ?>>Stir</option>
                            <option value="drag" <?= $s['action']=='drag'?'selected':'' ?>>Drag</option>
                        </select>
                        <button type="button" onclick="this.closest('.step-card').remove()" class="btn btn-danger">Remove</button>
                    </div>
                    <div style="margin-top: 16px;">
                        <button type="button" onclick="toggleRules(<?= $i ?>)" class="btn btn-secondary">⚙️ Configure Rules & Scoring</button>
                    </div>
                    <div id="rules-<?= $i ?>" class="rules-panel" style="display: none;">
                        <div class="rules-header">
                            <h4>Rules & Scoring Configuration</h4>
                        </div>
                        
                        <div class="rules-section">
                            <div class="rules-section-title">
                                <span class="icon">📊</span> Step Points
                            </div>
                            <div style="max-width: 200px;">
                                <input type="number" name="steps[<?= $i ?>][points]" value="<?= isset($s['points']) ? htmlspecialchars($s['points']) : '' ?>" placeholder="10" min="0" step="1">
                                <small>Default points awarded for completing this step</small>
                            </div>
                        </div>

                        <div id="conditions-<?= $i ?>"></div>
                        <div style="margin-bottom: 24px;">
                            <button type="button" onclick="addCondition(<?= $i ?>)" class="btn btn-secondary">+ Add Custom Condition</button>
                        </div>

                        <div class="rules-section">
                            <div class="rules-section-title">
                                <span class="icon">🌡️</span> Temperature Rule
                            </div>
                            <div class="rules-grid">
                                <div class="rule-field">
                                    <label>Target Temperature (°C)</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][temperature][target]" value="<?= isset($s['rules']['temperature']['target']) ? htmlspecialchars($s['rules']['temperature']['target']) : '0' ?>" placeholder="100" step="0.1">
                                </div>
                                <div class="rule-field">
                                    <label>Tolerance (±°C)</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][temperature][tolerance]" value="<?= isset($s['rules']['temperature']['tolerance']) ? htmlspecialchars($s['rules']['temperature']['tolerance']) : '0' ?>" placeholder="5" step="0.1">
                                </div>
                                <div class="rule-field">
                                    <label>Points Awarded</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][temperature][points]" value="<?= isset($s['rules']['temperature']['points']) ? htmlspecialchars($s['rules']['temperature']['points']) : '0' ?>" placeholder="200" min="0" step="1">
                                </div>
                            </div>
                            <div class="rule-actions">
                                <button type="button" onclick="clearRule('temperature', <?= $i ?>)" class="btn btn-secondary">Clear Temperature Rule</button>
                            </div>
                        </div>

                        <div class="rules-section">
                            <div class="rules-section-title">
                                <span class="icon">💧</span> Volume Rule
                            </div>
                            <div class="rules-grid">
                                <div class="rule-field">
                                    <label>Target Volume (ml)</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][volume][target]" value="<?= isset($s['rules']['volume']['target']) ? htmlspecialchars($s['rules']['volume']['target']) : '0' ?>" placeholder="500" step="0.1">
                                </div>
                                <div class="rule-field">
                                    <label>Tolerance (±ml)</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][volume][tolerance]" value="<?= isset($s['rules']['volume']['tolerance']) ? htmlspecialchars($s['rules']['volume']['tolerance']) : '0' ?>" placeholder="10" step="0.1">
                                </div>
                                <div class="rule-field">
                                    <label>Points Awarded</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][volume][points]" value="<?= isset($s['rules']['volume']['points']) ? htmlspecialchars($s['rules']['volume']['points']) : '0' ?>" placeholder="10" min="0" step="1">
                                </div>
                            </div>
                            <div class="rule-actions">
                                <button type="button" onclick="clearRule('volume', <?= $i ?>)" class="btn btn-secondary">Clear Volume Rule</button>
                            </div>
                        </div>

                        <div class="rules-section">
                            <div class="rules-section-title">
                                <span class="icon">🔄</span> Rotation Rule
                            </div>
                            <div class="rules-grid">
                                <div class="rule-field">
                                    <label>X-Axis Angle</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][rotation][x]" value="<?= isset($s['rules']['rotation']['x']) ? htmlspecialchars($s['rules']['rotation']['x']) : '0' ?>" placeholder="0.5" step="0.01">
                                </div>
                                <div class="rule-field">
                                    <label>Z-Axis Angle</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][rotation][z]" value="<?= isset($s['rules']['rotation']['z']) ? htmlspecialchars($s['rules']['rotation']['z']) : '0' ?>" placeholder="0" step="0.01">
                                </div>
                                <div class="rule-field">
                                    <label>Angle Tolerance</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][rotation][tolerance]" value="<?= isset($s['rules']['rotation']['tolerance']) ? htmlspecialchars($s['rules']['rotation']['tolerance']) : '0' ?>" placeholder="0.1" step="0.01">
                                </div>
                                <div class="rule-field">
                                    <label>Points Awarded</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][rotation][points]" value="<?= isset($s['rules']['rotation']['points']) ? htmlspecialchars($s['rules']['rotation']['points']) : '0' ?>" placeholder="10" min="0" step="1">
                                </div>
                            </div>
                            <div class="rule-actions">
                                <button type="button" onclick="clearRule('rotation', <?= $i ?>)" class="btn btn-secondary">Clear Rotation Rule</button>
                            </div>
                        </div>
                    </div>
                </div>
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        const stepData = <?= json_encode($s, JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
                        if (stepData.rules) {
                            loadStepRules(<?= $i ?>, stepData);
                        }
                    });
                </script>
                <?php endforeach; ?>
                </div>

                <div style="margin-top: 20px;">
                    <button type="button" onclick="addStep()" class="btn btn-secondary">+ Add Step</button>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e6ed;">
                    <button type="submit" class="btn">Update Experiment</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/admin.js"></script>
</body>
</html>
