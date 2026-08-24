import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { containsPotentiallyDestructiveSql } from "../scripts/verify-migration-baseline.mjs";

test("migration baseline files preserve the Production history contract", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/verify-migration-baseline.mjs", "--check-files"],
    { cwd: process.cwd(), encoding: "utf8" },
  );

  assert.equal(
    result.status,
    0,
    [result.stdout, result.stderr].filter(Boolean).join("\n"),
  );
  assert.match(result.stdout, /Migration baseline files verified/);
});

test("destructive forward migrations require explicit safety approval", () => {
  const destructiveStatements = [
    'DROP INDEX "orders_lookup_idx";',
    'ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";',
    'DROP VIEW "active_orders";',
    'ALTER TABLE "orders" RENAME COLUMN "total" TO "legacyTotal";',
    'ALTER TABLE "orders" ALTER COLUMN "total" DROP DEFAULT;',
  ];

  for (const sql of destructiveStatements) {
    assert.equal(containsPotentiallyDestructiveSql(sql), true, sql);
  }
  assert.equal(
    containsPotentiallyDestructiveSql(
      '-- DROP TABLE is documentation only\nALTER TABLE "orders" ADD COLUMN "note" TEXT;',
    ),
    false,
  );
});
