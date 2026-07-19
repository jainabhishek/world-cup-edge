import React, { useMemo, useState } from "react";

import { Field } from "./components/Field.jsx";
import { Methodology } from "./components/Methodology.jsx";
import { Results } from "./components/Results.jsx";
import { ScoreStepper } from "./components/ScoreStepper.jsx";
import { TeamSelector } from "./components/TeamSelector.jsx";
import { calculatePosition } from "./model.js";

const INITIAL_INPUTS = {
  spainScore: 0,
  argentinaScore: 0,
  minute: 0,
  bankroll: 1_000,
  team: "spain",
  price: 0.64,
  commissionPercent: 2,
};

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}
export default function App() {
  const [draft, setDraft] = useState(INITIAL_INPUTS);
  const [submitted, setSubmitted] = useState(INITIAL_INPUTS);
  const [error, setError] = useState("");

  const result = useMemo(
    () =>
      calculatePosition({
        ...submitted,
        commission: submitted.commissionPercent / 100,
      }),
    [submitted],
  );

  const update = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    try {
      calculatePosition({ ...draft, commission: draft.commissionPercent / 100 });
      setSubmitted(draft);
      setError("");
    } catch (calculationError) {
      setError(calculationError.message);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <strong>Match Edge</strong>
        <span>Argentina vs Spain · Final</span>
      </header>

      <main>
        <div className="workspace">
          <form className="input-panel" onSubmit={submit} noValidate>
            <div className="intro">
              <h1>Trade the match, not the moment.</h1>
              <p>A conservative price and position calculator for Argentina vs Spain.</p>
            </div>

            <fieldset className="score-fieldset">
              <legend>Score</legend>
              <div className="score-grid">
                <ScoreStepper
                  team="Spain"
                  value={draft.spainScore}
                  onChange={(value) => update("spainScore", value)}
                />
                <ScoreStepper
                  team="Argentina"
                  value={draft.argentinaScore}
                  onChange={(value) => update("argentinaScore", value)}
                />
              </div>
            </fieldset>

            <Field
              label="Match minute"
              hint="Use 91–120 for extra time. Enter 90 after regulation has ended."
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={draft.minute}
              onChange={(event) => update("minute", Number(event.target.value))}
            />

            <Field
              label="Bankroll"
              prefix="$"
              type="number"
              inputMode="decimal"
              min="1"
              max="1000000000"
              step="10"
              value={draft.bankroll}
              onChange={(event) => update("bankroll", Number(event.target.value))}
            />

            <TeamSelector value={draft.team} onChange={(value) => update("team", value)} />

            <Field
              label="Current price"
              prefix="$"
              hint="A price of 0.37 means 37¢ for a contract that pays $1 if it wins."
              type="number"
              inputMode="decimal"
              min="0.01"
              max="0.99"
              step="0.01"
              value={draft.price}
              onChange={(event) => update("price", Number(event.target.value))}
            />

            <Field
              label="Commission"
              suffix="%"
              type="number"
              inputMode="decimal"
              min="0"
              max="25"
              step="0.1"
              value={draft.commissionPercent}
              onChange={(event) => update("commissionPercent", Number(event.target.value))}
            />

            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}

            <button className="calculate-button" type="submit">
              Calculate position
              <Arrow />
            </button>
          </form>

          <Results result={result} team={submitted.team} price={submitted.price} />
        </div>

        <Methodology />
      </main>

      <footer>
        Decision support only. Markets move faster than this model. Never chase losses.
      </footer>
    </div>
  );
}
