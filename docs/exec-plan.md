# Match Edge implementation plan

This is a living implementation plan for the standalone Match Edge web app. The
workspace was empty and was not a Git repository when work began.

## Purpose

Build a local, responsive calculator for the Argentina–Spain final. A user enters
the score, minute, bankroll, team contract, current contract price, and commission.
The app returns a transparent fair-probability estimate, a conservative maximum
entry price, a constrained stake, and an early-exit risk plan.

The app must never imply guaranteed profit. Mathematical optimality is limited to
the stated probability model and the known-probability Kelly framework. The live
probability estimate is a model assumption, not a theorem about the match.

## Progress

- [x] Inspect the empty workspace and applicable global instructions.
- [x] Generate and inspect complete desktop and mobile design concepts.
- [x] Specify the probability, price, fee, and stake equations.
- [x] Implement the shared calculation module.
- [x] Verify calibration, monotonicity, price thresholds, Kelly sizing, and input
      validation with automated tests.
- [x] Implement the responsive React interface.
- [x] Verify the production build and core workflow in a real browser.
- [x] Compare desktop and mobile screenshots with the design concepts.
- [x] Initialize Git and commit the implementation on a feature branch.
- [x] Push to GitHub and create a pull request.

## Design decisions

1. The app evaluates a binary “lift the trophy” contract. A 90-minute three-way
   market would require a separate draw contract and does not match the requested
   buy-low/sell-higher workflow.
2. Spain and Argentina regulation scoring rates are calibrated to the captured
   de-vigged 90-minute market: 1.05 and 0.75 expected goals over 90 minutes.
3. Tied regulation states are resolved by a calibrated extra-time and penalty
   submodel so the initial Spain title probability is 59.46%.
4. Commission is charged only on positive settlement profit. The calculator
   converts contract price and commission into the probability required to break
   even.
5. A trade needs both a three-percentage-point absolute price cushion and a 5%
   relative price cushion. These buffers represent model uncertainty; they are
   risk policy rather than market truth.
6. Stake sizing uses one-eighth Kelly and is capped at 1% of the entered bankroll.
   One-eighth Kelly is deliberately more conservative than the log-growth optimum.
7. The exit ladder is explicitly a variance-control heuristic. No early-exit rule
   can be proved return-maximizing without a reliable model of the future in-play
   price path, fills, suspensions, and spreads.

## Verification obligations

- The initial 0–0 probability matches the 59.46% calibration target.
- Spain probability and Argentina probability sum to one in all supported states.
- A Spain goal cannot reduce Spain's probability; an Argentina goal cannot raise it.
- At minute 120, a non-tied score is deterministic and a tie uses the documented
  penalty probability.
- Expected value is zero at the fee-adjusted break-even price, positive below it,
  and negative above it.
- The full-Kelly fraction is the unique maximum of expected log wealth for the
  binary settlement payoff; the implemented fraction is exactly one eighth of it,
  subject to the 1% cap.
- A PASS result always recommends a zero stake.
- Commission cannot increase the maximum entry price or stake.
- Invalid scores, time, prices, bankroll, and commission are rejected.

## Handoff

The final handoff must include local run instructions, test/build results, a browser
URL left running when safe, design comparison evidence, and the pull-request URL.
