<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Experiment - Virtual Lab Admin</title>
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Create New Experiment</h1>
            <a href="index.php" class="btn btn-secondary">← Back to List</a>
        </div>

        <div class="card">
            <form action="save.php" method="post" enctype="multipart/form-data">
                <input type="hidden" name="mode" value="create">

                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" required placeholder="Enter experiment title">
                </div>

                <div class="form-group">
                    <label>Subject</label>
                    <select name="subject">
                        <option value="Chemistry">Chemistry</option>
                        <option value="Physics">Physics</option>
                        <option value="Biology">Biology</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Class</label>
                    <select name="class">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Upload GLB Models</label>
                    <input type="file" id="model-upload-input" name="models[]" multiple accept=".glb" style="margin-bottom: 10px;">
                    <small style="color: #7f8c8d; font-size: 12px; margin-top: 5px; display: block;">Select one or more .glb model files. You can select multiple files at once (hold Ctrl/Cmd while clicking).</small>
                    <div id="selected-models-list" style="margin-top: 10px;"></div>
                </div>
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        const fileInput = document.getElementById('model-upload-input');
                        const selectedList = document.getElementById('selected-models-list');
                        
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

                <h3 style="margin-top: 30px;">Chemical Reactions</h3>
                <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 15px;">Define chemical reactions that occur when substances mix. The liquid color will change based on reactions.</p>
                <div id="reactions"></div>
                <div style="margin-top: 15px;">
                    <button type="button" onclick="addReaction()" class="btn btn-secondary">+ Add Reaction</button>
                </div>

                <h3 style="margin-top: 30px;">Experiment Steps</h3>
                <div id="steps"></div>

                <div style="margin-top: 20px;">
                    <button type="button" onclick="addStep()" class="btn btn-secondary">+ Add Step</button>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e6ed;">
                    <button type="submit" class="btn">Save Experiment</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/admin.js"></script>
</body>
</html>
