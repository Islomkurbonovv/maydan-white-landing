/**
 * Maydan Ta'lim — forma qabul qiluvchi (Google Sheets + Telegram)
 * Bitta endpoint: ariza kelganda ham jadvalga yozadi, ham Telegram'ga yuboradi.
 *
 * O'rnatish qadamlari: repodagi SETUP.md fayliga qarang.
 */

// ====== SOZLAMALAR — faqat shu 2 qatorni to'ldiring ======
var TELEGRAM_TOKEN   = 'BOT_TOKEN_BU_YERGA';   // @BotFather bergan token
var TELEGRAM_CHAT_ID = 'CHAT_ID_BU_YERGA';     // chat id yoki guruh id
// =========================================================

var SHEET_NAME = 'Arizalar';

function doPost(e) {
  try {
    var d = {};
    if (e && e.postData && e.postData.contents) {
      try { d = JSON.parse(e.postData.contents); }
      catch (_) { d = e.parameter || {}; }
    } else if (e && e.parameter) {
      d = e.parameter;
    }

    var name   = (d.name   || '').toString().trim();
    var phone  = (d.phone  || '').toString().trim();
    var course = (d.course || '').toString().trim();
    var branch = (d.branch || '').toString().trim();
    var page   = (d.page   || '').toString().trim();

    // 1) Google Sheets
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(['Sana', 'Ism', 'Telefon', 'Kurs', 'Filial', 'Sahifa']);
    }
    sh.appendRow([new Date(), name, phone, course, branch, page]);

    // 2) Telegram — token/chat_id to'ldirilmagan bo'lsa o'tkazib yuboriladi
    if (TELEGRAM_TOKEN.indexOf('BU_YERGA') === -1 && TELEGRAM_CHAT_ID.indexOf('BU_YERGA') === -1) {
      var lines = [
        "Yangi ariza — Maydan Ta'lim",
        '',
        'Ism: ' + name,
        'Telefon: ' + phone,
        'Kurs: ' + course
      ];
      if (branch) { lines.push('Filial: ' + branch); }

      UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage', {
        method: 'post',
        payload: { chat_id: TELEGRAM_CHAT_ID, text: lines.join('\n') },
        muteHttpExceptions: true
      });
    }

    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function doGet() {
  return ContentService.createTextOutput("Maydan Ta'lim endpoint ishlayapti.");
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
