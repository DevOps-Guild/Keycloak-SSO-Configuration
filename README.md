# Keycloak SSO Configuration

This repository contains two React apps and one shared Keycloak setup.

- `keycloak-app-SSO` is app 1
- `keycloak-app-SSO-2` is app 2
- `doc/myapp-frontend-realm.json` contains the Keycloak realm export
- `docker-compose.yml` starts the full local stack

## What runs in Docker

The root `docker-compose.yml` starts:

- Keycloak on `http://localhost:8081`
- app 1 on `http://localhost:3000`
- app 2 on `http://localhost:3001`

Inside Docker, the apps talk to Keycloak using the service name `http://keycloak:8080`.

## Prerequisites

- Docker Desktop installed and running
- A terminal opened in the root of this repository

## Start the stack

```bash
docker compose up -d
```

What this does:

- starts Keycloak
- imports the realm from `doc/myapp-frontend-realm.json`
- starts app 1
- starts app 2

## Open the services

- Keycloak: `http://localhost:8081`
- App 1: `http://localhost:3000`
- App 2: `http://localhost:3001`

## Login credentials

The Keycloak admin account used by the Docker setup is:

- Username: `admin`
- Password: `admin`

## App ports

### App 1

- Frontend: `5173` in local development
- Backend: `3000` when running the Node server
- Keycloak URL: configured through environment variables

### App 2

- Frontend: `5174` in local development
- Backend: `3001` when running the Node server
- Keycloak URL: configured through environment variables

## Local development

If you want to run the apps without Docker:

### App 1

```bash
cd keycloak-app-SSO
pnpm i
pnpm dev
```

```bash
pnpm start
```

### App 2

```bash
cd keycloak-app-SSO-2
pnpm i
pnpm dev
```

```bash
pnpm start
```

## Keycloak setup notes

- The realm is imported from `doc/myapp-frontend-realm.json`
- App 1 uses the `myapp-frontend` client
- App 2 uses the `myapp-frontend-2` client
- Google login is configured through environment variables:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

## Notes

- Use the root `docker-compose.yml` as the main compose file.
- The old `doc/docker-compose.yml` file is only an example and should not be used as the main stack file.
- If the login flow fails, check that Keycloak is running and that the redirect URIs in the realm file match the ports above.
