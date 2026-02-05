# Simple Chemical Experiment: "Mixing Two Solutions"
## Complete Detailed Guide

---

## Overview
A very simple experiment that demonstrates all required interactions: **tilt, pour, mixing, shaking, stirring, and transferring chemicals using a dropper**.

**Experiment Title**: "Mixing Two Colored Solutions"

**Difficulty**: Beginner
**Duration**: 5-10 minutes
**Total Steps**: 5

---

## Part 1: What You Need (Labware)

### Required Labware:
1. **Graduated Cylinder** - 1 piece (starts with 50ml blue water)
2. **Beaker** - 1 piece (starts empty)
3. **Test Tube** - 1 piece (starts with 20ml yellow solution)
4. **Dropper** - 1 piece (for transferring liquids)
5. **Stirring Rod** or **Glass Rod** - 1 piece (for stirring)

---

## Part 2: Step-by-Step Instructions (What Students Will Do)

### Step 1: Pour Water from Cylinder to Beaker

**What the student sees:**
- A graduated cylinder on the lab table with 50ml of blue water
- An empty beaker nearby

**What the student needs to do:**
1. **Click and hold** on the graduated cylinder
2. **Drag the cylinder** toward the beaker
3. **Tilt the cylinder** by moving the mouse while holding (the cylinder will tilt)
4. When the cylinder is tilted toward the beaker, a **modal window appears** asking:
   - "How much liquid to pour? (ml)"
5. **Enter**: `50` (or click the suggested amount)
6. **Click "Pour"** button
7. The blue water will flow from the cylinder into the beaker
8. The beaker now shows blue water (50ml)

**Visual Result:**
- Cylinder: Empty (0ml)
- Beaker: Full of blue water (50ml)

**Action Type**: `pour`
**Equipment**: `graduated Cylinder`

---

### Step 2: Transfer Yellow Solution Using Dropper

**What the student sees:**
- A test tube with 20ml of yellow solution
- A beaker with 50ml of blue water
- A dropper available on the table

**What the student needs to do:**
1. **Click on the Dropper** to select it
2. **Drag the dropper** near the test tube (with yellow solution)
3. In the sidebar, find the **"Transfer Tool Controls"** section (it will say "Dropper Controls")
4. **Click the "Fill" button**
   - This draws yellow solution from the test tube into the dropper
   - You'll see the dropper fill with yellow liquid
5. **Drag the dropper** near the beaker (with blue water)
6. **Click the "Draw" button**
   - This releases the yellow solution from the dropper into the beaker
   - The yellow solution will mix with the blue water
   - At this point, you might see both colors (blue and yellow) in the beaker

**Visual Result:**
- Test Tube: Now has ~10ml yellow solution (20ml - 10ml = 10ml)
- Beaker: Has ~60ml total (50ml blue water + 10ml yellow solution)
- The beaker shows both blue and yellow colors (not yet fully mixed)

**Action Type**: `drag`
**Equipment**: `Dropper`

---

### Step 3: Stir the Solution

**What the student sees:**
- A beaker with blue and yellow liquids (not fully mixed yet)
- A stirring rod or glass rod available

**What the student needs to do:**
1. **Click on the Stirring Rod** (or Glass Rod) to select it
2. **Position the rod** above or inside the beaker
3. **Click and hold** on the rod
4. **Drag in a circular motion** over the beaker
   - Move the mouse in circles while holding the button
   - The rod will move in a circular pattern
5. Continue stirring for 2-3 seconds
6. The blue and yellow solutions will mix together
7. The color will change from blue+yellow to **green** (blue + yellow = green)

**Visual Result:**
- Beaker: Contains ~60ml of **green solution** (fully mixed)
- The liquid is uniform green color (no separate blue/yellow visible)

**Action Type**: `stir`
**Equipment**: `Stirring Rod` or `Glass_Rod`

**Why it turns green:**
- This is a chemical reaction: `water + yellow_solution = mixed_solution (green)`
- The system detects both contents in the beaker and triggers the reaction
- The reaction changes the content type to `mixed_solution` and color to green

---

### Step 4: Pour Solution into Test Tube

**What the student sees:**
- A beaker with 60ml of green solution
- A test tube with 10ml of yellow solution remaining

**What the student needs to do:**
1. **Click and hold** on the beaker
2. **Drag the beaker** toward the test tube
3. **Tilt the beaker** by moving the mouse while holding
4. When the beaker is tilted toward the test tube, a **modal window appears** asking:
   - "How much liquid to pour? (ml)"
5. **Enter**: `30` (or click the suggested amount)
6. **Click "Pour"** button
7. The green solution will flow from the beaker into the test tube
8. The test tube now contains both yellow and green solutions

**Visual Result:**
- Beaker: Now has ~30ml green solution (60ml - 30ml = 30ml)
- Test Tube: Has ~40ml total (10ml yellow + 30ml green)
- The test tube shows both yellow and green colors (not yet fully mixed)

**Action Type**: `pour`
**Equipment**: `Beaker`

---

### Step 5: Shake the Test Tube

**What the student sees:**
- A test tube with yellow and green solutions (not fully mixed)

**What the student needs to do:**
1. **Click on the test tube** to select it
2. **Click and hold** on the test tube
3. **Drag rapidly back and forth** (left-right-left-right motion)
   - Move the mouse quickly in a horizontal line
   - The test tube will shake back and forth
4. Continue shaking for 2-3 seconds
5. The yellow and green solutions will mix together
6. The solution becomes uniform (fully mixed)

**Visual Result:**
- Test Tube: Contains ~40ml of fully mixed solution
- The liquid is uniform (yellow and green have mixed)

**Action Type**: `shake`
**Equipment**: `TestTube`

---

## Part 3: Admin Panel Configuration (How to Set Up)

### A. Create the Experiment

1. Go to the **Admin Panel**
2. Click **"Create New Experiment"**
3. Fill in:
   - **Experiment ID**: `mixing_solutions_001`
   - **Title**: `Mixing Two Colored Solutions`
   - **Subject**: `Chemistry`
   - **Class**: `Grade 7` (or your choice)

---

### B. Add Required Models

Click **"Add Model"** for each:

1. **Graduated Cylinder**
   - **Model Path**: `assets/models/graduated Cylinder.glb` (or your path)
   - **Properties**: 
     - `isContainer: true`
     - `capacity: 100`

2. **Beaker**
   - **Model Path**: `assets/models/Beaker.glb`
   - **Properties**: 
     - `isContainer: true`
     - `capacity: 200`

3. **Test Tube**
   - **Model Path**: `assets/models/TestTube.glb`
   - **Properties**: 
     - `isContainer: true`
     - `capacity: 50`

4. **Dropper**
   - **Model Path**: `assets/models/Dropper.glb`
   - **Properties**: 
     - `isContainer: false`
     - `isTransferTool: true`

5. **Stirring Rod** or **Glass Rod**
   - **Model Path**: `assets/models/Glass_Rod.glb` (or Stirring_Rod.glb)
   - **Properties**: 
     - `isContainer: false`
     - `isStirringTool: true`

---

### C. Configure Initial State

Click **"Add Initial State"** for each:

#### 1. Graduated Cylinder
- **Object Name**: `graduated Cylinder` (exact name from model)
- **Volume (ml)**: `50`
- **Temperature (°C)**: `20`
- **Contents**: `water`
- **Initial Color**: `#2196f3` (blue)
- **After Boiling**: `#2196f3`
- **After Cooling**: `#2196f3`

#### 2. Beaker
- **Object Name**: `Beaker`
- **Volume (ml)**: `0`
- **Temperature (°C)**: `20`
- **Contents**: (leave empty)
- **Initial Color**: (leave empty - no liquid)

#### 3. Test Tube
- **Object Name**: `TestTube`
- **Volume (ml)**: `20`
- **Temperature (°C)**: `20`
- **Contents**: `yellow_solution`
- **Initial Color**: `#ffeb3b` (yellow)
- **After Boiling**: `#ffeb3b`
- **After Cooling**: `#ffeb3b`

---

### D. Configure Chemical Reaction

Click **"Add Reaction"**:

**Reaction: Water + Yellow Solution = Green Mixed Solution**
- **Reactants**: `water, yellow_solution`
  - Enter: `water` in first field
  - Click "+" to add second reactant
  - Enter: `yellow_solution` in second field
- **Result Type**: `mixed_solution`
- **Result Color**: `#4caf50` (green)
- **Message**: `"Solutions mixed - color changed to green"`
- **Min Temperature**: (leave empty or `0`)
- **Max Temperature**: (leave empty or `100`)

**How it works:**
- When both `water` and `yellow_solution` are in the same container
- The system detects the reaction
- Changes the contents to `mixed_solution`
- Changes the color to green (#4caf50)

---

### E. Configure Experiment Steps

#### Step 1: Pour Water from Cylinder to Beaker

1. Click **"Add Step"**
2. Fill in:
   - **Step Order**: `1`
   - **Instruction**: `"Tilt the graduated cylinder and pour 50ml of water into the beaker"`
   - **Equipment**: `graduated Cylinder` (exact name)
   - **Action**: Select `pour` from dropdown
   - **Points**: `10`

3. Click **"Configure Rules & Scoring"** button (grey button with gear icon)

4. **Add Volume Rule:**
   - Scroll to **"💧 Volume Rule"** section
   - **Target Volume (ml)**: `50`
   - **Tolerance (ml)**: `5` (allows 45-55ml range)
   - **Points**: `10`

5. **Add Content Rule:**
   - Scroll to bottom, click **"+ Add Custom Condition"**
   - **Type**: Select `Has Content`
   - **Value**: Enter `water`
   - **Points**: `5`
   - **Custom Message**: `"Beaker should contain water"`

6. Click **"Save Rules"**

---

#### Step 2: Transfer Yellow Solution Using Dropper

1. Click **"Add Step"**
2. Fill in:
   - **Step Order**: `2`
   - **Instruction**: `"Use the dropper to transfer 10ml of yellow solution from the test tube to the beaker"`
   - **Equipment**: `Dropper` (exact name)
   - **Action**: Select `drag` from dropdown
   - **Points**: `10`

3. Click **"Configure Rules & Scoring"**

4. **Add Volume Rule:**
   - **Target Volume (ml)**: `60` (50ml water + 10ml yellow)
   - **Tolerance (ml)**: `5` (allows 55-65ml)
   - **Points**: `10`

5. **Add Content Rule:**
   - Click **"+ Add Custom Condition"**
   - **Type**: `Has Content`
   - **Value**: `yellow_solution` (or `water` if reaction hasn't triggered yet)
   - **Points**: `5`
   - **Custom Message**: `"Beaker should contain yellow solution"`

6. Click **"Save Rules"**

---

#### Step 3: Stir the Solution

1. Click **"Add Step"**
2. Fill in:
   - **Step Order**: `3`
   - **Instruction**: `"Stir the solution in the beaker to mix the blue and yellow solutions"`
   - **Equipment**: `Stirring Rod` or `Glass_Rod` (exact name)
   - **Action**: Select `stir` from dropdown
   - **Points**: `15`

3. Click **"Configure Rules & Scoring"**

4. **Add Content Rule (Green Solution):**
   - Click **"+ Add Custom Condition"**
   - **Type**: `Has Content`
   - **Value**: `mixed_solution` (this is the result of the reaction)
   - **Points**: `10`
   - **Custom Message**: `"Solution should be mixed (green color)"`

5. **Add Volume Rule:**
   - **Target Volume (ml)**: `60`
   - **Tolerance (ml)**: `5`
   - **Points**: `5`

6. Click **"Save Rules"**

---

#### Step 4: Pour Solution into Test Tube

1. Click **"Add Step"**
2. Fill in:
   - **Step Order**: `4`
   - **Instruction**: `"Tilt the beaker and pour 30ml of the green solution into the test tube"`
   - **Equipment**: `Beaker` (exact name)
   - **Action**: Select `pour` from dropdown
   - **Points**: `10`

3. Click **"Configure Rules & Scoring"**

4. **Add Volume Rule (for Test Tube):**
   - **Target Volume (ml)**: `30`
   - **Tolerance (ml)**: `5` (allows 25-35ml)
   - **Points**: `10`
   - **Note**: Make sure to check the test tube, not the beaker

5. **Add Content Rule:**
   - Click **"+ Add Custom Condition"**
   - **Type**: `Has Content`
   - **Value**: `mixed_solution`
   - **Points**: `5`
   - **Custom Message**: `"Test tube should contain green solution"`

6. Click **"Save Rules"**

---

#### Step 5: Shake the Test Tube

1. Click **"Add Step"**
2. Fill in:
   - **Step Order**: `5`
   - **Instruction**: `"Shake the test tube to mix the solution"`
   - **Equipment**: `TestTube` (exact name)
   - **Action**: Select `shake` from dropdown
   - **Points**: `10`

3. Click **"Configure Rules & Scoring"**

4. **Add Content Rule:**
   - Click **"+ Add Custom Condition"**
   - **Type**: `Has Content`
   - **Value**: `mixed_solution` (or just check that it has contents)
   - **Points**: `10`
   - **Custom Message**: `"Test tube should be shaken and mixed"`

5. Click **"Save Rules"**

---

### F. Save the Experiment

1. Scroll to bottom of admin panel
2. Click **"Save Experiment"** button
3. The experiment is now ready to use!

---

## Part 4: What Students Will See (Visual Flow)

### Initial State:
- **Cylinder**: Blue water (50ml) - visible as blue liquid in cylinder
- **Beaker**: Empty - no liquid visible
- **Test Tube**: Yellow solution (20ml) - visible as yellow liquid in test tube

### After Step 1 (Pour):
- **Cylinder**: Empty - no liquid
- **Beaker**: Blue water (50ml) - blue liquid visible
- **Test Tube**: Yellow solution (20ml) - unchanged

### After Step 2 (Dropper Transfer):
- **Cylinder**: Empty
- **Beaker**: Blue water (50ml) + Yellow solution (10ml) - both colors visible, not mixed
- **Test Tube**: Yellow solution (10ml) - reduced from 20ml

### After Step 3 (Stir):
- **Cylinder**: Empty
- **Beaker**: Green solution (60ml) - uniform green color (fully mixed)
- **Test Tube**: Yellow solution (10ml)

### After Step 4 (Pour to Test Tube):
- **Cylinder**: Empty
- **Beaker**: Green solution (30ml) - reduced from 60ml
- **Test Tube**: Yellow solution (10ml) + Green solution (30ml) - both colors visible

### After Step 5 (Shake):
- **Cylinder**: Empty
- **Beaker**: Green solution (30ml)
- **Test Tube**: Mixed solution (40ml) - uniform color

---

## Part 5: Troubleshooting

### Problem: Pour modal doesn't appear
**Solution:**
- Make sure you're **tilting** the container, not just dragging
- The container must be tilted **toward another container**
- Try tilting more dramatically
- Make sure containers are close together (within 15 units)

### Problem: Dropper "Fill" button doesn't work
**Solution:**
- Make sure the dropper is **close to the test tube** (within 2-3 units)
- Select the dropper first (click on it)
- The "Transfer Tool Controls" section should appear in the sidebar
- Try moving the dropper closer to the container

### Problem: Solution doesn't turn green after stirring
**Solution:**
- Make sure the **chemical reaction is configured** correctly in admin panel
- Check that reactants are: `water, yellow_solution` (exact spelling)
- Make sure both contents are in the beaker before stirring
- The reaction should trigger automatically when both are present

### Problem: Validation fails
**Solution:**
- Check the **Feedback** section in the sidebar - it shows what's wrong
- Make sure you completed the action (pour, stir, etc.)
- Verify the volume is correct (check Measurements section)
- Make sure the correct content type is in the container

### Problem: Test tube shaking doesn't register
**Solution:**
- Make sure you're **rapidly moving** the test tube back and forth
- The motion must be detected by the system
- Try shaking for at least 2-3 seconds
- Make sure the test tube is selected

---

## Part 6: Summary

### Interactions Demonstrated:
✅ **Tilt**: Steps 1, 4 (tilting containers to pour)
✅ **Pour**: Steps 1, 4 (pouring between containers)
✅ **Transfer with Dropper**: Step 2 (using dropper to transfer)
✅ **Stirring**: Step 3 (stirring to mix solutions)
✅ **Shaking**: Step 5 (shaking test tube)
✅ **Mixing**: Steps 3, 5 (mixing through stirring and shaking)

### Total Steps: 5
### Total Time: 5-10 minutes
### Difficulty: Beginner

This experiment is perfect for teaching basic lab skills while keeping it simple and visual!

