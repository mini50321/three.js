<?php
require_once __DIR__ . '/classes/Database.php';

$db = new Database();

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

    $initialState = [];
    if (!empty($_POST['initialState']) && is_array($_POST['initialState'])) {
        foreach ($_POST['initialState'] as $state) {
            if (!empty($state['objectName'])) {
                $contents = [];
                if (!empty($state['contents'])) {
                    $contents = array_map('trim', explode(',', $state['contents']));
                    $contents = array_filter($contents);
                }
                
            $initialState[] = [
                'objectName' => $state['objectName'],
                'volume' => isset($state['volume']) && $state['volume'] !== '' ? floatval($state['volume']) : null,
                'temperature' => isset($state['temperature']) && $state['temperature'] !== '' ? floatval($state['temperature']) : null,
                'contents' => $contents,
                'initialColor' => !empty($state['initialColor']) ? $state['initialColor'] : null,
                'boilingColor' => !empty($state['boilingColor']) ? $state['boilingColor'] : null,
                'coolingColor' => !empty($state['coolingColor']) ? $state['coolingColor'] : null
            ];
            }
        }
    }

    $steps = [];
    if (!empty($_POST['steps']) && is_array($_POST['steps'])) {
        foreach ($_POST['steps'] as $step) {
            $processedStep = [
                'instruction' => $step['instruction'] ?? '',
                'equipment' => $step['equipment'] ?? '',
                'action' => $step['action'] ?? ''
            ];
            
            if (!empty($step['points'])) {
                $processedStep['points'] = intval($step['points']);
            }
            
            if (!empty($step['rules'])) {
                $rules = [];
                
                if (!empty($step['rules']['conditions']) && is_array($step['rules']['conditions'])) {
                    $conditions = [];
                    foreach ($step['rules']['conditions'] as $condition) {
                        if (!empty($condition['type'])) {
                            $cond = [
                                'type' => $condition['type']
                            ];
                            if (!empty($condition['operator'])) $cond['operator'] = $condition['operator'];
                            if (isset($condition['value']) && $condition['value'] !== '') $cond['value'] = floatval($condition['value']);
                            if (!empty($condition['tolerance'])) $cond['tolerance'] = floatval($condition['tolerance']);
                            if (!empty($condition['points'])) $cond['points'] = intval($condition['points']);
                            if (!empty($condition['message'])) $cond['message'] = $condition['message'];
                            $conditions[] = $cond;
                        }
                    }
                    if (!empty($conditions)) {
                        $rules['conditions'] = $conditions;
                    }
                }
                
                if (!empty($step['rules']['temperature']['target']) && $step['rules']['temperature']['target'] !== '') {
                    $rules['temperature'] = [
                        'target' => floatval($step['rules']['temperature']['target'])
                    ];
                    if (!empty($step['rules']['temperature']['tolerance'])) {
                        $rules['temperature']['tolerance'] = floatval($step['rules']['temperature']['tolerance']);
                    }
                    if (!empty($step['rules']['temperature']['points'])) {
                        $rules['temperature']['points'] = intval($step['rules']['temperature']['points']);
                    }
                }
                
                if (!empty($step['rules']['volume']['target']) && $step['rules']['volume']['target'] !== '') {
                    $rules['volume'] = [
                        'target' => floatval($step['rules']['volume']['target'])
                    ];
                    if (!empty($step['rules']['volume']['tolerance'])) {
                        $rules['volume']['tolerance'] = floatval($step['rules']['volume']['tolerance']);
                    }
                    if (!empty($step['rules']['volume']['points'])) {
                        $rules['volume']['points'] = intval($step['rules']['volume']['points']);
                    }
                }
                
                if ((!empty($step['rules']['rotation']['x']) && $step['rules']['rotation']['x'] !== '') || 
                    (!empty($step['rules']['rotation']['z']) && $step['rules']['rotation']['z'] !== '')) {
                    $rules['rotation'] = [];
                    if (!empty($step['rules']['rotation']['x']) && $step['rules']['rotation']['x'] !== '') {
                        $rules['rotation']['x'] = floatval($step['rules']['rotation']['x']);
                    }
                    if (!empty($step['rules']['rotation']['z']) && $step['rules']['rotation']['z'] !== '') {
                        $rules['rotation']['z'] = floatval($step['rules']['rotation']['z']);
                    }
                    if (!empty($step['rules']['rotation']['tolerance'])) {
                        $rules['rotation']['tolerance'] = floatval($step['rules']['rotation']['tolerance']);
                    }
                    if (!empty($step['rules']['rotation']['points'])) {
                        $rules['rotation']['points'] = intval($step['rules']['rotation']['points']);
                    }
                }
                
                if (!empty($rules)) {
                    $processedStep['rules'] = $rules;
                }
            }
            
            $steps[] = $processedStep;
        }
    }

    $reactions = [];
    if (!empty($_POST['reactions']) && is_array($_POST['reactions'])) {
        foreach ($_POST['reactions'] as $reaction) {
            if (!empty($reaction['reactants']) && !empty($reaction['result']['type'])) {
                $reactants = array_map('trim', explode(',', $reaction['reactants']));
                $reactants = array_filter($reactants);
                
                $color = 0xffffff;
                if (!empty($reaction['result']['color'])) {
                    $colorStr = ltrim($reaction['result']['color'], '#');
                    $color = hexdec($colorStr);
                }
                
                $reactions[] = [
                    'reactants' => $reactants,
                    'result' => [
                        'type' => $reaction['result']['type'],
                        'color' => $color
                    ],
                    'message' => $reaction['message'] ?? null
                ];
            }
        }
    }

    $experimentData = [
        "id" => uniqid("exp_"),
        "title" => $_POST['title'],
        "subject" => $_POST['subject'],
        "class" => $_POST['class'],
        "models" => $models,
        "steps" => $steps,
        "initialState" => $initialState,
        "reactions" => $reactions
    ];

    try {
        $db->createExperiment($experimentData);
        header("Location: index.php");
        exit;
    } catch (Exception $e) {
        die("Error creating experiment: " . $e->getMessage());
    }

} else {

    $models = [];
    if (!empty($_FILES['models']['name'][0])) {
        foreach ($_FILES['models']['tmp_name'] as $i => $tmp) {
            $name = basename($_FILES['models']['name'][$i]);
            $path = "uploads/models/" . $name;
            move_uploaded_file($tmp, $path);
            $models[] = "/admin/" . $path;
        }
    } else {
        $existingExp = $db->getExperiment($_POST['id']);
        if ($existingExp && !empty($existingExp['models'])) {
            $models = $existingExp['models'];
        }
    }

    $initialState = [];
    if (!empty($_POST['initialState']) && is_array($_POST['initialState'])) {
        foreach ($_POST['initialState'] as $state) {
            if (!empty($state['objectName'])) {
                $contents = [];
                if (!empty($state['contents'])) {
                    $contents = array_map('trim', explode(',', $state['contents']));
                    $contents = array_filter($contents);
                }
                
            $initialState[] = [
                'objectName' => $state['objectName'],
                'volume' => isset($state['volume']) && $state['volume'] !== '' ? floatval($state['volume']) : null,
                'temperature' => isset($state['temperature']) && $state['temperature'] !== '' ? floatval($state['temperature']) : null,
                'contents' => $contents,
                'initialColor' => !empty($state['initialColor']) ? $state['initialColor'] : null,
                'boilingColor' => !empty($state['boilingColor']) ? $state['boilingColor'] : null,
                'coolingColor' => !empty($state['coolingColor']) ? $state['coolingColor'] : null
            ];
            }
        }
    }

    $steps = [];
    if (!empty($_POST['steps']) && is_array($_POST['steps'])) {
        foreach ($_POST['steps'] as $step) {
            $processedStep = [
                'instruction' => $step['instruction'] ?? '',
                'equipment' => $step['equipment'] ?? '',
                'action' => $step['action'] ?? ''
            ];
            
            if (!empty($step['points'])) {
                $processedStep['points'] = intval($step['points']);
            }
            
            if (!empty($step['rules'])) {
                $rules = [];
                
                if (!empty($step['rules']['conditions']) && is_array($step['rules']['conditions'])) {
                    $conditions = [];
                    foreach ($step['rules']['conditions'] as $condition) {
                        if (!empty($condition['type'])) {
                            $cond = [
                                'type' => $condition['type']
                            ];
                            if (!empty($condition['operator'])) $cond['operator'] = $condition['operator'];
                            if (isset($condition['value']) && $condition['value'] !== '') $cond['value'] = floatval($condition['value']);
                            if (!empty($condition['tolerance'])) $cond['tolerance'] = floatval($condition['tolerance']);
                            if (!empty($condition['points'])) $cond['points'] = intval($condition['points']);
                            if (!empty($condition['message'])) $cond['message'] = $condition['message'];
                            $conditions[] = $cond;
                        }
                    }
                    if (!empty($conditions)) {
                        $rules['conditions'] = $conditions;
                    }
                }
                
                if (!empty($step['rules']['temperature']['target']) && $step['rules']['temperature']['target'] !== '') {
                    $rules['temperature'] = [
                        'target' => floatval($step['rules']['temperature']['target'])
                    ];
                    if (!empty($step['rules']['temperature']['tolerance'])) {
                        $rules['temperature']['tolerance'] = floatval($step['rules']['temperature']['tolerance']);
                    }
                    if (!empty($step['rules']['temperature']['points'])) {
                        $rules['temperature']['points'] = intval($step['rules']['temperature']['points']);
                    }
                }
                
                if (!empty($step['rules']['volume']['target']) && $step['rules']['volume']['target'] !== '') {
                    $rules['volume'] = [
                        'target' => floatval($step['rules']['volume']['target'])
                    ];
                    if (!empty($step['rules']['volume']['tolerance'])) {
                        $rules['volume']['tolerance'] = floatval($step['rules']['volume']['tolerance']);
                    }
                    if (!empty($step['rules']['volume']['points'])) {
                        $rules['volume']['points'] = intval($step['rules']['volume']['points']);
                    }
                }
                
                if ((!empty($step['rules']['rotation']['x']) && $step['rules']['rotation']['x'] !== '') || 
                    (!empty($step['rules']['rotation']['z']) && $step['rules']['rotation']['z'] !== '')) {
                    $rules['rotation'] = [];
                    if (!empty($step['rules']['rotation']['x']) && $step['rules']['rotation']['x'] !== '') {
                        $rules['rotation']['x'] = floatval($step['rules']['rotation']['x']);
                    }
                    if (!empty($step['rules']['rotation']['z']) && $step['rules']['rotation']['z'] !== '') {
                        $rules['rotation']['z'] = floatval($step['rules']['rotation']['z']);
                    }
                    if (!empty($step['rules']['rotation']['tolerance'])) {
                        $rules['rotation']['tolerance'] = floatval($step['rules']['rotation']['tolerance']);
                    }
                    if (!empty($step['rules']['rotation']['points'])) {
                        $rules['rotation']['points'] = intval($step['rules']['rotation']['points']);
                    }
                }
                
                if (!empty($rules)) {
                    $processedStep['rules'] = $rules;
                }
            }
            
            $steps[] = $processedStep;
        }
    }

    $reactions = [];
    if (!empty($_POST['reactions']) && is_array($_POST['reactions'])) {
        foreach ($_POST['reactions'] as $reaction) {
            if (!empty($reaction['reactants']) && !empty($reaction['result']['type'])) {
                $reactants = array_map('trim', explode(',', $reaction['reactants']));
                $reactants = array_filter($reactants);
                
                $color = 0xffffff;
                if (!empty($reaction['result']['color'])) {
                    $colorStr = ltrim($reaction['result']['color'], '#');
                    $color = hexdec($colorStr);
                }
                
                $reactions[] = [
                    'reactants' => $reactants,
                    'result' => [
                        'type' => $reaction['result']['type'],
                        'color' => $color
                    ],
                    'message' => $reaction['message'] ?? null
                ];
            }
        }
    }

    $experimentData = [
        "title" => $_POST['title'],
        "subject" => $_POST['subject'],
        "class" => $_POST['class'],
        "models" => $models,
        "steps" => $steps,
        "initialState" => $initialState,
        "reactions" => $reactions
    ];

    try {
        $db->updateExperiment($_POST['id'], $experimentData);
        header("Location: index.php");
        exit;
    } catch (Exception $e) {
        die("Error updating experiment: " . $e->getMessage());
    }
}
