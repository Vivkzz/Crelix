# Deployment backup

Production snapshot for redeploying Crelix AI. **Private repo only — contains secrets and live user data.**

- `custom.db` — SQLite database snapshot (users, agents, runs, credits, templates, audit log)
- `.env` — production environment variables (NEXTAUTH_SECRET, RESEND_API_KEY, CRON_SECRET, DATABASE_URL, …)

## Restore on a new server

1. Place the env file at the project root: `cp database/.env .env`
2. Place the database: `mkdir -p db && cp database/custom.db db/custom.db`
3. Install deps + generate the Prisma client: `bun install && bunx prisma generate`
   (schema is at `prisma/schema.prisma`; `bunx prisma db push` is a no-op when in sync)
4. Build + start: `bun run build` then run the standalone server (see `.zscripts/`, systemd unit uses `.next/standalone/server.js` on port 3000)

## Notes

- The snapshot was taken with SQLite's online-backup API (consistent even under writes).
- Secrets in git history are permanent. If this repo is ever made public or shared,
  rotate NEXTAUTH_SECRET, RESEND_API_KEY, and CRON_SECRET immediately.

## Crelix rename on the live database

This snapshot already has the EKAM → Crelix rename applied. To apply the same
to the live database (back it up first; the script is safe to re-run):

    bun scripts/rebrand-db.ts /var/www/ekamai/db/custom.db            # preview
    bun scripts/rebrand-db.ts /var/www/ekamai/db/custom.db --apply    # write

The admin account's email becomes admin@crelixai.com (its ADMIN role is kept),
so that mailbox must receive sign-in links before you apply it.
