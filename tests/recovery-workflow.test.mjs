import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function runRecoveryScript(script, environment = {}, args = []) {
  const scriptPath = `ops/recovery/${script}`;
  const sharedEnvironment = {
    PATH: process.env.PATH,
    ...environment,
  };

  if (process.platform !== "win32") {
    return spawnSync("bash", [scriptPath, ...args], {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: sharedEnvironment,
    });
  }

  const dockerArguments = [
    "run",
    "--rm",
    "-v",
    `${repositoryRoot}:/workspace`,
    "-w",
    "/workspace",
  ];
  for (const [name, value] of Object.entries(environment)) {
    dockerArguments.push("-e", `${name}=${value}`);
  }
  dockerArguments.push("bash:5.2", "bash", scriptPath, ...args);

  return spawnSync("docker", dockerArguments, {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: { ...process.env },
  });
}

function combinedOutput(result) {
  return `${result.stdout || ""}\n${result.stderr || ""}`;
}

test("restore refuses a Production execution context before touching PostgreSQL", () => {
  const result = runRecoveryScript("restore-and-validate.sh", {
    RECOVERY_ENVIRONMENT: "production",
  });

  assert.notEqual(result.status, 0);
  assert.match(combinedOutput(result), /refus.*production/i);
  assert.doesNotMatch(combinedOutput(result), /command not found/i);
});

test("isolated database deletion refuses a Production execution context", () => {
  const result = runRecoveryScript("delete-isolated-restore.sh", {
    RECOVERY_ENVIRONMENT: "production",
  });

  assert.notEqual(result.status, 0);
  assert.match(combinedOutput(result), /refus.*production/i);
  assert.doesNotMatch(combinedOutput(result), /command not found/i);
});

test("application backup requires a protected encryption passphrase file", () => {
  const result = runRecoveryScript("application-backup.sh", {
    RECOVERY_ENVIRONMENT: "staging",
    BACKUP_PASSPHRASE_FILE: "/missing/recovery-passphrase",
  });

  assert.notEqual(result.status, 0);
  assert.match(combinedOutput(result), /passphrase file/i);
  assert.doesNotMatch(combinedOutput(result), /command not found/i);
});

test("WAL archival requires a protected encryption passphrase file", () => {
  const result = runRecoveryScript(
    "archive-wal.sh",
    {
      BACKUP_PASSPHRASE_FILE: "/missing/recovery-passphrase",
      WAL_ARCHIVE_DIR: "/tmp/wal-archive",
    },
    ["/tmp/000000010000000000000001", "000000010000000000000001"],
  );

  assert.notEqual(result.status, 0);
  assert.match(combinedOutput(result), /passphrase file/i);
  assert.doesNotMatch(combinedOutput(result), /command not found/i);
});
