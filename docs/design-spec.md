# Match Edge design specification

## Accepted concepts

- `docs/design/match-edge-desktop.png`
- `docs/design/match-edge-mobile.png`

The generated numbers are illustrative. The implementation must preserve the
layout and visual hierarchy while using the verified calculation module for every
displayed value.

## Visible copy lock

Above the first result fold, the allowed product copy is:

- Match Edge
- Argentina vs Spain · Final
- Trade the match, not the moment.
- A conservative price and position calculator for Argentina vs Spain.
- Score; Spain; Argentina; Match minute; Bankroll; Contract to buy; Current price;
  Commission; Calculate position
- Verdict; PASS; TRADE; Fair probability; Maximum entry; Recommended stake;
  Maximum loss; Model edge

Required downstream copy includes Exit plan, Take 50% off, Close the remainder,
Time stop, How this decision is made, and the decision-support disclaimer.

## Design system

- Background: true white `#ffffff`.
- Supporting surface: cool gray `#f6f8fb`.
- Primary ink: deep navy `#081433`.
- Muted ink: `#5b6579`.
- Borders: `#d7dde8`.
- Primary action: cobalt `#1257d8`.
- PASS / unfavorable: coral red `#e33b42`.
- TRADE / favorable: green `#128456`.
- No yellow, gold, cream, gradients, glows, flags, trophies, or sports photography.
- Typography: system grotesk with tabular numerals; deliberate compact control type.
- Geometry: mostly open layout, 10–14px control radii, fine dividers, near-flat
  shadows, and no nested card grid.

## Layout and components

- Desktop: quiet header, 40% input workbench, 60% result canvas, full-width
  methodology band.
- Mobile: input workflow first; result and metrics second; exit plan and expandable
  methodology last. Score steppers remain side by side.
- Reusable families: score stepper, labeled numeric field, team selector, primary
  action, verdict, metric list, exit ladder, and formula explanation.
- Controls are at least 44px tall and include hover, focus-visible, selected,
  disabled, invalid, and pressed states.

## Icon inventory

- Minus and plus controls: code-native symbols, optically centered.
- Primary action arrow: small right-pointing SVG, 1.8px rounded stroke.
- Methodology disclosure chevron: small downward SVG, 1.8px rounded stroke.
- No decorative icons.

## Responsive behavior

- At 900px and below, columns stack and the header remains a single quiet row.
- Metrics change from a five-column rail to a two-column list, with the final item
  spanning the row when necessary.
- At 480px and below, horizontal padding shrinks while all controls retain 44px
  minimum height and no horizontal scrolling is allowed.
