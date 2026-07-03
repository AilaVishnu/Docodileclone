# Docodile — Engineering Backlog

> Living backlog for the schema-per-clinic multi-tenant redesign and follow-on work.
> Last updated: 2026-06-28. There is no external tracker — this file is the source of truth.
> When an item is finished, move it to **Done** at the bottom with its commit SHA.

Branch context: work is on `batman`-line branches off the schema-per-tenant redesign
(spec: `docs/superpowers/specs/2026-06-20-multitenant-schema-per-clinic-db-redesign.md`).

Priority key: **P1** = blocks real multi-clinic use · **P2** = correctness/quality gap ·
**P3** = cleanup / nice-to-have.

---

## 1. Functional gaps

### 1.1 — Clinic onboarding endpoint (no caller for `provision()`) — **P1**

**State:** The hard part is already built. `ClinicProvisioningService.provision(name, subdomain, adminEmail)`
(`backend/src/main/kotlin/com/example/docodile/tenancy/ClinicProvisioningService.kt`) atomically:
1. inserts the platform registry row (`PROVISIONING`),
2. `CREATE SCHEMA <slug>`,
3. runs the tenant baseline migration (`TenantMigrator.migrateTenant`),
4. seeds `clinic_settings` + an `app_user` row (role `ADMIN`, `account_status = PENDING_ACTIVATION`),
5. marks the registry row `ACTIVE`,
with compensating cleanup (drop schema + delete row) on any failure.

**Gap:** Nothing calls it. `grep` for `ClinicProvisioningService` / `provision(` finds **no controller**.
Onboarding a clinic today therefore means invoking the service manually or running SQL by hand.
Also, the seeded admin is `PENDING_ACTIVATION` with **no password** — the onboarding flow must hand off
to the existing password-setup / welcome-email path so the admin can actually log in.

**What's needed:**
- A control-plane endpoint (e.g. `POST /api/platform/clinics`) on the `platform` schema — **not** tenant-scoped
  (it runs before the clinic's schema/subdomain exists, so it must bypass `TenantResolutionFilter`'s
  tenant requirement; see the `isTenantScopedPath` allowlist in `TenantResolutionFilter.kt`).
- AuthZ decision: who may onboard? (super-admin/ops only — there is no cross-clinic role yet, so this
  likely needs a platform-level credential or a separate admin surface.)
- After `provision()`, trigger admin activation: generate a password-setup token and send the welcome
  email (`EmailService.sendWelcomeEmail(to, name, clinicName, setupLink)` already exists).
- Decide API-only vs a small ops UI.

**Acceptance:** A single authenticated call creates the registry row + schema + baseline + admin, sends the
welcome email, and the new admin can set a password and log in at `https://<subdomain>.docodile.app`.
Duplicate subdomain returns a clean 409, and a mid-failure leaves no orphan schema/row.

**Open question for the user:** API-only vs ops UI, and the authorization model for who can onboard.

---

### 1.2 — Correction-review notification email is unwired — **P2**

**State:** `EmailService.sendCorrectionComplete(to, fieldName, newValue, approved)` exists and is complete
(`backend/.../service/EmailService.kt:94`). The review endpoint exists
(`DataWorkflowController.reviewCorrection` → `POST /api/.../corrections/{id}/review`).

**Gap:** `DataSubjectRequestService` (`backend/.../service/DataSubjectRequestService.kt`) does **not** inject
`EmailService`, and `reviewCorrection` (line 133) transitions the request to `APPLIED`/`REJECTED` and writes
the audit log **but never calls `sendCorrectionComplete`**. The notification was dropped during the 2b login
cutover. So a patient whose correction request is approved/rejected is never told.

**What's needed:**
- Inject `EmailService` into `DataSubjectRequestService`.
- In `reviewCorrection`, after the status transition (both the `approve` and reject branches), resolve the
  patient's email and call `sendCorrectionComplete(patientEmail, req.fieldName, req.newValue, approve)`.
- Wrap the send so a mail failure doesn't roll back the review (EmailService already logs+swallows, but
  confirm the call site doesn't throw).
- Test: a review of a SUBMITTED request triggers exactly one email with the correct approved/rejected copy;
  no email if the patient has no email on file.

**Acceptance:** Approving or rejecting a correction sends the patient the right email; the review still
succeeds (and is audited) even if the email send fails.

---

## 2. Verification / Definition-of-Done

### 2.1 — ORM-level tenant-isolation test — **P2**

**State:** Isolation is enforced at the connection layer (`MultiTenantConnectionProvider` + `set_config`
search_path per `TenantContext`), and request/WS/scheduled-job paths set the tenant. Tenancy has
Testcontainers coverage, but there is **no test that proves JPA repository reads/writes are physically
scoped to the tenant schema** — i.e. that an entity written under tenant A is invisible to an identical
repository query run under tenant B.

**What's needed (Testcontainers, real Postgres):**
- Provision two schemas (e.g. `acme`, `tskin`) via the baseline migration.
- Under `TenantContext.withTenant("acme")`, save a `Patient` (or similar) via its Spring Data repository.
- Under `TenantContext.withTenant("tskin")`, run the same `findAll()` / `findById` and assert it returns
  nothing / empty — and vice-versa.
- Bonus: assert a connection returned to the pool has its `search_path` reset (no leakage to the next borrower).

**Acceptance:** A green test that fails if search_path routing regresses (e.g. someone removes the
per-tenant `set_config`).

**Progress (`f24e909`):** The bill/patient data paths now have two-schema isolation coverage
(`BillTenantIsolationTest`) — but it exercises the **connection layer** (raw SQL through
`SchemaMultiTenantConnectionProvider`), not Spring Data repositories under `TenantContext.withTenant`.
The generic JPA-repository-level proof this item asks for is still open.

---

## 3. Frontend lint — 14 warnings remaining (0 errors)

Baseline was 48; the safe set was cleared in commit `f71c4af`. The remaining 14 were **left deliberately**
because each is a judgment call, not noise. Run `cd frontend && CI=false npx eslint src --ext .ts,.tsx`.

### 3.1 — Unwired feature scaffolding (5 × `no-unused-vars`) — **P3, needs product decision**
These are "assigned but never used" because the feature was started and not wired into the JSX. Decide per
item: **remove** the dead scaffolding, or **finish wiring** it.
- `components/BillCard/BillCard.tsx:42,45` — `taxMode` + `handleTaxMode`: a tax-mode (%/₹) toggle that
  mirrors the working `discountMode` toggle but is never rendered/used.
- `components/AppointmentQueue/BookAppointment.tsx:508` — `handleDoctorCycle`: a "cycle to next doctor"
  handler, never bound to a control.
- `pages/Home/HomePage.tsx:79` — `setSettingsSection`: persists the active Settings sub-section to
  `localStorage`; the setter is never called, so the section can't change at runtime. (The read side,
  `settingsSection`, **is** used.) Looks like missing wiring from SideNav.
- `pages/Stats/StatsPage.tsx:1224` — `DuesAgingCard`: a whole stats card component that is defined but
  never placed in the page.

### 3.2 — `react-hooks/exhaustive-deps` (6) — **P3, behaviour-sensitive**
Adding deps blindly can cause re-fetch loops or stale closures; each needs to be reasoned about, not
auto-fixed. Sites:
- `components/AddStaffModal/AddStaffModal.tsx:134` (missing `name`)
- `components/AppointmentQueue/AppointmentQueue.tsx:199` (`isBooking`), `:348` (`doctors.length`)
- `components/AppointmentQueue/BookAppointment.tsx:307` (`calcAge`, `editingAppointment.patientDob`)
- `components/Chat/ChatPanel.tsx:123` (`currentUserId`, `dmKey`, `loadDmHistory`, `markSeen`)
- `pages/PrescriptionPage/PrescriptionPage.tsx:1167` (`selectedAppointmentId`)

### 3.3 — Accessibility (3) — **P3**
- `components/MedicineAutocomplete/MedicineAutocomplete.tsx:296` and
  `components/Autocomplete/AutocompleteTags.tsx:101` — `aria-expanded` on an implicit `textbox` role.
  Proper fix: make the input a real combobox — add `role="combobox"` **and** `aria-controls` pointing at the
  listbox's `id` (the menu/portal needs an id). (A naked `role="combobox"` just trades this warning for a
  `role-has-required-aria-props` one, so it must be done with the listbox wiring.)
- `pages/Pharmacy/PharmacyListView.tsx:29` — `anchor-is-valid`: an `<a href="#">` used as a click target.
  Fix: convert to a `<button>` styled as a link (needs the link styling re-applied to the button).

---

## 4. Smaller / housekeeping

- **`PharmacyStockController.currentUser` is unused** — became dead when inventory audit logging was removed
  (`1fcc234`); it was actually unused before that too. Left in place per surgical-change discipline. Safe to
  drop the constructor param `currentUser: CurrentUser` if touching the file.
- **Re-provision `tskin` from the current baseline** — the `tskin` schema was created before the billing
  tables (`bill`, `patient_deposit_ledger`, `patient.deposit`, `visit.completed_at`) were folded into
  `db/tenant/V1__baseline.sql`. Newly-provisioned clinics get billing; `tskin` does not until re-provisioned.
  To exercise billing on `tskin`, drop+recreate it from the current baseline (or hand-apply the billing DDL).

---

## Done (recent)

- `b5dcbdf` — Restored `todayBillCount` + `pharmacyAmount`/`discountAmount`/`patientDeposit` on
  `AppointmentDTO` (the queue kebab's "Create Bill" vs "View/Create Bills" branch and the Bill editor's
  seed amounts). The schema-per-tenant rebase adapted `countByPatientForDate(clinicId, date)` →
  `(date)` but dropped the callers; `AppointmentService.toDTO` had stopped populating all four.
  Regressed by unit tests in `AppointmentServiceTest`.
- `f24e909` — Two-schema tenant-isolation coverage for the new bill data paths (`BillTenantIsolationTest`,
  Testcontainers): a pay-bill `UPDATE` under one clinic leaves another clinic's identically-numbered
  invoice untouched, and find-or-create's phone+name dedup read can't see a same-name patient in another
  schema. The contributing.md two-schema check for the paths added below.
- `9161fb2` — Bill `note` column (tenant migration `V2__add_bill_note.sql`) + settle/pay endpoint
  (`POST /bills/{id}/pay`, `BillService.payBill`): clamps `paid` to `billed`, recomputes `due`/`payStatus`,
  rejects refunded/waived/zero bills. Note persisted end-to-end (`createBill` → `toDTO`/`toClinicDTO`).
- `eaa7c7c` — Patient find-or-create endpoint (`POST /api/patients`, `PatientService.findOrCreate`):
  dedups by normalized phone + name, else creates with the next clinic `displayNo`. Backs the standalone
  New Bill page.
- `a382f31` — Scheduled jobs run per active clinic schema (`TenantTaskExecutor`; no-show sweep + purge).
- `3acbbb6` — STOMP `SUBSCRIBE` rejects cross-clinic `/topic/clinic/*` (`TenantChannelInterceptor`).
- `1fcc234` — Dropped inventory audit logging (audit scope = sensitive data only: patient records + Rx).
- `f71c4af` — Frontend lint 48 → 14 (safe unused imports/vars, regex escapes, useState/dep fixes).
