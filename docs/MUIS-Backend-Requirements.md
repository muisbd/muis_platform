# MUIS Platform — Backend & Product Requirements

**Prepared for:** MUIS seniors / executive committee / development leads  
**Website today and going forward:** **Next.js** (this repo). We will **not** rebuild the site as a separate React (Vite/CRA) app.  
**Proposed backend:** **Express.js** + **MongoDB Atlas** + **Node.js**  
**Email:** **Resend** (official MUIS messages)  
**Admin:** Same Next.js app, `/admin`, with **moderation queues**  
**Status:** Proposal for approval. No backend has been built yet.

This document explains (1) what the current website really does, (2) how existing screens will connect to a real backend, (3) proposed new features (blogs + private student progress), and (4) the fastest architecture that still lets MUIS **manage everything**.

---

## 1. Why this proposal exists

The public website already looks complete: Join, Contact, Donate, Courses, Events, Magazine, RSVP.

**Those actions do not save data on any MUIS server.**  
They show a success toast or browser alert. Membership is stored only in the student’s browser. Donation TrxIDs are not recorded. “Check your email” sends no email.

Seniors should treat the current site as a **finished brochure**, not as a membership, finance, or education system.

We are asking approval to add a **real backend** so MUIS can:

- Receive and manage membership, messages, donations, RSVPs, and enrollments
- Publish knowledge (magazine + **student blogs**, with MUIS approval)
- Offer a **private** salah and personal-development tracker (never a public leaderboard)

---

## 2. Recommended stack (fastest and most efficient for *this* project)

**Locked decision: Next.js stays.** The public site, `/admin`, blogger workspace, and student progress UI are all Next.js routes in this repository. A second React SPA would be slower, duplicate work, and is **out of scope**.

| Layer | Choice | Why |
|--------|--------|-----|
| Frontend | **Next.js (this website)** | Already built. Pages, CSS, and routing stay. New features (`/blogs`, `/admin`, prayer journal) are new Next.js pages that call the API. |
| API | **Express.js (Node)** | Separate backend for auth, MongoDB, email. REST `/api/v1/...`. |
| Database | **MongoDB Atlas (NoSQL)** | Flexible documents for forms, blogs, and daily prayer logs. No PostgreSQL. |
| Files | **Cloudinary** (or GridFS if we must stay 100% Mongo) | Magazine PDFs, blog covers, event photos. |
| Email | **Resend** | Official “application received / RSVP confirmed / blog published” mail from a MUIS address. |
| Admin | **Next.js `/admin`** | Same app. Role-based. Moderators approve blogs; treasurer verifies donations. |
| Hosting | Frontend: **Vercel** · API: **Render / Railway** · DB: **MongoDB Atlas** | Standard, cheap student-org setup. |

**We will not use PostgreSQL / Supabase.** Database is MongoDB. API is Express. UI is Next.js.

```text
Students / public
        │
        ▼
 Next.js website  (this repo — pages stay as they are)
        │  HTTPS + JWT where login is needed
        ▼
 Express.js API   /api/v1/...
        │
        ├── MongoDB Atlas   (users, forms, events, blogs, private journals)
        ├── Cloudinary      (PDFs, images)
        └── Resend          (official email to student + committee)
```

**Two deploys, one product.** Do not split into three frontends (public site + admin + blogger app). Bloggers and admins use the same site with different menus after login.

---

## 3. What the current website implements vs what the backend will do

Below is the mapping seniors can use in review: *this button exists today → this is how we will make it real.*

### 3.1 Public content (already on screen)

| Page | What users see now | After backend |
|------|--------------------|---------------|
| Home | Hardcoded hero, slideshow, YouTube, FAQ | Same UI. Later, slideshow/events can load from MongoDB so non-developers can update. |
| About + committee | Hardcoded copy + `committeeData.js` | Same UI. Committee cards become editable in Admin each term. |
| Events & gallery | `eventsData.js`, `galleryData.js` | Admin CRUD. Gallery images upload to Cloudinary. Event IDs stored as **strings** (fix today’s bug: `past-1` is not an integer). |
| Courses | `coursesData.js` | Admin CRUD. Enroll writes a real enrollment document. |
| Magazine | Fake “Download PDF” toast | Real file URL from Cloudinary. Download button becomes a real link. |
| Donate | Public bKash + NRBC numbers (keep these public) | Copy buttons stay frontend. **TrxID form posts to API** and appears in Treasurer queue. |
| Contact / Footer | Email, phone, Facebook, YouTube | Unchanged. Contact **form** posts to API. |

### 3.2 Forms that look finished (must become API calls)

Show the **existing success UI only after the API returns success.** If the API fails, show an honest error.

| Feature | Current behaviour | Backend implementation |
|---------|-------------------|-------------------------|
| **Join MUIS** (`/join`, `/join-muis`) | `localStorage` only; Google Sheets URL empty | `POST /api/v1/membership` → `MembershipApplication`. Email student + notify committee via Resend. Admin reviews (New / Approved / Added to WhatsApp). **Remove localStorage as the source of truth.** |
| **Contact** | Toast; message discarded | `POST /api/v1/contact` → `ContactMessage`. Resend to `muis@metrouni.edu.bd`. Admin inbox. |
| **Newsletter** | `alert('Subscribed...')` | `POST /api/v1/newsletter` → unique email. Unsubscribe link in every mail. |
| **Donate confirmation** | Toast; no ledger | `POST /api/v1/donations/confirm` → unique `trxId`. Treasurer marks **Pending / Verified / Rejected**. Never auto-trust a TrxID. |
| **Event RSVP** | Toast; **no .ics file** | `POST /api/v1/events/:id/rsvp`. Optional `.ics` attachment via Resend. Admin sees headcount. |
| **Course enroll** | Toast; “check email” is false | `POST /api/v1/courses/:id/enroll`. Resend handbook/access note. Admin class list. |
| **Request notes** | Toast | `POST /api/v1/courses/:id/notes-request`. Academic officer queue. |
| **Magazine article submit** | Toast | `POST /api/v1/magazine/submissions` (+ optional file). **Moderation:** Draft not used; status `pending` → `accepted` / `rejected`. |

### 3.3 Bugs to fix while wiring the backend (small, should be in the same approval)

- Event detail uses `parseInt(eventId)` so **every URL shows Dawah 2026**. Store and look up string ids (`dawah-2026`, `past-1`).
- Past event cards are not links; they should open the detail page.
- Home Dawah “View details” should go to `/events-programs/dawah-2026`.
- Unify official email (`muis@metrouni.edu.bd` vs `muis.official@mu.edu.bd`) and Musalla location text.
- Restore missing images in `public/` (logos, event photos, magazine covers).

---

## 4. User roles (how MUIS will “manage everything”)

| Role | Who | What they can do |
|------|-----|------------------|
| **Public** | Anyone | Read site, donate (copy numbers), submit Join/Contact without an account |
| **Student** | Enrolled MU student with login | Prayer journal, personal scores, RSVP, enroll, optional blog request |
| **Blogger** | Student issued a **Blogger ID** by MUIS | Write blog drafts, edit own unpublished posts. **Cannot publish live.** |
| **Moderator** | Assigned committee | Approve/reject blogs and magazine submissions; hide reported content |
| **Treasurer** | Finance officer | Donation TrxID queue only (not other students’ prayer data) |
| **Admin** | President / GS / tech lead | Users, roles, events, courses, magazine PDFs, bloggers, site content |

**Important privacy rule for seniors:**  
**Admins must not see a student’s daily salah log, sin-avoidance notes, or personal scores.**  
Those collections are readable only by `userId === logged-in student`. Moderators see blogs; treasurers see TrxIDs; nobody browses prayer journals.

---

## 5. Admin panel + moderation (yes — use in-app moderation, not a random third-party “Moderate” product)

For a campus society, the fastest reliable approach is a **status workflow inside our admin**, not an external moderation SaaS.

**Queues in `/admin`:**

1. **Membership** — New applications → Approve / note “added to group”
2. **Messages** — Contact inbox → Mark handled
3. **Donations** — TrxID verify / reject (duplicate TrxID blocked)
4. **RSVPs & enrollments** — Lists per event/course
5. **Magazine submissions** — Accept for An-Noor / reject with reason
6. **Blogs** — `draft` → `pending_review` → `published` or `rejected` (with comment to the blogger)
7. **Content** — Create/edit events, courses, gallery, committee, FAQs
8. **Bloggers** — Issue Blogger ID, freeze a writer if needed

**Moderation states (blogs and similar):**

```text
draft  →  pending_review  →  published
                      ↘  rejected (reason emailed via Resend)
```

Optional later: comments on blogs with the same pending_review flow. Do not enable public comments in phase 1.

This is the same idea as a “moderation tool,” implemented as **our own queue**, which is cheaper, private (student data stays in MUIS MongoDB), and understandable to committee members who are not developers.

---

## 6. Official email (Resend)

Every message students receive should look official (MUIS domain when DNS is ready).

| Event | Email to student | Email to committee |
|-------|------------------|--------------------|
| Join submitted | “We received your application” | New application summary |
| Contact | “We received your message” | Full message |
| RSVP | Confirmation + optional calendar | — |
| Course enroll | Confirmation | — |
| Blog published | “Your article is live” | — |
| Blog rejected | Short reason (adab, accuracy, off-topic) | — |
| Newsletter | Confirm subscribe + unsubscribe link | — |

Do not send prayer reminders that expose private logs in the subject line. Optional later: a generic “Don’t forget today’s salah log” with no scores.

---

## 7. Proposed feature A — MUIS Blogs (knowledge, not just a brochure)

**Goal:** Students with a **Blogger ID** write; **MUIS publishes**. The site becomes a knowledge space (Seerah, campus ethics, study + deen), not only event posters.

**Flow**

1. Student applies “I want to write” *or* committee invites them.
2. Admin issues **Blogger ID** (e.g. `MUIS-BLG-2026-014`) and role `blogger`.
3. Blogger logs in → **My blogs** → write title, cover image, body, tags.
4. Submit for review (cannot set `published` themselves).
5. Moderator reads, requests edits, or publishes.
6. Published posts appear on a new public route, e.g. `/blogs` and `/blogs/[slug]`.
7. MUIS can unpublish later if needed.

**Rules to propose to seniors**

- Real name or initials: committee policy (sisters may use a kunya / first name only).
- No anonymous public attacking of persons; fiqh/fatwa posts flagged for scholar review if needed.
- Copyright: student grants MUIS permission to display the post.

This reuses the same User model and moderation queue as magazine submissions.

---

## 8. Proposed feature B — Private salah & personal development (student only)

**Goal:** A **personal** daily practice companion: salah, protecting oneself from a sin one recognized, helping someone without expecting return, and a simple “was today productive?” check. **Scores are for the student alone. Never ranked. Never shown to other students or to the committee.**

This is the opposite of a public gamification wall. If it is not private, we should not build it.

### 8.1 Why it needs login

Join/Contact can stay guest forms.  
A multi-day prayer journal **cannot**. The student must have an account so logs are encrypted at rest in MongoDB and scoped to their id.

**Recommended auth (simple and fast):** university email + password, plus student ID on first Join/profile. JWT from Express. Optional later: Google login.

### 8.2 Daily log (one document per student per date)

- **Salah (fard):** Fajr, Dhuhr, Asr, Maghrib, Isha — prayed / missed / qada (no public shame UI)
- Optional: extra worship (Tahajjud, Quran pages) — keep optional so the feature stays light
- **Self-restraint:** “I recognized something as a sin and held back” — yes/no + optional private note (only they see it)
- **Ihsan:** “I helped someone without expecting anything back” — yes/no + optional private note
- **Productivity:** short self-rate (e.g. 1–5) or yes/no “today was productive for my studies and deen”

### 8.3 Scoring (private)

Example (adjustable after senior feedback; keep numbers small so it stays a reminder, not an addiction):

| Action | Points (example) |
|--------|------------------|
| Each fard salah logged as prayed | +2 (max +10 / day) |
| Consciously avoided a recognized sin | +3 |
| Helped someone with no expected return | +3 |
| Marked the day productive | +2 |
| **Daily cap** | e.g. 18 — so missing one item is OK |

Weekly/monthly **personal** charts: consistency of salah, trend of “productive days.”  
**No leaderboard. No “top 10 muttaqin.” No sharing to Facebook.**

### 8.4 What we will *not* build here

- Public profiles of salah
- Imams/admins reading students’ sin notes
- Automated “you sinned” accusations (everything is **self-reported**)
- Payment or prizes tied to points (would encourage lying)

This feature is **amanah**: we store it only to help the student see their own progress.

---

## 9. MongoDB collections (so seniors can see the shape)

**Operations (phase 1–2)**  
`users` · `membership_applications` · `contact_messages` · `newsletter_subscribers` · `donation_confirmations` · `events` · `event_rsvps` · `courses` · `course_enrollments` · `note_requests` · `magazine_editions` · `magazine_submissions`

**Knowledge (phase 2–3)**  
`blog_posts` (author, bloggerId, slug, status, body, reviewedBy, publishedAt)

**Private journal (phase 3)**  
`daily_progress` (userId, date, salah{}, avoidedSin, helpedSomeone, productive, points, notes)  
Index: unique `(userId, date)`. Query always filter `{ userId: req.user.id }`.

**Files**  
URLs on documents; binaries in Cloudinary, not in MongoDB documents.

---

## 10. Security (what we will implement)

- Passwords hashed (bcrypt). JWT in httpOnly cookie or Authorization header.
- Server-side validation on every POST (do not trust the browser).
- Rate limits + CAPTCHA on public forms (Join, Contact, Newsletter).
- Unique `trxId` for donations.
- Role checks on every admin and blogger route.
- Prayer routes: **no admin bypass** in code (not even “just for debugging” in production).
- Secrets only in environment variables (Mongo URI, JWT secret, Resend key).
- HTTPS on Vercel + API host.

Current-site risks we are closing: fake success messages, PII stuck in `localStorage`, unrecorded donations.

---

## 11. Delivery plan (after this document is approved)

Do not build blogs and salah tracking before Join actually saves.

| Phase | Scope | Outcome seniors can test |
|-------|--------|---------------------------|
| **0** | Image restore, event ID fix, unify email/Musalla copy | Site looks complete and links work |
| **1** | Express + MongoDB + Resend + Admin login | Join, Contact, Donate TrxID, Newsletter **really stored**; committee sees them in `/admin` |
| **2** | Events/courses CRUD, RSVP, enroll, real magazine PDF | Operations match the current pages |
| **3** | Blogger IDs + blog moderation + `/blogs` | Knowledge section live |
| **4** | Student accounts + **private** daily progress | Personal salah/ihsan tracker; no public scores |

**First milestone (definition of done for Phase 1):**  
A student submits Join on a phone; the General Secretary sees that row in Admin the same day; both receive Resend email.

---

## 12. What we are asking seniors to approve

1. **Frontend stays Next.js.** No migration to a standalone React app.
2. **Backend:** **Express.js** + **MongoDB** + **Resend** + Cloudinary + Next.js `/admin`.
3. **No PostgreSQL.**
4. **Wire all existing forms** as in section 3 (honest success only after DB write).
5. **In-app moderation queues** (not a third-party Moderate SaaS).
6. **Blogs:** Blogger ID, MUIS publishes.
7. **Private prayer & character tracker:** student-only scores (salah, avoiding a known sin, helping without return, productive day). **No sharing, no admin voyeurism.**
8. **Phased build** — Phase 1 first.

---

## 13. Open points (short answers from seniors would help)

These do not block writing Phase 1, but should be decided before Phase 4:

- Official public email: `muis@metrouni.edu.bd` or `muis.official@mu.edu.bd`?
- Student login: university email only, or any email + student ID?
- Blog byline: full name vs first name / kunya for sisters?
- Is **amount** required on donation confirm, or TrxID only (as the current form)?

---

*End of proposal. Implementation starts only after approval of this document.*
