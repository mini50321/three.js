# How to Perform "Mixing Two Colored Solutions" Experiment

## Starting the Experiment

1. **Open the experiment page** - Navigate to `experiment.html` in your browser
2. **Click "Start Experiment"** button (pink/purple gradient button in the sidebar)
3. The experiment will begin and show Step 1 instructions in the "Current Step" section

---

## Step-by-Step Instructions

### Step 0: Add Labware to the Scene

**Before you can do anything, you need to add the labware to the 3D scene:**

1. **Click the "Labware" button** (green/purple button in the sidebar)
2. A modal window will open showing available labware
3. **Add the following labware** (click each one):
   - **Graduated Cylinder** - starts with 50ml blue water
   - **Beaker** - starts empty
   - **Test Tube** - starts with 20ml yellow solution
   - **Dropper** - for transferring liquids
   - **Stirring Rod** or **Glass Rod** - for stirring

4. **Close the labware modal** after adding all items
5. You should now see all the labware on the lab bench in the 3D scene

---

### Step 1: Pour Water from Cylinder to Beaker

**Current Step should show:** "Tilt the graduated cylinder and pour 50ml of water into the beaker"

**What you'll see:**
- A graduated cylinder with 50ml of blue water
- An empty beaker

**How to pour:**
1. **Click and hold** on the graduated cylinder in the 3D scene
2. **Drag the cylinder** toward the beaker
3. **Tilt the cylinder** by moving your mouse while holding (the cylinder will tilt)
4. When the cylinder is tilted toward the beaker, a **modal window will appear** asking:
   - "How much liquid to pour? (ml)"
5. **Enter**: `50` (or click the suggested amount)
6. **Click "Pour"** button
7. The blue water will flow from the cylinder into the beaker
8. The beaker now shows blue water (50ml)

**Visual Result:**
- Cylinder: Empty (0ml)
- Beaker: Full of blue water (50ml)

**After completing:**
- **Click "Validate Step"** button to check if Step 1 is complete
- Check the **Feedback** section for validation results

---

### Step 2: Transfer Yellow Solution Using Dropper

**Current Step should show:** "Use the dropper to transfer 10ml of yellow solution from the test tube to the beaker"

**What you'll see:**
- A test tube with 20ml of yellow solution
- A beaker with 50ml of blue water
- A dropper on the table

**How to use the dropper:**
1. **Click on the Dropper** in the 3D scene to select it
2. **Drag the dropper** near the test tube (with yellow solution)
   - Make sure the dropper is close to the test tube (within 2-3 units)
3. In the sidebar, find the **"Transfer Tool Controls"** section
   - It will say "Dropper Controls" or "Transfer Tool Controls"
4. **Click the "Fill" button**
   - This draws yellow solution from the test tube into the dropper
   - You'll see the dropper fill with yellow liquid
5. **Drag the dropper** near the beaker (with blue water)
   - Position it close to the beaker
6. **Click the "Draw" button**
   - This releases the yellow solution from the dropper into the beaker
   - The yellow solution will mix with the blue water
   - At this point, you might see both colors (blue and yellow) in the beaker

**Visual Result:**
- Test Tube: Now has ~10ml yellow solution (20ml - 10ml = 10ml)
- Beaker: Has ~60ml total (50ml blue water + 10ml yellow solution)
- The beaker shows both blue and yellow colors (not yet fully mixed)

**After completing:**
- **Click "Validate Step"** button
- Check the **Feedback** section

---

### Step 3: Stir the Solution

**Current Step should show:** "Stir the solution in the beaker to mix the blue and yellow solutions"

**What you'll see:**
- A beaker with blue and yellow liquids (not fully mixed yet)
- A stirring rod or glass rod available

**How to stir:**
1. **Click on the Stirring Rod** (or Glass Rod) in the 3D scene to select it
2. **Position the rod** above or inside the beaker
   - Drag it so it's over the beaker
3. **Click and hold** on the rod
4. **Drag in a circular motion** over the beaker
   - Move your mouse in circles while holding the button
   - The rod will move in a circular pattern
5. Continue stirring for 2-3 seconds
6. The blue and yellow solutions will mix together
7. The color will change from blue+yellow to **green** (blue + yellow = green)

**Visual Result:**
- Beaker: Contains ~60ml of **green solution** (fully mixed)
- The liquid is uniform green color (no separate blue/yellow visible)

**Why it turns green:**
- This is a chemical reaction: `water + yellow_solution = mixed_solution (green)`
- The system detects both contents in the beaker and triggers the reaction
- The reaction changes the content type to `mixed_solution` and color to green

**After completing:**
- **Click "Validate Step"** button
- Check the **Feedback** section

---

### Step 4: Pour Solution into Test Tube

**Current Step should show:** "Tilt the beaker and pour 30ml of the green solution into the test tube"

**What you'll see:**
- A beaker with 60ml of green solution
- A test tube with 10ml of yellow solution remaining

**How to pour:**
1. **Click and hold** on the beaker in the 3D scene
2. **Drag the beaker** toward the test tube
3. **Tilt the beaker** by moving your mouse while holding
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

**After completing:**
- **Click "Validate Step"** button
- Check the **Feedback** section

---

### Step 5: Shake the Test Tube

**Current Step should show:** "Shake the test tube to mix the solution"

**What you'll see:**
- A test tube with yellow and green solutions (not fully mixed)

**How to shake:**
1. **Click on the test tube** in the 3D scene to select it
2. **Click and hold** on the test tube
3. **Drag rapidly back and forth** (left-right-left-right motion)
   - Move your mouse quickly in a horizontal line
   - The test tube will shake back and forth
4. Continue shaking for 2-3 seconds
5. The yellow and green solutions will mix together
6. The solution becomes uniform (fully mixed)

**Visual Result:**
- Test Tube: Contains ~40ml of fully mixed solution
- The liquid is uniform (yellow and green have mixed)

**After completing:**
- **Click "Validate Step"** button
- Check the **Feedback** section

---

## Tips and Troubleshooting

### If the pour modal doesn't appear:
- Make sure you're **tilting the container** (not just dragging)
- The container must be **tilted toward another container**
- Try tilting more dramatically
- Make sure containers are close together (within 15 units)

### If dropper "Fill" or "Draw" buttons don't work:
- Make sure the dropper is **close to the container** (within 2-3 units)
- Select the dropper first (click on it)
- The "Transfer Tool Controls" section should appear in the sidebar
- Try moving the dropper closer to the container

### If solution doesn't turn green after stirring:
- Make sure the **chemical reaction is configured** correctly in admin panel
- Check that reactants are: `water, yellow_solution` (exact spelling)
- Make sure both contents are in the beaker before stirring
- The reaction should trigger automatically when both are present

### If shaking doesn't work:
- Make sure you're **rapidly moving** the test tube back and forth
- The motion must be detected by the system
- Try shaking for at least 2-3 seconds
- Make sure the test tube is selected

### If validation fails:
- Check the **Feedback** section in the sidebar - it will show what's wrong
- Make sure you completed the action (pour, stir, shake, etc.)
- Verify the volume is correct (check Measurements section)
- Make sure the correct content type is in the container

---

## Understanding the Interface

### Sidebar Sections:
- **Progress**: Shows your score and step progress
- **Current Step**: Shows instructions for the current step
- **Action Buttons**: Start, Reset, Validate Step, Labware, Back to Home
- **Feedback**: Shows validation results and error messages
- **Measurements**: Shows temperature, volume, weight, time for selected objects
- **Controls**: Temperature slider, volume input, timer controls
- **Transfer Tool Controls**: Fill and Draw buttons for dropper (appears when dropper is selected)
- **Scale Controls**: Weigh button (appears when object is on scale)

### 3D Scene Controls:
- **Left-click and drag**: Move objects (containers, labware)
- **Right-click and drag**: Rotate the camera view (eye-level, no top/bottom views)
- **Scroll wheel**: Zoom in/out
- **Click on objects**: Select them (shows measurements in sidebar)
- **Click and hold + tilt**: Pour liquids from containers
- **Circular motion with rod**: Stir solutions
- **Rapid back-and-forth motion**: Shake test tubes

---

## Completing the Experiment

1. **Complete all 5 steps** by following the instructions above
2. **Validate each step** after completing it (click "Validate Step" button)
3. **Check your progress** in the Progress section
4. **View your final score** when all steps are complete

## Experiment Summary

This experiment demonstrates:
- ✅ **Tilt & Pour**: Steps 1, 4 (tilting containers to pour liquids)
- ✅ **Transfer with Dropper**: Step 2 (using dropper to transfer solutions)
- ✅ **Stirring**: Step 3 (stirring to mix solutions)
- ✅ **Shaking**: Step 5 (shaking test tube to mix)
- ✅ **Mixing**: Steps 3, 5 (mixing through stirring and shaking)
- ✅ **Color Changes**: Blue + Yellow = Green (visual feedback)

**Total Steps**: 5
**Estimated Time**: 5-10 minutes

**Good luck with your experiment!** 🧪

