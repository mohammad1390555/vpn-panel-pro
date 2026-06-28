// ─── Web Panel Renderer ─────────────────────────────────
// Returns the admin panel HTML shell; React SPA mounts here

import { htmlResponse } from '../utils/response.js';

const PANEL_HTML = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>پنل مدیریت | VPN Panel Pro</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;font-family:'Vazirmatn','Tahoma',sans-serif}
    :root{--bg:#0f172a;--card:#1e293b;--primary:#3b82f6;--primaryHover:#2563eb;--success:#10b981;--danger:#ef4444;--warning:#f59e0b;--text:#f1f5f9;--textSecondary:#94a3b8;--border:#334155;--radius:12px;--shadow:0 4px 24px rgba(0,0,0,.3)}
    body{background:var(--bg);color:var(--text);min-height:100vh}
    #root{min-height:100vh}
    .login-container{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
    .login-card{background:var(--card);border-radius:var(--radius);padding:40px;width:100%;max-width:420px;box-shadow:var(--shadow);border:1px solid var(--border)}
    .login-card h1{text-align:center;margin-bottom:8px;font-size:24px}
    .login-card p{text-align:center;color:var(--textSecondary);margin-bottom:24px}
    .form-group{margin-bottom:16px}
    .form-group label{display:block;margin-bottom:6px;font-size:14px;color:var(--textSecondary)}
    .form-group input{width:100%;padding:12px 16px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:14px;outline:none;transition:border .2s}
    .form-group input:focus{border-color:var(--primary)}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;width:100%}
    .btn-primary{background:var(--primary);color:#fff}.btn-primary:hover{background:var(--primaryHover)}
    .btn-success{background:var(--success);color:#fff}.btn-danger{background:var(--danger);color:#fff}
    .btn-outline{background:transparent;border:1px solid var(--border);color:var(--text)}.btn-outline:hover{border-color:var(--primary)}
    .layout{display:flex;min-height:100vh}
    .sidebar{width:260px;background:var(--card);border-left:1px solid var(--border);padding:20px;display:flex;flex-direction:column;position:fixed;right:0;top:0;bottom:0;z-index:100}
    .sidebar h2{font-size:18px;margin-bottom:24px;display:flex;align-items:center;gap:10px}
    .sidebar nav{flex:1;display:flex;flex-direction:column;gap:4px}
    .sidebar nav a{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;color:var(--textSecondary);text-decoration:none;font-size:14px;transition:all .2s}
    .sidebar nav a:hover,.sidebar nav a.active{background:var(--primary);color:#fff}
    .main-content{flex:1;margin-right:260px;padding:24px}
    .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
    .header h1{font-size:24px}
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:24px}
    .stat-card{background:var(--card);border-radius:var(--radius);padding:20px;border:1px solid var(--border)}
    .stat-card .icon{font-size:28px;margin-bottom:8px}
    .stat-card .value{font-size:28px;font-weight:700;margin-bottom:4px}
    .stat-card .label{font-size:13px;color:var(--textSecondary)}
    .card{background:var(--card);border-radius:var(--radius);border:1px solid var(--border);overflow:hidden}
    .card-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)}
    .card-header h3{font-size:16px}
    .card-body{padding:20px}
    table{width:100%;border-collapse:collapse}
    th,td{padding:12px 16px;text-align:right;font-size:14px}
    th{color:var(--textSecondary);font-weight:600;border-bottom:1px solid var(--border)}
    td{border-bottom:1px solid var(--border)}
    tr:hover td{background:rgba(59,130,246,.05)}
    .badge{display:inline-block;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600}
    .badge-success{background:rgba(16,185,129,.2);color:var(--success)}
    .badge-danger{background:rgba(239,68,68,.2);color:var(--danger)}
    .badge-warning{background:rgba(245,158,11,.2);color:var(--warning)}
    .badge-info{background:rgba(59,130,246,.2);color:var(--primary)}
    .progress-bar{height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin-top:4px}
    .progress-bar .fill{height:100%;border-radius:4px;transition:width .3s}
    .fill-green{background:var(--success)}.fill-yellow{background:var(--warning)}.fill-red{background:var(--danger)}
    .alert{display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:14px}
    .alert-success{background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.3);color:var(--success)}
    .alert-danger{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);color:var(--danger)}
    .alert-warning{background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3);color:var(--warning)}
    input,select,textarea{width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:14px;outline:none}
    input:focus,select:focus{border-color:var(--primary)}
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:200}
    .modal{background:var(--card);border-radius:var(--radius);padding:24px;width:90%;max-width:500px;max-height:90vh;overflow-y:auto;border:1px solid var(--border)}
    .toast{position:fixed;bottom:20px;left:20px;padding:14px 20px;border-radius:8px;font-size:14px;z-index:300;animation:slideIn .3s ease}
    @keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}
    .flex-row{display:flex;gap:12px;align-items:center}
    .search-box{position:relative}
    .search-box input{padding-left:40px}
    .search-box .search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--textSecondary)}
    @media(max-width:768px){.sidebar{width:200px}.main-content{margin-right:200px}.stats-grid{grid-template-columns:1fr}}
    @media(max-width:600px){.layout{flex-direction:column}.sidebar{position:static;width:100%;border-left:none;border-bottom:1px solid var(--border);flex-direction:row;overflow-x:auto;padding:12px}.sidebar nav{flex-direction:row}.main-content{margin-right:0}}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    // ── Panel API Client ──────────────────────────
    const API_BASE = '/api';
    let authToken = localStorage.getItem('admin_token') || '';

    async function api(path, options = {}) {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['X-Admin-Key'] = authToken;
      const res = await fetch(API_BASE + path, { ...options, headers });
      return res.json();
    }

    // ── React-like simple UI framework ────────────
    const useState = (init) => { let v = init; return [()=>v, (nv) => { v = typeof nv === 'function' ? nv(v) : nv }] };
    let _renderRoot, _currentView;

    function render(view, container) {
      _currentView = view;
      _renderRoot = container || _renderRoot;
      if (!_renderRoot) return;
      _renderRoot.innerHTML = '';
      _renderRoot.appendChild(view());
    }

    function h(tag, props = {}, ...children) {
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(props)) {
        if (k === 'className') el.className = v;
        else if (k === 'style') Object.assign(el.style, v);
        else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'htmlContent') el.innerHTML = v;
        else el.setAttribute(k, v);
      }
      for (const child of children.flat()) {
        if (child === null || child === undefined) continue;
        if (typeof child === 'string' || typeof child === 'number') el.appendChild(document.createTextNode(child));
        else if (child instanceof Node) el.appendChild(child);
      }
      return el;
    }

    // ── Toast ─────────────────────────────────────
    function showToast(msg, type = 'success') {
      const toast = h('div', { className: 'toast', style: { background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b' } }, msg);
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }

    // ── Login View ────────────────────────────────
    function LoginView() {
      let password = '';
      const container = h('div', { className: 'login-container' },
        h('div', { className: 'login-card' },
          h('h1', {}, '🛡️ VPN Panel Pro'),
          h('p', {}, 'پنل مدیریت حرفه‌ای'),
          h('div', { className: 'form-group' },
            h('label', {}, 'رمز عبور مدیریت'),
            h('input', { type: 'password', placeholder: '••••••••', oninput: (e) => password = e.target.value, onkeydown: (e) => { if(e.key==='Enter') doLogin() } })
          ),
          h('button', { className: 'btn btn-primary', onclick: doLogin }, '🚀 ورود به پنل')
        )
      );

      async function doLogin() {
        if (!password) return showToast('رمز عبور را وارد کنید', 'error');
        const res = await api('/auth/login', { method: 'POST', body: JSON.stringify({ password }) });
        if (res.success) {
          authToken = res.data.token;
          localStorage.setItem('admin_token', authToken);
          render(DashboardView);
        } else {
          showToast('رمز عبور اشتباه است', 'error');
        }
      }

      return container;
    }

    // ── Dashboard View ────────────────────────────
    async function DashboardView() {
      const statsRes = await api('/stats/dashboard');
      const stats = statsRes.success ? statsRes.data.stats : {};

      return h('div', { className: 'layout' },
        Sidebar('dashboard'),
        h('div', { className: 'main-content' },
          h('div', { className: 'header' },
            h('h1', {}, '📊 داشبورد'),
            h('button', { className: 'btn btn-outline', style: { width: 'auto' }, onclick: () => { localStorage.removeItem('admin_token'); render(LoginView) } }, '🚪 خروج')
          ),
          h('div', { className: 'stats-grid' },
            StatCard('👥', stats.totalUsers || 0, 'کل کاربران', 'info'),
            StatCard('✅', stats.activeUsers || 0, 'کاربران فعال', 'success'),
            StatCard('⏳', stats.expiredUsers || 0, 'منقضی شده', 'warning'),
            StatCard('🆕', stats.newThisMonth || 0, 'جدید این ماه', 'info'),
            StatCard('💰', (stats.revenueThisMonth || 0).toLocaleString() + ' T', 'درآمد این ماه', 'success'),
            StatCard('📦', (stats.totalDataUsed || 0).toFixed(1) + ' GB', 'مصرف کل', 'warning'),
          ),
          h('div', { className: 'card' },
            h('div', { className: 'card-header' }, h('h3', {}, '🕐 تراکنش‌های اخیر')),
            h('div', { className: 'card-body' },
              h('table', {},
                h('thead', {}, h('tr', {}, h('th', {}, 'نوع'), h('th', {}, 'مبلغ'), h('th', {}, 'توضیحات'), h('th', {}, 'تاریخ'))),
                h('tbody', {}, ...(stats.recentTransactions || []).map(tx =>
                  h('tr', {},
                    h('td', {}, tx.type === 'purchase' ? '🛒 خرید' : tx.type === 'deposit' ? '💰 شارژ' : tx.type),
                    h('td', {}, (tx.amount || 0).toLocaleString() + ' تومان'),
                    h('td', {}, tx.description || ''),
                    h('td', {}, new Date(tx.createdAt).toLocaleDateString('fa-IR'))
                  )
                ))
              )
            )
          )
        )
      );
    }

    function StatCard(icon, value, label, color) {
      return h('div', { className: 'stat-card' },
        h('div', { className: 'icon' }, icon),
        h('div', { className: 'value' }, String(value)),
        h('div', { className: 'label' }, label)
      );
    }

    // ── Users View ────────────────────────────────
    async function UsersView() {
      const res = await api('/users?limit=50');
      const users = res.success ? res.data.users : [];

      return h('div', { className: 'layout' },
        Sidebar('users'),
        h('div', { className: 'main-content' },
          h('div', { className: 'header' },
            h('h1', {}, '👥 مدیریت کاربران'),
            h('div', { className: 'flex-row' },
              h('div', { className: 'search-box' },
                h('span', { className: 'search-icon' }, '🔍'),
                h('input', { placeholder: 'جستجوی کاربر...', id: 'userSearch', oninput: searchUsers })
              ),
              h('button', { className: 'btn btn-primary', style: { width: 'auto' }, onclick: () => showAddUserModal() }, '➕ کاربر جدید')
            )
          ),
          h('div', { className: 'card' },
            h('div', { className: 'card-body' },
              h('table', {},
                h('thead', {}, h('tr', {},
                  h('th', {}, 'کاربر'), h('th', {}, 'وضعیت'), h('th', {}, 'حجم'),
                  h('th', {}, 'انقضا'), h('th', {}, 'روز باقی'), h('th', {}, 'عملیات')
                )),
                h('tbody', { id: 'usersTable' }, ...users.map(u =>
                  h('tr', {},
                    h('td', {}, h('div', {}, h('b', {}, u.name || 'بدون نام'), h('div', { style: { fontSize: '12px', color: 'var(--textSecondary)' } }, 'ID: ' + u.telegramId))),
                    h('td', {}, h('span', { className: 'badge ' + (u.status === 'active' ? 'badge-success' : u.status === 'disabled' ? 'badge-danger' : 'badge-warning') }, u.status === 'active' ? 'فعال' : u.status === 'disabled' ? 'غیرفعال' : 'منقضی')),
                    h('td', {},
                      h('div', {}, (u.dataUsed || 0).toFixed(1) + ' / ' + (u.dataLimit || 0) + ' GB'),
                      h('div', { className: 'progress-bar' },
                        h('div', { className: 'fill ' + (u.usagePercent > 90 ? 'fill-red' : u.usagePercent > 60 ? 'fill-yellow' : 'fill-green'), style: { width: u.usagePercent + '%' } })
                      )
                    ),
                    h('td', {}, u.expiryDate ? new Date(u.expiryDate).toLocaleDateString('fa-IR') : '-'),
                    h('td', {}, h('span', { className: 'badge ' + (u.daysLeft > 7 ? 'badge-success' : u.daysLeft > 0 ? 'badge-warning' : 'badge-danger') }, u.daysLeft > 0 ? u.daysLeft + ' روز' : 'منقضی')),
                    h('td', {}, 
                      h('div', { className: 'flex-row' },
                        h('button', { className: 'btn btn-outline', style: { width: 'auto', padding: '6px 12px', fontSize: '12px' }, onclick: () => editUser(u) }, '✏️'),
                        h('button', { className: 'btn btn-danger', style: { width: 'auto', padding: '6px 12px', fontSize: '12px' }, onclick: () => deleteUser(u.id) }, '🗑️')
                      )
                    )
                  )
                ))
              )
            )
          )
        )
      );
    }

    async function searchUsers(e) {
      const q = e.target.value;
      const res = await api('/users?search=' + q + '&limit=50');
      if (res.success) {
        // Re-render users view
        render(UsersView);
      }
    }

    function showAddUserModal() {
      const overlay = h('div', { className: 'modal-overlay', onclick: (e) => { if(e.target===overlay) overlay.remove() } },
        h('div', { className: 'modal' },
          h('h3', { style: { marginBottom: '16px' } }, '➕ افزودن کاربر جدید'),
          h('div', { className: 'form-group' }, h('label', {}, 'شناسه تلگرام'), h('input', { id: 'newUserTgId', placeholder: 'مثال: 123456789' })),
          h('div', { className: 'form-group' }, h('label', {}, 'نام'), h('input', { id: 'newUserName', placeholder: 'نام کاربر' })),
          h('div', { className: 'form-group' }, h('label', {}, 'حجم (GB)'), h('input', { id: 'newUserLimit', type: 'number', value: '30' })),
          h('div', { className: 'form-group' }, h('label', {}, 'مدت (روز)'), h('input', { id: 'newUserDays', type: 'number', value: '30' })),
          h('div', { className: 'form-group' }, h('label', {}, 'اتصالات همزمان'), h('input', { id: 'newUserConcurrent', type: 'number', value: '3' })),
          h('div', { className: 'flex-row', style: { justifyContent: 'flex-end' } },
            h('button', { className: 'btn btn-outline', style: { width: 'auto' }, onclick: () => overlay.remove() }, 'انصراف'),
            h('button', { className: 'btn btn-primary', style: { width: 'auto' }, onclick: addUser }, 'ذخیره')
          )
        )
      );
      document.body.appendChild(overlay);

      async function addUser() {
        const telegramId = document.getElementById('newUserTgId').value;
        const name = document.getElementById('newUserName').value;
        const dataLimit = parseInt(document.getElementById('newUserLimit').value);
        const days = parseInt(document.getElementById('newUserDays').value);
        const concurrentLimit = parseInt(document.getElementById('newUserConcurrent').value);

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);

        const res = await api('/users', {
          method: 'POST',
          body: JSON.stringify({ telegramId: parseInt(telegramId), name, dataLimit, expiryDate: expiryDate.toISOString(), concurrentLimit })
        });

        if (res.success) {
          showToast('کاربر با موفقیت ایجاد شد');
          overlay.remove();
          render(UsersView);
        } else {
          showToast(res.error || 'خطا در ایجاد کاربر', 'error');
        }
      }
    }

    async function editUser(user) {
      const overlay = h('div', { className: 'modal-overlay', onclick: (e) => { if(e.target===overlay) overlay.remove() } },
        h('div', { className: 'modal' },
          h('h3', { style: { marginBottom: '16px' } }, '✏️ ویرایش کاربر'),
          h('div', { className: 'form-group' }, h('label', {}, 'نام'), h('input', { id: 'editName', value: user.name || '' })),
          h('div', { className: 'form-group' }, h('label', {}, 'حجم (GB)'), h('input', { id: 'editLimit', type: 'number', value: user.dataLimit || 0 })),
          h('div', { className: 'form-group' }, h('label', {}, 'وضعیت'), 
            h('select', { id: 'editStatus' },
              h('option', { value: 'active', selected: user.status === 'active' }, 'فعال'),
              h('option', { value: 'disabled', selected: user.status === 'disabled' }, 'غیرفعال'),
            )
          ),
          h('div', { className: 'flex-row', style: { justifyContent: 'flex-end' } },
            h('button', { className: 'btn btn-outline', style: { width: 'auto' }, onclick: () => overlay.remove() }, 'انصراف'),
            h('button', { className: 'btn btn-primary', style: { width: 'auto' }, onclick: saveEdit }, 'ذخیره')
          )
        )
      );
      document.body.appendChild(overlay);

      async function saveEdit() {
        const res = await api('/users/' + user.telegramId, {
          method: 'PUT',
          body: JSON.stringify({
            name: document.getElementById('editName').value,
            dataLimit: parseInt(document.getElementById('editLimit').value),
            status: document.getElementById('editStatus').value,
          })
        });
        if (res.success) { showToast('تغییرات ذخیره شد'); overlay.remove(); render(UsersView); }
        else showToast(res.error || 'خطا', 'error');
      }
    }

    async function deleteUser(userId) {
      if (!confirm('آیا از حذف این کاربر اطمینان دارید؟')) return;
      const res = await api('/users/' + userId, { method: 'DELETE' });
      if (res.success) { showToast('کاربر حذف شد'); render(UsersView); }
      else showToast(res.error || 'خطا', 'error');
    }

    // ── Plans View ────────────────────────────────
    async function PlansView() {
      const res = await api('/plans');
      const plans = res.success ? res.data.plans : [];

      return h('div', { className: 'layout' },
        Sidebar('plans'),
        h('div', { className: 'main-content' },
          h('div', { className: 'header' },
            h('h1', {}, '📦 مدیریت پلن‌ها'),
            h('button', { className: 'btn btn-primary', style: { width: 'auto' }, onclick: showAddPlanModal }, '➕ پلن جدید')
          ),
          h('div', { className: 'stats-grid' },
            ...plans.map(p =>
              h('div', { className: 'card', style: { padding: '20px' } },
                h('div', { style: { fontSize: '32px', marginBottom: '8px' } }, p.icon || '📦'),
                h('h3', { style: { marginBottom: '8px' } }, p.name),
                h('div', { style: { color: 'var(--textSecondary)', fontSize: '14px', marginBottom: '4px' } }, '📦 ' + p.dataLimit + ' GB'),
                h('div', { style: { color: 'var(--textSecondary)', fontSize: '14px', marginBottom: '4px' } }, '⏳ ' + p.duration + ' روز'),
                h('div', { style: { color: 'var(--textSecondary)', fontSize: '14px', marginBottom: '8px' } }, '👥 ' + (p.concurrentLimit || 3) + ' همزمان'),
                h('div', { style: { fontSize: '20px', fontWeight: '700', marginBottom: '12px' } }, p.price.toLocaleString() + ' تومان'),
                h('button', { className: 'btn btn-danger', style: { padding: '8px', fontSize: '12px' }, onclick: () => deletePlan(p.id) }, '🗑️ حذف')
              )
            )
          )
        )
      );
    }

    function showAddPlanModal() {
      const overlay = h('div', { className: 'modal-overlay', onclick: (e) => { if(e.target===overlay) overlay.remove() } },
        h('div', { className: 'modal' },
          h('h3', { style: { marginBottom: '16px' } }, '📦 پلن جدید'),
          h('div', { className: 'form-group' }, h('label', {}, 'نام'), h('input', { id: 'planName', placeholder: 'مثال: پلن طلایی' })),
          h('div', { className: 'form-group' }, h('label', {}, 'آیکون'), h('input', { id: 'planIcon', placeholder: '📦', value: '📦' })),
          h('div', { className: 'form-group' }, h('label', {}, 'حجم (GB)'), h('input', { id: 'planData', type: 'number', value: '30' })),
          h('div', { className: 'form-group' }, h('label', {}, 'مدت (روز)'), h('input', { id: 'planDuration', type: 'number', value: '30' })),
          h('div', { className: 'form-group' }, h('label', {}, 'قیمت (تومان)'), h('input', { id: 'planPrice', type: 'number', value: '100000' })),
          h('div', { className: 'form-group' }, h('label', {}, 'اتصالات همزمان'), h('input', { id: 'planConcurrent', type: 'number', value: '3' })),
          h('div', { className: 'form-group' }, h('label', {}, 'توضیحات'), h('input', { id: 'planDesc', placeholder: 'توضیح کوتاه' })),
          h('div', { className: 'flex-row', style: { justifyContent: 'flex-end' } },
            h('button', { className: 'btn btn-outline', style: { width: 'auto' }, onclick: () => overlay.remove() }, 'انصراف'),
            h('button', { className: 'btn btn-primary', style: { width: 'auto' }, onclick: addPlan }, 'ذخیره')
          )
        )
      );
      document.body.appendChild(overlay);

      async function addPlan() {
        const res = await api('/plans', { method: 'POST', body: JSON.stringify({
          name: document.getElementById('planName').value,
          icon: document.getElementById('planIcon').value,
          dataLimit: parseInt(document.getElementById('planData').value),
          duration: parseInt(document.getElementById('planDuration').value),
          price: parseInt(document.getElementById('planPrice').value),
          concurrentLimit: parseInt(document.getElementById('planConcurrent').value),
          description: document.getElementById('planDesc').value,
        })});
        if (res.success) { showToast('پلن ایجاد شد'); overlay.remove(); render(PlansView); }
        else showToast(res.error || 'خطا', 'error');
      }
    }

    async function deletePlan(id) {
      if (!confirm('آیا از حذف این پلن اطمینان دارید؟')) return;
      const res = await api('/plans/' + id, { method: 'DELETE' });
      if (res.success) { showToast('پلن حذف شد'); render(PlansView); }
      else showToast(res.error || 'خطا', 'error');
    }

    // ─── Settings View ────────────────────────────
    async function SettingsView() {
      const res = await api('/settings');
      const cfg = res.success ? res.data.settings : {};

      return h('div', { className: 'layout' },
        Sidebar('settings'),
        h('div', { className: 'main-content' },
          h('h1', {}, '⚙️ تنظیمات'),
          h('div', { className: 'card', style: { marginTop: '16px' } },
            h('div', { className: 'card-body' },
              h('div', { className: 'form-group' }, h('label', {}, 'نام سایت'), h('input', { id: 'cfgSiteName', value: cfg.siteName || '' })),
              h('div', { className: 'form-group' }, h('label', {}, 'یوزرنیم پشتیبانی'), h('input', { id: 'cfgSupport', value: cfg.supportUsername || '' })),
              h('div', { className: 'form-group' }, h('label', {}, 'نام سرور'), h('input', { id: 'cfgServerName', value: (cfg.serverInfo || {}).name || '' })),
              h('button', { className: 'btn btn-primary', style: { width: 'auto', marginTop: '12px' }, onclick: saveCfg }, '💾 ذخیره تنظیمات')
            )
          )
        )
      );

      async function saveCfg() {
        const res = await api('/settings', { method: 'PUT', body: JSON.stringify({
          siteName: document.getElementById('cfgSiteName').value,
          supportUsername: document.getElementById('cfgSupport').value,
          serverInfo: { name: document.getElementById('cfgServerName').value, ping: 25, load: 45 }
        })});
        showToast(res.success ? 'تنظیمات ذخیره شد' : 'خطا', res.success ? 'success' : 'error');
      }
    }

    // ── Sidebar ────────────────────────────────────
    function Sidebar(active) {
      const links = [
        { id: 'dashboard', icon: '📊', text: 'داشبورد', onclick: () => render(DashboardView) },
        { id: 'users', icon: '👥', text: 'کاربران', onclick: () => render(UsersView) },
        { id: 'plans', icon: '📦', text: 'پلن‌ها', onclick: () => render(PlansView) },
        { id: 'settings', icon: '⚙️', text: 'تنظیمات', onclick: () => render(SettingsView) },
      ];

      return h('div', { className: 'sidebar' },
        h('h2', {}, '🛡️ VPN Panel'),
        h('nav', {}, ...links.map(l =>
          h('a', { className: active === l.id ? 'active' : '', onclick: l.onclick, style: { cursor: 'pointer' } }, l.icon + ' ' + l.text)
        ))
      );
    }

    // ── Init ───────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
      _renderRoot = document.getElementById('root');
      if (authToken) {
        api('/stats/dashboard').then(res => {
          if (res.success) render(DashboardView);
          else { authToken = ''; localStorage.removeItem('admin_token'); render(LoginView); }
        }).catch(() => { render(LoginView) });
      } else {
        render(LoginView);
      }
    });
  </script>
</body>
</html>`;

export async function renderPanel(request, env, ctx, url) {
  // For now return the shell HTML; in production this would be a proper SPA
  // with React or served from Cloudflare Pages
  return htmlResponse(PANEL_HTML);
}
