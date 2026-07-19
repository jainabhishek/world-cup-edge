export function ScoreStepper({ team, value, onChange }) {
  const setValue = (nextValue) => onChange(Math.max(0, Math.min(20, nextValue)));

  return (
    <div className="score-stepper">
      <span className={`score-stepper__team score-stepper__team--${team.toLowerCase()}`}>
        {team}
      </span>
      <div className="score-stepper__control">
        <button
          type="button"
          aria-label={`Decrease ${team} score`}
          onClick={() => setValue(value - 1)}
          disabled={value === 0}
        >
          −
        </button>
        <input
          aria-label={`${team} score`}
          type="number"
          inputMode="numeric"
          min="0"
          max="20"
          step="1"
          value={value}
          onChange={(event) => setValue(Number(event.target.value) || 0)}
        />
        <button
          type="button"
          aria-label={`Increase ${team} score`}
          onClick={() => setValue(value + 1)}
          disabled={value === 20}
        >
          +
        </button>
      </div>
    </div>
  );
}
