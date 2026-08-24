import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("runtime is a loopback-bound, least-privilege service", async () => {
  const service = await read("deploy/production/systemd/hs6tools.service");

  assert.match(service, /^User=hs6tools$/m);
  assert.match(service, /^Group=hs6tools$/m);
  assert.match(service, /--hostname 127\.0\.0\.1/);
  assert.match(service, /^NoNewPrivileges=true$/m);
  assert.match(service, /^ProtectSystem=strict$/m);
  assert.match(service, /^ReadWritePaths=.*uploads/m);

  const preparation = await read("deploy/production/bin/prepare-runtime.sh");
  assert.match(preparation, /useradd.*hs6deploy/);
  assert.match(preparation, /chown -R hs6deploy:hs6deploy \/var\/www\/hs6tools/);
  assert.match(preparation, /chmod -R u=rwX,g=,o= \/var\/www\/hs6tools/);
  assert.match(preparation, /chmod 0710 \/var\/www\/hs6tools\/scripts/);
  assert.match(preparation, /chown -R hs6tools:hs6tools \/var\/www\/hs6tools\/public\/uploads/);
  assert.match(preparation, /harden-env-files\.sh.*--apply/);
});

test("SSH hardening is key-only, non-root, staged, and brute-force protected", async () => {
  const [ssh, jail, runbook] = await Promise.all([
    read("deploy/production/ssh/99-hs6tools-hardening.conf"),
    read("deploy/production/fail2ban/sshd.local"),
    read("docs/PRODUCTION_HARDENING_RUNBOOK.md"),
  ]);

  assert.match(ssh, /^PubkeyAuthentication yes$/m);
  assert.match(ssh, /^PasswordAuthentication no$/m);
  assert.match(ssh, /^PermitRootLogin no$/m);
  assert.match(jail, /^enabled\s*=\s*true$/m);
  assert.match(runbook, /second SSH session/i);
  assert.match(runbook, /sshd -t/);
  assert.match(runbook, /rollback/i);
});

test("secret inventory reports metadata without reading values", async () => {
  const inventory = await read("deploy/production/bin/inventory-env-files.sh");

  assert.match(inventory, /-printf/);
  assert.doesNotMatch(inventory, /\b(?:cat|head|tail|sed|awk)\b/);
  assert.match(inventory, /%m/);
  assert.match(inventory, /%u/);
  assert.match(inventory, /%g/);
});

test("reverse proxy limits sensitive routes without limiting storefront traffic", async () => {
  const [http, site] = await Promise.all([
    read("deploy/production/nginx/conf.d/hs6tools-security.conf"),
    read("deploy/production/nginx/sites-available/hs6tools.conf"),
  ]);

  assert.match(http, /limit_req_zone/);
  assert.match(site, /location.*\/api\/auth/);
  assert.match(site, /location.*verify-phone/);
  assert.match(site, /location = \/api\/customer\/security\/password/);
  assert.match(site, /location.*\/api\/admin/);
  assert.match(site, /location.*\/api\/.*users.*settings.*analytics.*crm.*orders/);
  assert.match(site, /zone=hs6_admin_writes/);
  assert.match(site, /location.*\(\?:fa\|en\|ar\).*admin/);
  assert.match(site, /limit_req zone=/);
  assert.match(site, /access_log \/var\/log\/nginx\/hs6tools-access\.log hs6tools_privacy/g);

  const storefront = site.match(/location \/ \{([\s\S]*?)\n\s*\}/)?.[1] ?? "";
  assert.doesNotMatch(storefront, /limit_req/);
  assert.doesNotMatch(site, /location \^~ \/api\/auth\/ \{/);
  const routineAuth = site.match(/location \/api\/auth\/ \{([\s\S]*?)\n\s*\}/)?.[1] ?? "";
  assert.doesNotMatch(routineAuth, /limit_req/);
});

test("logs are redacted and retained for a bounded period", async () => {
  const [http, rotation, redactor] = await Promise.all([
    read("deploy/production/nginx/conf.d/hs6tools-security.conf"),
    read("deploy/production/logrotate/hs6tools"),
    import("../scripts/redact-production-log.mjs"),
  ]);

  assert.doesNotMatch(http, /\$request_uri|\$uri|\$http_authorization|\$http_cookie/);
  assert.match(rotation, /rotate\s+14/);
  assert.match(rotation, /maxage\s+14/);
  assert.match(rotation, /maxsize\s+50M/);
  assert.doesNotMatch(rotation, /^\s*size\s+/m);

  const output = redactor.redactLogLine(
    "email=person@example.com phone=09123456789 password=hunter2 token=abc123",
  );
  assert.equal(
    output,
    "email=[REDACTED] phone=[REDACTED] password=[REDACTED] token=[REDACTED]",
  );
  assert.equal(
    redactor.redactLogLine('{"email":"person@example.com","password":"hunter2"}'),
    '{"email":"[REDACTED]","password":"[REDACTED]"}',
  );
  assert.equal(
    redactor.redactLogLine("firstName: 'Ada', addressLine1: '42 Example St', authority: 'pay-123'"),
    "firstName: '[REDACTED]', addressLine1: '[REDACTED]', authority: '[REDACTED]'",
  );
  assert.equal(
    redactor.redactLogLine("database=postgresql://admin:unsafe@db.internal/app"),
    "database=postgresql://[REDACTED]@db.internal/app",
  );
  assert.equal(
    redactor.redactLogLine("parameters: [ { name: 'Code', value: '123456' } ], receptor: '+98 912 345 6789', ip: '203.0.113.4'"),
    "parameters: [REDACTED], receptor: '[REDACTED]', ip: '[REDACTED]'",
  );
  assert.equal(
    redactor.redactLogLine("caller +98 912 345 6789 from 203.0.113.4"),
    "caller [REDACTED_PHONE] from [REDACTED_IP]",
  );
  assert.equal(
    redactor.redactLogLine('{"verificationCode":123456,"userId":42}'),
    '{"verificationCode":"[REDACTED]","userId":"[REDACTED]"}',
  );
  assert.equal(
    redactor.redactLogLine('{"parameters":[{"name":"Code","value":123456}]}'),
    '{"parameters":"[REDACTED]"}',
  );
});

test("automated probes require public TLS success and direct runtime failure", async () => {
  const probe = await read("deploy/production/bin/probe-runtime-boundary.sh");

  assert.match(probe, /https:\/\//);
  assert.match(probe, /curl/);
  assert.match(probe, /direct runtime endpoint is reachable/i);
  assert.doesNotMatch(probe, /--insecure|-k\b/);
  const directCheck = probe.match(/if curl ([^;]+); then/)?.[1] ?? "";
  assert.doesNotMatch(directCheck, /--fail/);
});

test("runbook gates Production changes on approval and documents rollback", async () => {
  const runbook = await read("docs/PRODUCTION_HARDENING_RUNBOOK.md");

  assert.match(runbook, /Release Owner approval/);
  assert.match(runbook, /Staging evidence/);
  assert.match(runbook, /do not.*Production/i);
  assert.match(runbook, /Rollback procedure/);
});

test("legacy deployment entry points fail closed", async () => {
  const legacyScripts = await Promise.all([
    read("deploy.sh"),
    read("deploy/deploy.sh"),
    read("deploy/setup-server.sh"),
  ]);

  for (const script of legacyScripts) {
    assert.match(script, /legacy-disabled\.sh/);
    assert.doesNotMatch(script, /StrictHostKeyChecking=no|ufw allow 3000|SERVER_USER="root"/);
  }

  const disabled = await read("deploy/legacy-disabled.sh");
  assert.match(disabled, /LEGACY DEPLOYMENT DISABLED/);
  assert.match(disabled, /exit 1/);
});

test("environment-file restriction is dry-run-first and never prints values", async () => {
  const hardener = await read("deploy/production/bin/harden-env-files.sh");

  assert.match(hardener, /--dry-run/);
  assert.match(hardener, /0640/);
  assert.match(hardener, /0600/);
  assert.doesNotMatch(hardener, /\b(?:cat|head|tail|sed|awk)\b/);
});

test("host firewall exposes only SSH and the reverse proxy", async () => {
  const firewall = await read("deploy/production/bin/harden-firewall.sh");

  assert.match(firewall, /--dry-run/);
  assert.match(firewall, /ufw.*default deny incoming/);
  assert.match(firewall, /ufw.*limit OpenSSH/);
  assert.match(firewall, /ufw.*allow ['"]?Nginx Full/);
  assert.match(firewall, /delete allow 3000/);
  assert.match(firewall, /insert 1 deny 3000\/tcp/);
});
