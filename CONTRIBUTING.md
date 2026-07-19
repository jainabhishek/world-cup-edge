# Contributing

Thanks for helping improve Match Edge.

## Before opening a change

1. Search existing issues and pull requests for related work.
2. Open an issue first for changes to probability calibration, contract semantics,
   fee handling, or bankroll policy.
3. Keep financial claims conservative. Never describe an estimate as guaranteed
   profit or a heuristic as mathematically optimal.

## Local workflow

```sh
npm install
npm test
npm run build
npm start
```

For interface changes, verify both desktop and a 390px mobile viewport. For model
changes, add tests for invariants and edge cases—not only example outputs.

## Pull requests

- Keep the scope focused and explain the user impact.
- State any new assumptions or proof boundaries.
- Include screenshots for visible changes.
- Confirm that tests and the production build pass.

By contributing, you agree that your work is licensed under the MIT License.
