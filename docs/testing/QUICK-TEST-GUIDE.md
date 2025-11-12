# Admin Settings - Quick Test Guide (5 minutes)

**Status:** ✅ All automated tests PASSED - Ready for manual testing
**URL:** http://localhost:3000/admin/settings (requires admin login)

---

## Critical Tests (5 minutes)

### 1. Desktop Navigation (2 min)
- [ ] Open http://localhost:3000/admin/settings
- [ ] Verify left sidebar is visible and sticky
- [ ] Click "Integrations" in left nav → should smooth scroll
- [ ] Click "Advanced" → should smooth scroll
- [ ] Scroll manually → watch URL hash change (#general, #users, etc.)

**✅ PASS if:** Sidebar stays fixed, clicking scrolls smoothly, hash updates

---

### 2. Mobile Navigation (1 min)
- [ ] Press F12 (DevTools)
- [ ] Press Ctrl+Shift+M (device emulation)
- [ ] Select iPhone 12 Pro
- [ ] Verify horizontal tabs appear at top
- [ ] Tap "Security" tab → should scroll to Security section

**✅ PASS if:** Tabs visible, desktop sidebar hidden, tapping scrolls

---

### 3. Form Interactions (1 min)
- [ ] Type in "Site Name" input → text appears
- [ ] Click "Maintenance Mode" switch → toggles ON/OFF
- [ ] Click "Weekly Reset Day" dropdown → opens and selects value

**✅ PASS if:** All inputs respond correctly

---

### 4. Save Button (1 min)
- [ ] Open browser Console (F12 → Console tab)
- [ ] Change "Site Name" to "Test"
- [ ] Click "Save Changes" in General section
- [ ] **Watch button:** Should show spinner + "Saving..."
- [ ] **Watch console:** Should log: `Saving general settings: {...}`

**✅ PASS if:** Button shows loading state, console logs data

---

## Quick Result

**All 4 tests pass?**
- ✅ YES → Implementation is working correctly
- ❌ NO → See detailed checklist: `admin-settings-manual-test-checklist.md`

---

## Next Steps After Testing

### If All Tests Pass:
```bash
# Ready to merge/deploy
git log --oneline -6  # Verify commits
```

### If Tests Fail:
1. Document issue in this format:
   ```
   Test: Desktop Navigation
   Issue: Clicking nav doesn't scroll
   Browser: Chrome 120
   ```
2. See full checklist for more detailed testing
3. Report issues for fixing

---

## Full Documentation

- **Detailed Testing:** `admin-settings-manual-test-checklist.md` (44 tests, 20-30 min)
- **Test Results:** `admin-settings-testing-report.md` (comprehensive report)
- **Completion Report:** `TASK-10-COMPLETION-REPORT.md` (full status)

---

**Estimated Time:** 5 minutes
**Automated Tests:** ✅ All PASSED
**Manual Tests:** ⏳ Ready for verification
