# Formani ulash — Google Sheets + Telegram

Landing'dagi ariza formasi (`#ariza`) yuborilganda ma'lumot **Google Apps Script Web App**'ga boradi,
u esa bir vaqtning o'zida (1) Google Sheets jadvaliga qator qo'shadi va (2) Telegram'ga xabar yuboradi.

Server kerak emas, hammasi bepul. Jami ~10 daqiqa.

Kerak bo'ladigan 3 ta qiymat:

| Qiymat | Qayerdan olinadi | Qayerga yoziladi |
|---|---|---|
| `TELEGRAM_TOKEN` | @BotFather (1-qadam) | `apps-script/code.gs` |
| `TELEGRAM_CHAT_ID` | `getUpdates` (2-qadam) | `apps-script/code.gs` |
| Web App URL | Apps Script Deploy (4-qadam) | `index.html` → `FORM_ENDPOINT` |

---

## 1-qadam. Telegram bot tokenini olish

1. Telegram'da [@BotFather](https://t.me/BotFather) ni oching.
2. `/newbot` yuboring.
3. Botga nom bering (masalan `Maydan Talim Arizalar`), keyin username bering — `_bot` bilan tugashi shart
   (masalan `maydan_talim_arizalar_bot`).
4. BotFather sizga token beradi, ko'rinishi shunday:

   ```
   8123456789:AAH_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

   Shu tokenni saqlab qo'ying. **Tokenni hech kimga bermang** — u bot ustidan to'liq nazorat beradi.

---

## 2-qadam. `chat_id` ni olish

Xabarlar qayerga tushishini hal qiling:

**A) Shaxsan o'zingizga kelsin**
1. Yaratgan botingizni Telegram'da qidiring va oching.
2. **Start** bosing yoki unga biror xabar yozing (masalan `salom`).

**B) Guruhga kelsin (bir necha menejer ko'radi — tavsiya etiladi)**
1. Telegram'da guruh yarating (masalan "Maydan — Arizalar").
2. Botni shu guruhga a'zo qilib qo'shing.
3. Guruhga biror xabar yozing (masalan `salom`).

So'ng brauzerda quyidagi manzilni oching (`<TOKEN>` o'rniga 1-qadamdagi tokenni qo'ying):

```
https://api.telegram.org/bot<TOKEN>/getUpdates
```

Chiqqan JSON ichidan `"chat":{"id": ... }` ni toping:

```json
"chat": { "id": 123456789, "first_name": "Islom", "type": "private" }
```

O'sha `id` — sizning `chat_id`ingiz. Guruh bo'lsa u **minus** bilan boshlanadi, masalan `-1001234567890` —
minus belgisi ham nusxalanadi.

> Bo'sh natija (`{"ok":true,"result":[]}`) chiqsa — botga/guruhga xabar yozmagansiz.
> Xabar yozing va sahifani yangilang.

---

## 3-qadam. Google Sheet va Apps Script

1. [sheets.new](https://sheets.new) — yangi jadval oching, nom bering (masalan "Maydan — Arizalar").
2. Yuqoridagi menyudan: **Extensions → Apps Script**.
3. Ochilgan `Code.gs` faylidagi hamma narsani o'chiring.
4. Shu repodagi [`apps-script/code.gs`](apps-script/code.gs) faylining **butun mazmunini** nusxalab, o'rniga qo'ying.
5. Eng yuqoridagi 2 qatorni to'ldiring:

   ```javascript
   var TELEGRAM_TOKEN   = '8123456789:AAH_xxxxxxxxxxxxx';  // 1-qadamdagi token
   var TELEGRAM_CHAT_ID = '-1001234567890';                // 2-qadamdagi chat_id
   ```

   Qiymatlar **qo'shtirnoq ichida** qolishi kerak.
6. **Save** (disk belgisi yoki Ctrl+S / Cmd+S).

> Bu 2 qator to'ldirilmasa ham xato bo'lmaydi: arizalar Sheets'ga yozilaveradi,
> faqat Telegram'ga xabar bormaydi.

---

## 4-qadam. Deploy — Web App URL olish

Apps Script muharririda:

1. O'ng yuqorida **Deploy → New deployment**.
2. Chapdagi tishli belgi (**Select type**) → **Web app**.
3. Sozlamalar:
   - **Description**: `maydan forma` (ixtiyoriy)
   - **Execute as**: **Me** (o'zingizning akkauntingiz)
   - **Who has access**: **Anyone** ← muhim. "Anyone with Google account" EMAS.
4. **Deploy** bosing.
5. Google ruxsat so'raydi: **Authorize access** → akkauntingizni tanlang →
   "Google hasn't verified this app" ogohlantirishi chiqsa: **Advanced** → **Go to … (unsafe)** → **Allow**.
   (Bu o'zingiz yozgan skript, xavfsiz.)
6. Chiqqan **Web app URL**'ni nusxalang:

   ```
   https://script.google.com/macros/s/AKfycb....../exec
   ```

**Darhol tekshiring:** shu URL'ni brauzerda oching. Ekranda
`Maydan Ta'lim endpoint ishlayapti.` degan matn chiqishi kerak.
Chiqmasa — 3-punktdagi "Who has access: Anyone" ni qayta tekshiring.

---

## 5-qadam. URL'ni saytga qo'yish

`index.html` faylini oching, `FORM_ENDPOINT` so'zini qidiring (Ctrl+F) va URL'ni qo'ying:

```javascript
var FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycb....../exec";
```

URL qo'shtirnoq ichida, oxirida `/exec` bilan tugashi shart.

---

## 6-qadam. Push va tekshirish

```bash
git add index.html
git commit -m "chore: FORM_ENDPOINT ulandi"
git push origin main
```

Vercel avtomatik qayta deploy qiladi (1–2 daqiqa). Keyin saytni oching va formani to'ldirib yuboring:

- [ ] Sahifada "Rahmat, …" degan muvaffaqiyat ekrani chiqdi
- [ ] Google Sheet'dagi **Arizalar** varag'iga yangi qator qo'shildi
- [ ] Telegram'ga xabar keldi
- [ ] Brauzer konsolida (F12) qizil xato yo'q

---

## Jadval ustunlari

Birinchi ariza kelganda **Arizalar** varag'i va sarlavha qatori avtomatik yaratiladi:

| Sana | Ism | Telefon | Kurs | Filial | Sahifa |
|---|---|---|---|---|---|
| 2026-09-05 14:32 | Islom | +998901234567 | Ingliz tili | Yashnobod | https://… |

Formada 4 ta majburiy maydon bor: **Ism, Telefon, Kurs, Filial**.
Hammasi to'ldirilmaguncha "Ro'yxatdan o'tish" tugmasi xira turadi va bosilmaydi.

Filiallar ro'yxatini o'zgartirish kerak bo'lsa — `index.html` da `f-branch` ni qidiring
va `<option>` qatorlarini tahrirlang. Apps Script'ga tegish shart emas: u `branch` ni
qanday kelsa shundayligicha yozadi.

---

## Muammolar

**Sheets'ga yozilyapti, Telegram'ga xabar kelmayapti**
Token yoki chat_id noto'g'ri. Apps Script'da **Executions** bo'limini oching — xato ko'rinadi.
Guruh bo'lsa `chat_id` oldidagi minus belgisi tushib qolmaganini tekshiring.

**Hech qayerga yozilmayapti**
- Web App URL brauzerda ochilganda "ishlayapti" matni chiqyaptimi? Chiqmasa — deploy noto'g'ri.
- `FORM_ENDPOINT` da URL bormi, `/exec` bilan tugayaptimi?

**Kodni o'zgartirdim, lekin eski holicha ishlayapti**
Apps Script'da har bir o'zgarishdan keyin qayta deploy qilish kerak:
**Deploy → Manage deployments → qalam (Edit) → Version: New version → Deploy**.
URL o'zgarmaydi, `index.html` ga tegmaysiz.

**Brauzer konsolida CORS xatosi**
`fetch` chaqiruvida `mode:'no-cors'` borligini va `Content-Type` header YO'Qligini tekshiring
(`application/json` header preflight so'roviga sabab bo'ladi va so'rov bloklanadi).
