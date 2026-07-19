const POISSON_MAX_GOALS = 24;

export const MODEL = Object.freeze({
  regulationGoals: Object.freeze({ spain: 1.05, argentina: 0.75 }),
  targetPrematchSpain: 0.5946,
  absoluteSafetyMargin: 0.03,
  relativeSafetyMultiplier: 1.05,
  kellyFraction: 1 / 8,
  bankrollCap: 0.01,
  maximumCommission: 0.25,
  maximumMinute: 120,
  maximumScore: 20,
});

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function poissonDistribution(lambda) {
  if (lambda === 0) {
    return [1];
  }

  const probabilities = [Math.exp(-lambda)];
  let total = probabilities[0];

  for (let goals = 1; goals <= POISSON_MAX_GOALS; goals += 1) {
    probabilities[goals] = probabilities[goals - 1] * (lambda / goals);
    total += probabilities[goals];
  }

  // At the supported rates the omitted tail is far below display precision. Add
  // it to the last bucket so every enumerated distribution still sums to one.
  probabilities[POISSON_MAX_GOALS] += Math.max(0, 1 - total);
  return probabilities;
}

function outcomeParts(lambdaSpain, lambdaArgentina, startingGoalDifference = 0) {
  const spainGoals = poissonDistribution(lambdaSpain);
  const argentinaGoals = poissonDistribution(lambdaArgentina);
  let spainWin = 0;
  let draw = 0;
  let argentinaWin = 0;

  for (let Spain = 0; Spain < spainGoals.length; Spain += 1) {
    for (let Argentina = 0; Argentina < argentinaGoals.length; Argentina += 1) {
      const probability = spainGoals[Spain] * argentinaGoals[Argentina];
      const finalDifference = startingGoalDifference + Spain - Argentina;

      if (finalDifference > 0) spainWin += probability;
      else if (finalDifference < 0) argentinaWin += probability;
      else draw += probability;
    }
  }

  return { spainWin, draw, argentinaWin };
}

const regulationParts = outcomeParts(
  MODEL.regulationGoals.spain,
  MODEL.regulationGoals.argentina,
);

export const TIED_AFTER_REGULATION_SPAIN =
  (MODEL.targetPrematchSpain - regulationParts.spainWin) / regulationParts.draw;

const extraTimeParts = outcomeParts(
  MODEL.regulationGoals.spain / 3,
  MODEL.regulationGoals.argentina / 3,
);

export const PENALTY_SPAIN =
  (TIED_AFTER_REGULATION_SPAIN - extraTimeParts.spainWin) / extraTimeParts.draw;

function titleProbabilityFromRemainingGoals({
  lambdaSpain,
  lambdaArgentina,
  goalDifference,
  tiedResolution,
}) {
  const parts = outcomeParts(lambdaSpain, lambdaArgentina, goalDifference);
  return clamp(parts.spainWin + parts.draw * tiedResolution, 0, 1);
}

export function validateMatchState({ spainScore, argentinaScore, minute }) {
  const scores = [spainScore, argentinaScore];

  if (
    scores.some(
      (score) =>
        !Number.isInteger(score) || score < 0 || score > MODEL.maximumScore,
    )
  ) {
    throw new RangeError(
      `Scores must be whole numbers from 0 to ${MODEL.maximumScore}.`,
    );
  }

  if (!Number.isFinite(minute) || minute < 0 || minute > MODEL.maximumMinute) {
    throw new RangeError(`Minute must be from 0 to ${MODEL.maximumMinute}.`);
  }
}

export function spainTitleProbability(state) {
  validateMatchState(state);
  const { spainScore, argentinaScore, minute } = state;
  const goalDifference = spainScore - argentinaScore;

  if (minute < 90) {
    const remainingShare = (90 - minute) / 90;
    return titleProbabilityFromRemainingGoals({
      lambdaSpain: MODEL.regulationGoals.spain * remainingShare,
      lambdaArgentina: MODEL.regulationGoals.argentina * remainingShare,
      goalDifference,
      tiedResolution: TIED_AFTER_REGULATION_SPAIN,
    });
  }

  // A non-tied score at the end of regulation is settled. A tie advances to ET.
  if (minute === 90 && goalDifference !== 0) {
    return goalDifference > 0 ? 1 : 0;
  }

  if (minute === 120) {
    if (goalDifference > 0) return 1;
    if (goalDifference < 0) return 0;
    return PENALTY_SPAIN;
  }

  const remainingExtraTimeShare = (120 - minute) / 90;
  return titleProbabilityFromRemainingGoals({
    lambdaSpain: MODEL.regulationGoals.spain * remainingExtraTimeShare,
    lambdaArgentina: MODEL.regulationGoals.argentina * remainingExtraTimeShare,
    goalDifference,
    tiedResolution: PENALTY_SPAIN,
  });
}

export function fairProbability(team, state) {
  if (team !== "spain" && team !== "argentina") {
    throw new TypeError('Team must be "spain" or "argentina".');
  }

  const Spain = spainTitleProbability(state);
  return team === "spain" ? Spain : 1 - Spain;
}

export function validateMarketInputs({ bankroll, price, commission }) {
  if (!Number.isFinite(bankroll) || bankroll <= 0 || bankroll > 1_000_000_000) {
    throw new RangeError("Bankroll must be greater than zero and at most $1 billion.");
  }

  if (!Number.isFinite(price) || price <= 0 || price >= 1) {
    throw new RangeError("Current price must be greater than 0 and less than 1.");
  }

  if (
    !Number.isFinite(commission) ||
    commission < 0 ||
    commission > MODEL.maximumCommission
  ) {
    throw new RangeError(
      `Commission must be from 0% to ${MODEL.maximumCommission * 100}%.`,
    );
  }
}

export function netWinPerDollar(price, commission) {
  return (1 - commission) * ((1 - price) / price);
}

export function requiredProbability(price, commission) {
  return price / (1 - commission + commission * price);
}

export function breakEvenPrice(probability, commission) {
  if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
    throw new RangeError("Probability must be from 0 to 1.");
  }
  if (
    !Number.isFinite(commission) ||
    commission < 0 ||
    commission > MODEL.maximumCommission
  ) {
    throw new RangeError(
      `Commission must be from 0% to ${MODEL.maximumCommission * 100}%.`,
    );
  }

  return (probability * (1 - commission)) / (1 - probability * commission);
}

export function maximumEntryPrice(probability, commission) {
  const breakEven = breakEvenPrice(probability, commission);
  return clamp(
    Math.min(
      breakEven - MODEL.absoluteSafetyMargin,
      breakEven / MODEL.relativeSafetyMultiplier,
    ),
    0,
    0.99,
  );
}

export function fullKellyFraction(probability, price, commission) {
  const winReturn = netWinPerDollar(price, commission);
  if (winReturn <= 0) return 0;
  return clamp(
    (probability * winReturn - (1 - probability)) / winReturn,
    0,
    1,
  );
}

function timeStopFor(minute) {
  if (minute < 75) return 75;
  if (minute < 90) return Math.min(85, Math.ceil(minute + 5));
  if (minute < 115) return Math.min(115, Math.ceil(minute + 5));
  return 120;
}

export function calculatePosition(input) {
  const {
    spainScore,
    argentinaScore,
    minute,
    bankroll,
    team,
    price,
    commission,
  } = input;

  validateMatchState({ spainScore, argentinaScore, minute });
  validateMarketInputs({ bankroll, price, commission });

  const probability = fairProbability(team, {
    spainScore,
    argentinaScore,
    minute,
  });
  const required = requiredProbability(price, commission);
  const breakEven = breakEvenPrice(probability, commission);
  const maximumEntry = maximumEntryPrice(probability, commission);
  const Kelly = fullKellyFraction(probability, price, commission);
  const qualifies = price <= maximumEntry && Kelly > 0;
  const appliedFraction = qualifies
    ? Math.min(MODEL.bankrollCap, MODEL.kellyFraction * Kelly)
    : 0;
  const stake = bankroll * appliedFraction;
  const winReturn = netWinPerDollar(price, commission);
  const expectedRoi = probability * winReturn - (1 - probability);

  return {
    verdict: qualifies ? "TRADE" : "PASS",
    fairProbability: probability,
    requiredProbability: required,
    breakEvenPrice: breakEven,
    maximumEntry,
    modelEdge: probability - required,
    expectedRoi,
    fullKellyFraction: Kelly,
    appliedBankrollFraction: appliedFraction,
    recommendedStake: stake,
    maximumLoss: stake,
    shares: stake / price,
    netProfitIfWin: stake * winReturn,
    expectedProfit: stake * expectedRoi,
    exitPlan: {
      takeHalfPrice: Math.min(0.99, price * 1.2),
      closeRemainderPrice: Math.min(0.99, price * 1.35),
      timeStop: timeStopFor(minute),
    },
  };
}
