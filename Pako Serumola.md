# Pako Serumola - Project Log

## Purpose
This file is my personal work log for the Keycloak SSO project.

I will use it to document:
- what I worked on
- when I worked on it
- problems I found
- how I solved them
- screenshots or proof of work

This helps track progress, improve communication, and make my work easy to review.

## Work Log

### Session 1

**Date:** 2026-06-30  
**Start Time:** 09:00  
**End Time:** 11:00  
**Task Worked On:** Issue 1 - Add the missing Keycloak client for app 2  
**What I Did:** I reviewed the Keycloak realm export and confirmed that app 2 needed its own client configuration. I checked the `doc/myapp-frontend-realm.json` file, verified the `myapp-frontend-2` client settings, and updated the app 2 README so the client ID and redirect URL guidance matched the actual setup.  
**Problems Encountered:** The main challenge was making sure the app 2 configuration matched the project structure and did not still point to app 1 values or older localhost-only instructions.  
**Solution:** I aligned the app 2 configuration with the realm export and updated the documentation so the client ID, redirect URIs, and local development ports were consistent.  
**Evidence:** Updated `doc/myapp-frontend-realm.json` and `keycloak-app-SSO-2/README.md`.  
**Next Step:** Move on to the next deployment preparation issue and keep the local Docker setup aligned with the AWS plan.  

### Session 2

**Date:** 2026-07-07  
**Start Time:** 13:00  
**End Time:** 14:30  
**Task Worked On:** Issue 2 - Learn the AWS basics we need for this project  
**What I Did:** I reviewed the basic AWS concepts the team will need before deployment, including EC2, security groups, public IP addresses, DNS names, and SSH access. I also connected those ideas to our project by noting that Docker will run on EC2 and that we will need the right ports open for Keycloak, app 1, and app 2. I also watched some videos on the docker deployment on aws using EC2 
**Problems Encountered:** The main challenge was that the team is still new to AWS, so the terminology can feel overwhelming at first. It was important not to treat AWS like a giant unknown and instead narrow the focus to only the concepts we need for this project.  
**Solution:** I simplified the learning goal into practical project-specific notes instead of trying to learn all of AWS. That made it easier to understand what EC2 does, why security groups matter, and how public access will work for the deployed containers.  
**Evidence:** Updated project notes and issue understanding for the AWS preparation phase.  
**Next Step:** Use the AWS basics knowledge to help the team choose the EC2 deployment layout and prepare the project for public hosting.  

## Project Timeline

### Phase 1: Local readiness
- Confirm the Docker setup works locally
- Make sure app 1 and app 2 can start with Keycloak
- Remove localhost-only assumptions where needed

### Phase 2: AWS preparation
- Learn the minimum AWS basics for EC2
- Decide the EC2 deployment layout
- Prepare Keycloak for production-style hosting
- Plan persistence and secret handling

### Phase 3: AWS deployment
- Launch the stack on EC2
- Open the required ports in the security group
- Verify the apps and Keycloak are reachable publicly

### Phase 4: Testing and handoff
- Test login, logout, registration, and Google login
- Write a deployment checklist
- Document the final AWS setup for the team
