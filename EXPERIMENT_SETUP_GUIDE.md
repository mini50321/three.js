# Chemistry Experiment Setup Guide

## Recommended Experiment: "Acid-Base Indicator Color Change with Temperature Effect"

This experiment demonstrates:
- Pouring liquid between containers
- Using glass rod to transfer liquid
- Heating to observe color change
- Adding substances to cause another color change

---

## Step-by-Step Configuration in Admin Panel

### 1. Create New Experiment

1. Go to Admin Panel → "Create New Experiment"
2. Fill in basic information:
   - **Title**: "Acid-Base Indicator Color Change"
   - **Subject**: Chemistry
   - **Class**: 11

### 2. Upload 3D Models

Upload these models (if not already uploaded):
- Beaker.glb
- graduated_Cylinder_2.glb (or graduated_Cylinder_3.glb) - for measuring water
- TestTube.glb (you'll add 3 instances)
- Glass_Rod.glb
- Spirit Lamp .glb
- Burner Stand.glb

### 3. Configure Initial State

Add initial states for each container:

#### Graduated Cylinder (Water):
- **Object Name**: `graduated_Cylinder_2` (or the exact name from your model)
- **Volume (ml)**: 50
- **Temperature (°C)**: 20
- **Contents**: `water`
- **Initial Color**: `#4a90e2` (blue - water color)
- **After Boiling**: `#4a90e2` (stays blue)
- **After Cooling**: `#4a90e2` (stays blue)

#### Beaker (Empty initially):
- **Object Name**: `Beaker`
- **Volume (ml)**: 0
- **Temperature (°C)**: 20
- **Contents**: (leave empty)
- **Initial Color**: `#ffffff` (white/transparent)
- **After Boiling**: `#ffffff`
- **After Cooling**: `#ffffff`

#### Test Tube 1 (Indicator Solution):
- **Object Name**: `TestTube` (or the exact name from your model)
- **Volume (ml)**: 10
- **Temperature (°C)**: 20
- **Contents**: `indicator`
- **Initial Color**: `#ffeb3b` (yellow - indicator color)
- **After Boiling**: `#ffeb3b`
- **After Cooling**: `#ffeb3b`

#### Test Tube 2 (Acid Solution):
- **Object Name**: `TestTube` (same as Test Tube 1 - will be named "TestTube 1" automatically)
- **Volume (ml)**: 20
- **Temperature (°C)**: 20
- **Contents**: `acid`
- **Initial Color**: `#ff6b6b` (red - acid color)
- **After Boiling**: `#ff6b6b`
- **After Cooling**: `#ff6b6b`

#### Test Tube 3 (Base Solution - Optional):
- **Object Name**: `TestTube` (will be named "TestTube 2" automatically)
- **Volume (ml)**: 20
- **Temperature (°C)**: 20
- **Contents**: `base`
- **Initial Color**: `#4a90e2` (blue - base color)
- **After Boiling**: `#4a90e2`
- **After Cooling**: `#4a90e2`

### 4. Configure Chemical Reactions

Add the following reactions:

#### Reaction 1: Water + Indicator (Yellow Solution)
- **Reactants**: `water, indicator`
- **Result Type**: `indicator_solution`
- **Result Color**: `#ffeb3b` (yellow)
- **Message**: "Indicator added to water - solution turns yellow"

#### Reaction 2: Indicator Solution + Heat (Orange/Red)
- **Reactants**: `indicator_solution` (when temperature > 80°C)
- **Result Type**: `heated_indicator`
- **Result Color**: `#ff9800` (orange - heated indicator)
- **Message**: "Solution heated - color changes to orange"

#### Reaction 3: Heated Indicator + Acid (Pink/Red)
- **Reactants**: `heated_indicator, acid`
- **Result Type**: `acidic_solution`
- **Result Color**: `#e91e63` (pink - acidic solution)
- **Message**: "Acid added - solution turns pink (acidic)"

### 5. Configure Experiment Steps

Add steps in this order:

#### Step 1: Measure Water in Cylinder
- **Instruction**: "Measure 50 mL of water in the graduated cylinder"
- **Equipment**: `graduated_Cylinder_2`
- **Action**: `drag`
- **Points**: 10

#### Step 2: Pour Water to Beaker
- **Instruction**: "Pour water from the graduated cylinder into the beaker"
- **Equipment**: `graduated_Cylinder_2`
- **Action**: `pour`
- **Points**: 10
- **Rules** (How to configure these rules - see detailed instructions below):
  - Volume in beaker should be approximately 50 mL
  - Beaker should contain `water`

**HOW TO ADD THESE RULES:**

1. **After creating Step 2, click the "Configure Rules & Scoring" button** (the grey button with a gear icon below the step fields)

2. **The "Rules & Scoring Configuration" panel will open.** You'll see:
   - Step Points section
   - Temperature Rule section
   - Volume Rule section
   - Custom Conditions section

3. **For "Volume in beaker should be approximately 50 mL":**
   - Scroll to the **"💧 Volume Rule"** section
   - In **"Target Volume (ml)"** field: Enter `50`
   - In **"Tolerance (ml)"** field: Enter `5` (this allows 45-55ml range)
   - In **"Points"** field: Enter `10` (or your desired points)

4. **For "Beaker should contain water":**
   - Scroll to the bottom of the rules panel
   - Click the **"+ Add Custom Condition"** button
   - A new condition row will appear with dropdowns and input fields
   - In the **"Type"** dropdown: Select **"Has Content"**
   - In the **"Value"** field: Enter `water` (this checks for water specifically)
   - In the **"Points"** field: Enter `5` (or your desired points)
   - In the **"Custom Message (optional)"** field: Enter `"Beaker should contain water"`

5. **Save the experiment** by clicking "Save Experiment" at the bottom of the page

#### Step 3: Transfer Indicator from Test Tube with Glass Rod
- **Instruction**: "Use the glass rod to transfer indicator solution from test tube to beaker"
- **Equipment**: `Glass_Rod`
- **Action**: `drag`
- **Points**: 15
- **Rules** (How to configure):
  - Volume in beaker should be > 40 mL (water + some indicator)
  - Beaker should contain `indicator_solution`

**HOW TO ADD THESE RULES:**

1. Click **"Configure Rules & Scoring"** for Step 3

2. **For "Volume in beaker should be > 40 mL":**
   - Click **"+ Add Custom Condition"**
   - **Type**: Select **"Volume"**
   - **Operator**: Select **"Greater than (>)"**
   - **Value**: Enter `40`
   - **Tolerance**: Enter `0` or leave empty
   - **Points**: Enter `5`
   - **Custom Message**: `"Volume in beaker should be greater than 40 mL"`

3. **For "Beaker should contain indicator_solution":**
   - Click **"+ Add Custom Condition"** again
   - **Type**: Select **"Has Content"**
   - **Value**: Enter `indicator_solution` (must match the result type from Reaction 1)
   - **Points**: Enter `5`
   - **Custom Message**: `"Beaker should contain indicator solution"`

#### Step 4: Heat the Beaker
- **Instruction**: "Place beaker on burner stand and heat using spirit lamp until temperature > 80°C"
- **Equipment**: `Beaker`
- **Action**: `heat`
- **Points**: 15
- **Rules** (How to configure):
  - Temperature should be > 80°C
  - Color should change to orange (`#ff9800`)

**HOW TO ADD THESE RULES:**

1. Click **"Configure Rules & Scoring"** for Step 4

2. **For "Temperature should be > 80°C":**
   - Scroll to the **"🌡️ Temperature Rule"** section
   - In **"Target Temperature (°C)"** field: Enter `80`
   - In **"Tolerance (°C)"** field: Enter `5` (allows 75-85°C range, or use 0 for strict >80°C)
   - In **"Points"** field: Enter `10`
   - **Note**: The temperature rule checks for "approximately equal", so for "greater than 80°C", use a Custom Condition instead:
     - Click **"+ Add Custom Condition"**
     - **Type**: Select **"Temperature"**
     - **Operator**: Select **"Greater than (>)"**
     - **Value**: Enter `80`
     - **Points**: Enter `10`
     - **Custom Message**: `"Temperature should be greater than 80°C"`

3. **For "Color should change to orange":**
   - This is automatically handled by the reaction system when temperature > 80°C
   - The color change happens based on the Initial State "After Boiling" color configuration
   - No additional rule needed if you've configured the color in Initial State

#### Step 5: Transfer Acid from Test Tube with Glass Rod
- **Instruction**: "Use glass rod to transfer acid solution from test tube to the heated beaker"
- **Equipment**: `Glass_Rod`
- **Action**: `drag`
- **Points**: 15
- **Rules** (How to configure):
  - Beaker should contain `acidic_solution`
  - Final color should be pink (`#e91e63`)

**HOW TO ADD THESE RULES:**

1. Click **"Configure Rules & Scoring"** for Step 5

2. **For "Beaker should contain acidic_solution":**
   - Click **"+ Add Custom Condition"**
   - **Type**: Select **"Has Content"**
   - **Value**: Enter `acidic_solution` (must match the result type from Reaction 3)
   - **Points**: Enter `10`
   - **Custom Message**: `"Beaker should contain acidic solution"`

3. **For "Final color should be pink":**
   - This is automatically handled by Reaction 3 when acid is added to heated_indicator
   - The color change happens automatically based on the reaction configuration
   - No additional rule needed if Reaction 3 is properly configured

---

## How It Works

### Pouring Liquid
- Tilt a container with liquid toward another container
- A modal appears asking how much to pour
- Liquid transfers and reactions are checked

### Glass Rod Transfer
- Click "Fill" button to transfer liquid FROM nearby container TO the rod
- Click "Draw" button to transfer liquid FROM the rod TO nearby container
- The rod must be near both containers for this to work

### Heating
- Place container on burner stand
- Click "Turn On Spirit Lamp" button
- Container heats up gradually
- Color changes based on temperature and contents

### Color Changes
- Initial: Water is blue (in cylinder), indicator is yellow (in test tube 1), acid is red (in test tube 2)
- After pouring water to beaker: Blue water in beaker
- After mixing indicator: Yellow solution (water + indicator) in beaker
- After heating: Orange (heated indicator solution) in beaker
- After adding acid: Pink (acidic solution) in beaker

---

## Tips

1. **Object Names**: Use the exact names from your 3D model files (case-sensitive)
2. **Contents**: Use consistent substance names (e.g., `water`, `indicator`, `acid`)
3. **Reactions**: Order matters - reactions are checked in sequence
4. **Temperature Colors**: Set in Initial State configuration
5. **Testing**: Use the preview feature to test before publishing

---

## Alternative Experiment Ideas

### Option 2: "Copper Sulfate Color Change"
- Start with water + copper sulfate (blue)
- Heat to observe color change
- Add ammonia to form deep blue complex

### Option 3: "Universal Indicator pH Test"
- Water + universal indicator (green)
- Add acid → red
- Add base → blue
- Heat → observe color shift

---

## How to Add Validation Rules - Detailed Guide

### Understanding the Rules Panel

When you click **"Configure Rules & Scoring"** on any step, you'll see several sections:

1. **Step Points**: Default points for completing the step
2. **💧 Volume Rule**: Quick way to validate volume (target ± tolerance)
3. **🌡️ Temperature Rule**: Quick way to validate temperature (target ± tolerance)
4. **Custom Conditions**: Flexible validation for any condition type

### Rule Types Explained

**Volume**: Checks the volume of liquid in a container
- **Operator ">"**: Volume must be greater than value
- **Operator "<"**: Volume must be less than value  
- **Operator "=="**: Volume must equal value (within tolerance)

**Temperature**: Checks the temperature of a container
- **Operator ">"**: Temperature must be greater than value
- **Operator "<"**: Temperature must be less than value
- **Operator "=="**: Temperature must equal value (within tolerance)

**Has Content**: Checks if container contains specific substance(s)
- **Value field**: Enter the content type to check for (e.g., "water", "indicator_solution")
- Checks if the container's contents array includes this type

**Empty**: Checks if container is empty
- No value needed
- Returns true if container has no contents

### Example: Step 2 Rules Configuration

**Goal**: Validate that after pouring, the beaker has ~50mL of water

**Method 1 - Using Volume Rule (Easier):**
1. Open "Configure Rules & Scoring"
2. Find "💧 Volume Rule" section
3. Enter:
   - Target Volume: `50`
   - Tolerance: `5`
   - Points: `10`

**Method 2 - Using Custom Condition (More Control):**
1. Open "Configure Rules & Scoring"
2. Click "+ Add Custom Condition"
3. Set:
   - Type: `Volume`
   - Operator: `Equals (==)`
   - Value: `50`
   - Tolerance: `5`
   - Points: `10`
   - Message: `"Volume should be approximately 50 mL"`

**For Content Check:**
1. Click "+ Add Custom Condition" again
2. Set:
   - Type: `Has Content`
   - Value: `water`
   - Points: `5`
   - Message: `"Beaker should contain water"`

### Important Notes

- **Equipment Name**: Rules check the equipment specified in the step's "Equipment" field
- **Content Names**: Must match exactly what you entered in Initial State "Contents" field
- **Result Types**: When checking for reaction products (like "indicator_solution"), use the exact name from the Reaction's "Result Type" field
- **Tolerance**: Allows a range around the target value (e.g., tolerance of 5 means ±5)
- **Points**: Each rule can award points independently

## Troubleshooting

**Glass rod not working?**
- Ensure rod is positioned between two containers
- Check that containers have liquid
- Verify object names match exactly

**Color not changing?**
- Check reaction configuration (reactants must match exactly)
- Verify temperature thresholds in Initial State
- Ensure contents are properly set

**Pouring not working?**
- Tilt container at least 30 degrees
- Ensure target container is nearby
- Check that source container has liquid

**Rules not validating?**
- Check that Equipment name matches exactly (case-sensitive)
- Verify content names match Initial State configuration
- Ensure reaction result types match what you're checking for
- Test with "Validate Step" button in experiment view

