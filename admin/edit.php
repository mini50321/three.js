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
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Edit Experiment</h1>
            <a href="index.php" class="btn btn-secondary">← Back to List</a>
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
                    <input type="file" id="model-upload-input" name="models[]" multiple accept=".glb" style="margin-bottom: 10px;">
                    <small style="color: #7f8c8d; font-size: 12px; margin-top: 5px; display: block;">Select one or more .glb model files. You can select multiple files at once (hold Ctrl/Cmd while clicking). Leave empty to keep existing models.</small>
                    <div id="selected-models-list" style="margin-top: 10px;"></div>
                    <?php if (!empty($exp['models']) && is_array($exp['models'])): ?>
                        <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e0e6ed;">
                            <strong style="display: block; margin-bottom: 8px; color: #2c3e50;">Current Models:</strong>
                            <ul style="margin: 0; padding-left: 20px; color: #5a6c7d;">
                                <?php foreach ($exp['models'] as $modelPath): ?>
                                    <li style="margin-bottom: 5px;"><?= htmlspecialchars(basename($modelPath)) ?></li>
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

                <h3 style="margin-top: 30px;">Chemical Reactions</h3>
                <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 15px;">Define chemical reactions that occur when substances mix. The liquid color will change based on reactions.</p>
                <div id="reactions"></div>
                <div style="margin-top: 15px;">
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

                <h3 style="margin-top: 30px;">Experiment Steps</h3>
                <div id="steps">
                <?php foreach ($exp['steps'] as $i => $s): ?>
                <div class="step" style="border: 1px solid #e0e6ed; padding: 20px; margin-bottom: 20px; border-radius: 8px; background: #fff;">
                    <div style="display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <input type="text" name="steps[<?= $i ?>][instruction]" value="<?= htmlspecialchars($s['instruction']) ?>" placeholder="Step instruction" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <input type="text" name="steps[<?= $i ?>][equipment]" value="<?= htmlspecialchars($s['equipment']) ?>" placeholder="Equipment name" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <select name="steps[<?= $i ?>][action]" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="tilt" <?= $s['action']=='tilt'?'selected':'' ?>>Tilt</option>
                            <option value="pour" <?= $s['action']=='pour'?'selected':'' ?>>Pour</option>
                            <option value="heat" <?= $s['action']=='heat'?'selected':'' ?>>Heat</option>
                            <option value="stir" <?= $s['action']=='stir'?'selected':'' ?>>Stir</option>
                            <option value="drag" <?= $s['action']=='drag'?'selected':'' ?>>Drag</option>
                        </select>
                        <button type="button" onclick="this.closest('.step').remove()" style="padding: 8px 15px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Remove</button>
                    </div>
                    <div style="margin-top: 15px;">
                        <button type="button" onclick="toggleRules(<?= $i ?>)" class="btn btn-secondary" style="font-size: 14px;">⚙️ Configure Rules & Scoring</button>
                    </div>
                    <div id="rules-<?= $i ?>" style="display: none; margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e0e6ed;">
                        <h4 style="margin-top: 0; margin-bottom: 15px; color: #2c3e50;">Rules & Scoring</h4>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Step Points (default: 10)</label>
                            <input type="number" name="steps[<?= $i ?>][points]" value="<?= isset($s['points']) ? htmlspecialchars($s['points']) : '' ?>" placeholder="10" min="0" step="1" style="width: 150px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div id="conditions-<?= $i ?>" style="margin-bottom: 15px;"></div>
                        <button type="button" onclick="addCondition(<?= $i ?>)" class="btn btn-secondary" style="font-size: 14px; margin-bottom: 15px;">+ Add Condition</button>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Temperature Rule</label>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                <div>
                                    <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px; font-weight: 500;">Target (°C)</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][temperature][target]" value="<?= isset($s['rules']['temperature']['target']) ? htmlspecialchars($s['rules']['temperature']['target']) : '0' ?>" placeholder="100" step="0.1" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 4px; font-size: 16px; font-weight: 500;">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px; font-weight: 500;">Tolerance</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][temperature][tolerance]" value="<?= isset($s['rules']['temperature']['tolerance']) ? htmlspecialchars($s['rules']['temperature']['tolerance']) : '0' ?>" placeholder="5" step="0.1" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 4px; font-size: 16px; font-weight: 500;">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px; font-weight: 500;">Points</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][temperature][points]" value="<?= isset($s['rules']['temperature']['points']) ? htmlspecialchars($s['rules']['temperature']['points']) : '0' ?>" placeholder="10" min="0" step="1" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 4px; font-size: 16px; font-weight: 500;">
                                </div>
                                <div>
                                    <button type="button" onclick="clearRule('temperature', <?= $i ?>)" style="padding: 12px 15px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">Clear</button>
                                </div>
                            </div>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Volume Rule</label>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                <div>
                                    <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px; font-weight: 500;">Target (ml)</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][volume][target]" value="<?= isset($s['rules']['volume']['target']) ? htmlspecialchars($s['rules']['volume']['target']) : '0' ?>" placeholder="500" step="0.1" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 4px; font-size: 16px; font-weight: 500;">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px; font-weight: 500;">Tolerance</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][volume][tolerance]" value="<?= isset($s['rules']['volume']['tolerance']) ? htmlspecialchars($s['rules']['volume']['tolerance']) : '0' ?>" placeholder="10" step="0.1" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 4px; font-size: 16px; font-weight: 500;">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px; font-weight: 500;">Points</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][volume][points]" value="<?= isset($s['rules']['volume']['points']) ? htmlspecialchars($s['rules']['volume']['points']) : '0' ?>" placeholder="10" min="0" step="1" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 4px; font-size: 16px; font-weight: 500;">
                                </div>
                                <div>
                                    <button type="button" onclick="clearRule('volume', <?= $i ?>)" style="padding: 12px 15px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">Clear</button>
                                </div>
                            </div>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Rotation Rule</label>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                <div>
                                    <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px; font-weight: 500;">X angle</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][rotation][x]" value="<?= isset($s['rules']['rotation']['x']) ? htmlspecialchars($s['rules']['rotation']['x']) : '0' ?>" placeholder="0.5" step="0.01" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 4px; font-size: 16px; font-weight: 500;">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px; font-weight: 500;">Z angle</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][rotation][z]" value="<?= isset($s['rules']['rotation']['z']) ? htmlspecialchars($s['rules']['rotation']['z']) : '0' ?>" placeholder="0" step="0.01" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 4px; font-size: 16px; font-weight: 500;">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px; font-weight: 500;">Tolerance</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][rotation][tolerance]" value="<?= isset($s['rules']['rotation']['tolerance']) ? htmlspecialchars($s['rules']['rotation']['tolerance']) : '0' ?>" placeholder="0.1" step="0.01" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 4px; font-size: 16px; font-weight: 500;">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px; font-weight: 500;">Points</label>
                                    <input type="number" name="steps[<?= $i ?>][rules][rotation][points]" value="<?= isset($s['rules']['rotation']['points']) ? htmlspecialchars($s['rules']['rotation']['points']) : '0' ?>" placeholder="10" min="0" step="1" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 4px; font-size: 16px; font-weight: 500;">
                                </div>
                                <div>
                                    <button type="button" onclick="clearRule('rotation', <?= $i ?>)" style="padding: 12px 15px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">Clear</button>
                                </div>
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
