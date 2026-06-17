# Kaizen Wheels — Design System (MASTER)

> Brand reference: [Kaizen Labs](https://www.kaizenlabs.co/)  
> Product: Premium car rental (Kaizen Wheels take-home)

## Brand Extraction

| Element | Value | Usage |
|---------|-------|-------|
| **Primary green** | `#00231C` | CTAs, hero, footer, badges, focus rings |
| **Accent lime** | `#C3F731` | Logo K-stroke, hero eyebrow, trust icons |
| **Header** | `#FFFFFF` | Top navigation |
| **Text on light** | `#000000` | Nav links, body copy |
| **Text on dark** | `#FFFFFF` | Hero, footer, summary header |
| **Typography** | Inter (400–700) | Geometric sans-serif; matches Kaizen Labs site |

## Logo

`KaizenLogo` component — rounded-square mark with stylized mountain-peak **K** and lime accent leg.

- **Light variant:** `#00231C` mark on white header, black wordmark
- **Dark variant:** white mark on `#00231C` footer/hero surfaces

## Pattern

1. White sticky header with logo + pill **Get started**
2. Dark green hero + white booking widget
3. Trust row (lime icon badges)
4. White fleet grid section
5. Green-footer chrome

## Components

- Pill CTAs: `.kaizen-cta` → `rounded-full font-semibold`
- Cards: `rounded-xl`, subtle border hover
- No SIXT orange; no uppercase-heavy corporate rental tone

## Anti-patterns

- SIXT orange `#FF5000`
- Black header with white logotype (SIXT chrome)
- Aggressive all-caps body copy
