# Free Meta Ads → Looker Studio Dashboard

A 100%-free pipeline that pulls Meta Marketing API data from your client
ad accounts into Google Sheets, ready to dashboard in Looker Studio.

```
Meta Ads Manager  →  Apps Script  →  Google Sheet  →  Looker Studio
```

No servers, no paid connectors, no Python — everything runs inside your
Google account.

## Files

- `apps-script/Code.gs` — paste into Google Apps Script. Pulls campaign-
  level insights from Meta Marketing API into your Sheet daily.
- `apps-script/appsscript.json` — Apps Script manifest (timezone, scopes).
- `SETUP.md` — step-by-step setup for Meta token, Apps Script, and Sheets.
- `PORTER_CLONE_SPEC.md` — chart-by-chart spec for a 4-page agency
  dashboard mirroring Porter Metrics' premium template, designed around
  this repo's Sheet schema (no field remapping needed).

## Quick start

1. Read `SETUP.md` and follow it end to end (~30 min).
2. Once data lands in your Sheet, follow `PORTER_CLONE_SPEC.md` to build
   the dashboard (~60 min).

## Cost

Free, within these limits:

- **Apps Script:** 6 min/execution, 90 min/day, 20,000 URL fetches/day —
  enough for ~50 client accounts at daily refresh.
- **Google Sheets:** 10M cells per Sheet — ~30,000 daily campaign rows.
- **Looker Studio:** unlimited reports and viewers.
- **Meta Marketing API:** free, rate limits depend on your app's tier.
