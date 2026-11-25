# Sentinel — secure file sharing
Encrypted vault + expiring, password-protected share links. Plans: Starter (free, 5 GB), Plus $4 (200 GB), Pro $10 (2 TB).

## Run
    npm install
    cp .env.example .env
    npm start        # http://localhost:3000

## Security built in
- AES-256-GCM encryption at rest, unique key per file, keys wrapped by MASTER_KEY
- bcrypt passwords, JWT in httpOnly + SameSite=Strict cookie, login rate limiting
- Share tokens: 256-bit random, only SHA-256 hash stored; expiry, revoke, password, download limit
- Helmet + strict CSP, executable uploads blocked, per-plan size/storage limits, full audit log

## Go live checklist
1. NODE_ENV=production, set JWT_SECRET and MASTER_KEY (`openssl rand -hex 32`). BACK UP MASTER_KEY: lose it = files unrecoverable.
2. Serve behind HTTPS (Caddy/nginx/Render/Fly). Cookies are Secure in production.
2b. (Optional) Google sign-in: set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET and register `APP_URL/api/auth/google/callback` as an authorized redirect URI.
3. Stripe: create 2 monthly prices (Pro, Business), set STRIPE_SECRET_KEY, STRIPE_PRICE_PLUS, STRIPE_PRICE_PRO,
   add webhook https://YOURDOMAIN/api/billing/webhook (events: checkout.session.completed, customer.subscription.deleted) → STRIPE_WEBHOOK_SECRET.
   Set DEMO_BILLING=false.
4. Put ./data on a persistent volume and back it up.

## Not included yet (next steps)
Email verification & password reset, 2FA, malware scanning (ClamAV), S3 storage, folders, team accounts, Stripe customer portal, ToS/Privacy pages.
