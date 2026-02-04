# How to Perform "Acid-Base Indicator Color Change" Experiment

## Starting the Experiment

1. **Open the experiment page** - You should see the experiment interface with the 3D lab bench
2. **Click "Start Experiment"** button (pink/purple gradient button)
3. The experiment will begin and show Step 1 instructions

---

## Step-by-Step Instructions

### Step 1: Add Labware to the Scene

**Before you can do anything, you need to add the labware to the 3D scene:**

1. **Click the "Labware" button** (purple button in the sidebar)
2. A modal window will open showing available labware
3. **Add the following labware** (click each one):
   - **Graduated Cylinder** - for measuring water
   - **Beaker** - main container for the experiment
   - **Test Tube** (click 3 times) - for indicator, acid, and base solutions
   - **Glass Rod** - for transferring liquid
   - **Spirit Lamp** - for heating
   - **Burner Stand** - to hold the beaker while heating

4. **Close the labware modal** after adding all items
5. You should now see all the labware on the lab bench in the 3D scene

---

### Step 2: Measure Water in Cylinder

**Current Step should show:** "Measure 50 mL of water in the graduated cylinder"

**What to do:**
- The cylinder should already have 50 mL of water (configured in initial state)
- If not, you may need to verify the initial state was configured correctly
- **Drag the cylinder** to move it (this satisfies the "drag" action requirement)
- **Click "Validate Step"** to check if Step 1 is complete

---

### Step 3: Pour Water from Cylinder to Beaker

**Current Step should show:** "Pour water from the graduated cylinder into the beaker"

**How to pour:**
1. **Click and hold** on the graduated cylinder in the 3D scene
2. **Drag the cylinder** and **tilt it toward the beaker**
3. When the cylinder is tilted toward the beaker, a **modal window will appear** asking:
   - "How much liquid to pour? (ml)"
4. **Enter the amount** (e.g., `50` for 50 mL)
5. **Click "Pour"** button
6. The liquid will transfer from cylinder to beaker
7. **Click "Validate Step"** to check if:
   - Beaker contains water
   - Volume is approximately 50 mL

---

### Step 4: Transfer Indicator with Glass Rod

**Current Step should show:** "Use the glass rod to transfer indicator solution from test tube to beaker"

**How to use the glass rod:**
1. **Position the glass rod** between the test tube (with indicator) and the beaker:
   - Click and drag the glass rod to move it near both containers
   - The rod should be close to both the test tube and the beaker

2. **Transfer liquid FROM test tube TO rod:**
   - Make sure the glass rod is near the test tube with indicator
   - In the sidebar, find the **"Glass Rod Controls"** section
   - Click the **"Fill"** button
   - This transfers liquid from the nearby test tube to the glass rod

3. **Transfer liquid FROM rod TO beaker:**
   - Move the glass rod near the beaker (or it should already be there)
   - Click the **"Draw"** button
   - This transfers liquid from the glass rod to the beaker
   - The indicator solution will mix with water, creating a yellow solution

4. **Click "Validate Step"** to check if:
   - Beaker contains `indicator_solution`
   - Volume is greater than 40 mL

---

### Step 5: Heat the Beaker

**Current Step should show:** "Place beaker on burner stand and heat using spirit lamp until temperature > 80°C"

**How to heat:**
1. **Position the beaker on the burner stand:**
   - Drag the beaker onto the burner stand
   - The beaker should be placed on top of the stand

2. **Activate the spirit lamp:**
   - Drag the spirit lamp near the beaker/burner stand
   - Or click on the spirit lamp to activate it

3. **Increase the temperature:**
   - In the sidebar, find the **"Controls"** section
   - Use the **Temperature slider** (0°C to 200°C)
   - **Drag the slider to 85°C or higher** (above 80°C)
   - As temperature increases, the solution color should change to orange

4. **Wait for the color change:**
   - When temperature exceeds 80°C, the indicator solution should turn orange
   - You can see the color change in the 3D beaker

5. **Click "Validate Step"** to check if:
   - Temperature is greater than 80°C
   - Color has changed to orange

---

### Step 6: Add Acid with Glass Rod

**Current Step should show:** "Use glass rod to transfer acid solution from test tube to the heated beaker"

**How to add acid:**
1. **Position the glass rod** between the test tube (with acid) and the beaker

2. **Transfer acid FROM test tube TO rod:**
   - Make sure glass rod is near the test tube containing acid
   - Click **"Fill"** button in Glass Rod Controls

3. **Transfer acid FROM rod TO beaker:**
   - Make sure glass rod is near the beaker
   - Click **"Draw"** button
   - The acid will mix with the heated indicator solution
   - The solution should turn pink/red (acidic solution)

4. **Click "Validate Step"** to check if:
   - Beaker contains `acidic_solution`
   - Final color is pink

---

## Tips and Troubleshooting

### If the pour modal doesn't appear:
- Make sure you're **tilting the container** (not just dragging)
- The container must be **tilted toward another container**
- Try tilting more dramatically

### If glass rod doesn't work:
- Make sure the glass rod is **close to both containers**
- Try moving the rod closer to the containers
- The "Fill" and "Draw" buttons only work when the rod is near containers

### If temperature doesn't change:
- Use the **Temperature slider** in the Controls section
- Make sure the spirit lamp is activated/positioned correctly
- The temperature change should be visible in the Measurements section

### If color doesn't change:
- Make sure you've configured the **chemical reactions** correctly in the admin panel
- Check that the **initial state colors** are set correctly
- The color change happens automatically when reactions occur

### If validation fails:
- Check the **Feedback** section in the sidebar - it will show what's wrong
- Make sure you've completed all required actions
- Verify the conditions match what's configured in the experiment steps

---

## Understanding the Interface

### Sidebar Sections:
- **Progress**: Shows your score and step progress
- **Current Step**: Shows instructions for the current step
- **Action Buttons**: Start, Reset, Validate, Labware, Back to Home
- **Feedback**: Shows validation results and error messages
- **Measurements**: Shows temperature, volume, time for selected objects
- **Controls**: Temperature slider, volume input, timer controls
- **Glass Rod Controls**: Fill and Draw buttons for liquid transfer

### 3D Scene Controls:
- **Left-click and drag**: Move objects (containers, labware)
- **Right-click and drag**: Rotate the camera view
- **Scroll wheel**: Zoom in/out
- **Click on objects**: Select them (shows measurements in sidebar)

---

## Completing the Experiment

1. **Complete all steps** by following the instructions
2. **Validate each step** after completing it
3. **Check your progress** in the Progress section
4. **View your final score** when all steps are complete

**Good luck with your experiment!** 🧪

