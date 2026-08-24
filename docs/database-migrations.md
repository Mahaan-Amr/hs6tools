# Database migration policy

HS6Tools has two supported database paths. Neither path rewrites a migration
that has already reached Production.

## Immutable Production history

`prisma/baseline/20260523090000/manifest.json` records the SHA-256 checksum and
actual Production execution order of every migration through
`20260523090000_expand_money_and_site_seo`. The execution order differs from
filename order because three migrations added later carry January 2025 names.

Do not edit, rename, delete, or reorder a migration listed in the manifest. The
verification command fails if a checksum changes or if an untracked migration
sorts before the baseline cutoff.

## Completely fresh database

For a new empty database:

1. Apply `prisma/baseline/20260523090000/schema.sql` with `prisma db execute`.
2. In the order recorded by `productionExecutionOrder`, mark each historical
   migration applied with `prisma migrate resolve --applied <migration>`.
3. Run `prisma migrate deploy` to apply every forward migration after the
   baseline cutoff.

The baseline is generated from the current Prisma schema and locked by the
checksum in the manifest. It contains schema only; seed data remains optional
and independent.

## Existing database or restored Production copy

Do not apply the baseline to an existing database. Preserve its
`_prisma_migrations` table and run only:

```bash
DATABASE_URL="<isolated-existing-copy-url>" npx prisma migrate deploy
```

Production migration execution is a separate release operation. It requires
Staging evidence, a rollback plan, and Release Owner approval; implementation
and CI must never point these commands at Production.

## Automated qualification

Run the complete rehearsal only against a disposable PostgreSQL cluster:

```bash
MIGRATION_VERIFY_ISOLATED=true \
MIGRATION_VERIFY_ADMIN_URL="postgresql://user:password@127.0.0.1:5432/postgres" \
npm run db:verify-migrations
```

The command creates random isolated databases, then:

- builds the fresh path from the locked baseline;
- reconstructs the existing path by replaying the recorded Production order;
- applies only forward migrations to both paths;
- compares both paths with `prisma/schema.prisma` and with each other; and
- drops the disposable databases even when verification fails.

CI runs this qualification automatically. Static checksum checks are available
without PostgreSQL through `npm run test:migrations`.

## Future incompatible changes

Use expand–migrate–contract across separate, rollback-safe promotions:

1. **Expand:** add nullable columns, new tables, indexes, or compatible enum
   values without removing behavior used by the previous release.
2. **Migrate:** backfill through an observable, restartable, idempotent job and
   verify invariants before switching reads or writes.
3. **Contract:** remove old structures only after every deployed application no
   longer uses them and rollback no longer depends on them.

A forward migration containing destructive SQL is rejected unless it includes
`-- migration-safety: approved-expand-migrate-contract`. That marker records an
already-reviewed exception; it is not approval by itself. Keep the expand,
migrate, and contract evidence with the release decision.
