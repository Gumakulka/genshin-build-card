const ALLOWED_ORIGINS = ["https://gumakulka.github.io"];
const LOCAL_ORIGIN = /^http:\/\/(?:127\.0\.0\.1|localhost):\d{1,5}$/;
const UPSTREAM_TIMEOUT_MS = 15000;
const GAME8_URL = "https://game8.co/games/Genshin-Impact/archives/530535";
const GAME8_TIMEOUT_MS = 20000;
const GAME8_MAX_HTML = 6000000;
const MIN_BUILDS = 20;
const BUILDS_TTL_MS = 60 * 60 * 1000;
const AVATARS_TTL_MS = 6 * 60 * 60 * 1000;
const CHARACTER_TTL_MS = 6 * 60 * 60 * 1000;

const YATTA = "https://gi.yatta.moe/api/v2/";
const YATTA_LANGS = new Set(["en", "pl", "de", "fr", "es", "ru", "jp", "chs", "cht", "kr", "id", "pt", "th", "tr", "vi", "it"]);
const AVATAR_EXCLUDE = new Set(["10000117", "10000118", "10000005"]);
const ICON_NAME = /^[A-Za-z0-9_]{1,80}$/;

const BASE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Vary": "Origin",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer"
};

const BUILDS_HEADERS = { ...BASE_HEADERS, "Cache-Control": "public, max-age=3600" };
const AVATARS_HEADERS = { ...BASE_HEADERS, "Cache-Control": "public, max-age=21600" };
const CHARACTER_HEADERS = { ...BASE_HEADERS, "Cache-Control": "public, max-age=21600" };

const KNOWN_SETS = [
  "Gilded Dreams", "Wanderer's Troupe", "Blizzard Strayer", "Noblesse Oblige", "Fragment of Harmonic Whimsy",
  "Echoes of an Offering", "Deepwood Memories", "Ocean-Hued Clam", "Emblem of Severed Fate",
  "Scroll of the Hero of Cinder City", "Golden Troupe", "Obsidian Codex", "Aubade of Morningstar and Moon",
  "Silken Moon's Serenade", "Husk of Opulent Dreams", "Disenchantment in Deep Shadows", "Crimson Witch of Flames",
  "A Day Carved from Rising Winds", "Unfinished Reverie", "Pale Flame", "Viridescent Venerer",
  "Night of the Sky's Unveiling", "Marechaussee Hunter", "Thundering Fury", "Tenacity of the Millelith",
  "Vourukasha's Glow", "Nighttime Whispers in the Echoing Woods", "Celestial Gift", "Heart of the Furnace",
  "Shimenawa's Reminiscence", "Gladiator's Finale", "Retracing Bolide", "Lavawalker", "Thundersoother",
  "Maiden Beloved", "Bloodstained Chivalry", "Archaic Petra", "Vermillion Hereafter", "Desert Pavilion Chronicle",
  "Flower of Paradise Lost", "Nymph's Dream", "Song of Days Past", "Long Night's Oath",
  "Instructor", "Berserker", "Resolution of Sojourner", "Brave Heart", "Martial Artist", "Defender's Will",
  "Tiny Miracle", "Exile", "Traveling Doctor", "Lucky Dog", "Scholar", "Gambler", "Adventurer",
  "Prayers for Wisdom", "Prayers for Illumination", "Prayers for Destiny", "Prayers to Springtime"
];

/* Pamięć podręczna w obrębie jednej instancji Workera. Działa też na workers.dev, gdzie Cache API nie działa. */
const memo = new Map();

function memoGet(key, ttl) {
  const hit = memo.get(key);
  return hit && Date.now() - hit.time < ttl ? hit.body : null;
}

function memoSet(key, body) {
  memo.set(key, { time: Date.now(), body });
  if (memo.size > 80) memo.delete(memo.keys().next().value);
}

function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.includes(origin) || LOCAL_ORIGIN.test(origin);
}

function jsonResponse(body, status, extra) {
  return new Response(JSON.stringify(body), { status, headers: { ...BASE_HEADERS, ...extra } });
}

const HTML_ENTITIES = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", rsquo: "'", lsquo: "'" };

function decodeEntities(text) {
  return text
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, name) => {
      const key = name.toLowerCase();
      if (key.startsWith("#x")) return String.fromCharCode(parseInt(key.slice(2), 16));
      if (key.startsWith("#")) return String.fromCharCode(Number(key.slice(1)));
      return Object.prototype.hasOwnProperty.call(HTML_ENTITIES, key) ? HTML_ENTITIES[key] : match;
    })
    .replace(/[\u2018\u2019]/g, "'");
}

function htmlToLines(html) {
  const cleaned = html
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/(td|th)>/gi, " | ")
    .replace(/<[^>]+>/g, " ");

  return decodeEntities(cleaned)
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function statCode(raw) {
  const s = raw.toLowerCase();

  if (/crit(ical)?\s*rate/.test(s)) return "CR";
  if (/crit(ical)?\s*(dmg|damage)/.test(s)) return "CD";
  if (/energy recharge/.test(s)) return "ER";
  if (/elemental mastery/.test(s)) return "EM";
  if (/healing/.test(s)) return "HB";
  if (/physical/.test(s)) return "PD";
  if (/(dmg|damage) bonus/.test(s)) return "ED";

  if (s.includes("%")) {
    if (/atk|attack/.test(s)) return "AT";
    if (/\bhp\b/.test(s)) return "HP";
    if (/def/.test(s)) return "DF";
  }

  return null;
}

function extractSets(desc) {
  const found = [];
  const pattern = /\((2|4)-pc\)/gi;
  let match;

  while ((match = pattern.exec(desc))) {
    const before = desc.slice(Math.max(0, match.index - 80), match.index).trim();
    const known = KNOWN_SETS.filter((name) => before.endsWith(name)).sort((a, b) => b.length - a.length)[0];
    found.push({ pieces: match[1], name: known || before.split(" ").slice(-3).join(" ") });
  }

  if (!found.length) return "";
  if (found.length === 1) return found[0].name;

  return found.slice(0, 2).map((item) => item.name + " (" + item.pieces + ")").join(" + ");
}

function parseMains(text) {
  const labeled = text.match(/sands\W+(.*?)\s+goblet\W+(.*?)\s+circlet\W+(.*)/i);
  const parts = labeled ? [labeled[1], labeled[2], labeled[3]] : text.split(":").map((part) => part.trim()).filter(Boolean);

  if (parts.length < 3) return null;

  const groups = parts.slice(0, 3).map((part) => {
    const codes = part.split(/\s+or\s+|\//i).map(statCode).filter(Boolean);
    return Array.from(new Set(codes));
  });

  if (groups.some((group) => !group.length)) return null;

  return groups.map((group) => group.join("/")).join("|");
}

function parseSubs(text) {
  const codes = [];

  text.replace(/^[\s:*]+/, "").split(/[\u2022\u00b7>,]/).forEach((part) => {
    const code = statCode(part.trim());
    if (code && !codes.includes(code)) codes.push(code);
  });

  return codes.slice(0, 6).join(",");
}

function parseLine(line) {
  const mainIndex = line.search(/Main Stats/i);
  const subIndex = line.search(/Sub Stats/i);

  if (mainIndex < 0 || subIndex < mainIndex) return null;

  const cells = line.slice(0, mainIndex).split("|").map((cell) => cell.trim()).filter(Boolean);
  const name = (cells[0] || "").replace(/\s*(Best\s+)?Builds?$/i, "").trim();

  if (!/^[A-Za-z][A-Za-z' .-]{1,39}$/.test(name)) return null;

  const desc = cells.slice(1).join(" ");
  const role = /sub[\s-]?dps/i.test(desc) ? "Sub-DPS" : /dps/i.test(desc) ? "DPS" : "Support";
  const mains = parseMains(line.slice(mainIndex + 10, subIndex));
  const subs = parseSubs(line.slice(subIndex + 9));

  if (!mains || !subs) return null;

  return { name, entry: [role, extractSets(desc), mains, subs] };
}

/* Limit żądań: używa bindingu Rate Limiting (RATE_LIMITER), jeśli został dodany do Workera.
   Bez bindingu limit jest wyłączony, bo Cache API nie działa na domenie workers.dev. */
async function allowed(env, request, route) {
  if (!env || !env.RATE_LIMITER || typeof env.RATE_LIMITER.limit !== "function") return true;

  const ip = request.headers.get("CF-Connecting-Ip") || "unknown";

  try {
    const { success } = await env.RATE_LIMITER.limit({ key: route + ":" + ip });
    return success;
  } catch (error) {
    return true;
  }
}

function tooManyRequests(cors) {
  return jsonResponse({ error: "Too many requests" }, 429, { ...cors, "Retry-After": "60" });
}

async function handleBuilds(cors, ctx) {
  const memoHit = memoGet("builds", BUILDS_TTL_MS);
  if (memoHit) return new Response(memoHit, { status: 200, headers: { ...BUILDS_HEADERS, ...cors } });

  const cache = caches.default;
  const cacheKey = new Request("https://genshin-proxy.invalid/builds-v1");
  const hit = await cache.match(cacheKey);

  if (hit) return new Response(hit.body, { status: 200, headers: { ...BUILDS_HEADERS, ...cors } });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GAME8_TIMEOUT_MS);
  let html;

  try {
    const upstream = await fetch(GAME8_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; genshin-build-card/1.0; +https://github.com/Gumakulka/genshin-build-card)",
        "Accept": "text/html"
      },
      signal: controller.signal
    });

    if (!upstream.ok) return jsonResponse({ error: "Upstream status " + upstream.status }, 502, cors);

    html = await upstream.text();
  } catch (error) {
    return jsonResponse({ error: "Upstream unavailable" }, 502, cors);
  } finally {
    clearTimeout(timer);
  }

  if (html.length > GAME8_MAX_HTML) return jsonResponse({ error: "Upstream too large" }, 502, cors);

  const lines = htmlToLines(html).filter((line) => /Main Stats/i.test(line));
  const builds = {};

  lines.forEach((line) => {
    const parsed = parseLine(line);
    if (parsed && !builds[parsed.name]) builds[parsed.name] = parsed.entry;
  });

  if (Object.keys(builds).length < MIN_BUILDS) {
    return jsonResponse({ error: "Parse failed" }, 502, cors);
  }

  const body = JSON.stringify({ updated: Date.now(), source: GAME8_URL, builds });

  memoSet("builds", body);
  ctx.waitUntil(cache.put(cacheKey, new Response(body, { headers: BUILDS_HEADERS })));

  return new Response(body, { status: 200, headers: { ...BUILDS_HEADERS, ...cors } });
}

async function handleAvatars(url, cors, ctx) {
  const requested = url.searchParams.get("lang");
  const lang = YATTA_LANGS.has(requested) ? requested : "en";
  const memoKey = "avatars-" + lang;

  const memoHit = memoGet(memoKey, AVATARS_TTL_MS);
  if (memoHit) return new Response(memoHit, { status: 200, headers: { ...AVATARS_HEADERS, ...cors } });

  const cache = caches.default;
  const cacheKey = new Request("https://genshin-proxy.invalid/avatars-v1-" + lang);
  const hit = await cache.match(cacheKey);

  if (hit) return new Response(hit.body, { status: 200, headers: { ...AVATARS_HEADERS, ...cors } });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(YATTA + lang + "/avatar", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; genshin-build-card/1.0)", "Accept": "application/json" },
      signal: controller.signal
    });

    if (!upstream.ok) return jsonResponse({ error: "Upstream status " + upstream.status }, 502, cors);

    const data = await upstream.json();
    const items = Object.entries((data.data && data.data.items) || {})
      .filter(([id]) => !id.includes("-") && !AVATAR_EXCLUDE.has(id))
      .map(([id, value]) => ({
        id,
        name: value.name,
        rank: value.rank,
        element: value.element,
        weapon: value.weaponType,
        icon: value.icon,
        release: value.release
      }))
      .sort((a, b) => Number(a.id) - Number(b.id));

    if (items.length < 100) return jsonResponse({ error: "Too few avatars" }, 502, cors);

    const body = JSON.stringify({ count: items.length, source: "gi.yatta.moe", items });

    memoSet(memoKey, body);
    ctx.waitUntil(cache.put(cacheKey, new Response(body, { headers: AVATARS_HEADERS })));

    return new Response(body, { status: 200, headers: { ...AVATARS_HEADERS, ...cors } });
  } catch (error) {
    return jsonResponse({ error: "Upstream unavailable" }, 502, cors);
  } finally {
    clearTimeout(timer);
  }
}

function safeText(value, max) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function safeIcon(value) {
  return typeof value === "string" && ICON_NAME.test(value) ? value : "";
}

function safeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function slimCost(items) {
  const cost = {};

  if (items && typeof items === "object") {
    Object.keys(items).forEach((id) => {
      if (/^\d{1,9}$/.test(id) && Number.isFinite(items[id])) cost[id] = items[id];
    });
  }

  return cost;
}

function trimParams(params) {
  const list = Array.isArray(params) ? params.slice(0, 25).map(safeNumber) : [];

  while (list.length && list[list.length - 1] === 0) list.pop();

  return list;
}

function slimTalent(key, talent) {
  if (!talent || typeof talent !== "object") return null;

  const promote = talent.promote && typeof talent.promote === "object" ? talent.promote : null;
  const linked = talent.linkedConstellations && Array.isArray(talent.linkedConstellations.prop) ? talent.linkedConstellations.prop : [];
  const result = {
    key: String(key),
    skillId: safeNumber(talent.skillId),
    name: safeText(talent.name, 120),
    description: safeText(talent.description, 3000),
    icon: safeIcon(talent.icon),
    active: Boolean(promote),
    links: linked.slice(0, 6).map((entry) => safeNumber(entry && entry.id)),
    labels: [],
    levels: {},
    cooldown: safeNumber(talent.cooldown),
    energy: safeNumber(talent.cost)
  };

  if (promote) {
    const keys = Object.keys(promote).filter((level) => /^\d{1,2}$/.test(level));
    const first = keys.length ? promote[keys[0]] : null;

    if (first && Array.isArray(first.description)) {
      result.labels = first.description
        .filter((line) => typeof line === "string" && line.includes("|"))
        .slice(0, 24)
        .map((line) => line.slice(0, 200));
    }

    keys.forEach((level) => {
      const entry = promote[level];
      if (!entry || typeof entry !== "object") return;
      result.levels[level] = { p: trimParams(entry.params), c: slimCost(entry.costItems), m: safeNumber(entry.coinCost) };
    });
  }

  return result;
}

function slimConstellation(key, entry) {
  if (!entry || typeof entry !== "object") return null;

  const extra = entry.extraData && entry.extraData.addTalentExtraLevel;

  return {
    index: Number(key) || 0,
    name: safeText(entry.name, 160),
    description: safeText(entry.description, 1500),
    icon: safeIcon(entry.icon),
    extra: extra && typeof extra === "object" ? { index: safeNumber(extra.talentIndex), level: safeNumber(extra.extraLevel) } : null
  };
}

function slimItems(items) {
  const result = {};

  if (items && typeof items === "object") {
    Object.keys(items).slice(0, 80).forEach((id) => {
      const item = items[id];
      if (!/^\d{1,9}$/.test(id) || !item || typeof item !== "object") return;
      result[id] = { name: safeText(item.name, 80), rank: safeNumber(item.rank), icon: safeIcon(item.icon) };
    });
  }

  return result;
}

function slimCharacter(raw) {
  const data = raw && raw.data;

  if (!data || typeof data !== "object" || !Number.isFinite(data.id)) return null;

  const fetter = data.fetter && typeof data.fetter === "object" ? data.fetter : {};
  const other = data.other && typeof data.other === "object" ? data.other : {};
  const card = other.nameCard && typeof other.nameCard === "object" ? other.nameCard : null;
  const food = other.specialFood && typeof other.specialFood === "object" ? other.specialFood : null;
  const cv = fetter.cv && typeof fetter.cv === "object" ? fetter.cv : {};
  const promote = data.upgrade && Array.isArray(data.upgrade.promote) ? data.upgrade.promote : [];
  const talents = Object.keys(data.talent || {}).map((key) => slimTalent(key, data.talent[key])).filter(Boolean);
  const constellations = Object.keys(data.constellation || {})
    .map((key) => slimConstellation(key, data.constellation[key]))
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  return {
    id: data.id,
    name: safeText(data.name, 80),
    rank: safeNumber(data.rank),
    element: safeText(data.element, 20),
    weaponType: safeText(data.weaponType, 40),
    region: safeText(data.region, 40),
    birthday: Array.isArray(data.birthday) && data.birthday.length === 2 ? [safeNumber(data.birthday[0]), safeNumber(data.birthday[1])] : null,
    title: safeText(fetter.title, 120),
    detail: safeText(fetter.detail, 800),
    constellation: safeText(fetter.constellation, 120),
    native: safeText(fetter.native, 80),
    cv: { en: safeText(cv.EN, 80), jp: safeText(cv.JP, 80), kr: safeText(cv.KR, 80), chs: safeText(cv.CHS, 80) },
    namecard: card ? { name: safeText(card.name, 120), icon: safeIcon(card.icon) } : null,
    food: food ? { name: safeText(food.name, 120), rank: safeNumber(food.rank), icon: safeIcon(food.icon) } : null,
    talents,
    constellations,
    items: slimItems(data.items),
    promote: promote.slice(0, 7).map((step) => ({
      level: safeNumber(step && step.promoteLevel),
      max: safeNumber(step && step.unlockMaxLevel),
      c: slimCost(step && step.costItems),
      m: safeNumber(step && step.coinCost)
    }))
  };
}

async function handleCharacter(id, url, cors) {
  const requested = url.searchParams.get("lang");
  const lang = YATTA_LANGS.has(requested) ? requested : "en";
  const memoKey = "character-" + lang + "-" + id;

  const memoHit = memoGet(memoKey, CHARACTER_TTL_MS);
  if (memoHit) return new Response(memoHit, { status: 200, headers: { ...CHARACTER_HEADERS, ...cors } });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(YATTA + lang + "/avatar/" + id, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; genshin-build-card/1.0)", "Accept": "application/json" },
      signal: controller.signal
    });

    if (upstream.status === 404) return jsonResponse({ error: "Not found" }, 404, cors);
    if (!upstream.ok) return jsonResponse({ error: "Upstream status " + upstream.status }, 502, cors);

    const raw = await upstream.json();

    if (raw && raw.response === 404) return jsonResponse({ error: "Not found" }, 404, cors);

    const slim = slimCharacter(raw);

    if (!slim) return jsonResponse({ error: "Unexpected data" }, 502, cors);

    const body = JSON.stringify(slim);

    memoSet(memoKey, body);

    return new Response(body, { status: 200, headers: { ...CHARACTER_HEADERS, ...cors } });
  } catch (error) {
    return jsonResponse({ error: "Upstream unavailable" }, 502, cors);
  } finally {
    clearTimeout(timer);
  }
}

async function handleUid(id, cors) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch("https://enka.network/api/uid/" + id, {
      headers: { "User-Agent": "genshin-build-card/1.0" },
      signal: controller.signal
    });

    /* Kody błędów Enki (np. 400, 404, 424, 429) przekazujemy dalej, bo aplikacja pokazuje dla nich osobne komunikaty. */
    const contentType = upstream.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return jsonResponse({ error: "Upstream unavailable" }, upstream.ok ? 502 : upstream.status, cors);
    }

    return new Response(upstream.body, { status: upstream.status, headers: { ...BASE_HEADERS, ...cors } });
  } catch (error) {
    return jsonResponse({ error: "Upstream unavailable" }, 502, cors);
  } finally {
    clearTimeout(timer);
  }
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin");
    const cors = {};

    if (origin && isAllowedOrigin(origin)) cors["Access-Control-Allow-Origin"] = origin;

    if (request.method === "OPTIONS") {
      if (!origin || !isAllowedOrigin(origin)) return jsonResponse({ error: "Forbidden" }, 403);

      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin"
        }
      });
    }

    if (request.method !== "GET") return jsonResponse({ error: "Method not allowed" }, 405, { ...cors, Allow: "GET" });

    if (origin && !isAllowedOrigin(origin)) return jsonResponse({ error: "Forbidden" }, 403);

    const url = new URL(request.url);

    if (url.pathname === "/builds") {
      if (!(await allowed(env, request, "builds"))) return tooManyRequests(cors);
      return handleBuilds(cors, ctx);
    }

    if (url.pathname === "/avatars") {
      if (!(await allowed(env, request, "avatars"))) return tooManyRequests(cors);
      return handleAvatars(url, cors, ctx);
    }

    const characterMatch = url.pathname.match(/^\/character\/(\d{5,9})$/);

    if (characterMatch) {
      if (!(await allowed(env, request, "character"))) return tooManyRequests(cors);
      return handleCharacter(characterMatch[1], url, cors);
    }

    const match = url.pathname.match(/^\/uid\/(\d{9})$/);

    if (!match) return jsonResponse({ error: "Not found" }, 404, cors);

    if (!(await allowed(env, request, "uid"))) return tooManyRequests(cors);

    return handleUid(match[1], cors);
  }
};
