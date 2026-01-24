let stepIndex = document.querySelectorAll('.step').length || 0;
let initialStateIndex = 0;

function addStep() {
    const div = document.createElement('div');
    div.className = 'step';
    div.style.cssText = 'border: 1px solid #e0e6ed; padding: 20px; margin-bottom: 20px; border-radius: 8px; background: #fff;';
    div.innerHTML = `
        <div style="display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <input type="text" name="steps[${stepIndex}][instruction]" placeholder="Step instruction" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <input type="text" name="steps[${stepIndex}][equipment]" placeholder="Equipment name" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <select name="steps[${stepIndex}][action]" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="tilt">Tilt</option>
                <option value="pour">Pour</option>
                <option value="heat">Heat</option>
                <option value="stir">Stir</option>
                <option value="drag">Drag</option>
            </select>
            <button type="button" onclick="this.closest('.step').remove()" style="padding: 8px 15px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Remove</button>
        </div>
        <div style="margin-top: 15px;">
            <button type="button" onclick="toggleRules(${stepIndex})" class="btn btn-secondary" style="font-size: 14px;">⚙️ Configure Rules & Scoring</button>
        </div>
        <div id="rules-${stepIndex}" style="display: none; margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e0e6ed;">
            <h4 style="margin-top: 0; margin-bottom: 15px; color: #2c3e50;">Rules & Scoring</h4>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Step Points (default: 10)</label>
                <input type="number" name="steps[${stepIndex}][points]" placeholder="10" min="0" step="1" style="width: 150px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div id="conditions-${stepIndex}" style="margin-bottom: 15px;"></div>
            <button type="button" onclick="addCondition(${stepIndex})" class="btn btn-secondary" style="font-size: 14px; margin-bottom: 15px;">+ Add Condition</button>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Temperature Rule</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
                    <input type="number" name="steps[${stepIndex}][rules][temperature][target]" placeholder="Target (°C)" step="0.1" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <input type="number" name="steps[${stepIndex}][rules][temperature][tolerance]" placeholder="Tolerance" step="0.1" value="5" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <input type="number" name="steps[${stepIndex}][rules][temperature][points]" placeholder="Points" min="0" step="1" value="10" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <button type="button" onclick="clearRule('temperature', ${stepIndex})" style="padding: 8px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer;">Clear</button>
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Volume Rule</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
                    <input type="number" name="steps[${stepIndex}][rules][volume][target]" placeholder="Target (ml)" step="0.1" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <input type="number" name="steps[${stepIndex}][rules][volume][tolerance]" placeholder="Tolerance" step="0.1" value="10" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <input type="number" name="steps[${stepIndex}][rules][volume][points]" placeholder="Points" min="0" step="1" value="10" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <button type="button" onclick="clearRule('volume', ${stepIndex})" style="padding: 8px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer;">Clear</button>
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Rotation Rule</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr; gap: 10px;">
                    <input type="number" name="steps[${stepIndex}][rules][rotation][x]" placeholder="X angle" step="0.01" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <input type="number" name="steps[${stepIndex}][rules][rotation][z]" placeholder="Z angle" step="0.01" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <input type="number" name="steps[${stepIndex}][rules][rotation][tolerance]" placeholder="Tolerance" step="0.01" value="0.1" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <input type="number" name="steps[${stepIndex}][rules][rotation][points]" placeholder="Points" min="0" step="1" value="10" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <button type="button" onclick="clearRule('rotation', ${stepIndex})" style="padding: 8px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer;">Clear</button>
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
    div.className = 'initial-state-item';
    div.style.cssText = 'border: 1px solid #e0e6ed; padding: 15px; margin-bottom: 10px; border-radius: 6px; background: #f8f9fa;';
    div.innerHTML = `
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 2fr 1fr; gap: 10px; align-items: end;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Object Name</label>
                <input type="text" name="initialState[${initialStateIndex}][objectName]" placeholder="e.g., Beaker, Conical" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Volume (ml)</label>
                <input type="number" name="initialState[${initialStateIndex}][volume]" placeholder="0" min="0" step="0.1" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Temperature (°C)</label>
                <input type="number" name="initialState[${initialStateIndex}][temperature]" placeholder="20" min="-273" step="0.1" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Contents (comma-separated)</label>
                <input type="text" name="initialState[${initialStateIndex}][contents]" placeholder="e.g., water, acid" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
                <button type="button" onclick="this.closest('.initial-state-item').remove()" style="padding: 8px 15px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Remove</button>
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
            div.className = 'initial-state-item';
            div.style.cssText = 'border: 1px solid #e0e6ed; padding: 15px; margin-bottom: 10px; border-radius: 6px; background: #f8f9fa;';
            div.innerHTML = `
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 2fr 1fr; gap: 10px; align-items: end;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Object Name</label>
                        <input type="text" name="initialState[${initialStateIndex}][objectName]" value="${state.objectName || ''}" placeholder="e.g., Beaker, Conical" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Volume (ml)</label>
                        <input type="number" name="initialState[${initialStateIndex}][volume]" value="${state.volume || ''}" placeholder="0" min="0" step="0.1" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Temperature (°C)</label>
                        <input type="number" name="initialState[${initialStateIndex}][temperature]" value="${state.temperature || ''}" placeholder="20" min="-273" step="0.1" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2c3e50;">Contents (comma-separated)</label>
                        <input type="text" name="initialState[${initialStateIndex}][contents]" value="${Array.isArray(state.contents) ? state.contents.join(', ') : (state.contents || '')}" placeholder="e.g., water, acid" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div>
                        <button type="button" onclick="this.closest('.initial-state-item').remove()" style="padding: 8px 15px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Remove</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
            initialStateIndex++;
        });
    }
}
