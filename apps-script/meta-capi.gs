/**
 * Maydan Ta'lim — Meta Conversions API (server tomondan Lead eventi)
 *
 * Brauzerdagi Pixel ham Lead yuboradi. Ikkalasi BIR XIL event_id bilan boradi,
 * Meta ularni bitta event deb hisoblaydi — dublikat bo'lmaydi. Server tomondagi event
 * reklama bloklovchi, iOS cheklovlari va sekin internetda ham yetib boradi.
 *
 * TOKEN BU FAYLGA YOZILMAYDI (repo ochiq). Apps Script → ⚙ Project Settings → Script properties:
 *   META_CAPI_TOKEN       — Events Manager'da yaratilgan maxfiy token (majburiy)
 *   META_TEST_EVENT_CODE  — ixtiyoriy. To'ldirilsa eventlar "Тестирование событий" bo'limiga tushadi.
 *                           Tekshirib bo'lgach O'CHIRING — aks holda eventlar reklamaga hisoblanmaydi.
 *
 * Meta'ga yuboriladigan shaxsiy ma'lumot faqat SHA-256 xesh ko'rinishida: telefon, ism, mamlakat.
 */

var META_PIXEL_ID    = '918405104297839';
var META_API_VERSION = 'v26.0';   // 2026-09 holatiga eng yangi versiya (v27.0 hali yo'q)

function sendMetaLead(d) {
  try {
    var props = PropertiesService.getScriptProperties();
    var token = props.getProperty('META_CAPI_TOKEN');
    if (!token) return;                       // token qo'yilmagan — jimgina o'tkazib yuboriladi

    var phoneDigits = String(d.phone || '').replace(/\D/g, '');
    var name = String(d.name || '').trim();
    // Endpoint URL ochiq. Soxta so'rovlar reklama optimizatsiyasini buzmasligi uchun
    // Meta'ga faqat to'g'ri formatdagi ariza ketadi.
    if (!/^998\d{9}$/.test(phoneDigits) || !name || !d.event_id) return;

    var userData = {
      ph: [sha256_(phoneDigits)],
      country: [sha256_('uz')]
    };
    var firstName = normalizeName_(name.split(/\s+/)[0]);
    if (firstName) userData.fn = [sha256_(firstName)];
    if (d.fbp) userData.fbp = String(d.fbp);   // pixel qo'ygan brauzer ID — xeshlanmaydi
    if (d.fbc) userData.fbc = String(d.fbc);   // reklama bosilganidagi ID — xeshlanmaydi
    if (d.ua)  userData.client_user_agent = String(d.ua);

    var event = {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: String(d.event_id).slice(0, 100),
      action_source: 'website',
      user_data: userData,
      custom_data: {}
    };
    if (d.page)   event.event_source_url = String(d.page);
    if (d.course) event.custom_data.content_name = String(d.course);
    if (d.branch) event.custom_data.content_category = String(d.branch);

    var body = { data: [event] };
    var testCode = props.getProperty('META_TEST_EVENT_CODE');
    if (testCode) body.test_event_code = testCode;

    var res = UrlFetchApp.fetch(
      'https://graph.facebook.com/' + META_API_VERSION + '/' + META_PIXEL_ID +
        '/events?access_token=' + encodeURIComponent(token),
      { method: 'post', contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true }
    );
    // Natija Apps Script → Executions bo'limida ko'rinadi (token logga yozilmaydi)
    Logger.log('Meta CAPI ' + res.getResponseCode() + ': ' + res.getContentText());
  } catch (err) {
    Logger.log('Meta CAPI xato: ' + err);     // Sheets va Telegram'ga ta'sir qilmaydi
  }
}

function sha256_(s) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

// Meta talabi: kichik harf, tinish belgilarisiz ("G'ulom" -> "gulom")
function normalizeName_(s) {
  return String(s || '').toLowerCase().replace(/[^\p{L}]/gu, '');
}
