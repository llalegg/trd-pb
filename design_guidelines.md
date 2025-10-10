# Program Builder Design Guidelines

## Design Approach: System-Based (shadcn/ui + Linear/Vercel Aesthetic)

**Selected System:** shadcn/ui (New York variant) with design inspiration from Linear and Vercel dashboards
**Justification:** Utility-focused program management tool requiring efficient data display and minimal visual distraction. Standard UI patterns prioritize usability over visual experimentation.

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background Base: 222 47% 11% (deep charcoal)
- Surface: 217 33% 17% (elevated panels)
- Border: 217 33% 23% (subtle separation)
- Primary: 217 91% 60% (blue for actions/CTAs)
- Muted Text: 215 20% 65% (secondary content)
- Foreground: 213 31% 91% (primary text)
- Destructive: 0 63% 31% (delete actions)

**Accent Colors:**
- Success: 142 71% 45% (status indicators)
- Warning: 48 96% 53% (alerts, if needed)

---

### B. Typography

**Font Stack:** 
- Primary: 'Inter' or system font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI')

**Hierarchy:**
- Page Title: text-2xl font-semibold (24px)
- Table Headers: text-sm font-medium (14px, uppercase tracking)
- Body/Table Data: text-sm font-normal (14px)
- Form Labels: text-sm font-medium (14px)
- Buttons: text-sm font-medium (14px)

---

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8
- Component padding: p-6 (24px)
- Section gaps: gap-6 (24px)
- Table cell padding: px-4 py-3 (16px/12px)
- Form field spacing: space-y-4 (16px)
- Button padding: px-4 py-2 (16px/8px)

**Container:**
- Max-width: max-w-7xl (1280px) - gives breathing room within the 1200px constraint
- Horizontal padding: px-6 on mobile, px-8 on desktop
- Vertical padding: py-8 to py-12

---

### D. Component Library

**Table Component:**
- Zebra striping: Subtle alternating row backgrounds (5% opacity difference)
- Hover state: Slight background lift on row hover
- Compact row height: Minimal vertical padding for data density
- Right-aligned actions column with icon buttons
- Sticky header on scroll (if table grows)

**Dialog/Modal:**
- Overlay: Semi-transparent backdrop (bg-black/50 with backdrop-blur-sm)
- Modal card: Elevated surface with border-t accent
- Width: max-w-lg (512px)
- Padding: p-6 with pb-8 for form content
- Header with title and close button (X icon)

**Form Elements:**
- Searchable Dropdown: Dark input with white text, focus ring in primary color
- Date Picker: Popover-based calendar, dark theme with primary highlights
- Input focus state: ring-2 ring-primary with smooth transition
- Field labels: Above inputs with text-sm font-medium
- Form buttons: Full-width on mobile, inline on desktop

**Buttons:**
- Primary: Solid background with primary color, white text
- Secondary: Outline variant with border, transparent background
- Icon Buttons (Actions): Ghost variant, show on row hover only
- Sizes: Default height h-10, icon buttons h-9 w-9

**Action Icons:**
- Edit: Pencil icon
- Delete: Trash icon  
- Size: 16px (w-4 h-4)
- Color: Muted on default, destructive on delete hover

---

### E. Interactions & Micro-animations

**Minimal Animation Strategy:**
- Dialog entrance: Fade + scale from 95% to 100% (150ms ease-out)
- Table row hover: Background transition (100ms)
- Button hover: Subtle background lightening (150ms)
- Form validation: No animations (instant feedback)
- Focus rings: Instant appearance (0ms)

**NO Animations:**
- Page transitions
- Data loading states (use static spinners if needed)
- Icon transformations
- Scroll effects

---

## Layout Structure

**Page Composition:**
1. **Header Bar** (sticky top)
   - Page title: "Program Builder" (left)
   - "Add Program" button (right)
   - Bottom border separator

2. **Main Content Area**
   - Centered container with max-w-7xl
   - Programs table fills width
   - Minimum 60vh height to prevent cramping

3. **Table Layout**
   - Column widths: Athlete (40%), Start Date (20%), End Date (20%), Actions (20%)
   - Fixed header row with sorting icons (UI only)
   - 3-5 rows of mock data initially

4. **Modal Form Layout**
   - Vertical form stack with space-y-6
   - Fields at full width within modal
   - Button group at bottom: Cancel (left) + Submit (right) with gap-3

---

## Responsive Behavior

**Desktop (1024px+):**
- Full table visible
- Modal centered with max-w-lg
- Inline button layouts

**Tablet (768px-1023px):**
- Table horizontal scroll if needed
- Modal at 90% width
- Maintain all columns

**Mobile (<768px):**
- Stack certain table columns if space is tight
- Modal full-width with m-4 margin
- Full-width buttons in form

---

## Accessibility Notes

- All form inputs have associated labels (not placeholders only)
- Modal traps focus when open
- Table headers use proper semantic markup
- Icon buttons include aria-labels
- Minimum 4.5:1 contrast ratio for all text
- Keyboard navigation for all interactive elements