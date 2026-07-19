import assert from "node:assert/strict";
import test from "node:test";

import {
  MODEL,
  PENALTY_SPAIN,
  breakEvenPrice,
  calculatePosition,
  fairProbability,
  fullKellyFraction,
  maximumEntryPrice,
  netWinPerDollar,
  requiredProbability,
  spainTitleProbability,
} from "../src/model.js";

function approximately(actual, expected, tolerance = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

test("the initial state matches the external title calibration", () => {
  approximately(
    spainTitleProbability({ spainScore: 0, argentinaScore: 0, minute: 0 }),
    MODEL.targetPrematchSpain,
  );
});

test("team probabilities are complements across representative match states", () => {
  for (const minute of [0, 15, 45, 75, 89, 90, 91, 105, 119, 120]) {
    for (const spainScore of [0, 1, 3]) {
      for (const argentinaScore of [0, 1, 2]) {
        const state = { spainScore, argentinaScore, minute };
        const Spain = fairProbability("spain", state);
        const Argentina = fairProbability("argentina", state);
        approximately(Spain + Argentina, 1);
        assert.ok(Spain >= 0 && Spain <= 1);
        assert.ok(Argentina >= 0 && Argentina <= 1);
      }
    }
  }
});

test("a Spain goal raises Spain probability and an Argentina goal lowers it", () => {
  for (const minute of [0, 30, 60, 75, 89, 105]) {
    const tied = spainTitleProbability({
      spainScore: 1,
      argentinaScore: 1,
      minute,
    });
    const SpainLeads = spainTitleProbability({
      spainScore: 2,
      argentinaScore: 1,
      minute,
    });
    const ArgentinaLeads = spainTitleProbability({
      spainScore: 1,
      argentinaScore: 2,
      minute,
    });
    assert.ok(SpainLeads > tied);
    assert.ok(ArgentinaLeads < tied);
  }
});

test("time helps the leader and hurts the trailing team", () => {
  const SpainLeadingAt30 = spainTitleProbability({
    spainScore: 1,
    argentinaScore: 0,
    minute: 30,
  });
  const SpainLeadingAt75 = spainTitleProbability({
    spainScore: 1,
    argentinaScore: 0,
    minute: 75,
  });
  const SpainTrailingAt30 = spainTitleProbability({
    spainScore: 0,
    argentinaScore: 1,
    minute: 30,
  });
  const SpainTrailingAt75 = spainTitleProbability({
    spainScore: 0,
    argentinaScore: 1,
    minute: 75,
  });

  assert.ok(SpainLeadingAt75 > SpainLeadingAt30);
  assert.ok(SpainTrailingAt75 < SpainTrailingAt30);
});

test("minute 120 settles a lead and sends a tie to the penalty calibration", () => {
  assert.equal(
    spainTitleProbability({ spainScore: 2, argentinaScore: 1, minute: 120 }),
    1,
  );
  assert.equal(
    spainTitleProbability({ spainScore: 1, argentinaScore: 2, minute: 120 }),
    0,
  );
  approximately(
    spainTitleProbability({ spainScore: 1, argentinaScore: 1, minute: 120 }),
    PENALTY_SPAIN,
  );
});

test("fee-adjusted break-even price has zero EV and changes sign around it", () => {
  const probability = 0.4054;
  const commission = 0.02;
  const price = breakEvenPrice(probability, commission);
  const expectedRoi = (candidatePrice) =>
    probability * netWinPerDollar(candidatePrice, commission) - (1 - probability);

  approximately(expectedRoi(price), 0);
  assert.ok(expectedRoi(price - 0.01) > 0);
  assert.ok(expectedRoi(price + 0.01) < 0);
  approximately(requiredProbability(price, commission), probability);
});

test("full Kelly is the unique local maximum of expected log wealth", () => {
  const probability = 0.58;
  const price = 0.49;
  const commission = 0.02;
  const winReturn = netWinPerDollar(price, commission);
  const Kelly = fullKellyFraction(probability, price, commission);
  const expectedLog = (fraction) =>
    probability * Math.log(1 + fraction * winReturn) +
    (1 - probability) * Math.log(1 - fraction);

  assert.ok(Kelly > 0 && Kelly < 1);
  assert.ok(expectedLog(Kelly) > expectedLog(Kelly - 0.001));
  assert.ok(expectedLog(Kelly) > expectedLog(Kelly + 0.001));

  const secondDerivative =
    (-probability * winReturn ** 2) / (1 + Kelly * winReturn) ** 2 -
    (1 - probability) / (1 - Kelly) ** 2;
  assert.ok(secondDerivative < 0);
});

test("a qualifying price produces constrained one-eighth-Kelly stake", () => {
  const result = calculatePosition({
    spainScore: 0,
    argentinaScore: 0,
    minute: 0,
    bankroll: 1_000,
    team: "argentina",
    price: 0.35,
    commission: 0.02,
  });

  assert.equal(result.verdict, "TRADE");
  approximately(
    result.appliedBankrollFraction,
    Math.min(MODEL.bankrollCap, MODEL.kellyFraction * result.fullKellyFraction),
  );
  assert.ok(result.recommendedStake > 0);
  assert.ok(result.recommendedStake <= 10);
  approximately(result.maximumLoss, result.recommendedStake);
});

test("a price above the conservative maximum returns PASS and zero stake", () => {
  const result = calculatePosition({
    spainScore: 0,
    argentinaScore: 0,
    minute: 0,
    bankroll: 1_000,
    team: "spain",
    price: 0.64,
    commission: 0.02,
  });

  assert.equal(result.verdict, "PASS");
  assert.equal(result.recommendedStake, 0);
  assert.equal(result.maximumLoss, 0);
  assert.equal(result.shares, 0);
});

test("commission never improves maximum price or stake", () => {
  const probability = 0.6;
  assert.ok(maximumEntryPrice(probability, 0.05) < maximumEntryPrice(probability, 0));

  const base = {
    spainScore: 0,
    argentinaScore: 0,
    minute: 0,
    bankroll: 1_000,
    team: "spain",
    price: 0.5,
  };
  const noFee = calculatePosition({ ...base, commission: 0 });
  const withFee = calculatePosition({ ...base, commission: 0.05 });
  assert.ok(withFee.maximumEntry < noFee.maximumEntry);
  assert.ok(withFee.recommendedStake <= noFee.recommendedStake);
});

test("invalid states and market inputs are rejected", () => {
  const valid = {
    spainScore: 0,
    argentinaScore: 0,
    minute: 0,
    bankroll: 1_000,
    team: "spain",
    price: 0.5,
    commission: 0.02,
  };

  assert.throws(() => calculatePosition({ ...valid, spainScore: -1 }), RangeError);
  assert.throws(() => calculatePosition({ ...valid, minute: 121 }), RangeError);
  assert.throws(() => calculatePosition({ ...valid, bankroll: 0 }), RangeError);
  assert.throws(() => calculatePosition({ ...valid, price: 1 }), RangeError);
  assert.throws(() => calculatePosition({ ...valid, commission: 0.3 }), RangeError);
  assert.throws(() => calculatePosition({ ...valid, team: "draw" }), TypeError);
});
