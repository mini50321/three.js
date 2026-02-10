# How to Create a Color Mixing Experiment

## Experiment Overview
**Goal:** Mix water (from beaker) with yellow chemical (from cylinder) in a test tube using a dropper, then shake to turn green.

---

## Step-by-Step Instructions

### 1. Access Admin Panel
- Go to `http://localhost:8000/admin/`
- Click **"Create New Experiment"**

### 2. Basic Information
Fill in:
- **Title:** "Color Mixing Experiment"
- **Subject:** Chemistry
- **Class:** Choose appropriate class (e.g., 8)
- **Description:** "Mix water and yellow chemical to observe color change"

### 3. Upload Models (if needed)
- Upload GLB models for: `Beaker.glb`, `graduated Cylinder.glb`, `TestTube.glb`, `Dropper.glb`
- These should already be in `assets/models/` folder

### 4. Initial State Configuration

Click **"+ Add Initial State"** three times to create:

#### Initial State 1: Beaker with Water
- **Object Name:** `Beaker`
- **Volume (ml):** `50`
- **Temperature (°C):** `20`
- **Contents:** `water`
- **Initial Color (Hex):** `#4a90e2` (blue - default water color)

#### Initial State 2: Cylinder with Yellow Chemical
- **Object Name:** `graduated Cylinder` (or `Cylinder` - match your model name exactly)
- **Volume (ml):** `30`
- **Temperature (°C):** `20`
- **Contents:** `yellow_chemical` (or `yellowChemical`)
- **Initial Color (Hex):** `#ffff00` (yellow)

#### Initial State 3: Empty Test Tube
- **Object Name:** `TestTube`
- **Volume (ml):** `0`
- **Temperature (°C):** `20`
- **Contents:** (leave empty)
- **Initial Color (Hex):** (leave empty or `#ffffff`)

### 5. Chemical Reactions

Click **"+ Add Reaction"** to create the color change reaction:

#### Reaction: Water + Yellow Chemical → Green
- **Reactants (comma-separated):** `water, yellow_chemical`
  - ⚠️ **Important:** Use the exact same names as in Initial State contents
- **Result Type:** `green_solution`
- **Result Color (Hex):** `#00ff00` (green)
- **Message (optional):** "Water and yellow chemical mixed to form green solution"

### 6. Experiment Steps

Click **"+ Add Step"** for each action:

#### Step 1: Transfer Yellow Chemical to Test Tube
- **Instruction:** "Use the dropper to transfer yellow chemical from the cylinder to the test tube"
- **Equipment:** `Dropper`
- **Action:** `drag`
- **Points:** `10`

#### Step 2: Add Water to Test Tube
- **Instruction:** "Pour water from the beaker into the test tube containing yellow chemical"
- **Equipment:** `Beaker`
- **Action:** `pour`
- **Points:** `10`

#### Step 3: Mix the Contents
- **Instruction:** "Stir or shake the test tube to mix the contents"
- **Equipment:** `TestTube`
- **Action:** `stir` (or `shake` - both work, but `stir` has visual feedback)
- **Points:** `10`
  
  **Note:** Chemical reactions are automatically checked when contents are mixed. The color change should happen automatically after pouring both liquids together. Stirring helps ensure the reaction is detected.

#### Step 4: Observe Color Change
- **Instruction:** "Observe the color change to green"
- **Equipment:** `TestTube`
- **Action:** `observe`
- **Points:** `10`

### 7. Save Experiment
- Click **"Save Experiment"** button at the bottom
- You'll be redirected to the experiment list

---

## Important Notes

### Object Names Must Match
- The object names in **Initial State** must exactly match the GLB model file names (without `.glb`)
- Common names: `Beaker`, `graduated Cylinder`, `TestTube`, `Dropper`
- Check your `assets/models/` folder for exact names

### Chemical Names Must Match
- The chemical names in **Initial State Contents** must exactly match the **Reactants** in the reaction
- Example: If you use `yellow_chemical` in Initial State, use `yellow_chemical` in Reaction (not `yellowChemical`)

### Color Codes
- Use hex color codes with `#` prefix
- Yellow: `#ffff00`
- Green: `#00ff00`
- Blue (water): `#4a90e2`

### How Reactions Work
- Reactions are automatically checked continuously in the animation loop
- The system checks if all reactants are present in the same container
- If match found, creates the result product with the specified color
- Reactions typically trigger:
  - Immediately when contents are poured/mixed together
  - During stirring/shaking (helps ensure detection)
  - When temperature changes significantly
- **Important:** Make sure both chemicals are in the same container (test tube) for the reaction to occur

### Testing Your Experiment
1. Go to main page: `http://localhost:8000`
2. Click on your experiment
3. Test the steps:
   - Select dropper, click on cylinder, then click on test tube
   - Select beaker, pour into test tube
   - Select test tube, use shake action
   - Observe the color change

---

## Troubleshooting

**Color doesn't change:**
- Check that chemical names in Initial State match exactly with Reaction reactants
- Verify the reaction was saved correctly
- Check browser console for errors

**Objects don't appear:**
- Verify GLB model names match exactly (case-sensitive)
- Check that models are in `assets/models/` folder

**Dropper doesn't work:**
- Make sure Dropper model is uploaded
- Check that object name matches exactly

**Reaction doesn't trigger:**
- Ensure all reactants are present in the same container
- Try shaking/stirring the container after mixing
- Check that reaction reactants are comma-separated correctly

---

## Example JSON Structure (for reference)

```json
{
  "initialState": [
    {
      "objectName": "Beaker",
      "volume": 50,
      "temperature": 20,
      "contents": "water",
      "initialColor": "#4a90e2"
    },
    {
      "objectName": "graduated Cylinder",
      "volume": 30,
      "temperature": 20,
      "contents": "yellow_chemical",
      "initialColor": "#ffff00"
    },
    {
      "objectName": "TestTube",
      "volume": 0,
      "temperature": 20,
      "contents": ""
    }
  ],
  "reactions": [
    {
      "reactants": ["water", "yellow_chemical"],
      "result": {
        "type": "green_solution",
        "color": 65280
      },
      "message": "Water and yellow chemical mixed to form green solution"
    }
  ]
}
```

---

## Next Steps
After creating, test the experiment thoroughly and adjust colors, volumes, or steps as needed!

