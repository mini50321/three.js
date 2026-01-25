# How to Create an Experiment - Step by Step Guide

## Overview
This guide walks you through creating a new experiment in the Virtual Laboratory admin panel.

## Step 1: Access the Create Form

1. Navigate to: `http://localhost:8000/admin/`
2. Click the **"+ New Experiment"** button
3. You'll see the "Create New Experiment" form

## Step 2: Basic Information

### Title
- **Required**: Yes
- **Example**: "Heating Water Experiment"
- Enter a descriptive title for your experiment

### Subject
- **Options**: Chemistry, Physics, Biology
- Select the subject category

### Class
- **Options**: 11, 12
- Select the class level

## Step 3: Upload 3D Models

### Upload GLB Models
- Click **"Choose Files"**
- Select one or more `.glb` model files
- **Available models in your project**:
  - `Beaker.glb` - For beakers/containers
  - `Conical.glb` - For conical flasks
  - `Table1.glb` - Table (usually auto-loaded)
  - `Laboratory (2).glb` - Lab environment (usually auto-loaded)

**Note**: Models are uploaded to `uploads/models/` directory

## Step 4: Initial State Configuration

Configure the starting properties of objects when the experiment begins.

### Add Initial State
Click **"+ Add Initial State"** for each object you want to configure:

- **Object Name**: Name of the object (must match model name, e.g., "Beaker", "Conical")
- **Volume (ml)**: Starting volume of liquid (e.g., 500)
- **Temperature (°C)**: Starting temperature (default: 20°C)
- **Contents**: Comma-separated list of substances (e.g., "water", "acid, base")

**Example Initial States**:
```
Object: Beaker
Volume: 500 ml
Temperature: 20°C
Contents: water

Object: Conical
Volume: 0 ml
Temperature: 20°C
Contents: (empty)
```

## Step 5: Chemical Reactions (Optional)

Define reactions that occur when substances mix.

### Add Reaction
Click **"+ Add Reaction"** to define:
- **Reactants**: What substances react
- **Products**: What is produced
- **Color Change**: How the liquid color changes

**Note**: This feature may need to be implemented in the JavaScript if not already present.

## Step 6: Experiment Steps

Define the step-by-step procedure students must follow.

### Add Step
Click **"+ Add Step"** for each step:

#### Basic Step Information:
- **Instruction**: What the student should do (e.g., "Heat the beaker to 80°C")
- **Equipment**: Which object to use (e.g., "Beaker", "Conical")
- **Action**: What action to perform
  - `tilt` - Tilt the object
  - `pour` - Pour from one container to another
  - `heat` - Heat the object
  - `stir` - Stir the contents
  - `drag` - Move the object

#### Configure Rules & Scoring (Optional)
Click **"⚙️ Configure Rules & Scoring"** to set validation rules:

**Step Points**: Total points for completing this step (default: 10)

**Add Condition**: Create custom validation conditions
- **Type**: Temperature, Volume, Has Content, Empty
- **Operator**: > (greater than), < (less than), == (equals)
- **Value**: Target value
- **Tolerance**: Allowed deviation
- **Points**: Points awarded if condition met
- **Custom Message**: Error message if condition fails

**Temperature Rule**: Validate temperature
- **Target**: Target temperature (°C)
- **Tolerance**: Allowed deviation (default: 5°C)
- **Points**: Points for correct temperature

**Volume Rule**: Validate volume
- **Target**: Target volume (ml)
- **Tolerance**: Allowed deviation (default: 10 ml)
- **Points**: Points for correct volume

**Rotation Rule**: Validate tilt/rotation angle
- **X angle**: Rotation around X axis
- **Z angle**: Rotation around Z axis
- **Tolerance**: Allowed deviation (default: 0.1)
- **Points**: Points for correct rotation

## Step 7: Save Experiment

1. Review all your settings
2. Click **"Save Experiment"** button
3. You'll be redirected to the experiment list
4. Your new experiment will appear in the list

## Example: Complete Experiment Setup

### Example 1: Simple Heating Experiment

**Basic Info**:
- Title: "Heating Water to Boiling Point"
- Subject: Chemistry
- Class: 11

**Models**: Upload `Beaker.glb`

**Initial State**:
- Object: Beaker
- Volume: 500 ml
- Temperature: 20°C
- Contents: water

**Steps**:

**Step 1**:
- Instruction: "Heat the beaker until the water reaches 100°C"
- Equipment: Beaker
- Action: heat
- Rules:
  - Temperature Rule: Target 100°C, Tolerance 5°C, Points 20

**Step 2**:
- Instruction: "Observe the boiling effect"
- Equipment: Beaker
- Action: heat
- Rules:
  - Condition: Temperature > 95°C, Points 10

### Example 2: Pouring Experiment

**Basic Info**:
- Title: "Transfer Liquid Between Containers"
- Subject: Chemistry
- Class: 11

**Models**: Upload `Beaker.glb` and `Conical.glb`

**Initial State**:
- Object: Beaker
- Volume: 500 ml
- Temperature: 20°C
- Contents: water

- Object: Conical
- Volume: 0 ml
- Temperature: 20°C
- Contents: (empty)

**Steps**:

**Step 1**:
- Instruction: "Tilt the beaker to pour water into the conical flask"
- Equipment: Beaker
- Action: pour
- Rules:
  - Rotation Rule: X angle > 0.5, Points 15

**Step 2**:
- Instruction: "Verify 500ml was transferred"
- Equipment: Conical
- Action: measure
- Rules:
  - Volume Rule: Target 500ml, Tolerance 10ml, Points 15

## Tips for Creating Experiments

1. **Object Names**: Must match exactly (case-sensitive) with model names
2. **Start Simple**: Create a basic experiment first, then add complexity
3. **Test Steps**: Use Preview to test your experiment before publishing
4. **Points**: Balance point values - too high/low can affect scoring
5. **Tolerance**: Set reasonable tolerances (5°C for temp, 10ml for volume)
6. **Instructions**: Write clear, actionable instructions for students

## Common Object Names

Based on your models:
- `Beaker` - For beaker.glb
- `Conical` - For conical.glb
- `Beaker1`, `Beaker2` - Multiple beakers
- `Conical1`, `Conical2` - Multiple conical flasks

## Troubleshooting

**Models not loading?**
- Check file names match exactly
- Ensure files are .glb format
- Check uploads/models/ directory exists

**Objects not found?**
- Verify object names match Initial State names
- Check spelling and case sensitivity

**Steps not validating?**
- Ensure equipment name matches object name
- Check rules are configured correctly
- Verify tolerance values are reasonable

## Next Steps After Creating

1. **Preview**: Click "Preview" to test your experiment
2. **Edit**: Click "Edit" to modify the experiment
3. **Test**: Run through the experiment as a student would
4. **Refine**: Adjust rules and points based on testing

