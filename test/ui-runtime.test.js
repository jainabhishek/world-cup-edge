import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const JSX_MODULES = [
  "src/App.jsx",
  "src/components/Field.jsx",
  "src/components/Methodology.jsx",
  "src/components/Results.jsx",
  "src/components/ScoreStepper.jsx",
  "src/components/TeamSelector.jsx",
  "src/main.jsx",
];

test("every JSX module binds React for the classic-runtime fallback", async () => {
  for (const modulePath of JSX_MODULES) {
    const source = await readFile(modulePath, "utf8");
    assert.match(
      source,
      /^import React(?:,| from)/m,
      `${modulePath} must import React so a clean Vite restart cannot render a blank page`,
    );
  }
});
