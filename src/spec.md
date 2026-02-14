# Specification

## Summary
**Goal:** Provide a per-user job tracking app that lets users store their resume/cover letter and manual location, add jobs, score job-to-resume matches with explanations, and manage an application workflow per job.

**Planned changes:**
- Add authenticated per-user storage (Internet Identity) for resume text, cover letter text, and manual location (city/region + optional radius).
- Create CRUD for job entries (title, company, location text, job description, optional application URL) plus jobs list search (title/company).
- Implement deterministic matching/scoring between resume text and each job description, including a numeric score and matched keywords/phrases; enable sorting by score.
- Add a location filter toggle that filters jobs by case-insensitive substring match of job location text against the user’s location string.
- Build an apply flow per job that shows resume + an editable cover letter draft, supports saving a draft, and marking the job as Applied with stored status/timestamps.
- If an application URL is present, add a “Go to Application” action that opens in a new tab and records an “opened application link” event/timestamp.
- Apply a consistent, responsive productivity-style visual theme across core screens (not primarily blue/purple).

**User-visible outcome:** Users can sign in, save and edit their resume/cover letter and location, add and manage jobs, view match scores with keyword explanations, filter/sort jobs, draft applications per job, mark jobs as applied with history, and open application links while the app records that action.
