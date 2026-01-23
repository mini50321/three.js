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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview: <?= htmlspecialchars($exp['title']) ?></title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #1a1a1a;
            color: #fff;
            overflow: hidden;
        }

        #container {
            display: flex;
            height: 100vh;
        }

        #canvas-container {
            flex: 1;
            position: relative;
            background: #2a2a2a;
        }

        #sidebar {
            width: 350px;
            background: #252525;
            padding: 20px;
            overflow-y: auto;
            border-left: 1px solid #333;
        }

        h2 {
            margin-bottom: 20px;
            color: #4CAF50;
        }

        .step-info {
            background: #333;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid #4CAF50;
        }

        .step-info h3 {
            margin-bottom: 10px;
            color: #4CAF50;
        }

        .step-info p {
            color: #ccc;
            line-height: 1.6;
        }

        .controls {
            margin-top: 20px;
        }

        button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin-right: 10px;
            margin-bottom: 10px;
            transition: background 0.3s;
        }

        button:hover {
            background: #45a049;
        }

        button:disabled {
            background: #666;
            cursor: not-allowed;
        }

        .info-panel {
            background: #333;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .info-panel h3 {
            margin-bottom: 10px;
            color: #4CAF50;
        }

        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #4CAF50;
            text-decoration: none;
        }

        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div id="container">
        <div id="canvas-container"></div>
        <div id="sidebar">
            <a href="index.php" class="back-link">← Back to Admin</a>
            <h2>Preview: <?= htmlspecialchars($exp['title']) ?></h2>
            
            <div class="info-panel">
                <h3>Experiment Info</h3>
                <p><strong>Subject:</strong> <?= htmlspecialchars($exp['subject']) ?></p>
                <p><strong>Class:</strong> <?= htmlspecialchars($exp['class']) ?></p>
                <p><strong>Steps:</strong> <?= count($exp['steps'] ?? []) ?></p>
            </div>

            <div class="step-info" id="step-info">
                <h3>Instructions</h3>
                <p>This is a preview mode. You can interact with the 3D models to test the experiment setup.</p>
            </div>

            <div class="controls">
                <button id="reset-btn">Reset View</button>
            </div>
        </div>
    </div>

    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
        }
    }
    </script>
    <script type="module">
        import { ExperimentEngine } from '../js/engine/ExperimentEngine.js';

        const experimentConfig = <?= json_encode($exp, JSON_PRETTY_PRINT) ?>;
        
        if (experimentConfig.models) {
            experimentConfig.models = experimentConfig.models.map(path => {
                if (path.startsWith('/admin/')) {
                    const relativePath = path.replace('/admin/', '../');
                    const filename = relativePath.split('/').pop();
                    return `../assets/models/${filename}`;
                }
                if (path.includes('uploads/models/')) {
                    const filename = path.split('/').pop();
                    return `../assets/models/${filename}`;
                }
                return path;
            });
        }
        
        if (!experimentConfig.table) {
            experimentConfig.table = {
                width: 10,
                height: 0.1,
                depth: 10,
                y: 0
            };
        }
        
        let engine = null;

        async function initPreview() {
            try {
                engine = new ExperimentEngine('canvas-container', experimentConfig);
            } catch (error) {
                console.error('Failed to initialize experiment:', error);
                document.getElementById('step-info').innerHTML = 
                    '<h3>Error</h3><p>Failed to load experiment. Check console for details.</p>';
            }
        }

        document.getElementById('reset-btn').addEventListener('click', () => {
            if (engine) {
                engine.reset();
            }
        });

        initPreview();
    </script>
</body>
</html>

