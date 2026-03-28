# Website Inspection Guide

## What to Extract Per Section

### Visual Properties
- Background color/gradient/image
- Max-width and padding of the content container
- Vertical padding/margin between sections
- Typography: font-family, size, weight, line-height, letter-spacing, color for EVERY text element
- Border radius on all containers, cards, buttons, inputs
- Box shadows
- Border styles

### Layout
- Display model (flex, grid, block)
- Flex direction, justify-content, align-items, gap
- Grid template columns/rows
- Max-width constraints
- Overflow behavior

### Interactive States
For every interactive element, extract:
- **Default state** — all visual properties
- **Hover state** — what changes and the transition (duration, easing)
- **Active/pressed state** — scale, color changes
- **Focus state** — outline, ring style
- **Disabled state** — opacity, cursor

### Images & Media
- Actual image dimensions (naturalWidth × naturalHeight)
- Display dimensions
- Object-fit / object-position
- Lazy loading behavior
- Any overlay/gradient on top of images

### Animations
- Scroll-triggered reveals: threshold, direction, duration, easing
- Stagger delays in grids
- Carousel/slider: autoplay, timing, transition style
- Loading/skeleton states

### Responsive Breakpoints
At each breakpoint (1440, 768, 390), note:
- Does the layout change? (columns → stack)
- Do elements hide/show?
- Do elements reorder?
- Do font sizes change?
- Do spacing values change?
- Do images change (art direction)?

## JavaScript Extraction Snippets

### Get all font stacks in use
```javascript
[...new Set([...document.querySelectorAll('*')].slice(0, 500).map(el => getComputedStyle(el).fontFamily))];
```

### Get all unique colors in use
```javascript
[...new Set([...document.querySelectorAll('*')].slice(0, 500).flatMap(el => {
  const cs = getComputedStyle(el);
  return [cs.color, cs.backgroundColor, cs.borderColor].filter(c => c && c !== 'rgba(0, 0, 0, 0)');
}))];
```

### Get section boundaries
```javascript
[...document.querySelectorAll('section, [class*="section"], main > div > div')].map((s, i) => ({
  index: i,
  tag: s.tagName,
  classes: s.className?.toString().slice(0, 100),
  rect: s.getBoundingClientRect(),
  bg: getComputedStyle(s).backgroundColor,
  childCount: s.children.length
}));
```

### Get navigation structure
```javascript
JSON.stringify({
  nav: [...document.querySelectorAll('nav, [role="navigation"]')].map(nav => ({
    tag: nav.tagName,
    classes: nav.className?.toString().slice(0, 100),
    links: [...nav.querySelectorAll('a')].map(a => ({ text: a.textContent.trim(), href: a.href })),
    buttons: [...nav.querySelectorAll('button')].map(b => ({ text: b.textContent.trim(), type: b.type })),
    height: nav.getBoundingClientRect().height,
    position: getComputedStyle(nav).position,
    bg: getComputedStyle(nav).backgroundColor
  }))
});
```
