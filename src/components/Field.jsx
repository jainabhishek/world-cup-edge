import React from "react";

export function Field({
  label,
  hint,
  prefix,
  suffix,
  className = "",
  ...inputProps
}) {
  return (
    <label className={`field ${className}`.trim()}>
      <span className="field__label">{label}</span>
      <span className="field__control">
        {prefix ? <span className="field__affix">{prefix}</span> : null}
        <input {...inputProps} />
        {suffix ? <span className="field__affix field__affix--suffix">{suffix}</span> : null}
      </span>
      {hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  );
}
