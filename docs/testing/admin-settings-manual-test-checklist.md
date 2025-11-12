# Admin Settings Manual Testing Checklist

## Pre-Testing Setup

1. **Ensure Dev Server is Running**
   ```bash
   pnpm dev
   ```
   Should be running on http://localhost:3000

2. **Login as Admin**
   - Navigate to: http://localhost:3000/dashboard/login
   - Login with admin credentials
   - Navigate to: http://localhost:3000/admin/settings

---

## Desktop Testing (≥1024px)

### Navigation Tests

- [ ] **T1.1** Left sidebar is visible and sticky
  - Scroll content area
  - Sidebar stays in place

- [ ] **T1.2** Active section highlighting
  - Scroll slowly through page
  - Watch left nav - active item should have:
    - Blue left border
    - Gray background
    - Bold text
    - Blue icon

- [ ] **T1.3** Click navigation to scroll
  - Click "General" → scrolls to General section
  - Click "Users & Roles" → scrolls to Users section
  - Click "Content" → scrolls to Content section
  - Click "Notifications" → scrolls to Notifications section
  - Click "Security" → scrolls to Security section
  - Click "Integrations" → scrolls to Integrations section
  - Click "Advanced" → scrolls to Advanced section
  - All scrolls should be smooth (animated)

- [ ] **T1.4** URL hash updates
  - Scroll manually through sections
  - Watch browser URL bar
  - Should see: #general, #users, #content, etc.

- [ ] **T1.5** Direct hash navigation
  - Navigate to: http://localhost:3000/admin/settings#advanced
  - Page should load scrolled to Advanced section
  - Try other hashes: #general, #integrations

---

## Mobile Testing (<1024px)

### Responsive Layout Tests

- [ ] **T2.1** Mobile view activation
  - Open Chrome DevTools (F12)
  - Click device toggle button (Ctrl+Shift+M / Cmd+Shift+M)
  - Select iPhone 12 Pro or similar
  - Verify:
    - Horizontal tabs appear at top
    - Left sidebar is hidden
    - Tabs show icons + labels

- [ ] **T2.2** Horizontal tab scrolling
  - Swipe left/right on tabs
  - Should scroll smoothly
  - All 7 tabs should be accessible

- [ ] **T2.3** Active tab highlighting
  - Scroll content area
  - Watch tabs at top
  - Active tab should:
    - Have blue background
    - White text
    - Other tabs gray background

- [ ] **T2.4** Tab click navigation
  - Tap each tab
  - Content should scroll to corresponding section
  - Test all 7 tabs

- [ ] **T2.5** Responsive breakpoint
  - Slowly resize browser from desktop to mobile width
  - Watch for smooth transition
  - No layout breaking at any width
  - Breakpoint is 1024px (lg: in Tailwind)

---

## Form Interactions

### Input Field Tests

- [ ] **T3.1** Site Name input (General section)
  - Click input field
  - Type "My Custom Wiki"
  - Verify text appears
  - Clear and type again
  - Use special characters: "Test & Demo's <Wiki>"

- [ ] **T3.2** XP per Workout input (Integrations section)
  - Click input field
  - Type "100"
  - Try negative: "-10" (should accept)
  - Try decimal: "25.5" (should accept)
  - Try text: "abc" (should reject)

- [ ] **T3.3** XP per Meal input (Integrations section)
  - Same tests as T3.2
  - Verify independent from Workout input

### Toggle Switch Tests

- [ ] **T3.4** Maintenance Mode switch (General section)
  - Click switch OFF → ON
  - Should show blue background
  - Click ON → OFF
  - Should show gray background
  - Click rapidly 5 times
  - Should be responsive

### Select Dropdown Tests

- [ ] **T3.5** Weekly Reset Day select (Advanced section)
  - Click dropdown trigger
  - Should open dropdown menu
  - See all 7 days listed
  - Click "Wednesday"
  - Dropdown closes
  - Shows "Wednesday" in trigger

- [ ] **T3.6** Select navigation
  - Open dropdown
  - Use arrow keys (up/down)
  - Press Enter to select
  - Use Escape to close without selecting

---

## Save Button Functionality

### General Section Save Tests

- [ ] **T4.1** Open browser console
  - Press F12
  - Click "Console" tab
  - Clear any existing logs

- [ ] **T4.2** General section save
  - Change "Site Name" to "Test"
  - Toggle "Maintenance Mode" ON
  - Click "Save Changes"
  - **Verify:**
    - Button shows spinner icon (left side)
    - Button text changes to "Saving..."
    - Button is disabled (not clickable)
    - After ~1 second, returns to "Save Changes"
  - **Console should show:**
    ```
    Saving general settings: { siteName: "Test", maintenanceMode: true }
    ```

### Integrations Section Save Tests

- [ ] **T4.3** Integrations section save
  - Change "XP per Workout" to "75"
  - Change "XP per Meal" to "15"
  - Click "Save Changes"
  - **Verify same loading behavior as T4.2**
  - **Console should show:**
    ```
    Saving XP settings: { xpPerWorkout: "75", xpPerMeal: "15" }
    ```

### Advanced Section Save Tests

- [ ] **T4.4** Advanced section save
  - Change "Weekly Reset Day" to "Friday"
  - Click "Save Changes"
  - **Verify same loading behavior as T4.2**
  - **Console should show:**
    ```
    Saving leaderboard settings: { weeklyResetDay: "5" }
    ```

### Error Handling Tests

- [ ] **T4.5** Multiple rapid clicks
  - Click any "Save Changes" button
  - Immediately click it again (while still saving)
  - Should NOT trigger second save
  - Button should stay disabled

- [ ] **T4.6** Save during scroll
  - Start scrolling content
  - Click "Save Changes" while scrolling
  - Should still work normally

---

## Visual Polish Tests

### Spacing & Layout

- [ ] **T5.1** Section spacing
  - All sections evenly spaced
  - No overlapping elements
  - Consistent padding

- [ ] **T5.2** Border & shadows
  - Each section has light gray border
  - No harsh lines
  - Clean, modern look

- [ ] **T5.3** Typography
  - Section titles: Large, bold, readable
  - Setting labels: Medium weight, black text
  - Descriptions: Small, gray text
  - All text readable

### Animation Tests

- [ ] **T5.4** Smooth scrolling
  - Click navigation items rapidly
  - Scrolling should queue smoothly
  - No janky movements
  - No layout shift

- [ ] **T5.5** Hover states
  - Hover over nav items (desktop)
  - Should show light gray background
  - Smooth color transition

- [ ] **T5.6** Button hover
  - Hover over "Save Changes" buttons
  - Should darken slightly
  - Cursor changes to pointer

---

## Browser Compatibility (Optional)

Test in multiple browsers if available:

- [ ] **T6.1** Chrome/Edge
- [ ] **T6.2** Firefox
- [ ] **T6.3** Safari
- [ ] **T6.4** Mobile Safari (iOS)
- [ ] **T6.5** Chrome Mobile (Android)

---

## Accessibility Tests (Optional)

- [ ] **T7.1** Keyboard navigation
  - Use Tab key to navigate
  - All interactive elements focusable
  - Focus indicators visible

- [ ] **T7.2** Screen reader
  - If available, test with screen reader
  - Labels properly associated
  - Sections announced correctly

---

## Issue Reporting Template

If you find any issues, document using this format:

```markdown
**Test ID:** T1.3
**Issue:** Navigation click doesn't scroll
**Steps to Reproduce:**
1. Click "Advanced" in left nav
2. Observe behavior
**Expected:** Smooth scroll to Advanced section
**Actual:** No scroll occurs
**Browser:** Chrome 120
**Device:** Desktop
**Screenshot:** [attach if applicable]
```

---

## Testing Sign-off

**Tester Name:** ________________
**Date:** ________________
**Total Tests:** 44
**Passed:** ____
**Failed:** ____
**Notes:**

---

## Quick Test (5 minutes)

If time is limited, run these critical tests only:

1. [ ] T1.1 - Desktop sidebar sticky
2. [ ] T1.3 - Click navigation scrolls
3. [ ] T2.1 - Mobile view shows tabs
4. [ ] T3.1 - Site Name input works
5. [ ] T3.4 - Toggle switch works
6. [ ] T3.5 - Select dropdown works
7. [ ] T4.2 - Save button works and shows console log
8. [ ] T5.4 - Smooth scrolling animation

---

**Estimated Full Test Time:** 20-30 minutes
**Estimated Quick Test Time:** 5 minutes
