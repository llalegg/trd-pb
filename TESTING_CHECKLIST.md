# Testing Checklist - Navigation & Bottom Sheets

## ✅ Pre-Testing Verification
- [x] All constants defined (DEFAULT_REST_MINUTES, VARIATIONS_SHEET_MAX_HEIGHT, etc.)
- [x] All event handlers properly connected
- [x] No linter errors
- [x] Event propagation properly handled (e.stopPropagation() on equipment buttons)

---

## 🧪 Test Scenarios

### 1. Navigation Flow Tests

#### Test 1.1: Home → Session View
**Steps:**
1. Navigate to `/home`
2. Click "Preview" button on Movement card
3. Click "Preview" button on S&C card (Lifting)
4. Click "Preview" button on Throwing card

**Expected Results:**
- ✅ Should navigate to `/session-view`
- ✅ Should scroll to the correct routine section (if `scrollTo` param is set)
- ✅ URL should contain `?scrollTo=movement` (or appropriate routine)

#### Test 1.2: Session View → Focus View (Exercise)
**Steps:**
1. Navigate to `/session-view`
2. Click on any exercise card (not completed)
3. Click on a completed exercise card

**Expected Results:**
- ✅ Should navigate to `/focus-view?routineType=X&exerciseName=Y`
- ✅ Exercise should load correctly
- ✅ Completed exercises should still be clickable but show different styling

#### Test 1.3: Session View → Focus View (Superset)
**Steps:**
1. Navigate to `/session-view`
2. Click on a Superset card

**Expected Results:**
- ✅ Should navigate to `/focus-view?superset=true&supersetType=X`
- ✅ Superset view should load with all exercises

#### Test 1.4: Focus View → Session View (Back Button)
**Steps:**
1. Navigate to `/focus-view` from session view
2. Click back button (ArrowLeft icon) in header
3. Click X button in intro screen
4. Click X button in superset view

**Expected Results:**
- ✅ Should navigate back to `/session-view`
- ✅ All back buttons should work consistently

#### Test 1.5: Session View → Home
**Steps:**
1. Navigate to `/session-view`
2. Click back button (ArrowLeft) in header

**Expected Results:**
- ✅ Should navigate to `/home`
- ✅ Should maintain scroll position or reset appropriately

---

### 2. Bottom Sheets - Session View

#### Test 2.1: Equipment Bottom Sheet
**Steps:**
1. Navigate to `/session-view`
2. Find a routine with equipment displayed
3. Click on an equipment button (Dumbbell icon with text)
4. Try closing via:
   - X button in header
   - Click outside overlay (on dark background)
   - Click on equipment button again

**Expected Results:**
- ✅ Sheet should open smoothly from bottom
- ✅ Equipment name should display in header
- ✅ All close methods should work
- ✅ Clicking equipment should NOT navigate to focus view
- ✅ Sheet should have max-height of 70vh

#### Test 2.2: Variations Bottom Sheet (Session View)
**Steps:**
1. Navigate to `/session-view`
2. Find an exercise with variations (white button with number)
3. Click the variations button
4. Try closing via:
   - X button in header
   - Click outside overlay
   - Click variations button again

**Expected Results:**
- ✅ Sheet should open smoothly
- ✅ Should show all exercise variations
- ✅ Current exercise should be marked with "Current" badge and green border
- ✅ Each variation should show equipment needed
- ✅ All close methods should work
- ✅ Sheet should have max-height of 80vh

---

### 3. Bottom Sheets - Focus View

#### Test 3.1: Variations Bottom Sheet (Focus View)
**Steps:**
1. Navigate to `/focus-view` with any exercise
2. Click the "Change" button (circular button with Shuffle icon)
3. Verify counter badge shows correct number
4. Try closing via:
   - X button in header
   - Click outside overlay

**Expected Results:**
- ✅ Sheet should open smoothly
- ✅ Counter badge should be visible on button (top-right corner)
- ✅ Should show all exercise variations
- ✅ Current exercise should be marked
- ✅ All close methods should work

#### Test 3.2: Exercise Details Sheet
**Steps:**
1. Navigate to `/focus-view` with any exercise
2. Click on exercise name or ChevronRight icon
3. Try closing the sheet

**Expected Results:**
- ✅ Sheet should open with exercise details
- ✅ Should show video, equipment, description, etc.
- ✅ Should close properly

#### Test 3.3: RPE Dropdown
**Steps:**
1. Navigate to `/focus-view` with any exercise
2. Click on RPE cell in the table
3. Select an RPE value
4. Click outside to close

**Expected Results:**
- ✅ Dropdown should appear below the clicked cell
- ✅ Should show all RPE options (1-10) with descriptions
- ✅ Selected value should update in table
- ✅ Dropdown should close after selection
- ✅ ChevronDown icon should be on the right side of cell

#### Test 3.4: Rest Time Selector
**Steps:**
1. Navigate to `/focus-view` with any exercise
2. Click on Rest Time cell in the table
3. Adjust minutes and seconds
4. Click "Select" button

**Expected Results:**
- ✅ Selector should open from bottom
- ✅ Should allow incrementing/decrementing minutes (0-59)
- ✅ Should allow incrementing/decrementing seconds (0-45, increments of 15)
- ✅ Selected time should update in table
- ✅ Selector should close after selection
- ✅ ChevronDown icon should be on the right side of cell

---

### 4. Edge Cases & Error Handling

#### Test 4.1: Multiple Sheets
**Steps:**
1. Open Equipment sheet
2. Try to open Variations sheet while Equipment is open

**Expected Results:**
- ✅ Only one sheet should be open at a time
- ✅ Opening new sheet should close previous one (or prevent opening)

#### Test 4.2: Navigation with Open Sheets
**Steps:**
1. Open any bottom sheet
2. Navigate away using back button

**Expected Results:**
- ✅ Sheet should close automatically
- ✅ Navigation should proceed normally
- ✅ No errors in console

#### Test 4.3: Variations Counter Badge
**Steps:**
1. Check exercises with variations > 1
2. Check exercises with variations = 1 or 0

**Expected Results:**
- ✅ Badge should only show when variations > 1
- ✅ Badge should show correct count
- ✅ Badge should be positioned correctly (top-right of button)

#### Test 4.4: Equipment Click Propagation
**Steps:**
1. Click on equipment button
2. Verify exercise card doesn't trigger navigation

**Expected Results:**
- ✅ Only equipment sheet should open
- ✅ Should NOT navigate to focus view
- ✅ Event propagation should be stopped correctly

#### Test 4.5: Table Alignment (Focus View)
**Steps:**
1. Navigate to `/focus-view`
2. Check table headers and cells

**Expected Results:**
- ✅ "Set" column should be centered
- ✅ "Reps", "Rest", "RPE" headers should be left-aligned
- ✅ "Reps", "Rest", "RPE" input cells should be left-aligned
- ✅ RPE and Rest cells should have ChevronDown on the right

---

### 5. Visual & UX Tests

#### Test 5.1: Sheet Animations
**Steps:**
1. Open and close various bottom sheets

**Expected Results:**
- ✅ Sheets should slide up smoothly when opening
- ✅ Sheets should slide down smoothly when closing
- ✅ Overlay should fade in/out

#### Test 5.2: Sheet Scrolling
**Steps:**
1. Open Variations sheet with many variations
2. Scroll through the list

**Expected Results:**
- ✅ Sheet should scroll smoothly
- ✅ Header should remain sticky at top
- ✅ Max height should be respected (80vh for variations, 70vh for equipment)

#### Test 5.3: Button States
**Steps:**
1. Hover over various buttons
2. Click buttons

**Expected Results:**
- ✅ Hover states should work (background color changes)
- ✅ Active states should be visible
- ✅ Buttons should be responsive

---

## 🐛 Known Issues to Watch For

1. **Sheet z-index conflicts** - Ensure sheets appear above all content
2. **Event propagation** - Equipment clicks shouldn't trigger navigation
3. **State management** - Closing sheets should reset state properly
4. **URL parameters** - Navigation should preserve/update URL params correctly
5. **Missing constants** - All constants should be defined (already fixed)

---

## ✅ Completion Criteria

All tests should pass with:
- ✅ No console errors
- ✅ No runtime errors
- ✅ Smooth animations
- ✅ Proper state management
- ✅ Correct navigation flow
- ✅ All bottom sheets open/close correctly

---

## 📝 Notes

- Test on different screen sizes if possible
- Test with different exercises (Movement, Strength, Throwing)
- Test with completed and incomplete exercises
- Verify counter badges show correct numbers
- Check that all icons render correctly

