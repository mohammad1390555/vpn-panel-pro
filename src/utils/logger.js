// ─── Made by Mohammad — github.com/mohammad1390555 ───
// ─── Logger Utility ────────────────────────────────────────

export async function logEvent(env, type, data = {}) {
  try {
    const key = `log:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`;
    const entry = {
      type,
      timestamp: new Date().toISOString(),
      ...data,
    };
    await env.LOGS.put(key, JSON.stringify(entry), { expirationTtl: 60 * 60 * 24 * 30 }); // 30 days
  } catch (e) {
    console.error('Log write failed:', e);
  }
}

export async function getUserLogs(env, options = {}) {
  const { type, userId, limit = 50, cursor } = options;
  const list = await env.LOGS.list({ 
    prefix: 'log:', 
    limit,
    cursor 
  });
  
  const logs = [];
  for (const item of list.keys) {
    const raw = await env.LOGS.get(item.name);
    if (raw) {
      try {
        const log = JSON.parse(raw);
        if (type && log.type !== type) continue;
        if (userId && log.userId !== userId) continue;
        logs.push(log);
      } catch {}
    }
  }
  
  return { logs, cursor: list.cursor };
}
