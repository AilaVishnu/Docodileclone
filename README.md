# Docodile (MVP)

A **multi-tenant Electronic Medical Records (EMR) and Clinic Operations platform** designed for small to mid-sized clinics in India.

---

## Tech Stack

**Frontend**

* React + TypeScript (Create React App)

**Backend**

* Kotlin
* Spring Boot
* Gradle (Kotlin DSL)

**Database**

* PostgreSQL (Docker, local)

**DevOps**

* GitHub
* GitHub Actions (CI)

---

## Repository Structure

```
docodile/
 ├── frontend/          # React (CRA) app
 ├── backend/           # Kotlin Spring Boot app
 │    └── docker-compose.yml # Local Postgres for backend
 ├── db/                # Flyway migrations (Postgres)
 ├── docker/            # Docker files (future use)
 ├── .github/workflows/ # CI pipelines
 └── README.md
```

---

## Prerequisites

Must have the following installed:

* Git
* Node.js (LTS)
* **Java 17 (Temurin / OpenJDK)**
* Docker & Docker Compose
* VS Code (recommended)

---

## Java Version (IMPORTANT)

This project **must run on Java 17**.

Verify:

```bash
java -version
```

Expected output:

```
openjdk version "17.x.x"
```

Gradle is locked to Java 17 via:

```
backend/gradle.properties
```

Do **not** use Java 21+ or non-LTS versions for this project.

---

## Dev Setup (Local)

### 1) Install Docker

Use the official Docker Desktop installers:

* Windows: [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
* macOS: [Docker Desktop for Mac](https://docs.docker.com/desktop/setup/install/mac-install/)
* Linux: [Docker Desktop for Linux](https://docs.docker.com/desktop/setup/install/linux/)

### 2) Verify Docker is running

```bash
docker version
docker compose version
```

### 3) Start PostgreSQL from docker-compose

```bash
cd backend
docker compose -f docker-compose.yml up -d
```

This uses `backend/docker-compose.yml` and exposes Postgres locally.

### 4) Start backend

```bash
cd backend
./gradlew clean bootRun
```

* Runs at: **[http://localhost:8080](http://localhost:8080)**
* Flyway migrations run on startup

### 5) Start frontend

```bash
cd frontend
npm install
npm start
```

* Runs at: **[http://localhost:3000](http://localhost:3000)** or **[http://localhost:3001](http://localhost:3001)**

---

## Backend – Local Development

```bash
cd backend
./gradlew bootRun
```

* Runs at: **[http://localhost:8080](http://localhost:8080)**
* Uses **PostgreSQL (Docker)**
* Flyway manages schema migrations

If startup fails:

* Verify `JAVA_HOME`
* Ensure Java 17 is active
* Stop existing Gradle daemons:

  ```bash
  ./gradlew --stop
  ```

---

## Frontend – Local Development

```bash
cd frontend
npm install
npm start
```

* Runs at: **[http://localhost:3000](http://localhost:3000)** or **[http://localhost:3001](http://localhost:3001)**

---

## Security (Development Mode)

* JWT-based authentication is enabled

---

## Multi-Tenancy Strategy (MVP)

* **Single PostgreSQL database**
* **Tenant isolation via clinic_id**

---

## Contribution Guidelines

* Use short-lived branches:

  ```
  feature/<short-description>
  ```
* Keep commits small and readable
* Do not commit secrets, `.env` files, or credentials
* Follow existing package and module structure
* Discuss before adding major dependencies

---

## Current MVP Scope

* Clinic onboarding & staff roles
* Patient registration & appointments
* Doctor EMR & prescriptions
* Pharmacy inventory management
* Basic business analytics

---

## Notes for Developers

1. Start **Postgres** first using Docker
2. Start **backend**, then **frontend**

---

## License

Private / Internal – MVP stage
