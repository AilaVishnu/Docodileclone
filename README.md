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

* PostgreSQL (schema-per-tenant) – production
* H2 (in-memory) – local development

**DevOps**

* GitHub
* GitHub Actions (CI)

---

## Repository Structure

```
docodile/
 ├── frontend/          # React (CRA) app
 ├── backend/           # Kotlin Spring Boot app
 ├── db/                # Flyway migrations (Postgres)
 ├── docker/            # Docker files (future use)
 ├── .github/workflows/ # CI pipelines
 ├── docker-compose.yml
 └── README.md
```

---

## Prerequisites

Must have the following installed:

* Git
* Node.js (LTS)
* **Java 17 (Temurin / OpenJDK)**
* Docker & Docker Compose (optional for now)
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

## Backend – Local Development

```bash
cd backend
./gradlew bootRun
```

* Runs at: **[http://localhost:8080](http://localhost:8080)**
* Uses **H2 in-memory database**
* No Postgres or Docker required initially

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

* Runs at: **[http://localhost:3000](http://localhost:3000)**
* API integration will be added incrementally

---

## Security (Development Mode)

* Spring Security runs in default **development mode**
* A generated password may appear in logs
* This will be replaced with JWT-based authentication later

---

## Multi-Tenancy Strategy (MVP)

* **Single PostgreSQL database**
* **One schema per clinic (tenant)**
* No `tenant_id` columns
* Strong isolation with minimal operational overhead

Local development uses a single schema.

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

1. Get the **backend running first**
2. Then start the frontend
3. Ignore Postgres/Docker until explicitly required
4. Ask before making architectural changes

---

## License

Private / Internal – MVP stage
