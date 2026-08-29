// ─── Made by Mohammad — github.com/mohammad1390555 ───
// ─── Response Utilities ────────────────────────────────────

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key',
    'Access-Control-Max-Age': '86400',
  };
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(),
    },
  });
}

export function errorResponse(status, error, detail = '') {
  return jsonResponse({ 
    success: false, 
    error,
    detail,
    timestamp: new Date().toISOString()
  }, status);
}

export function successResponse(data, message = 'OK') {
  return jsonResponse({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

export function redirectResponse(url, status = 302) {
  return new Response(null, {
    status,
    headers: { Location: url, ...corsHeaders() }
  });
}

export function htmlResponse(html) {
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders() }
  });
}

export function parseBody(request) {
  const contentType = request.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    return request.json();
  }
  return request.text();
}
