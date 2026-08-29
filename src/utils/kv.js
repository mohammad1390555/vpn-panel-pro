// ─── Made by Mohammad — github.com/mohammad1390555 ───
// ─── KV Helpers ────────────────────────────────────────────

export async function getUsers(env) {
  const raw = await env.USERS.get('all', 'json');
  return raw || [];
}

export async function saveUsers(env, users) {
  await env.USERS.put('all', JSON.stringify(users));
}

export async function getUser(env, userId) {
  const users = await getUsers(env);
  return users.find(u => u.id == userId || u.telegramId == userId);
}

export async function updateUser(env, userId, updates) {
  const users = await getUsers(env);
  const idx = users.findIndex(u => u.id == userId || u.telegramId == userId);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
  await saveUsers(env, users);
  return users[idx];
}

export async function getPlans(env) {
  const raw = await env.PLANS.get('all', 'json');
  return raw || [];
}

export async function savePlans(env, plans) {
  await env.PLANS.put('all', JSON.stringify(plans));
}

export async function getTransactions(env, userId) {
  const raw = await env.TRANSACTIONS.get('all', 'json');
  const all = raw || [];
  return userId ? all.filter(t => t.userId == userId) : all;
}

export async function addTransaction(env, tx) {
  const all = await getTransactions(env);
  all.unshift({ ...tx, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
  // keep last 1000
  await env.TRANSACTIONS.put('all', JSON.stringify(all.slice(0, 1000)));
  return all[0];
}

export async function getSettings(env) {
  const raw = await env.SETTINGS.get('config', 'json');
  return raw || {
    siteName: env.SITE_NAME || 'VPN Panel Pro',
    defaultLang: env.DEFAULT_LANG || 'fa',
    maintenanceMode: false,
    theme: 'dark',
  };
}

export async function saveSettings(env, settings) {
  await env.SETTINGS.put('config', JSON.stringify(settings));
}

export function generateUUID() {
  return crypto.randomUUID();
}

export function getNow() {
  return new Date().toISOString();
}

export function daysBetween(d1, d2) {
  return Math.ceil((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));
}

export function daysRemaining(expiryDate) {
  return daysBetween(new Date(), expiryDate);
}
