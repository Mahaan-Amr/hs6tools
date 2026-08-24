import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(import.meta.dirname, "..");
const migrationsDirectory = resolve(root, "prisma/migrations");
const manifestPath = resolve(
  root,
  "prisma/baseline/20260523090000/manifest.json",
);
const prismaExecutable = process.execPath;
const prismaCli = resolve(root, "node_modules/prisma/build/index.js");

function fail(message) {
  throw new Error(message);
}

function sha256(path) {
  const canonicalContent = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  return createHash("sha256").update(canonicalContent).digest("hex");
}

function migrationPath(name) {
  return resolve(migrationsDirectory, name, "migration.sql");
}

export function containsPotentiallyDestructiveSql(sql) {
  const statements = sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--.*$/gm, " ");
  return /\b(DROP\s+(TABLE|COLUMN|TYPE|INDEX|VIEW|MATERIALIZED\s+VIEW|CONSTRAINT|SCHEMA|SEQUENCE|DATABASE|FUNCTION|PROCEDURE|TRIGGER|POLICY|EXTENSION)|TRUNCATE\b|DELETE\s+FROM\b|RENAME\s+(COLUMN|TO|VALUE)\b|ALTER\s+COLUMN[\s\S]{0,160}\b(TYPE|SET\s+DATA\s+TYPE|SET\s+NOT\s+NULL|DROP\s+DEFAULT|DROP\s+EXPRESSION)\b)/i.test(
    statements,
  );
}

function readManifest() {
  if (!existsSync(manifestPath))
    fail(`Missing baseline manifest: ${manifestPath}`);
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function verifyFiles() {
  const manifest = readManifest();
  const historicalNames = manifest.productionExecutionOrder.map(
    ({ migration }) => migration,
  );
  const uniqueNames = new Set(historicalNames);

  if (uniqueNames.size !== historicalNames.length) {
    fail("Production migration history contains duplicate names");
  }
  if (!uniqueNames.has(manifest.baseline.migration)) {
    fail("Baseline cutoff is not present in Production migration history");
  }

  const baselinePath = resolve(root, manifest.baseline.schema);
  if (!existsSync(baselinePath)) fail(`Missing baseline SQL: ${baselinePath}`);
  if (sha256(baselinePath) !== manifest.baseline.sha256) {
    fail(
      "Baseline SQL checksum changed; create a new forward baseline instead",
    );
  }

  for (const entry of manifest.productionExecutionOrder) {
    const path = migrationPath(entry.migration);
    if (!existsSync(path))
      fail(`Missing Production migration: ${entry.migration}`);
    if (sha256(path) !== entry.sha256) {
      fail(`Production migration checksum changed: ${entry.migration}`);
    }
  }

  const directories = readdirSync(migrationsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const untrackedHistorical = directories.filter(
    (name) => name <= manifest.baseline.migration && !uniqueNames.has(name),
  );
  if (untrackedHistorical.length > 0) {
    fail(
      `Migration ordering error before baseline cutoff: ${untrackedHistorical.join(", ")}`,
    );
  }

  const missingHistorical = historicalNames.filter(
    (name) => !directories.includes(name),
  );
  if (missingHistorical.length > 0) {
    fail(`Production migrations disappeared: ${missingHistorical.join(", ")}`);
  }

  const forwardMigrations = directories.filter(
    (name) => !uniqueNames.has(name),
  );
  for (const name of forwardMigrations) {
    if (name <= manifest.baseline.migration) {
      fail(`Forward migration sorts before baseline cutoff: ${name}`);
    }
    const sql = readFileSync(migrationPath(name), "utf8");
    if (
      containsPotentiallyDestructiveSql(sql) &&
      !sql.includes("-- migration-safety: approved-expand-migrate-contract")
    ) {
      fail(
        `Potentially destructive migration requires expand-migrate-contract approval: ${name}`,
      );
    }
  }

  console.log(
    `Migration baseline files verified (${historicalNames.length} immutable, ${forwardMigrations.length} forward)`,
  );
  return { manifest, forwardMigrations };
}

function runCheckedCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...options.env },
    input: options.input,
  });
  if (result.status !== 0) {
    const safeCommand = `${command} ${args.join(" ")}`.replace(
      /(postgres(?:ql)?:\/\/)[^@\s]+@/gi,
      "$1***@",
    );
    fail(
      [
        `Command failed (${result.status}): ${safeCommand}`,
        result.stdout,
        result.stderr,
        result.error?.message,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
  return result;
}

function prisma(args, options = {}) {
  return runCheckedCommand(prismaExecutable, [prismaCli, ...args], options);
}

function databaseUrl(adminUrl, databaseName) {
  const url = new URL(adminUrl);
  url.pathname = `/${databaseName}`;
  url.search = "";
  return url.toString();
}

function executeSql(url, sql) {
  prisma(["db", "execute", "--stdin", "--url", url], {
    input: sql,
    env: { DATABASE_URL: url },
  });
}

function applySqlFile(url, path) {
  prisma(["db", "execute", "--file", path, "--url", url], {
    env: { DATABASE_URL: url },
  });
}

function resolveHistory(url, migrations) {
  for (const { migration } of migrations) {
    prisma(["migrate", "resolve", "--applied", migration], {
      env: { DATABASE_URL: url },
    });
  }
}

function verifyNoDrift(url, label) {
  const result = spawnSync(
    prismaExecutable,
    [
      prismaCli,
      "migrate",
      "diff",
      "--exit-code",
      "--from-url",
      url,
      "--to-schema-datamodel",
      "prisma/schema.prisma",
    ],
    { cwd: root, encoding: "utf8", env: { ...process.env, DATABASE_URL: url } },
  );
  if (result.status === 2) {
    fail(`${label} schema drifted from prisma/schema.prisma\n${result.stdout}`);
  }
  if (result.status !== 0) {
    fail(
      `${label} schema comparison failed\n${result.stdout}\n${result.stderr}`,
    );
  }
}

function verifyDatabasePaths(manifest) {
  const adminUrl = process.env.MIGRATION_VERIFY_ADMIN_URL;
  if (!adminUrl) {
    fail("MIGRATION_VERIFY_ADMIN_URL is required for database verification");
  }
  if (process.env.MIGRATION_VERIFY_ISOLATED !== "true") {
    fail(
      "Set MIGRATION_VERIFY_ISOLATED=true only for a disposable PostgreSQL cluster",
    );
  }

  const parsedAdminUrl = new URL(adminUrl);
  if (!/^postgres(ql)?:$/.test(parsedAdminUrl.protocol)) {
    fail("Migration verification requires PostgreSQL");
  }
  const suffix = randomBytes(6).toString("hex");
  const freshName = `hs6tools_migration_verify_fresh_${suffix}`;
  const existingName = `hs6tools_migration_verify_existing_${suffix}`;
  const freshUrl = databaseUrl(adminUrl, freshName);
  const existingUrl = databaseUrl(adminUrl, existingName);
  const baselinePath = resolve(root, manifest.baseline.schema);

  let freshCreated = false;
  let existingCreated = false;
  try {
    executeSql(adminUrl, `CREATE DATABASE "${freshName}";`);
    freshCreated = true;
    executeSql(adminUrl, `CREATE DATABASE "${existingName}";`);
    existingCreated = true;

    applySqlFile(freshUrl, baselinePath);
    resolveHistory(freshUrl, manifest.productionExecutionOrder);
    prisma(["migrate", "deploy"], { env: { DATABASE_URL: freshUrl } });

    for (const { migration } of manifest.productionExecutionOrder) {
      applySqlFile(existingUrl, migrationPath(migration));
    }
    resolveHistory(existingUrl, manifest.productionExecutionOrder);
    prisma(["migrate", "deploy"], { env: { DATABASE_URL: existingUrl } });

    verifyNoDrift(freshUrl, "Fresh-database path");
    verifyNoDrift(existingUrl, "Existing-database path");
    const comparison = spawnSync(
      prismaExecutable,
      [
        prismaCli,
        "migrate",
        "diff",
        "--exit-code",
        "--from-url",
        freshUrl,
        "--to-url",
        existingUrl,
      ],
      {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, DATABASE_URL: freshUrl },
      },
    );
    if (comparison.status === 2) {
      fail(`Fresh and existing paths are not equivalent\n${comparison.stdout}`);
    }
    if (comparison.status !== 0) {
      fail(`Cross-path schema comparison failed\n${comparison.stderr}`);
    }
  } finally {
    if (freshCreated) {
      executeSql(
        adminUrl,
        `DROP DATABASE IF EXISTS "${freshName}" WITH (FORCE);`,
      );
    }
    if (existingCreated) {
      executeSql(
        adminUrl,
        `DROP DATABASE IF EXISTS "${existingName}" WITH (FORCE);`,
      );
    }
  }

  console.log(
    "Fresh and existing migration paths are equivalent and drift-free",
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const { manifest } = verifyFiles();
    if (!process.argv.includes("--check-files")) verifyDatabasePaths(manifest);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
