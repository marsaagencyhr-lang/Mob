# Looker Studio — Beautiful Meta Ads Dashboard Spec

Build this in Looker Studio after completing `SETUP.md`. The spec below is
designed for an agency report (one report, multiple clients via filter).

Total build time: ~45 minutes following the steps below.

---

## Theme

Open **Theme and layout** (top right) and apply:

- **Theme:** Simple Dark (or Simple Light if you prefer)
- **Accent color:** `#1877F2` (Meta blue) or your agency color
- **Font:** Inter or Roboto
- **Background:** `#0E1117` (dark) or `#F7F8FA` (light)
- **Page size:** US Letter, Landscape

Add an **8-column grid** snap to keep alignment clean: **View → Snap to grid**.

---

## Calculated fields

In the data source editor (**Resource → Manage added data sources → Edit**),
add these fields. They make the rest of the dashboard cleaner.

| Field name | Formula | Type |
|---|---|---|
| `cpa_purchase` | `spend / purchases` | Currency (USD) |
| `cpa_lead` | `spend / leads` | Currency (USD) |
| `roas_estimate` | `(purchases * 50) / spend` | Number — replace `50` with avg order value |
| `ctr_pct` | `ctr` (already a %) | Percent |

---

## Page 1 — Overview

### Header strip (row 1, full width, height ~60px)

- **Logo image** (top left) — upload your agency / client logo.
- **Title text:** `Meta Ads Performance` — 28px, bold.
- **Subtitle text (dynamic):** insert a date range control's selected range.

### Filter bar (row 2, full width, height ~50px)

Three controls side by side:

1. **Date range control** — default: Last 30 days.
2. **Drop-down filter** — field: `client`. Label: "Client". Allow multiple.
3. **Drop-down filter** — field: `campaign_name`. Label: "Campaign".

### Scorecard row (row 3, six tiles across)

Each scorecard tile, height ~110px:

| Title | Metric | Format | Comparison |
|---|---|---|---|
| Spend | `spend` SUM | Currency $ | Previous period |
| Impressions | `impressions` SUM | Compact (1.2M) | Previous period |
| Clicks | `clicks` SUM | Compact | Previous period |
| CTR | `clicks` / `impressions` | Percent | Previous period |
| Purchases | `purchases` SUM | Number | Previous period |
| CPA | `cpa_purchase` AVG | Currency $ | Previous period |

Style each scorecard:

- Background: `#1A1F2E` (dark) / white with subtle shadow (light)
- Title 12px uppercase, value 32px bold, comparison 11px

### Chart row 1 (row 4, 2 charts side by side)

**Left — Spend & Purchases over time**
- **Chart type:** Time series (combo)
- **Date dimension:** `date`
- **Metric (line):** `spend` — color `#1877F2`
- **Metric (bars, second axis):** `purchases` — color `#42B883`
- **Title:** "Daily spend vs purchases"
- **Height:** ~280px

**Right — CTR trend**
- **Chart type:** Smoothed line chart
- **Date dimension:** `date`
- **Metric:** `ctr` AVG
- **Title:** "Click-through rate"
- **Reference line:** constant 1% (industry benchmark)

### Chart row 2 (row 5, full width)

**Top campaigns table**
- **Chart type:** Table with bars
- **Dimension:** `campaign_name`
- **Metrics:** `spend`, `impressions`, `clicks`, `ctr`, `purchases`,
  `cpa_purchase`
- **Sort:** `spend` descending
- **Rows per page:** 10
- **Conditional formatting:** color the `cpa_purchase` cell green when below
  your target, red when above.

---

## Page 2 — Per-Client Breakdown

Duplicate Page 1's filter bar at the top.

### Stacked bar chart — Spend by client over time

- Date dimension: `date`
- Breakdown dimension: `client`
- Metric: `spend`
- Stacking: **Stacked**

### Pie / Donut — Spend share by client

- Dimension: `client`
- Metric: `spend`
- Style: Donut, show percentages

### Heat-map table — Client × week

- Dimension: `client`
- Date dimension: `date` (set to ISO week)
- Metric: `spend`
- Style: heat-map cell coloring

---

## Page 3 — Funnel

A simple stage-by-stage view per campaign.

Use a **bar chart** with:
- Dimension: `campaign_name`
- Metrics (multiple): `impressions`, `clicks`, `add_to_cart`, `purchases`
- Style: each metric a separate color, horizontal bars.

Add scorecards above showing rates:
- **CTR:** clicks / impressions
- **Add-to-cart rate:** add_to_cart / clicks
- **Purchase rate:** purchases / add_to_cart

---

## Polish checklist

Before sharing with clients:

- [ ] Hide the filter dropdowns showing internal fields (`account_id`,
      `campaign_id`).
- [ ] Set a sensible default date range on every page (Last 30 days).
- [ ] Add a "Last refreshed" text field: insert a text box with formula
      `Date(MAX(date))` to show how fresh the data is.
- [ ] Test the report viewed by a non-Google user via **Share → Get link →
      Anyone with the link can view**.
- [ ] Schedule email delivery: **Share → Schedule delivery** for weekly
      stakeholder emails.

---

## Sharing with clients

Two patterns work well:

1. **One report, filtered per client.** Share the same URL but use Looker
   Studio's **filter by email** feature so each client sees only their
   data. Set a viewer-level filter on `client` matched against viewer
   email (requires a small lookup tab in the Sheet).

2. **One report per client.** Use **File → Make a copy**, change the data
   source to a filtered view, share each copy individually. Simpler, but
   you maintain N reports.

---

## Free template starting points

If you'd rather start from a community template and adapt:

- Looker Studio's official gallery: https://lookerstudio.google.com/gallery
  → search "Meta Ads" or "Facebook Ads"
- **File → Make a copy** of any public template, then change its data
  source to your own Sheet.

The schema in this repo (`apps-script/Code.gs` → `HEADERS`) was designed to
match the field names commonly used in those public templates, so most
will plug in with minor remapping.
