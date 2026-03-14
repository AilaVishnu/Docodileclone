# Active Context

## Recent Changes
- **Multi-Clinic Support**: Implemented ability for a tenant to manage multiple clinics with independent tab states.
- **Staff Persistence**: Implemented full lifecycle for staff (Fetch/Save) linked to specific clinics.
- **AddStaffModal Enhancements**: Added mandatory field validation and conditional rendering for Doctor-specific fields ("Speciality" and "Reg. No.").
- **Enum Synchronization**: Synchronized `Role` enums between frontend labels and backend enum constants (added `PHARMACY`, `NURSE`, `FRONT_DESK`, etc.).
- **Security Fixes**: Handled null `password_hash` for staff added via the "Build Your Clinic" flow to avoid authentication principal errors.

## Current State
- The system is functional for adding/editing clinics and their associated staff.
- Authentication is strictly token-based.
- UI follows a professional "Clinic Management" aesthetic with dark/vibrant themes.

## Ongoing Goals
- Enhance clinic workspace features.
- Implement specialized views for different staff roles.
