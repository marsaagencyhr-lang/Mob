# Setup — Free Meta Ads → Looker Studio Dashboard

End result: a daily-refreshing Looker Studio dashboard pulling Meta Ads data
from one or more client ad accounts, using only free tools.

```
Meta Ads Manager  →  Apps Script (free)  →  Google Sheet (free)  →  Looker Studio (free)
```

Total setup time: ~30 minutes the first time.

---

## Step 1 — Get Meta API access

You need a long-lived access token that can read your clients' ad accounts.
The official, free, scalable way is a **System User token** in Meta Business
Manager.

### 1a. Create a Meta Developer App

1. Go to https://developers.facebook.com/ → **My Apps** → **Create App**.
2. Use case: **Other** → type: **Business**.
3. Note your **App ID** and **App Secret** (Settings → Basic).

### 1b. Connect clients to your Business Manager

For each client:

1. In **Business Manager** → **Business Settings** → **Partners** → **Add**
   → **Request access to a client's assets**, send your Business Manager ID.
2. The client approves and shares their ad account with you.
3. You'll now see their ad account under **Accounts → Ad Accounts**.

### 1c. Create a System User and token

1. **Business Settings** → **Users** → **System Users** → **Add**.
2. Name it (e.g. "Reporting Bot"), role: **Employee**.
3. Click **Add Assets** → assign every client ad account, role **View
   performance**.
4. Click **Generate New Token**:
   - App: select the app from Step 1a
   - Token expiration: **Never**
   - Scopes: `ads_read`, `business_management`, `read_insights`
5. **Copy the token immediately** — it's shown only once.

### 1d. Note each client's ad account ID

In Ads Manager, the URL contains `act=1234567890`. Keep a list:

```
Client A  →  act_1234567890
Client B  →  act_9876543210
```

---

## Step 2 — Create the Google Sheet

1. Go to https://sheets.google.com → **Blank**.
2. Rename it (e.g. "Meta Ads Data").
3. Keep this tab open — you'll need it for the next step.

---

## Step 3 — Install the Apps Script

1. In your Sheet, click **Extensions → Apps Script**. A script editor opens.
2. Delete the placeholder `Code.gs` content.
3. Open `apps-script/Code.gs` in this repo, copy everything, paste into the
   editor.
4. Click the **gear icon (Project Settings)** in the left sidebar.
5. Scroll to **Script Properties** → **Add script property**:
   - Name: `META_ACCESS_TOKEN`
   - Value: paste the System User token from Step 1c
6. Save.

### 3a. Add your clients

Back in the editor, edit the `CLIENT_ACCOUNTS` array near the top:

```javascript
const CLIENT_ACCOUNTS = [
  { name: 'Client A', adAccountId: 'act_1234567890' },
  { name: 'Client B', adAccountId: 'act_9876543210' },
];
```

### 3b. Test the token

1. In the function dropdown at the top, select **`testToken`**.
2. Click **Run**. The first run will ask you to authorize — accept all
   prompts (Google will warn about an unverified app; that's normal for
   personal scripts → click **Advanced → Go to Project (unsafe)**).
3. Click **Execution log** at the bottom — you should see your ad accounts
   listed. If you see an error about token/permissions, revisit Step 1.

### 3c. First sync

1. Function dropdown → **`syncAllClients`** → **Run**.
2. Wait 10–60 seconds depending on data volume.
3. Switch back to your Sheet — you'll see a new tab `meta_insights` with
   your data.

### 3d. Schedule daily refresh

1. Function dropdown → **`installDailyTrigger`** → **Run**.
2. From now on it auto-runs every day around 3am.

---

## Step 4 — Connect the Sheet to Looker Studio

1. Go to https://lookerstudio.google.com → **Create → Data source**.
2. Pick **Google Sheets** → select your Sheet → tab `meta_insights` → use
   first row as headers → **Connect**.
3. On the field schema page, set field types:
   - `date` → **Date** (YYYY-MM-DD)
   - `client`, `account_name`, `campaign_name`, `objective` → **Text**
   - everything numeric (`impressions`, `clicks`, `spend`, `purchases`, …) →
     **Number**
   - `spend` → set **Default aggregation** to **Sum**, **Type** to
     **Currency (USD)**
4. Click **Create Report**.

You now have a live Looker Studio report wired to your Meta data.

To build the actual dashboard, follow `LOOKER_STUDIO_GUIDE.md`.
