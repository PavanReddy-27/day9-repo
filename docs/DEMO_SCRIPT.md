# Speaking Script — Backend Data & Login

Read straight through. Roughly **7–8 minutes** at a normal pace.
Lines in `[ brackets ]` are stage directions — don't say them.
`//` marks a place to pause and breathe.

---

## 1 — Scope (40 sec)

Thanks. So my part of this project was the backend data layer and the login flow.

Three things, really. //

First, the database — the schemas, the indexes, how the collections relate to each other, and all the aggregation work that produces the numbers you see on the dashboards.

Second, the seed engine — the generator that builds a realistic company with 250 employees and a year of history behind it.

And third, authentication — how credentials are stored and checked, how tokens get issued and rotated, and how every protected route decides what you're allowed to see. //

I'll go through the data side first, then login. Should take about eight minutes.

---

## 2 — Data model (1 min)

[ Open the `server/models` folder. ]

So this is the data model. Twenty-three collections, one file each, covering the whole domain — the org structure, people, attendance, leave, performance, skills, tasks, and the audit trail.

The first thing to know is that every single collection carries a company ID. //

It's not decoration. It's the first field of nearly every index, and it opens nearly every query. The whole database is partitioned by company by design — so two companies' data can't mix, even if someone writes a careless query later.

[ Open `Employee.ts`. ]

Relationships are references, not nested documents. An employee points to their company, their location, their department, their team, their manager, and their shift. All of those get queried and updated on their own, so nesting them would've been the wrong call. //

But — and this is a deliberate exception — a couple of fields are duplicated on purpose. The department name and the location code are stored on the employee record as well as being referenced.

That's a read optimisation. Employee lists render constantly across this app, and this keeps a join off that path. The reference stays the source of truth; the copy is just a cache.

Last thing here — statuses are enums at the schema level, not free text. Employment status, work mode, risk level, attendance state. So a bad value gets rejected when it's written, instead of showing up three weeks later as a chart that doesn't add up.

---

## 3 — Indexing (1.5 min)

[ Open `AttendanceRecord.ts`, scroll to the indexes. ]

Now, indexing. This is the part I put the most thought into. //

The indexes here are compound, and each one is shaped around a query the app actually runs. Attendance is indexed on company plus employee plus date, and separately on company plus date plus status — because those are the two ways it gets read. One person's history, or everybody's status on a given day.

But the more interesting thing is that several of them are unique. And that means they're not just making reads fast — they're enforcing rules. //

One attendance record per employee per day. One performance review per employee per period. One skill entry per employee per skill. Those are guarantees now. A retried request or someone double-clicking a button physically cannot create a duplicate. The application doesn't have to be perfect for the data to stay correct.

[ Open `AttendanceEvent.ts`. ]

There's one index I want to call out specifically, because it caused a real bug. //

Attendance events can carry an idempotency key to protect against duplicate requests. But most events legitimately don't have one — it's null.

Now, a normal unique index treats every one of those nulls as the same value. So the first keyless event saves fine, and every single one after that gets rejected. Which silently breaks check-ins, and it's very hard to spot, because the error gets swallowed.

So this is a partial index. Uniqueness only applies where the key is actually a string. Duplicate protection still holds, normal check-ins flow through. And I wrote a repair script that fixes any environment still carrying the old broken index — it's safe to run over and over. //

One more — revoked tokens use a TTL index. MongoDB deletes those documents itself after twenty-four hours. No cron job, no cleanup task, no collection growing forever. The database maintains it.

---

## 4 — Transactions and aggregation (1 min)

[ Open `attendanceController.ts`, scroll to a session block. ]

Two more things on the data side.

Some operations touch several collections at once. A check-in writes the attendance record, appends an event, and might raise a notification. Half of that landing is worse than none of it landing. //

So those run inside a transaction — everything commits, or everything rolls back. Check-in, break, resume, check-out, correction approvals, leave approvals, and logout all work that way. That's also why we're on a cluster rather than a standalone instance — transactions need it.

[ Open `analyticsController.ts`. ]

And the second thing — every number on those dashboards is calculated by MongoDB, not by us. //

We're not pulling 250 employee records into Node and counting them in a loop. These are aggregation pipelines. They filter, join, and group inside the database, and hand back a few rows instead of the whole result set.

Headcount by department, by location, hiring trends by month, attendance rates, skill gaps, performance averages — all of it. And it's the indexes I just showed you that keep those pipelines cheap as the data grows. The two halves depend on each other.

---

## 5 — Seed engine (40 sec)

[ Open `server/seed/seed.ts` — don't run it. ]

Quick word on the data itself.

The seed engine builds a whole organisation — one company, five real offices across India with actual coordinates, seven departments in each, 250 employees spread across them, plus shifts, skills, tasks, leave requests, and twelve months of attendance, performance and productivity history. //

Two decisions in there I'd defend.

It's deterministic. It uses a seeded generator rather than random fake data, so the same run gives you the same result every time. That means demos are reproducible and bugs are repeatable.

And it's safe to re-run. It detects a database that already has data and stops, unless you explicitly tell it to reset. Big inserts go in batches so memory stays flat, and it prints a summary of every collection at the end. //

The server also checks on startup whether the login collections are empty, and seeds itself if they are. So a brand-new environment comes up working rather than dead.

---

## 6 — Login (1.5 min)

[ Browser on the login page, DevTools open on the Network tab. Log in. ]

Right — login. Let me take one request all the way through. //

[ Click the login request in the Network tab. ]

Five things happen here.

First, validation. Before any of my controller code runs, a schema checks the request body. If it's wrong, you get a structured error back with per-field messages, so the form can show them inline instead of a generic failure. //

Second, resolving the user. Logins are split across four collections by role — admin, HR, manager, employee — rather than one big users table. Each role's credentials sit in their own store, and the lookup resolves across them.

Third, verifying the password. The hash is never returned by a normal query — we have to explicitly ask for that field. And verification handles both argon2 and bcrypt, which means we could change hashing algorithms later without forcing everyone to reset their password. //

Fourth, authorisation checks. A deactivated account gets its own clear message, because that one's actually actionable. But a wrong password and an email that doesn't exist return exactly the same generic response — we don't tell anyone which accounts are real.

And fifth, we issue the tokens. An access token that lives fifteen minutes, and a refresh token that lives seven days. The login is also written to the audit trail — who, what role, from what IP — and that's fire-and-forget, so it never slows the response down. //

[ Point at the response body. ]

And every endpoint in this API answers in the same envelope, so the frontend only ever has one shape to handle.

---

## 7 — Sessions and access (1 min)

Once you've got that token, a few things keep it honest. //

Refresh is rotation. When you trade a refresh token for a new pair, the old one gets blacklisted immediately. So it's single-use. If someone steals one and replays it, it's already dead.

Logout revokes both tokens in a single transaction, so we never end up in a state where one's dead and the other's still live. //

And then scoping. Admin and HR see the whole company. A manager is pinned to their own department. An employee only ever sees their own record.

The important part is where that happens — it's applied to the database query itself. It's not filtered out in the UI afterwards. The data a manager isn't allowed to see never leaves the database. And there's a role guard on the routes on top of that, so the wrong role gets rejected before any query even runs. //

Around all of that: security headers, a CORS allowlist rather than a wildcard, rate limiting that's much tighter on login than on everything else — and successful logins don't count against that budget, so it only ever hits brute-force attempts, not real users. And a central error handler that logs the full stack trace for us but never leaks it to the client.

---

## 8 — Close (30 sec)

So that's my half. //

Company-partitioned schemas, indexes that carry real integrity guarantees rather than just speed, transactions on anything that writes to more than one collection, all the analytics computed inside the database, and an auth flow with rotation, revocation and query-level scoping.

Two things I'd genuinely like a second opinion on. //

One is the denormalisation trade-off on the employee record — duplicating those fields buys us read speed, but it's a consistency risk I chose to take.

And the other is whether fifteen minutes is the right lifetime for the access token, or whether that's creating more refresh traffic than it's worth.

Both are cheap to change now and expensive to change later. //

Happy to go deeper on any of it.

---

## If you're asked

**"Why MongoDB and not SQL?"**
> "The domain is document-shaped and read-heavy, and the aggregation framework does the analytics work natively. Where we genuinely need relational guarantees — multi-collection writes — we use transactions."

**"How do you stop duplicate records?"**
> "Unique compound indexes at the database level, plus idempotency keys on attendance events. It's enforced by Mongo, not by application discipline."

**"Why fifteen minutes?"**
> "Short enough that a leaked token has a small window. The rotation on refresh is what makes it safe to keep sessions alive for seven days."

**"Where are the secrets?"**
> "Environment variables. There's an example file documenting what's needed, and the real one is gitignored."

**"Is any of this mocked?"**
> "No — live Atlas cluster, real data throughout."

**If something errors live**
> "That's the central error handler doing its job — I'll pick that up after."
> [ Then move on. Don't debug in front of the room. ]
