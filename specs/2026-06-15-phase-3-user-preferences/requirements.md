# Phase 3 — User Preferences: Requirements

**Phase:** 3
**Date:** 2026-06-15
**Branch:** `phase-3-user-preferences`
**Depends on:** Phase 1 (User model, preferences JSONB column), Phase 2 (seed user id=1)

---

## Scope

Add `GET /api/profile/preferences` and `PUT /api/profile/preferences`. Preferences are validated against a Pydantic schema before saving. The Profile page gains a preferences form that persists across page reloads.

---

## Backend Deliverables

### Pydantic schema — `Preferences`

Defined in `app/schemas/preferences.py`. All fields are Optional so a partial PUT merges cleanly into existing preferences.

| Field | Type | Values |
|---|---|---|
| `target_titles` | `list[str] \| None` | e.g. `["Senior Engineer", "Staff Engineer"]` |
| `employment_types` | `list[EmploymentTypeEnum] \| None` | `fte`, `contract`, `contract_to_hire`, `part_time` |
| `remote_preference` | `RemoteEnum \| None` | `remote`, `hybrid`, `onsite` |
| `target_locations` | `list[str] \| None` | e.g. `["New York", "Remote"]` |
| `salary_min` | `int \| None` | Annual salary floor in USD |
| `salary_max` | `int \| None` | Annual salary ceiling in USD |
| `target_industries` | `list[str] \| None` | |
| `target_skills` | `list[str] \| None` | Skills the user wants to work with |

Unknown fields are rejected (`model_config = ConfigDict(extra="forbid")`).

### Endpoint: `GET /api/profile/preferences`
- Returns `200` with the current `Preferences` object (deserialised from `users.preferences` JSONB)
- Returns `200 {}` (empty object) if no preferences have been saved yet — never 404 or 500

### Endpoint: `PUT /api/profile/preferences`
- Accepts a `Preferences` JSON body (all fields optional)
- Merges the incoming fields into existing preferences (fields not sent are preserved)
- Saves the merged result back to `users.preferences` as JSONB
- Returns `200` with the full merged preferences object

---

## Frontend Deliverables

### Preferences form on Profile page

Added as a new section below the resume upload section in `Profile.jsx`.

**Fields:**
- Target titles — comma-separated text input (stored as array)
- Employment types — multi-checkbox: FTE, Contract, Contract-to-hire, Part-time
- Remote preference — radio: Remote / Hybrid / Onsite
- Target locations — comma-separated text input
- Salary min / max — number inputs (USD)
- Target industries — comma-separated text input
- Target skills — comma-separated text input

**Behaviour:**
- On mount: `GET /api/profile/preferences` pre-populates all fields
- "Save Preferences" button: `PUT /api/profile/preferences` with current form state
- While saving: button disabled, shows "Saving..."
- On success: brief "Saved" confirmation replaces the button text for 2 seconds
- On error: inline error message below the button

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Schema validation | Pydantic with `extra="forbid"` | Catches typos and frontend bugs early; keeps JSONB data clean |
| Partial PUT | Yes — merge into existing | Allows the form to send only changed fields without wiping others |
| Storage | `users.preferences` JSONB (Phase 1) | Already defined; no migration needed |
| Empty preferences | Return `{}`, not null | Frontend can always treat the response as an object |

---

## Out of Scope
- Contract restrictions (Phase 4)
- Skills profiling beyond `target_skills`
- Company blacklist / target company lists
