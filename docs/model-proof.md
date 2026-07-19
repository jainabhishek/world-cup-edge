# Model derivation and proof

## Scope

The calculator evaluates a binary contract that pays $1 if the selected team lifts
the trophy and $0 otherwise. It separates three questions:

1. What probability does the match-state model assign to the contract?
2. At what purchase price is that probability valuable after commission and safety
   margins?
3. How much of a dedicated bankroll should be risked?

Only questions 2 and 3 have mathematical optimality proofs. Question 1 is a
calibrated estimate. The early-exit ladder is a user-preference risk control.

## Match-state probability

Let the additional regulation goals be independent Poisson variables:

```
S ~ Poisson(1.05 × remaining regulation fraction)
A ~ Poisson(0.75 × remaining regulation fraction)
```

For every possible `(S, A)` pair, the current goal difference is updated. A Spain
lead contributes probability 1, an Argentina lead contributes 0, and a tie after
regulation contributes the calibrated extra-time value.

The 1.05 and 0.75 rates reproduce the captured de-vigged regulation market to
rounding: 41.99% Spain, 32.35% draw, and 25.67% Argentina. The tied-regulation Spain
value is then solved—not guessed—so the initial title probability equals the 59.46%
external calibration:

```
r_tie = (0.5946 − P(Spain wins in 90)) / P(draw in 90)
      = 0.540160...
```

Extra-time goals use one third of the 90-minute rates. Spain's shootout probability
is solved so extra time begins at the same `r_tie`, giving 0.502698....

This procedure proves internal calibration and coherence. It does not prove that
the rates will forecast the real match correctly.

## Commission-adjusted break-even price

Let:

- `p` be the fair probability;
- `m` be the contract purchase price, with `0 < m < 1`;
- `c` be commission charged on positive settlement profit;
- one dollar of stake buy `1 / m` contracts.

On a win, one dollar of stake earns net profit

```
b = (1 − c)(1 / m − 1) = (1 − c)(1 − m) / m.
```

On a loss it loses one dollar. Expected profit per dollar is therefore

```
EV = p b − (1 − p).
```

Setting `EV = 0` and solving for `m` gives the unique fee-adjusted break-even price:

```
m_break-even = p(1 − c) / (1 − pc).
```

Because `EV` strictly decreases as `m` increases, every lower price has positive
expected value and every higher price has negative expected value, assuming `p` is
correct. Automated tests verify the zero and both sign changes.

The app then requires model-error cushions:

```
m_max = min(m_break-even − 0.03, m_break-even / 1.05).
```

These cushions are conservative policy, not a theorem.

## Kelly stake

Let `f` be the fraction of bankroll invested. Wealth becomes `1 + fb` on a win and
`1 − f` on a loss. Expected log wealth is

```
g(f) = p log(1 + fb) + (1 − p) log(1 − f).
```

Differentiating and setting the derivative to zero gives

```
f* = (pb − (1 − p)) / b.
```

The second derivative is

```
g''(f) = −pb²/(1 + fb)² − (1 − p)/(1 − f)² < 0.
```

Therefore `f*` is the unique log-growth maximum when `p` and the payoff are known.
Because the match probability is uncertain, the app uses

```
f_app = min(f* / 8, 0.01)
```

and returns zero unless the conservative maximum-price rule is also satisfied.

## Why the early exit is not called optimal

A return-maximizing exit needs a trustworthy stochastic model for future live
prices, spreads, suspensions, fills, goals, red cards, and market latency. This app
does not claim to have that model. Its 20%/35% price ladder and time stop reduce
exposure and match the user's preference to exit early, but can reduce expected
return compared with settlement.

## Automated verification

`npm test` verifies:

- initial calibration;
- complementary team probabilities;
- goal and time monotonicity;
- extra-time and terminal behavior;
- break-even expected-value signs;
- Kelly's local maximum and negative second derivative;
- one-eighth Kelly and bankroll cap;
- PASS implies zero stake;
- commission cannot improve price or stake; and
- invalid input rejection.
