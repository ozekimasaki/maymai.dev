# Graph Report - C:\Users\masam\Documents\portfolio_maymai  (2026-04-10)

## Corpus Check
- Corpus is ~31,412 words - fits in a single context window. You may not need a graph.

## Summary
- 83 nodes · 139 edges · 12 communities detected
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `segmentProgress()` - 9 edges
2. `buildScene()` - 9 edges
3. `AGENTS.md – Codex CLI Implementation Rules` - 9 edges
4. `Work: Spatial Margin (Work 01 – Astro/TS/SCSS)` - 8 edges
5. `Work: Night Dashboard (Work 02 – React/TS/D3.js)` - 8 edges
6. `Work: Garden of Type (Work 03 – Next.js/Three.js/GSAP)` - 8 edges
7. `Work: Still Life EC (Work 04 – Shopify/Liquid/Alpine.js)` - 8 edges
8. `Portfolio Placeholder / Sample Content Convention` - 7 edges
9. `Astro (web framework)` - 7 edges
10. `GET()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Thumbnail: /images/works/img_work_01.jpg` --semantically_similar_to--> `Work thumbnail 01 (asset)`  [INFERRED] [semantically similar]
  src/content/works/spatial-margin.md → src/assets/images/works/img_work_01.jpg
- `Thumbnail: /images/works/img_work_02.jpg` --semantically_similar_to--> `Work thumbnail 02 (asset)`  [INFERRED] [semantically similar]
  src/content/works/night-dashboard.md → src/assets/images/works/img_work_02.jpg
- `Thumbnail: /images/works/img_work_03.jpg` --semantically_similar_to--> `Work thumbnail 03 (asset)`  [INFERRED] [semantically similar]
  src/content/works/garden-of-type.md → src/assets/images/works/img_work_03.jpg
- `Thumbnail: /images/works/img_work_04.jpg` --semantically_similar_to--> `Work thumbnail 04 (asset)`  [INFERRED] [semantically similar]
  src/content/works/still-life-ec.md → src/assets/images/works/img_work_04.jpg
- `AGENTS.md – Codex CLI Implementation Rules` --rationale_for--> `Portfolio Site – maymai.dev`  [INFERRED]
  AGENTS.md → public/robots.txt

## Hyperedges (group relationships)
- **AGENTS.md rule groups collectively govern the portfolio_site implementation** — agents_md, astro_workflow, html_markup_rules, css_coding_standards, script_coding_standards, button_patterns, chrome_devtools_verification, astro_quality_checklist, layout_template, portfolio_site [INFERRED 0.90]
- **Three sample blog articles form the placeholder blog content** — blog_whitespace_speaks, blog_react_server_components, blog_bespoke_component_design, sample_content, portfolio_placeholder [EXTRACTED 1.00]
- **Four placeholder work entries form the portfolio works section** — work_spatial_margin, work_night_dashboard, work_garden_of_type, work_still_life_ec, portfolio_placeholder [EXTRACTED 1.00]
- **Work 01 (Spatial Margin) technology stack** — work_spatial_margin, astro, typescript, scss [EXTRACTED 1.00]
- **Work 02 (Night Dashboard) technology stack** — work_night_dashboard, react, typescript, d3_js [EXTRACTED 1.00]
- **Work 03 (Garden of Type) technology stack** — work_garden_of_type, next_js, three_js, gsap [EXTRACTED 1.00]
- **Work 04 (Still Life EC) technology stack** — work_still_life_ec, shopify, liquid, alpine_js [EXTRACTED 1.00]
- **Public work thumbnails group** — image_work_01_public, image_work_02_public, image_work_03_public, image_work_04_public [EXTRACTED 0.95]
- **Asset work thumbnails group** — image_work_01_asset, image_work_02_asset, image_work_03_asset, image_work_04_asset [EXTRACTED 0.95]
- **Site icon set** — apple_touch_icon, favicon, app_icon_192, app_icon_512 [INFERRED 0.90]

## Communities

### Community 0 - "Sample Portfolio Content"
Cohesion: 0.17
Nodes (20): Alpine.js, Blog: Bespoke Component Design (Sample Article 03), Blog: React Server Components (Sample Article 02), Blog: Whitespace Speaks (Sample Article 01), D3.js, GSAP (GreenSock Animation Platform), Liquid (Shopify template language), Next.js (+12 more)

### Community 1 - "Astro Site Conventions"
Cohesion: 0.21
Nodes (14): AGENTS.md – Codex CLI Implementation Rules, Astro (web framework), Astro Quality Checklist (h1, alt, OGP, nav aria-label, section id…), Astro Workflow Rules (dev/build/preview commands, directory structure), Button Implementation Patterns (gradient, focus-visible, SP layout), Chrome DevTools Verification Procedure (PC/SP screenshots, console checks), CSS Coding Standards (selectors, hover, focus-visible, SCSS BEM), HTML/Astro Markup Rules (semantics, images, links, forms) (+6 more)

### Community 2 - "Hero Voxel Scene"
Cohesion: 0.33
Nodes (9): addMoss(), addPot(), addStand(), addStones(), buildScene(), clamp(), easeOutCubic(), init() (+1 more)

### Community 3 - "Work Thumbnails"
Cohesion: 0.33
Nodes (9): Work thumbnail 01 (asset), Thumbnail: /images/works/img_work_01.jpg, Work thumbnail 02 (asset), Thumbnail: /images/works/img_work_02.jpg, Work thumbnail 03 (asset), Thumbnail: /images/works/img_work_03.jpg, Work thumbnail 04 (asset), Thumbnail: /images/works/img_work_04.jpg (+1 more)

### Community 4 - "Tree Geometry"
Cohesion: 0.43
Nodes (7): addBranches(), addTrunk(), drawGrowingLine(), interpolatePoint(), lerp(), offsetPoint(), roundPoint()

### Community 5 - "Likes API"
Cohesion: 0.8
Nodes (5): buildKey(), GET(), getLikesKv(), jsonResponse(), POST()

### Community 6 - "Leaf Animation"
Cohesion: 0.4
Nodes (2): createLeafFace(), createLeafStyle()

### Community 7 - "Brand Icons"
Cohesion: 0.4
Nodes (6): App icon 192, App icon 512, Apple touch icon, Favicon, OpenGraph preview image, Site branding

### Community 8 - "Scroll Dissolve"
Cohesion: 0.67
Nodes (0): 

### Community 9 - "Content Collections"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Worker Types"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Scroll Fade"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **8 isolated node(s):** `Chrome DevTools Verification Procedure (PC/SP screenshots, console checks)`, `D3.js`, `Three.js`, `GSAP (GreenSock Animation Platform)`, `Alpine.js` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Content Collections`** (1 nodes): `content.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Worker Types`** (1 nodes): `worker-configuration.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scroll Fade`** (1 nodes): `scroll-fade.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Work: Spatial Margin (Work 01 – Astro/TS/SCSS)` connect `Sample Portfolio Content` to `Astro Site Conventions`, `Work Thumbnails`?**
  _High betweenness centrality (0.172) - this node is a cross-community bridge._
- **Why does `Astro (web framework)` connect `Astro Site Conventions` to `Sample Portfolio Content`, `Likes API`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **Why does `Work: Still Life EC (Work 04 – Shopify/Liquid/Alpine.js)` connect `Sample Portfolio Content` to `Work Thumbnails`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Work: Spatial Margin (Work 01 – Astro/TS/SCSS)` (e.g. with `Work: Night Dashboard (Work 02 – React/TS/D3.js)` and `Work: Garden of Type (Work 03 – Next.js/Three.js/GSAP)`) actually correct?**
  _`Work: Spatial Margin (Work 01 – Astro/TS/SCSS)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Work: Night Dashboard (Work 02 – React/TS/D3.js)` (e.g. with `Work: Spatial Margin (Work 01 – Astro/TS/SCSS)` and `Work: Garden of Type (Work 03 – Next.js/Three.js/GSAP)`) actually correct?**
  _`Work: Night Dashboard (Work 02 – React/TS/D3.js)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Chrome DevTools Verification Procedure (PC/SP screenshots, console checks)`, `D3.js`, `Three.js` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._