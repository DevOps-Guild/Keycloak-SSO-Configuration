# Secret Management — Google Login Credentials

## The Problem

The project uses Google OAuth for login. This requires two private values:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

These must **never** be committed to Git. If they are pushed to GitHub, they can be read by anyone with access to the repository and abused to impersonate the application.

---

## How It Works in This Project

The secrets flow from a single `.env` file through Docker Compose into Keycloak at startup:

```
.env  (on your machine / EC2 server, never in Git)
  │
  ▼
docker-compose.yml  (reads .env automatically)
  │
  ▼
Keycloak container  (receives values as environment variables)
  │
  ▼
myapp-frontend-realm.json  (uses ${env.GOOGLE_CLIENT_ID} placeholders)
```

The realm JSON already uses Keycloak's `${env.VAR}` syntax so the values are substituted at startup — the actual secrets never appear in any committed file.

---

## Setup — Local Development

**Step 1:** Copy the example file and fill in your real values:

```bash
cp .env.example .env
```

**Step 2:** Open `.env` and replace the placeholders:

```env
GOOGLE_CLIENT_ID=1234567890-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-real-secret-here
KC_BOOTSTRAP_ADMIN_USERNAME=admin
KC_BOOTSTRAP_ADMIN_PASSWORD=choose-a-strong-password
```

**Step 3:** Run as normal:

```bash
docker compose up --build
```

Docker Compose automatically reads `.env` from the repo root. No extra flags needed.

>  Never rename `.env` to `.env.example` or anything else and commit it. The `.env` filename is specifically blocked by `.gitignore`.

---

## Setup — EC2 Deployment

On the EC2 server, there is no `.env` file by default. You create it manually over SSH — it is never transferred through Git.

```bash
# 1. SSH into your EC2 instance
ssh -i your-key.pem ec2-user@<public-ip>

# 2. Navigate to your project folder
cd ~/Keycloak-SSO-Configuration-Ephraim-s-new-branch/repo

# 3. Create the .env file directly on the server
nano .env
```

Paste in your values, save, and exit (`Ctrl+X → Y → Enter`). Then start the stack:

```bash
docker compose up --build -d
```

The secrets stay on the EC2 server's disk only — they never touch Git.

---

## Where to Get the Google Credentials

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Navigate to **APIs & Services → Credentials**
4. Click your **OAuth 2.0 Client ID**
5. Copy the **Client ID** and **Client Secret**

Make sure the following are listed under **Authorised redirect URIs**:

```
http://localhost:8080/realms/myapp-frontend/broker/google/endpoint
http://<your-ec2-public-ip>:8080/realms/myapp-frontend/broker/google/endpoint
```

---

## File Summary

| File | Committed to Git? | Purpose |
|---|---|---|
| `.env` |  No — blocked by `.gitignore` | Holds real secret values locally and on EC2 |
| `.env.example` |  Yes | Template showing what variables are needed, no real values |
| `docker-compose.yml` |  Yes | Reads from `.env` automatically, passes vars to Keycloak |
| `doc/myapp-frontend-realm.json` |  Yes | Uses `${env.GOOGLE_CLIENT_ID}` placeholders — no hardcoded secrets |
| `.gitignore` (root) |  Yes | Blocks `.env` and `*.pem` files from being committed |

---

## Verifying No Secrets Are in Git

Before pushing, run:

```bash
git status
```

You should **not** see `.env` in the output. If you do, do not commit. Run:

```bash
git rm --cached .env
```

Then add `.env` to `.gitignore` and commit the `.gitignore` change instead.