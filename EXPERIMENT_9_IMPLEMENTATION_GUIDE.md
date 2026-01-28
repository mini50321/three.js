# Experiment 9 Implementation Guide
## Preparation of Inorganic Compounds

This guide explains how to configure **Experiment 9.1** (Potash Alum & Mohr's Salt) and **Experiment 9.2** (Potassium Trioxalatoferrate) in the admin panel.

---

## **PART 1: Basic Experiment Setup**

### **Experiment 9.1: Preparation of Double Salts**

1. **Go to Admin Panel** → Click **"+ New Experiment"**

2. **Fill Basic Information:**
   - **Title:** `Preparation of Double Salts: Potash Alum and Mohr's Salt`
   - **Subject:** `Chemistry`
   - **Class:** `11` or `12`

3. **Upload Models:**
   - Upload or select these `.glb` files:
     - `Beaker.glb` (50 mL beaker)
     - `Conical.glb` (50 mL conical flask)
     - `Table1.glb` (lab table - already exists)

---

## **PART 2: Initial State Configuration**

Click **"+ Add Initial State"** and configure:

### **Initial State 1: Beaker (for Potash Alum)**
- **Object Name:** `Beaker`
- **Volume (ml):** `10`
- **Temperature (°C):** `20`
- **Contents:** `water`
- **Color Configuration:**
  - **Initial Color (Hex):** `#4a90e2` (blue - water)
  - **After Boiling (Hex):** `#ff6b6b` (red - if overheated)
  - **After Cooling (Hex):** `#ffffff` (white - crystals forming)

### **Initial State 2: Conical Flask (for Mohr's Salt)**
- **Object Name:** `Conical`
- **Volume (ml):** `5`
- **Temperature (°C):** `20`
- **Contents:** `water`
- **Color Configuration:**
  - **Initial Color (Hex):** `#4a90e2` (blue - water)
  - **After Boiling (Hex):** `#ff6b6b` (red - if overheated)
  - **After Cooling (Hex):** `#90EE90` (light green - Mohr's salt crystals)

---

## **PART 3: Chemical Reactions**

Click **"+ Add Reaction"** and configure:

### **Reaction 1: Potash Alum Formation**
- **Reactants (comma-separated):** `aluminium sulphate, potassium sulphate, water`
- **Result Type:** `potash_alum`
- **Result Color (Hex):** `#ffffff` (white crystals)
- **Message:** `White crystals of potash alum have formed`

### **Reaction 2: Mohr's Salt Formation**
- **Reactants (comma-separated):** `ferrous sulphate, ammonium sulphate, water`
- **Result Type:** `mohr_salt`
- **Result Color (Hex):** `#90EE90` (light green crystals)
- **Message:** `Light green crystals of ferrous ammonium sulphate have formed`

### **Reaction 3: Potassium Trioxalatoferrate Formation (for Exp 9.2)**
- **Reactants (comma-separated):** `oxalic acid, potassium hydroxide, ferric chloride`
- **Result Type:** `potassium_trioxalatoferrate`
- **Result Color (Hex):** `#228B22` (green crystals)
- **Message:** `Green crystals of potassium trioxalatoferrate(III) have formed`

---

## **PART 4: Experiment Steps**

### **EXPERIMENT 9.1 - PART A: Potash Alum**

#### **Step 1: Add Water to Beaker**
- **Instruction:** `Take 10 mL of distilled water in a 50 mL beaker`
- **Equipment:** `Beaker`
- **Action:** `drag`
- **Points:** `5`
- **Rules:**
  - **Volume Rule:**
    - Target Volume: `10`
    - Tolerance: `±2`
    - Points: `5`

#### **Step 2: Heat Water to 40°C**
- **Instruction:** `Heat the water to about 40°C`
- **Equipment:** `Beaker`
- **Action:** `heat`
- **Points:** `10`
- **Rules:**
  - **Temperature Rule:**
    - Target Temperature: `40`
    - Tolerance: `±5`
    - Points: `10`

#### **Step 3: Dissolve Aluminium Sulphate**
- **Instruction:** `Dissolve 6.6 g of aluminium sulphate in the beaker`
- **Equipment:** `Beaker`
- **Action:** `stir`
- **Points:** `10`
- **Rules:**
  - **Custom Condition:**
    - Type: `hasContent`
    - Operator: `==`
    - Value: `1` (has content)
    - Points: `10`
    - Message: `Aluminium sulphate must be dissolved`

#### **Step 4: Add Dilute Sulphuric Acid**
- **Instruction:** `Add about 0.4 mL of dilute sulphuric acid`
- **Equipment:** `Beaker`
- **Action:** `pour`
- **Points:** `5`
- **Rules:**
  - **Volume Rule:**
    - Target Volume: `10.4` (10 + 0.4)
    - Tolerance: `±0.5`
    - Points: `5`

#### **Step 5: Add Potassium Sulphate**
- **Instruction:** `Weigh 2.4 g of powdered potassium sulphate and transfer it to the solution`
- **Equipment:** `Beaker`
- **Action:** `drag`
- **Points:** `10`
- **Rules:**
  - **Custom Condition:**
    - Type: `hasContent`
    - Operator: `==`
    - Value: `1`
    - Points: `10`

#### **Step 6: Heat and Stir Until Dissolved**
- **Instruction:** `Heat the solution with constant stirring till potassium sulphate dissolves completely`
- **Equipment:** `Beaker`
- **Action:** `heat`
- **Points:** `15`
- **Rules:**
  - **Temperature Rule:**
    - Target Temperature: `60` (warm enough to dissolve)
    - Tolerance: `±10`
    - Points: `10`
  - **Custom Condition:**
    - Type: `hasContent`
    - Operator: `==`
    - Value: `1`
    - Points: `5`
    - Message: `Potassium sulphate must be completely dissolved`

#### **Step 7: Cool Slowly to Room Temperature**
- **Instruction:** `Allow the solution to cool to room temperature slowly`
- **Equipment:** `Beaker`
- **Action:** `drag` (just wait/validate)
- **Points:** `15`
- **Rules:**
  - **Temperature Rule:**
    - Target Temperature: `25` (room temperature)
    - Tolerance: `±5`
    - Points: `15`
    - Message: `Solution must cool slowly to room temperature. Rapid cooling will reduce crystal quality.`

#### **Step 8: Verify Crystal Formation**
- **Instruction:** `Verify that white crystals of potash alum have separated out`
- **Equipment:** `Beaker`
- **Action:** `drag`
- **Points:** `20`
- **Rules:**
  - **Custom Condition:**
    - Type: `hasContent`
    - Operator: `==`
    - Value: `1`
    - Points: `20`
    - Message: `White crystals of potash alum should be visible`

---

### **EXPERIMENT 9.1 - PART B: Mohr's Salt**

#### **Step 9: Add Water to Conical Flask**
- **Instruction:** `Take 5 mL of distilled water in a 50 mL conical flask`
- **Equipment:** `Conical`
- **Action:** `drag`
- **Points:** `5`
- **Rules:**
  - **Volume Rule:**
    - Target Volume: `5`
    - Tolerance: `±1`
    - Points: `5`

#### **Step 10: Dissolve Ferrous and Ammonium Sulphate**
- **Instruction:** `Dissolve 3.5 g of ferrous sulphate and 1.7 g of ammonium sulphate in the water by heating`
- **Equipment:** `Conical`
- **Action:** `heat`
- **Points:** `15`
- **Rules:**
  - **Temperature Rule:**
    - Target Temperature: `50`
    - Tolerance: `±10`
    - Points: `10`
  - **Custom Condition:**
    - Type: `hasContent`
    - Operator: `==`
    - Value: `1`
    - Points: `5`

#### **Step 11: Add Dilute Sulphuric Acid**
- **Instruction:** `Add about 0.5 mL of dilute sulphuric acid`
- **Equipment:** `Conical`
- **Action:** `pour`
- **Points:** `5`
- **Rules:**
  - **Volume Rule:**
    - Target Volume: `5.5`
    - Tolerance: `±0.5`
    - Points: `5`

#### **Step 12: Concentrate by Heating**
- **Instruction:** `Concentrate the solution by heating till the crystallization point is reached`
- **Equipment:** `Conical`
- **Action:** `heat`
- **Points:** `20`
- **Rules:**
  - **Temperature Rule:**
    - Target Temperature: `80` (near boiling, but not boiling)
    - Tolerance: `±10`
    - Points: `20`
    - Message: `Heat until crystallization point. Avoid prolonged heating to prevent oxidation.`

#### **Step 13: Cool Slowly**
- **Instruction:** `Allow the mixture to cool to room temperature slowly`
- **Equipment:** `Conical`
- **Action:** `drag`
- **Points:** `15`
- **Rules:**
  - **Temperature Rule:**
    - Target Temperature: `25`
    - Tolerance: `±5`
    - Points: `15`
    - Message: `Cool slowly for good crystal formation`

#### **Step 14: Verify Green Crystals**
- **Instruction:** `Verify that light green crystals of ferrous ammonium sulphate have separated out`
- **Equipment:** `Conical`
- **Action:** `drag`
- **Points:** `20`
- **Rules:**
  - **Custom Condition:**
    - Type: `hasContent`
    - Operator: `==`
    - Value: `1`
    - Points: `20`
    - Message: `Light green crystals of Mohr's salt should be visible`

---

### **EXPERIMENT 9.2: Potassium Trioxalatoferrate**

#### **Step 15: Prepare Oxalic Acid Solution**
- **Instruction:** `Prepare a solution of 3.0 g of oxalic acid in 12.5 mL of hot water in a 50 mL beaker`
- **Equipment:** `Beaker`
- **Action:** `heat`
- **Points:** `10`
- **Rules:**
  - **Volume Rule:**
    - Target Volume: `12.5`
    - Tolerance: `±2`
    - Points: `5`
  - **Temperature Rule:**
    - Target Temperature: `60` (hot water)
    - Tolerance: `±10`
    - Points: `5`

#### **Step 16: Add Potassium Hydroxide**
- **Instruction:** `Add 3.8 g of potassium hydroxide gradually in lots, with stirring so that it dissolves completely`
- **Equipment:** `Beaker`
- **Action:** `stir`
- **Points:** `15`
- **Rules:**
  - **Custom Condition:**
    - Type: `hasContent`
    - Operator: `==`
    - Value: `1`
    - Points: `15`
    - Message: `Potassium hydroxide must be completely dissolved`

#### **Step 17: Add Ferric Chloride**
- **Instruction:** `Add 2.5 g of ferric chloride into the solution with constant stirring till it is completely dissolved`
- **Equipment:** `Beaker`
- **Action:** `stir`
- **Points:** `15`
- **Rules:**
  - **Custom Condition:**
    - Type: `hasContent`
    - Operator: `==`
    - Value: `1`
    - Points: `15`
    - Message: `Ferric chloride must be completely dissolved`

#### **Step 18: Filter the Solution**
- **Instruction:** `Filter the solution`
- **Equipment:** `Beaker`
- **Action:** `pour`
- **Points:** `10`
- **Rules:**
  - **Custom Condition:**
    - Type: `hasContent`
    - Operator: `==`
    - Value: `1`
    - Points: `10`

#### **Step 19: Concentrate Over Water Bath**
- **Instruction:** `Concentrate the green filtrate by heating in a porcelain dish over a water bath and cool slowly`
- **Equipment:** `Beaker`
- **Action:** `heat`
- **Points:** `20`
- **Rules:**
  - **Temperature Rule:**
    - Target Temperature: `70` (water bath temperature)
    - Tolerance: `±10`
    - Points: `20`
    - Message: `Heat over water bath to concentrate. Green color indicates formation of complex.`

#### **Step 20: Verify Green Crystals**
- **Instruction:** `Verify that green crystals of potassium trioxalatoferrate(III) have formed`
- **Equipment:** `Beaker`
- **Action:** `drag`
- **Points:** `20`
- **Rules:**
  - **Custom Condition:**
    - Type: `hasContent`
    - Operator: `==`
    - Value: `1`
    - Points: `20`
    - Message: `Green crystals of potassium trioxalatoferrate(III) should be visible`

---

## **PART 5: Important Configuration Notes**

### **Tolerance Guidelines:**
- **Volume:** ±10-20% tolerance is reasonable for student measurements
- **Temperature:** ±5-10°C tolerance accounts for measurement variations
- **Time:** Not strictly enforced in current system, but can be tracked

### **Scoring Strategy:**
- **Basic steps:** 5-10 points
- **Critical steps (heating, mixing):** 15-20 points
- **Verification steps:** 20 points (highest weight)

### **Color Changes:**
- The system will automatically change liquid colors based on:
  - **Initial state colors** (room temperature)
  - **Boiling colors** (when temperature > 80°C)
  - **Cooling colors** (when temperature < 20°C)
  - **Reaction colors** (when reactants mix)

### **Precautions to Enforce:**
1. **Slow Cooling:** Validate temperature decreases gradually (not instant)
2. **Avoid Overheating:** Temperature should not exceed 100°C for Mohr's salt
3. **Proper Mixing:** Ensure contents are present before proceeding

---

## **PART 6: Testing Checklist**

After configuring, test:

- [ ] All steps appear in correct order
- [ ] Initial states load correctly (water in beaker/conical)
- [ ] Temperature rules validate correctly
- [ ] Volume rules validate correctly
- [ ] Reactions trigger color changes
- [ ] Scoring accumulates properly
- [ ] Feedback messages display correctly
- [ ] Experiment can be reset and restarted

---

## **PART 7: Alternative Approach (Simplified)**

If the full experiment is too complex, you can create **two separate experiments**:

1. **Experiment 9.1A:** Potash Alum only (Steps 1-8)
2. **Experiment 9.1B:** Mohr's Salt only (Steps 9-14)
3. **Experiment 9.2:** Potassium Trioxalatoferrate (Steps 15-20)

This makes it easier for students to focus on one procedure at a time.

---

## **Summary**

This experiment demonstrates:
- ✅ Multiple containers (beaker, conical flask)
- ✅ Temperature control (heating, cooling)
- ✅ Volume measurements
- ✅ Chemical reactions with color changes
- ✅ Step-by-step validation
- ✅ Detailed scoring and feedback

The system will automatically handle physics, collisions, and visual effects based on your configuration!

