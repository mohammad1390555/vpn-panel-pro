// ─── API Router ────────────────────────────────────────────
import { jsonResponse, errorResponse, successResponse, parseBody } from '../utils/response.js';
import { logEvent } from '../utils/logger.js';
import {
  getUsers, saveUsers, getUser, updateUser,
  getPlans, savePlans,
  getTransactions, addTransaction,
  getSettings, saveSettings,
  generateUUID, getNow, daysRemaining
} from '../utils/kv.js';

// Admin auth check
function isAdmin(request, env) {
  const key = request.headers.get('X-Admin-Key');
  const admins = (env.ADMIN_IDS || '').split(',').map(s => s.trim());
  // For API calls from panel, check admin key
  if (key && key === env.BOT_TOKEN) return true;
  return false;
}

function requireAdmin(request, env) {
  if (!isAdmin(request, env)) {
    return errorResponse(403, 'Forbidden: Admin access required');
  }
  return null;
}

export async function apiRouter(request, env, ctx, url) {
  const path = url.pathname.replace('/api/', '');
  const method = request.method;
  
  // ─── Auth ────────────────────────────────────────────
  if (path === 'auth/login') {
    const body = await parseBody(request);
    if (body.password === env.BOT_TOKEN) {
      return successResponse({ 
        token: env.BOT_TOKEN,
        role: 'admin' 
      }, 'Login successful');
    }
    return errorResponse(401, 'Invalid credentials');
  }
  
  // ─── Users CRUD ──────────────────────────────────────
  if (path === 'users' && method === 'GET') {
    const authErr = requireAdmin(request, env);
    if (authErr) return authErr;
    
    const users = await getUsers(env);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    
    let filtered = users;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.telegramId && String(u.telegramId).includes(q))
      );
    }
    if (status) {
      filtered = filtered.filter(u => u.status === status);
    }
    
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    
    // Enrich with usage data
    const enriched = paginated.map(u => ({
      ...u,
      daysLeft: u.expiryDate ? daysRemaining(u.expiryDate) : 0,
      usagePercent: u.dataLimit ? Math.round((u.dataUsed || 0) / u.dataLimit * 100) : 0
    }));
    
    return successResponse({ users: enriched, total, page, limit });
  }
  
  if (path === 'users' && method === 'POST') {
    const authErr = requireAdmin(request, env);
    if (authErr) return authErr;
    
    const body = await parseBody(request);
    const user = {
      id: generateUUID(),
      telegramId: body.telegramId || null,
      name: body.name || 'User',
      email: body.email || '',
      status: 'active',
      dataLimit: body.dataLimit || 0, // GB
      dataUsed: 0,
      expiryDate: body.expiryDate || null,
      concurrentLimit: body.concurrentLimit || 3,
      planId: body.planId || null,
      configUUID: generateUUID(),
      createdAt: getNow(),
      updatedAt: getNow(),
      devices: [],
      ips: [],
    };
    
    const users = await getUsers(env);
    users.push(user);
    await saveUsers(env, users);
    await logEvent(env, 'user_created', { userId: user.id, by: 'admin' });
    
    return successResponse({ user }, 'User created');
  }
  
  if (path.startsWith('users/') && method === 'GET') {
    const userId = path.split('/')[1];
    const user = await getUser(env, userId);
    if (!user) return errorResponse(404, 'User not found');
    
    user.daysLeft = user.expiryDate ? daysRemaining(user.expiryDate) : 0;
    user.usagePercent = user.dataLimit ? Math.round((user.dataUsed || 0) / user.dataLimit * 100) : 0;
    
    return successResponse({ user });
  }
  
  if (path.startsWith('users/') && method === 'PUT') {
    const authErr = requireAdmin(request, env);
    if (authErr) return authErr;
    
    const userId = path.split('/')[1];
    const body = await parseBody(request);
    const updated = await updateUser(env, userId, body);
    if (!updated) return errorResponse(404, 'User not found');
    
    await logEvent(env, 'user_updated', { userId, changes: Object.keys(body) });
    return successResponse({ user: updated }, 'User updated');
  }
  
  if (path.startsWith('users/') && method === 'DELETE') {
    const authErr = requireAdmin(request, env);
    if (authErr) return authErr;
    
    const userId = path.split('/')[1];
    const users = await getUsers(env);
    const filtered = users.filter(u => u.id != userId && u.telegramId != userId);
    if (filtered.length === users.length) return errorResponse(404, 'User not found');
    
    await saveUsers(env, filtered);
    await logEvent(env, 'user_deleted', { userId });
    return successResponse({}, 'User deleted');
  }
  
  // Bulk actions
  if (path === 'users/bulk' && method === 'POST') {
    const authErr = requireAdmin(request, env);
    if (authErr) return authErr;
    
    const body = await parseBody(request);
    const { userIds, action, data } = body;
    
    const users = await getUsers(env);
    let affected = 0;
    
    for (const u of users) {
      if (!userIds.includes(u.id)) continue;
      affected++;
      if (action === 'extend') {
        const currentExpiry = u.expiryDate ? new Date(u.expiryDate) : new Date();
        currentExpiry.setDate(currentExpiry.getDate() + (data.days || 30));
        u.expiryDate = currentExpiry.toISOString();
      } else if (action === 'disable') {
        u.status = 'disabled';
      } else if (action === 'enable') {
        u.status = 'active';
      } else if (action === 'reset_usage') {
        u.dataUsed = 0;
      } else if (action === 'delete') {
        continue;
      }
      u.updatedAt = getNow();
    }
    
    const remaining = action === 'delete' 
      ? users.filter(u => !userIds.includes(u.id))
      : users;
    await saveUsers(env, remaining);
    
    await logEvent(env, 'user_bulk_action', { action, affected });
    return successResponse({ affected }, `Bulk ${action} completed`);
  }
  
  // ─── Plans CRUD ──────────────────────────────────────
  if (path === 'plans' && method === 'GET') {
    const plans = await getPlans(env);
    return successResponse({ plans });
  }
  
  if (path === 'plans' && method === 'POST') {
    const authErr = requireAdmin(request, env);
    if (authErr) return authErr;
    
    const body = await parseBody(request);
    const plan = {
      id: generateUUID(),
      name: body.name,
      icon: body.icon || '📦',
      price: body.price || 0,
      dataLimit: body.dataLimit || 0, // GB
      duration: body.duration || 30, // days
      concurrentLimit: body.concurrentLimit || 3,
      description: body.description || '',
      isActive: true,
      createdAt: getNow(),
    };
    
    const plans = await getPlans(env);
    plans.push(plan);
    await savePlans(env, plans);
    
    return successResponse({ plan }, 'Plan created');
  }
  
  if (path.startsWith('plans/') && method === 'DELETE') {
    const authErr = requireAdmin(request, env);
    if (authErr) return authErr;
    
    const planId = path.split('/')[1];
    const plans = await getPlans(env);
    await savePlans(env, plans.filter(p => p.id !== planId));
    return successResponse({}, 'Plan deleted');
  }
  
  // ─── Transactions ────────────────────────────────────
  if (path === 'transactions' && method === 'GET') {
    const authErr = requireAdmin(request, env);
    if (authErr) return authErr;
    
    const userId = url.searchParams.get('userId') || null;
    const type = url.searchParams.get('type') || '';
    let txs = await getTransactions(env, userId);
    
    if (type) txs = txs.filter(t => t.type === type);
    
    return successResponse({ transactions: txs.slice(0, 100) });
  }
  
  // ─── Settings ────────────────────────────────────────
  if (path === 'settings' && method === 'GET') {
    const settings = await getSettings(env);
    return successResponse({ settings });
  }
  
  if (path === 'settings' && method === 'PUT') {
    const authErr = requireAdmin(request, env);
    if (authErr) return authErr;
    
    const body = await parseBody(request);
    const current = await getSettings(env);
    const updated = { ...current, ...body };
    await saveSettings(env, updated);
    
    return successResponse({ settings: updated }, 'Settings updated');
  }
  
  // ─── Dashboard Stats ─────────────────────────────────
  if (path === 'stats/dashboard') {
    const authErr = requireAdmin(request, env);
    if (authErr) return authErr;
    
    const users = await getUsers(env);
    const plans = await getPlans(env);
    const transactions = await getTransactions(env);
    
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const activeUsers = users.filter(u => u.status === 'active');
    const expiredUsers = users.filter(u => u.expiryDate && new Date(u.expiryDate) < now);
    const newThisMonth = users.filter(u => {
      const d = new Date(u.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    
    const revenueThisMonth = transactions
      .filter(t => t.type === 'purchase' && new Date(t.createdAt).getMonth() === thisMonth)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalDataUsed = activeUsers.reduce((sum, u) => sum + (u.dataUsed || 0), 0);
    
    return successResponse({
      stats: {
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        expiredUsers: expiredUsers.length,
        newThisMonth: newThisMonth.length,
        totalPlans: plans.length,
        revenueThisMonth,
        totalDataUsed: Math.round(totalDataUsed * 100) / 100,
        recentTransactions: transactions.slice(0, 10),
      }
    });
  }
  
  // ─── Subscription Link API ───────────────────────────
  if (path.startsWith('sub/')) {
    const configUUID = path.split('/')[1];
    const protocol = url.searchParams.get('protocol') || 'all';
    const format = url.searchParams.get('format') || 'raw';
    
    const users = await getUsers(env);
    const user = users.find(u => u.configUUID === configUUID);
    
    if (!user) return errorResponse(404, 'Invalid subscription link');
    if (user.status !== 'active') return errorResponse(403, 'Subscription is not active');
    if (user.expiryDate && new Date(user.expiryDate) < new Date()) {
      return errorResponse(403, 'Subscription expired');
    }
    
    // Generate configs based on protocol
    const configs = generateConfigs(user, protocol);
    
    if (url.searchParams.get('json')) {
      return successResponse({ 
        user: {
          name: user.name,
          dataLimit: user.dataLimit,
          dataUsed: user.dataUsed,
          daysLeft: user.expiryDate ? daysRemaining(user.expiryDate) : 0,
          concurrentLimit: user.concurrentLimit,
        },
        configs 
      });
    }
    
    // Return raw config text
    const rawText = configs.map(c => c.content).join('\n\n');
    if (format === 'json') {
      return jsonResponse(configs);
    }
    
    return new Response(rawText, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="config.txt"',
        'Subscription-Userinfo': `upload=0; download=${user.dataUsed * 1073741824}; total=${user.dataLimit * 1073741824}; expire=${Math.floor(new Date(user.expiryDate).getTime() / 1000)}`,
      }
    });
  }
  
  // ─── Sub Info (for sub page) ─────────────────────────
  if (path.startsWith('sub-info/')) {
    const configUUID = path.replace('sub-info/', '');
    const users = await getUsers(env);
    const user = users.find(u => u.configUUID === configUUID);
    
    if (!user) return errorResponse(404, 'Invalid subscription');
    
    return successResponse({
      user: {
        name: user.name,
        status: user.status,
        dataLimit: user.dataLimit,
        dataUsed: user.dataUsed,
        usagePercent: user.dataLimit ? Math.round((user.dataUsed || 0) / user.dataLimit * 100) : 0,
        daysLeft: user.expiryDate ? daysRemaining(user.expiryDate) : 0,
        expiryDate: user.expiryDate,
        concurrentLimit: user.concurrentLimit,
        devices: user.devices || [],
      }
    });
  }
  
  // ─── 404 ─────────────────────────────────────────────
  return errorResponse(404, `API endpoint not found: ${path}`);
}

// Config generator
function generateConfigs(user, protocol = 'all') {
  const configs = [];
  const uuid = user.configUUID;
  
  // VLESS config
  if (protocol === 'all' || protocol === 'vless') {
    configs.push({
      name: 'VLESS + WS + TLS',
      protocol: 'vless',
      type: 'ws',
      security: 'tls',
      content: `vless://${uuid}@${user.configUUID}.example.com:443?encryption=none&security=tls&type=ws&path=%2Fws#${encodeURIComponent(user.name)}-VLESS`
    });
  }
  
  // Trojan config
  if (protocol === 'all' || protocol === 'trojan') {
    configs.push({
      name: 'Trojan + WS + TLS',
      protocol: 'trojan',
      type: 'ws',
      security: 'tls',
      content: `trojan://${uuid}@${user.configUUID}.example.com:443?security=tls&type=ws&path=%2Fws#${encodeURIComponent(user.name)}-Trojan`
    });
  }
  
  // VMess config
  if (protocol === 'all' || protocol === 'vmess') {
    const vmessConfig = {
      v: "2",
      ps: `${user.name}-VMess`,
      add: `${user.configUUID}.example.com`,
      port: "443",
      id: uuid,
      aid: "0",
      scy: "auto",
      net: "ws",
      type: "none",
      host: "",
      path: "/ws",
      tls: "tls",
      sni: ""
    };
    configs.push({
      name: 'VMess + WS + TLS',
      protocol: 'vmess',
      type: 'ws',
      security: 'tls',
      content: `vmess://${btoa(JSON.stringify(vmessConfig))}`
    });
  }
  
  return configs;
}
