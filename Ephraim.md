

# Task 1: Docker Compose Integration for Keycloak SSO System

*Issue:* Make Docker Compose start Keycloak, App 1, and App 2 together.  
*Goal:* Run the full system with one docker compose up --build command.

## Timeline

### 28 June 2026 — Planning (Afternoon I don't remember the specifuc time)
- Read through the assigned issue and understood the requirements.
- Reviewed the existing project structure:
  - doc/docker-compose.yml — only had Keycloak, no app services.
  - keycloak-app-SSO/ — App 1, no Dockerfile.
  - keycloak-app-SSO-2/ — App 2, no Dockerfile.
  - doc/myapp-frontend-realm.json — Keycloak realm configuration.
- Identified what was missing:
  - A Dockerfile for both apps.
  - A root-level docker-compose.yml that includes all three services.
  - Startup order management so apps wait for Keycloak to be ready
  - Environment variable configuration for container-to-container communication

### 29 June 2026 — Development (Evening)

*Work done:*

- Created docker-compose.yml at the repo root with three services:
  - keycloak on port 8080 with realm auto-import
  - app1 on port 3000
  - app2 on port 3001
- Added a healthcheck on the Keycloak service using a TCP check (port 8080), since the Keycloak image does not ship curl or wget
- Configured depends_on: condition: service_healthy on both apps to ensure they only start after Keycloak is fully booted
- Created a shared Docker network sso-net so services can reach each other by name (e.g. http://keycloak:8080)
- Created Dockerfile for App 1 (keycloak-app-SSO/Dockerfile) using a multi-stage build:
  - Build stage: installs dependencies with pnpm, runs vite build
  - Runtime stage: lightweight image running only node server.js with the built dist.
- Created Dockerfile for App 2 (keycloak-app-SSO-2/Dockerfile) — same structure, port 3001
- Added .dockerignore to both app folders to exclude node_modules and dist from the build context
- Patched `server.js` in both apps: changed hardcoded KEYCLOAK_URL = 'http://localhost:8080' to read from process.env.KEYCLOAK_URL so it works inside Docker where containers communicate by service name, not localhost

### 01 July 2026 — Testing & Fixes (Evening)

*Problem encountered:*

Running docker compose up --build failed during the pnpm install step with this error:

warn: This version of pnpm requires at least Node.js v22.13
Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: node:sqlite

*Root cause:*  
The Dockerfiles were using node:20-alpine. The project's pnpm-lock.yaml locks pnpm at version 11.9.0, which requires Node.js 22 as a minimum. Node 20 was too old.

*Solution:*  
Updated both Dockerfiles to use `node:22-alpine` for both the build and runtime stages. Re-ran `docker compose up --build` — build succeeded.

*Verification:*

| Check | Result |
|---|---|
| http://localhost:8080 — Keycloak welcome page | working |
| http://localhost:8080/admin — Admin console (admin/admin) | working |
| http://localhost:3000 — App 1 loads | working |
| http://localhost:3001 — App 2 loads | working |
| docker compose ps — all 3 services Running | working |
| Keycloak starts before apps (healthcheck + depends_on) | working |
| SSO flow — log in on App 1, App 2 does not ask for credentials again | working |

---

## Files Added / Modified

| File | Status | Description |
|---|---|---|
| docker-compose.yml | New | Root-level compose file for all 3 services |
| keycloak-app-SSO/Dockerfile | New | Multi-stage build for App 1 |
| keycloak-app-SSO-2/Dockerfile | New | Multi-stage build for App 2 |
| keycloak-app-SSO/.dockerignore | New | Excludes node_modules and dist from build context |
| keycloak-app-SSO-2/.dockerignore` | New | Excludes node_modules and dist from build context |
| keycloak-app-SSO/server.js | Modified | KEYCLOAK_URL now reads from environment variable |
| keycloak-app-SSO-2/server.js | Modified | KEYCLOAK_URL now reads from environment variable |

---

## Key Decisions & Reasoning

*Why multi-stage Dockerfile?*  
Keeps the final image small. The build stage needs dev dependencies and vite — the runtime stage only needs the compiled output and Node.

*Why TCP healthcheck instead of HTTP?*  
The official Keycloak image does not include curl or wget, so an HTTP check would fail. A TCP check on port 8080 confirms the server is accepting connections.

*Why change KEYCLOAK_URL in server.js?*  
Inside Docker, containers cannot reach each other via `localhost`. Each container has its own network namespace. The Docker Compose network allows containers to reach each other by service name (e.g. `http://keycloak:8080`). The env var approach means the same code works both locally (falls back to localhost) and inside Docker.

*Why node:22-alpine?*  
pnpm 11.9.0 (as locked by `pnpm-lock.yaml`) requires Node.js 22 minimum. Alpine variant keeps the image lightweight.


## How to Run

bash:
  -From the repo root:
  -docker compose up --build

Shut down:
  -docker compose down

Shut down and wipe Keycloak data:
  -docker compose down -v
