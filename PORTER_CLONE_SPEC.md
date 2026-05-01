# Porter-style Agency Dashboard — Clone Spec

A precise, free, build-it-yourself spec for a 4-page Meta Ads agency
dashboard that mirrors Porter Metrics' layout but is designed around the
exact columns your Apps Script writes to Google Sheets. No remapping
needed — every field referenced below exists in your `meta_insights` tab.

**Time to build:** ~60 minutes following step by step.

**Result:** an agency dashboard with a multi-client overview, per-client
deep-dive, campaign funnel, and time comparison views — with the same
look and feel as Porter, Supermetrics, and Catchr's premium templates.

---

## Before you start

You should already have:

- A Google Sheet with the `meta_insights` tab populated (run
  `syncAllClients` in Apps Script first — see `SETUP.md`).
- A Looker Studio data source pointing at that tab (see `SETUP.md` Step 4).

Verify in your data source that **all 19 fields** appear:

```
date, client, account_id, account_name, campaign_id, campaign_name,
objective, impressions, reach, clicks, spend, ctr, cpc, cpm, frequency,
purchases, leads, add_to_cart, link_clicks
```

---

## Global setup

### Theme & style

**Theme and layout** (top right) → **Customize**:

| Setting | Value |
|---|---|
| Theme name | Custom — start from "Simple Dark" |
| Primary color | `#1877F2` (Meta blue) |
| Secondary color | `#42B883` (positive green) |
| Background | `#0E1117` |
| Component background | `#1A1F2E` |
| Border | `#2A2F3E` |
| Heading font | Inter Bold |
| Body font | Inter Regular |
| Border radius | 8px |
| Page size | US Letter, Landscape (1100 × 850) |

If you prefer light: swap `#0E1117` → `#F7F8FA`, `#1A1F2E` → `#FFFFFF`,
keep accent colors.

### Calculated fields (add once, reuse everywhere)

In the data source: **Resource → Manage added data sources → Edit**, click
**Add a Field** for each:

| Field name | Formula | Type / Format |
|---|---|---|
| `cpa_purchase` | `spend / purchases` | Currency USD |
| `cpa_lead` | `spend / leads` | Currency USD |
| `cost_per_atc` | `spend / add_to_cart` | Currency USD |
| `purchase_rate` | `purchases / clicks` | Percent |
| `atc_rate` | `add_to_cart / clicks` | Percent |
| `lead_rate` | `leads / clicks` | Percent |
| `roas_estimate` | `(purchases * 50) / spend` | Number — replace `50` with your client's avg order value |

Mark `spend`, `cpa_*`, `roas_estimate` as **Currency** with default
aggregation **Sum** (or **Average** for cpa/roas).

### Page layout grid

Enable **View → Snap to grid** and use a 12-column mental grid (each cell
= 90px wide). Standard heights:

- Filter bar: 50px
- KPI scorecards: 110px
- Chart panels: 280px or 380px

---

## Page 1 — Agency Overview

The "leadership view" — what you'd show on a Monday morning standup or
to clients in a portfolio review.

### Layout (top to bottom)

```
┌──────────────────────────────────────────────────────────────────┐
│  Logo    Agency Performance — Meta Ads               Last 30 Days │  ← row A: 60px
├──────────────────────────────────────────────────────────────────┤
│  [Date range]    [Client multi-select]    [Compare: prev period] │  ← row B: 50px
├──────────────────────────────────────────────────────────────────┤
│ Total Spend │ Active Clients │ Total Purchases │ Blended CPA      │  ← row C: 110px
│ Impressions │   Clicks       │     CTR         │ Blended ROAS     │  ← row D: 110px
├──────────────────────────────────────────────────────────────────┤
│  Daily Spend (line, full width)                                  │  ← row E: 280px
├─────────────────────────────────┬────────────────────────────────┤
│  Top 5 Clients by Spend         │  Bottom 5 Clients by ROAS      │  ← row F: 280px
├─────────────────────────────────┴────────────────────────────────┤
│  All Clients table (sortable)                                    │  ← row G: 380px
└──────────────────────────────────────────────────────────────────┘
```

### Row A — Header

1. **Image** (top left, 80×40): upload your agency logo (or skip).
2. **Text** (centered): `Agency Performance — Meta Ads`. 24px Inter Bold,
   color `#FFFFFF`.
3. **Text** (right): insert a **Date range control's selected range**
   (Insert → Date range, then style → "Show selected range"). 14px,
   color `#A0A8B5`.

### Row B — Filter bar

Three controls, equal width across full row:

1. **Date range control**
   - Default: Last 30 days
   - Comparison: Previous period

2. **Drop-down list (filter)**
   - Field: `client`
   - Label: "Client"
   - Allow multiple selection: **Yes**
   - Search: **Yes**
   - Style: white text on `#1A1F2E`, dropdown icon `#1877F2`

3. **Drop-down list (filter)**
   - Field: `objective`
   - Label: "Campaign Objective"
   - Allow multiple selection: **Yes**

### Row C + D — KPI scorecards (8 tiles, 2 rows of 4)

Each scorecard: width 270px, height 110px. Same style:

- Background: `#1A1F2E`
- Border: `1px solid #2A2F3E`, radius 8px
- Title: 11px uppercase, color `#A0A8B5`, top-left
- Primary metric: 28px Inter Bold, color `#FFFFFF`, center
- Comparison: 12px, color green if up / red if down

| # | Title | Metric | Aggregation | Format | Compare |
|---|---|---|---|---|---|
| C1 | TOTAL SPEND | `spend` | Sum | $1.2K | Previous period |
| C2 | ACTIVE CLIENTS | `client` | Count distinct | Number | Previous period |
| C3 | TOTAL PURCHASES | `purchases` | Sum | Number | Previous period |
| C4 | BLENDED CPA | `cpa_purchase` | Sum spend ÷ Sum purchases | $0.00 | Previous period |
| D1 | IMPRESSIONS | `impressions` | Sum | 1.2M (compact) | Previous period |
| D2 | CLICKS | `clicks` | Sum | 1.2K (compact) | Previous period |
| D3 | BLENDED CTR | `clicks / impressions` | — | Percent (2 decimals) | Previous period |
| D4 | BLENDED ROAS | `roas_estimate` | Average | 0.00x | Previous period |

> **Tip for blended metrics (C4, D3):** create a calculated field
> `blended_cpa = SUM(spend) / SUM(purchases)` directly on the scorecard
> rather than averaging row-level `cpa_purchase` — avoids skew from
> low-volume rows.

### Row E — Daily spend trend (full width)

- **Chart type:** Time series
- **Date dimension:** `date`
- **Breakdown dimension:** `client` (so you see lines per client)
- **Metric:** `spend` SUM
- **Style:**
  - Line type: Smooth
  - Line thickness: 2
  - Show points: No
  - Color palette: Custom — pick 5–8 distinct colors that read well on dark bg
  - Y-axis: Currency, compact format
  - Legend: bottom, horizontal
  - Title: "Daily spend by client"

### Row F — Top/bottom client comparisons

**Left chart — Top 5 clients by spend**
- **Chart type:** Bar chart (horizontal)
- **Dimension:** `client`
- **Metric:** `spend` SUM
- **Sort:** spend descending
- **Rows limit:** 5
- **Bar color:** `#1877F2`
- **Show data labels:** Yes (currency, compact)
- **Title:** "Top 5 clients by spend"

**Right chart — Bottom 5 clients by ROAS**
- **Chart type:** Bar chart (horizontal)
- **Dimension:** `client`
- **Metric:** `roas_estimate` AVG
- **Sort:** roas_estimate ascending
- **Rows limit:** 5
- **Bar color:** `#E94B4B` (warning red)
- **Show data labels:** Yes (`0.00x`)
- **Title:** "Bottom 5 clients by ROAS — needs attention"

### Row G — All clients table

- **Chart type:** Table
- **Dimension:** `client`
- **Metrics (in order):** `spend`, `impressions`, `clicks`, `ctr`,
  `purchases`, `cpa_purchase`, `roas_estimate`
- **Sort:** spend descending
- **Rows per page:** 25
- **Style:**
  - Show summary row: Yes (totals at bottom)
  - Wrap text: No
  - Bar visualization: Yes for `spend` column (in-cell bar, color `#1877F2`)
  - Heatmap: Yes for `cpa_purchase` (red high → green low)
  - Heatmap: Yes for `roas_estimate` (red low → green high)
- **Title:** "All clients — click any column to sort"

---

## Page 2 — Per-Client Performance

Pick a single client → see their detail.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Header: "Client Performance"          [breadcrumb back to P1]   │
├──────────────────────────────────────────────────────────────────┤
│  [Date range]  [Client SINGLE-SELECT, REQUIRED]  [Objective]     │
├─────────────┬─────────────┬─────────────┬───────────────────────┤
│   Spend     │ Purchases   │     CPA     │      ROAS             │
├──────────────────────────────────────────────────────────────────┤
│  Daily spend & purchases (combo chart, full width)               │
├──────────────────────────────────────────────────────────────────┤
│  Campaign performance table                                      │
├─────────────────────────────────┬────────────────────────────────┤
│  Spend by objective (donut)     │  CTR trend (line)              │
└─────────────────────────────────┴────────────────────────────────┘
```

### Filter bar — make `client` filter REQUIRED

The `client` dropdown on this page should be set to **Single select**
(Allow multiple = No) and you'll set a default value so the page always
shows a real client.

### Scorecards (4 tiles)

Same style as Page 1, all metrics filtered to the selected client:

| Title | Metric | Format |
|---|---|---|
| Spend | `spend` SUM | Currency |
| Purchases | `purchases` SUM | Number |
| CPA | `spend / purchases` | Currency |
| ROAS | `roas_estimate` | 0.00x |

### Daily spend & purchases combo chart

- **Chart type:** Time series (combo)
- **Date dimension:** `date`
- **Metric (bars, left axis):** `spend` SUM, color `#1877F2`
- **Metric (line, right axis):** `purchases` SUM, color `#42B883`
- **Title:** "Spend (bars) vs purchases (line)"

### Campaign performance table

- **Dimension:** `campaign_name`
- **Metrics:** `spend`, `impressions`, `clicks`, `ctr`, `purchases`,
  `add_to_cart`, `cpa_purchase`
- **Sort:** spend descending
- **Bar visualization:** on `spend` column
- **Conditional formatting:** `cpa_purchase` cell — red if > $50, green
  if < $25 (adjust thresholds to your business)

### Spend by objective (donut)

- **Chart type:** Donut chart
- **Dimension:** `objective`
- **Metric:** `spend` SUM
- **Style:** Show percentages, legend on right

### CTR trend (line)

- **Chart type:** Time series (smoothed line)
- **Date dimension:** `date`
- **Metric:** `clicks / impressions` (percent)
- **Reference line:** constant 1.0% (industry avg)
- **Title:** "Click-through rate over time"

---

## Page 3 — Campaign Funnel & Deep-Dive

For a single campaign — diagnose what's working, what's not.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Header: "Campaign Deep-Dive"                                    │
├──────────────────────────────────────────────────────────────────┤
│  [Date]  [Client]  [Campaign SINGLE-SELECT, REQUIRED]           │
├──────────────────────────────────────────────────────────────────┤
│  Funnel: Impressions → Clicks → ATC → Purchases (horizontal bar) │
├─────────────┬─────────────┬─────────────┬───────────────────────┤
│  CTR        │  ATC rate   │ Purch. rate │  Frequency             │
├──────────────────────────────────────────────────────────────────┤
│  Daily metric stack (impressions, clicks, purchases)             │
└──────────────────────────────────────────────────────────────────┘
```

### Funnel chart

- **Chart type:** Bar chart (horizontal, single dimension on Y)
- **Dimension:** synthetic — create a calculated field if you want a
  proper funnel, or use the simpler approach:
- **Simpler approach:** Use a **Bar chart with multiple metrics**
  - Dimension: `campaign_name` (filtered to one)
  - Metrics: `impressions`, `clicks`, `add_to_cart`, `purchases`
  - Chart will show 4 bars side-by-side — visually a funnel since each
    is smaller than the last
  - Bar colors gradient: `#1877F2` → `#42B883`
- **Title:** "Funnel — Impressions to Purchases"

### Conversion-rate scorecards

| Title | Formula | Format |
|---|---|---|
| CTR | `clicks / impressions` | Percent |
| ATC rate | `add_to_cart / clicks` | Percent |
| Purchase rate | `purchases / clicks` | Percent |
| Avg frequency | `frequency` AVG | 0.00 |

### Daily metric stack

- **Chart type:** Time series (stacked area or stacked column)
- **Date dimension:** `date`
- **Metrics (stacked):** `impressions`, `clicks`, `purchases`
- **Style:** Stacked area, semi-transparent
- **Title:** "Daily activity — full funnel"

---

## Page 4 — Time Comparison

Period-over-period analysis.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Header: "Period Comparison"                                     │
├──────────────────────────────────────────────────────────────────┤
│  [Period A: This month]   [Period B: Last month]   [Client]     │
├──────────────────────────────────────────────────────────────────┤
│  Comparison scorecards (6 tiles with delta arrows)               │
├──────────────────────────────────────────────────────────────────┤
│  WoW spend (bar chart, week-over-week)                           │
├──────────────────────────────────────────────────────────────────┤
│  MoM heatmap (client × month, spend)                             │
└──────────────────────────────────────────────────────────────────┘
```

### Comparison scorecards (6 tiles, 1 row)

Use Looker Studio's **Comparison** feature on each scorecard. Set the
date-range comparison to "Previous period" or "Previous year".

| Title | Metric |
|---|---|
| Spend | `spend` SUM |
| Purchases | `purchases` SUM |
| CPA | `spend / purchases` |
| ROAS | `roas_estimate` AVG |
| CTR | `clicks / impressions` |
| Frequency | `frequency` AVG |

Style each tile with:
- Big number top
- Comparison delta below in green (improved) or red (worsened)
- Arrow icon

### Week-over-week spend (bar chart)

- **Chart type:** Column chart
- **Date dimension:** `date` (set granularity to **ISO week**)
- **Metric:** `spend` SUM
- **Sort:** date ascending
- **Bar color:** `#1877F2`
- **Title:** "Weekly spend"

### Month-over-month heatmap

- **Chart type:** Table with heatmap
- **Dimension (rows):** `client`
- **Date dimension (columns):** `date` (set to month — use Pivot table)
- **Use a pivot table** for client × month layout
- **Metric:** `spend` SUM
- **Style:** heatmap coloring on metric cells, dark blue → bright blue
- **Title:** "Monthly spend by client"

---

## Polish checklist

Before sharing:

- [ ] Page 1 is the default landing page (drag it to position 1 in the
      page list).
- [ ] Every page has the same filter bar at the top (copy-paste filter
      controls between pages, then **Make report-level** so they apply
      across all pages).
- [ ] Date range default = Last 30 days everywhere.
- [ ] Every chart has a clear title and units in axes labels.
- [ ] Add a "Last refreshed" text in page footer:
      `MAX(date)` from the data source.
- [ ] Test the report by opening in **View mode** (top right) — make
      sure no filters break.
- [ ] Add a footer text with your agency name + a small "Powered by
      [your sheet name]" or similar.

## Sharing with clients

### Pattern 1 — Single report, filtered per client (best for you)

1. Create a small lookup tab in your Sheet: `client_emails`
   ```
   client       | email
   Almazan      | client@almazan.com
   Other Co     | someone@other.co
   ```
2. **Resource → Manage data sources → Add data source** → connect that
   tab.
3. **Resource → Manage filters → Filter by viewer email**:
   - Filter `client` where viewer email matches `email` in the lookup.
4. Share the report URL with each client. Looker Studio shows them only
   their own row.

### Pattern 2 — Separate report per client (simpler)

For each client:
1. **File → Make a copy**.
2. Add a permanent filter on `client` = "ClientName".
3. Share that copy with that client only.

### Pattern 3 — PDF email digest

**Share → Schedule delivery** → weekly PDF to client email. Free,
zero touch from then on.

---

## Final tips

- **Build Page 1 first**, fully polish it, then duplicate it twice and
  modify for Pages 2 and 3 — saves hours vs. building from scratch.
- **Save as theme** once Page 1's colors look right (Theme and layout →
  Save as custom theme) — applies to all new charts.
- **Use sections** (Insert → Shape → Rectangle behind chart groups) to
  visually group related charts. This is what gives Porter/Supermetrics
  templates that "designed" feel.
- **Hover-tooltip text:** for any chart, Setup tab → "Optional metrics"
  → add helpful context fields that show on hover.

That's the whole template. Build it once, copy it for every new client,
done.
