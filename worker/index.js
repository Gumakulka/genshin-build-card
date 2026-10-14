const ALLOWED_ORIGINS = [
  "https://gumakulka.github.io",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

export default {
  async fetch(request) {
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    const origin = request.headers.get("Origin");
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    const headers = { "Vary": "Origin", "Content-Type": "application/json" };
    if (origin) headers["Access-Control-Allow-Origin"] = origin;

    const match = new URL(request.url).pathname.match(/^\/uid\/(\d{9})$/);
    if (!match) {
      return new Response("Not found", { status: 404, headers });
    }

    const upstream = await fetch(
      "https://enka.network/api/uid/" + match[1],
      { headers: { "User-Agent": "genshin-build-card/1.0" } }
    );

    return new Response(upstream.body, { status: upstream.status, headers });
  },
};
