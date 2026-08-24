# Production deployment

Use this checklist before entering real stock, customer, or payment data.

## 1. Provision PostgreSQL

Create a dedicated database and user, then set `DATABASE_URL`. For a managed database that requires TLS, also set `DATABASE_SSL=true`. Import the current local datastore once with:

```powershell
npm.cmd run db:check
npm.cmd run db:migrate
```

The application creates its state table automatically and prevents two server processes from writing to the same state at once.

## 2. Configure production secrets

Set these values in the hosting platform, not in source control:

```text
NODE_ENV=production
HOST=0.0.0.0
SESSION_SECRET=<random value of at least 32 characters>
PUBLIC_BASE_URL=https://stock.your-company.et
COOKIE_SECURE=true
DATABASE_URL=<managed PostgreSQL connection string>
DATABASE_SSL=true
BACKUP_INTERVAL_HOURS=24
BACKUP_RETENTION_COUNT=30
CHAPA_SECRET_KEY=<live Chapa merchant key>
```

`CHAPA_SECRET_KEY` is optional until online checkout is required. Never place it in browser code. The server verifies Chapa transactions before recording payment.

## 3. Deploy behind HTTPS

Build and run the container with a persistent backup volume or equivalent managed storage:

```powershell
docker build -t nile-stock .
docker run -p 3000:3000 --env-file .env nile-stock
```

Terminate TLS at the hosting load balancer or reverse proxy and forward the original `Host` header. Restrict direct access to the Node port.

## 4. Complete launch checks

Sign in as an administrator and open **Settings → Production readiness**. All required checks must pass. Change the seeded administrator and cashier passwords from the account-security/team controls.

Create a manual backup and perform a restore drill in a separate environment. Copy backups to an off-site location; retention on the same server is not sufficient disaster recovery.

## 5. Activate Chapa

After the public HTTPS address works, add the live merchant key and restart the service. Create a small test invoice, open Chapa checkout from the invoice, pay it, and confirm the verified payment appears once in the ledger. Do not launch live online collection until that end-to-end test succeeds.
