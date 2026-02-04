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
- graduated_Cylinder_2.glb (or graduated_Cylinder_3.glb)
- Glass_Rod.glb
- Spirit Lamp .glb
- Burner Stand.glb

### 3. Configure Initial State

Add initial states for each container:

#### Graduated Cylinder 1 (Water):
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

#### Graduated Cylinder 2 (Indicator Solution):
- **Object Name**: `graduated_Cylinder_3` (or another cylinder)
- **Volume (ml)**: 10
- **Temperature (°C)**: 20
- **Contents**: `indicator`
- **Initial Color**: `#ffeb3b` (yellow - indicator color)
- **After Boiling**: `#ffeb3b`
- **After Cooling**: `#ffeb3b`

#### Graduated Cylinder 3 (Acid Solution):
- **Object Name**: (use another cylinder or beaker)
- **Volume (ml)**: 20
- **Temperature (°C)**: 20
- **Contents**: `acid`
- **Initial Color**: `#ff6b6b` (red - acid color)
- **After Boiling**: `#ff6b6b`
- **After Cooling**: `#ff6b6b`

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

#### Step 1: Measure Water
- **Instruction**: "Measure 50 mL of water in the graduated cylinder"
- **Equipment**: `graduated_Cylinder_2`
- **Action**: `drag`
- **Points**: 10

#### Step 2: Pour Water to Beaker
- **Instruction**: "Pour water from the graduated cylinder into the beaker"
- **Equipment**: `graduated_Cylinder_2`
- **Action**: `pour`
- **Points**: 10

#### Step 3: Transfer Indicator with Glass Rod
- **Instruction**: "Use the glass rod to transfer indicator solution from cylinder to beaker"
- **Equipment**: `Glass_Rod`
- **Action**: `drag`
- **Points**: 15
- **Rules**: 
  - Volume in beaker should be > 40 mL (water + some indicator)
  - Beaker should contain `indicator_solution`

#### Step 4: Heat the Beaker
- **Instruction**: "Place beaker on burner stand and heat using spirit lamp until temperature > 80°C"
- **Equipment**: `Beaker`
- **Action**: `heat`
- **Points**: 15
- **Rules**:
  - Temperature should be > 80°C
  - Color should change to orange (`#ff9800`)

#### Step 5: Transfer Acid with Glass Rod
- **Instruction**: "Use glass rod to transfer acid solution to the heated beaker"
- **Equipment**: `Glass_Rod`
- **Action**: `drag`
- **Points**: 15
- **Rules**:
  - Beaker should contain `acidic_solution`
  - Final color should be pink (`#e91e63`)

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
- Initial: Water is blue, indicator is yellow
- After mixing: Yellow solution (water + indicator)
- After heating: Orange (heated indicator solution)
- After adding acid: Pink (acidic solution)

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

