# System Patterns

## Tech Stack
- **Frontend**: React (Vite), TypeScript, Vanilla CSS.
- **Backend**: Kotlin, Spring Boot, JPA/Hibernate.
- **Database**: PostgreSQL with Flyway for migrations.
- **Authentication**: JWT-based, Stateless.

## High-Level Architecture
- **Multi-Tenancy**: The system is designed for multi-tenancy. Every `AppUser` and `Clinic` is associated with a `Tenant`.
- **Clinic-Staff Relationship**: A many-to-many relationship exists between `Clinic` and `AppUser` (Staff), managed via the `clinic_staff` association table.

## Frontend Patterns
- **Component-Based UI**: Modern React components using functional patterns and hooks.
- **Styles**: Vanilla CSS modules or co-located `.styles.ts` files using JS objects for CSS.
- **State Management**: Local state (useState) and React Context (if applicable, though primarily prop-drilling or local state for currently viewed features).
- **API Communication**: Uses `fetch` API for REST calls, with Bearer token authentication.
- **SVG Usage**: All SVGs should be stored in `src/assets` and imported using the `ReactComponent` pattern (e.g., `import { ReactComponent as MyIcon } from "../../assets/my-icon.svg"`). This allows for dynamic styling via CSS/props while keeping components clean. Inline SVGs should be avoided.

## Backend Patterns
- **Controller-Service-Repository**: Standard Spring Boot layering.
- **Security**: 
  - `SecurityConfig`: Configures JWT filters and endpoint permissions.
  - `AppUserPrincipal`: Wraps `AppUser` for Spring Security context.
  - `CurrentUser`: Helper to extract `tenantId` and `userId` from the security context.
- **Domain Entities**: Kotlin classes with JPA annotations.
- **Migrations**: Incremental SQL scripts in `src/main/resources/db/migration`.
