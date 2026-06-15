# Phase 4 — Contract Restrictions: Requirements

**Phase:** 4
**Date:** 2026-06-15
**Branch:** `phase-4-contract-restrictions`
**Depends on:** Phase 1 (User model, restrictions JSONB column), Phase 2 (seed user id=1), Phase 3 (preferences pattern)

---

## Scope

Add `GET /api/profile/restrictions` and `PUT /api/profile/restrictions`. Restrictions are validated against a Pydantic schema before saving. The Profile page gains a contract restrictions form below the preferences section that persists across page reloads.

---

## Backend Deliverables

### Pydantic schema — `Restrictions`

Defined in `app/schemas/restrictions.py`. All fields are Optional so a partial PUT merges cleanly.

| Field | Type | Description |
|---|---|---|
| `current_client` | `str \| None` | End-client of the current active contract |
| `current_vendor` | `str \| None` | Staffing vendor/agency of the current contract |
| `restricted_clients` | `list[str] \| None` | End-clients that are contractually off-limits |
| `restricted_vendors` | `list[str] \| None` | Staffing vendors that are contractually off-limits |
| `noncompete_industries` | `list[str] \| None` | Industries prohibited by non-compete clause |
| `noncompete_locations` | `list[str] \| None` | Geographies prohibited by non-compete clause |
| `contract_end_date` | `str \| None` | ISO date (YYYY-MM-DD) when the current contract ends |

Unknown fields are rejected (`model_config = ConfigDict(extra="forbid")`).

### Endpoint: `GET /api/profile/restrictions`
- Returns `200` with the current `Restrictions` object (deserialised from `users.restrictions` JSONB)
- Returns `200 {}` (empty object) if no restrictions have been saved yet — never 404 or 500
- Null fields excluded from response (`response_model_exclude_none=True`)

### Endpoint: `PUT /api/profile/restrictions`
- Accepts a `Restrictions` JSON body (all fields optional)
- Merges the incoming fields into existing restrictions (fields not sent are preserved)
- Saves the merged result back to `users.restrictions` as JSONB
- Returns `200` with the full merged restrictions object (nulls excluded)

---

## Frontend Deliverables

### Contract restrictions form on Profile page

Added as a new section below the preferences form in `Profile.jsx`.

**Fields:**
- Current client — text input
- Current vendor — text input
- Restricted clients — comma-separated text input (stored as array)
- Restricted vendors — comma-separated text input (stored as array)
- Non-compete industries — comma-separated text input (stored as array)
- Non-compete locations — comma-separated text input (stored as array)
- Contract end date — HTML date input (stored as YYYY-MM-DD string)

**Behaviour:**
- On mount: `GET /api/profile/restrictions` pre-populates all fields
- "Save Restrictions" button: `PUT /api/profile/restrictions` with current form state
- While saving: button disabled, shows "Saving..."
- On success: brief "Saved" confirmation replaces the button text for 2 seconds
- On error: inline error message below the button

**New hook:** `frontend/src/hooks/useRestrictions.js`
- `GET /api/profile/restrictions` on mount
- `saveRestrictions(data)` function: `PUT /api/profile/restrictions`
- Returns `{ restrictions, saveRestrictions, saving, saveError }`

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Schema fields | Separate fields for all 4 conflict categories | Maps 1:1 to the conflict_detection_node categories (Phase 13) |
| Partial PUT | Yes — merge into existing | Consistent with preferences pattern; allows incremental updates |
| Storage | `users.restrictions` JSONB (Phase 1) | Already defined; no migration needed |
| Empty restrictions | Return `{}`, not null | Frontend can always treat the response as an object |
| contract_end_date format | ISO string YYYY-MM-DD | Simple, sortable, directly usable in HTML date input |

---

## Out of Scope
- Conflict detection logic (Phase 13)
- Restriction expiry notifications
- Multiple contract slots (single active contract per user)
