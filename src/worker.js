// ============================================================
// 🚀 VPN Panel Pro — Cloudflare Worker (Main Entry Point)
// ============================================================
// Routes:
//   /api/*       → REST API (Telegram bot webhook + Panel API)
//   /panel/*     → Web Admin Panel (SPA)
//   /sub/*       → Subscription Link Page (public)
//   /*           → Redirect to panel or sub based on hostname
// ============================================================

import { handleTelegramWebhook, setWebhook } from './telegram-bot/bot.js';
import { apiRouter } from './api/index.js';
import { renderPanel } from './web-panel/render.js';
import { renderSubPage } from './sub-page/render.js';
import { getAsset } from './utils/assets.js';
import { corsHeaders, jsonResponse, errorResponse } from './utils/response.js';
import { logEvent } from './utils/logger.js';

// ─── Main Worker Handler ───────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const hostname = url.hostname;
    
    // CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    
    try {
      // ── Telegram Bot Webhook ──────────────────────────
      if (path === '/api/telegram/webhook') {
        return await handleTelegramWebhook(request, env, ctx);
      }
      
      // ── Set Webhook (one-time setup) ──────────────────
      if (path === '/api/telegram/set-webhook') {
        return await setWebhook(env);
      }
      
      // ── REST API ──────────────────────────────────────
      if (path.startsWith('/api/')) {
        return await apiRouter(request, env, ctx, url);
      }
      
      // ── Web Admin Panel (SPA) ─────────────────────────
      if (hostname.includes('panel') || path.startsWith('/panel')) {
        return await renderPanel(request, env, ctx, url);
      }
      
      // ── Subscription Page ─────────────────────────────
      if (hostname.includes('sub') || path.startsWith('/sub')) {
        return await renderSubPage(request, env, ctx, url);
      }
      
      // ── Static Assets ─────────────────────────────────
      if (path.startsWith('/assets/') || path.startsWith('/static/')) {
        return await getAsset(path, env);
      }
      
      // ── Default: Smart redirect ───────────────────────
      return new Response('VPN Panel Pro — Worker is running! 🚀', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
      
    } catch (error) {
      console.error('Worker Error:', error);
      await logEvent(env, 'error', { path, error: error.message });
      return errorResponse(500, 'Internal Server Error', error.message);
    }
  }
};
