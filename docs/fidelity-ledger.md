# Visual fidelity ledger

The accepted concepts were compared with full-page renders from the local app in
the in-app browser at a native 1280px desktop viewport and a 390px mobile
viewport. Both final renders were inspected as images after the interaction and
calculation checks passed.

## Comparison

1. **Hierarchy and copy:** Both implementations retain the quiet Match Edge
   header, the “Trade the match, not the moment.” lead, the input-first workflow,
   the dominant verdict, the five decision metrics, exit plan, and methodology.
2. **Desktop composition:** The final app follows the concept's approximately
   40/60 workbench-to-result split and places the methodology band across the full
   page. Fine borders and open white space keep the result canvas visually primary.
3. **Mobile composition:** The final app stacks inputs, verdict, metrics, exit
   plan, and methodology in that order. Score controls remain side by side, the
   methodology is collapsed by default, and the 390px render has no horizontal
   overflow.
4. **Color and surface:** The final palette matches the specified white, navy,
   cobalt, coral red, favorable green, and cool-gray surfaces. It contains no
   yellow, gradients, glow effects, sports imagery, or decorative badges.
5. **Typography and controls:** The implementation preserves the strong compact
   headline, oversized tabular verdict/metrics, restrained helper copy, fine
   dividers, and minimum 44px interactive targets. Focus, hover, selected,
   disabled, pressed, and invalid states are represented in the styles.
6. **Decision states:** PASS and TRADE both use the same hierarchy; only the
   verdict, explanatory text, edge color, and calculated values change. A verified
   Argentina example at a $0.35 price produced TRADE, while the initial $0.64
   Spain example correctly produced PASS.

## Copy differences

The visible concept copy is preserved. The app adds short functional helper text
for extra-time entry, contract semantics, price units, recalculation events, and
the proof boundary. These additions prevent ambiguous inputs and avoid implying a
profit guarantee.

## Intentional deviations

- Concept figures were illustrative. Every final value comes from the verified
  engine, so the initial model shows Spain at 59.5%, a $0.56 conservative maximum
  entry, and PASS at a $0.64 market price.
- The mobile concept used select-like fields. The final app retains numeric minute
  input and a two-option contract selector so the controls remain fast, precise,
  keyboard accessible, and consistent across breakpoints.
- The exit area uses a 20% partial-profit target, a 35% remainder target, and a
  time stop. It does not show a fabricated “optimal” stop loss because no such
  price can be proved without a future price-path and execution model.

## Fidelity conclusion

The final interface is faithful to the accepted concepts in hierarchy, layout,
palette, typography, and responsive sequence. The deviations are functional and
mathematical corrections, not visual redesigns.
