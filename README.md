# Sentinel
Secure, encrypted file sharing. Files are sealed with AES-256-GCM (a unique key per file) before they touch disk and
shared through expiring, password-protected, download-limited links you can revoke instantly.

**v1.0** is the free Starter plan: 5 GB, files up to 100 MB, password links, download limits, a file converter, and sign-in with Google or email. Paid plans are planned for v2.

## Run locally (Node 22.13 or newer)
    npm install
    npm run dev          # http://localhost:3000   (no .env needed locally)

## Host it
See `deploy/DEPLOY.md` (simple steps) and `OPERATIONS.md` (running the backend, backups, moderation). Release steps: `RELEASE.md`.

## Honest security notes
- Encryption at rest protects stolen disks and backups. The server holds the master key, so this is not end-to-end encryption.
- Losing `MASTER_KEY` makes every file unrecoverable. Keep an offline copy.
- Not yet included: email verification, password reset, two-factor login, malware scanning.
