# Tech Context

## Authentication Flow
1. **Login**: `POST /api/auth/login` returns a JWT.
2. **JWT Structure**: Contains `user_id`, `tenant_id`, `role`, and `email`.
3. **Storage**: Frontend stores the token in `localStorage` as `docodile_token`.
4. **Authorized Requests**: Every request includes `Authorization: Bearer <token>`.
5. **Validation**: `JwtAuthenticationFilter` validates the token and sets the security context.

## API Structure (Key Endpoints)

### Clinics
- `GET /api/tenant/clinics`: List all clinics for the authenticated tenant.
- `POST /api/tenant/clinic`: Save or update clinic details (domain is immutable once saved).
- `GET /api/tenant/domain/check`: Check if a domain is available application-wide.

### Staff
- `GET /api/tenant/clinics/{clinicId}/staff`: Fetch all staff members linked to a specific clinic.
- `POST /api/tenant/clinics/{clinicId}/staff`: Add or update a staff member (linked to the clinic).
  - Handles roles: `ADMIN`, `DOCTOR`, `RECEPTIONIST`, `FRONT_DESK`, `NURSE`, `PHARMACY`, `OTHER`.

## Database Schema (Key Tables)

### `tenant`
- `id` (UUID, PK), `name`

### `app_user`
- `id` (UUID, PK), `tenant_id`, `email`, `name`, `phone`, `gender`, `role`, `speciality`, `registration_no`, `active`, `password_hash` (nullable for BYC staff).

### `clinic`
- `id` (UUID, PK), `tenant_id`, `name`, `address`, `phone`, `domain` (unique), `speciality`.

### `clinic_staff`
- `clinic_id` (FK), `staff_id` (FK) - Many-to-many link.
