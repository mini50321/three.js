let stepIndex = 0;
document.addEventListener('DOMContentLoaded', function() {
    const existingSteps = document.querySelectorAll('.step-card');
    if (existingSteps.length > 0) {
        stepIndex = existingSteps.length;
    }
});
let initialStateIndex = 0;
let reactionIndex = 0;
let powderColorIndex = 0;
let smokeColorIndex = 0;
let chemicalOptionIndex = 0;
let powderOptionIndex = 0;

function addStep() {
    const div = document.createElement('div');
    div.className = 'step-card';
    const stepNumber = stepIndex + 1;
    div.innerHTML = `
        <div style="margin-bottom: 16px;">
            <h4 style="margin: 0; color: #1e293b; font-size: 18px; font-weight: 700;">Step ${stepNumber}</h4>
        </div>
        <div class="step-header">
            <div class="form-group" style="margin-bottom: 0;">
                <label>Instruction</label>
                <input type="text" name="steps[${stepIndex}][instruction]" placeholder="Enter step instruction (e.g., Heat the beaker until...)" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Equipment</label>
                <input type="text" name="steps[${stepIndex}][equipment]" placeholder="Equipment name" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Action</label>
                <select name="steps[${stepIndex}][action]" required>
                    <option value="tilt">Tilt</option>
                    <option value="pour">Pour</option>
                    <option value="heat">Heat</option>
                    <option value="stir">Stir</option>
                    <option value="drag">Drag</option>
                    <option value="shake">Shake</option>
                    <option value="observe">Observe</option>
                </select>
            </div>
            <div style="display: flex; align-items: flex-end;">
                <button type="button" onclick="this.closest('.step-card').remove()" class="btn btn-danger">Remove</button>
            </div>
        </div>
        <div class="button-spacing">
            <button type="button" onclick="toggleRules(${stepIndex})" class="btn btn-secondary">
                <span class="icon">⚙️</span> Configure Rules & Scoring
            </button>
        </div>
        <div id="rules-${stepIndex}" class="rules-panel" style="display: none;">
            <div class="rules-header">
                <h4>Rules & Scoring Configuration</h4>
            </div>
            
            <div class="rules-section">
                <div class="rules-section-title">
                    <span class="icon">📊</span> Step Points
                </div>
                <div class="points-input-wrapper">
                    <input type="number" name="steps[${stepIndex}][points]" placeholder="10" min="0" step="1" value="10">
                    <small>Default points awarded for completing this step</small>
                </div>
            </div>

            <div id="conditions-${stepIndex}"></div>
            <div class="section-spacing">
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
        </div>
    `;
    const stepsContainer = document.getElementById('steps');
    if (stepsContainer) {
        stepsContainer.appendChild(div);
        stepIndex++;
    }
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
    div.innerHTML = `
        <div class="condition-grid">
            <div class="condition-field">
                <label>Type</label>
                <select name="steps[${stepIdx}][rules][conditions][${condIdx}][type]" class="condition-type-select">
                    <option value="temperature">Temperature</option>
                    <option value="volume">Volume</option>
                    <option value="hasContent">Has Content</option>
                    <option value="empty">Empty</option>
                </select>
            </div>
            <div class="condition-field">
                <label>Operator</label>
                <select name="steps[${stepIdx}][rules][conditions][${condIdx}][operator]">
                    <option value=">">Greater than (>)</option>
                    <option value="<">Less than (<)</option>
                    <option value="==">Equals (==)</option>
                </select>
            </div>
            <div class="condition-field">
                <label>Value</label>
                <input type="text" name="steps[${stepIdx}][rules][conditions][${condIdx}][value]" placeholder="Value or content name" class="condition-value-input">
            </div>
            <div class="condition-field">
                <label>Tolerance</label>
                <input type="number" name="steps[${stepIdx}][rules][conditions][${condIdx}][tolerance]" placeholder="Tolerance" step="0.1">
            </div>
            <div class="condition-field">
                <label>Points</label>
                <input type="number" name="steps[${stepIdx}][rules][conditions][${condIdx}][points]" placeholder="Points" min="0" step="1" value="5">
            </div>
            <div>
                <button type="button" onclick="this.closest('.condition-item').remove()" class="btn btn-danger" style="font-size: 12px; padding: 8px 16px;">Remove</button>
            </div>
        </div>
        <div class="condition-message">
            <label style="display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: #64748b;">Custom Message (optional)</label>
            <input type="text" name="steps[${stepIdx}][rules][conditions][${condIdx}][message]" placeholder="Error message if condition fails">
        </div>
    `;
    const conditionsContainer = document.getElementById(`conditions-${stepIdx}`);
    if (conditionsContainer) {
        conditionsContainer.appendChild(div);
        
        const typeSelect = div.querySelector('.condition-type-select');
        const valueInput = div.querySelector('.condition-value-input');
        
        if (typeSelect && valueInput) {
            function updateInputType() {
                const selectedType = typeSelect.value;
                if (selectedType === 'hasContent') {
                    valueInput.type = 'text';
                    valueInput.placeholder = 'e.g., water, acid, indicator_solution';
                    valueInput.disabled = false;
                    valueInput.removeAttribute('step');
                } else if (selectedType === 'empty') {
                    valueInput.type = 'text';
                    valueInput.placeholder = 'N/A (not used)';
                    valueInput.disabled = true;
                    valueInput.value = '';
                    valueInput.removeAttribute('step');
                } else {
                    valueInput.type = 'number';
                    valueInput.step = '0.1';
                    valueInput.placeholder = 'Value';
                    valueInput.disabled = false;
                }
            }
            
            typeSelect.addEventListener('change', updateInputType);
            updateInputType();
        }
    }
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
            div.innerHTML = `
                <div class="condition-grid">
                    <div class="condition-field">
                        <label>Type</label>
                        <select name="steps[${stepIdx}][rules][conditions][${idx}][type]" class="condition-type-select">
                            <option value="temperature" ${condition.type === 'temperature' ? 'selected' : ''}>Temperature</option>
                            <option value="volume" ${condition.type === 'volume' ? 'selected' : ''}>Volume</option>
                            <option value="hasContent" ${condition.type === 'hasContent' ? 'selected' : ''}>Has Content</option>
                            <option value="empty" ${condition.type === 'empty' ? 'selected' : ''}>Empty</option>
                        </select>
                    </div>
                    <div class="condition-field">
                        <label>Operator</label>
                        <select name="steps[${stepIdx}][rules][conditions][${idx}][operator]">
                            <option value=">" ${condition.operator === '>' ? 'selected' : ''}>Greater than (>)</option>
                            <option value="<" ${condition.operator === '<' ? 'selected' : ''}>Less than (<)</option>
                            <option value="==" ${condition.operator === '==' ? 'selected' : ''}>Equals (==)</option>
                        </select>
                    </div>
                    <div class="condition-field">
                        <label>Value</label>
                        <input type="${condition.type === 'hasContent' || condition.type === 'empty' ? 'text' : 'number'}" name="steps[${stepIdx}][rules][conditions][${idx}][value]" value="${condition.value || ''}" placeholder="${condition.type === 'hasContent' ? 'e.g., water, acid' : (condition.type === 'empty' ? 'N/A (not used)' : 'Value')}" class="condition-value-input" ${condition.type === 'empty' ? 'disabled' : ''} ${condition.type !== 'hasContent' && condition.type !== 'empty' ? 'step="0.1"' : ''}>
                    </div>
                    <div class="condition-field">
                        <label>Tolerance</label>
                        <input type="number" name="steps[${stepIdx}][rules][conditions][${idx}][tolerance]" value="${condition.tolerance || ''}" placeholder="Tolerance" step="0.1">
                    </div>
                    <div class="condition-field">
                        <label>Points</label>
                        <input type="number" name="steps[${stepIdx}][rules][conditions][${idx}][points]" value="${condition.points || ''}" placeholder="Points" min="0" step="1">
                    </div>
                    <div>
                        <button type="button" onclick="this.closest('.condition-item').remove()" class="btn btn-danger" style="font-size: 12px; padding: 8px 16px;">Remove</button>
                    </div>
                </div>
                <div class="condition-message">
                    <label style="display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: #64748b;">Custom Message (optional)</label>
                    <input type="text" name="steps[${stepIdx}][rules][conditions][${idx}][message]" value="${condition.message || ''}" placeholder="Error message if condition fails">
                </div>
            `;
            const conditionsContainer = document.getElementById(`conditions-${stepIdx}`);
            if (conditionsContainer) {
                conditionsContainer.appendChild(div);
                
                const typeSelect = div.querySelector('.condition-type-select');
                const valueInput = div.querySelector('.condition-value-input');
                
                if (typeSelect && valueInput) {
                    function updateInputType() {
                        const selectedType = typeSelect.value;
                        if (selectedType === 'hasContent' || selectedType === 'empty') {
                            valueInput.type = 'text';
                            valueInput.placeholder = selectedType === 'hasContent' ? 'e.g., water, acid' : 'N/A (not used)';
                            if (selectedType === 'empty') {
                                valueInput.disabled = true;
                                valueInput.value = '';
                            } else {
                                valueInput.disabled = false;
                            }
                        } else {
                            valueInput.type = 'number';
                            valueInput.step = '0.1';
                            valueInput.placeholder = 'Value';
                            valueInput.disabled = false;
                        }
                    }
                    
                    typeSelect.addEventListener('change', updateInputType);
                    updateInputType();
                }
            }
        });
    }
}

function updateObjectNumbers() {
    const cards = document.querySelectorAll('.initial-state-card');
    cards.forEach((card, index) => {
        const header = card.querySelector('.object-number-header');
        if (header) {
            const h4 = header.querySelector('h4');
            if (h4) {
                h4.textContent = `Object ${index + 1}`;
            } else {
                header.innerHTML = `<h4 style="margin: 0; color: #1e293b; font-size: 18px; font-weight: 700;">Object ${index + 1}</h4>`;
            }
        } else {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'object-number-header';
            headerDiv.style.cssText = 'margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0;';
            headerDiv.innerHTML = `<h4 style="margin: 0; color: #1e293b; font-size: 18px; font-weight: 700;">Object ${index + 1}</h4>`;
            card.insertBefore(headerDiv, card.firstChild);
        }
    });
}

function addInitialState() {
    const div = document.createElement('div');
    div.className = 'initial-state-card';
    const container = document.getElementById('initial-states');
    const objectNumber = container.children.length + 1;
    div.innerHTML = `
        <div class="object-number-header" style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0;">
            <h4 style="margin: 0; color: #1e293b; font-size: 18px; font-weight: 700;">Object ${objectNumber}</h4>
        </div>
        <div class="initial-state-grid">
            <div class="form-group form-group-inline">
                <label>Object Name</label>
                <input type="text" name="initialState[${initialStateIndex}][objectName]" placeholder="e.g., Beaker, Conical" required>
            </div>
            <div class="form-group form-group-inline">
                <label>Volume (ml)</label>
                <input type="number" name="initialState[${initialStateIndex}][volume]" placeholder="0" min="0" step="0.1">
            </div>
            <div class="form-group form-group-inline">
                <label>Temperature (°C)</label>
                <input type="number" name="initialState[${initialStateIndex}][temperature]" placeholder="20" min="-273" step="0.1">
            </div>
            <div class="form-group form-group-inline">
                <label>Contents (comma-separated)</label>
                <input type="text" name="initialState[${initialStateIndex}][contents]" placeholder="e.g., water, acid">
            </div>
            <div>
                <button type="button" onclick="this.closest('.initial-state-card').remove(); updateObjectNumbers();" class="btn btn-danger">Remove</button>
            </div>
        </div>
        <div class="color-config">
            <h4 class="color-config-title"><span class="icon icon-palette"></span>Color Configuration</h4>
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
    updateObjectNumbers();
}

function loadInitialStates(initialStates) {
    const container = document.getElementById('initial-states');
    container.innerHTML = '';
    initialStateIndex = 0;
    
    if (initialStates && Array.isArray(initialStates)) {
        initialStates.forEach((state, index) => {
            const div = document.createElement('div');
            div.className = 'initial-state-card';
            div.innerHTML = `
                <div class="object-number-header" style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0;">
                    <h4 style="margin: 0; color: #1e293b; font-size: 18px; font-weight: 700;">Object ${index + 1}</h4>
                </div>
                <div class="initial-state-grid">
                    <div class="form-group form-group-inline">
                        <label>Object Name</label>
                        <input type="text" name="initialState[${initialStateIndex}][objectName]" value="${state.objectName || ''}" placeholder="e.g., Beaker, Conical" required>
                    </div>
                    <div class="form-group form-group-inline">
                        <label>Volume (ml)</label>
                        <input type="number" name="initialState[${initialStateIndex}][volume]" value="${state.volume || ''}" placeholder="0" min="0" step="0.1">
                    </div>
                    <div class="form-group form-group-inline">
                        <label>Temperature (°C)</label>
                        <input type="number" name="initialState[${initialStateIndex}][temperature]" value="${state.temperature || ''}" placeholder="20" min="-273" step="0.1">
                    </div>
                    <div class="form-group form-group-inline">
                        <label>Contents (comma-separated)</label>
                        <input type="text" name="initialState[${initialStateIndex}][contents]" value="${Array.isArray(state.contents) ? state.contents.join(', ') : (state.contents || '')}" placeholder="e.g., water, acid">
                    </div>
                    <div>
                        <button type="button" onclick="this.closest('.initial-state-card').remove()" class="btn btn-danger">Remove</button>
                    </div>
                </div>
                <div class="color-config">
                    <h4 class="color-config-title"><span class="icon icon-palette"></span>Color Configuration</h4>
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
        updateObjectNumbers();
    }
}

function addReaction() {
    const div = document.createElement('div');
    div.className = 'reaction-card';
    div.innerHTML = `
        <div class="reaction-header">
            <h4 class="reaction-title"><span class="icon icon-reaction"></span>Reaction ${reactionIndex + 1}</h4>
        </div>
        <div class="reaction-grid">
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
        <div class="reaction-grid">
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

function loadReactions(reactionsData) {
    const container = document.getElementById('reactions');
    if (!container) return;
    
    container.innerHTML = '';
    reactionIndex = 0;
    
    if (reactionsData && Array.isArray(reactionsData)) {
        reactionsData.forEach(reaction => {
            const div = document.createElement('div');
            div.className = 'reaction-card';
            div.innerHTML = `
                <div class="reaction-header">
                    <h4 class="reaction-title"><span class="icon icon-reaction"></span>Reaction ${reactionIndex + 1}</h4>
                </div>
                <div class="reaction-grid">
                    <div class="form-group">
                        <label>Reactants (comma-separated)</label>
                        <input type="text" name="reactions[${reactionIndex}][reactants]" value="${(reaction.reactants || []).join(', ')}" placeholder="e.g., acid, base" required>
                        <small>Substances that react together</small>
                    </div>
                    <div class="form-group">
                        <label>Result Type</label>
                        <input type="text" name="reactions[${reactionIndex}][result][type]" value="${reaction.result?.type || ''}" placeholder="e.g., salt, water" required>
                        <small>Type of substance produced</small>
                    </div>
                </div>
                <div class="reaction-grid">
                    <div class="form-group">
                        <label>Result Color (Hex)</label>
                        <input type="text" name="reactions[${reactionIndex}][result][color]" value="${reaction.result?.color ? '#' + reaction.result.color.toString(16).padStart(6, '0') : '#ffffff'}" placeholder="#ffffff" pattern="#[0-9a-fA-F]{6}">
                        <small>Hex color code for resulting liquid</small>
                    </div>
                    <div class="form-group">
                        <label>Message (optional)</label>
                        <input type="text" name="reactions[${reactionIndex}][message]" value="${reaction.message || ''}" placeholder="e.g., Neutralization reaction occurred">
                        <small>Message displayed when reaction occurs</small>
                    </div>
                </div>
                <div>
                    <button type="button" onclick="this.closest('.reaction-card').remove()" class="btn btn-danger">Remove Reaction</button>
                </div>
            `;
            container.appendChild(div);
            reactionIndex++;
        });
    }
}

function addPowderColor() {
    const div = document.createElement('div');
    div.className = 'powder-color-card';
    div.style.cssText = 'background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e0e6ed;';
    div.innerHTML = `
        <div style="display: flex; gap: 15px; align-items: flex-end;">
            <div class="form-group" style="flex: 1;">
                <label>Powder Type</label>
                <input type="text" name="powderColors[${powderColorIndex}][type]" placeholder="e.g., carbonate, salt, sugar" required>
                <small>Name of the powder/crystal/salt</small>
            </div>
            <div class="form-group" style="flex: 1;">
                <label>Color (Hex)</label>
                <input type="text" name="powderColors[${powderColorIndex}][color]" placeholder="#ffffff" value="#ffffff" pattern="#[0-9a-fA-F]{6}" required>
                <small>Hex color code</small>
            </div>
            <div>
                <button type="button" onclick="this.closest('.powder-color-card').remove()" class="btn btn-danger">Remove</button>
            </div>
        </div>
    `;
    const container = document.getElementById('powder-colors');
    if (container) {
        container.appendChild(div);
        powderColorIndex++;
    }
}

function loadPowderColors(powderColorsData) {
    const container = document.getElementById('powder-colors');
    if (!container) return;
    
    container.innerHTML = '';
    powderColorIndex = 0;
    
    if (powderColorsData && Array.isArray(powderColorsData)) {
        powderColorsData.forEach((powderColor) => {
            const div = document.createElement('div');
            div.className = 'powder-color-card';
            div.style.cssText = 'background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e0e6ed;';
            div.innerHTML = `
                <div style="display: flex; gap: 15px; align-items: flex-end;">
                    <div class="form-group" style="flex: 1;">
                        <label>Powder Type</label>
                        <input type="text" name="powderColors[${powderColorIndex}][type]" value="${powderColor.type || ''}" placeholder="e.g., carbonate, salt, sugar" required>
                        <small>Name of the powder/crystal/salt</small>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Color (Hex)</label>
                        <input type="text" name="powderColors[${powderColorIndex}][color]" value="${powderColor.color || '#ffffff'}" placeholder="#ffffff" pattern="#[0-9a-fA-F]{6}" required>
                        <small>Hex color code</small>
                    </div>
                    <div>
                        <button type="button" onclick="this.closest('.powder-color-card').remove()" class="btn btn-danger">Remove</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
            powderColorIndex++;
        });
    }
}

function addSmokeColor() {
    const div = document.createElement('div');
    div.className = 'smoke-color-card';
    div.style.cssText = 'background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e0e6ed;';
    div.innerHTML = `
        <div style="display: flex; gap: 15px; align-items: flex-end;">
            <div class="form-group" style="flex: 1;">
                <label>Gas Type</label>
                <input type="text" name="smokeColors[${smokeColorIndex}][type]" placeholder="e.g., co2, oxygen, hydrogen" required>
                <small>Name of the gas that produces smoke</small>
            </div>
            <div class="form-group" style="flex: 1;">
                <label>Color (Hex)</label>
                <input type="text" name="smokeColors[${smokeColorIndex}][color]" placeholder="#cccccc" value="#cccccc" pattern="#[0-9a-fA-F]{6}" required>
                <small>Hex color code for smoke particles</small>
            </div>
            <div>
                <button type="button" onclick="this.closest('.smoke-color-card').remove()" class="btn btn-danger">Remove</button>
            </div>
        </div>
    `;
    const container = document.getElementById('smoke-colors');
    if (container) {
        container.appendChild(div);
        smokeColorIndex++;
    }
}

function loadSmokeColors(smokeColorsData) {
    const container = document.getElementById('smoke-colors');
    if (!container) return;
    
    container.innerHTML = '';
    smokeColorIndex = 0;
    
    if (smokeColorsData && Array.isArray(smokeColorsData)) {
        smokeColorsData.forEach((smokeColor) => {
            const div = document.createElement('div');
            div.className = 'smoke-color-card';
            div.style.cssText = 'background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e0e6ed;';
            div.innerHTML = `
                <div style="display: flex; gap: 15px; align-items: flex-end;">
                    <div class="form-group" style="flex: 1;">
                        <label>Gas Type</label>
                        <input type="text" name="smokeColors[${smokeColorIndex}][type]" value="${smokeColor.type || ''}" placeholder="e.g., co2, oxygen, hydrogen" required>
                        <small>Name of the gas that produces smoke</small>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Color (Hex)</label>
                        <input type="text" name="smokeColors[${smokeColorIndex}][color]" value="${smokeColor.color || '#cccccc'}" placeholder="#cccccc" pattern="#[0-9a-fA-F]{6}" required>
                        <small>Hex color code for smoke particles</small>
                    </div>
                    <div>
                        <button type="button" onclick="this.closest('.smoke-color-card').remove()" class="btn btn-danger">Remove</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
            smokeColorIndex++;
        });
    }
}

function addChemicalOption() {
    const div = document.createElement('div');
    div.className = 'chemical-option-card';
    div.style.cssText = 'background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e0e6ed;';
    div.innerHTML = `
        <div style="display: flex; gap: 15px; align-items: flex-end;">
            <div class="form-group" style="flex: 1;">
                <label>Chemical Name</label>
                <input type="text" name="chemicalOptions[${chemicalOptionIndex}][name]" placeholder="e.g., Sulphuric acid, Water, Bunsen's reagent" required>
                <small>Name of the chemical (will appear in dropdown)</small>
            </div>
            <div class="form-group" style="flex: 1;">
                <label>Color (Hex)</label>
                <input type="text" name="chemicalOptions[${chemicalOptionIndex}][color]" placeholder="#4a90e2" value="#4a90e2" pattern="#[0-9a-fA-F]{6}" required>
                <small>Hex color code for this chemical</small>
            </div>
            <div>
                <button type="button" onclick="this.closest('.chemical-option-card').remove()" class="btn btn-danger">Remove</button>
            </div>
        </div>
    `;
    const container = document.getElementById('chemical-options');
    if (container) {
        container.appendChild(div);
        chemicalOptionIndex++;
    }
}

function loadChemicalOptions(chemicalOptionsData) {
    const container = document.getElementById('chemical-options');
    if (!container) return;
    
    container.innerHTML = '';
    chemicalOptionIndex = 0;
    
    if (chemicalOptionsData && Array.isArray(chemicalOptionsData)) {
        chemicalOptionsData.forEach((option) => {
            const div = document.createElement('div');
            div.className = 'chemical-option-card';
            div.style.cssText = 'background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e0e6ed;';
            const optionName = typeof option === 'string' ? option : (option.name || option.type || '');
            let optionColor = '#4a90e2';
            if (typeof option !== 'string' && option.color) {
                if (typeof option.color === 'number') {
                    optionColor = '#' + option.color.toString(16).padStart(6, '0');
                } else {
                    optionColor = option.color.startsWith('#') ? option.color : '#' + option.color;
                }
            } else if (typeof option === 'string') {
                optionColor = '#4a90e2';
            }
            div.innerHTML = `
                <div style="display: flex; gap: 15px; align-items: flex-end;">
                    <div class="form-group" style="flex: 1;">
                        <label>Chemical Name</label>
                        <input type="text" name="chemicalOptions[${chemicalOptionIndex}][name]" value="${optionName}" placeholder="e.g., Sulphuric acid, Water, Bunsen's reagent" required>
                        <small>Name of the chemical (will appear in dropdown)</small>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Color (Hex)</label>
                        <input type="text" name="chemicalOptions[${chemicalOptionIndex}][color]" value="${optionColor}" placeholder="#4a90e2" pattern="#[0-9a-fA-F]{6}" required>
                        <small>Hex color code for this chemical</small>
                    </div>
                    <div>
                        <button type="button" onclick="this.closest('.chemical-option-card').remove()" class="btn btn-danger">Remove</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
            chemicalOptionIndex++;
        });
    }
}

function addPowderOption() {
    const div = document.createElement('div');
    div.className = 'powder-option-card';
    div.style.cssText = 'background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e0e6ed;';
    div.innerHTML = `
        <div style="display: flex; gap: 15px; align-items: flex-end;">
            <div class="form-group" style="flex: 1;">
                <label>Powder/Crystal/Salt Name</label>
                <input type="text" name="powderOptions[${powderOptionIndex}][name]" placeholder="e.g., Carbonate, Salt, Sugar" required>
                <small>Name of the powder/crystal/salt (will appear in dropdown)</small>
            </div>
            <div class="form-group" style="flex: 1;">
                <label>Color (Hex)</label>
                <input type="text" name="powderOptions[${powderOptionIndex}][color]" placeholder="#ffffff" value="#ffffff" pattern="#[0-9a-fA-F]{6}" required>
                <small>Hex color code for this powder</small>
            </div>
            <div>
                <button type="button" onclick="this.closest('.powder-option-card').remove()" class="btn btn-danger">Remove</button>
            </div>
        </div>
    `;
    const container = document.getElementById('powder-options');
    if (container) {
        container.appendChild(div);
        powderOptionIndex++;
    }
}

function loadPowderOptions(powderOptionsData) {
    const container = document.getElementById('powder-options');
    if (!container) return;
    
    container.innerHTML = '';
    powderOptionIndex = 0;
    
    if (powderOptionsData && Array.isArray(powderOptionsData)) {
        powderOptionsData.forEach((option) => {
            const div = document.createElement('div');
            div.className = 'powder-option-card';
            div.style.cssText = 'background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e0e6ed;';
            const optionName = typeof option === 'string' ? option : (option.name || option.type || '');
            let optionColor = '#ffffff';
            if (typeof option !== 'string' && option.color) {
                if (typeof option.color === 'number') {
                    optionColor = '#' + option.color.toString(16).padStart(6, '0');
                } else {
                    optionColor = option.color.startsWith('#') ? option.color : '#' + option.color;
                }
            } else if (typeof option === 'string') {
                optionColor = '#ffffff';
            }
            div.innerHTML = `
                <div style="display: flex; gap: 15px; align-items: flex-end;">
                    <div class="form-group" style="flex: 1;">
                        <label>Powder/Crystal/Salt Name</label>
                        <input type="text" name="powderOptions[${powderOptionIndex}][name]" value="${optionName}" placeholder="e.g., Carbonate, Salt, Sugar" required>
                        <small>Name of the powder/crystal/salt (will appear in dropdown)</small>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Color (Hex)</label>
                        <input type="text" name="powderOptions[${powderOptionIndex}][color]" value="${optionColor}" placeholder="#ffffff" pattern="#[0-9a-fA-F]{6}" required>
                        <small>Hex color code for this powder</small>
                    </div>
                    <div>
                        <button type="button" onclick="this.closest('.powder-option-card').remove()" class="btn btn-danger">Remove</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
            powderOptionIndex++;
        });
    }
}
