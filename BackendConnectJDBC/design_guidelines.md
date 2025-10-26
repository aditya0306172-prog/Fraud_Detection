# Design Guidelines for Fraud Detection System

## Design Approach
**Reference-Based with System Foundation**: This application follows a dashboard-focused design pattern inspired by modern fintech and security platforms (Stripe, Plaid), built on dark mode aesthetics with clear information hierarchy and status indicators.

## Core Design Elements

### Typography
- **Font Family**: Inter (Google Fonts)
- **Hierarchy**:
  - H1 (Main Title): 3xl, bold, white
  - H2 (Section Headers): 4xl, bold, white
  - Body Text: Base size, regular (400-500), gray-300
  - Labels: sm, medium (500), gray-300/gray-400
  - Stats/Metrics: 3xl, bold, with color indicators

### Color System
- **Background**: Primary (#111827), Secondary (#1F2937), Card (#1e293b)
- **Text**: White (#F9FAFB), Gray-300 (#D1D5DB), Gray-400 (#9CA3AF)
- **Action Colors**:
  - Primary Blue: #3B82F6
  - Success Green: #10B981 (Lime-400 for approved amounts)
  - Danger Red: #EF4444
  - Warning Yellow: #F59E0B
  - Neutral Gray: #6B7280
- **Borders**: Gray-800, Gray-700, Gray-600 with alpha transparency

### Layout System
- **Spacing Units**: Tailwind scale with emphasis on p-4, p-6, p-8 for containers; mb-4, mb-6, mb-8 for vertical rhythm
- **Container**: mx-auto with p-4 sm:p-6 lg:p-8 responsive padding
- **Grid Patterns**:
  - Stats: 1 column mobile, 2 columns tablet, 3 columns desktop
  - Sidebar Layout: 1/4 sidebar, 3/4 main content on desktop
  - Responsive breakpoints: md (tablet), lg (desktop)

### Component Library

**Authentication Cards**:
- Backdrop blur effect (blur-12px) on auth background
- Background opacity: rgba(31, 41, 55, 0.55)
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Max-width: md (28rem)
- Rounded: xl, Shadow: lg

**Stat Cards**:
- Background: #1e293b with border #334155
- Hover: translateY(-5px) with shadow elevation
- Icon placement: Right-aligned, 8x8 size
- Flex layout: space-between alignment

**Form Inputs**:
- Background: #374151, Border: #4B5563
- Focus state: Blue glow (0 0 0 3px rgba(59, 130, 246, 0.4))
- Disabled: 60% opacity, not-allowed cursor
- Padding: p-3, Rounded: lg

**Buttons**:
- Primary/Danger/Success/Secondary variants with distinct backgrounds
- Hover: translateY(-2px) with shadow
- Full-width on forms, inline elsewhere
- Rounded: lg, Font-weight: bold, Padding: py-2 px-4 (or py-3 for forms)

**Tables**:
- Header background: #374151
- Alternating row backgrounds with hover states
- Status indicators: color-coded text (pending-yellow, approved-green, flagged-red)

**Modals**:
- Overlay: rgba(17, 24, 39, 0.8) with backdrop-blur-8px
- Fixed positioning, centered flex layout
- fadeIn animation (0.3s ease-out)

**Sidebar Navigation**:
- Full-width buttons with left-aligned text
- Padding: 0.75rem 1rem, Rounded: 0.5rem
- Hover: #374151 background
- Active state: #3B82F6 background, white text

### Animations
- **fadeIn**: Opacity 0 to 1
- **fadeInSlideUp**: Opacity 0 + translateY(20px) to full visibility
- Duration: 0.7s for cards, 0.3s for interactions
- Easing: ease-out for entrances, ease for interactions
- Button hover transforms: translateY(-2px)

### Backgrounds
- **Auth View**: Hero image with gradient overlay
  - Image: Technology/cybersecurity themed (Unsplash)
  - Gradient: linear-gradient(rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.9))
  - Background-size: cover, position: center, attachment: fixed
- **Dashboard**: Solid dark background (#111827)

### Responsive Behavior
- Mobile-first approach with md: and lg: breakpoints
- Sidebar: Hidden on mobile, visible 1/4 width on desktop
- Stats grid: Stacks vertically on mobile, 2-3 columns on desktop
- Authentication layout: Stacks vertically on mobile, side-by-side on desktop
- Footer: Stacks contact links on mobile, inline on desktop

### Status Indicators
- Visual color coding for transaction states
- Icon integration with status colors
- Clear typography hierarchy for amounts and dates