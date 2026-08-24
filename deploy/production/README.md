# Production hardening artifacts

These files are release inputs for issue #7, not an automated Production deployment. Their paths mirror the intended Ubuntu locations. Follow `docs/PRODUCTION_HARDENING_RUNBOOK.md`; validate in Staging and obtain Release Owner approval before a separate Production change.

Run locally:

```bash
npm run test:production-hardening
bash deploy/production/bin/validate-config.sh
```

`prepare-runtime.sh` is dry-run by default. No script in this directory connects to a remote host.
