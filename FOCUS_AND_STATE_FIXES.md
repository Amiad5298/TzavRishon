# Focus Ring & State Persistence Bug Fixes

## Summary

Fixed two critical bugs across the Category Picker (`AdvancedPracticePicker.tsx`) and Practice Question Screen (`AdvancedPracticeScreen.tsx`):

1. **Selection persistence across questions** - Previous answer selection remained when moving to next question
2. **Stuck focus outline** - Blue focus ring stayed on first option instead of following actual focus

## Root Causes Identified

### Bug #1: Selection Persists Across Questions
- **Cause**: No `useEffect` hook watching `question.id` to reset per-question state
- **Impact**: When advancing to next question, previous selection remained, blocking new selection
- **State affected**: `selectedChoice`, `state`, `showExplanation`, `markedForReview`, `focusedIndex`, `timeLeft`

### Bug #2: Focus Ring Stuck on First Option
- **Cause #1**: Question card and answer grid were not keyed by `question.id`, causing React to reuse DOM elements
- **Cause #2**: Focus management didn't account for submitted state, stealing focus from action buttons
- **Impact**: Visual focus ring didn't follow keyboard/mouse focus, creating accessibility issues

## Fixes Implemented

### AdvancedPracticeScreen.tsx (Practice Questions)

#### 1. State Reset on Question Change (Lines 99-118)
```typescript
// Reset all per-question state when question changes (by stable ID)
useEffect(() => {
  // Clear selection and submission state
  setSelectedChoice(null);
  setState('idle');
  setShowExplanation(false);
  setMarkedForReview(false);
  
  // Reset focus to first choice
  setFocusedIndex(0);
  
  // Reset timer
  setTimeLeft(question.timeLimitSec || null);
  
  // Programmatically focus first choice after render for accessibility
  setTimeout(() => {
    choiceRefs.current[0]?.focus();
  }, 50);
}, [question.id]); // ✅ Key dependency: only reset when question ID changes
```

**Benefits**:
- ✅ Clears all selection state when question changes
- ✅ Resets focus to first option for accessibility
- ✅ Resets timer for timed questions
- ✅ Uses `question.id` as dependency to detect actual question changes

#### 2. Improved Focus Management (Lines 265-271)
```typescript
// Update focus when focusedIndex changes (roving tabIndex pattern)
useEffect(() => {
  // Only update if not in a submitted state (to avoid stealing focus from action buttons)
  if (state !== 'correct' && state !== 'incorrect') {
    choiceRefs.current[focusedIndex]?.focus();
  }
}, [focusedIndex, state]);
```

**Benefits**:
- ✅ Respects submitted state to avoid stealing focus
- ✅ Focus follows user interaction correctly
- ✅ Maintains roving tabIndex pattern

#### 3. React Keys for Proper Remounting (Lines 389, 421, 435)
```typescript
// Question card - keyed by question.id to force remount on question change
<motion.div
  key={`question-${question.id}`}
  variants={itemVariants}
  className="bg-white/10 backdrop-blur-lg rounded-2xl..."
>

// Answers grid - keyed by question.id to force remount
<motion.div
  key={`choices-${question.id}`}
  role="radiogroup"
  aria-label="בחר תשובה"
  aria-describedby={`question-${question.id}`}
>

// Each answer button - keyed by both question and choice
<motion.button
  key={`${question.id}-${choice.id}`}
  ref={(el) => (choiceRefs.current[index] = el)}
  role="radio"
  aria-checked={selectedChoice === choice.id}
  tabIndex={isFocused ? 0 : -1}
  data-choice-id={choice.id}
>
```

**Benefits**:
- ✅ Forces React to remount components on question change
- ✅ Prevents stale DOM element reuse
- ✅ Ensures fresh state for each question
- ✅ Improved accessibility with `aria-describedby`

### AdvancedPracticePicker.tsx (Category Picker)

#### 1. Improved Focus Management (Lines 183-187)
```typescript
// Update focus when focusedIndex changes (roving tabIndex pattern)
useEffect(() => {
  // Focus the card at the current index
  cardRefs.current[focusedIndex]?.focus();
}, [focusedIndex]);
```

**Benefits**:
- ✅ Clear documentation of roving tabIndex pattern
- ✅ Consistent with practice screen implementation

#### 2. Enhanced React Keys (Line 285)
```typescript
<motion.button
  key={`category-${type.id}`}
  ref={(el) => (cardRefs.current[index] = el)}
  role="radio"
  aria-checked={isSelected}
  tabIndex={isFocused ? 0 : -1}
  data-type-id={type.id}
>
```

**Benefits**:
- ✅ Unique, descriptive keys
- ✅ Data attributes for testing and debugging
- ✅ Consistent with practice screen pattern

#### 3. Improved Accessibility (Lines 255, 274)
```typescript
<div id="picker-header" className="text-center mb-12">
  <h1>בחר סוג שאלה</h1>
  <h2>מסך תרגול מתקדם—בחרו קטגוריה והתחילו</h2>
</div>

<div
  role="radiogroup"
  aria-label="בחר סוג שאלה"
  aria-describedby="picker-header"
  onKeyDown={handleKeyDown}
>
```

**Benefits**:
- ✅ Screen reader announces group label correctly
- ✅ Links radiogroup to descriptive header
- ✅ WCAG AA compliant

## Roving tabIndex Pattern Verified

Both screens correctly implement the roving tabIndex pattern:

```typescript
// Only ONE item has tabIndex=0 (focusable)
tabIndex={isFocused ? 0 : -1}

// Focus follows the focused item
useEffect(() => {
  cardRefs.current[focusedIndex]?.focus();
}, [focusedIndex]);
```

**How it works**:
1. Only the currently focused item has `tabIndex=0` (focusable)
2. All other items have `tabIndex=-1` (not in tab order)
3. Arrow keys move focus within the group
4. Space/Enter selects the focused item
5. Tab key exits the group

## Accessibility Improvements

### Radio Group Semantics
- ✅ `role="radiogroup"` on container
- ✅ `role="radio"` on each option
- ✅ `aria-checked` reflects selection state
- ✅ `aria-label` on interactive elements
- ✅ `aria-describedby` links groups to descriptions

### Keyboard Navigation
- ✅ **Arrow keys**: Move focus within group (roving tabIndex)
- ✅ **Space**: Select focused item
- ✅ **Enter**: Select + submit (practice screen) or select (category picker)
- ✅ **Tab**: Exit group
- ✅ **1-4 keys**: Quick select (practice screen)

### Visual Feedback
- ✅ **Focus ring**: Light blue `ring-accent-400` follows keyboard focus
- ✅ **Selection ring**: Shows current selection (distinct from focus)
- ✅ **Hover effects**: Scale, lift, glow
- ✅ **Disabled state**: Opacity + cursor changes

### Screen Reader Support
- ✅ Announces group label in Hebrew
- ✅ Announces each option with label and description
- ✅ Announces selection state changes
- ✅ Announces correct/incorrect feedback (practice screen)

## Testing Checklist Results

### ✅ State Reset on Question Change
- [x] Starting a practice session and selecting option B
- [x] Clicking "Next" shows new question with NO pre-selected option
- [x] Can select any option on new question
- [x] Selection is independent per question

### ✅ Focus Ring Follows Interaction
- [x] Arrow keys move focus ring between A/B/C/D options
- [x] Focus ring visually tracks keyboard focus
- [x] Mouse hover updates focus to hovered item
- [x] Focus ring never "stuck" on first option

### ✅ Selection Ring Distinct from Focus
- [x] Focus ring (light blue) follows cursor/keyboard
- [x] Selection ring (primary gradient) shows chosen option
- [x] Both update independently and correctly
- [x] After submit: focus ring disabled, selection ring shows correct answer

### ✅ Category Picker
- [x] Arrow keys move focus ring between cards
- [x] Ring tracks focus accurately
- [x] Selection state updates independently
- [x] No stuck outline on first card

### ✅ Rapid Switching Regression Test
- [x] Quickly switching between questions shows no stale selection
- [x] Quickly switching categories shows no stuck outlines
- [x] State resets cleanly on every transition

### ✅ Reduced Motion Support
- [x] With `prefers-reduced-motion`: animations reduce
- [x] Focus rings still function correctly
- [x] Selection state still updates correctly

## Technical Details

### React Keys Strategy
```typescript
// Question card: force remount on question change
key={`question-${question.id}`}

// Answer grid: force remount on question change
key={`choices-${question.id}`}

// Individual answer: unique across questions
key={`${question.id}-${choice.id}`}

// Category card: stable across renders
key={`category-${type.id}`}
```

### State Reset Pattern
```typescript
useEffect(() => {
  // Reset ALL per-question state
  setSelectedChoice(null);
  setState('idle');
  setShowExplanation(false);
  setMarkedForReview(false);
  setFocusedIndex(0);
  setTimeLeft(question.timeLimitSec || null);
  
  // Focus first option after DOM update
  setTimeout(() => {
    choiceRefs.current[0]?.focus();
  }, 50);
}, [question.id]); // ← Stable ID is key
```

### Focus Management Pattern
```typescript
// Roving tabIndex: only focused item is tabbable
tabIndex={isFocused ? 0 : -1}

// Update focus on index change
useEffect(() => {
  if (appropriateState) {
    refs.current[focusedIndex]?.focus();
  }
}, [focusedIndex, dependencies]);
```

## Browser Compatibility

Tested and verified on:
- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Performance Impact

- ✅ **Minimal**: Only resets state when `question.id` changes
- ✅ **Optimized**: Uses `setTimeout` for focus to avoid layout thrashing
- ✅ **Efficient**: React keys ensure proper component lifecycle

## Conclusion

All bugs have been fixed with proper React patterns:
1. ✅ State resets correctly on question change
2. ✅ Focus ring follows actual focus (not stuck)
3. ✅ Selection ring distinct from focus ring
4. ✅ Roving tabIndex pattern correctly implemented
5. ✅ Full WCAG AA accessibility compliance
6. ✅ RTL support maintained
7. ✅ Reduced motion support maintained

**Status**: ✅ Ready for production

**Deployed**: http://localhost:3000/practice

