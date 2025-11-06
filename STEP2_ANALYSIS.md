# Step 2: Configuration - Implementation Analysis

## Current Status: "2. Builder" → Needs to be "2. Configuration"

---

## ✅ IMPLEMENTED

### Block Navigation
- ✅ View mode toggles (Blocks/Weeks/Days)
- ✅ Can navigate between blocks using dropdown selector (in Days view)
- ⚠️ **PARTIAL**: Horizontal block display exists but no arrow navigation for block comparison

### Block Display Elements
- ✅ Block number and name (displayed in column headers)
- ✅ Date range (displayed in column headers)
- ❌ **MISSING**: Season phase (not displayed in block headers)

### Routine Configuration Sections

#### Training Split
- ✅ Section exists
- ✅ Dropdown for split type
- ❌ **WRONG**: Currently shows "2-day, 3-day, 4-day, 5-day, 6-day split"
- ❌ **MISSING**: Should be Template builder with options: 4x2, 4x1, 3x2, 3x1, 2x2, 2x1
- ❌ **MISSING**: Drag & drop day reassignment for split type default arrangements
- ❌ **MISSING**: Default arrangements for each split type (e.g., 4x2: Lower Body #1, Upper Body #1, Conditioning #1, Rest, etc.)

#### Throwing
- ✅ Section exists
- ✅ xRole dropdown (but in wrong location - should be separate section)
- ✅ Throwing Phase dropdown (but wrong options - should include "Pitch Design [PD]")
- ❌ **MISSING**: Exclusions dropdown (e.g., "Flatground")
- ⚠️ **WRONG**: Currently shows "Throwing Focus" instead of proper Phase/Exclusions

#### Movement
- ✅ Section exists
- ✅ R-focus dropdown
- ✅ Movement Type dropdown
- ✅ Intensity dropdown
- ✅ Volume dropdown
- ⚠️ **NOTE**: Requirements say "Handled by Assessment process" - should be read-only or auto-populated

#### Lifting
- ✅ Section exists
- ✅ R-focus dropdown
- ✅ Focus (Upper) dropdown
- ✅ Focus (Lower) dropdown
- ❌ **MISSING**: Core Emphasis dropdown (Restorative, Strength, Speed, Hybrid, etc.)
- ❌ **MISSING**: Variability dropdown (Low, etc.)
- ❌ **MISSING**: Scheme dropdown (Straight, etc.)
- ❌ **MISSING**: Exclusions dropdown (None, etc.)

### View Toggles
- ✅ Exists: "Blocks", "Weeks", "Days"
- ❌ **WRONG**: Should be "By Block" and "By Week" only

---

## ❌ MISSING

### Schedule Section
- ❌ **COMPLETELY MISSING**: Season dropdown (Season, Off-Season)
- ❌ **COMPLETELY MISSING**: Sub-Season dropdown (e.g., General Off-Season [GOS])
- ❌ **COMPLETELY MISSING**: Based on associated Team Schedule and Key Dates

### xRole Section (Separate)
- ⚠️ **PARTIAL**: xRole exists under Throwing section
- ❌ **MISSING**: Should be separate section at top
- ❌ **MISSING**: xRole (Pitcher) dropdown (e.g., Rotation Starter)
- ❌ **MISSING**: xRole (Hitter) dropdown
- ❌ **MISSING**: Determined from Questionnaire

### Conditioning Section
- ❌ **COMPLETELY MISSING**: Entire section
- ❌ **MISSING**: Core Emphasis dropdown (e.g., Mitochondrial)
- ❌ **MISSING**: Adaptation dropdown (e.g., Angiogenesis)
- ❌ **MISSING**: Method dropdown (e.g., Long Slow Duration)

### Template Selection
- ❌ **COMPLETELY MISSING**: Template selection system
- ❌ **MISSING**: 10-12 hardcoded templates
- ❌ **MISSING**: Selection based on athlete demographic, training split, block parameters
- ❌ **MISSING**: One template per block

---

## 📋 REQUIRED CHANGES SUMMARY

### High Priority (Core Functionality)
1. **Rename**: "2. Builder" → "2. Configuration"
2. **Add Schedule Section**: Season + Sub-Season dropdowns (first section)
3. **Add xRole Section**: Separate section (Pitcher/Hitter dropdowns) before routine sections
4. **Update Lifting Training Split**: Change to Template builder format (4x2, 4x1, etc.) with drag-drop
5. **Add Lifting Options**: Core Emphasis, Variability, Scheme, Exclusions
6. **Add Conditioning Section**: Core Emphasis, Adaptation, Method
7. **Update Throwing Section**: Phase dropdown (Pitch Design), add Exclusions dropdown
8. **Add Season Phase**: Display in block headers
9. **Update View Toggles**: Change to "By Block" and "By Week"
10. **Add Block Navigation Arrows**: Horizontal arrows for block comparison

### Medium Priority (Enhancement)
11. **Template Selection**: Add template selection system
12. **Movement Auto-populate**: Make Movement read-only/auto-populated from Assessment

---

## 📐 Section Order (As Required)

1. **Schedule** (NEW)
   - Season dropdown
   - Sub-Season dropdown

2. **xRole** (NEW - Currently under Throwing)
   - xRole (Pitcher) dropdown
   - xRole (Hitter) dropdown

3. **Movement** (EXISTS - May need to be read-only)
   - Handled by Assessment process
   - Template selection based on needs

4. **Throwing** (EXISTS - Needs updates)
   - Phase dropdown (Pitch Design [PD])
   - Exclusions dropdown (Flatground)

5. **Lifting** (EXISTS - Needs major updates)
   - Training Split (Template builder: 4x2, 4x1, etc.)
   - Core Emphasis dropdown
   - Variability dropdown
   - Scheme dropdown
   - Exclusions dropdown

6. **Conditioning** (NEW)
   - Core Emphasis dropdown
   - Adaptation dropdown
   - Method dropdown

