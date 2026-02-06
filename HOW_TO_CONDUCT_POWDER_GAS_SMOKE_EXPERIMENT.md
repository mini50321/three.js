# How to Conduct the Powder, Gas, and Smoke Experiment

## Step-by-Step Instructions

This guide shows you exactly how to perform the experiment in the application interface.

---

## Prerequisites

1. **Open the experiment page** in your browser
2. That's it! No console needed - everything is done through UI buttons

---

## Step 1: Add a Beaker to the Scene

1. **Click the "Labware" button** in the sidebar (green/purple gradient button)
2. **Find and click "Beaker"** in the labware modal
3. The beaker will appear on the lab table in the 3D scene
4. **Close the labware modal** by clicking outside it or pressing ESC

**Result**: You should see a beaker on the lab table.

---

## Step 2: Add Acid (Liquid) to the Beaker

1. **Click on the beaker** in the 3D scene to select it
2. In the sidebar, you'll see a new section **"Add Chemical"**
3. **Select "Acid"** from the dropdown menu
4. **Type `50`** in the amount field (or leave default 50)
5. **Click the "Add" button**
6. The beaker should now show **red/pink liquid** (acid)

**Result**: Beaker contains 50ml of acid (red/pink liquid).

---

## Step 3: Add Carbonate Powder to the Beaker

1. **Make sure the beaker is still selected**
2. In the sidebar, you'll see a new section **"Add Powder"**
3. **Select "Carbonate"** from the dropdown menu (it's already selected by default)
4. **Type `10`** in the mass field (or leave default 10)
5. **Click the "Add" button**
6. You should now see:
   - **Red/pink liquid** (acid) at the top
   - **White/gray solid cylinder** (powder) at the bottom of the beaker

**Result**: Powder is added to the beaker and visualized as a solid cylinder.

---

## Step 4: Trigger the Chemical Reaction (Creates Gas)

1. **Make sure the beaker is still selected**
2. In the sidebar, you'll see a new section **"Chemical Reaction"**
3. **Click the "Check & Trigger Reaction" button**
4. A message will appear showing the reaction status

**What happens**:
- Acid and carbonate react
- **CO₂ gas** is created
- **Smoke particles** automatically appear above the beaker
- Smoke particles rise upward
- Status message shows: "Reaction occurred: Acid reacts with carbonate to produce carbon dioxide gas"

**Result**: You should see **gray smoke particles rising** from the beaker.

---

## Step 5: Heat the Beaker (Intensifies Smoke)

1. **Make sure the beaker is selected**
2. In the sidebar, find the **Temperature slider**
3. **Drag the slider to 80°C** or higher
   - You can also type a number in the temperature display
4. **Watch the smoke intensify** - more particles, faster movement

**Alternative: Use Console**

```javascript
const beaker = engine.selectedObject || engine.objects.get('Beaker');
if (beaker) {
    beaker.properties.temperature = 80;
    engine.updateEffects(beaker);
    console.log('Beaker heated to 80°C');
}
```

**Result**: Smoke becomes more intense and visible.

---

## Step 6: Observe Gas Escape

1. **Watch the beaker** - you don't need to do anything
2. **Observe**:
   - Smoke particles continue rising
   - Gas volume decreases over time (gas escapes from unsealed container)
   - Smoke continues until all gas is gone

**To check gas volume in console**:

```javascript
const beaker = engine.selectedObject || engine.objects.get('Beaker');
if (beaker) {
    const gasContent = engine.getGasContent(beaker);
    console.log('Gas content:', gasContent);
    console.log('Has gas:', engine.hasGasContent(beaker));
    console.log('Has smoke effect:', engine.effects.has(beaker.name + '_smoke'));
}
```

**Result**: Over time, gas escapes and smoke eventually disappears when gas is gone.

---

## Quick Setup Summary

Follow these steps in order:

1. **Add Beaker** → Labware button → Click "Beaker"
2. **Select Beaker** → Click on the beaker in the 3D scene
3. **Add Acid** → "Add Chemical" section → Select "Acid" → Enter 50ml → Click "Add"
4. **Add Powder** → "Add Powder" section → Select "Carbonate" → Enter 10g → Click "Add"
5. **Trigger Reaction** → "Chemical Reaction" section → Click "Check & Trigger Reaction"
6. **Heat Beaker** → Temperature slider → Drag to 80°C
7. **Observe** → Watch smoke rise as gas escapes

---

## What You Should See

### Visual Results:

1. **Liquid (Acid)**: 
   - Red/pink colored cylinder in the beaker
   - Takes up space based on volume

2. **Powder (Carbonate)**:
   - White/gray solid cylinder at the bottom
   - Appears as a solid material (not liquid)

3. **Gas (CO₂)**:
   - Not directly visible as a liquid
   - Creates smoke particles that rise upward

4. **Smoke Effect**:
   - Gray particles rising from the beaker
   - More intense at higher temperatures
   - Disappears when gas is gone

---

## Troubleshooting

### No Smoke Appearing?
- Check if gas exists: Run `engine.hasGasContent(beaker)` in console
- Manually trigger effects: `engine.updateEffects(beaker)`
- Check if reaction occurred: Look at beaker contents in console

### Powder Not Showing?
- Check if powder mesh exists: `engine.powderMeshes.has(beaker.name)`
- Manually update: `engine.updatePowderMesh(beaker)`
- Check contents: `beaker.properties.contents` should have an item with `mass` property

### Reaction Not Happening?
- Make sure both acid and carbonate are present
- Check contents: `console.log(beaker.properties.contents)`
- Manually check reaction: `engine.checkChemicalReaction(beaker)`

### Can't See the Beaker?
- Use mouse to rotate the view (drag)
- Scroll to zoom in/out
- Click "Reset View" button if available

---

## Summary

**The experiment demonstrates:**

1. ✅ **Powder**: Stored with mass, visualized as solid cylinder
2. ✅ **Gas**: Created from reactions, escapes automatically
3. ✅ **Smoke**: Appears when gas is present, intensifies with heat
4. ✅ **All three states** can coexist in the same container

**Key Actions:**
- Add beaker (Labware button)
- Add acid (Volume input or console)
- Add powder (Console only - no UI button yet)
- Trigger reaction (Console - automatic when mixing)
- Heat container (Temperature slider)
- Observe smoke (Automatic when gas present)

---

## Notes

- **All controls are now available in the UI** - no console needed!
- **Gases** are created automatically from reactions
- **Smoke** appears automatically when gas is present
- All three states (solid, liquid, gas) can be in the same container simultaneously
- Gas escapes automatically from unsealed containers
- The chemical controls appear automatically when you select a container

