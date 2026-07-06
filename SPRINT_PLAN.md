# Keycloak SSO AWS Delivery Plan


## Development Method
Use **Agile with short sprints**.

### Why Agile is the better fit
- The work has clear dependencies, but many tasks are small and beginner-friendly.
- The team can deliver value early by fixing Docker and auth flow first.
- You can audit progress after each sprint instead of waiting for a large final handoff.
- If a task blocks another task, the sprint plan can be adjusted without redoing everything.

## Working Assumptions
- Sprint length: 1 week.
- Team size: beginner contributors working in parallel where possible.
- Review cadence: audit at the end of every sprint.
- Delivery target: a Dockerized stack that can be prepared for AWS deployment and used by real users.

## SMART Objective
By the end of the sprint plan, the repository should support:
- one Compose command to start Keycloak, app 1, and app 2 locally
- login for both apps through Keycloak
- deployment-ready configuration for AWS public URLs
- documented setup steps that a beginner can follow

## Sprint 1: Make the stack work locally

### Sprint goal
Get the Docker setup stable and make both apps authenticate correctly in the local container environment.

### Tasks

#### Task 1: Remove hard-coded localhost auth values
- Estimated time: 2-4 hours
- Owner type: beginner frontend/devops contributor
- Deliverable: Keycloak settings read from environment variables in both app configs
- Done when: app 1 and app 2 can read the Keycloak URL, realm, and client ID from environment values

#### Task 2: Make app servers use Docker service names
- Estimated time: 2-4 hours
- Owner type: beginner backend contributor
- Deliverable: app servers use `KEYCLOAK_URL` from the container environment
- Done when: the app containers can proxy to Keycloak using the Docker service name

#### Task 3: Add the missing Keycloak client for app 2
- Estimated time: 1-2 hours
- Owner type: beginner config contributor
- Deliverable: realm export contains a working `myapp-frontend-2` client
- Done when: app 2 can log in after Keycloak imports the realm

#### Task 4: Clean up Docker Compose structure
- Estimated time: 1-2 hours
- Owner type: beginner DevOps contributor
- Deliverable: one root Compose file is clearly the source of truth
- Done when: the team knows which Compose file to use and the old example does not cause confusion

### Sprint 1 deliverables
- Local Docker stack starts successfully
- App 1 opens in the browser
- App 2 opens in the browser
- Keycloak starts and is reachable
- Both apps can attempt login against Keycloak

## Sprint 2: Make the project easy to understand

### Sprint goal
Document the workflow so beginners can run and test the system without help.

### Tasks

#### Task 5: Update the README with clear run steps
- Estimated time: 2-3 hours
- Owner type: beginner documentation contributor
- Deliverable: README with simple Docker run instructions and service URLs
- Done when: a new teammate can follow the steps without asking for clarification

#### Task 6: Write the sprint plan and issue summary
- Estimated time: 1-2 hours
- Owner type: beginner project coordination contributor
- Deliverable: this Markdown plan and issue breakdown in a shared repo file
- Done when: sprint order, tasks, and deliverables are visible in one place

### Sprint 2 deliverables
- Beginner-friendly README
- Shared sprint plan document
- Clear list of tasks and expected outputs

## Sprint 3: Prepare for AWS deployment

### Sprint goal
Make the stack ready for real hosted URLs and secure secret handling.

### Tasks

#### Task 7: Replace localhost-only redirect URLs
- Estimated time: 2-4 hours
- Owner type: beginner frontend/config contributor
- Deliverable: Keycloak redirect URIs and web origins can be updated for AWS domains
- Done when: the config supports both local and future public URLs

#### Task 8: Support a production Keycloak URL
- Estimated time: 2-4 hours
- Owner type: beginner DevOps contributor
- Deliverable: container and app configs can use a public Keycloak address
- Done when: the app can be pointed at an AWS-hosted Keycloak instance without code changes

#### Task 9: Keep Google secrets out of source control
- Estimated time: 1-2 hours
- Owner type: beginner security/config contributor
- Deliverable: Google client ID and secret are documented as environment-only values
- Done when: no secret values are stored in code or committed files

### Sprint 3 deliverables
- AWS-ready URL configuration
- Secret-handling notes
- Deployment settings that can be changed without rewriting the app

## Sprint 4: Validate the user journey

### Sprint goal
Confirm that users can actually use the system end to end.

### Tasks

#### Task 10: Test login and logout flows
- Estimated time: 2-3 hours
- Owner type: beginner QA contributor
- Deliverable: test notes for login, logout, registration, and Google auth
- Done when: both apps can authenticate and return the user to the correct page

#### Task 11: Record deployment checklist for AWS
- Estimated time: 1-2 hours
- Owner type: beginner coordination contributor
- Deliverable: a short checklist for the team to follow during AWS deployment
- Done when: the team has a repeatable deployment sequence to audit

### Sprint 4 deliverables
- Verified user flows
- AWS deployment checklist
- Clear notes on any remaining blockers

## Suggested Sprint Order
1. Sprint 1 first, because the stack must work locally before anything else.
2. Sprint 2 next, so the team can follow the same process.
3. Sprint 3 after that, because AWS readiness depends on the local stack being stable.
4. Sprint 4 last, because testing should happen after the deployment setup is in place.

## Suggested Timeline
- Sprint 1: 1 week
- Sprint 2: 1 week
- Sprint 3: 1 week
- Sprint 4: 1 week

## Notes for Audits
- Review progress at the end of each sprint.
- If a task finishes early, move the contributor to the next dependent task.
- If a task slips, keep the sprint goal small and avoid adding unrelated work.
- Do not start AWS deployment until Sprint 1 is stable.

