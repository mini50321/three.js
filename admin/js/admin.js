let stepIndex = document.querySelectorAll('.step').length || 0;

function addStep() {
    const div = document.createElement('div');
    div.className = 'step';
    div.innerHTML = `
        <input name="steps[${stepIndex}][instruction]" placeholder="Instruction">
        <input name="steps[${stepIndex}][equipment]" placeholder="Equipment">
        <select name="steps[${stepIndex}][action]">
            <option>tilt</option>
            <option>pour</option>
            <option>heat</option>
            <option>stir</option>
        </select>
        <button type="button" onclick="this.parentNode.remove()">Remove</button>
    `;
    document.getElementById('steps').appendChild(div);
    stepIndex++;
}
