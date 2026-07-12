# AWS Basics for Our Keycloak + Docker SSO Deployment

Goal: understand the necessary AWS concepts to deploy our Docker containers with (Keycloak) on an EC2 instance safely. Not a full AWS course only what this project needs.



## 1. What EC2 Is

EC2 (Elastic Compute Cloud) is a virtual server (VM) rented from AWS. It can be likened to a blank Linux machine in the cloud that we SSH into and set up ourselves install Docker, pull our images, run containers.



## 2. What a Security Group Does

A security group (SG) = a virtual firewall attached to the EC2 instance. It controls **what traffic is allowed in and out**.

- By default, all inbound traffic is **blocked**
- You add explicit "allow" rules: protocol + port + source IP range
- Outbound is usually left open (allow all) unless we lock it down later


Keycloak itself runs internally on **8080** (HTTP) / **8443** (HTTPS) inside Docker. We do not open those to the internet. A reverse proxy on the host listens on 80/443 and forwards to Keycloak's internal port over Docker's internal network. Postgres (5432) stays internal-only too — never expose a database port publicly.


## 3. Public IP and DNS Name

- **Public IP**: the address the internet uses to reach our instance . By default it's a dynamic public IP it can change if the instance stops/starts.
- **Elastic IP**: a static public IP we can reserve and attach permanently worth doing once we're past testing, so the IP doesn't change under us (important since Keycloak's SSO redirect URLs are tied to a hostname).
- **Public DNS name**: AWS auto-generates one . We'll eventually point our own domain at the instance's IP via an A record, because Keycloak needs a stable, real hostname for OIDC/SAML redirect URIs and cookies to work correctly.


## 4. How SSH Access Works

SSH = how we log into the server's command line remotely, securely.

- AWS uses **key pairs**, not passwords: a `.pem` private key file is generated when the instance is launched (or an existing key pair is selected)
- Whoever needs access holds a copy of the private key  **never commit it to Git, never share it.**
- Only IPs allowed by the security group's port 22 rule can even attempt to connect this is the first layer of defense before the key is even checked

**Team practice:** each person who needs server access should ideally get their own key added to `~/.ssh/authorized_keys` on the instance, rather than everyone sharing one `.pem` file.

## 5. How Docker Runs on a Server

Once we're SSH'd in:

1. Install Docker + Docker Compose on the fresh Ubuntu instance (one-time setup script)
2. Copy over (or `git clone`) our project — `docker-compose.yml`, Keycloak realm config, nginx config, `.env` files
3. Run `docker compose up -d`
4. Docker creates its own internal network — containers (Keycloak, Postgres, nginx) talk to each other by container name (e.g. `keycloak:8080`), not via the public IP
5. Only the container(s) we explicitly map to the host (`ports:` in compose) are reachable from outside — that mapping + the security group together decide what's actually exposed

**Key idea:** Docker containers are isolated by default. Exposure to the internet only happens where we explicitly (a) map a container port to the host **and** (b) allow that host port in the security group. Both have to be true.

---

## 6. Ports Checklist for This Project

| Port | Where | Exposed to internet? | Why |
|------|-------|----------------------|-----|
| 22 | Host | Restricted (our IPs only) | SSH server management |
| 80 | Host → nginx | Yes | HTTP, redirects to 443 |
| 443 | Host → nginx | Yes | HTTPS — actual SSO traffic |
| 8080/8443 | Keycloak container | **No** | Internal only, reached via nginx |
| 5432 | Postgres container | **No** | Internal only, Keycloak's DB |

---

## Minimum Setup Order (once concepts are clear)

1. Launch EC2 instance (Ubuntu, small size) with a key pair
2. Create/attach security group with the rules above
3. SSH in, install Docker + Compose
4. Deploy our `docker-compose.yml` (Keycloak + Postgres + nginx)
5. Point DNS at the instance's (Elastic) IP
6. Set Keycloak's hostname/redirect config to match our real domain, not the raw IP

Once everyone's comfortable with these six ideas, the actual deployment steps will make a lot more sense — most "it's not working" moments on AWS come down to one of: wrong security group rule, wrong port mapping, or SSH key issues.
