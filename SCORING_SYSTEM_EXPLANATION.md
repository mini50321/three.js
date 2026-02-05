# How Scores Are Calculated in the Experiment

## Overview

The scoring system uses a **two-tier point system**:
1. **Base Step Points** - Points for completing the action
2. **Validation Rule Points** - Additional points for meeting specific conditions

---

## How Scoring Works

### Step 1: Base Step Points

Each step has a **base point value** set in the admin panel (the "Points" field when creating a step).

**Example from your experiment:**
- Step 1: 10 points (base)
- Step 2: 10 points (base)
- Step 3: 15 points (base)
- Step 4: 10 points (base)
- Step 5: 10 points (base)

**Total Base Points**: 55 points

**When you get base points:**
- You get these points **only if the step action is completed correctly**
- For example, if you successfully pour (Step 1), you get the base 10 points
- If the pour fails, you get 0 points

---

### Step 2: Validation Rule Points

Each step can have **validation rules** that award **additional points** when conditions are met.

**Types of validation rules:**
1. **Volume Rule** - Checks if volume is correct
2. **Temperature Rule** - Checks if temperature is correct
3. **Content Rule** - Checks if container has specific contents
4. **Custom Conditions** - Any other custom checks

**How rule points work:**
- Each rule has its own point value
- Points are **added** to the base step points
- You only get rule points if **all rules pass**

---

## Detailed Example: Step 1

Let's break down Step 1 to see exactly how points are calculated:

### Step 1 Configuration:
- **Base Points**: 10 points
- **Volume Rule**: 10 points (if beaker has 50ml ± 5ml)
- **Content Rule**: 5 points (if beaker contains water)

### Scoring Calculation:

**Scenario A: Perfect Completion**
1. Student pours 50ml of water into beaker ✅
2. Volume check: 50ml (within 45-55ml range) ✅
3. Content check: Beaker contains "water" ✅

**Points Awarded:**
- Base points: 10 points
- Volume rule: +10 points
- Content rule: +5 points
- **Total for Step 1: 25 points** ✅

---

**Scenario B: Partial Completion**
1. Student pours 40ml of water into beaker ✅
2. Volume check: 40ml (outside 45-55ml range) ❌
3. Content check: Beaker contains "water" ✅

**Points Awarded:**
- Base points: 10 points (pour action completed)
- Volume rule: +0 points (failed)
- Content rule: +5 points
- **Total for Step 1: 15 points** ⚠️

---

**Scenario C: Failed Action**
1. Student doesn't pour correctly ❌
2. Volume check: 0ml ❌
3. Content check: Beaker is empty ❌

**Points Awarded:**
- Base points: 0 points (action not completed)
- Volume rule: +0 points (failed)
- Content rule: +0 points (failed)
- **Total for Step 1: 0 points** ❌

---

## Complete Experiment Scoring Breakdown

### Step 1: Pour Water (Base: 10 points)
- Volume Rule: +10 points (50ml ± 5ml)
- Content Rule: +5 points (contains water)
- **Maximum possible: 25 points**

### Step 2: Transfer with Dropper (Base: 10 points)
- Volume Rule: +10 points (60ml ± 5ml)
- Content Rule: +5 points (contains yellow_solution)
- **Maximum possible: 25 points**

### Step 3: Stir Solution (Base: 15 points)
- Content Rule: +10 points (contains mixed_solution/green)
- Volume Rule: +5 points (60ml ± 5ml)
- **Maximum possible: 30 points**

### Step 4: Pour to Test Tube (Base: 10 points)
- Volume Rule: +10 points (30ml ± 5ml in test tube)
- Content Rule: +5 points (contains mixed_solution)
- **Maximum possible: 25 points**

### Step 5: Shake Test Tube (Base: 10 points)
- Content Rule: +10 points (contains mixed_solution)
- **Maximum possible: 20 points**

---

## Total Score Calculation

### Maximum Possible Score:
- Step 1: 25 points
- Step 2: 25 points
- Step 3: 30 points
- Step 4: 25 points
- Step 5: 20 points
- **Total Maximum: 125 points**

### Minimum Score (if all actions completed but rules failed):
- Step 1: 10 points (base only)
- Step 2: 10 points (base only)
- Step 3: 15 points (base only)
- Step 4: 10 points (base only)
- Step 5: 10 points (base only)
- **Total Minimum: 55 points**

---

## How the System Calculates Scores

### When You Click "Validate Step":

1. **Action Validation** (Base Points)
   - System checks if the action was performed correctly
   - If YES: Award base step points
   - If NO: Award 0 points, show error message

2. **Rule Validation** (Additional Points)
   - System checks each validation rule
   - For each rule that passes: Add rule points
   - For each rule that fails: Add 0 points, show error message

3. **Total Points for Step**
   - Base points + All rule points = Step total
   - This is added to your overall score

4. **Score Percentage**
   - Formula: `(Current Score / Maximum Score) × 100`
   - Example: If you have 100 points out of 125 maximum = 80%

---

## Important Notes

### 1. All-or-Nothing for Rules?
**No!** Rules are **additive**, not all-or-nothing:
- If 2 out of 3 rules pass, you get points for those 2 rules
- You don't lose all rule points if one fails

### 2. Base Points vs Rule Points
- **Base points**: Awarded for completing the action
- **Rule points**: Awarded for meeting specific conditions
- You can get base points even if some rules fail

### 3. Maximum Score Calculation
The system calculates maximum score as:
```javascript
maxScore = sum of all step base points
```
**Note**: This doesn't include rule points in the maximum, so you can actually score **more than 100%** if you get all rule points!

### 4. Score Display
- **Current Score**: Shows in the Progress section
- **Maximum Score**: Calculated from base points only
- **Percentage**: (Current Score / Maximum Score) × 100

---

## Example Scoring Scenarios

### Perfect Student (All Steps + All Rules)
- Step 1: 25 points ✅
- Step 2: 25 points ✅
- Step 3: 30 points ✅
- Step 4: 25 points ✅
- Step 5: 20 points ✅
- **Total: 125 points**
- **Percentage: 227%** (125 / 55 = 227%)

### Good Student (All Steps + Some Rules)
- Step 1: 20 points (base + volume, missing content)
- Step 2: 25 points ✅
- Step 3: 30 points ✅
- Step 4: 20 points (base + volume, missing content)
- Step 5: 20 points ✅
- **Total: 115 points**
- **Percentage: 209%**

### Average Student (All Steps, No Rules)
- Step 1: 10 points (base only)
- Step 2: 10 points (base only)
- Step 3: 15 points (base only)
- Step 4: 10 points (base only)
- Step 5: 10 points (base only)
- **Total: 55 points**
- **Percentage: 100%**

### Struggling Student (Some Steps Failed)
- Step 1: 25 points ✅
- Step 2: 0 points (action failed)
- Step 3: 0 points (action failed)
- Step 4: 10 points (base only)
- Step 5: 0 points (action failed)
- **Total: 35 points**
- **Percentage: 64%**

---

## Tips for Maximizing Your Score

1. **Complete the action correctly** - This ensures you get base points
2. **Pay attention to volumes** - Use exact amounts when possible
3. **Check contents** - Make sure the right substances are in containers
4. **Read feedback** - The Feedback section tells you what's wrong
5. **Validate after each step** - Don't wait until the end

---

## Summary

**Scoring Formula:**
```
Step Score = Base Points + (Sum of All Passing Rule Points)
Total Score = Sum of All Step Scores
Score Percentage = (Total Score / Maximum Base Points) × 100
```

**Key Points:**
- ✅ Base points are awarded for completing actions
- ✅ Rule points are bonus points for meeting conditions
- ✅ You can score more than 100% if you get all rule points
- ✅ Each rule is scored independently
- ✅ Failed rules don't take away points, they just don't add any

This system rewards both **completing the experiment** (base points) and **doing it correctly** (rule points)!

