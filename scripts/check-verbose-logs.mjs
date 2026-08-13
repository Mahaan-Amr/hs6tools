import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const protectedAreas = [
  "src/app/api/admin/orders",
  "src/app/api/cron",
  "src/app/api/customer/orders",
  "src/app/api/payment",
  "src/app/api/sms",
  "src/components/admin",
  "src/contexts/CustomerContext.tsx",
  "src/lib/admin-auth.ts",
  "src/lib/cron",
  "src/lib/inventory.ts",
  "src/lib/sms.ts",
  "src/lib/zarinpal.ts",
  "src/components/layout/AdminLayoutWrapper.tsx",
];

const files = execFileSync("git", ["ls-files", ...protectedAreas], {
  encoding: "utf8",
})
  .split(/\r?\n/)
  .filter((file) => /\.(?:ts|tsx)$/.test(file));

const violations = files.flatMap((file) => {
  const source = readFileSync(file, "utf8");
  return [...source.matchAll(/console\.(?:log|info|debug)\s*\(/g)].map((match) => {
    const line = source.slice(0, match.index).split(/\r?\n/).length;
    return `${file}:${line}`;
  });
});

if (violations.length > 0) {
  console.error("Verbose operational logs are forbidden in protected flows:");
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log(`Operational logging check passed (${files.length} files).`);
