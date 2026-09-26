// These configuration values must be defined in the Apps Script project:
// SHEET_ID, SHEET_NAME, SUPABASE_URL, SUPABASE_KEY, and TABLE_NAME.

const COLUMN_MAPPING = {
  'Ref_id': 'ref_id',
  'Month Start': 'month_start',
  'End Date': 'end_date',
  'Month': 'month',
  'Year': 'year',
  'Employee Name': 'employee_name',
  'Joined Date': 'joined_date',
  'Salary': 'salary',
  'Team': 'team',
  'Target': 'target',
  'Justification': 'justification',
  '50 Below Above': 'fifty_below_above',
  '50k Above': 'fifty_k_above',
  '1lac Above': 'one_lac_above',
  'Single Yr Nop': 'single_yr_nop',
  'Multi Yr Nop': 'multi_yr_nop',
  'N.o.p': 'nop',
  'Logged Nop': 'logged_nop',
  'Logged Gross score': 'logged_gross_score',
  'Logged Score': 'logged_score',
  'Gross score': 'gross_score',
  'Score': 'score',
  'Just left': 'just_left',
  'Issued': 'issued',
  'Issued nop': 'issued_nop',
  'Pending': 'pending',
  'Pen. Nop': 'pending_nop',
  'Requirement': 'requirement',
  'Req. Nop': 'requirement_nop',
  'Counter': 'counter',
  'Cou. Nop': 'counter_nop',
  'Declined': 'declined',
  'Dec. Nop': 'declined_nop',
  'Mismatched Nop': 'mismatched_nop',
  'Achievement': 'achievement',
  'Discount Deliverd': 'discount_deliverd',
  'Discount Count': 'discount_count',
  'Last Payment': 'last_payment',
  'Last Payment Amount': 'last_payment_amount',
  'Last Pay Days': 'last_pay_days'
}

const DATE_COLUMNS = ['month_start', 'end_date', 'joined_date', 'last_payment']
const NUMERIC_COLUMNS = [
  'year', 'salary', 'target', 'fifty_below_above', 'fifty_k_above', 'one_lac_above',
  'single_yr_nop', 'multi_yr_nop', 'nop', 'logged_nop', 'logged_gross_score', 'logged_score',
  'gross_score', 'score', 'issued', 'issued_nop', 'pending', 'pending_nop',
  'requirement', 'requirement_nop', 'counter', 'counter_nop', 'declined',
  'declined_nop', 'mismatched', 'mismatched_nop', 'achievement', 'discount_deliverd',
  'discount_count', 'last_payment_amount', 'last_pay_days'
]
const TEXT_NUMERIC_COLUMNS = ['justification', 'just_left']

function sendDataToSupabase() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME)
  if (!sheet) {
    Logger.log("ERROR: Sheet '" + SHEET_NAME + "' not found!")
    return
  }

  const values = sheet.getDataRange().getValues()
  if (values.length <= 1) {
    Logger.log('No data found to process.')
    return
  }

  const headers = values[0].map(function(header) {
    return String(header).replace(/\s+/g, ' ').trim()
  })
  if (headers.indexOf('Ref_id') === -1) {
    Logger.log("ERROR: 'Ref_id' column not found in headers.")
    return
  }

  const payloadData = []
  const scriptTimeZone = Session.getScriptTimeZone()

  for (let i = 1; i < values.length; i++) {
    const row = values[i]
    const rowObject = {}
    let refId = null
    let mismatchedOccurrence = 0

    for (let j = 0; j < headers.length; j++) {
      const sheetColumn = headers[j]
      let dbColumn = COLUMN_MAPPING[sheetColumn]

      if (sheetColumn === 'Mismatched') {
        dbColumn = mismatchedOccurrence === 0 ? 'mismatched' : 'mismatched_nop'
        mismatchedOccurrence++
      }
      if (!dbColumn) continue

      let value = row[j]
      if (value instanceof Date) {
        value = Utilities.formatDate(value, scriptTimeZone, 'yyyy-MM-dd')
      }
      if (typeof value === 'string') value = value.trim()
      if (value === '' || value === undefined || value === null) value = null

      if (value !== null && DATE_COLUMNS.indexOf(dbColumn) !== -1) {
        value = cleanDateValue(value, scriptTimeZone)
      } else if (value !== null && (NUMERIC_COLUMNS.indexOf(dbColumn) !== -1 || TEXT_NUMERIC_COLUMNS.indexOf(dbColumn) !== -1)) {
        const numericValue = cleanNumericValue(value)
        value = numericValue === null
          ? null
          : TEXT_NUMERIC_COLUMNS.indexOf(dbColumn) !== -1
            ? String(numericValue)
            : numericValue
      }

      if (dbColumn === 'ref_id' && value !== null) refId = String(value)
      rowObject[dbColumn] = value
    }

    if (refId !== null) payloadData.push(rowObject)
  }

  if (payloadData.length === 0) {
    Logger.log('No valid rows found with a Ref_id.')
    return
  }

  Logger.log('Total valid rows to sync: ' + payloadData.length)
  const batchSize = 500

  for (let start = 0; start < payloadData.length; start += batchSize) {
    const batch = payloadData.slice(start, start + batchSize)
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      payload: JSON.stringify(batch),
      muteHttpExceptions: true
    }

    try {
      const response = UrlFetchApp.fetch(
        SUPABASE_URL + '/rest/v1/' + TABLE_NAME + '?on_conflict=ref_id',
        options
      )
      const code = response.getResponseCode()
      const batchEnd = Math.min(start + batchSize, payloadData.length)

      if (code >= 200 && code < 300) {
        Logger.log('SUCCESS: Synced rows ' + (start + 1) + ' to ' + batchEnd + '.')
      } else {
        Logger.log('SYNC FAILED for rows ' + (start + 1) + ' to ' + batchEnd + '.')
        Logger.log('HTTP Code: ' + code + ' | Error Response: ' + response.getContentText())
      }
    } catch (error) {
      Logger.log('ERROR on request: ' + error.toString())
    }
  }

  Logger.log('Sync process completed.')
}

function cleanNumericValue(value) {
  const normalized = String(value).trim().toLowerCase()
  if (!normalized || normalized.includes('zero')) return null

  const cleaned = normalized.replace(/[^0-9.-]+/g, '')
  if (!cleaned || cleaned === '-' || cleaned === '.' || cleaned === '-.') return null

  const number = Number(cleaned)
  return Number.isFinite(number) ? number : null
}

function cleanDateValue(value, timeZone) {
  const text = String(value).trim()
  if (text.toLowerCase().includes('zero')) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text

  const dayFirstMatch = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (dayFirstMatch) {
    const day = dayFirstMatch[1].padStart(2, '0')
    const month = dayFirstMatch[2].padStart(2, '0')
    const year = dayFirstMatch[3]
    const parsed = new Date(Number(year), Number(month) - 1, Number(day))
    if (parsed.getFullYear() !== Number(year) || parsed.getMonth() !== Number(month) - 1 || parsed.getDate() !== Number(day)) {
      return null
    }
    return year + '-' + month + '-' + day
  }

  const parsed = new Date(text)
  if (isNaN(parsed.getTime())) return null
  return Utilities.formatDate(parsed, timeZone, 'yyyy-MM-dd')
}
