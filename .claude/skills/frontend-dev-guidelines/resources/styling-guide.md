# Styling Guide - Magnus Aesthetic

Modern styling patterns for Carve using Tailwind CSS with Magnus-inspired dark theme, gradient visualizations, and sophisticated color palette.

---

## Magnus Design System

### Color Palette

**Backgrounds:**
```typescript
// Primary backgrounds
bg-[#0a0e1a]  // Very dark navy/black (main background)
bg-[#111827]  // Dark gray (secondary background)

// Card backgrounds
bg-[#1a1f2e]  // Slightly lighter dark (card background)
bg-[#1f2937]  // Card variant
```

**Accent Colors:**
```typescript
// Primary accents
bg-purple-500  // #8b5cf6 (primary violet)
bg-purple-400  // #a78bfa (lighter purple)

// Secondary accents
bg-teal-500    // #14b8a6 (teal for positive metrics)
bg-orange-400  // #fb923c (orange for warnings/energy)
bg-green-500   // #22c55e (green for success/health)
bg-blue-400    // #60a5fa (blue for info/water)
```

**Text Colors:**
```typescript
text-white           // #ffffff (primary text)
text-white/90        // 90% opacity (secondary text)
text-white/60        // 60% opacity (tertiary text)
text-gray-400        // #9ca3af (muted text)
```

**Borders & Dividers:**
```typescript
border-white/10      // 10% opacity white borders
border-white/20      // 20% opacity for emphasis
border-gray-800      // Subtle dark borders
```

---

## Tailwind Utility Patterns

### Card Component Base

**DarkCard pattern:**
```typescript
<div className="bg-[#1a1f2e] rounded-xl shadow-lg border border-white/10 p-6">
  {/* Content */}
</div>
```

**With gradient overlay:**
```typescript
<div className="relative bg-[#1a1f2e] rounded-xl overflow-hidden">
  {/* Gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent" />

  {/* Content */}
  <div className="relative z-10 p-6">
    {/* Your content here */}
  </div>
</div>
```

---

## Gradient Visualizations

### Blur Gradient (Step Count style)

```typescript
<div className="relative h-64 bg-[#1a1f2e] rounded-xl overflow-hidden">
  {/* Yellow-green gradient blur */}
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <div className="w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-60" />
    <div className="absolute top-0 w-32 h-32 bg-green-500 rounded-full blur-3xl opacity-40" />
  </div>

  {/* Content overlay */}
  <div className="relative z-10 p-8">
    <div className="text-6xl font-bold text-white">
      7,166
    </div>
    <div className="text-sm text-white/60">steps</div>
  </div>
</div>
```

### Colorful Timeline (Mental Health style)

```typescript
<div className="flex gap-px h-24">
  {timelineData.map((item, i) => (
    <div
      key={i}
      className="flex-1 rounded-sm transition-colors hover:opacity-80"
      style={{
        backgroundColor: `hsl(${item.hue}, 70%, 60%)`,
        opacity: item.intensity
      }}
    />
  ))}
</div>
```

### Dot Matrix Visualization (Sleep pattern style)

```typescript
<div className="grid grid-cols-7 gap-1">
  {sleepData.map((value, i) => (
    <div
      key={i}
      className="w-2 h-2 rounded-full transition-all hover:scale-125"
      style={{
        backgroundColor: value > 0.7 ? '#8b5cf6' :
                        value > 0.4 ? '#a78bfa' :
                        '#e9d5ff',
        opacity: value
      }}
    />
  ))}
</div>
```

---

## Typography

### Heading Hierarchy

```typescript
// Main page title
<h1 className="text-4xl font-bold text-white">
  Mental Health
</h1>

// Section title
<h2 className="text-2xl font-semibold text-white">
  Sleep and Recovery
</h2>

// Widget title
<h3 className="text-lg font-semibold text-white mb-4">
  Nutrition Tracking
</h3>

// Metric label
<div className="text-sm text-white/60 uppercase tracking-wide">
  Stress Levels
</div>
```

### Number Display

**Large metrics:**
```typescript
<div className="text-6xl font-bold text-white">
  7,166
</div>
<div className="text-sm text-white/60">
  steps
</div>
```

**Stats grid:**
```typescript
<div className="grid grid-cols-3 gap-4">
  <div>
    <div className="text-3xl font-bold text-white">2,000</div>
    <div className="text-xs text-white/60">Calorie intake</div>
  </div>
  <div>
    <div className="text-3xl font-bold text-white">35%</div>
    <div className="text-xs text-white/60">Vitamins/minerals</div>
  </div>
  <div>
    <div className="text-3xl font-bold text-white">2.5L/day</div>
    <div className="text-xs text-white/60">Hydration Levels</div>
  </div>
</div>
```

---

## Spacing & Layout

### Card Padding

```typescript
// Standard card
p-6          // 24px padding

// Large widget
p-8          // 32px padding

// Compact card
p-4          // 16px padding
```

### Grid Layouts

**Dashboard grid:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="col-span-1 md:col-span-2">
    {/* Wide widget */}
  </div>
  <div className="col-span-1">
    {/* Narrow widget */}
  </div>
</div>
```

**Responsive spacing:**
```typescript
// Container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Section spacing
<div className="space-y-6">
  {/* Vertically stacked items */}
</div>
```

---

## Glassmorphism Effects

### Subtle Glass Card

```typescript
<div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
  {/* Content */}
</div>
```

### Frosted Overlay

```typescript
<div className="relative">
  {/* Background content */}

  {/* Glass overlay */}
  <div className="absolute inset-0 backdrop-blur-sm bg-black/20 rounded-xl" />

  {/* Foreground content */}
  <div className="relative z-10 p-6">
    {/* Your content */}
  </div>
</div>
```

---

## Interactive States

### Hover Effects

```typescript
// Subtle hover
className="hover:bg-white/5 transition-colors"

// Scale on hover
className="hover:scale-105 transition-transform"

// Glow effect
className="hover:shadow-lg hover:shadow-purple-500/20 transition-shadow"
```

### Button Styles

**Primary action:**
```typescript
<button className="bg-purple-500 hover:bg-purple-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
  Take Action
</button>
```

**Secondary action:**
```typescript
<button className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-lg border border-white/20 transition-colors">
  View Details
</button>
```

**Ghost button:**
```typescript
<button className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg transition-all">
  Cancel
</button>
```

---

## Responsive Breakpoints

**Tailwind breakpoints:**
```typescript
sm:   640px  // Small devices
md:   768px  // Tablets
lg:   1024px // Laptops
xl:   1280px // Desktops
2xl:  1536px // Large desktops
```

**Common patterns:**
```typescript
// Hide on mobile, show on desktop
<div className="hidden lg:block">
  {/* Desktop only */}
</div>

// Stack on mobile, grid on desktop
<div className="flex flex-col md:grid md:grid-cols-2 gap-4">
  {/* Responsive layout */}
</div>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
  {/* Scales with screen size */}
</div>
```

---

## Dark Theme Patterns

### Background Layers

```typescript
// Level 1: Page background
bg-[#0a0e1a]

// Level 2: Section background
bg-[#111827]

// Level 3: Card background
bg-[#1a1f2e]

// Level 4: Elevated element
bg-[#1f2937]
```

### Contrast & Accessibility

**Ensure readable contrast:**
```typescript
// Good contrast (4.5:1 minimum)
<div className="bg-[#1a1f2e] text-white">
  Primary text with good contrast
</div>

// Secondary text (3:1 minimum)
<div className="bg-[#1a1f2e] text-white/80">
  Secondary text still readable
</div>

// Avoid low contrast
<div className="bg-[#1a1f2e] text-gray-600">
  {/* ❌ Too low contrast */}
</div>
```

---

## Component Style Patterns

### Widget Card Template

```typescript
<div className="bg-[#1a1f2e] rounded-xl shadow-lg border border-white/10 p-6 hover:border-white/20 transition-colors">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-white">
      Widget Title
    </h3>
    <span className="text-sm text-white/60">
      Metadata
    </span>
  </div>

  {/* Content */}
  <div className="space-y-4">
    {/* Your widget content */}
  </div>
</div>
```

### Stat Display

```typescript
<div className="flex items-baseline gap-2">
  <div className="text-4xl font-bold text-white">
    8.1
  </div>
  <div className="text-sm text-green-400">
    +2.1 ↗
  </div>
</div>
<div className="text-sm text-white/60">
  Dopamine levels
</div>
```

### Progress Indicator

```typescript
<div>
  <div className="flex justify-between text-sm mb-2">
    <span className="text-white">Deep sleep</span>
    <span className="text-white/80">72%</span>
  </div>
  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all"
      style={{ width: '72%' }}
    />
  </div>
</div>
```

---

## Utility Combinations

**Frequently used patterns:**
```typescript
// Card base
"bg-[#1a1f2e] rounded-xl shadow-lg border border-white/10 p-6"

// Flex center
"flex items-center justify-center"

// Text muted
"text-sm text-white/60"

// Hover card
"hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer"

// Gradient text
"bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
```

---

## Custom CSS Variables

**Define in global CSS:**
```css
@layer base {
  :root {
    --bg-primary: #0a0e1a;
    --bg-secondary: #111827;
    --bg-card: #1a1f2e;
    --bg-elevated: #1f2937;

    --accent-purple: #8b5cf6;
    --accent-teal: #14b8a6;
    --accent-orange: #fb923c;
    --accent-green: #22c55e;
  }
}
```

**Use in Tailwind:**
```typescript
<div className="bg-[var(--bg-card)]">
  {/* Uses CSS variable */}
</div>
```

---

## Animation & Transitions

### Smooth Transitions

```typescript
// All properties
className="transition-all duration-300"

// Specific properties
className="transition-colors duration-200"
className="transition-transform duration-300"
className="transition-opacity duration-150"
```

### Fade In Animation

```typescript
<div className="animate-in fade-in duration-500">
  {/* Fades in on mount */}
</div>
```

### Slide In Animation

```typescript
<div className="animate-in slide-in-from-bottom-4 duration-700">
  {/* Slides up on mount */}
</div>
```

---

## Summary

**Magnus Aesthetic Checklist:**
- ✅ Dark navy/black backgrounds (#0a0e1a, #111827, #1a1f2e)
- ✅ Colorful accents (purple, teal, orange, green)
- ✅ Gradient visualizations for data
- ✅ Generous spacing (p-6, p-8)
- ✅ Subtle borders (border-white/10)
- ✅ Glassmorphism effects
- ✅ Large, bold numbers
- ✅ Smooth transitions
- ✅ Responsive design

**See Also:**
- [component-patterns.md](component-patterns.md) - Component structure
- [complete-examples.md](complete-examples.md) - Full widget examples
