# Complete Guide: Deploying Aniflux to Vercel (Full-Stack Free Hosting)

This guide provides step-by-step instructions to deploy **Aniflux** to **Vercel**, including lessons learned, monorepo configuration details, database setup, and troubleshooting fixes.

---

## 🏗️ Architecture Overview

Aniflux is structured as a full-stack monorepo:
* **Frontend (`/client`)**: React 19 + TypeScript + Vite single-page application (SPA).
* **Backend Server (`/server`)**: Express API server providing authentication, anime dataset queries, and user lists.
* **Serverless Entrypoint (`/api/index.js`)**: Wraps the Express application into a Vercel Serverless Function, routing all `/api/*` requests automatically.
* **Database Layer**: Built-in dual-mode system:
  * **Default (Zero-Config)**: Operates out-of-the-box using a rich **In-Memory dataset** (no external database required).
  * **Persistent**: Connects seamlessly to any **Cloud MySQL** instance (TiDB Cloud, Aiven, PlanetScale, etc.) via environment variables.

---

## ⚡ Quick Start Deployment

### Method 1: Vercel Dashboard (Recommended)

1. Push your repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to the [Vercel New Project Dashboard](https://vercel.com/new).
3. Import your `aniflux` repository.
4. Vercel automatically detects `vercel.json` settings:
   * **Framework Preset**: Other / Vite
   * **Build Command**: `npm run build`
   * **Output Directory**: `client/dist`
5. Click **Deploy**.

> [!TIP]
> **Zero-Config Database**: No environment variables are required for initial deployment! The app automatically uses the rich in-memory fallback dataset until a cloud database is attached.

---

### Method 2: Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Login to your Vercel account
vercel login

# 3. Deploy Preview build
vercel

# 4. Deploy Production build
vercel --prod
```

---

## 🛠️ Key Monorepo Configurations (`vercel.json` & `package.json`)

To ensure smooth builds and proper routing on Vercel, the repository relies on two core config files:

### 1. `package.json` (Root)
Uses **npm Workspaces** to ensure Vercel installs dependencies for both the backend and frontend in a single step:
```json
{
  "name": "aniflux",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "workspaces": [
    "client"
  ],
  "scripts": {
    "dev": "npm run dev --prefix client",
    "build": "npm run build --prefix client",
    "server": "node server/index.js"
  }
}
```

### 2. `vercel.json`
Directs Vercel's build process and handles serverless API routing:
```json
{
  "version": 2,
  "buildCommand": "npm run build --prefix client",
  "outputDirectory": "client/dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🛢️ Connecting a Free Cloud MySQL Database (Optional)

If you want user accounts, watchlist items, and favorites to persist permanently across restarts:

1. Create a free MySQL database on **TiDB Cloud Serverless** or **Aiven MySQL**.
2. Navigate to your project on **Vercel Dashboard** -> **Settings** -> **Environment Variables**.
3. Add the following key-value pairs:

| Variable Name | Example Value | Description |
|---|---|---|
| `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` | Hostname of Cloud MySQL |
| `DB_PORT` | `4000` | Port (3306 or 4000) |
| `DB_USER` | `xxxxxx.root` | Database username |
| `DB_PASSWORD` | `your_db_password` | Database password |
| `DB_NAME` | `aniflux` | Database name |
| `DB_SSL` | `true` | Enables SSL/TLS for Cloud connection |

4. Initialize the remote database schema locally using your credentials:
```bash
# Set credentials in your local .env file, then run:
npm run db:init
```
5. On Vercel Dashboard, go to **Deployments** -> **Redeploy** to apply the new database connection.

---

## 🔍 Common Pitfalls & Solutions Learned

### 1. `Warning: Failed to fetch one or more git submodules`
* **Symptom**: Vercel clone output warns about failed submodules, and `client/` files are missing during build.
* **Cause**: `client/` was initialized as a nested Git repository with its own `.git` directory, causing main Git to commit `client` as a broken submodule reference (`mode 160000`).
* **Fix**:
  ```bash
  # Remove nested .git directory
  Remove-Item -Recurse -Force client\.git   # PowerShell
  rm -rf client/.git                       # Linux / macOS

  # Untrack submodule mode and re-stage files normally
  git rm --cached client
  git add client
  git commit -m "Fix client submodule reference"
  git push origin master
  ```

---

### 2. `failed to load config from client/vite.config.ts`
* **Symptom**: Vercel build fails immediately when Vite tries to compile `vite.config.ts`.
* **Cause**: Static imports in `vite.config.ts` targeting gitignored files (such as `import siteConfiguration from './.figma/make/site.json'`).
* **Fix**: Use safe dynamic checks with `fs.existsSync` so `vite.config.ts` falls back gracefully if the gitignored file is missing on Vercel:
  ```typescript
  import fs from 'node:fs'
  import path from 'node:path'

  const siteJsonPath = path.resolve(__dirname, './.figma/make/site.json')
  let siteConfiguration = {}
  try {
    if (fs.existsSync(siteJsonPath)) {
      siteConfiguration = JSON.parse(fs.readFileSync(siteJsonPath, 'utf-8'))
    }
  } catch (e) {
    console.warn('Using default site configuration.')
  }
  ```

---

### 3. Missing Dependencies During Vercel Build
* **Symptom**: `vite: command not found` or `Cannot find module react`.
* **Cause**: Vercel runs `npm install` at the root, ignoring nested `client/package.json`.
* **Fix**: Declare `"workspaces": ["client"]` in root `package.json` so npm installs all dependencies in one pass.

---

## 🚀 Verification Checklist

- [x] Push `master` branch to GitHub.
- [x] Verify Vercel deployment status shows **Ready** with green checkmark.
- [x] Visit `https://<your-project>.vercel.app/api/health` to confirm Express API status.
- [x] Browse the UI, test search, filter genres, and test user login/registration.
