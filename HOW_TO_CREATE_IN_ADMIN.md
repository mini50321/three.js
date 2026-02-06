# How to Create the Powder, Gas, and Smoke Experiment in Admin Panel

## Step-by-Step Guide

This guide shows you exactly how to create the experiment in the admin panel.

---

## Step 1: Access the Admin Panel

1. **Navigate to** `admin/create.php` in your browser
2. You'll see the "Create New Experiment" page

---

## Step 2: Fill in Basic Information

1. **Title**: Enter `Powder, Gas, and Smoke Demonstration`
2. **Subject**: Select `Chemistry` from the dropdown
3. **Class**: Select `11` from the dropdown

**Note**: You can skip "Upload GLB Models" for this experiment - we'll use the default beaker from the labware menu.

---

## Step 3: Configure Initial State

This sets up the beaker with acid at the start of the experiment.

1. **Click the "+ Add Initial State" button**
2. Fill in the form that appears:
   - **Object Name**: `Beaker`
   - **Volume**: `50`
   - **Temperature**: `20`
   - **Contents**: `acid` (type exactly: `acid`)
   - **Initial Color**: Leave empty (or use `#ff4444` for red)
   - **Boiling Color**: Leave empty
   - **Cooling Color**: Leave empty

**Result**: The beaker will start with 50ml of acid at 20°C.

---

## Step 4: Add Chemical Reaction

This creates the reaction that produces CO₂ gas when acid and carbonate mix.

1. **Click the "+ Add Reaction" button**
2. Fill in the form:
   - **Reactants**: `acid, carbonate` (comma-separated, exactly as shown)
   - **Result Type**: `co2` (this will be recognized as a gas)
   - **Result Color**: `#cccccc` (light gray for CO₂)
   - **Message**: `Acid reacts with carbonate to produce carbon dioxide gas`

**Result**: When acid and carbonate are mixed, CO₂ gas will be created automatically.

---

## Step 5: Add Experiment Steps

Add each step one by one:

### Step 1: Observe Beaker
1. **Click "+ Add Step"**
2. Fill in:
   - **Instruction**: `Observe the beaker containing 50ml of acid`
   - **Equipment**: `Beaker`
   - **Action**: `tilt` (or `drag`)
   - **Points**: `5`
3. Click **"⚙️ Configure Rules & Scoring"** (optional)
   - You can add validation rules here if needed

### Step 2: Add Powder
1. **Click "+ Add Step"** again
2. Fill in:
   - **Instruction**: `Add 10g of carbonate powder to the beaker. The powder will appear as a solid at the bottom.`
   - **Equipment**: `Beaker`
   - **Action**: `drag` (or `tilt`)
   - **Points**: `15`
3. **Configure Rules** (optional):
   - Click "⚙️ Configure Rules & Scoring"
   - Add a custom condition:
     - Type: `hasContent`
     - Value: `carbonate`
     - Points: `15`

### Step 3: Observe Reaction
1. **Click "+ Add Step"** again
2. Fill in:
   - **Instruction**: `Observe the chemical reaction - CO₂ gas is produced and smoke appears`
   - **Equipment**: `Beaker`
   - **Action**: `observe` (or `tilt`)
   - **Points**: `20`
3. **Configure Rules** (optional):
   - Add custom condition:
     - Type: `hasContent`
     - Value: `co2`
     - Points: `20`

### Step 4: Heat the Beaker
1. **Click "+ Add Step"** again
2. Fill in:
   - **Instruction**: `Heat the beaker to increase gas production and smoke intensity`
   - **Equipment**: `Beaker`
   - **Action**: `heat`
   - **Points**: `15`
3. **Configure Rules** (optional):
   - Add temperature rule:
     - Target Temperature: `50`
     - Tolerance: `10`
     - Points: `15`

### Step 5: Observe Gas Escape
1. **Click "+ Add Step"** again
2. Fill in:
   - **Instruction**: `Watch the smoke rise as CO₂ gas escapes from the unsealed container`
   - **Equipment**: `Beaker`
   - **Action**: `observe` (or `tilt`)
   - **Points**: `10`

---

## Step 6: Save the Experiment

1. **Scroll to the bottom** of the page
2. **Click "Save Experiment"** button
3. You'll be redirected to the experiment list
4. Your experiment is now saved!

---

## Important Notes

### Initial State Contents Format
- **For liquids**: Just type the chemical name, e.g., `acid`, `water`, `base`
- **For powders**: The system will handle powders when added via UI (not in initial state)
- **Multiple contents**: Separate with commas, e.g., `acid, water`

### Reaction Reactants Format
- **Comma-separated**: `acid, carbonate`
- **Case-sensitive**: Use lowercase
- **Exact names**: Must match the chemical names used in the system

### Result Types for Gases
- Use these names for gases (they'll trigger smoke effects):
  - `co2` - Carbon dioxide
  - `hydrogen` - Hydrogen gas
  - `steam` - Water vapor
  - `smoke` - Generic smoke
  - `gas` - Generic gas

### Steps Actions
- **tilt**: For tilting containers
- **pour**: For pouring liquids
- **heat**: For heating
- **stir**: For stirring
- **drag**: For moving objects
- **observe**: For observation steps

---

## What Happens When Students Use This Experiment

1. **Student adds beaker** from Labware menu
2. **Beaker starts with 50ml acid** (from initial state)
3. **Student adds carbonate powder** using "Add Powder" UI button
4. **Reaction triggers automatically** when both are present
5. **CO₂ gas is created** and smoke appears
6. **Student heats beaker** using temperature slider
7. **Smoke intensifies** and gas escapes over time

---

## Troubleshooting

### Reaction Not Working?
- Check that reactants are exactly: `acid, carbonate` (lowercase, comma-separated)
- Check that result type is: `co2` (lowercase)
- Make sure both acid and carbonate are in the container

### Smoke Not Appearing?
- Ensure result type is a recognized gas (`co2`, `hydrogen`, `steam`, etc.)
- The system automatically creates smoke when gas is present
- Smoke appears when temperature > 80°C or when gas content exists

### Powder Not Showing?
- Powders must be added via the UI "Add Powder" button (not in initial state)
- Initial state only supports liquids
- Students will add powder during the experiment

---

## Summary

**Quick Checklist:**
- ✅ Title: "Powder, Gas, and Smoke Demonstration"
- ✅ Subject: Chemistry
- ✅ Class: 11
- ✅ Initial State: Beaker with 50ml acid
- ✅ Reaction: acid + carbonate → co2
- ✅ 5 Steps: Observe → Add Powder → Observe Reaction → Heat → Observe Escape
- ✅ Save Experiment

That's it! Your experiment is ready for students to use.

