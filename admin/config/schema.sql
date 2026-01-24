CREATE TABLE IF NOT EXISTS experiments (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    class VARCHAR(10) NOT NULL,
    config_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experiment_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id VARCHAR(50) NOT NULL,
    step_order INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    equipment VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    points INTEGER DEFAULT 10,
    rules_json TEXT,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experiment_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id VARCHAR(50) NOT NULL,
    model_path VARCHAR(500) NOT NULL,
    properties_json TEXT,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experiment_initial_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id VARCHAR(50) NOT NULL,
    object_name VARCHAR(100) NOT NULL,
    volume REAL,
    temperature REAL,
    contents_json TEXT,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experiment_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(100),
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    feedback_json TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_experiment_steps_experiment_id ON experiment_steps(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_models_experiment_id ON experiment_models(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_initial_state_experiment_id ON experiment_initial_state(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_results_experiment_id ON experiment_results(experiment_id);

