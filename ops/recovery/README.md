# HS6Tools recovery runbook

This package establishes a fifteen-minute **logical-failure RPO** and a sixty-minute **logical-failure RTO target** for PostgreSQL plus application data. It does not promise recovery from total server or disk loss: retained backups and archived WAL remain on the same server. Moving a verified encrypted copy off-host is a separate topology change and requires Release Owner approval.

Nothing in this package deploys, restarts, migrates, restores, deletes, or reconfigures Production automatically. Production enablement is a separate release operation after a Staging rehearsal and rollback plan.

## Recovery inventory and retention

| Content | Mechanism | Cadence / bound | Retention |
| --- | --- | --- | --- |
| PostgreSQL WAL | AES-256 encrypted `archive_command`, checksum per segment | continuous, `archive_timeout=15min` | 35 days |
| PostgreSQL physical base backup | `pg_basebackup`, AES-256 encrypted and verified | weekly | 35 days |
| Database logical backup | custom-format `pg_dump` inside encrypted application archive | daily | 35 days |
| Uploaded assets | compressed inside encrypted application archive | daily | 35 days |
| Required runtime configuration | mode-0600 copy inside encrypted application archive | daily | 35 days |
| Release identity | non-secret manifest in encrypted application archive | daily | 35 days |

Continuous WAL archival plus `archive_timeout=15min` and a retained base backup provide the PITR path. The logical application archive is the recurring isolated-restore qualification path. A job succeeds only after its encrypted artifact is checksummed, the checksum is re-read, and GPG can decrypt it. Scripts exit non-zero on failure and can call an alert executable through `BACKUP_ALERT_COMMAND`; command lines and logs omit the database URL, passphrase, runtime configuration, and provider credentials.

## One-time Staging installation rehearsal

1. Install PostgreSQL client tools matching the server major version, GnuPG, `curl`, and GNU coreutils. Create a locked `hs6backup` account with read access only to uploads/runtime files and PostgreSQL backup/replication privileges.
2. Copy `recovery.env.example` to `/etc/hs6tools/recovery.env`, `pg_service.conf.example` to the configured `PGSERVICEFILE`, and `pgpass.example` to `PGPASSFILE`; set all three to mode `0600` or stricter. The service file contains only host/database/user parameters, while the password exists only in `.pgpass`, never in a URL or process argument. Create a random backup-encryption passphrase at `BACKUP_PASSPHRASE_FILE` with mode `0400`. Never put either passphrase in the environment, repository, logs, or ticket.
3. Install the systemd units and timers from `systemd/`, run `systemctl daemon-reload`, then execute both services manually in Staging. Confirm their systemd `Result` is `success` and the alert receiver records success.
4. Merge `postgresql-pitr.conf.example` into the Staging PostgreSQL configuration. Restarting PostgreSQL is required for `archive_mode`; that restart is prohibited in Production by this ticket. Generate writes for at least sixteen minutes, verify multiple `.gpg`/`.sha256` WAL pairs, and require `pg_stat_archiver.failed_count` to remain zero.
5. Enable timers in Staging only. Production installation, configuration mutation, and restart require separate Release Owner approval.

On the isolated PostgreSQL cluster, create a dedicated `hs6tools_recovery_control` database and initialize its cluster-local authorization marker. Production must never contain this database/table:

```bash
createdb hs6tools_recovery_control
psql hs6tools_recovery_control \
  --set=recovery_environment=staging \
  --set=recovery_instance_id=<unique-isolated-cluster-id> \
  --file=ops/recovery/initialize-isolated-control.sql
```

Both restore and deletion compare the control, admin, and target URLs using PostgreSQL's physical `system_identifier` and require the control record to match `RECOVERY_ENVIRONMENT`/`RECOVERY_INSTANCE_ID`. A label or database-name prefix alone cannot authorize a destructive command.

The backup role needs `CONNECT`, sufficient table/sequence access for `pg_dump`, and `REPLICATION` for `pg_basebackup`; it must not own Production or have `CREATEDB`, `SUPERUSER`, or application write privileges.

## Isolated restore and masking rehearsal

Create an empty `hs6tools_restore_<suffix>` database on the authorized isolated Staging PostgreSQL instance. Keep the Staging app internal until masking completes. Copy `staging-restore.env.example` to a mode-0600 file, point it at that database/control marker, name the operator and access ticket, and leave all real provider credentials blank. Create a random smoke token file with mode `0400`. `RECOVERY_APP_START_COMMAND` must start the isolated application with the supplied `DATABASE_URL`, `EXTERNAL_EFFECTS_DISABLED`, `RECOVERY_EXPECTED_DATABASE`, and `RECOVERY_SMOKE_TOKEN`; it must return only when the internal listener is ready.

```bash
set -a
source /etc/hs6tools/staging-restore.env
export RECOVERY_INCIDENT_EPOCH="$(date +%s)"
set +a
ops/recovery/restore-and-validate.sh /var/backups/hs6tools/application/hs6tools-application-<timestamp>.tar.gz.gpg
```

The command verifies the authorized physical PostgreSQL cluster and checksum before decryption, requires an empty isolated target, restores the database, checks critical schema and complete Prisma migration history, records row counts, applies deterministic masking, verifies masking and disabled database-backed providers, confirms row counts did not change, restores uploads into a private quarantine, and starts the isolated app. Its token-protected `/api/recovery/smoke` response must prove both `EXTERNAL_EFFECTS_DISABLED=true` and that the app is connected to the named restored database. Plaintext database/config material exists only in a mode-0700 temporary directory and is deleted on exit. A failure before verified masking triggers attempted deletion of the unmasked database plus an audit event.

The uploads quarantine is never served. Ticket attachment references are masked; only reviewed non-personal product/content assets may later be copied into public Staging storage. The quarantine is deleted with the database after rehearsal.

Do not grant general Staging access until `restore-report.txt` says `status=passed`, the runtime has `EXTERNAL_EFFECTS_DISABLED=true`, and the audit log contains `masking_complete`. The runtime kill switch makes SMS, email, and payment request/verification/lookup/refund calls fail closed even if a credential is mistakenly present.

## Deterministic deletion

After evidence collection, keep the named operator/ticket values and use the exact confirmation token:

```bash
export RECOVERY_DELETE_CONFIRMATION="DELETE ${RECOVERY_DATABASE_NAME}"
ops/recovery/delete-isolated-restore.sh
```

Only a `hs6tools_restore_*` database in Staging/recovery is accepted. The command terminates its sessions, drops it, deletes only the configured `/var/lib/hs6tools-recovery/...` upload quarantine, and audits start/completion. Evidence and audit logs remain under the release evidence policy and contain no unmasked data.

## PITR rehearsal and the sixty-minute RTO

On an isolated PostgreSQL host, verify the chosen base checksum, decrypt it into a new data directory, configure the encrypted `restore_command` from `postgresql-pitr.conf.example`, set `recovery_target_time` immediately before a known test failure, and start only that isolated instance. Never target Production or an existing data directory.

Record UTC timestamps for incident declaration, acknowledgement, base selection, checksum verification, database recovery, masking, smoke success, acceptance, and deletion. Set `RECOVERY_INCIDENT_EPOCH` at declaration; `restore-and-validate.sh` calculates `rto_seconds`, rejects values above 3600, and records the measurement in `restore-report.txt`. Retain the chosen target, PostgreSQL recovery completion evidence, report, migration/row-count comparisons, smoke result, alert delivery, and deletion audit. Any missed RPO/RTO, checksum/archive gap, masking, alert, or cleanup failure is a No-Go.

## Production approval gate

Before a later Production operation, reconcile with current `master`, repeat Staging rehearsal, prepare PostgreSQL configuration rollback, and obtain Release Owner approval. Approval must cover unit installation, `archive_mode`/`archive_command`, restart, timers, retention, monitoring, and the accepted same-server-loss limitation. This ticket performs none of those Production mutations.
