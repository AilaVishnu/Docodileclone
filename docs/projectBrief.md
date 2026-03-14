# Project Brief

## Project Overview
**Docodile** is a comprehensive Clinic Management System designed for multi-clinic operations under a single tenant (admin). It enables healthcare providers to manage their clinics, staff, domains, and operational workflows efficiently.

## Core Goals
1. **Multi-Clinic Management**: Allow admins to create and manage multiple clinics independently.
2. **Staff Workflow**: Facilitate staff onboarding and role management.
3. **Data Independence**: Ensure that clinics belonging to the same tenant have isolated operational data (staff, schedules, configurations).
4. **Seamless Identity**: Provide a centralized authentication system that identifies users and their respective tenants.

## Key Features
- **Clinic Onboarding**: Dedicated flow for setting up clinic names, addresses, and custom subdomains (unique application-wide).
- **Staff Management**: Detailed "Add Staff" flow with validation and role-specific fields.
- **Tenant Isolation**: Secure multi-tenant architecture using JWT-encoded security contexts.
