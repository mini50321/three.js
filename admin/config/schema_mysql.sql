CREATE TABLE IF NOT EXISTS experiments (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    class VARCHAR(10) NOT NULL,
    config_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS experiment_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experiment_id VARCHAR(50) NOT NULL,
    step_order INT NOT NULL,
    instruction TEXT NOT NULL,
    equipment VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    points INT DEFAULT 10,
    rules_json TEXT,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
    INDEX idx_experiment_id (experiment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS experiment_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experiment_id VARCHAR(50) NOT NULL,
    model_path VARCHAR(500) NOT NULL,
    properties_json TEXT,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
    INDEX idx_experiment_id (experiment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS experiment_initial_state (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experiment_id VARCHAR(50) NOT NULL,
    object_name VARCHAR(100) NOT NULL,
    volume DECIMAL(10,2),
    temperature DECIMAL(10,2),
    contents_json TEXT,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
    INDEX idx_experiment_id (experiment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS experiment_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experiment_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(100),
    score INT DEFAULT 0,
    max_score INT DEFAULT 0,
    feedback_json TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
    INDEX idx_experiment_id (experiment_id),
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

