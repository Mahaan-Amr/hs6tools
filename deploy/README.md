# Deployment

The legacy root/PM2 deployment path is disabled because it exposed the application runtime and did not enforce the required identity, SSH, secret, rate-limit, and logging boundaries.

Production hardening inputs live under `deploy/production`. Start with `docs/PRODUCTION_HARDENING_RUNBOOK.md`. Repository work does not authorize a Production change; Staging evidence and explicit Release Owner approval are required.
