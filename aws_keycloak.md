# Keycloak AWS Preparation

## Goal

Prepare Keycloak so it can run safely on AWS without relying on dev-only behavior.

## Current situation

Keycloak uses `kc.sh start-dev`.

## Preparation

### 1. Public hostname support

- Locally Keycloak uses `localhost`, but on AWS that's invalid since `localhost` refers to the machine running the request, not the server.
- On AWS, users reach the app through a public domain name — this is called the hostname.
- Keycloak needs to know its public hostname so it builds correct login/redirect URLs instead of `localhost` ones.
- For this project, the hostname is `https://deploynest.dev`.

**configuration**
- Add `KC_HOSTNAME: https://deploynest.dev` to the Keycloak container's environment
- Add `KC_HOSTNAME_STRICT: "true"` to the Keycloak container's environment
  - `KC_HOSTNAME` tells Keycloak what its public hostname is
  - `KC_HOSTNAME_STRICT` makes Keycloak actually enforce that hostname, rejecting requests that don't match it — without this, the hostname setting is more of a suggestion than a security boundary

### 2. Proxy / reverse proxy support

- Currently the browser talks to Keycloak directly.
- A proxy is a middleman between a user and a website. A *reverse* proxy sits in front of the server(s) and forwards traffic to them.
- Without a reverse proxy, users would need to know the internal ports of the frontend (5173), backend (5000), and Keycloak (8080), and Keycloak itself would need to handle SSL certificates, HTTPS, and certificate renewal.
- With a reverse proxy like nginx in front, nginx handles HTTPS certificates, hides internal services/ports, and can route one public domain to multiple internal services.
- With nginx in place: the browser talks securely (HTTPS) to nginx, and nginx talks to Keycloak internally over plain HTTP.
- Keycloak needs to be explicitly told a reverse proxy is in front of it, otherwise it won't trust the forwarded headers telling it the original request was HTTPS.

**configuration**
- Add `KC_PROXY_HEADERS: xforwarded` to the Keycloak container's environment
- Add `KC_HTTP_ENABLED: "true"` to the Keycloak container's environment
  - `KC_PROXY_HEADERS` tells Keycloak to trust the `X-Forwarded-*` headers nginx sends (real client IP, original protocol, etc.)
  - `KC_HTTP_ENABLED` allows Keycloak to serve plain HTTP internally, which is safe here since nginx — not Keycloak — is the one actually terminating HTTPS for the outside world

### 3. Production-friendly startup settings

`kc.sh start-dev` is meant for local testing because it:
1. Uses development settings
2. Relaxes some security requirements
3. Assumes the environment has already been tested locally
4. Doesn't require full production configuration

Running these shortcuts on a public AWS server is risky — security and stability matter once real users can reach it. Production mode (`kc.sh start`) requires a public hostname, reverse proxy configuration, and HTTPS to be properly set up — which is exactly what sections 1 and 2 provide.

**configuration**
- Change `command: start-dev --import-realm` to `command: start --import-realm`
- `--import-realm` is kept because it loads the realm configuration (clients, roles, users, etc.) on startup — removing it would mean Keycloak starts with none of the expected setup

### 4. Browser-safe login redirects

- Keycloak needs to know exactly which URLs it's allowed to redirect users back to after login.
- It should redirect to the application's real public domain instead of `localhost` — this prevents attackers from tricking Keycloak into redirecting users to a malicious site after authentication (redirect URI hijacking).
- For this to work correctly, Keycloak needs all of the above in place:
  1. Its public hostname 
  2. Awareness it's behind a proxy 
  3. Production mode running 
  4. An explicit list of which redirect URLs are allowed

**configuration**
- Update `redirectUris` in the realm JSON to the public domain, e.g. `https://deploynest.dev/*`, instead of `localhost` addresses
- Update `VITE_KEYCLOAK_URL` in both frontend apps to `https://deploynest.dev` instead of `http://localhost:8081`

## Current status

All Keycloak and nginx configuration above is complete and has been tested on the EC2 instance.

**Blocked on:** the domain `deploynest.dev` needs to be purchased and its DNS A record pointed at the EC2 instance's public IP before an HTTPS certificate can be issued (via `sudo certbot --nginx -d deploynest.dev`). Once DNS resolves correctly, that command completes the setup and the login flow can be tested end to end.