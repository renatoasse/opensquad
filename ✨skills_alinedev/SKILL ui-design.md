---
name: ui-design-system
description: Guidelines and patterns for modern professional web UI design using Tailwind CSS and Lucide React.
---

# UI Design System: Tailwind CSS & Lucide React

This skill provides guidelines, best practices, and standard patterns for creating modern, professional, and visually stunning web interfaces using Tailwind CSS and Lucide React icons. This design system focuses on high-quality aesthetics, usability, and consistent engineering principles.

## 1. Core Principles

- **Professional & Clean Aesthetics**: Prioritize whitespace, clean typography, and subtle visual cues. Interfaces should feel lightweight, sophisticated, and uncluttered.
- **Consistent Spacing & Sizing**: Strictly use Tailwind's default spacing scale. Avoid arbitrary values (e.g., `w-[123px]`, `p-[17px]`) unless absolutely required by a rigid specification.
- **Border Radius (Standard Rounding)**: Maintain a standard border radius of **7px to 10px** for most UI components to ensure a friendly yet highly polished, professional appearance. In Tailwind, rely heavily on the `rounded-lg` (8px) utility, supplemented by `rounded-md` (6px) for slightly smaller nested components. Avoid excessive rounding unless doing fully pill-shaped horizontal badges (`rounded-full`).
- **Subtle Interactivity**: Components should provide immediate, soft feedback on interaction (hover, focus, active states) using smooth transitions and subtle color, opacity, or shadow changes.
- **Meaningful Iconography**: Use Lucide React icons intentionally to support text, clarify actions, guide the user, and establish visual hierarchy. Never use icons just for the sake of decoration if they clutter the UI.
- **Accessibility (a11y)**: Ensure sufficient color contrast, logical keyboard focus order, and appropriate ARIA attributes for screen readers.

## 2. Typography

Use modern, legible, and highly engineered fonts (like Inter, Roboto, SF Pro, or Outfit).

- **Headings**: Robust, high-contrast, and well-kerned. Use `tracking-tight` for large headings to make them look cohesive.
- **Body Text**: Highly legible. Use `text-slate-600` or `text-gray-600` for secondary text to reduce cognitive load and establish visual hierarchy against `text-slate-900` primary text.
- **Leading**: Use standard Tailwind leading classes (`leading-tight` for headings, `leading-relaxed` or `leading-7` for chunks of body copy).

**Example:**
```tsx
<div className="max-w-xl">
  <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
    Dashboard Overview
  </h1>
  <p className="mt-2 text-lg leading-8 text-slate-600">
    Monitor your key metrics, user engagement, and recent revenue activity in real-time.
  </p>
</div>
```

## 3. Color Palette & Theming

Move away from pure, harsh, highly saturated colors. Use tailored, harmonic color palettes.

- **Primary Brand Colors**: Use confident, accessible brand colors with consistent interactive styling. E.g., `bg-indigo-600 hover:bg-indigo-500` or `bg-blue-600 hover:bg-blue-500`.
- **Backgrounds & Surfaces**: Use very light slates/grays (`bg-slate-50`) or crisp white (`bg-white`) for the main application canvas. Use subtle borders (`border-slate-200`) or soft, diffuse shadows (`shadow-sm`) for card containers.
- **Dark Mode**: Implement thoughtful dark mode using the `dark:` variant. Dark mode backgrounds should be deep, rich grays/blues (e.g., `bg-slate-900`, `bg-slate-950`), avoiding high-strain pure black (`bg-black`). Use `text-slate-300` for dark mode body text.

## 4. Layouts & Components

### Cards and Containers

Containers establish structure. They should feel grounded but well-defined. Rely heavily on soft shadows, thin subtle borders, and generous padding.

```tsx
<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200/50">
  <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
  {/* Content here */}
</div>
```

### Buttons

Buttons are primary interaction points. They must have clearly visible interactive states (hover, focus, active, disabled).

**Primary Button:**
```tsx
import { ArrowRight } from 'lucide-react';

<button className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98]">
  <span>Get Started</span>
  <ArrowRight className="h-4 w-4" />
</button>
```

**Secondary / Outline Button:**
```tsx
<button className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98]">
  Cancel
</button>
```

### Inputs and Forms

Inputs need clear focus rings to ensure professional polish and accessibility.

```tsx
import { Search } from 'lucide-react';

<div className="relative rounded-md shadow-sm">
  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
    <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
  </div>
  <input
    type="text"
    className="block w-full rounded-lg border-0 py-2 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
    placeholder="Search users or projects..."
  />
</div>
```

### Badges / Pills

Use badges to highlight status, tags, or categories.

```tsx
<span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
  Completed
</span>
```

## 5. Lucide React Best Practices

1. **Explicit Sizing**: Always define dimensions explicitly using Tailwind size classes (`h-4 w-4`, `h-5 w-5`, `h-6 w-6`). Size contextually: use `h-4` for dense UI and button inline text, `h-5` for standard icons, and `h-8` or larger for feature highlights.
2. **Stroke Width Optimization**: Lucide defaults to a `2px` stroke width. For very large decorative icons, reduce the stroke width via the React prop (`<Icon strokeWidth={1.5} />`) to maintain an elegant, sharp look without feeling heavy.
3. **Alignment Alignment Alignment**: When placing icons next to text, always use flexbox (`flex items-center gap-x-2` or `gap-2`) to guarantee perfect vertical alignment.
4. **Decorative Marking**: If an icon is purely decorative and offers no additional meaning beyond the nearby text, add `aria-hidden="true"` to hide it from screen readers.

## 6. Transitions, Animations, and Micro-interactions

Use subtle animations to make the interface feel responsive and alive, without being distracting.

- **Hover & Focus States**: Standardize transition utilities on interactive elements: `transition-all duration-200 ease-in-out` or simply Tailwind's base `transition`.
- **Micro-interactions**: Use `active:scale-[0.98]` on buttons and clickable cards for a highly polished tactile "press" feedback effect.
- **Entry Animations**: Use simple fades and slide-ups for new content appearing on the screen.
  `animate-in fade-in slide-in-from-bottom-4 duration-500`

## 7. Premium Aesthetics (Glassmorphism & Gradients)

For areas requiring a premium, modern feel (like marketing pages, hero sections, sticky navbars, or complex data overlays), utilize advanced CSS rendering selectively.

**Subtle Glass Effect:**
```tsx
<div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-lg ring-1 ring-black/5">
  {/* Glass content */}
</div>
```

**Refined Text Gradients:**
```tsx
<h2 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold tracking-tight text-4xl">
  Supercharge Your Workflow
</h2>
```

---

**Final Rule**: The ultimate goal is to build interfaces that feel deeply **engineered** and meticulously crafted. Every pixel, shadow radius, hover state, and color transition should feel intentional and purposeful.
