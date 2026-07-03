// ============================================================
//  KEYCLOAK CONFIGURATION
//  Update these values to match your Keycloak setup
// ============================================================

const keycloakConfig = {
  url:      import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm:    import.meta.env.VITE_KEYCLOAK_REALM || 'myapp-frontend',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'myapp-frontend-2',
}

export default keycloakConfig
