// ─── Made by Mohammad — github.com/mohammad1390555 ───
// ============================================================
// 🤖 Telegram Bot — Full Implementation with High Impact Ideas
// ============================================================
// Ideas: 1.FooterNav 2.PlanCards 3.WalletWidget 4.ProgressBar 5.QuickActions
//        6.DynamicGreeting 7.TxIcons 8.CopyLink 9.Countdown 10.AutoRenew
//        11.ServerDisplay 12.ShareReferral 15.DailyUsage 17.LastIP 19.PingSpeed 20.SupportHelp
// ============================================================

import {
  getUsers, getUser, updateUser, saveUsers,
  getPlans, getTransactions, addTransaction,
  getSettings, generateUUID, getNow, daysRemaining
} from '../utils/kv.js';
import { logEvent } from '../utils/logger.js';
import { jsonResponse } from '../utils/response.js';

// ─── Telegram API Helpers ──────────────────────────────
async function tg(env, method, body = {}) {
  const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function sendMsg(env, chatId, text, markup = null) {
  const body = { chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true };
  if (markup) body.reply_markup = markup;
  return tg(env, 'sendMessage', body);
}

async function editMsg(env, chatId, msgId, text, markup = null) {
  const body = { chat_id: chatId, message_id: msgId, text, parse_mode: 'HTML' };
  if (markup) body.reply_markup = markup;
  return tg(env, 'editMessageText', body);
}

async function answerCb(env, cbId, text = '', showAlert = false) {
  return tg(env, 'answerCallbackQuery', { callback_query_id: cbId, text, show_alert: showAlert });
}

// ─── Icons ─────────────────────────────────────────────
const IC = {
  home:'🏠',shop:'🛒',wallet:'💳',profile:'👤',check:'✅',cross:'❌',star:'⭐',fire:'🔥',
  clock:'⏳',calendar:'📅',chart:'📊',money:'💰',link:'🔗',key:'🔑',shield:'🛡️',globe:'🌍',
  down:'📥',up:'📤',trash:'🗑️',edit:'✏️',user:'👤',users:'👥',plus:'➕',minus:'➖',
  info:'ℹ️',warn:'⚠️',gift:'🎁',rocket:'🚀',signal:'📶',speed:'⚡',lock:'🔒',unlock:'🔓',
  search:'🔍',settings:'⚙️',support:'💬',help:'❓',copy:'📋',refresh:'🔄',back:'🔙',
  diamond:'💎',crown:'👑',medal:'🏅',ticket:'🎫',data:'📦',gauge:'🧭',
  server:'🖥️',cloud:'☁️',bell:'🔔',
};

// ─── Greeting by time (Idea #6) ────────────────────────
function greet() {
  const h = new Date().getHours();
  if (h < 6) return '🌙 شب بخیر';
  if (h < 12) return '☀️ صبح بخیر';
  if (h < 17) return '🌤️ ظهر بخیر';
  if (h < 22) return '🌅 عصر بخیر';
  return '🌙 شب بخیر';
}

// ─── Progress Bar (Idea #4) ────────────────────────────
function progBar(pct, len = 10) {
  const f = Math.round(pct / 100 * len);
  const c = pct > 90 ? '🔴' : pct > 60 ? '🟡' : '🟢';
  return `${c} ${'█'.repeat(f)}${'░'.repeat(len - f)} ${pct}%`;
}

// ─── Footer Nav (Idea #1) ──────────────────────────────
function footerNav() {
  return { inline_keyboard: [[
    { text: IC.home, callback: 'nav:home' },
    { text: IC.shop, callback: 'nav:shop' },
    { text: IC.wallet, callback: 'nav:wallet' },
    { text: IC.profile, callback: 'nav:profile' },
  ]]};
}

// ─── MAIN MENU (Ideas #3 #4 #5 #6 #11) ─────────────────
async function showHome(env, chatId, user) {
  const cfg = await getSettings(env);
  const srv = cfg.serverInfo || { name: 'Germany-Frankfurt', ping: 25, load: 45 };
  const bal = user.balance || 0;

  let t = `<b>${IC.rocket} ${cfg.siteName}</b>\n━━━━━━━━━━━━━━━━━━\n`;
  t += `${greet()} ${user.name || 'کاربر'}! 👋\nچطور می‌تونم کمک‌تون کنم؟\n\n`;

  // Wallet (Idea #3)
  t += `${IC.wallet} <b>موجودی:</b> <code>${bal.toLocaleString()}</code> تومان\n`;
  // Server (Idea #11)
  t += `${IC.server} <b>سرور:</b> ${srv.name}\n`;
  t += `${IC.signal} پینگ: ${srv.ping}ms | بار: ${srv.load}%\n\n`;

  // Subscription status (Idea #4)
  if (user.expiryDate) {
    const dl = daysRemaining(user.expiryDate);
    const pct = user.dataLimit ? Math.round((user.dataUsed||0) / user.dataLimit * 100) : 0;
    if (dl > 0) {
      t += `${IC.shield} <b>اشتراک فعال:</b>\n${progBar(pct, 8)} مصرف\n${IC.clock} ${dl} روز باقی‌مانده\n\n`;
    } else {
      t += `${IC.warn} <b>اشتراک منقضی شده!</b>\n\n`;
    }
  }

  t += `━━━━━━━━━━━━━━━━━━\nاز دکمه‌های زیر استفاده کنید:`;

  const kb = { inline_keyboard: [
    [{ text: `${IC.gift} دریافت تست رایگان`, callback: 'act:free_test' }],
    [{ text: `${IC.shop} خرید اشتراک`, callback: 'nav:shop' },
     { text: `${IC.chart} وضعیت سرویس`, callback: 'nav:status' }],
    [{ text: `${IC.users} معرفی به دوستان`, callback: 'nav:referral' },
     { text: `${IC.link} لینک ساب من`, callback: 'nav:mysub' }],
    [{ text: `${IC.support} پشتیبانی`, callback: 'nav:support' },
     { text: `${IC.help} راهنما`, callback: 'nav:help' }],
    [{ text: IC.home, callback: 'nav:home' },
     { text: IC.shop, callback: 'nav:shop' },
     { text: IC.wallet, callback: 'nav:wallet' },
     { text: IC.profile, callback: 'nav:profile' }],
  ]};

  return sendMsg(env, chatId, t, kb);
}

// ─── PLAN CARDS (Idea #2) ──────────────────────────────
async function showShop(env, chatId, user) {
  const plans = await getPlans(env);
  if (!plans.length) {
    return sendMsg(env, chatId, `${IC.info} پلنی تعریف نشده.`, footerNav());
  }

  let t = `<b>${IC.shop} فروشگاه اشتراک</b>\n━━━━━━━━━━━━━━━━━━\nپلن مناسب خود را انتخاب کنید:\n\n`;
  const kbs = [];

  for (const p of plans.filter(x => x.isActive !== false)) {
    t += `${p.icon||'📦'} <b>${p.name}</b>\n`;
    t += `   ${IC.data} حجم: <b>${p.dataLimit} GB</b>\n`;
    t += `   ${IC.clock} مدت: <b>${p.duration} روز</b>\n`;
    t += `   ${IC.users} همزمان: <b>${p.concurrentLimit}</b>\n`;
    t += `   ${IC.money} قیمت: <b>${p.price.toLocaleString()}</b> تومان\n`;
    if (p.description) t += `   ${IC.info} ${p.description}\n`;
    t += `\n`;
    kbs.push([{ text: `🛒 خرید ${p.name}`, callback: `buy:${p.id}` }]);
  }

  kbs.push([{ text: `${IC.back} بازگشت`, callback: 'nav:home' }]);
  return sendMsg(env, chatId, t, { inline_keyboard: kbs });
}

// ─── STATUS PAGE (Ideas #4 #9 #15 #17 #19) ─────────────
async function showStatus(env, chatId, user) {
  const u = await getUser(env, user.telegramId) || user;
  if (!u.expiryDate) {
    return sendMsg(env, chatId,
      `${IC.warn} اشتراک فعالی ندارید!\nبرای خرید به فروشگاه مراجعه کنید.`,
      { inline_keyboard: [[{ text: `${IC.shop} فروشگاه`, callback: 'nav:shop' }],[{ text: `${IC.back} بازگشت`, callback: 'nav:home' }]] }
    );
  }

  const dl = daysRemaining(u.expiryDate);
  const lim = u.dataLimit || 0;
  const used = u.dataUsed || 0;
  const pct = lim > 0 ? Math.round(used / lim * 100) : 0;
  const daily = u.dailyUsage || 0;

  const se = dl > 7 ? IC.check : dl > 0 ? IC.warn : IC.cross;
  const st = dl > 7 ? 'فعال' : dl > 0 ? 'در حال اتمام' : 'منقضی شده';

  let t = `<b>${IC.chart} وضعیت اشتراک</b>\n━━━━━━━━━━━━━━━━━━\n\n`;
  t += `${se} <b>وضعیت:</b> ${st}\n\n`;
  t += `<b>${IC.gauge} مصرف ترافیک:</b>\n${progBar(pct, 12)}\n`;
  t += `<code>${used.toFixed(1)}</code> از <code>${lim} GB</code>\n\n`;
  t += `${IC.calendar} <b>مصرف امروز:</b> <code>${daily.toFixed(1)} GB</code>\n`;
  t += `${IC.clock} <b>روزهای باقی‌مانده:</b> <code>${dl}</code> روز\n`;
  t += `${IC.calendar} <b>تاریخ انقضا:</b> ${new Date(u.expiryDate).toLocaleDateString('fa-IR')}\n\n`;
  t += `${IC.users} <b>اتصالات همزمان:</b> ${u.concurrentLimit||3}\n\n`;
  if (u.ips && u.ips.length) t += `${IC.globe} <b>آخرین IP:</b> <code>${u.ips[u.ips.length-1]}</code>\n\n`;
  t += `━━━━━━━━━━━━━━━━━━\n${IC.signal} <b>کیفیت اتصال:</b>\nپینگ: ~25ms | سرعت: ~50 Mbps\n`;

  return sendMsg(env, chatId, t, { inline_keyboard: [
    [{ text: `${IC.link} 📋 کپی لینک ساب`, callback: 'act:copy_sub' }],
    [{ text: `${IC.refresh} 🔄 تمدید`, callback: 'nav:shop' }],
    [{ text: `${IC.back} بازگشت`, callback: 'nav:home' }],
  ]});
}

// ─── WALLET (Ideas #3 #7) ──────────────────────────────
async function showWallet(env, chatId, user) {
  const bal = user.balance || 0;
  const txs = await getTransactions(env, user.telegramId);
  const recent = txs.slice(0, 10);

  let t = `<b>${IC.wallet} کیف پول</b>\n━━━━━━━━━━━━━━━━━━\n\n`;
  t += `${IC.money} <b>موجودی:</b>\n<code>${bal.toLocaleString()}</code> تومان\n\n`;
  t += `<b>${IC.chart} تاریخچه تراکنش‌ها:</b>\n━━━━━━━━━━━━━━━━━━\n`;

  if (!recent.length) {
    t += `${IC.info} تراکنشی یافت نشد.\n`;
  } else {
    for (const tx of recent) {
      const icon = tx.type === 'deposit' ? '🟢' : tx.type === 'purchase' ? '🔵' : '🔴';
      const sign = tx.type === 'deposit' ? '+' : '-';
      const d = new Date(tx.createdAt).toLocaleDateString('fa-IR');
      t += `${icon} <b>${sign}${tx.amount.toLocaleString()} تومان</b>\n   ${tx.description||tx.type} | ${d}\n`;
    }
  }

  return sendMsg(env, chatId, t, { inline_keyboard: [
    [{ text: `${IC.plus} شارژ کیف پول`, callback: 'act:charge' }],
    [{ text: `${IC.back} بازگشت`, callback: 'nav:home' }],
  ]});
}

// ─── PROFILE (Idea #8 #10) ─────────────────────────────
async function showProfile(env, chatId, user) {
  const u = await getUser(env, user.telegramId) || user;
  let t = `<b>${IC.profile} پروفایل</b>\n━━━━━━━━━━━━━━━━━━\n\n`;
  t += `${IC.user} <b>نام:</b> ${u.name||'تنظیم نشده'}\n`;
  t += `${IC.info} <b>شناسه:</b> <code>${u.telegramId}</code>\n`;
  t += `${IC.calendar} <b>عضویت:</b> ${new Date(u.createdAt).toLocaleDateString('fa-IR')}\n\n`;

  if (u.expiryDate) {
    const dl = daysRemaining(u.expiryDate);
    t += `${IC.shield} <b>اشتراک:</b> ${dl > 0 ? 'فعال ✅' : 'منقضی ❌'}\n`;
    if (dl > 0) t += `${IC.clock} ${dl} روز باقی‌مانده\n`;
  } else {
    t += `${IC.shield} <b>اشتراک:</b> ندارد\n`;
  }

  t += `\n${IC.link} <b>لینک ساب:</b>\n<code>/sub/${u.configUUID}</code>\n\n`;
  t += `${IC.refresh} <b>تمدید خودکار:</b> ${u.autoRenew ? '✅ فعال' : '❌ غیرفعال'}\n`;

  return sendMsg(env, chatId, t, { inline_keyboard: [
    [{ text: `${IC.edit} ✏️ ویرایش نام`, callback: 'act:edit_name' }],
    [{ text: `${IC.link} 📋 کپی لینک`, callback: 'act:copy_sub' },
     { text: `${IC.refresh} ${u.autoRenew?'غیرفعال':'فعال'} تمدید خودکار`, callback: 'act:toggle_renew' }],
    [{ text: `${IC.back} بازگشت`, callback: 'nav:home' }],
  ]});
}

// ─── MY SUB (Idea #8) ──────────────────────────────────
async function showMySub(env, chatId, user) {
  const u = await getUser(env, user.telegramId) || user;
  const link = `https://${env.SUB_DOMAIN}/sub/${u.configUUID}`;

  let t = `<b>${IC.link} لینک اشتراک من</b>\n━━━━━━━━━━━━━━━━━━\n\n`;
  t += `لینک شما:\n<code>${link}</code>\n\n`;
  t += `${IC.info} این لینک را در کلاینت وارد کنید.\n`;
  t += `<code>${link}?protocol=vless</code>\n<code>${link}?protocol=trojan</code>\n`;

  return sendMsg(env, chatId, t, { inline_keyboard: [
    [{ text: `${IC.copy} 📋 کپی لینک`, callback: `act:copy:${link}` }],
    [{ text: `${IC.down} 📥 JSON`, url: `${link}?format=json` }],
    [{ text: `${IC.refresh} 🔄 بازنشانی`, callback: 'act:reset_cfg' }],
    [{ text: `${IC.back} بازگشت`, callback: 'nav:home' }],
  ]});
}

// ─── REFERRAL (Idea #12) ───────────────────────────────
async function showReferral(env, chatId, user) {
  const u = await getUser(env, user.telegramId) || user;
  const link = `https://t.me/${env.BOT_USERNAME}?start=ref_${u.telegramId}`;

  let t = `<b>${IC.gift} معرفی به دوستان</b>\n━━━━━━━━━━━━━━━━━━\n\n`;
  t += `${IC.star} با معرفی بات، <b>اعتبار رایگان</b> بگیرید!\n\n`;
  t += `${IC.link} لینک شما:\n<code>${link}</code>\n\n`;
  t += `${IC.users} دعوت‌ها: <b>${u.referralCount||0}</b>\n`;
  t += `${IC.money} اعتبار: <b>${(u.referralCredit||0).toLocaleString()}</b> تومان\n`;

  return sendMsg(env, chatId, t, { inline_keyboard: [
    [{ text: `${IC.copy} 📋 کپی`, callback: `act:copy:${link}` }],
    [{ text: `${IC.up} 📤 ارسال`, switch_inline_query: link }],
    [{ text: `${IC.back} بازگشت`, callback: 'nav:home' }],
  ]});
}

// ─── SUPPORT & HELP (Idea #20) ─────────────────────────
async function showSupport(env, chatId) {
  const cfg = await getSettings(env);
  const su = cfg.supportUsername || 'support';
  let t = `<b>${IC.support} پشتیبانی</b>\n━━━━━━━━━━━━━━━━━━\n\n🆔 @${su}\n`;
  return sendMsg(env, chatId, t, { inline_keyboard: [
    [{ text: `${IC.support} 💬 چت`, url: `https://t.me/${su}` }],
    [{ text: `${IC.back} بازگشت`, callback: 'nav:home' }],
  ]});
}

async function showHelp(env, chatId) {
  let t = `<b>${IC.help} راهنما</b>\n━━━━━━━━━━━━━━━━━━\n\n`;
  t += `<b>📱 راهنمای استفاده:</b>\n\n`;
  t += `1️⃣ خرید اشتراک\n2️⃣ دریافت لینک ساب\n3️⃣ وارد کردن در کلاینت:\n`;
  t += `   • V2RayNG (اندروید)\n   • Streisand (iOS)\n   • Nekoray (ویندوز)\n   • V2Box (مک)\n\n`;
  t += `4️⃣ اتصال 🚀\n\n${IC.info} سوالات بیشتر؟ با پشتیبانی تماس بگیرید.`;

  return sendMsg(env, chatId, t, { inline_keyboard: [
    [{ text: `${IC.down} 📥 دانلود کلاینت`, callback: 'act:clients' }],
    [{ text: `${IC.back} بازگشت`, callback: 'nav:home' }],
  ]});
}

// ─── CALLBACK HANDLER ──────────────────────────────────
async function onCallback(env, chatId, data, msgId, cbId, user) {
  // Navigation
  const navMap = { 'nav:home': showHome, 'nav:shop': showShop, 'nav:wallet': showWallet, 'nav:profile': showProfile, 'nav:status': showStatus, 'nav:mysub': showMySub, 'nav:referral': showReferral, 'nav:support': showSupport, 'nav:help': showHelp };
  if (navMap[data]) { await answerCb(env, cbId); return navMap[data](env, chatId, user); }

  // Free test
  if (data === 'act:free_test') {
    await answerCb(env, cbId, '🎁 در حال ایجاد تست...');
    const ex = new Date(); ex.setHours(ex.getHours() + 24);
    await updateUser(env, user.telegramId, { dataLimit: 5, dataUsed: 0, expiryDate: ex.toISOString(), status: 'active' });
    await logEvent(env, 'free_test', { userId: user.telegramId });
    return sendMsg(env, chatId,
      `${IC.gift} <b>تست رایگان فعال شد!</b>\n\n${IC.data} حجم: 5 GB\n${IC.clock} مدت: ۲۴ ساعت\n\n${IC.link} لینک: <code>/sub/${user.configUUID}</code>`,
      { inline_keyboard: [[{ text: `${IC.link} 📋 دریافت لینک`, callback: 'act:copy_sub' }],[{ text: `${IC.back} بازگشت`, callback: 'nav:home' }]] }
    );
  }

  // Copy sub link
  if (data === 'act:copy_sub') {
    const link = `https://${env.SUB_DOMAIN}/sub/${user.configUUID}`;
    await answerCb(env, cbId, '✅ لینک کپی شد!', true);
    return sendMsg(env, chatId, `<code>${link}</code>`);
  }

  // Copy text
  if (data.startsWith('act:copy:')) {
    const txt = data.replace('act:copy:', '');
    await answerCb(env, cbId, '✅ کپی شد!', true);
    return sendMsg(env, chatId, `<code>${txt}</code>`);
  }

  // Buy plan
  if (data.startsWith('buy:')) {
    const pid = data.replace('buy:', '');
    const plans = await getPlans(env);
    const p = plans.find(x => x.id === pid);
    if (!p) { await answerCb(env, cbId, '❌ پلن یافت نشد!', true); return; }

    await answerCb(env, cbId, `🛒 ${p.name} انتخاب شد`);
    const bal = user.balance || 0;
    let t = `<b>🛒 تأیید خرید</b>\n━━━━━━━━━━━━━━━━━━\n\n${p.icon} <b>${p.name}</b>\n${IC.data} حجم: ${p.dataLimit} GB\n${IC.clock} مدت: ${p.duration} روز\n${IC.money} قیمت: <b>${p.price.toLocaleString()}</b> تومان\n\n`;

    if (bal >= p.price) {
      t += `${IC.check} موجودی کافی است.`;
      return sendMsg(env, chatId, t, { inline_keyboard: [
        [{ text: `${IC.check} ✅ تأیید و خرید`, callback: `confirm:${pid}` }],
        [{ text: `${IC.cross} ❌ انصراف`, callback: 'nav:shop' }],
      ]});
    } else {
      t += `${IC.cross} موجودی ناکافی!\nنیاز: ${p.price.toLocaleString()} | موجودی: ${bal.toLocaleString()}`;
      return sendMsg(env, chatId, t, { inline_keyboard: [
        [{ text: `${IC.wallet} 💳 شارژ`, callback: 'act:charge' }],
        [{ text: `${IC.back} بازگشت`, callback: 'nav:shop' }],
      ]});
    }
  }

  // Confirm buy
  if (data.startsWith('confirm:')) {
    const pid = data.replace('confirm:', '');
    const plans = await getPlans(env);
    const p = plans.find(x => x.id === pid);
    if (!p) { await answerCb(env, cbId, '❌ خطا!', true); return; }

    const u = await getUser(env, user.telegramId) || user;
    if ((u.balance||0) < p.price) { await answerCb(env, cbId, '❌ موجودی ناکافی!', true); return showShop(env, chatId, user); }

    const now = new Date();
    const ex = new Date(u.expiryDate || now);
    if (ex < now) ex.setTime(now.getTime());
    ex.setDate(ex.getDate() + p.duration);

    await updateUser(env, user.telegramId, {
      balance: (u.balance||0) - p.price, dataLimit: p.dataLimit, dataUsed: 0,
      expiryDate: ex.toISOString(), status: 'active', concurrentLimit: p.concurrentLimit,
    });
    await addTransaction(env, { userId: u.telegramId, type: 'purchase', amount: p.price, description: `خرید ${p.name}`, planId: p.id });
    await logEvent(env, 'purchase', { userId: u.telegramId, plan: p.name, amount: p.price });
    await answerCb(env, cbId, '🎉 خرید موفق!', true);

    let st = `<b>${IC.check} خرید موفق! 🎉</b>\n━━━━━━━━━━━━━━━━━━\n\n${p.icon} <b>${p.name}</b>\n${IC.data} حجم: ${p.dataLimit} GB\n${IC.clock} انقضا: ${ex.toLocaleDateString('fa-IR')}\n\n${IC.link} لینک: <code>/sub/${u.configUUID}</code>`;
    return sendMsg(env, chatId, st, { inline_keyboard: [
      [{ text: `${IC.copy} 📋 کپی لینک`, callback: 'act:copy_sub' }],
      [{ text: `${IC.home} بازگشت`, callback: 'nav:home' }],
    ]});
  }

  // Toggle auto renew
  if (data === 'act:toggle_renew') {
    const u = await getUser(env, user.telegramId) || user;
    await updateUser(env, user.telegramId, { autoRenew: !u.autoRenew });
    await answerCb(env, cbId, u.autoRenew ? '❌ غیرفعال شد' : '✅ فعال شد', true);
    return showProfile(env, chatId, user);
  }

  // Reset config
  if (data === 'act:reset_cfg') {
    await updateUser(env, user.telegramId, { configUUID: generateUUID() });
    await answerCb(env, cbId, '🔄 بازنشانی شد!', true);
    await logEvent(env, 'config_reset', { userId: user.telegramId });
    return showMySub(env, chatId, user);
  }

  // Default
  await answerCb(env, cbId);
  return sendMsg(env, chatId, `${IC.info} در حال توسعه...`);
}

// ─── COMMAND HANDLER ───────────────────────────────────
async function onCommand(env, chatId, cmd, args, user) {
  if (cmd === 'start') {
    if (args && args.startsWith('ref_')) {
      const refId = args.replace('ref_', '');
      if (refId != user.telegramId) {
        const ref = await getUser(env, refId);
        if (ref && !user.referredBy) {
          await updateUser(env, refId, { referralCount: (ref.referralCount||0)+1, referralCredit: (ref.referralCredit||0)+5000 });
          await updateUser(env, user.telegramId, { referredBy: refId });
          await logEvent(env, 'referral', { userId: refId, newUserId: user.telegramId });
        }
      }
    }
    return showHome(env, chatId, user);
  }
  if (cmd === 'menu' || cmd === 'home') return showHome(env, chatId, user);
  if (cmd === 'shop' || cmd === 'plans') return showShop(env, chatId, user);
  if (cmd === 'status') return showStatus(env, chatId, user);
  if (cmd === 'wallet') return showWallet(env, chatId, user);
  if (cmd === 'profile' || cmd === 'me') return showProfile(env, chatId, user);
  if (cmd === 'sub' || cmd === 'link') return showMySub(env, chatId, user);
  if (cmd === 'referral' || cmd === 'invite') return showReferral(env, chatId, user);
  if (cmd === 'support') return showSupport(env, chatId);
  if (cmd === 'help') return showHelp(env, chatId);
  return showHome(env, chatId, user);
}

// ─── MAIN WEBHOOK HANDLER ──────────────────────────────
export async function handleTelegramWebhook(request, env, ctx) {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const body = await request.json();
  console.log('TG Update:', JSON.stringify(body).slice(0, 200));

  // Handle callback query
  if (body.callback_query) {
    const cb = body.callback_query;
    const chatId = cb.message.chat.id;
    const data = cb.data;
    const msgId = cb.message.message_id;
    const cbId = cb.id;

    // Get or create user
    let user = await getUser(env, chatId);
    if (!user) {
      user = {
        id: generateUUID(), telegramId: chatId,
        name: cb.from.first_name || 'User',
        username: cb.from.username || '',
        status: 'inactive', balance: 0, dataLimit: 0, dataUsed: 0,
        configUUID: generateUUID(), createdAt: getNow(), updatedAt: getNow(),
        devices: [], ips: [], referralCount: 0, referralCredit: 0, autoRenew: false,
      };
      const users = await getUsers(env);
      users.push(user);
      await saveUsers(env, users);
    }

    return onCallback(env, chatId, data, msgId, cbId, user);
  }

  // Handle message
  if (body.message) {
    const msg = body.message;
    const chatId = msg.chat.id;

    // Get or create user
    let user = await getUser(env, chatId);
    if (!user) {
      user = {
        id: generateUUID(), telegramId: chatId,
        name: msg.from.first_name || 'User',
        username: msg.from.username || '',
        status: 'inactive', balance: 0, dataLimit: 0, dataUsed: 0,
        configUUID: generateUUID(), createdAt: getNow(), updatedAt: getNow(),
        devices: [], ips: [], referralCount: 0, referralCredit: 0, autoRenew: false,
      };
      const users = await getUsers(env);
      users.push(user);
      await saveUsers(env, users);
    }

    // Handle text commands
    if (msg.text) {
      const text = msg.text.trim();
      if (text.startsWith('/')) {
        const parts = text.split(' ');
        const cmd = parts[0].replace('/', '').split('@')[0];
        const args = parts.slice(1).join(' ');
        return onCommand(env, chatId, cmd, args, user);
      }
      // Default: show menu
      return showHome(env, chatId, user);
    }
  }

  return jsonResponse({ ok: true });
}

// ─── SET WEBHOOK ───────────────────────────────────────
export async function setWebhook(env) {
  const url = `https://${env.PANEL_DOMAIN}/api/telegram/webhook`;
  const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook?url=${encodeURIComponent(url)}&allowed_updates=["message","callback_query"]`);
  const data = await res.json();
  return jsonResponse({ webhook: data, url });
}
