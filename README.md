# Maydan Ta'lim — landing

Bitta `index.html` fayl. Hech qanday build kerak emas — Vercel'da statik sayt sifatida ishlaydi.

## Sozlash (index.html ichida)
- **Telefon raqam** — `+998785550330` va `+998 78 555 03 30` (Ctrl+F bilan toping).
- **Arizalar qayerga borishi** — skript boshida `FORM_ENDPOINT = ""` ga CRM / Telegram-bot webhook URL yozing.
  Bo'sh qolsa forma demo rejimda ishlaydi (faqat "qabul qilindi" ko'rsatadi).
- **Rasmlar** (faqat yashil variant) — `images/` papkasiga qo'ying, `index.html` dagi `RASMLAR` bo'limida `src` ni almashtiring.

## Deploy
GitHub'ga yuklang → vercel.com → Add New Project → repo'ni tanlang → Deploy. Framework: Other (statik).
