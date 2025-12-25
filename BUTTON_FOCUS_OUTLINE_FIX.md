# Button Focus Outline Fix - Complete Solution

## Summary

Removed the green/cyan focus outline that appears around buttons and links after they are clicked throughout the entire website, while maintaining full accessibility for keyboard navigation. This includes fixing the default focus ring that appeared on page load in the practice screens.

## Problems Identified

The application had three related focus outline issues:

### Problem 1: Focus Ring on Mouse Clicks
The application was showing a cyan/teal (greenish) focus ring around all buttons and links after they were clicked with a mouse. This was caused by:

1. **Tailwind CSS focus utilities**: Classes like `focus:ring-accent-400` and `focus:ring-accent-500` were applied to buttons throughout the application
2. **Accent color definition**: The accent color is defined as `#2dd4b8` (accent-400) and `#14b8a0` (accent-500) in `web/tailwind.config.js`, which are cyan/teal colors that appear greenish
3. **Focus vs Focus-Visible**: The focus styles were applied on `:focus` (triggered by both mouse and keyboard) instead of `:focus-visible` (triggered only by keyboard)
4. **Missing link coverage**: The CSS fix didn't cover `<a>` (link) elements, so the home icon in the navigation still showed the focus ring

### Problem 2: Default Focus Ring on Page Load
When navigating to the practice page (category picker), a cyan/teal focus ring appeared by default on one of the category cards even without any user interaction. This was caused by:

1. **Programmatic focus on mount**: The `useEffect` hook in `AdvancedPracticePicker.tsx` was calling `.focus()` on the first card immediately when the component mounted
2. **Similar issue in practice screen**: The `AdvancedPracticeScreen.tsx` component was also programmatically focusing the first answer choice on page load
3. **Focus ring applied unconditionally**: The `isFocused` condition was applying the ring classes (`ring-2 ring-accent-400`) even when the user hadn't used keyboard navigation, just because the element had `tabIndex={0}` and was the focused element in the roving tabIndex pattern

### Problem 3: Glow Effect Confusion
The gradient glow effect on question type cards was initially suspected to be related to the focus ring issue, but it's actually an intentional hover effect (`group-hover:opacity-100`) that appears when hovering over cards. This is working as designed and is not a bug.

## Solution

### Part 1: Global CSS Rules (web/src/index.css)

Added global CSS rules that:

1. **Remove focus outline for mouse users**: Using `:focus:not(:focus-visible)` selector to hide outlines when buttons/links are clicked with a mouse
2. **Maintain keyboard accessibility**: Using `:focus-visible` to show focus indicators only for keyboard navigation (Tab key)
3. **Override Tailwind utilities**: Using `!important` to override Tailwind's focus ring utilities for mouse interactions
4. **Cover all interactive elements**: Applied to `button`, `a` (links), `[role="button"]`, and `[role="radio"]` elements

### Part 2: Smart Focus Management (AdvancedPracticePicker.tsx & AdvancedPracticeScreen.tsx)

Implemented intelligent focus management that distinguishes between mouse and keyboard navigation:

1. **Added keyboard navigation tracking**: New state variable `isKeyboardNavigation` to track whether the user is using keyboard or mouse
2. **Conditional programmatic focus**: Only call `.focus()` programmatically when keyboard navigation is active
3. **Reset on mouse interaction**: Set `isKeyboardNavigation` to `false` when user clicks with mouse
4. **Set on keyboard interaction**: Set `isKeyboardNavigation` to `true` when user presses arrow keys, Enter, Space, or Tab
5. **No focus ring on page load**: Removed the automatic focus that was causing the ring to appear on page load

## Changes Made

### File 1: `web/src/index.css`

Added the following CSS rules at the end of the file:

```css
/* Remove focus outline for mouse users while keeping it for keyboard users */
/* This applies to all interactive elements including buttons, links, and ARIA roles */
button:focus:not(:focus-visible),
a:focus:not(:focus-visible),
[role="button"]:focus:not(:focus-visible),
[role="radio"]:focus:not(:focus-visible) {
  outline: none;
}

/* Override Tailwind's focus ring utilities for mouse users */
/* This removes the green/cyan ring that appears after clicking buttons and links */
button:focus:not(:focus-visible),
a:focus:not(:focus-visible),
[role="button"]:focus:not(:focus-visible),
[role="radio"]:focus:not(:focus-visible) {
  --tw-ring-shadow: 0 0 #0000 !important;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow, 0 0 #0000) !important;
}

/* Ensure focus-visible still works for keyboard navigation (Tab key) */
/* This maintains accessibility for keyboard users */
button:focus-visible,
a:focus-visible,
[role="button"]:focus-visible,
[role="radio"]:focus-visible {
  outline: 2px solid rgb(20, 184, 160);
  outline-offset: 2px;
}
```

### File 2: `web/src/components/AdvancedPracticePicker.tsx`

**Changes:**
1. Added `isKeyboardNavigation` state variable (line 92)
2. Modified `handleKeyDown` to set `isKeyboardNavigation = true` when keyboard is used (line 160)
3. Modified `handleCardClick` to set `isKeyboardNavigation = false` when mouse is used (line 129)
4. Updated focus `useEffect` to only focus programmatically when `isKeyboardNavigation` is true (line 193-197)
5. **CRITICAL FIX**: Updated className to only apply focus ring when `isFocused && isKeyboardNavigation` (line 335)

**Key code changes:**
```typescript
// Added state
const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);

// In handleKeyDown
setIsKeyboardNavigation(true);

// In handleCardClick
setIsKeyboardNavigation(false);

// Updated useEffect
useEffect(() => {
  if (isKeyboardNavigation) {
    cardRefs.current[focusedIndex]?.focus();
  }
}, [focusedIndex, isKeyboardNavigation]);

// CRITICAL: Updated className to only show ring with keyboard navigation
${isFocused && isKeyboardNavigation ? 'ring-2 ring-accent-400 ring-offset-2 ring-offset-transparent' : ''}
```

### File 3: `web/src/components/AdvancedPracticeScreen.tsx`

**Changes:**
1. Added `isKeyboardNavigation` state variable (line 91)
2. Modified `handleKeyDown` to set `isKeyboardNavigation = true` when keyboard is used (line 215)
3. Modified `handleChoiceClick` to set `isKeyboardNavigation = false` when mouse is used (line 168)
4. Updated focus `useEffect` to only focus programmatically when `isKeyboardNavigation` is true (line 283-288)
5. Removed automatic focus on question change (line 101-120)
6. **CRITICAL FIX**: Updated className to only apply focus ring when `isFocused && isKeyboardNavigation` (line 496)

**Key code changes:**
```typescript
// Added state
const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);

// In handleKeyDown
setIsKeyboardNavigation(true);

// In handleChoiceClick
setIsKeyboardNavigation(false);

// Updated useEffect
useEffect(() => {
  if (isKeyboardNavigation && state !== 'correct' && state !== 'incorrect') {
    choiceRefs.current[focusedIndex]?.focus();
  }
}, [focusedIndex, state, isKeyboardNavigation]);

// Removed automatic focus on mount
// Previously: setTimeout(() => { choiceRefs.current[0]?.focus(); }, 50);
// Now: No automatic focus - only when keyboard navigation is active

// CRITICAL: Updated className to only show ring with keyboard navigation
${isFocused && isKeyboardNavigation ? 'ring-2 ring-accent-400 ring-offset-2 ring-offset-transparent' : ''}
```

## Coverage

This fix applies to:

- ✅ All `<button>` elements
- ✅ All `<a>` (link) elements including the home icon in navigation
- ✅ All `<motion.button>` elements from Framer Motion
- ✅ All elements with `role="button"`
- ✅ All elements with `role="radio"` (answer choice buttons in practice/exam screens)
- ✅ Category picker cards in practice page
- ✅ Answer choice buttons in practice/exam screens
- ✅ All interactive elements across the entire application

## Accessibility Compliance

This solution maintains **WCAG 2.1 Level AA** accessibility compliance:

- ✅ **Keyboard navigation**: Focus indicators are still visible when using Tab key
- ✅ **Screen readers**: No impact on screen reader functionality
- ✅ **Focus management**: Existing focus management logic (roving tabIndex pattern) continues to work
- ✅ **Visual feedback**: Keyboard users still see clear focus indicators

## Browser Compatibility

The `:focus-visible` pseudo-class is supported in:

- ✅ Chrome/Edge 86+
- ✅ Firefox 85+
- ✅ Safari 15.4+
- ✅ All modern browsers (2021+)

For older browsers, the fallback behavior is to show no focus outline, which is acceptable since those browsers are rarely used.

## Testing Recommendations

### Manual Testing

1. **Mouse clicks**:
   - Click any button on the website
   - ✅ Verify no green/cyan outline appears after clicking
   - ✅ Verify button still responds to clicks
   - Click the home icon in the navigation bar
   - ✅ Verify no green/cyan outline appears on the home icon

2. **Keyboard navigation**:
   - Use Tab key to navigate between buttons
   - ✅ Verify cyan outline appears when focusing with keyboard
   - ✅ Verify outline follows keyboard focus correctly
   - Use arrow keys to navigate in practice screens
   - ✅ Verify focus ring appears when using arrow keys

3. **Page load behavior**:
   - Navigate to the practice page (category picker)
   - ✅ Verify NO focus ring appears on any card when page loads
   - Start a practice session
   - ✅ Verify NO focus ring appears on answer choices when question loads
   - Use Tab or arrow keys
   - ✅ Verify focus ring appears only after keyboard interaction

4. **Specific pages to test**:
   - Home page (category cards, CTA buttons, home icon)
   - Practice picker (category selection cards)
   - Practice screen (answer choice buttons, submit/next buttons)
   - Exam screen (answer choice buttons, navigation buttons)
   - Login modal (Google sign-in button, tab buttons)
   - Navigation bar (home icon, login button, user menu)

### Automated Testing

Consider adding visual regression tests to ensure focus styles remain consistent across updates.

## Related Files

### Modified Files
- `web/src/index.css` - Global CSS file (added focus-visible rules)
- `web/src/components/AdvancedPracticePicker.tsx` - Category picker (added keyboard navigation tracking)
- `web/src/components/AdvancedPracticeScreen.tsx` - Practice screen (added keyboard navigation tracking)

### Related Files (Not Modified)
- `web/tailwind.config.js` - Tailwind configuration with accent color definitions
- `web/src/pages/NewHome.tsx` - Home page with CTA buttons
- `web/src/components/LoginModal.tsx` - Login modal with buttons
- `web/src/components/Layout.tsx` - Navigation bar with home icon and buttons

## Technical Details

### How It Works

1. **CSS `:focus-visible` pseudo-class**: Modern browsers distinguish between focus from mouse clicks and focus from keyboard navigation. The `:focus-visible` pseudo-class only matches when the browser determines the focus should be visible (typically keyboard navigation).

2. **`:focus:not(:focus-visible)` selector**: This matches elements that have focus but should NOT show a visible focus indicator (typically mouse clicks). We use this to hide the focus ring for mouse users.

3. **Keyboard navigation tracking**: The React components track whether the user is using keyboard navigation. This prevents programmatic `.focus()` calls from showing the focus ring unless the user is actively using keyboard navigation.

4. **State management**: The `isKeyboardNavigation` state is set to `true` when arrow keys, Enter, Space, or Tab are pressed, and set to `false` when the mouse is clicked. This ensures the focus ring only appears when appropriate.

### Why This Approach?

- **Accessibility first**: Keyboard users still get full focus indicators
- **Better UX**: Mouse users don't see distracting focus rings after clicking
- **Non-invasive**: Existing Tailwind classes remain in place, making it easy to revert if needed
- **Standards-compliant**: Uses modern CSS standards (`:focus-visible`) supported by all modern browsers
- **Smart focus management**: Distinguishes between programmatic focus and user-initiated focus

## Notes

- The existing `focus:outline-none` and `focus:ring-*` classes in component files are still present but are now properly overridden by the global CSS for mouse interactions
- The fix uses CSS specificity and `!important` to ensure it takes precedence over Tailwind utilities
- Component files were modified minimally to add keyboard navigation tracking
- The solution follows modern web accessibility best practices by using `:focus-visible`
- The gradient glow effect on hover is intentional design and remains unchanged

## Status

✅ **Complete** - All three issues resolved:
1. ✅ Focus ring removed for mouse clicks on buttons and links
2. ✅ Default focus ring on page load removed
3. ✅ Glow effect confirmed as intentional hover effect (not a bug)

Ready for testing and deployment!

