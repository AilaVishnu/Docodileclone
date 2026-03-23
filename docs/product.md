# Docodile — Product Overview

*Consolidated from `projectBrief.md` + `productContext.md`*

---

## Project Overview

**Docodile** is a comprehensive multi-tenant Clinic Management System (EMR) designed for small to medium-sized clinic networks in India. It enables healthcare providers to manage their clinics, staff, domains, and operational workflows from a single unified platform.

---

## The Problem

Small to medium-sized clinic networks often struggle with fragmented management systems. Admins need a way to maintain a high-level view of all their locations while ensuring each clinic can run its day-to-day operations with its own staff and configuration.

---

## How Docodile Solves It

Docodile provides a unified dashboard where tenants can jump between clinic "workspaces".

- **Centralized Admin**: One login for the owner to see everything.
- **Decentralized Operation**: Each clinic has its own staff members and settings.
- **Domain Identity**: Each clinic gets its own unique domain/slug for potential future public-facing features (portals, bookings).

---

## Core Goals

1. **Multi-Clinic Management**: Allow admins to create and manage multiple clinics independently.
2. **Staff Workflow**: Facilitate staff onboarding and role management.
3. **Data Independence**: Ensure clinics belonging to the same tenant have isolated operational data (staff, schedules, configurations).
4. **Seamless Identity**: Provide a centralized authentication system that identifies users and their respective tenants.

---

## Key Features

- **Clinic Onboarding**: Dedicated flow for setting up clinic names, addresses, and custom subdomains (unique application-wide).
- **Staff Management**: Detailed "Add Staff" flow with validation and role-specific fields.
- **Tenant Isolation**: Secure multi-tenant architecture using JWT-encoded security contexts.

---

## Target Users

- **System Admins**: Owners of one or more clinics.
- **Doctors**: Medical professionals needing access to patient and clinic data.
- **Staff (Nurses, Front Desk, etc.)**: Operational teams handling the daily flow of the clinic.

---

## User Experience Goals

- **Professional & Premium**: The UI uses a modern, high-contrast aesthetic that feels like a top-tier SaaS product.
- **Low Friction**: Onboarding a new clinic or staff member is designed to be as fast as possible with clear feedback.
