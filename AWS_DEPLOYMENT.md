# AWS EC2 Deployment Guide

This guide explains how to deploy the Docker stack from this repository to AWS EC2.

## What this deploys

- Keycloak on port `8081`
- App 1 on port `3000`
- App 2 on port `3001`

The apps are built into Docker images during `docker compose up --build`.

## Before you start

- You need an AWS account
- The team should use one EC2 instance for this project
- The EC2 machine should have Docker and Docker Compose installed
- Use an Ubuntu EC2 instance if possible because the setup is simple for beginners

## Step 1: Create the EC2 instance

1. Open the AWS Console.
2. Go to EC2.
3. Launch a new instance.
4. Choose an Ubuntu image.
5. Pick a small instance size suitable for the free tier if available.
6. Create or use an existing key pair.
7. Make sure the instance is reachable from the internet.

## Step 2: Open the security group ports

Allow inbound traffic for:

- `22` for SSH from your IP address
- `8081` for Keycloak
- `3000` for app 1
- `3001` for app 2

If you later add a reverse proxy or domain, you may close some of these ports and expose only `80` and `443`.

## Step 3: SSH into EC2

From your terminal, connect to the instance:

```bash
ssh -i /path/to/key.pem ubuntu@13.53.130.176
```

## Step 4: Install Docker

On the EC2 machine:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
```

Log out and back in so the docker group change takes effect.

## Step 5: Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd Keycloak-SSO-Configuration
```

## Step 6: Set the AWS environment values

Create a file named `.env` in the repository root on EC2.

Example:

```bash
VITE_KEYCLOAK_URL=http://13.53.130.176:8081
VITE_KEYCLOAK_REALM=myapp-frontend
VITE_KEYCLOAK_CLIENT_ID_APP1=myapp-frontend
VITE_KEYCLOAK_CLIENT_ID_APP2=myapp-frontend-2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

If you are not using Google login yet, you can leave the Google values empty for the first test.

## Step 7: Update the realm redirect URLs for EC2

Open `doc/myapp-frontend-realm.json` and add your EC2 public URL to:

- `redirectUris`
- `webOrigins`

Use the same public IP or domain name that users will open in the browser.

Example:

```json
"http://13.53.130.176:3000/*",
"http://13.53.130.176:3001/*",
"http://13.53.130.176:8081/*"
```

If you later use a domain name, replace the IP with the domain.

## Step 8: Start the stack

From the repository root on EC2:

```bash
docker compose up -d --build
```

This will:

- build app 1
- build app 2
- start Keycloak
- import the realm file

## Step 9: Check the containers

```bash
docker ps
docker logs keycloak
```

If one of the apps fails, check:

```bash
docker logs <container_name>
```

## Step 10: Open the services

Use the EC2 public IP in your browser:

- Keycloak: `http://13.53.130.176:8081`
- App 1: `http://13.53.130.176:3000`
- App 2: `http://13.53.130.176:3001`

## Step 11: Test the login flow

Check that:

- app 1 opens
- app 2 opens
- Keycloak opens
- login works
- logout works
- registration works
- Google login works if enabled

## Notes

- This setup is good for a first EC2 deployment and team learning.
- For a more production-ready deployment, you should later add HTTPS and a domain name.
- If you restart the EC2 instance, use the same Docker Compose command to bring the services back up.
