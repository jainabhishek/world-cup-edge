function asPercent(value, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

function asSignedPoints(value) {
  const points = value * 100;
  return `${points >= 0 ? "+" : ""}${points.toFixed(1)} pp`;
}

function asCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function asPrice(value) {
  return value <= 0 ? "No price" : `$${value.toFixed(2)}`;
}

function Metric({ label, value, detail, tone }) {
  return (
    <div className={`metric ${tone ? `metric--${tone}` : ""}`.trim()}>
      <dt>{label}</dt>
      <dd>{value}</dd>
      <span>{detail}</span>
    </div>
  );
}
export function Results({ result, team, price }) {
  const isTrade = result.verdict === "TRADE";
  const selectedTeam = team === "spain" ? "Spain" : "Argentina";

  return (
    <section className={`results results--${result.verdict.toLowerCase()}`} aria-live="polite">
      <div className="verdict">
        <span>Verdict</span>
        <strong>{result.verdict}</strong>
        <p>
          {isTrade
            ? `${selectedTeam} clears the model's price and risk limits.`
            : "The current price is above your maximum entry."}
        </p>
      </div>

      <dl className="metrics">
        <Metric
          label="Fair probability"
          value={asPercent(result.fairProbability)}
          detail={`Break-even ${asPrice(result.breakEvenPrice)}`}
        />
        <Metric
          label="Maximum entry"
          value={asPrice(result.maximumEntry)}
          detail="Place a limit order at or below"
        />
        <Metric
          label="Recommended stake"
          value={asCurrency(result.recommendedStake)}
          detail={`${asPercent(result.appliedBankrollFraction, 2)} of bankroll`}
        />
        <Metric
          label="Maximum loss"
          value={asCurrency(result.maximumLoss)}
          detail={isTrade ? `${result.shares.toFixed(2)} contracts` : "No position"}
        />
        <Metric
          label="Model edge"
          value={asSignedPoints(result.modelEdge)}
          detail={`Expected ROI ${asPercent(result.expectedRoi)}`}
          tone={result.modelEdge >= 0 ? "positive" : "negative"}
        />
      </dl>

      <div className="exit-plan">
        <div className="exit-plan__heading">
          <h2>Exit plan</h2>
          <p>{isTrade ? "For this position" : "Use only if a price qualifies"}</p>
        </div>
        <div className="exit-plan__rail" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="exit-plan__steps">
          <div>
            <span>Take 50% off</span>
            <strong>{asPrice(result.exitPlan.takeHalfPrice)}</strong>
            <small>20% above {asPrice(price)}</small>
          </div>
          <div>
            <span>Close the remainder</span>
            <strong>{asPrice(result.exitPlan.closeRemainderPrice)}</strong>
            <small>35% above entry</small>
          </div>
          <div>
            <span>Time stop</span>
            <strong>{result.exitPlan.timeStop}′</strong>
            <small>Exit regardless of price</small>
          </div>
        </div>
      </div>
      <p className="results__note">
        Recalculate after any goal, red card, penalty, or major injury. Price targets are
        risk controls, not guaranteed fills.
      </p>
    </section>
  );
}
