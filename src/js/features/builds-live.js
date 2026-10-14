/* Aktualne buildy pobierane przez Worker ze strony Game8. Jeśli Worker nie odpowie albo dane są podejrzane,
   zostaje wbudowana lista z hub.js. Dane z sieci są sprawdzane przed użyciem i trafiają do interfejsu tylko
   przez textContent. Ładowany po hub.js. */
const HUB_LIVE_URL = 'https://genshin-proxy.klaun970.workers.dev/builds';
const HUB_LIVE_KEY = 'builds-live';
const HUB_LIVE_TTL = 24 * 60 * 60 * 1000;
const HUB_LIVE_MIN = 20;
const HUB_LIVE_TOKEN = /^(AT|HP|DF|EM|ER|CR|CD|HB|ED|PD)$/;
const hubLive = { updated: null };

function hubLiveValid(name, entry) {
  if (!/^[A-Za-z][A-Za-z' .-]{1,39}$/.test(name) || !Array.isArray(entry) || entry.length !== 4) return false;
  const [role, sets, mains, subs] = entry;
  if (!Object.prototype.hasOwnProperty.call(HUB_ROLES, role)) return false;
  if (typeof sets !== 'string' || sets.length > 140) return false;
  if (typeof mains !== 'string' || typeof subs !== 'string' || !subs) return false;
  const slots = mains.split('|');
  if (slots.length !== 3) return false;
  const mainsOk = slots.every((slot) => slot.split('/').every((token) => HUB_LIVE_TOKEN.test(token)));
  return mainsOk && subs.split(',').every((token) => HUB_LIVE_TOKEN.test(token));
}

function hubLiveMerge(builds) {
  const valid = Object.keys(builds).slice(0, 300).filter((name) => hubLiveValid(name, builds[name]));
  if (valid.length < HUB_LIVE_MIN) return 0;
  valid.forEach((name) => {
    Object.keys(HUB_BUILDS).forEach((key) => {
      if (name === key || name.endsWith(' ' + key) || name.startsWith(key + ' ')) delete HUB_BUILDS[key];
    });
    HUB_BUILDS[name] = builds[name].slice();
  });
  return valid.length;
}

function hubLiveRefresh() {
  if (typeof hub !== 'undefined' && hub.open) hubRender();
  if (state.last && typeof renderDetail === 'function') renderDetail();
}

function hubLiveApply(data) {
  if (!data || typeof data !== 'object' || !data.builds || typeof data.builds !== 'object') return false;
  if (!hubLiveMerge(data.builds)) return false;
  hubLive.updated = typeof data.updated === 'number' ? data.updated : Date.now();
  hubLiveRefresh();
  return true;
}

async function hubLiveLoad() {
  const cached = loadJsonSetting(HUB_LIVE_KEY, null);
  const fresh = cached && typeof cached.savedAt === 'number' && Date.now() - cached.savedAt < HUB_LIVE_TTL;
  if (fresh && hubLiveApply(cached.data)) return;
  try {
    const response = await fetch(HUB_LIVE_URL, { credentials: 'omit' });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    if (hubLiveApply(data)) saveJsonSetting(HUB_LIVE_KEY, { savedAt: Date.now(), data });
  } catch (error) {
    console.warn('Live builds unavailable, using the built-in list.', error);
    if (cached && cached.data) hubLiveApply(cached.data);
  }
}

const hubStaticNote = hubSourceNote;
hubSourceNote = function () {
  const note = hubStaticNote();
  if (!hubLive.updated || !note.firstChild) return note;
  note.firstChild.textContent = hubText(
    'Dane z Game8, pobrane ' + formatDate(hubLive.updated) + '. Pełny poradnik: ',
    'Data from Game8, fetched ' + formatDate(hubLive.updated) + '. Full guide: '
  );
  return note;
};

hubLiveLoad();
