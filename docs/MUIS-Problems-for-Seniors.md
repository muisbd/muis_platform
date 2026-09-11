# MUIS Website — Problems & Questions for Seniors

**Purpose:** Written list of what is still unclear or unfinished, what is already working, and decisions we need from seniors.  
**Please answer the questions at the end in writing** so development can follow one clear rule.

---

## A. What is already working (fixed)

These used to be fake (toast only). They now save on MUIS servers (MongoDB) and show in **Admin**.

1. **Join form** — applications are stored. Staff can Approve / mark in WhatsApp group / Reject.
2. **Contact form** — messages go to Admin → Messages.
3. **Donate TrxID** — treasurer can Verify / Reject (we do not auto-check bKash).
4. **Newsletter** — emails are stored.
5. **Event RSVP** — name/email saved (this is only “I might come”, **not** a ticket).
6. **Course enroll** and **request notes** — saved in Admin.
7. **Magazine article submit** — saved for editorial review.
8. **Event links** — `dawah-2026` and past events open the correct page (old bug: every event showed Dawah).
9. **Home “View details”** goes to the Dawah event page.
10. **Login / Register** — students can create an account (JWT). Staff use Admin.
11. **Private salah journal** (`/progress`) — only that student can see it. Admin cannot.
12. **Blogs** — writer drafts; MUIS publishes. Writer cannot self-publish.
13. **API + database** — Express + MongoDB Atlas. Email (Resend) and files (Cloudinary) work only if keys are set.

---

## B. The big confusion (not solved on the website)

**The site never explains three different things:**

| Word | What it should mean (proposal) |
|------|--------------------------------|
| **Visitor** | Anyone reading the public pages. No login. |
| **User (account)** | Login with name + email + password. **Not** a MUIS member. |
| **MUIS member** | User who filled **Join** and staff **approved**. |
| **Event registrant** | User who applied for an **event** and staff approved a **ticket**. |

**Today the website does the opposite / mix:**

- Join does **not** require login. Anyone can apply without an account.
- After login, the site does **not** say what the account is for.
- Courses can be enrolled **without** being a member.
- Salah journal and blogs are available to **any** logged-in user, not only members.
- Event “RSVP” is not membership and not an approved ticket. Easy to mix with Join.
- Header after login (Admin / name menu) is unclear for a normal student.

Students and even committee cannot tell: *Did I join MUIS, or did I only make a login, or did I only RSVP?*

---

## C. Proposed rule (for seniors to accept or change)

This is the rule we want to follow if seniors agree:

1. **Anyone** may create a **user account** (email + password + name). That does **not** make them a MUIS member.
2. To become a **member**, they must be **logged in**, then submit **Join**. Staff approve in Admin.
3. **Approved members** may use member features (example: **courses**, notes, maybe journal / write blog — seniors decide).
4. **Non-members** (account only) may still **register for public events** (Dawah, etc.) after we build tickets.
5. **Non-members** should **not** get member-only features (courses and other locked tools).
6. **Guest** (no account) may still read the brochure: Home, About, events info, donate copy, contact info.

**This rule is not built yet.** Seniors must confirm it.

---

## D. Other problems that are not clearly solved

### 1. Login & registration (product / wording)

- No page text: “This login is not MUIS membership.”
- No “forgot password”.
- No “verify university email” (any email can register today).
- After Join success we only *suggest* creating an account. Join and account are not connected.

### 2. Events (product)

- Flagship event still uses simple **RSVP** (no approval, no ticket, no QR, no attendance/food scan).
- Professional event flow (apply → approve → QR ticket → scan attendance/food) is **designed, not built**.
- Event updates to registered students (email from MUIS) are not a staff tool yet.

### 3. Courses & magazine

- Courses are open to anyone who fills the enroll form (no member check).
- Magazine **Download PDF** is not a real file until staff paste a Cloudinary URL in Admin.
- Many photos/logos in `public/` are still missing (broken images).

### 4. Admin

- Approve on Join does **not** add anyone to WhatsApp. Staff must add them by hand, then click “in WhatsApp group”.
- Approve does **not** create or upgrade their website login.
- Treasurer, moderator, admin roles exist in code, but there is no simple guide for officers: who clicks what.
- Admin still sits on the same public website (same header/footer). Looks like a normal page, not a desk.

### 5. Privacy & extra features

- Salah journal exists. Need seniors to confirm: keep it, members only, or remove from the public site.
- Blogs: who may request a Blogger ID? Any user, or members only?
- Personal notes on “avoided a sin” are private in code. Confirm this stays **never** visible to admin.

### 6. Official information (copy)

- Two emails exist in old material (`muis@metrouni.edu.bd` vs another). Site now uses `muis@metrouni.edu.bd` in most places — confirm this is official.
- Musalla location text should be one official line (Building B, Room 304 is what the FAQ says).
- Donate numbers are public on purpose (bKash + NRBC). Confirm they are still correct.

### 7. Technical / operations (for tech seniors)

- Website and API are **two programs**. If API is down, Join shows “Cannot reach the MUIS server.”
- Emails skip silently if Resend domain is not verified.
- File upload needs Cloudinary.
- No CAPTCHA on public forms (spam risk).
- Same person can submit Join more than once.
- No “My applications / My tickets” page for the student.

---

## E. What we should **not** mix

Please do not treat these as the same button:

- **Donate** = money confirmation (TrxID).  
- **Join** = society membership.  
- **Register / Login** = website account.  
- **RSVP / Event register** = that event only.  
- **Enroll in course** = class list (should this be members only?).  
- **Progress** = private deen log, not a MUIS activity report.

---

## F. Questions for seniors (please write answers)

Copy this block, fill in, send back.

**1. Account vs member**  
Do you accept: anyone can create a login, but they are a **MUIS member** only after Join + Approve?  
Answer: Yes / No / Change: ________

**2. Must they log in before Join?**  
Should Join be **blocked** until they have an account?  
Answer: Yes / No

**3. University email only?**  
Login allowed for: any email / `@metrouni.edu.bd` only / either + Student ID required  
Answer: ________

**4. Who may register for a big event (e.g. Dawah)?**  
Any logged-in user / only approved members / guests without login  
Answer: ________

**5. Who may enroll in courses / request notes?**  
Any user / only approved members / guests  
Answer: ________

**6. Salah journal (`/progress`)**  
Keep for all users / members only / remove from website  
Answer: ________

**7. Blogs**  
Who may write: any user after Blogger ID / members only / committee only  
Answer: ________

**8. Event tickets (QR, attendance, food scan)**  
Build for Dawah 2026? Yes / Not this year / Later  
Answer: ________

**9. After Join is approved, what should happen?**  
Only status in Admin / also email “you are a member” / also add to WhatsApp (manual) / auto anything?  
Answer: ________

**10. Official public email and phone**  
Email: ________  
Phone: ________  
Musalla location (one sentence): ________

**11. Donate accounts**  
bKash and NRBC numbers on the site are still correct? Yes / No (send new numbers)

**12. Who are the Admin / Moderator / Treasurer accounts?**  
Names + emails (we should not keep the default password): ________

**13. Guest Contact / Newsletter / Donate**  
Stay open with no login? Yes / No

**14. Anything that must stay public with no account?**  
List: ________

---

## G. One-line summary for the meeting

**Working:** forms save; Admin can see Join/Contact/Donate; login exists; event pages link correctly.  
**Not clear on the site:** what a “user” is vs a “member”, what login is for, who may use courses vs events.  
**Not built yet:** member-only locks, Join-after-login, event QR tickets and scanning.  
**We need written answers to section F** before we change access rules.

---

*Prepared for MUIS executive discussion. Technical stack stays Next.js website + Express API + MongoDB.*
