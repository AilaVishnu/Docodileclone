# Docodile — Technical Reference

*Consolidated from `systemPatterns.md` + `techContext.md`*

---

## Tech Stack

- **Frontend**: React (Vite), TypeScript, Vanilla CSS
- **Backend**: Kotlin, Spring Boot, JPA/Hibernate
- **Database**: PostgreSQL with Flyway for migrations
- **Authentication**: JWT-based, Stateless

---

## High-Level Architecture

- **Multi-Tenancy**: Every `AppUser` and `Clinic` is associated with a `Tenant`.
- **Clinic-Staff Relationship**: Many-to-many between `Clinic` and `AppUser`, managed via the `clinic_staff` association table.

---

## Authentication Flow

1. **Login**: `POST /api/auth/login` returns a JWT.
2. **JWT Structure**: Contains `user_id`, `tenant_id`, `role`, and `email`.
3. **Storage**: Frontend stores the token in `localStorage` as `docodile_token`.
4. **Authorized Requests**: Every request includes `Authorization: Bearer <token>`.
5. **Validation**: `JwtAuthenticationFilter` validates the token and sets the security context.

---

## API Structure (Key Endpoints)

### Clinics
- `GET /api/tenant/clinics` — List all clinics for the authenticated tenant.
- `POST /api/tenant/clinic` — Save or update clinic details (domain is immutable once saved).
- `GET /api/tenant/domain/check` — Check if a domain is available application-wide.

### Staff
- `GET /api/tenant/clinics/{clinicId}/staff` — Fetch all staff linked to a specific clinic.
- `POST /api/tenant/clinics/{clinicId}/staff` — Add or update a staff member.
  - Handles roles: `ADMIN`, `DOCTOR`, `RECEPTIONIST`, `FRONT_DESK`, `NURSE`, `PHARMACY`, `OTHER`.

---

## Database Schema (Key Tables)

### `tenant`
- `id` (UUID, PK), `name`

### `app_user`
- `id` (UUID, PK), `tenant_id`, `email`, `name`, `phone`, `gender`, `role`, `speciality`, `registration_no`, `active`, `password_hash` (nullable for BYC staff)

### `clinic`
- `id` (UUID, PK), `tenant_id`, `name`, `address`, `phone`, `domain` (unique), `speciality`

### `clinic_staff`
- `clinic_id` (FK), `staff_id` (FK) — Many-to-many link

---

## Frontend Patterns

- **Component-Based UI**: Modern React components using functional patterns and hooks.
- **Styles**: Vanilla CSS modules or co-located `.styles.ts` files using JS objects for CSS.
- **State Management**: Local state (`useState`) and React Context. Primarily prop-drilling or local state for current features.
- **API Communication**: Uses `fetch` API for REST calls with Bearer token authentication.
- **SVG Usage**: All SVGs stored in `src/assets` and imported using the `ReactComponent` pattern:
  ```ts
  import { ReactComponent as MyIcon } from "../../assets/my-icon.svg"
  ```
  Inline SVGs should be avoided.

---

## Backend Patterns

- **Controller-Service-Repository**: Standard Spring Boot layering.
- **Security**:
  - `SecurityConfig`: Configures JWT filters and endpoint permissions.
  - `AppUserPrincipal`: Wraps `AppUser` for Spring Security context.
  - `CurrentUser`: Helper to extract `tenantId` and `userId` from the security context.
- **Domain Entities**: Kotlin classes with JPA annotations.
- **Migrations**: Incremental SQL scripts in `src/main/resources/db/migration`.
