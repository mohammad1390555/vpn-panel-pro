# 🚀 VPN Panel Pro

پنل VPN حرفه‌ای با **ربات تلگرام**، **پنل مدیریت وب** و **صفحه ساب لینک** — تماماً روی Cloudflare Workers.

[![Deploy to Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare-f38020?logo=cloudflare)](https://dash.cloudflare.com/)

---

## ✨ ویژگی‌ها

### 🤖 ربات تلگرام (۲۰+ ویژگی)
- 🏠 **فوتر ناوبری ثابت** — دسترسی سریع به همه بخش‌ها
- 📦 **کارت‌های پلن** — نمایش بصری پلن‌ها با آیکون، قیمت و دکمه خرید
- 💳 **ویجت موجودی کیف پول** — نمایش لحظه‌ای موجودی
- 📊 **نوار پیشرفت مصرف** — ██████░░░░ ۶۰٪
- ⚡ **دکمه‌های سریع** — تست رایگان، خرید، وضعیت
- ☀️ **پیام خوش‌آمد پویا** — صبح/ظهر/شب
- 📋 **کپی لینک** — با یک کلیک
- ⏳ **شمارشگر روزهای باقی‌مانده**
- 🔄 **تمدید خودکار**
- 🌍 **نمایش سرور متصل**
- 📤 **معرفی به دوستان**
- 💬 **پشتیبانی و راهنما**

### 🖥️ پنل وب مدیریت
- 📊 **داشبورد** با آمار کل (کاربران، درآمد، مصرف)
- 👥 **مدیریت کاربران** — جستجو، ایجاد، ویرایش، حذف
- 📦 **مدیریت پلن‌ها** — افزودن/حذف پلن
- ⚙️ **تنظیمات** — نام سایت، پشتیبانی

### 🔗 صفحه ساب لینک
- 🟣🔵🟠 **انتخاب پروتکل** (VLESS/Trojan/VMess)
- 📊 **گیج مصرف** دایره‌ای
- ⏰ **شمارش معکوس** انقضا
- 📱 **QR کد** برای هر کانفیگ
- 📥 **دانلود** JSON/RAW
- 🔄 **بازنشانی کانفیگ**
- 📤 **اشتراک‌گذاری لینک**
- ❓ **FAQ** سوالات متداول
- 🌐 **تغییر زبان** FA/EN
- 🎨 **طراحی تاریک و مدرن**

---

## 🚀 دیپلوی سریع

### ۱. نیازمندی‌ها
- اکانت [Cloudflare](https://dash.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- ربات تلگرام (از [@BotFather](https://t.me/BotFather))

### ۲. نصب و تنظیمات

```bash
# کلون
git clone https://github.com/mohammad1390555/vpn-panel-pro.git
cd vpn-panel-pro

# نصب wrangler
npm install

# لاگین به Cloudflare
npx wrangler login

# ساخت KV Namespace ها
npx wrangler kv:namespace create USERS
npx wrangler kv:namespace create PLANS
npx wrangler kv:namespace create TRANSACTIONS
npx wrangler kv:namespace create SETTINGS
npx wrangler kv:namespace create LOGS
```

### ۳. تنظیم wrangler.toml

```toml
[vars]
BOT_TOKEN = "YOUR_BOT_TOKEN"
BOT_USERNAME = "YOUR_BOT_USERNAME"
ADMIN_IDS = "YOUR_TELEGRAM_ID"
PANEL_DOMAIN = "panel.yourdomain.com"
SUB_DOMAIN = "sub.yourdomain.com"
```

### ۴. دیپلوی

```bash
npx wrangler deploy
```

### ۵. تنظیم Webhook تلگرام

```bash
curl https://panel.yourdomain.com/api/telegram/set-webhook
```

---

## 📁 ساختار پروژه

```
vpn-panel-pro/
├── src/
│   ├── worker.js              # ورودی اصلی Worker
│   ├── api/
│   │   └── index.js           # REST API (users, plans, settings, sub)
│   ├── telegram-bot/
│   │   └── bot.js             # ربات تلگرام (تمامی منوها و callback ها)
│   ├── web-panel/
│   │   └── render.js          # پنل مدیریت وب (SPA)
│   ├── sub-page/
│   │   └── render.js          # صفحه ساب لینک
│   └── utils/
│       ├── kv.js              # ابزارهای KV
│       ├── logger.js          # لاگینگ
│       ├── response.js        # Response builders
│       └── assets.js          # استاتیک فایل‌ها
├── wrangler.toml              # تنظیمات Cloudflare
├── package.json
└── README.md
```

---

## 🔧 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | ورود ادمین |
| GET | `/api/users` | لیست کاربران |
| POST | `/api/users` | ایجاد کاربر |
| PUT | `/api/users/:id` | ویرایش کاربر |
| DELETE | `/api/users/:id` | حذف کاربر |
| POST | `/api/users/bulk` | عملیات دسته‌جمعی |
| GET | `/api/plans` | لیست پلن‌ها |
| POST | `/api/plans` | ایجاد پلن |
| GET | `/api/stats/dashboard` | آمار داشبورد |
| GET | `/api/sub/:uuid` | لینک اشتراک |
| GET | `/api/sub-info/:uuid` | اطلاعات اشتراک |

---

## 🎨 اسکرین‌شات‌ها

*(قرار داده می‌شود)*

---

## 📄 لایسنس

MIT — استفاده آزاد برای هر منظوری.

---

ساخته شده با ❤️ توسط [Mamad](https://github.com/mohammad1390555)
