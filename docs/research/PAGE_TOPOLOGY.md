# Carvana Homepage — Page Topology

## Page Dimensions
- Total height: ~7934px
- Viewport: 1420x672

## Sections (top to bottom)

### 1. Navigation Bar (79px)
- **Type**: Static, not sticky
- **Background**: Transparent (overlays hero)
- **Layout**: Logo left, 3 nav links center-left, user icon + hamburger right
- **Links**: "Search Cars", "Sell/Trade", "Financing" — Inter 14px/600, color rgb(13,55,94)
- **Logo**: Carvana wordmark SVG with halo icon

### 2. Hero Section (364px)
- **Type**: Static with background image on right
- **Background**: rgb(16, 107, 199) — Carvana blue, full-width
- **Heading**: "WELCOME BACK" — Brandon for Carvana, 56px, weight 900, white, uppercase
- **Search bar**: White input, rounded corners, "Search make, model, or keyword" placeholder
- **Right side**: Carvana truck image (carrier with cars)
- **Below hero**: 3 cards overlapping — Recently viewed, Recent searches, Finance CTA

### 3. Content Cards Row (~464px)
- **Type**: 3-column grid
- **Background**: White
- **Cards**: Recently viewed (vehicle card carousel), Recent searches, Finance with Carvana (dark blue card rgb(0,76,143), 8px radius)
- **Sell/Trade CTA card**: Dark blue, same style

### 4. Vehicle Carousel — "Explore cars you'll love" (~655px)
- **Type**: Horizontal carousel with pagination dots + arrow buttons
- **4 feature cards**: "Cars under $20K", "Discover Great Deals!", "Need it fast?", "Go the distance"
- **Cards**: Light grey/white bg, rounded, with illustration/image, CTA button at bottom
- **Carousel arrows**: Circle buttons with chevrons, right-aligned

### 5. Vehicle Carousel — "Because you viewed..." (~600px)
- **Type**: Horizontal carousel, 4 visible cards
- **Vehicle cards**: White bg, car image top, make/model/trim, mileage, price (large), monthly payment estimate, free shipping + delivery date
- **Badges**: "Recent" (outline), "Price Drop" (green bg), "Great Deal" (green bg)
- **Heart/save icon**: Top-right of each card

### 6. Promotional Banner — Price Drop (~330px)
- **Type**: Full-width banner
- **Background**: Dark navy gradient (rgb(10, 34, 55))
- **Content**: Headline + description text + "Shop All Price Drops" link
- **Right side**: Illustration of price drop card

### 7. Vehicle Carousel — "Vehicles with free shipping" (~600px)
- Same layout as section 5

### 8. Image Carousel / Sell Promo (~350px)
- **Type**: Full-width image carousel with left/right arrows
- **Content**: Lifestyle photo with overlay text — value tracker promo
- **CTA**: "Get Your Value" button (dark bg, white text, rounded)

### 9. "Shop popular models" Carousel (~300px)
- **Type**: Horizontal carousel, 6+ cards visible
- **Cards**: White bg, make (small) + model (bold) + car cutout image
- **Simple card style**: Light border, rounded

### 10. Vehicle Carousel — "Budget friendly options" (~600px)
- Same layout as section 5

### 11. Footer (~752px)
- **Background**: rgb(24, 53, 88) — dark navy
- **Layout**: 5-column link grid — FINANCING, SELL/TRADE, HOW IT WORKS, ABOUT CARVANA, SUPPORT
- **Links**: Light grey text, uppercase section headers
- **Bottom**: Secondary links (SEARCH CARS, SITEMAP, etc.), social icons (FB, LinkedIn, IG, X), copyright, legal links

## Key Patterns
- **Vehicle cards** are the dominant repeating unit — same card used everywhere
- **Carousels** are the primary content display mechanism — horizontal scroll with pagination dots
- **Blue (#106BC7)** is the hero/primary color, dark navy (#0A2237 / #183558) for secondary surfaces
- **Rounded corners**: 8px on cards, pill (100px) on badges
- **Font system**: Brandon for Carvana (display headings), Inter (everything else)
