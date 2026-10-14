const ALLOWED_ORIGINS = ["https://gumakulka.github.io"];
const LOCAL_ORIGIN = /^http:\/\/(?:127\.0\.0\.1|localhost):\d{1,5}$/;
const UPSTREAM_TIMEOUT_MS = 15000;
const BASE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Vary": "Origin",
  "X-Content-Type-Options": "nosniff",
};

function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.includes(origin) || LOCAL_ORIGIN.test(origin);
}

function jsonResponse(body, status, extra) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...BASE_HEADERS, ...extra },
  });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin");
    const cors = {};
    if (origin && isAllowedOrigin(origin)) cors["Access-Control-Allow-Origin"] = origin;

    if (request.method !== "GET") {
      return jsonResponse({ error: "Method not allowed" }, 405, { ...cors, Allow: "GET" });
    }

    if (origin && !isAllowedOrigin(origin)) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    const match = new URL(request.url).pathname.match(/^\/uid\/(\d{9})$/);
    if (!match) {
      return jsonResponse({ error: "Not found" }, 404, cors);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
    try {
      const upstream = await fetch("https://enka.network/api/uid/" + match[1], {
        headers: { "User-Agent": "genshin-build-card/1.0" },
        signal: controller.signal,
      });
      return new Response(upstream.body, {
        status: upstream.status,
        headers: { ...BASE_HEADERS, ...cors },
      });
    } catch (error) {
      return jsonResponse({ error: "Upstream unavailable" }, 502, cors);
    } finally {
      clearTimeout(timer);
    }
  },
};
