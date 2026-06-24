this repository has 2 sub folders that used to be their own repos:
Keycloak-app-SSO i'll call this app 1
Keycloak-app-SSO-2 i'll call this app 2

# app 1
  run pnpm i in the root of app 1
## ports used and how to start them
  1. frontend: 5173: in the root of app 1 run "pnpm dev"
  2. backend: 3000: in the root of app 1 run "pnpm start"
  3. makes requests to keycloak at port 8080

# app 2
  run pnpm i in the root of app 2
## ports used and how to start them
  1. frontend: 5174: in the root of app 2 run "pnpm dev"
  2. backend: 3001: in the root of app 2 run "pnpm start"
  3. makes requests to keycloak at port 8080

# docker and keycloak set up (My interpretation of gemini)
  the "docs" folder contains the keycloak set up including the realms, clients and all configurations predefined
## Prerequisite: make sure you have docker desktop installed and running before doing the below
  1. Open a terminal and make sure the directory is the **root of this repository**
  2. Start the container with the command: "docker compose up -d", 
  3. the "-d" runs the container in the background so as to not disturb your terminal
  4. you'll see a container named "keycloak" running on port 8080
  5. go to "localhost:8080" on your broswer
### Login credentails
  **username**: admin
  **password**: admin
