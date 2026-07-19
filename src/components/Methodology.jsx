import { useEffect, useState } from "react";

import { MODEL, PENALTY_SPAIN, TIED_AFTER_REGULATION_SPAIN } from "../model.js";

function Chevron() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

export function Methodology() {
  const mediaQuery = "(max-width: 520px)";
  const [open, setOpen] = useState(
    () => typeof window === "undefined" || !window.matchMedia(mediaQuery).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(mediaQuery);
    const updateForViewport = (event) => setOpen(!event.matches);
    query.addEventListener("change", updateForViewport);
    return () => query.removeEventListener("change", updateForViewport);
  }, []);

  return (
    <details
      className="methodology"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <span>How this decision is made</span>
        <Chevron />
      </summary>
      <div className="methodology__grid">
        <article>
          <span className="methodology__number">1</span>
          <div>
            <h2>Score + time → fair probability</h2>
            <p>
              A remaining-goals model uses {MODEL.regulationGoals.spain.toFixed(2)} Spain
              and {MODEL.regulationGoals.argentina.toFixed(2)} Argentina expected goals per
              90 minutes.
            </p>
            <code>P(team wins trophy | score, minute)</code>
          </div>
        </article>
        <article>
          <span className="methodology__number">2</span>
          <div>
            <h2>Fair value − safety margins → maximum entry</h2>
            <p>
              Commission is applied first, then the price needs a 3-point absolute and 5%
              relative cushion.
            </p>
            <code>max = min(break-even − 0.03, break-even ÷ 1.05)</code>
          </div>
        </article>
        <article>
          <span className="methodology__number">3</span>
          <div>
            <h2>One-eighth Kelly, capped at 1% → stake</h2>
            <p>
              Full Kelly maximizes expected log wealth only when the probability is known.
              The app deliberately uses one eighth and a hard bankroll cap.
            </p>
            <code>stake = min(Kelly ÷ 8, 1%) × bankroll</code>
          </div>
        </article>
      </div>
      <div className="methodology__assumptions">
        <p>
          <strong>Calibration:</strong> Spain starts at {(
            MODEL.targetPrematchSpain * 100
          ).toFixed(2)}%; a tied match after 90 minutes gives Spain {(
            TIED_AFTER_REGULATION_SPAIN * 100
          ).toFixed(2)}%; a shootout gives Spain {(PENALTY_SPAIN * 100).toFixed(2)}%.
        </p>
        <p>
          <strong>Boundary:</strong> the price and Kelly equations are provable under their
          assumptions. The match probability and exit ladder are estimates and cannot
          guarantee profit.
        </p>
      </div>
    </details>
  );
}
