/**
 * Meta Marketing API → Google Sheets sync
 *
 * Pulls campaign-level insights for one or more client ad accounts and
 * writes them to tabs in the active Google Spreadsheet.
 *
 * Connect the resulting Sheet to Looker Studio for dashboarding.
 *
 * Setup: see SETUP.md in the repo root.
 */

// ---------- CONFIG ----------

// Add one entry per client. Find the ad account ID in Meta Ads Manager
// (top left dropdown). The ID always starts with "act_".
const CLIENT_ACCOUNTS = [
  // { name: 'Client A', adAccountId: 'act_1234567890' },
  // { name: 'Client B', adAccountId: 'act_9876543210' },
];

// How many days back to pull each run.
const LOOKBACK_DAYS = 90;

// Meta Graph API version.
const META_API_VERSION = 'v19.0';

// Sheet tab that holds the combined data Looker Studio reads from.
const OUTPUT_TAB = 'meta_insights';

// Fields pulled from the insights endpoint. Keep aligned with HEADERS below.
const INSIGHT_FIELDS = [
  'date_start',
  'date_stop',
  'account_id',
  'account_name',
  'campaign_id',
  'campaign_name',
  'objective',
  'impressions',
  'reach',
  'clicks',
  'spend',
  'ctr',
  'cpc',
  'cpm',
  'frequency',
  'actions',
];

const HEADERS = [
  'date',
  'client',
  'account_id',
  'account_name',
  'campaign_id',
  'campaign_name',
  'objective',
  'impressions',
  'reach',
  'clicks',
  'spend',
  'ctr',
  'cpc',
  'cpm',
  'frequency',
  'purchases',
  'leads',
  'add_to_cart',
  'link_clicks',
];

// ---------- ENTRY POINTS ----------

function syncAllClients() {
  const token = getAccessToken_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureSheet_(ss, OUTPUT_TAB, HEADERS);

  if (CLIENT_ACCOUNTS.length === 0) {
    throw new Error(
      'No clients configured. Edit CLIENT_ACCOUNTS at the top of Code.gs.'
    );
  }

  const allRows = [];
  CLIENT_ACCOUNTS.forEach(function (client) {
    Logger.log('Fetching ' + client.name + ' (' + client.adAccountId + ')');
    try {
      const insights = fetchInsights_(client.adAccountId, token);
      insights.forEach(function (row) {
        allRows.push(toSheetRow_(client.name, row));
      });
    } catch (err) {
      Logger.log('FAILED ' + client.name + ': ' + err.message);
    }
  });

  // Replace all data rows (keep header).
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).clearContent();
  }
  if (allRows.length > 0) {
    sheet.getRange(2, 1, allRows.length, HEADERS.length).setValues(allRows);
  }

  Logger.log('Wrote ' + allRows.length + ' rows.');
}

/**
 * One-time helper: run this once after adding META_ACCESS_TOKEN to Script
 * Properties to verify the token can list your ad accounts.
 */
function testToken() {
  const token = getAccessToken_();
  const url =
    'https://graph.facebook.com/' +
    META_API_VERSION +
    '/me/adaccounts?fields=name,account_id&limit=200&access_token=' +
    encodeURIComponent(token);
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  Logger.log(res.getContentText());
}

/**
 * Run once to set up a daily trigger (3am in the script's timezone).
 */
function installDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'syncAllClients') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('syncAllClients')
    .timeBased()
    .everyDays(1)
    .atHour(3)
    .create();
  Logger.log('Daily trigger installed.');
}

// ---------- IMPLEMENTATION ----------

function getAccessToken_() {
  const token = PropertiesService.getScriptProperties().getProperty(
    'META_ACCESS_TOKEN'
  );
  if (!token) {
    throw new Error(
      'Missing META_ACCESS_TOKEN. Add it under Project Settings → Script Properties.'
    );
  }
  return token;
}

function fetchInsights_(adAccountId, token) {
  const params = {
    level: 'campaign',
    time_increment: 1, // one row per day per campaign
    date_preset: lookbackPreset_(LOOKBACK_DAYS),
    fields: INSIGHT_FIELDS.join(','),
    limit: '500',
    access_token: token,
  };
  let url =
    'https://graph.facebook.com/' +
    META_API_VERSION +
    '/' +
    adAccountId +
    '/insights?' +
    toQuery_(params);

  const all = [];
  while (url) {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const body = JSON.parse(res.getContentText());
    if (body.error) {
      throw new Error(body.error.message + ' (code ' + body.error.code + ')');
    }
    (body.data || []).forEach(function (row) {
      all.push(row);
    });
    url = body.paging && body.paging.next ? body.paging.next : null;
  }
  return all;
}

function toSheetRow_(clientName, row) {
  const actions = indexActions_(row.actions);
  return [
    row.date_start,
    clientName,
    row.account_id || '',
    row.account_name || '',
    row.campaign_id || '',
    row.campaign_name || '',
    row.objective || '',
    num_(row.impressions),
    num_(row.reach),
    num_(row.clicks),
    num_(row.spend),
    num_(row.ctr),
    num_(row.cpc),
    num_(row.cpm),
    num_(row.frequency),
    actions['purchase'] || actions['offsite_conversion.fb_pixel_purchase'] || 0,
    actions['lead'] || actions['onsite_conversion.lead_grouped'] || 0,
    actions['add_to_cart'] ||
      actions['offsite_conversion.fb_pixel_add_to_cart'] ||
      0,
    actions['link_click'] || 0,
  ];
}

function indexActions_(actions) {
  const out = {};
  (actions || []).forEach(function (a) {
    out[a.action_type] = Number(a.value) || 0;
  });
  return out;
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  const firstRow = sheet
    .getRange(1, 1, 1, headers.length)
    .getValues()[0]
    .join(',');
  if (firstRow !== headers.join(',')) {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function num_(v) {
  if (v === undefined || v === null || v === '') return 0;
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

function lookbackPreset_(days) {
  // Meta supports a fixed set of presets. Map common lookbacks.
  if (days <= 7) return 'last_7d';
  if (days <= 14) return 'last_14d';
  if (days <= 30) return 'last_30d';
  if (days <= 90) return 'last_90d';
  return 'last_90d';
}

function toQuery_(obj) {
  return Object.keys(obj)
    .map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
    })
    .join('&');
}
