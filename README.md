# Match Edge

Match Edge is a local decision-support calculator for an Argentina–Spain trophy
winner contract. Enter the score, match minute, bankroll, team, contract price, and
commission to receive:

- a calibrated fair-probability estimate;
- a commission-adjusted maximum entry price with safety margins;
- a one-eighth-Kelly stake capped at 1% of bankroll; and
- an early-exit risk plan.

It is not a sportsbook, does not place trades, does not fetch live data, and cannot
guarantee profit.

## Run locally

Requirements: Node.js 18+, 20+, or 22+.

```sh
npm install
npm start
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

## Verify

```sh
npm test
npm run build
```

The complete derivation and proof boundaries are in
[`docs/model-proof.md`](docs/model-proof.md). The implementation plan and visual
specification are in [`docs/exec-plan.md`](docs/exec-plan.md) and
[`docs/design-spec.md`](docs/design-spec.md). The final concept-to-render review is
recorded in [`docs/fidelity-ledger.md`](docs/fidelity-ledger.md).

## Important assumptions

- The contract pays $1 if the selected team lifts the trophy.
- Commission is entered as a percentage of positive settlement profit.
- The match model ignores possession, shots, substitutions, injuries, red cards,
  penalties, weather changes, and market microstructure.
- Recalculate after every goal or material match event.
- The safest output is often PASS.
