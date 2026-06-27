# Architecture Maturity & Scale Roadmap

> An honest assessment of where Docodile's architecture is enterprise-grade, where it isn't, and the
> order to close the gaps. **Sequenced by what unblocks scale first, and gated by triggers** so we
> don't gold-plate an MVP — each phase says *when* it becomes necessary, not "do it now."
>
> Companion docs: `docs/architecture.md` (how it works), `docs/backlog.md` (tracked work),
> `docs/contributing.md` (standards). Last updated: 2026-06-28.

---

## Verdict

**Enterprise-grade core, early-stage operations.** The architecture made the right foundational bet:
the things that are painful and risky to retrofit — **tenant isolation, security, and compliance
scaffolding** — are done well. What separates it from "enterprise-level" is **operational maturity**:
horizontal scaling, observability, HA/DR, and at-scale provisioning/migrations. None of those require
redesigning the core; they're additive. Today the system is correct and safe but effectively
**single-instance**.

### Maturity snapshot

| Dimension | State | Note |
|---|---|---|
| Tenant isolation | 🟢 Strong | schema-per-tenant, `search_path` hygiene, fail-closed JWT, WS subscribe enforcement |
| Security | 🟢 Strong | stateless JWT, Argon2, rate limiting, session revocation, MFA-pending, automated commit review |
| Compliance scaffolding | 🟢 Good | scoped audit log, consent, data-subject deletion/correction, file encryption-at-rest |
| Migrations | 🟡 Partial | per-schema programmatic Flyway is solid; boot-time, serial, fatal-on-failure won't scale to many tenants |
| Horizontal scaling | 🔴 Gap | in-memory STOMP broker + unlocked `@Scheduled` jobs ⇒ single-node only |
| Data-layer scale / blast radius | 🟡 Partial | one Postgres + one shared pool (noisy-neighbor); no replicas / sharding / per-tenant DB |
| Observability | 🔴 Gap | Actuator only; no metrics export, tracing, structured logs, or alerting |
| HA / DR | 🔴 Gap | no replication/failover, per-tenant backup/restore, or data-residency story |
| Provisioning / lifecycle | 🟡 Partial | `provision()` well-designed but **no caller**; no quotas/metering/suspend-restore |
| Ops hygiene | 🟡 Partial | CI runs backend tests + builds only; no FE lint/typecheck/test in CI, no load/perf tests, secrets in plain env |

(Verified against the code: `WebSocketConfig` uses `enableSimpleBroker`; `NoShowSweepJob`/`PurgeJob`
use `@Scheduled` with no lock; a single Hikari `DataSource`; Actuator present but no
Micrometer/Prometheus/tracing/ShedLock/Quartz/broker-relay dependencies.)

---

## The hard ceiling: single-instance lock-in

**You cannot safely run more than one backend instance today.** Two things break the moment a second
replica starts:

1. **In-memory STOMP broker** (`enableSimpleBroker`). Chat messages published on instance A are never
   delivered to clients connected to instance B — the broker state lives in each JVM's heap.
2. **Unlocked `@Scheduled` jobs.** `NoShowSweepJob` and `PurgeJob` (via `TenantTaskExecutor`) run on
   *every* instance with no coordination, so the nightly sweep / purge **double-runs** across N
   replicas.

Everything else (the stateless JWT auth, schema-per-tenant data access) is already horizontally
scalable. **Phase 1 exists to break exactly this ceiling** — it's the highest-leverage work because
it's what caps you at one node, which in turn caps availability (no rolling deploys without downtime)
and throughput.

---

## Roadmap

Each phase lists its **trigger** (when it stops being optional), **what**, a concrete **first step**,
and **effort** (S/M/L, relative).

### Phase 0 — Keep the core intact (ongoing)
The isolation/security/compliance design is a competitive asset. Protect it: hold the line on the
invariants in `architecture.md §10`, keep auth fail-closed, and don't let the gaps below tempt
shortcuts that weaken isolation. No work — just discipline.

### Phase 1 — Break single-instance lock-in 🔴 (unblocks horizontal scale + zero-downtime deploys)
**Trigger:** the first time you need >1 app instance — i.e. for HA, rolling deploys, or when one node
can't carry load. For a handful of clinics on one box you can defer, but this is the ceiling, so plan
it before you need it under pressure.

- **External STOMP broker.** Replace `enableSimpleBroker` with a broker relay
  (`enableStompBrokerRelay`) backed by RabbitMQ (STOMP plugin) or ActiveMQ, **or** swap chat to a
  Redis pub/sub fan-out. Then broker state is shared across instances. *First step:* stand up RabbitMQ,
  switch `WebSocketConfig`, keep the `TenantChannelInterceptor` subscribe-enforcement unchanged.
  Effort: **M**.
- **Distributed job locking.** Add **ShedLock** (lightweight, just needs a DB table) so each
  `@Scheduled` fires on exactly one instance. *First step:* add the dependency, a `shedlock` table in
  the platform schema, `@SchedulerLock` on `sweepNightly`/`purge*`. Note: `sweepOnBoot` (the
  `initialDelay` boot catch-up) should also be guarded or made idempotent-per-cluster. Effort: **S**.
- **Sticky sessions / SockJS:** confirm the load balancer handles WebSocket upgrade + session affinity
  (or rely on the broker relay so affinity isn't required). Effort: **S**.

### Phase 2 — Observability 🔴 (you can't operate at scale blind)
**Trigger:** as soon as real clinics depend on it in production, or before Phase 1 ships (you need to
see whether multi-instance is healthy).

- **Metrics:** add `micrometer-registry-prometheus`; expose `/actuator/prometheus`. Track per-tenant
  request rates/latency/errors, Hikari pool saturation (the noisy-neighbor signal), and job
  outcomes. Effort: **S–M**.
- **Tracing:** Micrometer Tracing + OpenTelemetry exporter, so a request can be followed across
  filter → service → DB, with the tenant as a span tag. Effort: **M**.
- **Structured logging + correlation:** JSON logs with a request/tenant correlation id (the tenant is
  already in `TenantContext` — put it in the MDC). Effort: **S**.
- **Alerting:** wire the metrics to alerts (pool exhaustion, error-rate, failed migrations at boot,
  job failures-per-tenant which `TenantTaskExecutor` already logs). Effort: **S**.

### Phase 3 — Provisioning & tenant lifecycle 🟡 (unblocks self-serve growth)
**Trigger:** when onboarding clinics manually becomes a bottleneck (more than a trickle), or you want
self-serve signup.

- **Onboarding endpoint** for `ClinicProvisioningService.provision()` (today it has no caller —
  `backlog.md §1.1`): a control-plane `POST /api/platform/clinics`, platform-level authz, plus the
  admin-activation/welcome-email handoff. Effort: **M**.
- **Lifecycle operations:** suspend/reactivate (the `SUSPENDED` status exists but nothing drives it),
  per-tenant export, and offboarding/delete with the compliance retention rules. Effort: **M–L**.
- **Quotas & metering:** per-tenant limits (staff count, storage) and usage metering if billing needs
  it. Effort: **M**.

### Phase 4 — Data-layer scale & blast radius 🟡
**Trigger:** when pool contention shows up (Phase 2 metrics), tenant count grows into the hundreds, or
a single noisy clinic degrades others.

- **Pool isolation / sizing:** today all tenants share one Hikari pool, so one clinic's slow queries
  can starve everyone. Add pool monitoring first, then consider per-tier pools or query timeouts.
  Effort: **M**.
- **Read replicas:** route read-heavy traffic (stats, history) to a replica. Effort: **M**.
- **Sharding / per-tenant DB option:** for very large or compliance-sensitive tenants, allow a clinic's
  schema to live on a different database. The schema-per-tenant design makes this *possible* (the
  registry could carry a datasource key) but it's a real project. Effort: **L**. **Don't do this
  until a concrete tenant requires it.**

### Phase 5 — HA/DR & migration-at-scale 🔴
**Trigger:** when an SLA/contract requires it, or tenant count makes boot-time migration too slow/risky.

- **HA/DR:** Postgres replication + failover (a managed provider gives much of this), documented RTO/RPO,
  and per-tenant point-in-time restore. Effort: **L**.
- **Migration orchestration:** the current boot-time, serial, **fatal-on-any-tenant-failure** runner
  (`TenantBootMigrationRunner`) is correct for a few tenants but won't scale — boot gets slow and one
  bad schema blocks startup for all. Move to an out-of-band migration job (parallelized, per-tenant
  status tracking, resumable, with a degraded mode for partial failure) before you have many tenants.
  Effort: **M–L**.

### Phase 6 — Hardening & ops hygiene 🟡 (continuous)
**Trigger:** ongoing; pull items forward as they bite.

- **Frontend in CI:** CI runs only backend tests + builds. Add `tsc --noEmit`, ESLint (fail on *new*
  warnings), and frontend tests so regressions don't sail through (see `contributing.md`). Effort: **S**.
- **Secrets management:** move from plain env vars to a vault/KMS (or at least the platform's secret
  store) for `JWT_SECRET`, DB creds, `FILE_ENCRYPTION_KEY`. Add a key-rotation story. Effort: **M**.
- **Load/perf tests** for the queue, stats, and bulk import paths; **API contract/OpenAPI** for the
  REST surface; close the **ORM-level isolation test** (`backlog.md §2.1`). Effort: **M**.

---

## Suggested order

```
Phase 1 (scale ceiling) ──► Phase 2 (observability) ──► Phase 3 (provisioning)
        │                          │
        └── enables HA/rolling     └── makes Phase 4/5 decisions data-driven
            deploys

Phase 4 (data scale)  and  Phase 5 (HA/DR + migration-at-scale)  ── trigger-driven, later
Phase 6 (hygiene)  ── continuous, pull forward as needed
```

Rationale: **Phase 1 is the keystone** — it's the only thing that fundamentally caps the system at one
node, and it unblocks both availability and throughput. **Phase 2 before 4/5** so scaling decisions are
driven by real numbers (pool saturation, per-tenant latency) instead of guesses. **Phase 3** when
onboarding friction is real. Phases 4–5 are **trigger-driven** — don't build sharding, replicas, or
multi-DB until metrics or a contract demand them.

## What NOT to do yet (YAGNI)

Premature complexity is its own risk. Until a trigger fires, **don't**: shard the database or build a
per-tenant-DB router, introduce Kafka/event-sourcing, split the monolith into microservices, or add a
service mesh. The monolith + schema-per-tenant is a good fit for the current scale; these would add
operational burden with no payoff today.
