function doGet(e) {
  try {
    const sheetId = '1qzxbyavzNWD9x-hG5y6cNFZlMEMyubOR-JAN5-spWiA';
    const sheetName = 'Payment_Responses';
    const timeZone = Session.getScriptTimeZone();
    const startDate = parseDateOnly(e && e.parameter ? e.parameter.startDate : '');
    const endDate = parseDateOnly(e && e.parameter ? e.parameter.endDate : '');

    if (startDate && endDate && startDate > endDate) {
      return jsonResponse({ error: 'startDate cannot be after endDate.' });
    }

    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    if (!sheet) return jsonResponse({ error: 'Sheet not found: ' + sheetName });

    const values = sheet.getDataRange().getValues();
    if (values.length === 0) return jsonResponse({ data: [], headers: [] });

    const headers = values[0].map(String);
    const paymentDateIndex = headers.indexOf('payment_date');
    if (paymentDateIndex === -1) {
      return jsonResponse({ error: 'Column not found: payment_date' });
    }

    const rows = values.slice(1).map(function(row) {
      const paymentDate = toDate(row[paymentDateIndex]);
      return {
        row: row,
        paymentDate: paymentDate
      };
    }).filter(function(item) {
      if (!item.paymentDate) return !startDate && !endDate;
      const dateOnly = new Date(
        item.paymentDate.getFullYear(),
        item.paymentDate.getMonth(),
        item.paymentDate.getDate()
      );
      if (startDate && dateOnly < startDate) return false;
      if (endDate && dateOnly > endDate) return false;
      return true;
    }).map(function(item) {
      const result = {};
      headers.forEach(function(header, index) {
        let value = item.row[index];
        if (value instanceof Date) {
          value = Utilities.formatDate(value, timeZone, 'yyyy-MM-dd HH:mm:ss');
        }
        result[header] = value;
      });
      return result;
    });

    return jsonResponse({
      data: rows,
      headers: headers,
      startDate: e && e.parameter ? e.parameter.startDate || '' : '',
      endDate: e && e.parameter ? e.parameter.endDate || '' : ''
    });
  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}

function parseDateOnly(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function toDate(value) {
  if (value instanceof Date) return value;
  if (!value) return null;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
