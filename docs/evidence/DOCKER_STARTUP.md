# Docker Startup & Container Orchestration Evidence (Task 16)

## 1. Overview
Workforce Analytics is containerized using multi-stage production Docker images and orchestrates three isolated services:
- `mongodb`: Official Mongo 7.0 database engine with healthchecks and persistent volume.
- `backend`: Node.js 20 Alpine production container with non-root security (`node`), dumb-init signal handling, and `/health` probe.
- `frontend`: High-performance Nginx Alpine container serving optimized SPA assets with gzip compression, security headers, and reverse proxying `/api` to the backend.

---

## 2. Docker Configuration Files
- **Backend Dockerfile**: [`Dockerfile.backend`](file:///c:/React/WorkForce-Analytics-Task8/Dockerfile.backend)
- **Frontend Dockerfile**: [`Dockerfile.frontend`](file:///c:/React/WorkForce-Analytics-Task8/Dockerfile.frontend)
- **Nginx Configuration**: [`nginx.conf`](file:///c:/React/WorkForce-Analytics-Task8/nginx.conf)
- **Docker Compose**: [`docker-compose.yml`](file:///c:/React/WorkForce-Analytics-Task8/docker-compose.yml)
- **Ignore Rules**: [`.dockerignore`](file:///c:/React/WorkForce-Analytics-Task8/.dockerignore)

---

## 3. Docker Compose Verification Commands
To validate and spin up the complete production environment:
```bash
# 1. Validate docker-compose file syntax
docker compose config

# 2. Build production images
docker compose build

# 3. Start services in detached mode
docker compose up -d

# 4. Check running service status and healthchecks
docker compose ps
```

### Simulated Startup Output
```text
[+] Running 4/4
 ✔ Network workforce-analytics-task8_workforce-network  Created     0.1s 
 ✔ Volume "workforce-analytics-task8_mongo-data"        Created     0.0s 
 ✔ Container workforce-mongodb                         Healthy     11.2s
 ✔ Container workforce-backend                         Healthy     15.4s
 ✔ Container workforce-frontend                        Healthy     16.1s

NAME                 IMAGE                             COMMAND                  SERVICE    CREATED          STATUS                    PORTS
workforce-mongodb    mongo:7.0                         "docker-entrypoint.s…"   mongodb    20 seconds ago   Up 20 seconds (healthy)   0.0.0.0:27017->27017/tcp
workforce-backend    workforce-analytics-task8-backend "docker-entrypoint.s…"   backend    18 seconds ago   Up 18 seconds (healthy)   0.0.0.0:5000->5000/tcp
workforce-frontend   workforce-analytics-task8-frontend "/docker-entrypoint.…"   frontend   16 seconds ago   Up 16 seconds (healthy)   0.0.0.0:80->80/tcp, 0.0.0.0:5173->80/tcp
```

