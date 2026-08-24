# Production runtime and SSH hardening runbook

This repository change only prepares and validates configuration. **Do not change Production from this ticket.** Production execution requires Staging evidence, a tested rollback, and explicit Release Owner approval in a separate release activity.

## Boundary and identities

- Nginx is the only public application ingress on ports 80/443.
- Next.js binds to `127.0.0.1:3000`; firewall rules must not expose port 3000.
- `hs6tools` is a system identity with no login shell and no sudo membership. It can read the application and `/etc/hs6tools/production.env`, and can write only uploads, the Next.js cache, and its log directory.
- The non-login `hs6deploy` identity owns the application checkout. `hs6tools` can traverse the checkout and read only built runtime artifacts (`node_modules`, `.next`, `public`, the runner, and required config); source, `.git`, docs, tests, and deployment tooling remain inaccessible. Existing upload and cache descendants remain runtime-owned and writable.

Generate a proposed filesystem plan with `sudo deploy/production/bin/prepare-runtime.sh --dry-run`. The `--apply` mode is reserved for the separately approved release.

## Staging qualification

1. Copy the versioned files to matching locations under `/etc/systemd/system`, `/etc/nginx`, `/etc/fail2ban`, and `/etc/logrotate.d`. Preserve the existing files beside them with a UTC timestamp suffix.
2. Install the real environment file separately as `root:hs6tools` mode `0640`. Never put it in a shell transcript or copy it into the repository.
3. Run `deploy/production/bin/inventory-env-files.sh /var/www/hs6tools /etc/hs6tools/production.env`. It prints only path, mode, owner, and group. Preview restrictions with `deploy/production/bin/harden-env-files.sh --dry-run /var/www/hs6tools`; its separately approved `--apply` mode makes the active `/etc` file `0640 root:hs6tools` and every repository-local environment copy `0600 root:root` without reading their contents.
4. Validate with `deploy/production/bin/validate-config.sh`, `sudo systemd-analyze verify /etc/systemd/system/hs6tools.service`, `sudo nginx -t`, `sudo sshd -t`, `sudo fail2ban-client -t`, and `sudo logrotate --debug /etc/logrotate.d/hs6tools`.
5. Preview `deploy/production/bin/harden-firewall.sh --dry-run`. In the approved Staging window apply it, enable UFW if needed, and inspect `ufw status numbered`: legacy port-3000 allows must be absent, the port-3000 deny must precede any broader rule, and only rate-limited OpenSSH plus Nginx HTTP/HTTPS may be public.
6. Confirm the service process runs as `hs6tools`, listens only on `127.0.0.1:3000`, and cannot write application source or read another user's home.
7. From a host outside Staging, run `deploy/production/bin/probe-runtime-boundary.sh https://STAGING_HOST http://STAGING_HOST:3000`. Save its non-secret output as Staging evidence.
8. Exercise normal storefront browsing, authentication, verification-code issuance, and Admin operations. Confirm only intentionally abusive bursts receive 429 responses.
9. Feed synthetic credentials, email addresses, phone numbers, and database URLs through the application logger. Confirm the stored logs contain redaction markers and no synthetic values.

## Staged SSH change and operator lockout check

Do not close the existing privileged SSH session during these steps.

1. Create the `ssh-users` group and add the named operator account. Confirm its `~/.ssh/authorized_keys`, home, `.ssh`, and key-file ownership/modes are correct.
2. Open a **second SSH session** using that operator's key and prove passwordless sudo works before staging any SSH daemon change.
3. Back up any existing drop-in, then copy `99-hs6tools-hardening.conf` to `/etc/ssh/sshd_config.d/99-hs6tools-hardening.conf`. This changes only the on-disk candidate; the running daemon is unchanged. Run `sudo sshd -t` and `sudo sshd -T -C user=OPERATOR,host=HOST,addr=OPERATOR_IP` to validate syntax and effective access.
4. Only after both checks pass, reload (do not restart) SSH. Keep the original session open.
5. Open a new second SSH session with the operator key. Verify root and password authentication are rejected from a separate terminal. Verify fail2ban reports the `sshd` jail active.
6. If any check fails, perform the rollback below from the still-open original session.

## Production approval checkpoint

The Release Owner must review and record all of the following before any Production command is authorized:

- Staging evidence for configuration validation, storefront smoke tests, rate limits, log redaction, and boundary probes.
- Exact Production operator/deploy identities, public hostname, certificate paths, environment-file path, and maintenance window.
- Backups of every replaced configuration file and the tested rollback commands.
- A second operator available for the SSH lockout check.

Approval for the pull request is not approval to execute on Production.

## Rollback procedure

1. From the original SSH session, restore the timestamped SSH configuration and run `sshd -t` before reloading SSH.
2. Restore the prior Nginx site/conf files, run `nginx -t`, then reload Nginx.
3. Restore the prior systemd unit, run `systemctl daemon-reload`, and start the previously active application service. Do not migrate or restore the database.
4. Restore the prior fail2ban jail and logrotate configuration; validate before reload.
5. Re-run the public/direct boundary probe and storefront smoke test. If the previous runtime exposed port 3000, keep the firewall closed and route through the prior reverse proxy instead.
6. Record timestamps, commands, validation output, and the reason for rollback without capturing secrets or personal data.
