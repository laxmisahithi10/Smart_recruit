# Design Guidelines: AI-Powered Smart Recruitment Dashboard

## Design Approach: Design System - Material Design + Linear Aesthetics

**Justification**: Professional productivity tool requiring clarity, consistency, and trust. Combining Material Design's robust data visualization patterns with Linear's modern, refined aesthetic creates a powerful, intuitive recruiter experience.

**Core Principles**:
- Professional credibility through clean, structured layouts
- Data clarity over decorative elements
- Efficient workflows with minimal cognitive load
- Trust signals through thoughtful information hierarchy

---

## Color Palette

### Light Mode
- **Primary**: 236 72% 16% (Deep professional blue)
- **Primary Hover**: 236 72% 12%
- **Secondary**: 215 20% 65% (Muted slate for secondary actions)
- **Accent**: 142 76% 36% (Green for success/positive indicators)
- **Warning**: 25 95% 53% (Amber for bias alerts)
- **Danger**: 0 84% 60% (Red for critical flags)
- **Background**: 0 0% 98%
- **Surface**: 0 0% 100%
- **Border**: 220 13% 91%
- **Text Primary**: 222 47% 11%
- **Text Secondary**: 215 16% 47%

### Dark Mode
- **Primary**: 217 91% 60%
- **Primary Hover**: 217 91% 65%
- **Secondary**: 215 20% 45%
- **Accent**: 142 71% 45%
- **Background**: 222 47% 11%
- **Surface**: 217 19% 18%
- **Border**: 215 16% 25%
- **Text Primary**: 210 40% 98%
- **Text Secondary**: 215 20% 65%

---

## Typography

**Font Stack**: 
- **Primary**: 'Inter', system-ui, sans-serif (Google Fonts)
- **Data/Code**: 'JetBrains Mono', monospace (for metrics, scores)

**Hierarchy**:
- **Dashboard Headers**: text-2xl font-semibold (24px, 600 weight)
- **Section Titles**: text-lg font-medium (18px, 500 weight)
- **Body**: text-sm font-normal (14px, 400 weight)
- **Data Labels**: text-xs font-medium uppercase tracking-wide (12px, 500 weight)
- **Metrics/Scores**: text-3xl font-bold (30px, JetBrains Mono)

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm
- Tight spacing: p-2, gap-2 (cards, inline elements)
- Standard: p-4, gap-4 (component padding)
- Section spacing: p-6, p-8 (major layout sections)
- Large gaps: gap-12, py-16 (page sections)

**Grid Structure**:
- Main dashboard: 16-column grid with sidebar (3 cols) + main (13 cols)
- Cards/Analytics: 12-column responsive grid
- Breakpoints: Mobile-first (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)

---

## Component Library

### Navigation & Structure
- **Sidebar Navigation** (fixed left, 240px width):
  - Vertical menu with icons + labels
  - Active state: Primary background with slight glow effect
  - Sections: Dashboard, Candidates, Analytics, Interviews, Settings
  - Profile section at bottom

- **Top Bar**:
  - Search bar (center, max-w-xl)
  - Notification bell (top-right)
  - User avatar with dropdown

### AI Avatar Assistant
- **Position**: Fixed bottom-right, 24px from edges
- **Design**: Circular avatar (80px diameter) with subtle floating animation
- **Chat Interface**: Slide-up panel (400px width, 600px height)
- **Features**: Text input with mic icon, message bubbles, typing indicator
- **Visual**: Gradient background (primary to accent), glassmorphism effect

### Data Visualization
- **Chart Containers**: White cards with shadow-sm, rounded-xl, p-6
- **Chart Types**:
  - Skill Radar Chart (Chart.js, 300px square)
  - Bar graphs for comparisons (horizontal preferred)
  - Pie charts for distribution (200px diameter)
  - Line charts for timeline/progress
- **Color Coding**: Use accent (green) for positive metrics, warning (amber) for caution

### Cards & Data Display
- **Candidate Cards**:
  - Grid layout (3 columns desktop, 1 mobile)
  - Avatar (48px) + Name + Role + Score
  - Action buttons (View, Schedule, Compare)
  - Hover: Lift effect (shadow-lg transition)

- **Analytics Cards**:
  - Stat cards: Icon + Label + Large Number + Trend indicator
  - 4-column grid for key metrics
  - Background gradient on hover

### Bias Detection Panel
- **Alert Card Design**:
  - Warning border-left (4px, warning color)
  - Icon + Alert title + Description
  - Fairness Score: Large circular progress (0-100)
  - Suggestions list with checkmarks

### Interview Module
- **Schedule Interface**:
  - Calendar picker (left) + Time slots (right)
  - Candidate list with checkboxes
  - Auto-generate meeting link button (prominent, primary)
  - Email preview panel

- **Live Interview Screen**:
  - Video feed (large, center)
  - Confidence meter (vertical bar, right side)
  - Emotion indicators (subtle icons)
  - Question panel (bottom, collapsible)
  - Proctoring alerts (top-right, red badge if active)

### Forms & Inputs
- **Input Fields**: 
  - Border-2, rounded-lg, p-3
  - Focus: Primary border + ring effect
  - Label: text-sm font-medium, mb-2

- **Buttons**:
  - Primary: bg-primary, text-white, px-4 py-2, rounded-lg
  - Secondary: border-2 border-secondary, hover:bg-secondary/10
  - Icon buttons: p-2, rounded-full, hover:bg-surface

- **File Upload**:
  - Drag-drop zone: Dashed border, p-8, center-aligned
  - CSV icon + "Upload candidate data" text
  - Progress bar on upload

### Tables & Lists
- **Candidate Table**:
  - Sticky header, alternating row colors (surface vs background)
  - Sortable columns with arrow indicators
  - Action column (right-aligned, icon buttons)
  - Row hover: bg-primary/5

---

## Animations

**Minimal, Purposeful Motion**:
- Page transitions: Fade-in (300ms ease-out)
- Card hover: translateY(-2px), shadow transition (200ms)
- AI Avatar: Gentle float (2s infinite, 5px amplitude)
- Chart animations: On-load only, 800ms ease-out
- Notification badges: Scale pulse (1s, 1.05 scale)

---

## Images

**Hero/Banner**: None - This is a dashboard app, not marketing
**Avatars**: Candidate photos (circular, 48px standard, 80px detail view)
**Icons**: Material Icons CDN for consistent design system icons
**Illustrations**: Optional simple line illustrations for empty states (e.g., "No candidates yet")

---

## Key Page Layouts

### Dashboard (Home)
- Top: Quick stats (4 cards, metrics)
- Middle: Recent candidates (table, 8 rows)
- Right sidebar: Upcoming interviews (timeline)
- Bottom-right: AI Avatar

### Analytics (Agenda)
- Upload section (top, full-width card)
- Charts grid (2x2 on desktop)
- Bias detection panel (bottom, if triggered)

### Interview View
- Split layout: Video (70%) + Controls/Analysis (30%)
- Bottom drawer: Question history + notes

This design creates a professional, data-rich recruitment platform that feels trustworthy, efficient, and intelligent.