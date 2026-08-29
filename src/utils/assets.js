// ─── Made by Mohammad — github.com/mohammad1390555 ───
// ─── Static Asset Loader ───────────────────────────────────
// For production, assets are stored as KV blobs or served via Cloudflare Pages

const STATIC_ASSETS = {
  // CSS
  '/assets/css/panel.css': 'text/css',
  '/assets/css/sub.css': 'text/css',
  '/assets/css/bot.css': 'text/css',
  
  // JS
  '/assets/js/panel.js': 'application/javascript',
  '/assets/js/sub.js': 'application/javascript',
  
  // Images
  '/assets/img/logo.png': 'image/png',
  '/assets/img/favicon.ico': 'image/x-icon',
};

export async function getAsset(path, env) {
  // Try KV first
  const kvAsset = await env.SETTINGS.get(`asset:${path}`);
  if (kvAsset) {
    const mime = STATIC_ASSETS[path] || 'application/octet-stream';
    return new Response(kvAsset, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=86400',
      }
    });
  }
  
  return new Response('Asset not found', { status: 404 });
}
