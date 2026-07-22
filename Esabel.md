## Date: 01/07/2026

### Start Time

09:00

### End Time

22:00

### Task

To make app containers talk to Keycloak inside Docker using the Keycloak service name

### Work Done

- Reviewed the task requirements
- Learned how Docker containers communicate using service names and why it is important
- Made an .env file with KEYCLOAK_URL
- changed the server.js under

```js
const KEYCLOAK_URL = "http://localhost:8080"
 to const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "http://localhost:8080"
```

- this helps so that if the .env doesn't work the localhost works
- tested Docker and Keycloak containers

### Problems Encountered

- At first i didn't understand why Docker containers cannot use localhost
- I was confused about the purpose of the environment variable
- It took time to understand how proxy works and how exactly does the function do or works

### Solution

- Learned that localhost inside a container refers to the container itself and the app container cannot accesss the keycloak container
- Docker containers commmunicate using service names such as: `http://keycloak:8080`
- with a diagram its:
- app container
  |
  keycloak website
  |
  keycloak container
- proxy handles the communication between the browser and keycloak

### Key Learning

KEYCLOAK_URL is stored in a .env file. The application reads this value and uses it to locate the Keycloak service.

- Environment variables allows applications work in diiferent environments without changing the code
- Have `http://localhost:8080` as backup just in case the .env is undefined, cause if the .env is undefined the proxy will likely fail
- A proxy is acts as a middleman between the browser and keycloak
- what happens is:

1.  browser sents a request to the application
2.  application receives it
3.  proxy forwards it to keycloak
4.  keycloak responds
5.  proxy sends the response back
