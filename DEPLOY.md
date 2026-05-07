# Deploying iautomotive.co.uk to Vercel

## 1 — Push to GitHub

```bash
git add .
git commit -m "Production-ready scaffolding"
gh repo create iautomotive --private --source=. --push   # or push to an existing remote
```

## 2 — Provision the database (MongoDB Atlas)

1. Sign in at https://cloud.mongodb.com and create a project + cluster (region: London / `eu-west-2`, M0 free tier is fine to start).
2. **Network access**: add `0.0.0.0/0` (Atlas → Network Access → Add IP Address → Allow access from anywhere). Vercel's serverless IPs aren't fixed, so a CIDR allowlist is required.
3. **Database user**: Atlas → Database Access → Add new user. Use a long random password and grant `Atlas admin` (or `readWriteAnyDatabase`).
4. Atlas → Database → **Connect** → Drivers → Node.js. Copy the SRV URL:
   `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/iautomotive?retryWrites=true&w=majority`
5. From your local machine, push the schema once:
   ```bash
   DATABASE_URL="<atlas-srv-url>" npx prisma db push
   ```
   Do NOT run `npm run db:seed` — the seed creates demo users with password `demo`.

## 3 — Import the repo into Vercel

1. https://vercel.com/new → import your GitHub repo.
2. Framework: **Next.js** (auto-detected).
3. Build & install commands: leave default (the repo's `package.json` already runs `prisma generate`).
4. Add **Environment Variables** (Production scope) — see [.env.production.example](.env.production.example) for the full list. At minimum to boot:
   - `DATABASE_URL` — the Atlas SRV URL from step 2.
   - `JWT_SECRET` — generate with `openssl rand -base64 32`.
   - `NEXT_PUBLIC_BASE_URL=https://iautomotive.co.uk`
5. Click **Deploy**. First deploy will live at `iautomotive.vercel.app`.

## 4 — Add the domain in Vercel

1. Vercel project → **Settings → Domains**.
2. Add `iautomotive.co.uk` and `www.iautomotive.co.uk`.
3. Vercel will show you the DNS records to add at GoDaddy. You'll see something like:
   - **Apex** (`@`): A record → `76.76.21.21`
   - **www**: CNAME → `cname.vercel-dns.com`
   - Possibly a TXT verification record.

   **Use whatever values Vercel actually displays — they may differ from those above. Don't trust this doc over Vercel's own UI.**

## 5 — Configure DNS at GoDaddy

1. https://dcc.godaddy.com → **My Products** → DNS for `iautomotive.co.uk`.
2. **Delete** any existing `A @` records and any `CNAME www` records that point at GoDaddy parking / forwarders.
3. **Add** the records Vercel showed you:
   | Type  | Name | Value                  | TTL    |
   | ----- | ---- | ---------------------- | ------ |
   | A     | @    | (from Vercel)          | 1 hour |
   | CNAME | www  | cname.vercel-dns.com.  | 1 hour |
   | TXT   | @    | (from Vercel, if any)  | 1 hour |
4. If GoDaddy shows a "Domain Forwarding" entry redirecting the apex elsewhere, **remove it** — it overrides DNS.
5. Wait 5–15 minutes. Vercel's Domains tab will flip to **Valid Configuration** and issue a Let's Encrypt cert automatically.

## 6 — Smoke test

- https://iautomotive.co.uk → marketing homepage loads.
- https://iautomotive.co.uk/auth/signin → sign-in page (no Quick Demo buttons in production).
- Register a real account and confirm sign-in works against Neon.

## Production blockers still outstanding

These were intentionally **not** addressed and need separate work before public traffic:

- **Email delivery** — registration / password reset routes don't send emails yet. Wire up SendGrid (`SENDGRID_API_KEY`) before opening sign-up.
- **Payments / KYC** — the buyer/seller flows reference Stripe Connect, Stripe Identity, DocuSign, RouteOne. All envvars are empty placeholders. Each integration is a real project.
- **Vehicle data feeds** — DVLA / HPI / Cazana keys are also placeholders.
- **Object storage** — vehicle photo uploads will fail until S3 / R2 is configured.
- **FCA authorisation** — the marketing copy and footers reference FCA registration. Confirm with your solicitor what the site can claim while authorisation is pending.
- **Rate limiting** — `/api/auth/signin` has no rate limit. Add one (Vercel Edge Config + Upstash, or `@upstash/ratelimit`) before public launch.
- **Error tracking** — install Sentry and wire `NEXT_PUBLIC_SENTRY_DSN`.
- **Backups** — Neon takes automatic point-in-time backups on paid tiers; verify the retention window matches your needs.
