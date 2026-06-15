# JobSense AI — Mission

**Version:** 1.0
**Date:** 2026-06-14

---

## Why This Exists

Job seekers in technical contract and full-time roles receive recruiter outreach constantly — across email, LinkedIn, and referrals — and have no intelligent system to manage it. The manual process of reading every email, assessing fit, checking contract conflicts, and tracking follow-ups is error-prone and time-consuming. Worse, missing a contract clause (same end-client, non-compete geography) can have real legal consequences.

JobSense exists to fix this with a personal AI agent that works in the background: ingesting opportunities, scoring fit, flagging risks, and surfacing what matters — so the job seeker can focus on decisions, not administration.

---

## What It Does

JobSense is a self-hosted, open source career management assistant. It:

- **Auto-ingests** recruiter emails via Gmail MCP and surfaces structured job details
- **Scores fit** against the user's resume on a 1–10 scale with a plain-language explanation
- **Detects contract conflicts** across four categories: same end-client, same staffing vendor, non-compete by industry, non-compete by geography
- **Tracks the full pipeline** from discovery through offer, with a kanban-style board
- **Generates tailored cover letters** on demand — user reviews and submits manually
- **Discovers new opportunities** proactively via Brave Search based on user preferences
- **Suggests improvements** to skills, resume keywords, and interview preparation
- **Observes itself** — every agent decision is logged, explained, and traceable

---

## Target User

A single technical professional (engineer, consultant, contractor) who:

- Receives regular recruiter outreach via email
- Has an active contract with specific client or vendor restrictions
- Tracks multiple job opportunities simultaneously
- Wants AI assistance without handing over control of their career decisions
- Is comfortable self-hosting a web app with environment variables

JobSense is a personal tool. It is designed and optimized for one user per deployment.

---

## North-Star Outcomes

| Outcome | Signal |
|---|---|
| Zero missed conflicts | Every job flagged for contract risk before the user acts on it |
| Fit scores that predict outcomes | User feedback shows scores correlate with interview/offer rates over time |
| Full pipeline visibility | User can see every opportunity and its current status at a glance |
| Time reclaimed | No manual tracking in spreadsheets or email threads |
| Explainable AI | User can always see why the agent made a recommendation |

---

## Guiding Principles

1. **Human in control.** The agent recommends. The user decides. Nothing is submitted or scheduled without explicit user action.
2. **Conflict detection is non-negotiable.** No job reaches the user's attention without first being checked against their contract restrictions.
3. **Explainability over magic.** Every score, flag, and suggestion includes a plain-language reason.
4. **Privacy by default.** All data lives in the user's own PostgreSQL instance. No telemetry, no third-party analytics.
5. **Evaluation first.** Observability is built from day one, not bolted on at the end.
6. **Open source, not demo-ware.** The code is clean, documented, and welcoming to contributors.

---

## What This Is Not

- Not a multi-tenant SaaS (single user per deployment; multi-tenant is a future milestone)
- Not an auto-apply bot (cover letters are generated, but the user submits manually)
- Not a resume builder (it reads and parses your existing resume)
- Not a job board (it aggregates from Gmail and Brave Search, it does not host listings)
