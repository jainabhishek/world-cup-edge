import React from "react";

const TEAMS = [
  { id: "spain", label: "Spain" },
  { id: "argentina", label: "Argentina" },
];

export function TeamSelector({ value, onChange }) {
  return (
    <fieldset className="team-selector">
      <legend>Contract to buy</legend>
      <div className="team-selector__options">
        {TEAMS.map((team) => (
          <label
            key={team.id}
            className={value === team.id ? "team-selector__option is-selected" : "team-selector__option"}
          >
            <input
              type="radio"
              name="team"
              value={team.id}
              checked={value === team.id}
              onChange={() => onChange(team.id)}
            />
            <span className="team-selector__radio" aria-hidden="true" />
            {team.label}
          </label>
        ))}
      </div>
      <p>
        You are evaluating the <strong>{value === "spain" ? "Spain" : "Argentina"}</strong>{" "}
        trophy-winner contract.
      </p>
    </fieldset>
  );
}
