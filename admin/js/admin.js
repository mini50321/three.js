let stepIndex = document.querySelectorAll('.step').length || 0;
let initialStateIndex = 0;
let reactionIndex = 0;

function addStep() {
    const div = document.createElement('div');
    div.className = 'step-card';
    div.innerHTML = `
        <div class="step-header">
            <input type="text" name="steps[${stepIndex}][instruction]" placeholder="Enter step instruction (e.g., Heat the beaker until...)" required>
            <input type="text" name="steps[${stepIndex}][equipment]" placeholder="Equipment name" required>
            <select name="steps[${stepIndex}][action]" required>
                <option value="tilt">Tilt</option>
                <option value="pour">Pour</option>
                <option value="heat">Heat</option>
                <option value="stir">Stir</option>
                <option value="drag">Drag</option>
            </select>
            <button type="button" onclick="this.closest('.step-card').remove()" class="btn btn-danger">Remove</button>
        </div>
        <div style="margin-top: 16px;">
            <button type="button" onclick="toggleRules(${stepIndex})" class="btn btn-secondary">
                <span class="icon">⚙️</span> Configure Rules & Scoring
            </button>
        </div>
        <div id="rules-${stepIndex}" class="rules-panel" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h4 style="margin: 0; color: #1a202c; font-size: 18px; font-weight: 700;">Rules & Scoring Configuration</h4>
            </div>
            
            <div class="rules-section">
                <div class="rules-section-title">
                    <span class="icon">📊</span> Step Points
                </div>
                <div style="max-width: 200px;">
                    <input type="number" name="steps[${stepIndex}][points]" placeholder="10" min="0" step="1" value="10">
                    <small>Default points awarded for completing this step</small>
                </div>
            </div>

            <div id="conditions-${stepIndex}"></div>
            <div style="margin-bottom: 24px;">
                <button type="button" onclick="addCondition(${stepIndex})" class="btn btn-secondary">+ Add Custom Condition</button>
            </div>

            <div class="rules-section">
                <div class="rules-section-title">
                    <span class="icon">🌡️</span> Temperature Rule
                </div>
                <div class="rules-grid">
                    <div class="rule-field">
                        <label>Target Temperature (°C)</label>
                        <input type="number" name="steps[${stepIndex}][rules][temperature][target]" placeholder="100" step="0.1" value="0">
                    </div>
                    <div class="rule-field">
                        <label>Tolerance (±°C)</label>
                        <input type="number" name="steps[${stepIndex}][rules][temperature][tolerance]" placeholder="5" step="0.1" value="0">
                    </div>
                    <div class="rule-field">
                        <label>Points Awarded</label>
                        <input type="number" name="steps[${stepIndex}][rules][temperature][points]" placeholder="200" min="0" step="1" value="0">
                    </div>
                </div>
                <div class="rule-actions">
                    <button type="button" onclick="clearRule('temperature', ${stepIndex})" class="btn btn-secondary">Clear Temperature Rule</button>
                </div>
            </div>

            <div class="rules-section">
                <div class="rules-section-title">
                    <span class="icon">💧</span> Volume Rule
                </div>
                <div class="rules-grid">
                    <div class="rule-field">
                        <label>Target Volume (ml)</label>
                        <input type="number" name="steps[${stepIndex}][rules][volume][target]" placeholder="500" step="0.1" value="0">
                    </div>
                    <div class="rule-field">
                        <label>Tolerance (±ml)</label>
                        <input type="number" name="steps[${stepIndex}][rules][volume][tolerance]" placeholder="10" step="0.1" value="0">
                    </div>
                    <div class="rule-field">
                        <label>Points Awarded</label>
                        <input type="number" name="steps[${stepIndex}][rules][volume][points]" placeholder="10" min="0" step="1" value="0">
                    </div>
                </div>
                <div class="rule-actions">
                    <button type="button" onclick="clearRule('volume', ${stepIndex})" class="btn btn-secondary">Clear Volume Rule</button>
                </div>
            </div>

            <div class="rules-section">
                <div class="rules-section-title">
                    <span class="icon">🔄</span> Rotation Rule
                </div>
                <div class="rules-grid">
                    <div class="rule-field">
                        <label>X-Axis Angle</label>
                        <input type="number" name="steps[${stepIndex}][rules][rotation][x]" placeholder="0.5" step="0.01" value="0">
                    </div>
                    <div class="rule-field">
                        <label>Z-Axis Angle</label>
                        <input type="number" name="steps[${stepIndex}][rules][rotation][z]" placeholder="0" step="0.01" value="0">
                    </div>
                    <div class="rule-field">
                        <label>Angle Tolerance</label>
                        <input type="number" name="steps[${stepIndex}][rules][rotation][tolerance]" placeholder="0.1" step="0.01" value="0">
                    </div>
                    <div class="rule-field">
                        <label>Points Awarded</label>
                        <input type="number" name="steps[${stepIndex}][rules][rotation][points]" placeholder="10" min="0" step="1" value="0">
                    </div>
                </div>
                <div class="rule-actions">
                    <button type="button" onclick="clearRule('rotation', ${stepIndex})" class="btn btn-secondary">Clear Rotation Rule</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('steps').appendChild(div);
    stepIndex++;
}

let conditionIndex = {};

function toggleRules(stepIdx) {
    const rulesDiv = document.getElementById(`rules-${stepIdx}`);
    if (rulesDiv.style.display === 'none') {
        rulesDiv.style.display = 'block';
    } else {
        rulesDiv.style.display = 'none';
    }
}

function addCondition(stepIdx) {
    if (!conditionIndex[stepIdx]) {
        conditionIndex[stepIdx] = 0;
    }
    const condIdx = conditionIndex[stepIdx]++;
    const div = document.createElement('div');
    div.className = 'condition-item';
    div.style.cssText = 'border: 1px solid #ddd; padding: 12px; margin-bottom: 10px; border-radius: 4px; background: white;';
    div.innerHTML = `
        <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr; gap: 10px; align-items: end;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-size: 12px; font-weight: 500;">Type</label>
                <select name="steps[${stepIdx}][rules][conditions][${condIdx}][type]" required style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="temperature">Temperature</option>
                    <option value="volume">Volume</option>
                    <option value="hasContent">Has Content</option>
                    <option value="empty">Empty</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-size: 12px; font-weight: 500;">Operator</label>
                <select name="steps[${stepIdx}][rules][conditions][${condIdx}][operator]" required style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value=">">Greater than (>)</option>
                    <option value="<">Less than (<)</option>
                    <option value="==">Equals (==)</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-size: 12px; font-weight: 500;">Value</label>
                <input type="number" name="steps[${stepIdx}][rules][conditions][${condIdx}][value]" placeholder="Value" step="0.1" required style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-size: 12px; font-weight: 500;">Tolerance</label>
                <input type="number" name="steps[${stepIdx}][rules][conditions][${condIdx}][tolerance]" placeholder="Tolerance" step="0.1" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-size: 12px; font-weight: 500;">Points</label>
                <input type="number" name="steps[${stepIdx}][rules][conditions][${condIdx}][points]" placeholder="Points" min="0" step="1" value="5" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
                <button type="button" onclick="this.closest('.condition-item').remove()" style="padding: 6px 12px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove</button>
            </div>
        </div>
        <div style="margin-top: 8px;">
            <label style="display: block; margin-bottom: 5px; font-size: 12px; font-weight: 500;">Custom Message (optional)</label>
            <input type="text" name="steps[${stepIdx}][rules][conditions][${condIdx}][message]" placeholder="Error message if condition fails" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
    `;
    document.getElementById(`conditions-${stepIdx}`).appendChild(div);
}

function clearRule(ruleType, stepIdx) {
    const inputs = document.querySelectorAll(`input[name*="[rules][${ruleType}]"]`);
    inputs.forEach(input => {
        if (input.closest(`#rules-${stepIdx}`)) {
            input.value = '';
        }
    });
}

function loadStepRules(stepIdx, stepData) {
    if (!stepData.rules) return;
    
    const rulesDiv = document.getElementById(`rules-${stepIdx}`);
    if (!rulesDiv) return;
    
    rulesDiv.style.display = 'block';
    
    if (stepData.points) {
        const pointsInput = rulesDiv.querySelector(`input[name="steps[${stepIdx}][points]"]`);
        if (pointsInput) pointsInput.value = stepData.points;
    }
    
    if (stepData.rules.temperature) {
        const temp = stepData.rules.temperature;
        const targetInput = rulesDiv.querySelector(`input[name="steps[${stepIdx}][rules][temperature][target]"]`);
        const toleranceInput = rulesDiv.querySelector(`input[name="steps[${stepIdx}][rules][temperature][tolerance]"]`);
        const pointsInput = rulesDiv.querySelector(`input[name="steps[${stepIdx}][rules][temperature][points]"]`);
        if (targetInput && temp.target !== undefined) targetInput.value = temp.target;
        if (toleranceInput && temp.tolerance !== undefined) toleranceInput.value = temp.tolerance;
        if (pointsInput && temp.points !== undefined) pointsInput.value = temp.points;
    }
    
    if (stepData.rules.volume) {
        const vol = stepData.rules.volume;
        const targetInput = rulesDiv.querySelector(`input[name="steps[${stepIdx}][rules][volume][target]"]`);
        const toleranceInput = rulesDiv.querySelector(`input[name="steps[${stepIdx}][rules][volume][tolerance]"]`);
        const pointsInput = rulesDiv.querySelector(`input[name="steps[${stepIdx}][rules][volume][points]"]`);
        if (targetInput && vol.target !== undefined) targetInput.value = vol.target;
        if (toleranceInput && vol.tolerance !== undefined) toleranceInput.value = vol.tolerance;
        if (pointsInput && vol.points !== undefined) pointsInput.value = vol.points;
    }
    
    if (stepData.rules.rotation) {
        const rot = stepData.rules.rotation;
        const xInput = rulesDiv.querySelector(`input[name="steps[${stepIdx}][rules][rotation][x]"]`);
        const zInput = rulesDiv.querySelector(`input[name="steps[${stepIdx}][rules][rotation][z]"]`);
        const toleranceInput = rulesDiv.querySelector(`input[name="steps[${stepIdx}][rules][rotation][tolerance]"]`);
        const pointsInput = rulesDiv.querySelector(`input[name="steps[${stepIdx}][rules][rotation][points]"]`);
        if (xInput && rot.x !== undefined) xInput.value = rot.x;
        if (zInput && rot.z !== undefined) zInput.value = rot.z;
        if (toleranceInput && rot.tolerance !== undefined) toleranceInput.value = rot.tolerance;
        if (pointsInput && rot.points !== undefined) pointsInput.value = rot.points;
    }
    
    if (stepData.rules.conditions && Array.isArray(stepData.rules.conditions)) {
        stepData.rules.conditions.forEach((condition, idx) => {
            conditionIndex[stepIdx] = idx + 1;
            const div = document.createElement('div');
            div.className = 'condition-item';
            div.style.cssText = 'border: 1px solid #ddd; padding: 12px; margin-bottom: 10px; border-radius: 4px; background: white;';
            div.innerHTML = `
                <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr; gap: 10px; align-items: end;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 12px; font-weight: 500;">Type</label>
                        <select name="steps[${stepIdx}][rules][conditions][${idx}][type]" required style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="temperature" ${condition.type === 'temperature' ? 'selected' : ''}>Temperature</option>
                            <option value="volume" ${condition.type === 'volume' ? 'selected' : ''}>Volume</option>
                            <option value="hasContent" ${condition.type === 'hasContent' ? 'selected' : ''}>Has Content</option>
                            <option value="empty" ${condition.type === 'empty' ? 'selected' : ''}>Empty</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 12px; font-weight: 500;">Operator</label>
                        <select name="steps[${stepIdx}][rules][conditions][${idx}][operator]" required style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value=">" ${condition.operator === '>' ? 'selected' : ''}>Greater than (>)</option>
                            <option value="<" ${condition.operator === '<' ? 'selected' : ''}>Less than (<)</option>
                            <option value="==" ${condition.operator === '==' ? 'selected' : ''}>Equals (==)</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 12px; font-weight: 500;">Value</label>
                        <input type="number" name="steps[${stepIdx}][rules][conditions][${idx}][value]" value="${condition.value || ''}" placeholder="Value" step="0.1" required style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 12px; font-weight: 500;">Tolerance</label>
                        <input type="number" name="steps[${stepIdx}][rules][conditions][${idx}][tolerance]" value="${condition.tolerance || ''}" placeholder="Tolerance" step="0.1" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 12px; font-weight: 500;">Points</label>
                        <input type="number" name="steps[${stepIdx}][rules][conditions][${idx}][points]" value="${condition.points || ''}" placeholder="Points" min="0" step="1" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div>
                        <button type="button" onclick="this.closest('.condition-item').remove()" style="padding: 6px 12px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove</button>
                    </div>
                </div>
                <div style="margin-top: 8px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 12px; font-weight: 500;">Custom Message (optional)</label>
                    <input type="text" name="steps[${stepIdx}][rules][conditions][${idx}][message]" value="${condition.message || ''}" placeholder="Error message if condition fails" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
            `;
            document.getElementById(`conditions-${stepIdx}`).appendChild(div);
        });
    }
}

function addInitialState() {
    const div = document.createElement('div');
    div.className = 'initial-state-card';
    div.innerHTML = `
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 2fr auto; gap: 16px; align-items: end;">
            <div class="form-group" style="margin-bottom: 0;">
                <label>Object Name</label>
                <input type="text" name="initialState[${initialStateIndex}][objectName]" placeholder="e.g., Beaker, Conical" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Volume (ml)</label>
                <input type="number" name="initialState[${initialStateIndex}][volume]" placeholder="0" min="0" step="0.1">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Temperature (°C)</label>
                <input type="number" name="initialState[${initialStateIndex}][temperature]" placeholder="20" min="-273" step="0.1">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Contents (comma-separated)</label>
                <input type="text" name="initialState[${initialStateIndex}][contents]" placeholder="e.g., water, acid">
            </div>
            <div>
                <button type="button" onclick="this.closest('.initial-state-card').remove()" class="btn btn-danger">Remove</button>
            </div>
        </div>
        <div class="color-config">
            <h4 style="margin: 0 0 16px 0; color: #92400e; font-size: 15px; font-weight: 700;"><span class="icon icon-palette"></span>Color Configuration</h4>
            <div class="color-grid">
                <div class="color-field">
                    <label>Initial Color (Hex)</label>
                    <input type="text" name="initialState[${initialStateIndex}][initialColor]" placeholder="#4a90e2" pattern="#[0-9a-fA-F]{6}">
                    <small>Color when at room temperature</small>
                </div>
                <div class="color-field">
                    <label>After Boiling (Hex)</label>
                    <input type="text" name="initialState[${initialStateIndex}][boilingColor]" placeholder="#ff6b6b" pattern="#[0-9a-fA-F]{6}">
                    <small>Color when temperature > 80°C</small>
                </div>
                <div class="color-field">
                    <label>After Cooling (Hex)</label>
                    <input type="text" name="initialState[${initialStateIndex}][coolingColor]" placeholder="#4a90e2" pattern="#[0-9a-fA-F]{6}">
                    <small>Color when temperature < 20°C</small>
                </div>
            </div>
        </div>
    `;
    document.getElementById('initial-states').appendChild(div);
    initialStateIndex++;
}

function loadInitialStates(initialStates) {
    const container = document.getElementById('initial-states');
    container.innerHTML = '';
    initialStateIndex = 0;
    
    if (initialStates && Array.isArray(initialStates)) {
        initialStates.forEach(state => {
            const div = document.createElement('div');
            div.className = 'initial-state-card';
            div.innerHTML = `
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 2fr auto; gap: 16px; align-items: end;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>Object Name</label>
                        <input type="text" name="initialState[${initialStateIndex}][objectName]" value="${state.objectName || ''}" placeholder="e.g., Beaker, Conical" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>Volume (ml)</label>
                        <input type="number" name="initialState[${initialStateIndex}][volume]" value="${state.volume || ''}" placeholder="0" min="0" step="0.1">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>Temperature (°C)</label>
                        <input type="number" name="initialState[${initialStateIndex}][temperature]" value="${state.temperature || ''}" placeholder="20" min="-273" step="0.1">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>Contents (comma-separated)</label>
                        <input type="text" name="initialState[${initialStateIndex}][contents]" value="${Array.isArray(state.contents) ? state.contents.join(', ') : (state.contents || '')}" placeholder="e.g., water, acid">
                    </div>
                    <div>
                        <button type="button" onclick="this.closest('.initial-state-card').remove()" class="btn btn-danger">Remove</button>
                    </div>
                </div>
                <div class="color-config">
                    <h4 style="margin: 0 0 16px 0; color: #92400e; font-size: 15px; font-weight: 700;"><span class="icon icon-palette"></span>Color Configuration</h4>
                    <div class="color-grid">
                        <div class="color-field">
                            <label>Initial Color (Hex)</label>
                            <input type="text" name="initialState[${initialStateIndex}][initialColor]" value="${state.initialColor || ''}" placeholder="#4a90e2" pattern="#[0-9a-fA-F]{6}">
                            <small>Color when at room temperature</small>
                        </div>
                        <div class="color-field">
                            <label>After Boiling (Hex)</label>
                            <input type="text" name="initialState[${initialStateIndex}][boilingColor]" value="${state.boilingColor || ''}" placeholder="#ff6b6b" pattern="#[0-9a-fA-F]{6}">
                            <small>Color when temperature > 80°C</small>
                        </div>
                        <div class="color-field">
                            <label>After Cooling (Hex)</label>
                            <input type="text" name="initialState[${initialStateIndex}][coolingColor]" value="${state.coolingColor || ''}" placeholder="#4a90e2" pattern="#[0-9a-fA-F]{6}">
                            <small>Color when temperature < 20°C</small>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(div);
            initialStateIndex++;
        });
    }
}

function addReaction() {
    const div = document.createElement('div');
    div.className = 'reaction-card';
    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h4 style="margin: 0; color: #1a202c; font-size: 18px; font-weight: 700;"><span class="icon icon-reaction"></span>Reaction ${reactionIndex + 1}</h4>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div class="form-group">
                <label>Reactants (comma-separated)</label>
                <input type="text" name="reactions[${reactionIndex}][reactants]" placeholder="e.g., acid, base" required>
                <small>Substances that react together</small>
            </div>
            <div class="form-group">
                <label>Result Type</label>
                <input type="text" name="reactions[${reactionIndex}][result][type]" placeholder="e.g., salt, water" required>
                <small>Type of substance produced</small>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div class="form-group">
                <label>Result Color (Hex)</label>
                <input type="text" name="reactions[${reactionIndex}][result][color]" placeholder="#ffffff" value="#ffffff" pattern="#[0-9a-fA-F]{6}">
                <small>Hex color code for resulting liquid</small>
            </div>
            <div class="form-group">
                <label>Message (optional)</label>
                <input type="text" name="reactions[${reactionIndex}][message]" placeholder="e.g., Neutralization reaction occurred">
                <small>Message displayed when reaction occurs</small>
            </div>
        </div>
        <div>
            <button type="button" onclick="this.closest('.reaction-card').remove()" class="btn btn-danger">Remove Reaction</button>
        </div>
    `;
    document.getElementById('reactions').appendChild(div);
    reactionIndex++;
}
