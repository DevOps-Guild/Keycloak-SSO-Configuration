// ============================================================
//  KEYCLOAK CONFIGURATION
//  Update these values to match your Keycloak setup
// ============================================================

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',  // e.g. https://auth.mycompany.com/auth
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'myapp-frontend',                        // e.g. myrealm
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'myapp-frontend',                   // e.g. myapp-frontend
  url:      import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm:    import.meta.env.VITE_KEYCLOAK_REALM || 'myapp-frontend',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'myapp-frontend',
}

export default keycloakConfig
