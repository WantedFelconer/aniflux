# Deploying Aniflux to Vercel (Free Hosting Guide)

Aniflux is pre-configured to be hosted for free on **Vercel** with full functionality for both the frontend (Vite React UI) and backend API (Serverless Express functions).

---

## Quick Deploy (Zero-Config)

### Option 1: Vercel Dashboard (Recommended)

1. Push this repository to **GitHub** / **GitLab** / **Bitbucket**.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Click **Import Project** and select your `aniflux` repository.
4. Keep the default settings (Vercel automatically detects `vercel.json`):
   - **Framework Preset**: Other / Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
5. Click **Deploy**.

> [!TIP]
> **Out-of-the-box In-Memory DB**: No environment variables are strictly required to start! The application will automatically fall back to a rich in-memory dataset if no MySQL database credentials are provided.

---

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Connecting a Free Cloud MySQL Database (Optional)

If you want persistent user accounts, library, and favorites stored in a real database, you can connect a **Free Tier Cloud MySQL database** (such as [TiDB Cloud Serverless](https://tidbcloud.com/) or [Aiven MySQL](https://aiven.io/mysql)):

1. Open your project on the **Vercel Dashboard**.
2. Go to **Settings** -> **Environment Variables**.
3. Add the following environment variables:

| Variable Name | Example Value | Description |
|---|---|---|
| `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` | Database server hostname |
| `DB_PORT` | `4000` | Database port (3306 or 4000) |
| `DB_USER` | `xxxxxx.root` | Database username |
| `DB_PASSWORD` | `your_secure_password` | Database password |
| `DB_NAME` | `aniflux` | Database name |
| `DB_SSL` | `true` | Enable SSL for Cloud MySQL |

4. Initialize your Cloud MySQL database tables by running the schema and seed scripts locally targeting your cloud host:
```bash
# Configure local .env with cloud credentials, then run:
npm run db:init
```
5. Redeploy your Vercel project (**Deployments** -> **Redeploy**).

---

## Features Included in Vercel Host

- ⚡ **Full-Stack Serverless API**: Routes `/api/*` handled seamlessly by Node.js Serverless Functions in `api/index.js`.
- 🎨 **Production Vite UI**: Pre-compiled React frontend served with high performance CDN caching.
- 🔒 **Dynamic CORS & SSL**: Built-in support for Vercel preview URLs (`*.vercel.app`) and encrypted database connections.
