# Demo Walkthrough — MongoDB Data Layer

**Presenter scope:** the database — connection, schema design, indexing, relationships, transactions, aggregations, seeding.
**Audience:** Team Lead · **Duration:** ~8–10 minutes · **Style:** guided tour, not a feature deep-dive.

---

## 0. Before the call (3 min, off-camera)

Start the backend:

```bash
npm run server
```

Have ready:
- Editor with `server/models/` expanded in the file tree
- MongoDB Compass (or Atlas web UI) open on the `workforce_analytics` database
- A terminal for `curl`

**Demo-safety notes (read these, don't say them):**
- **Do not run `npm run seed` live.** The Atlas cluster is already seeded and a re-seed mid-demo is a long, risky operation. Talk through the seed script in the editor instead.
- **Never run `seed:legacy-faker`** — it writes the old field naming and clobbers good data.
- If Atlas is unreachable, the server silently falls back to an in-memory MongoDB. Check the startup log says `MongoDB Connected successfully` and not the in-memory line before you present.

---

## 1. Opening (45 sec)

> "My piece is the data layer — MongoDB, accessed through Mongoose from the Express backend, running on a live Atlas cluster.
> There are 23 schemas behind this application covering the whole workforce domain: the org structure, people, attendance, leave, performance, skills, tasks, and the audit trail.
> I'll walk through four things: how the connection is managed, how the schemas are designed and indexed, how we keep multi-document writes consistent, and how the analytics numbers are actually computed in the database."

---

## 2. Connection management (1 min)

Open `server/config/db.ts`.

> "The connection is a single managed entry point. It's idempotent — if a connection already exists it returns it rather than opening a second one, so we never leak connections across module reloads.
> There's a three-second server-selection timeout, so a bad connection string fails fast instead of hanging the boot.
> And there's a fallback: if the primary connection fails, it spins up an in-memory MongoDB so the app still boots and can be developed against. That's a developer-experience decision — nobody gets blocked because Atlas is unreachable.
> On shutdown, the connection pool is closed cleanly."

Show the health endpoint:

```bash
curl http://localhost:5000/api/v1/health
```

> "The health endpoint reports the actual connection ready-state — connected, connecting, disconnected — plus the host and database name. If Mongo is unhealthy it returns 503, not 200. So monitoring sees a database problem, not just a live process."

---

## 3. Schema design (2.5 min)

Show the `server/models/` folder, then open `Employee.ts`.

> "Twenty-three models, one file each, so the domain is readable from the file tree."

**Multi-tenancy**
> "Every single collection carries a `companyId`. It's the first field of nearly every index, and it's the first stage of every query. The whole database is company-partitioned by design — data from two companies can never mix, even if a query is written carelessly."

**Relationships**
Point at the ObjectId refs on `Employee`.
> "Relationships are ObjectId references — an employee points to their company, location, department, team, manager, and shift. It's a normalised graph, not one giant nested document, because these entities are queried and updated independently."

**Selective denormalisation**
Point at `locationCode` and `departmentName` sitting next to the ID refs.
> "But a few fields are deliberately duplicated — the location code and the department name are stored on the employee alongside the reference. That's a conscious read-optimisation: employee lists render constantly, and this avoids a join on the hot path. The reference stays authoritative; the copy is a cache."

**Constrained values**
> "Statuses are enums at the schema level, not free strings — employment status, work mode, risk level, attendance state. Bad values are rejected by the database layer rather than discovered later in a chart that doesn't add up."

**Timestamps**
> "Almost everything carries automatic created and updated timestamps, which is what makes the historical trend charts possible."

---

## 4. Indexing (2 min)

This is the strongest part of the story — spend time here. Open `AttendanceRecord.ts` and scroll to the index declarations.

**Compound indexes matched to queries**
> "Indexes aren't sprinkled on individual fields — they're compound, and each one is shaped to a query the application actually runs. Attendance is indexed on company plus employee plus date, and separately on company plus date plus status, because those are the two ways it's read: one person's history, and everyone's status on a given day."

**Uniqueness as a data-integrity rule**
> "Several of those compound indexes are unique, and that's doing real work. One attendance record per employee per day. One performance record per employee per review period. One skill entry per employee per skill. Those aren't just lookups — they make duplicate records impossible at the database level, so a retried request or a double-click can't corrupt the data. The application doesn't have to be perfect for the data to stay correct."

**Partial index — the interesting one**
Open `AttendanceEvent.ts` and point at the partial index.
> "This one's worth calling out. Attendance events can carry an idempotency key to protect against duplicate requests, but most events legitimately don't have one. A plain unique index would treat every keyless event as a duplicate null and reject all but the first — which silently breaks check-ins.
> So it's a *partial* unique index: uniqueness applies only where the key is actually a string. Duplicate protection holds, normal events flow through. That's exactly the kind of bug that's invisible until production."

**TTL index**
Open `TokenBlacklist.ts`.
> "And revoked tokens use a TTL index — MongoDB expires those documents automatically after twenty-four hours. No cleanup job, no cron, no unbounded growth. The database maintains it."

**Index repair tooling**
Mention `server/scripts/repairIndexes.ts`.
> "There's also an idempotent repair script for stale indexes left behind by earlier schema versions. Safe to run repeatedly — it drops the bad index and rebuilds the correct one. That's how we fixed the partial-index issue on environments that already had the old one."

---

## 5. Transactions (1.5 min)

Open `server/controllers/attendanceController.ts` and scroll to a `startSession` block.

> "Some operations touch several collections at once. A check-in writes the attendance record, appends an attendance event, and may write a notification. Half of that landing is worse than none of it landing.
> So those writes run inside a MongoDB session with a transaction — commit on success, abort on any error, and the session is always ended. Attendance check-in, break, resume, check-out, correction approval, leave approval, and logout token revocation all run this way.
> This is also why the cluster matters — transactions need a replica set, which is what we get from Atlas."

---

## 6. Aggregations (1.5 min)

Open `server/controllers/analyticsController.ts` and show a pipeline.

> "Every number on the dashboards is computed by MongoDB, not in JavaScript. We're not pulling 250 employee documents into Node and counting them in a loop.
> These are aggregation pipelines — match to scope and filter, lookup to join the related collection, unwind, then group to produce the totals. Headcount by department, by location, by risk level, by work mode; hiring trends grouped by month; attendance rates; skill-gap analysis; performance and productivity averages.
> The advantage is that the work happens next to the data and comes back as a handful of rows instead of a full result set. It stays fast as the dataset grows, and it's the indexes from the previous section that keep those match stages cheap."

If you want one live proof point, hit an analytics endpoint from Compass or curl and show the small response payload.

---

## 7. The seed engine (1 min)

Open `server/seed/seed.ts` — **do not run it.**

> "Last piece: the data itself. The seed engine builds a realistic organisation — one company, five real locations across India with actual coordinates, seven departments per location, and 250 employees distributed across them, plus shifts, skills, tasks, leave requests, and twelve months of historical attendance, performance and productivity records.
> Two design points. First, it's **deterministic** — it uses a seeded pseudo-random generator, not a random faker, so the same run produces the same data every time. Demos and screenshots stay reproducible, and bugs stay repeatable.
> Second, it's **safe to re-run** — it detects an already-populated database and stops unless you explicitly pass a reset flag. Large inserts go in batches to keep memory flat, and it prints a summary report of every collection count at the end.
> The server also checks on boot whether the auth collections are empty and seeds automatically if they are, so a brand-new environment comes up with working data."

---

## 8. Close (30 sec)

> "So, my half in one line: 23 schemas, company-partitioned end to end, with compound and unique indexes shaped to the real query patterns, partial and TTL indexes where a plain index would have been wrong, transactions on every multi-collection write, all analytics computed in aggregation pipelines, and a deterministic seed engine behind it.
> The parts I'd most want feedback on are the indexing strategy and the denormalisation choices — happy to go deeper on either."

---

## Backup answers

- **"Why MongoDB and not SQL?"** — The domain is document-shaped and read-heavy, the schemas evolved through the project, and the aggregation framework does the analytics work directly. Transactions cover the cases that need relational guarantees.
- **"How do you prevent duplicate records?"** — Unique compound indexes at the database level, plus idempotency keys on attendance events. Enforced by Mongo, not by application discipline.
- **"How big is the dataset?"** — 250 employees, 5 locations, 7 departments each, with twelve months of historical attendance, performance, and productivity records.
- **"What about data isolation between roles?"** — Scoping filters are applied to the query itself, so a manager's query only ever reaches their own department's documents. Every filter is also company-scoped.
- **"Is any of it mocked?"** — No, it's a live Atlas cluster.
- **"What's still open?"** — Tracked in `GAP_ANALYSIS.md`; happy to walk it separately.

---

## Appendix — file map (for questions)

| Topic | File |
|---|---|
| Connection, fallback, health, shutdown | `server/config/db.ts` |
| All 23 schemas | `server/models/` |
| Denormalisation + refs example | `server/models/Employee.ts` |
| Compound + unique indexes | `server/models/AttendanceRecord.ts` |
| Partial unique index | `server/models/AttendanceEvent.ts` |
| TTL index | `server/models/TokenBlacklist.ts` |
| Transactions | `server/controllers/attendanceController.ts`, `leaveController.ts` |
| Aggregation pipelines | `server/controllers/analyticsController.ts` |
| Deterministic seed engine | `server/seed/seed.ts` |
| Index repair tooling | `server/scripts/repairIndexes.ts` |
