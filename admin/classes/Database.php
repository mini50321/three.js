<?php
require_once __DIR__ . '/../config/database.php';

class Database {
    private $db;
    
    public function __construct() {
        $this->db = getDBConnection();
        $this->initTables();
    }
    
    private function initTables() {
        try {
            $schemaFile = __DIR__ . '/../config/schema.sql';
            if (DB_TYPE === 'mysql') {
                $schemaFile = __DIR__ . '/../config/schema_mysql.sql';
            }
            
            if (!file_exists($schemaFile)) {
                error_log('Schema file not found: ' . $schemaFile);
                return;
            }
            
            $sql = file_get_contents($schemaFile);
            if ($sql === false) {
                error_log('Failed to read schema file: ' . $schemaFile);
                return;
            }
            
            if (DB_TYPE === 'sqlite') {
                $statements = explode(';', $sql);
                foreach ($statements as $statement) {
                    $statement = trim($statement);
                    if (!empty($statement) && !preg_match('/^\s*--/', $statement)) {
                        try {
                            $this->db->exec($statement);
                        } catch (PDOException $e) {
                            if (strpos($e->getMessage(), 'already exists') === false) {
                                error_log('Schema execution error: ' . $e->getMessage());
                            }
                        }
                    }
                }
            } else {
                try {
                    $this->db->exec($sql);
                } catch (PDOException $e) {
                    error_log('Schema execution error: ' . $e->getMessage());
                }
            }
        } catch (Exception $e) {
            error_log('initTables error: ' . $e->getMessage());
        }
    }
    
    public function createExperiment($data) {
        $this->db->beginTransaction();
        
        try {
            if (DB_TYPE === 'sqlite') {
                $stmt = $this->db->prepare("
                    INSERT INTO experiments (id, title, subject, class, config_json, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                ");
            } else {
                $stmt = $this->db->prepare("
                    INSERT INTO experiments (id, title, subject, class, config_json, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                ");
            }
            
            $configJson = json_encode([
                'models' => $data['models'] ?? [],
                'initialState' => $data['initialState'] ?? [],
                'reactions' => $data['reactions'] ?? []
            ]);
            
            $stmt->execute([
                $data['id'],
                $data['title'],
                $data['subject'],
                $data['class'],
                $configJson
            ]);
            
            if (!empty($data['steps'])) {
                $stepStmt = $this->db->prepare("
                    INSERT INTO experiment_steps (experiment_id, step_order, instruction, equipment, action, points, rules_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                
                foreach ($data['steps'] as $index => $step) {
                    $rulesJson = !empty($step['rules']) ? json_encode($step['rules']) : null;
                    $points = $step['points'] ?? 10;
                    
                    $stepStmt->execute([
                        $data['id'],
                        $index,
                        $step['instruction'],
                        $step['equipment'],
                        $step['action'],
                        $points,
                        $rulesJson
                    ]);
                }
            }
            
            if (!empty($data['models'])) {
                $modelStmt = $this->db->prepare("
                    INSERT INTO experiment_models (experiment_id, model_path, properties_json)
                    VALUES (?, ?, ?)
                ");
                
                foreach ($data['models'] as $modelPath) {
                    $modelStmt->execute([
                        $data['id'],
                        $modelPath,
                        null
                    ]);
                }
            }
            
            if (!empty($data['initialState'])) {
                $stateStmt = $this->db->prepare("
                    INSERT INTO experiment_initial_state (experiment_id, object_name, volume, temperature, contents_json)
                    VALUES (?, ?, ?, ?, ?)
                ");
                
                foreach ($data['initialState'] as $state) {
                    $contentsJson = !empty($state['contents']) ? json_encode($state['contents']) : null;
                    
                    $stateStmt->execute([
                        $data['id'],
                        $state['objectName'],
                        $state['volume'],
                        $state['temperature'],
                        $contentsJson
                    ]);
                }
            }
            
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
    
    public function updateExperiment($id, $data) {
        $this->db->beginTransaction();
        
        try {
            $now = DB_TYPE === 'sqlite' ? "datetime('now')" : "NOW()";
            $stmt = $this->db->prepare("
                UPDATE experiments 
                SET title = ?, subject = ?, class = ?, config_json = ?, updated_at = {$now}
                WHERE id = ?
            ");
            
            $configJson = json_encode([
                'models' => $data['models'] ?? [],
                'initialState' => $data['initialState'] ?? [],
                'reactions' => $data['reactions'] ?? []
            ]);
            
            $stmt->execute([
                $data['title'],
                $data['subject'],
                $data['class'],
                $configJson,
                $id
            ]);
            
            $this->db->prepare("DELETE FROM experiment_steps WHERE experiment_id = ?")->execute([$id]);
            $this->db->prepare("DELETE FROM experiment_models WHERE experiment_id = ?")->execute([$id]);
            $this->db->prepare("DELETE FROM experiment_initial_state WHERE experiment_id = ?")->execute([$id]);
            
            if (!empty($data['steps'])) {
                $stepStmt = $this->db->prepare("
                    INSERT INTO experiment_steps (experiment_id, step_order, instruction, equipment, action, points, rules_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                
                foreach ($data['steps'] as $index => $step) {
                    $rulesJson = !empty($step['rules']) ? json_encode($step['rules']) : null;
                    $points = $step['points'] ?? 10;
                    
                    $stepStmt->execute([
                        $id,
                        $index,
                        $step['instruction'],
                        $step['equipment'],
                        $step['action'],
                        $points,
                        $rulesJson
                    ]);
                }
            }
            
            if (!empty($data['models'])) {
                $modelStmt = $this->db->prepare("
                    INSERT INTO experiment_models (experiment_id, model_path, properties_json)
                    VALUES (?, ?, ?)
                ");
                
                foreach ($data['models'] as $modelPath) {
                    $modelStmt->execute([
                        $id,
                        $modelPath,
                        null
                    ]);
                }
            }
            
            if (!empty($data['initialState'])) {
                $stateStmt = $this->db->prepare("
                    INSERT INTO experiment_initial_state (experiment_id, object_name, volume, temperature, contents_json)
                    VALUES (?, ?, ?, ?, ?)
                ");
                
                foreach ($data['initialState'] as $state) {
                    $contentsJson = !empty($state['contents']) ? json_encode($state['contents']) : null;
                    
                    $stateStmt->execute([
                        $id,
                        $state['objectName'],
                        $state['volume'],
                        $state['temperature'],
                        $contentsJson
                    ]);
                }
            }
            
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
    
    public function deleteExperiment($id) {
        $this->db->beginTransaction();
        
        try {
            $this->db->prepare("DELETE FROM experiments WHERE id = ?")->execute([$id]);
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
    
    public function getExperiment($id) {
        $stmt = $this->db->prepare("SELECT * FROM experiments WHERE id = ?");
        $stmt->execute([$id]);
        $exp = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$exp) return null;
        
        $config = json_decode($exp['config_json'], true);
        $exp['models'] = $config['models'] ?? [];
        $exp['initialState'] = $config['initialState'] ?? [];
        $exp['reactions'] = $config['reactions'] ?? [];
        
        $stepStmt = $this->db->prepare("
            SELECT * FROM experiment_steps 
            WHERE experiment_id = ? 
            ORDER BY step_order
        ");
        $stepStmt->execute([$id]);
        $steps = $stepStmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($steps as &$step) {
            if (!empty($step['rules_json'])) {
                $step['rules'] = json_decode($step['rules_json'], true);
            }
            unset($step['rules_json']);
            unset($step['id']);
            unset($step['experiment_id']);
            unset($step['step_order']);
        }
        
        $exp['steps'] = $steps;
        
        $stateStmt = $this->db->prepare("
            SELECT * FROM experiment_initial_state 
            WHERE experiment_id = ?
        ");
        $stateStmt->execute([$id]);
        $states = $stateStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $configInitialState = $config['initialState'] ?? [];
        $initialState = [];
        foreach ($states as $state) {
            $objectName = $state['object_name'];
            $configState = null;
            foreach ($configInitialState as $cs) {
                if (isset($cs['objectName']) && $cs['objectName'] === $objectName) {
                    $configState = $cs;
                    break;
                }
            }
            
            $initialState[] = [
                'objectName' => $objectName,
                'volume' => $state['volume'],
                'temperature' => $state['temperature'],
                'contents' => !empty($state['contents_json']) ? json_decode($state['contents_json'], true) : [],
                'initialColor' => $configState['initialColor'] ?? null,
                'boilingColor' => $configState['boilingColor'] ?? null,
                'coolingColor' => $configState['coolingColor'] ?? null
            ];
        }
        
        if (empty($initialState) && !empty($configInitialState)) {
            $initialState = $configInitialState;
        }
        
        $exp['initialState'] = $initialState;
        
        return $exp;
    }
    
    public function getAllExperiments() {
        try {
            $tableExists = false;
            if (DB_TYPE === 'sqlite') {
                $checkStmt = $this->db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='experiments'");
                $tableExists = $checkStmt->fetch() !== false;
            } else {
                $checkStmt = $this->db->query("SHOW TABLES LIKE 'experiments'");
                $tableExists = $checkStmt->rowCount() > 0;
            }
            
            if (!$tableExists) {
                return [];
            }
            
            $stmt = $this->db->query("SELECT * FROM experiments ORDER BY created_at DESC");
            if ($stmt === false) {
                return [];
            }
            $experiments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!is_array($experiments)) {
                return [];
            }
            
            foreach ($experiments as &$exp) {
                try {
                    $stepStmt = $this->db->prepare("
                        SELECT COUNT(*) as count FROM experiment_steps WHERE experiment_id = ?
                    ");
                    $stepStmt->execute([$exp['id']]);
                    $stepCount = $stepStmt->fetch(PDO::FETCH_ASSOC);
                    $exp['step_count'] = $stepCount['count'] ?? 0;
                } catch (PDOException $e) {
                    $exp['step_count'] = 0;
                }
            }
            
            return $experiments;
        } catch (PDOException $e) {
            error_log('getAllExperiments error: ' . $e->getMessage());
            return [];
        } catch (Exception $e) {
            error_log('getAllExperiments error: ' . $e->getMessage());
            return [];
        }
    }
    
    public function saveResult($experimentId, $studentId, $score, $maxScore, $feedback) {
        if (DB_TYPE === 'sqlite') {
            $stmt = $this->db->prepare("
                INSERT INTO experiment_results (experiment_id, student_id, score, max_score, feedback_json, completed_at)
                VALUES (?, ?, ?, ?, ?, datetime('now'))
            ");
        } else {
            $stmt = $this->db->prepare("
                INSERT INTO experiment_results (experiment_id, student_id, score, max_score, feedback_json, completed_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
        }
        
        $feedbackJson = json_encode($feedback);
        
        return $stmt->execute([
            $experimentId,
            $studentId,
            $score,
            $maxScore,
            $feedbackJson
        ]);
    }
}

