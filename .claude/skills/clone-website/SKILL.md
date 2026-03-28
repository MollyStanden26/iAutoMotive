---
name: clone-website
description: Reverse-engineer and clone a website's homepage into the AutoConsign Next.js project using Chrome MCP for pixel-accurate extraction
argument-hint: "<url>"
user-invocable: true
---

# Website Cloner Skill

You are a website cloning specialist. You will reverse-engineer a target website and rebuild it as a Next.js 14 page in this project using exact computed styles extracted via Chrome MCP browser automation.

## Pre-Flight Checks

Before doing ANYTHING:

1. **Chrome MCP available** — Verify you have access to Chrome MCP tools (`mcp__Claude_in_Chrome__read_page`, `mcp__Claude_in_Chrome__computer`, `mcp__Claude_in_Chrome__javascript_tool`, etc.). If not available, STOP and tell the user to start Claude Code with Chrome MCP enabled.

2. **Read TARGET.md** — Get the target URL, scope, fidelity level, and post-clone customization plan. If the user provided a URL as an argument, use that instead.

3. **Verify project builds** — Run `npm run build` (or `npm install` first if `node_modules` doesn't exist). The project must compile before you start. Fix any issues.

## 9 Guiding Principles

1. **Completeness beats speed** — Clone every visible element. A missing section is worse than a slow clone.
2. **Small tasks yield perfect results** — Each builder agent handles ONE section. Complex sections get split into sub-components.
3. **Real content and assets** — Download actual images/videos to `public/`. Use real text content. No placeholders.
4. **Foundation first** — Fonts, colors, and global styles must be correct before any component work.
5. **Extract appearance AND behavior** — Every hover state, transition, animation, and interaction must be captured.
6. **Identify the interaction model before building** — Is it a carousel? Tabs? Accordion? Scroll-triggered? Know before you code.
7. **Extract every state** — Default, hover, active, focus, disabled, loading, error, empty.
8. **Spec files are the source of truth** — Builder agents work from specs, not from memory or screenshots alone.
9. **Build must always compile** — After every merge, run `npm run build`. Fix immediately if broken.

## Phase 1: Reconnaissance

### 1.1 Navigate and Screenshot
```
Navigate to the target URL using Chrome MCP.
Take full-page screenshots at:
- 1440px width (desktop)
- 768px width (tablet)
- 390px width (mobile)
Save screenshots to docs/design-references/
```

### 1.2 Global Design Token Extraction
Execute this JavaScript via Chrome MCP to extract the site's design system:

```javascript
JSON.stringify({
  images: [...document.querySelectorAll('img')].map(img => ({
    src: img.src || img.currentSrc, alt: img.alt,
    width: img.naturalWidth, height: img.naturalHeight,
    parentClasses: img.parentElement?.className,
    position: getComputedStyle(img).position,
    zIndex: getComputedStyle(img).zIndex
  })),
  videos: [...document.querySelectorAll('video')].map(v => ({
    src: v.src || v.querySelector('source')?.src,
    poster: v.poster, autoplay: v.autoplay, loop: v.loop, muted: v.muted
  })),
  backgroundImages: [...document.querySelectorAll('*')].filter(el => {
    const bg = getComputedStyle(el).backgroundImage;
    return bg && bg !== 'none';
  }).map(el => ({
    url: getComputedStyle(el).backgroundImage,
    element: el.tagName + '.' + el.className?.split(' ')[0]
  })),
  svgCount: document.querySelectorAll('svg').length,
  fonts: [...new Set([...document.querySelectorAll('*')].slice(0, 200).map(el => getComputedStyle(el).fontFamily))],
  favicons: [...document.querySelectorAll('link[rel*="icon"]')].map(l => ({ href: l.href, sizes: l.sizes?.toString() }))
});
```

### 1.3 Mandatory Interaction Sweep
You MUST do all of these before writing any code:
- **Scroll** the entire page slowly from top to bottom, noting scroll-triggered animations and lazy-loaded content
- **Click** every interactive element: nav links, dropdowns, buttons, carousels, tabs, accordions
- **Hover** over every card, button, link, and image to capture hover states
- **Test at 3 viewports**: 1440px, 768px, 390px — note what changes at each breakpoint

### 1.4 Page Topology Mapping
Write findings to `docs/research/PAGE_TOPOLOGY.md`:
- List every section from top to bottom with a short description
- Note the interaction model for each (static, carousel, tabs, accordion, scroll-reveal, etc.)
- Note any sticky/fixed elements
- Note the responsive strategy (reflow, hide, reorder, etc.)

Write interaction findings to `docs/research/BEHAVIORS.md`:
- Every hover state with exact transition details
- Every click interaction and what it triggers
- Every scroll-triggered animation (threshold, direction, duration)
- Every responsive breakpoint change

## Phase 2: Foundation Build

### 2.1 Asset Download
Write and run a Node.js script (`scripts/download-assets.js`) that:
- Downloads all images found in Phase 1 to `public/images/`
- Downloads all videos to `public/videos/`
- Handles CORS/redirects gracefully
- Logs each download with original URL → local path mapping

### 2.2 SVG Icon Extraction
Execute JavaScript via Chrome MCP to extract all inline SVGs:
```javascript
JSON.stringify([...document.querySelectorAll('svg')].map((svg, i) => ({
  index: i,
  viewBox: svg.getAttribute('viewBox'),
  width: svg.getAttribute('width'),
  height: svg.getAttribute('height'),
  innerHTML: svg.outerHTML,
  parentTag: svg.parentElement?.tagName,
  parentClasses: svg.parentElement?.className?.toString().slice(0, 100),
  ariaLabel: svg.getAttribute('aria-label') || svg.querySelector('title')?.textContent
})));
```

Create `src/components/icons.tsx` with all extracted SVGs as named React components.

### 2.3 Verify Foundation
Run `npm run build` — must pass before proceeding to Phase 3.

## Phase 3: Component Specification & Dispatch

For each section identified in PAGE_TOPOLOGY.md (top to bottom):

### 3.1 Extract Exact Styles
Use this JavaScript via Chrome MCP, replacing SELECTOR with the appropriate CSS selector for each section:

```javascript
(function(selector) {
  const el = document.querySelector(selector);
  if (!el) return JSON.stringify({ error: 'Element not found: ' + selector });
  const props = [
    'fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color',
    'textTransform','textDecoration','backgroundColor','background',
    'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
    'margin','marginTop','marginRight','marginBottom','marginLeft',
    'width','height','maxWidth','minWidth','maxHeight','minHeight',
    'display','flexDirection','justifyContent','alignItems','gap',
    'gridTemplateColumns','gridTemplateRows',
    'borderRadius','border','borderTop','borderBottom','borderLeft','borderRight',
    'boxShadow','overflow','overflowX','overflowY',
    'position','top','right','bottom','left','zIndex',
    'opacity','transform','transition','cursor',
    'objectFit','objectPosition','mixBlendMode','filter','backdropFilter',
    'whiteSpace','textOverflow','WebkitLineClamp'
  ];
  function extractStyles(element) {
    const cs = getComputedStyle(element);
    const styles = {};
    props.forEach(p => { const v = cs[p]; if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') styles[p] = v; });
    return styles;
  }
  function walk(element, depth) {
    if (depth > 4) return null;
    const children = [...element.children];
    return {
      tag: element.tagName.toLowerCase(),
      classes: element.className?.toString().split(' ').slice(0, 5).join(' '),
      text: element.childNodes.length === 1 && element.childNodes[0].nodeType === 3 ? element.textContent.trim().slice(0, 200) : null,
      styles: extractStyles(element),
      images: element.tagName === 'IMG' ? { src: element.src, alt: element.alt, naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight } : null,
      childCount: children.length,
      children: children.slice(0, 20).map(c => walk(c, depth + 1)).filter(Boolean)
    };
  }
  return JSON.stringify(walk(el, 0), null, 2);
})('SELECTOR');
```

### 3.2 Write Component Spec
Write a spec file to `docs/research/components/<section-name>.spec.md` containing:

```markdown
# <Section Name> Component Spec

## Overview
<What this section is and does>

## DOM Structure
<Simplified HTML structure with key elements>

## Exact Computed Styles
<Every element with its exact CSS values from getComputedStyle>

## States & Behaviors
| Trigger | Before | After | Transition |
|---------|--------|-------|------------|
| hover   | ...    | ...   | ...        |

## Content
<All text content verbatim>

## Assets
<List of images/icons with local paths in public/>

## Responsive Behavior
- **1440px**: <layout description>
- **768px**: <layout description>
- **390px**: <layout description>
```

### 3.3 Dispatch Builder Agent
Launch a builder agent in a git worktree for each section. The agent receives:
- The FULL spec content inline (never "go read the file")
- The target file path (`src/components/marketing/<name>.tsx`)
- Instructions to use Tailwind classes matching the exact extracted values
- Instruction that `npm run build` must pass

### 3.4 Pre-Dispatch Checklist
Before dispatching ANY builder agent, confirm ALL of these:
- [ ] Screenshot of the section saved
- [ ] getComputedStyle extraction run for the section and all children
- [ ] All hover/active/focus states documented
- [ ] All images downloaded to public/
- [ ] All SVGs extracted
- [ ] Responsive behavior at 3 breakpoints documented
- [ ] Interaction model identified (static/carousel/tabs/etc.)
- [ ] Text content captured verbatim
- [ ] Spec file written to docs/research/components/
- [ ] Builder agent receives complete inline spec

## Phase 4: Page Assembly

After all builder agents complete and merge:

1. Wire all section components into `src/app/(marketing)/page.tsx` in correct order
2. Implement page-level scroll behaviors and intersection observers
3. Add any sticky/fixed positioning
4. Run `npm run build` — must pass

## Phase 5: Visual QA Diff

1. Start the dev server (`npm run dev`)
2. Use Chrome MCP to navigate to localhost:3000
3. Take screenshots at 1440px and 390px
4. Compare side-by-side with original screenshots from Phase 1
5. Fix every visual discrepancy:
   - Spacing differences
   - Color mismatches
   - Missing hover states
   - Broken responsive layouts
   - Missing animations
6. Test all interactive elements work correctly

## What NOT to Do

1. **Never guess colors** — Always extract via getComputedStyle
2. **Never estimate spacing** — Always extract exact px values
3. **Never skip hover states** — Every interactive element has states
4. **Never use placeholder images** — Download the real assets
5. **Never skip mobile** — Test at all 3 viewports
6. **Never dispatch a builder without a complete spec** — Incomplete specs produce incomplete components
7. **Never hardcode Tailwind classes without verifying the value** — Check your Tailwind config supports the value
8. **Never skip the build check** — `npm run build` after every merge
9. **Never put multiple sections in one builder agent** — One section = one agent
10. **Never reference a spec file in agent dispatch** — Paste the full content inline
11. **Never animate layout properties** — Only opacity and transform
12. **Never forget prefers-reduced-motion** — Wrap all animations
