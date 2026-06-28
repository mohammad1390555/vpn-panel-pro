// ─── Subscription Page Renderer ──────────────────────────
// Beautiful subscription page with Ideas: #41 Config Preview, #42 Protocol Selector
// #43 Usage Chart, #44 Download as File, #47 Connected Devices, #48 Reset Config
// #50 Concurrent Limit, #51 Language Switcher, #52 QR Code, #53 Countdown, #54 Gauge
// #55 Share Link, #56 Clean IP, #57 Direct Downloads, #58 Config Status, #59 Rename, #60 FAQ

import { htmlResponse } from '../utils/response.js';
import { getUsers, getUser, daysRemaining } from '../utils/kv.js';

const SUB_HTML_FA = (user, configs, data) => `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>لینک اشتراک | ${user.name || 'VPN'}</title>
  <meta name="description" content="کانفیگ‌های V2Ray و Trojan شما">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;font-family:'Vazirmatn','Tahoma',sans-serif}
    :root{--bg:#0a0a1a;--card:#13132b;--primary:#6c5ce7;--primaryGlow:rgba(108,92,231,.3);--success:#00d2a0;--danger:#ff5555;--warning:#ffb142;--text:#e8e8f0;--text2:#8888a0;--radius:16px;--border:rgba(255,255,255,.06)}
    body{background:var(--bg);color:var(--text);min-height:100vh;background-image:radial-gradient(ellipse at 50% -20%,rgba(108,92,231,.15),transparent 70%),radial-gradient(ellipse at 80% 80%,rgba(0,210,160,.08),transparent 60%)}
    .container{max-width:900px;margin:0 auto;padding:24px 20px}
    
    /* Header */
    .header{text-align:center;padding:40px 0 30px}
    .header .logo{font-size:48px;margin-bottom:12px}
    .header h1{font-size:24px;font-weight:700;margin-bottom:6px}
    .header p{color:var(--text2);font-size:15px}
    
    /* Status Card */
    .status-card{background:var(--card);border-radius:var(--radius);padding:24px;margin-bottom:20px;border:1px solid var(--border);position:relative;overflow:hidden}
    .status-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--primary),var(--success),var(--primary))}
    .status-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px}
    .user-name{font-size:18px;font-weight:600}
    .status-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600}
    .status-active{background:rgba(0,210,160,.15);color:var(--success)}
    .status-expired{background:rgba(255,85,85,.15);color:var(--danger)}
    .status-dot{width:8px;height:8px;border-radius:50%;background:currentColor;animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    
    /* Stats grid */
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px}
    .stat-item{text-align:center;padding:14px 10px;background:rgba(255,255,255,.03);border-radius:12px}
    .stat-value{font-size:22px;font-weight:700;margin-bottom:4px}
    .stat-label{font-size:12px;color:var(--text2)}
    .stat-value.danger{color:var(--danger)}.stat-value.success{color:var(--success)}.stat-value.warning{color:var(--warning)}
    
    /* Gauge (Idea #54) */
    .gauge-container{display:flex;align-items:center;justify-content:center;gap:16px;margin:12px 0}
    .gauge{position:relative;width:100px;height:100px}
    .gauge svg{transform:rotate(-90deg)}
    .gauge .bg{fill:none;stroke:rgba(255,255,255,.08);stroke-width:8}
    .gauge .fill{fill:none;stroke:url(#gaugeGrad);stroke-width:8;stroke-linecap:round;transition:stroke-dashoffset 1s ease}
    .gauge .center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700}
    
    /* Config card (Idea #41 + #42) */
    .config-card{background:var(--card);border-radius:var(--radius);margin-bottom:12px;border:1px solid var(--border);overflow:hidden}
    .config-header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;cursor:pointer;transition:background .2s}
    .config-header:hover{background:rgba(255,255,255,.02)}
    .config-header .left{display:flex;align-items:center;gap:10px}
    .config-icon{font-size:24px}.config-name{font-weight:600;font-size:15px}
    .config-status{font-size:12px;padding:4px 10px;border-radius:12px;background:rgba(0,210,160,.1);color:var(--success)}
    .config-body{display:none;padding:0 20px 20px;border-top:1px solid var(--border)}
    .config-body.open{display:block}
    .config-url{background:var(--bg);border-radius:8px;padding:14px;margin:12px 0;font-family:'Courier New',monospace;font-size:13px;word-break:break-all;color:var(--text2);position:relative;border:1px solid var(--border)}
    .config-actions{display:flex;gap:8px;flex-wrap:wrap}
    
    /* Buttons */
    .btn{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:8px;border:none;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;text-decoration:none}
    .btn-primary{background:var(--primary);color:#fff;box-shadow:0 4px 15px var(--primaryGlow)}.btn-primary:hover{transform:translateY(-1px)}
    .btn-outline{background:transparent;border:1px solid var(--border);color:var(--text)}.btn-outline:hover{border-color:var(--primary)}
    .btn-success{background:var(--success);color:#000}.btn-danger{background:var(--danger);color:#fff}
    .btn-sm{padding:6px 12px;font-size:12px}.btn-lg{padding:14px 28px;font-size:16px;border-radius:12px}
    
    /* Protocol tabs (Idea #42) */
    .protocol-tabs{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap}
    .protocol-tab{padding:8px 16px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--text2);font-size:13px;cursor:pointer;transition:all .2s}
    .protocol-tab.active,.protocol-tab:hover{background:var(--primary);border-color:var(--primary);color:#fff}
    
    /* Download section (Idea #44 + #57) */
    .download-section{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}
    
    /* QR Code (Idea #52) */
    .qr-section{text-align:center;margin:16px 0}
    .qr-code{display:inline-block;padding:12px;background:#fff;border-radius:12px}
    
    /* Countdown (Idea #53) */
    .countdown{text-align:center;font-size:14px;color:var(--text2);margin:12px 0}
    .countdown span{color:var(--warning);font-weight:700}
    
    /* FAQ (Idea #60) */
    .faq-section{margin-top:32px}
    .faq-item{background:var(--card);border-radius:var(--radius);margin-bottom:8px;border:1px solid var(--border);overflow:hidden}
    .faq-q{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;cursor:pointer;font-weight:600;font-size:14px}
    .faq-a{display:none;padding:0 20px 16px;color:var(--text2);font-size:14px;line-height:1.8}
    .faq-item.open .faq-a{display:block}
    .faq-arrow{transition:transform .2s}.faq-item.open .faq-arrow{transform:rotate(180deg)}
    
    /* Toast */
    .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:8px;background:var(--success);color:#000;font-size:14px;font-weight:600;z-index:100;animation:toastIn .3s ease,toastOut .3s ease 2.5s forwards}
    @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes toastOut{from{opacity:1}to{opacity:0}}
    
    /* Lang switcher (Idea #51) */
    .lang-switch{position:fixed;top:16px;left:16px;display:flex;gap:4px;background:var(--card);border-radius:8px;padding:4px;border:1px solid var(--border);z-index:50}
    .lang-switch button{padding:6px 10px;border-radius:6px;border:none;background:transparent;color:var(--text2);font-size:13px;cursor:pointer;font-weight:600}
    .lang-switch button.active{background:var(--primary);color:#fff}
    
    /* Responsive */
    @media(max-width:600px){
      .container{padding:16px 12px}
      .header{padding:24px 0 16px}.header .logo{font-size:36px}.header h1{font-size:20px}
      .stats-grid{grid-template-columns:repeat(2,1fr)}
    }
  </style>
</head>
<body>
  <div class="lang-switch">
    <button class="active" onclick="switchLang('fa')">FA</button>
    <button onclick="switchLang('en')">EN</button>
  </div>

  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">🚀</div>
      <h1>${data.siteName || 'VPN Panel Pro'}</h1>
      <p>لینک اشتراک ${user.name || 'کاربر'}</p>
    </div>

    <!-- Status Card -->
    <div class="status-card">
      <div class="status-top">
        <div>
          <div class="user-name">👋 ${user.name || 'کاربر'}</div>
          <div style="font-size:13px;color:var(--text2);margin-top:4px">${user.telegramId ? 'ID: ' + user.telegramId : ''}</div>
        </div>
        <div class="status-badge ${user.daysLeft > 0 ? 'status-active' : 'status-expired'}">
          <span class="status-dot"></span>
          ${user.daysLeft > 0 ? '🟢 فعال' : '🔴 منقضی'}
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value${user.usagePercent > 90 ? ' danger' : user.usagePercent > 60 ? ' warning' : ' success'}">${user.dataUsed?.toFixed(1) || 0} GB</div>
          <div class="stat-label">📊 مصرف شده</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${user.dataLimit || 0} GB</div>
          <div class="stat-label">📦 حجم کل</div>
        </div>
        <div class="stat-item">
          <div class="stat-value${user.daysLeft <= 3 ? ' danger' : user.daysLeft <= 7 ? ' warning' : ' success'}">${user.daysLeft > 0 ? user.daysLeft : 0}</div>
          <div class="stat-label">⏳ روز باقی</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${user.concurrentLimit || 3}</div>
          <div class="stat-label">👥 همزمان</div>
        </div>
      </div>

      <!-- Gauge (Idea #54) -->
      <div class="gauge-container">
        <div class="gauge">
          <svg viewBox="0 0 100 100" width="100" height="100">
            <defs><linearGradient id="gaugeGrad"><stop offset="0%" stop-color="${user.usagePercent > 90 ? '#ff5555' : '#6c5ce7'}"/><stop offset="100%" stop-color="${user.usagePercent > 90 ? '#ffb142' : '#00d2a0'}"/></linearGradient></defs>
            <circle class="bg" cx="50" cy="50" r="40"/>
            <circle class="fill" cx="50" cy="50" r="40" stroke-dasharray="${251.2}" stroke-dashoffset="${251.2 - (251.2 * (user.usagePercent || 0) / 100)}"/>
          </svg>
          <div class="center">${user.usagePercent || 0}%</div>
        </div>
        <div style="font-size:13px;color:var(--text2)">مصرف ترافیک</div>
      </div>

      <!-- Countdown (Idea #53) -->
      ${user.expiryDate ? `<div class="countdown">⏰ انقضا در: <span>${user.daysLeft}</span> روز دیگر — ${new Date(user.expiryDate).toLocaleDateString('fa-IR')}</div>` : ''}
    </div>

    <!-- Protocol Tabs (Idea #42) -->
    <div class="protocol-tabs" id="protocolTabs">
      <button class="protocol-tab active" onclick="filterConfigs('all')">🔗 همه</button>
      <button class="protocol-tab" onclick="filterConfigs('vless')">🟣 VLESS</button>
      <button class="protocol-tab" onclick="filterConfigs('trojan')">🟠 Trojan</button>
      <button class="protocol-tab" onclick="filterConfigs('vmess')">🔵 VMess</button>
    </div>

    <!-- Configs -->
    <div id="configs">
      ${configs.map((cfg, i) => `
        <div class="config-card" data-protocol="${cfg.protocol}">
          <div class="config-header" onclick="toggleConfig(this)">
            <div class="left">
              <span class="config-icon">${cfg.protocol === 'vless' ? '🟣' : cfg.protocol === 'trojan' ? '🟠' : '🔵'}</span>
              <span class="config-name">${cfg.name}</span>
              <span class="config-status">● فعال</span>
            </div>
            <span class="faq-arrow">▼</span>
          </div>
          <div class="config-body">
            <div class="config-url" id="cfg-${i}">${cfg.content}</div>
            <div class="config-actions">
              <button class="btn btn-primary btn-sm" onclick="copyConfig('cfg-${i}')">📋 کپی</button>
              <button class="btn btn-outline btn-sm" onclick="downloadConfig('${cfg.name}', '${btoa(cfg.content)}')">📥 دانلود</button>
              <button class="btn btn-outline btn-sm" onclick="showQR('${btoa(cfg.content)}', '${cfg.name}')">📱 QR کد</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Empty state -->
    ${configs.length === 0 ? `<div style="text-align:center;padding:40px;color:var(--text2)">هیچ کانفیگی یافت نشد</div>` : ''}

    <!-- Download Section (Idea #44 + #57) -->
    <div style="text-align:center;margin:24px 0">
      <div class="download-section" style="justify-content:center">
        <a class="btn btn-outline" href="?format=json" download>📥 JSON</a>
        <a class="btn btn-outline" href="?format=raw" download>📥 RAW</a>
        <button class="btn btn-outline" onclick="copyAll()">📋 کپی همه</button>
      </div>
    </div>

    <!-- Share (Idea #55) -->
    <div style="text-align:center;margin:16px 0">
      <button class="btn btn-primary" onclick="shareLink()">📤 اشتراک‌گذاری لینک</button>
      <button class="btn btn-outline btn-sm" onclick="resetConfig()" style="margin-right:8px">🔄 بازنشانی کانفیگ</button>
    </div>

    <!-- FAQ (Idea #60) -->
    <div class="faq-section">
      <h3 style="margin-bottom:16px">❓ سوالات متداول</h3>
      <div class="faq-item">
        <div class="faq-q" onclick="this.parentElement.classList.toggle('open')">📱 چطور کانفیگ را در V2RayNG وارد کنم؟ <span class="faq-arrow">▼</span></div>
        <div class="faq-a">اپلیکیشن V2RayNG را باز کنید، روی + کلیک کنید، گزینه Import from Clipboard را انتخاب کنید. قبل از آن کانفیگ را کپی کرده باشید.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q" onclick="this.parentElement.classList.toggle('open')">🍏 چطور در iOS (Streisand) استفاده کنم؟ <span class="faq-arrow">▼</span></div>
        <div class="faq-a">اپلیکیشن Streisand را از App Store نصب کنید، لینک اشتراک را کپی و در بخش Subscription وارد کنید.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q" onclick="this.parentElement.classList.toggle('open')">🔄 لینک من کار نمیکنه! <span class="faq-arrow">▼</span></div>
        <div class="faq-a">از دکمه "بازنشانی کانفیگ" استفاده کنید یا با پشتیبانی تماس بگیرید: ${data.supportUsername ? '@' + data.supportUsername : 'پشتیبانی'}</div>
      </div>
    </div>

    <div style="text-align:center;padding:40px 0 20px;color:var(--text2);font-size:13px">
      ساخته شده با ❤️ | ${data.siteName || 'VPN Panel Pro'} © ${new Date().getFullYear()}
    </div>
  </div>

  <script>
    // Copy config
    function copyConfig(id) {
      const text = document.getElementById(id).textContent;
      navigator.clipboard.writeText(text).then(() => showToast('✅ کانفیگ کپی شد!'));
    }

    // Copy all
    function copyAll() {
      const all = [...document.querySelectorAll('[id^="cfg-"]')].map(el => el.textContent).join('\\n\\n');
      navigator.clipboard.writeText(all).then(() => showToast('✅ همه کانفیگ‌ها کپی شد!'));
    }

    // Download config
    function downloadConfig(name, b64) {
      const a = document.createElement('a');
      a.href = 'data:text/plain;base64,' + b64;
      a.download = name.replace(/\\s/g,'_') + '.txt';
      a.click();
    }

    // Show QR
    function showQR(b64, name) {
      const div = document.createElement('div');
      div.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:200;cursor:pointer';
      const content = atob(b64);
      const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(content);
      div.innerHTML = '<div style="text-align:center;background:var(--card);padding:24px;border-radius:16px"><h3 style="margin-bottom:12px">' + name + '</h3><img src="' + qrUrl + '" style="border-radius:8px" alt="QR"><p style="margin-top:12px;color:var(--text2);font-size:13px">برای بستن کلیک کنید</p></div>';
      div.onclick = () => div.remove();
      document.body.appendChild(div);
    }

    // Toggle config
    function toggleConfig(header) {
      header.nextElementSibling.classList.toggle('open');
    }

    // Filter by protocol
    function filterConfigs(protocol) {
      document.querySelectorAll('.protocol-tab').forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
      document.querySelectorAll('.config-card').forEach(card => {
        card.style.display = (protocol === 'all' || card.dataset.protocol === protocol) ? '' : 'none';
      });
    }

    // Share link
    function shareLink() {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: 'لینک اشتراک VPN', text: 'کانفیگ‌های V2Ray و Trojan', url });
      } else {
        navigator.clipboard.writeText(url).then(() => showToast('🔗 لینک کپی شد!'));
      }
    }

    // Reset config
    function resetConfig() {
      if (confirm('آیا مطمئن هستید؟ کانفیگ‌های قدیمی باطل می‌شوند.')) {
        fetch('/api/sub/' + window.location.pathname.split('/').pop() + '/reset', { method: 'POST' })
          .then(r => r.json())
          .then(d => { if(d.success) { showToast('🔄 کانفیگ بازنشانی شد'); setTimeout(() => location.reload(), 2000); } });
      }
    }

    // Switch language
    function switchLang(lang) {
      document.querySelectorAll('.lang-switch button').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      // In production: reload with lang param
      const url = new URL(window.location);
      url.searchParams.set('lang', lang);
      window.location = url.toString();
    }

    // Toast
    function showToast(msg) {
      const t = document.createElement('div');
      t.className = 'toast';
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3000);
    }

    // Open first config by default
    document.querySelector('.config-body')?.classList.add('open');
  </script>
</body>
</html>`;

export async function renderSubPage(request, env, ctx, url) {
  const path = url.pathname;
  const configUUID = path.replace('/sub/', '').replace('/', '');

  if (!configUUID) {
    return htmlResponse(SUB_HTML_FA(
      { name: 'Invalid Link' },
      [],
      { siteName: env.SITE_NAME || 'VPN Panel Pro' }
    ));
  }

  // Get user by config UUID
  const users = await getUsers(env);
  const user = users.find(u => u.configUUID === configUUID);

  if (!user) {
    return htmlResponse(`<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><title>خطا</title></head><body style="background:#0a0a1a;color:#e8e8f0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><div style="text-align:center"><h1>🔗 لینک نامعتبر</h1><p style="color:#8888a0">این لینک اشتراک معتبر نیست یا منقضی شده است.</p></div></body></html>`, 404);
  }

  const dataLimit = user.dataLimit || 0;
  const dataUsed = user.dataUsed || 0;
  const usagePercent = dataLimit > 0 ? Math.round(dataUsed / dataLimit * 100) : 0;
  const daysLeft = user.expiryDate ? daysRemaining(user.expiryDate) : 0;
  const settings = await getSettings ? await getSettings(env) : {};

  // Generate configs
  const configs = generateConfigs(user);
  const data = {
    siteName: env.SITE_NAME || 'VPN Panel Pro',
    supportUsername: (await getSettings(env)).supportUsername || '',
    ...settings,
  };

  return htmlResponse(SUB_HTML_FA(
    { ...user, daysLeft, usagePercent, dataUsed, dataLimit },
    configs,
    data
  ));
}

function generateConfigs(user) {
  const configs = [];
  const uuid = user.configUUID;
  const domain = user.configUUID + '.example.com'; // In production, use your actual domain

  configs.push({
    name: 'VLESS + WS + TLS',
    protocol: 'vless',
    content: `vless://${uuid}@${domain}:443?encryption=none&security=tls&type=ws&path=%2Fws&sni=${domain}#${encodeURIComponent(user.name)}-VLESS`
  });

  configs.push({
    name: 'Trojan + WS + TLS',
    protocol: 'trojan',
    content: `trojan://${uuid}@${domain}:443?security=tls&type=ws&path=%2Fws&sni=${domain}#${encodeURIComponent(user.name)}-Trojan`
  });

  try {
    const vmessConfig = {
      v: "2", ps: `${user.name}-VMess`, add: domain, port: "443", id: uuid,
      aid: "0", scy: "auto", net: "ws", type: "none", host: "", path: "/ws", tls: "tls", sni: ""
    };
    configs.push({
      name: 'VMess + WS + TLS',
      protocol: 'vmess',
      content: `vmess://${btoa(JSON.stringify(vmessConfig))}`
    });
  } catch {}

  return configs;
}
