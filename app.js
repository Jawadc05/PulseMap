/* ============================================
   PULSEMAP — APPLICATION
   Main orchestrator, state, and event wiring
   ============================================ */

const GNEWS_API_KEY = 'a6140c8224a57bec95600699517a732a';
const GNEWS_BASE = 'https://gnews.io/api/v4';
// NewsData.io — free tier 200 req/day
const NEWSDATA_API_KEY = 'pub_7aborea0yrj5h0pgeg8ks01b2swizn4g07g1k';
const NEWSDATA_BASE = 'https://newsdata.io/api/1/latest';
// Currents API — free tier 600 req/day
const CURRENTS_API_KEY = 'XGiuHkn0k0-5dNNM-xhcJ44EaOPaFarTbr2OMRuqhVJ2hKH_';
const CURRENTS_BASE = 'https://api.currentsapi.services/v1';
// TheNewsAPI — free tier 150 req/day
const THENEWSAPI_KEY = 'AjuAeblbXcaF0ikWRhgEDzp44ejRQyYEhP61Ixaj';
const THENEWSAPI_BASE = 'https://api.thenewsapi.com/v1/news';
// MediaStack — free tier 500 req/month
const MEDIASTACK_KEY = '85cd31b97ac4d626681d32daa89db8b9';
const MEDIASTACK_BASE = 'http://api.mediastack.com/v1/news';
// NewsAPI.org — free tier 100 req/day (dev only, localhost)
const NEWSAPI_KEY = '8a878d46a41740a58b104a69dfcbe058';
const NEWSAPI_BASE = 'https://newsapi.org/v2';
const newsCache = {};

const state = {
  selectedCountry: null,
  activeCategory: 'all',
  isNewsPanelOpen: false,
  liveFeedIndex: 0,
  gnewsFailed: false,
  newsdataFailed: false,
  currentsFailed: false,
  thenewsapiFailed: false,
  mediastackFailed: false,
  newsapiFailed: false,
  dynamicHotspots: [],
  newsRefreshInterval: null,
};

const GNEWS_COUNTRIES = new Set([
  'au','br','ca','cn','eg','fr','de','gr','hk','in','ie','it','jp',
  'nl','no','pk','pe','ph','pt','ro','ru','sg','za','kr','se','ch','tw',
  'ua','gb','us','at','be','bg','cz','dk','fi','hu','id','lv','lt','my',
  'mx','nz','ng','pl','sa','rs','sk','si','es','th','tr','ae','ar','bd',
  'cl','co','cu','ke','ma','ve','vn',
]);

// ========== API ==========

// Country name resolver for search-based APIs
function getCountryName(cc) {
  const feature = countriesGeoJson.find(f => f.properties.ISO_A2 === cc);
  if (feature) return feature.properties.NAME;
  const names = { PS:'Palestine', LB:'Lebanon', SY:'Syria', UA:'Ukraine', RU:'Russia', MM:'Myanmar',
    SD:'Sudan', YE:'Yemen', IQ:'Iraq', IR:'Iran', AF:'Afghanistan', TW:'Taiwan',
    KR:'South Korea', AE:'UAE', SA:'Saudi Arabia', ZA:'South Africa', NZ:'New Zealand' };
  return names[cc] || cc;
}

async function fetchLiveNews(countryCode) {
  const cc = countryCode.toUpperCase();
  const ccLower = countryCode.toLowerCase();
  // Shorter cache — 60 seconds so news updates faster
  if (newsCache[cc] && Date.now() - (newsCache[cc]._ts || 0) < 60000) return newsCache[cc].articles;

  const countryName = getCountryName(cc);
  let liveArticles = [];

  // ---- API 1: GNews ----
  if (!state.gnewsFailed) {
    try {
      let url;
      if (GNEWS_COUNTRIES.has(ccLower)) {
        url = `${GNEWS_BASE}/top-headlines?country=${ccLower}&lang=en&max=10&token=${GNEWS_API_KEY}`;
      } else {
        url = `${GNEWS_BASE}/search?q=${encodeURIComponent(countryName + ' news')}&lang=en&max=10&token=${GNEWS_API_KEY}`;
      }
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.status === 429 || res.status === 403) state.gnewsFailed = true;
      else if (res.ok) {
        const data = await res.json();
        if (!data.errors && data.articles) {
          liveArticles.push(...data.articles.map(a => ({
            title: a.title || '', source: a.source?.name || 'Unknown',
            category: guessCategory((a.title || '') + ' ' + (a.description || '')),
            publishedAt: a.publishedAt || new Date().toISOString(),
            description: a.description || '', url: a.url || '#',
            imageUrl: a.image || null, isBreaking: isRecent(a.publishedAt, 4),
          })));
        }
      }
    } catch (e) { /* continue to next API */ }
  }

  // ---- API 2: NewsData.io ----
  if (!state.newsdataFailed && liveArticles.length < 5) {
    try {
      const ndUrl = `${NEWSDATA_BASE}?apikey=${NEWSDATA_API_KEY}&q=${encodeURIComponent(countryName)}&language=en&size=10`;
      const res = await fetch(ndUrl, { signal: AbortSignal.timeout(8000) });
      if (res.status === 429 || res.status === 403) state.newsdataFailed = true;
      else if (res.ok) {
        const data = await res.json();
        if (data.results) {
          data.results.forEach(a => {
            const title = a.title || '';
            if (!liveArticles.find(x => x.title === title)) {
              liveArticles.push({
                title, source: a.source_name || a.source_id || 'NewsData',
                category: guessCategory(title + ' ' + (a.description || '')),
                publishedAt: a.pubDate || new Date().toISOString(),
                description: a.description || '', url: a.link || '#',
                imageUrl: a.image_url || null, isBreaking: isRecent(a.pubDate, 4),
              });
            }
          });
        }
      }
    } catch (e) { /* continue */ }
  }

  // ---- API 3: Currents API ----
  if (!state.currentsFailed && liveArticles.length < 5) {
    try {
      const cUrl = `${CURRENTS_BASE}/search?apiKey=${CURRENTS_API_KEY}&keywords=${encodeURIComponent(countryName)}&language=en&page_size=10`;
      const res = await fetch(cUrl, { signal: AbortSignal.timeout(8000) });
      if (res.status === 429 || res.status === 403) state.currentsFailed = true;
      else if (res.ok) {
        const data = await res.json();
        if (data.news) {
          data.news.forEach(a => {
            const title = a.title || '';
            if (!liveArticles.find(x => x.title === title)) {
              liveArticles.push({
                title, source: a.author || 'Currents',
                category: guessCategory(title + ' ' + (a.description || '')),
                publishedAt: a.published || new Date().toISOString(),
                description: a.description || '', url: a.url || '#',
                imageUrl: a.image || null, isBreaking: isRecent(a.published, 4),
              });
            }
          });
        }
      }
    } catch (e) { /* continue */ }
  }

  // ---- API 4: TheNewsAPI ----
  if (!state.thenewsapiFailed && liveArticles.length < 5 && THENEWSAPI_KEY !== 'YOUR_THENEWSAPI_KEY') {
    try {
      const tnUrl = `${THENEWSAPI_BASE}/all?api_token=${THENEWSAPI_KEY}&search=${encodeURIComponent(countryName)}&language=en&limit=10`;
      const res = await fetch(tnUrl, { signal: AbortSignal.timeout(8000) });
      if (res.status === 429 || res.status === 403) state.thenewsapiFailed = true;
      else if (res.ok) {
        const data = await res.json();
        if (data.data) {
          data.data.forEach(a => {
            const title = a.title || '';
            if (!liveArticles.find(x => x.title === title)) {
              liveArticles.push({
                title, source: a.source || 'TheNewsAPI',
                category: guessCategory(title + ' ' + (a.description || '')),
                publishedAt: a.published_at || new Date().toISOString(),
                description: a.description || a.snippet || '', url: a.url || 'SEARCH',
                imageUrl: a.image_url || null, isBreaking: isRecent(a.published_at, 4),
              });
            }
          });
        }
      }
    } catch (e) { /* continue */ }
  }

  // ---- API 5: MediaStack ----
  if (!state.mediastackFailed && liveArticles.length < 5 && MEDIASTACK_KEY !== 'YOUR_MEDIASTACK_KEY') {
    try {
      const msUrl = `${MEDIASTACK_BASE}?access_key=${MEDIASTACK_KEY}&keywords=${encodeURIComponent(countryName)}&languages=en&limit=10`;
      const res = await fetch(msUrl, { signal: AbortSignal.timeout(8000) });
      if (res.status === 429 || res.status === 403) state.mediastackFailed = true;
      else if (res.ok) {
        const data = await res.json();
        if (data.data) {
          data.data.forEach(a => {
            const title = a.title || '';
            if (!liveArticles.find(x => x.title === title)) {
              liveArticles.push({
                title, source: a.source || 'MediaStack',
                category: guessCategory(title + ' ' + (a.description || '')),
                publishedAt: a.published_at || new Date().toISOString(),
                description: a.description || '', url: a.url || 'SEARCH',
                imageUrl: a.image || null, isBreaking: isRecent(a.published_at, 4),
              });
            }
          });
        }
      }
    } catch (e) { /* continue */ }
  }

  // ---- API 6: NewsAPI.org ----
  if (!state.newsapiFailed && liveArticles.length < 5) {
    try {
      const naUrl = `${NEWSAPI_BASE}/everything?q=${encodeURIComponent(countryName)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWSAPI_KEY}`;
      const res = await fetch(naUrl, { signal: AbortSignal.timeout(8000) });
      if (res.status === 429 || res.status === 403 || res.status === 426) state.newsapiFailed = true;
      else if (res.ok) {
        const data = await res.json();
        if (data.articles) {
          data.articles.forEach(a => {
            const title = a.title || '';
            if (title && title !== '[Removed]' && !liveArticles.find(x => x.title === title)) {
              liveArticles.push({
                title, source: a.source?.name || 'NewsAPI',
                category: guessCategory(title + ' ' + (a.description || '')),
                publishedAt: a.publishedAt || new Date().toISOString(),
                description: a.description || '', url: a.url || 'SEARCH',
                imageUrl: a.urlToImage || null, isBreaking: isRecent(a.publishedAt, 4),
              });
            }
          });
        }
      }
    } catch (e) { /* continue */ }
  }

  // Always merge with mock news for guaranteed content
  const mockNews = MOCK_NEWS[cc] || [];
  const combined = [...liveArticles];
  mockNews.forEach(m => {
    if (!combined.find(a => a.title === m.title)) combined.push(m);
  });

  // If we still have nothing, generate contextual news from country name
  if (combined.length === 0) {
    combined.push(...generateContextualNews(cc, countryName));
  }

  newsCache[cc] = { articles: combined, _ts: Date.now() };
  addHotspot(cc, combined);
  return combined;
}

// Generate contextual news for any country that has zero API/mock coverage
function generateContextualNews(cc, name) {
  const now = new Date();
  const ago = (h) => new Date(now - h * 3600000).toISOString();
  const templates = [
    { t: `${name}: Latest political developments and government updates`, s: 'Reuters', c: 'politics', h: 0.5, desc: `Breaking political developments from ${name}. Follow the latest government decisions, policy changes, and diplomatic updates.` },
    { t: `${name} economy: Markets, trade, and financial outlook`, s: 'Bloomberg', c: 'economy', h: 1, desc: `Economic analysis covering ${name}'s markets, trade relations, inflation data, and investment trends.` },
    { t: `${name} healthcare and public health updates`, s: 'WHO News', c: 'health', h: 2, desc: `Health sector developments in ${name} including public health initiatives, disease monitoring, and healthcare policy.` },
    { t: `Technology and innovation news from ${name}`, s: 'TechCrunch', c: 'technology', h: 3, desc: `Tech industry updates from ${name} covering startups, digital infrastructure, and innovation policy.` },
    { t: `${name}: Climate, environment, and sustainability`, s: 'The Guardian', c: 'environment', h: 4, desc: `Environmental news from ${name} including climate action, natural disasters, conservation, and sustainability efforts.` },
    { t: `Sports highlights and results from ${name}`, s: 'ESPN', c: 'sports', h: 5, desc: `Latest sports results, tournament updates, and athletic achievements from ${name}.` },
    { t: `${name}: Security and regional stability updates`, s: 'AP News', c: 'politics', h: 1.5, desc: `Security situation and regional developments affecting ${name} and neighboring countries.` },
    { t: `Education and social development in ${name}`, s: 'UN News', c: 'health', h: 6, desc: `Updates on education reform, social programs, and human development initiatives in ${name}.` },
  ];
  return templates.map(t => ({
    title: t.t, source: t.s, category: t.c,
    publishedAt: ago(t.h), description: t.desc,
    url: 'SEARCH', isBreaking: t.h < 1, imageUrl: null,
  }));
}

async function fetchTopHeadlinesGlobal() {
  let articles = [];

  // Try GNews first
  if (!state.gnewsFailed) {
    try {
      const res = await fetch(`${GNEWS_BASE}/top-headlines?lang=en&max=10&token=${GNEWS_API_KEY}`, { signal: AbortSignal.timeout(8000) });
      if (res.status === 429 || res.status === 403) state.gnewsFailed = true;
      else if (res.ok) {
        const data = await res.json();
        if (!data.errors && data.articles) {
          articles = data.articles.map(a => ({
            title: a.title || '', source: a.source?.name || 'Unknown',
            description: a.description || '', publishedAt: a.publishedAt || new Date().toISOString(),
            url: a.url || '#', imageUrl: a.image || null, isBreaking: isRecent(a.publishedAt, 4),
          }));
        }
      }
    } catch (e) { /* try next */ }
  }

  // Fallback: NewsData.io
  if (articles.length < 3 && !state.newsdataFailed) {
    try {
      const res = await fetch(`${NEWSDATA_BASE}?apikey=${NEWSDATA_API_KEY}&language=en&size=10`, { signal: AbortSignal.timeout(8000) });
      if (res.status === 429 || res.status === 403) state.newsdataFailed = true;
      else if (res.ok) {
        const data = await res.json();
        if (data.results) {
          data.results.forEach(a => {
            if (!articles.find(x => x.title === a.title)) {
              articles.push({
                title: a.title || '', source: a.source_name || 'NewsData',
                description: a.description || '', publishedAt: a.pubDate || new Date().toISOString(),
                url: a.link || '#', imageUrl: a.image_url || null, isBreaking: isRecent(a.pubDate, 4),
              });
            }
          });
        }
      }
    } catch (e) { /* continue */ }
  }

  // Fallback: Currents API
  if (articles.length < 3 && !state.currentsFailed) {
    try {
      const res = await fetch(`${CURRENTS_BASE}/latest-news?apiKey=${CURRENTS_API_KEY}&language=en&page_size=10`, { signal: AbortSignal.timeout(8000) });
      if (res.status === 429 || res.status === 403) state.currentsFailed = true;
      else if (res.ok) {
        const data = await res.json();
        if (data.news) {
          data.news.forEach(a => {
            if (!articles.find(x => x.title === a.title)) {
              articles.push({
                title: a.title || '', source: a.author || 'Currents',
                description: a.description || '', publishedAt: a.published || new Date().toISOString(),
                url: a.url || '#', imageUrl: a.image || null, isBreaking: isRecent(a.published, 4),
              });
            }
          });
        }
      }
    } catch (e) { /* continue */ }
  }

  return articles.length > 0 ? articles : null;
}

function addHotspot(isoCode, articles) {
  const extra = COUNTRY_EXTRA_DATA[isoCode];
  if (!extra) return;

  const breakingCount = articles.filter(a => a.isBreaking).length;
  const intensity = Math.min(1, 0.3 + (articles.length * 0.05) + (breakingCount * 0.15));

  // Check if this country is a known conflict zone
  const knownHotspot = NEWS_HOTSPOTS.find(h => h.countryCode === isoCode);
  const crisisType = knownHotspot?.crisisType || undefined;

  // Update existing or add new
  const existing = state.dynamicHotspots.findIndex(h => h.countryCode === isoCode);
  const hotspot = {
    lat: extra.lat, lng: extra.lng, countryCode: isoCode,
    isBreaking: breakingCount > 0,
    intensity: crisisType === 'war' ? Math.max(intensity, 0.9) : intensity,
    articleCount: articles.length,
    crisisType: crisisType,
  };

  if (existing >= 0) {
    state.dynamicHotspots[existing] = hotspot;
  } else {
    state.dynamicHotspots.push(hotspot);
  }

  updateGlobeMarkers(state.dynamicHotspots);
  updateNewsHeatRings(state.dynamicHotspots);
}

function guessCategory(text) {
  const t = text.toLowerCase();
  if (/war |conflict|military|bomb|attack|troop|missile|invasion|ceasefire|weapon|army|defense|nato/.test(t)) return 'politics';
  if (/politi|elect|senat|parliament|president|minister|govern|vote|law|legislat|democrat|republican|congress|sanction/.test(t)) return 'politics';
  if (/tech|ai |artificial|software|chip|cyber|robot|digital|startup|comput|silicon/.test(t)) return 'technology';
  if (/econom|market|stock|trade|gdp|inflation|bank|financ|invest|business|revenue|tariff/.test(t)) return 'economy';
  if (/scien|research|discover|space|nasa|physics|quantum|study|experiment/.test(t)) return 'science';
  if (/sport|football|soccer|tennis|basketball|olympic|champion|league|nba|nfl|fifa|cricket/.test(t)) return 'sports';
  if (/health|medic|hospital|disease|drug|vaccine|doctor|patient|cancer|virus|covid|pandemic/.test(t)) return 'health';
  if (/climate|environment|carbon|renewable|solar|emission|forest|pollut|ocean|wildlife|weather|hurricane|earthquake|flood/.test(t)) return 'environment';
  return 'politics';
}

function isRecent(dateStr, hours) {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) < hours * 3600000;
}

// ========== AIRCRAFT DATA LOOKUP ==========
const aircraftCache = {};

async function fetchAircraftData(icao24) {
  if (!icao24) return null;
  const hex = icao24.toLowerCase();
  if (aircraftCache[hex]) return aircraftCache[hex];

  try {
    // hexdb.io — free, no key, returns aircraft type/operator/registration
    const res = await fetch(`https://hexdb.io/api/v1/aircraft/${hex}`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const result = {
      registration: data.Registration || '',
      typecode: data.ICAOTypeCode || '',
      type: data.Type || '',
      manufacturer: data.Manufacturer || '',
      operator: data.RegisteredOwners || '',
      icao: hex.toUpperCase(),
    };
    aircraftCache[hex] = result;
    return result;
  } catch (e) {
    console.warn('Aircraft lookup failed:', hex, e.message);
    return null;
  }
}

async function fetchAircraftPhoto(icao24) {
  if (!icao24) return null;
  const hex = icao24.toLowerCase();
  try {
    const res = await fetch(`https://api.planespotters.net/pub/photos/hex/${hex}`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.photos && data.photos.length > 0) {
      const photo = data.photos[0];
      return {
        url: photo.thumbnail_large?.src || photo.thumbnail?.src || null,
        photographer: photo.photographer || '',
        link: photo.link || '',
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

// ========== FLIGHT SELECT ==========

function onFlightSelect(flight) {
  if (!flight) return;

  // Fly to flight position
  if (globe) globe.pointOfView({ lat: flight.lat, lng: flight.lng, altitude: 1.8 }, 1000);

  // Show route arc on globe
  showFlightRoute(flight);

  // Calculate ETA
  let etaStr = '—';
  if (flight.distToDestKm && flight.speed > 0) {
    const speedKmh = flight.speed * 1.852;
    const hoursRemaining = flight.distToDestKm / speedKmh;
    const mins = Math.round(hoursRemaining * 60);
    if (mins < 60) etaStr = `~${mins}m`;
    else etaStr = `~${Math.floor(hoursRemaining)}h ${mins % 60}m`;
  }

  // Build origin/destination display strings
  const originDisplay = flight.originName || flight.originAirport || flight.origin || '—';
  const destDisplay = flight.destName || flight.destAirport || '—';

  // Show detail overlay
  const overlay = document.getElementById('flight-detail-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('fd-callsign').textContent = flight.callsign;
  document.getElementById('fd-origin').textContent = originDisplay;
  document.getElementById('fd-dest').textContent = destDisplay;
  document.getElementById('fd-alt').textContent = flight.altitude.toLocaleString() + ' ft';
  document.getElementById('fd-speed').textContent = flight.speed + ' kts';
  document.getElementById('fd-heading').textContent = Math.round(flight.heading) + '°';
  document.getElementById('fd-eta').textContent = etaStr;

  // Reset aircraft detail sections
  document.getElementById('fd-photo-section').classList.add('hidden');
  document.getElementById('fd-aircraft-info').classList.add('hidden');

  // Fetch aircraft details async (ICAO hex lookup)
  if (flight.icao24) {
    loadAircraftDetails(flight.icao24);
  }

  document.getElementById('fd-close').onclick = () => {
    overlay.classList.add('hidden');
    clearFlightRoute();
  };

  // Highlight in list
  document.querySelectorAll('.flight-row').forEach(r => r.classList.remove('selected'));
  const row = document.querySelector(`.flight-row[data-callsign="${flight.callsign}"]`);
  if (row) row.classList.add('selected');

  // Ensure heat rings remain visible after clicking a flight
  if (state.dynamicHotspots.length > 0) {
    updateNewsHeatRings(state.dynamicHotspots);
  }

}

async function loadAircraftDetails(icao24) {
  // Fetch data and photo in parallel
  const [acData, acPhoto] = await Promise.all([
    fetchAircraftData(icao24),
    fetchAircraftPhoto(icao24),
  ]);

  // Only update if the overlay is still showing this flight
  const overlay = document.getElementById('flight-detail-overlay');
  if (overlay.classList.contains('hidden')) return;

  // Aircraft info
  if (acData && (acData.registration || acData.type || acData.operator)) {
    const infoEl = document.getElementById('fd-aircraft-info');
    infoEl.classList.remove('hidden');
    document.getElementById('fd-operator').textContent = acData.operator || '—';
    document.getElementById('fd-aircraft-type').textContent =
      (acData.manufacturer ? acData.manufacturer + ' ' : '') + (acData.type || acData.typecode || '—');
    document.getElementById('fd-icao').textContent = acData.icao || '—';
    document.getElementById('fd-registration').textContent = acData.registration || '—';
  }

  // Aircraft photo
  if (acPhoto && acPhoto.url) {
    const photoSection = document.getElementById('fd-photo-section');
    const photoEl = document.getElementById('fd-photo');
    const creditEl = document.getElementById('fd-photo-credit');
    photoEl.src = acPhoto.url;
    creditEl.textContent = acPhoto.photographer ? `Photo: ${acPhoto.photographer} — planespotters.net` : '';
    photoSection.classList.remove('hidden');
  }
}

function dismissFlightDetail() {
  const fdOverlay = document.getElementById('flight-detail-overlay');
  if (fdOverlay && !fdOverlay.classList.contains('hidden')) {
    fdOverlay.classList.add('hidden');
    clearFlightRoute();
    document.querySelectorAll('.flight-row').forEach(r => r.classList.remove('selected'));
  }
}

// ========== INIT ==========

document.addEventListener('DOMContentLoaded', () => {
  initGlobe();
  initPanels();
  renderWirePanel();
  renderStatsBar();
  setupEventListeners();
  startLiveFeed();
  startClock();
  setTimeout(loadLiveWire, 1500);

  // Initialize news hotspots from mock data
  initHotspotsFromMockData();

  // Initialize sea/maritime zones
  initSeaZones();

  // Refresh news every 90 seconds for constant updates
  state.newsRefreshInterval = setInterval(() => {
    loadLiveWire();
    if (state.selectedCountry) {
      renderNewsForCountry(state.selectedCountry, state.activeCategory);
    }
  }, 90000);

  // Also preload conflict zones immediately for instant news
  const conflictCountries = ['PS','LB','UA','SD','SY','YE','MM','IQ','IR'];
  conflictCountries.forEach((cc, i) => {
    setTimeout(() => fetchLiveNews(cc).catch(() => {}), 500 + i * 600);
  });
});

function initHotspotsFromMockData() {
  // Seed hotspots from all mock data + NEWS_HOTSPOTS (including crisisType)
  NEWS_HOTSPOTS.forEach(h => {
    const existing = state.dynamicHotspots.find(dh => dh.countryCode === h.countryCode);
    if (!existing) {
      state.dynamicHotspots.push({
        lat: h.lat, lng: h.lng,
        countryCode: h.countryCode,
        isBreaking: h.isBreaking,
        intensity: h.intensity,
        articleCount: (MOCK_NEWS[h.countryCode] || []).length,
        crisisType: h.crisisType,
      });
    }
  });
  updateGlobeMarkers(state.dynamicHotspots);
  updateNewsHeatRings(state.dynamicHotspots);
}

function onGlobeReady() {
  // Preload news for major countries
  const majors = ['US','GB','JP','DE','IN','FR','CN','AU','BR','KR','RU','UA','PS','SA','TR'];
  majors.forEach((cc, i) => {
    setTimeout(() => fetchLiveNews(cc).catch(() => {}), i * 800);
  });
}

function onCountrySelect(properties) {
  selectCountry(properties);
}

// ========== SEA ZONES ==========
function initSeaZones() {
  if (typeof SEA_ZONES === 'undefined' || !SEA_ZONES.length) return;

  // Wait for globe to be ready, then render
  const waitForGlobe = setInterval(() => {
    if (globe && typeof renderSeaZones === 'function') {
      clearInterval(waitForGlobe);
      renderSeaZones(SEA_ZONES);
      setupSeaZoneClicks();
    }
  }, 500);
}

function setupSeaZoneClicks() {
  // Use globe's onPointClick to detect sea zone clicks
  if (!globe) return;
  globe.onPointClick(point => {
    if (point && point.isSeaZone) {
      const zone = SEA_ZONES.find(z => z.id === point.seaZoneId);
      if (zone) openSeaZonePanel(zone);
    }
  });
}

function openSeaZonePanel(zone) {
  const panel = document.getElementById('panel-seazone');
  const title = document.getElementById('seazone-panel-title');
  const content = document.getElementById('seazone-content');

  // Fly to zone
  if (globe) globe.pointOfView({ lat: zone.lat, lng: zone.lng, altitude: 1.8 }, 1000);

  title.textContent = `⚓ ${zone.name}`;
  panel.classList.add('open');
  panel.classList.remove('minimized');

  const threatColor = zone.crisisType === 'war' ? 'var(--red)' :
    zone.intensity >= 0.8 ? 'var(--amber)' : zone.intensity >= 0.6 ? '#f5c518' : 'var(--green)';
  const threatLabel = zone.crisisType === 'war' ? 'CRITICAL' :
    zone.intensity >= 0.8 ? 'HIGH' : zone.intensity >= 0.6 ? 'ELEVATED' : 'MONITORING';

  content.innerHTML = `
    <div class="seazone-header">
      <div class="seazone-name">${zone.name}</div>
      <div class="seazone-subtitle">${zone.subtitle}</div>
      <div class="seazone-threat" style="color:${threatColor};">THREAT LEVEL: ${threatLabel}</div>
    </div>
    <div class="seazone-summary">${zone.summary}</div>
    <div class="section-label" style="margin-top:10px;">INTELLIGENCE FEED</div>
    ${zone.intel.map(item => `
      <div class="seazone-intel-item ${item.severity}">
        <div class="seazone-intel-title">${item.severity === 'critical' ? '🔴' : '🟠'} ${item.title}</div>
        <div class="seazone-intel-meta">${item.source} — ${item.time}</div>
      </div>
    `).join('')}
    <div class="seazone-coords">
      <span>LAT ${zone.lat.toFixed(2)}°</span> <span>LNG ${zone.lng.toFixed(2)}°</span>
    </div>
  `;

  // Close button
  document.getElementById('close-seazone-panel').onclick = () => {
    panel.classList.remove('open');
  };
}

// ========== CLOCK ==========
function startClock() {
  function update() {
    const el = document.getElementById('clock');
    if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour12: false }) + ' UTC' + (new Date().getTimezoneOffset() > 0 ? '-' : '+') + Math.abs(new Date().getTimezoneOffset() / 60);
  }
  update();
  setInterval(update, 1000);
}

// ========== WIRE PANEL ==========
function renderWirePanel() {
  document.getElementById('breaking-news').innerHTML = '<div class="dim-text" style="padding:8px;">Loading live news...</div>';

  // Show top stories from mock data immediately
  document.getElementById('top-stories').innerHTML = TOP_STORIES.map(s => `
    <div class="wire-story" data-country="${s.countryCode}">
      <div class="wire-story-title">${getCountryFlag(s.countryCode)} ${s.title}</div>
      <div class="wire-story-meta">
        <span class="wire-story-source">${s.source}</span>
        <span>${s.timeAgo}</span>
      </div>
    </div>
  `).join('');

  document.getElementById('live-feed').innerHTML = LIVE_FEED_EVENTS.slice(0, 5).map(createLiveFeedItem).join('');

  // Click to fly
  document.getElementById('top-stories').addEventListener('click', e => {
    const el = e.target.closest('.wire-story');
    if (!el) return;
    const iso = el.dataset.country;
    const feature = countriesGeoJson.find(f => f.properties.ISO_A2 === iso);
    if (feature) {
      const center = getCountryCenter(feature);
      flyToCountry(center.lat, center.lng);
      selectCountry(feature.properties);
    }
  });
}

async function loadLiveWire() {
  const articles = await fetchTopHeadlinesGlobal();
  if (!articles || articles.length === 0) {
    // Use mock data as fallback — always show content
    renderWireFallback();
    return;
  }

  // Breaking
  const breaking = articles.filter(a => a.isBreaking);
  const breakingContainer = document.getElementById('breaking-news');
  if (breaking.length > 0) {
    breakingContainer.innerHTML = breaking.map(a => `
      <div class="wire-story breaking" onclick="window.open('${a.url}','_blank')">
        <span class="wire-story-badge breaking">⚡ BREAKING</span>
        <div class="wire-story-title">${a.title}</div>
        <div class="wire-story-meta">
          <span class="wire-story-source">${a.source}</span>
          <span>${timeAgo(a.publishedAt)}</span>
        </div>
      </div>
    `).join('');
  } else {
    breakingContainer.innerHTML = '<div class="dim-text" style="padding:6px;font-size:9px;">No breaking news at this time</div>';
  }

  // Top stories with real data
  document.getElementById('top-stories').innerHTML = articles.slice(0, 8).map(a => `
    <div class="wire-story" onclick="window.open('${a.url}','_blank')" style="cursor:pointer;">
      <div class="wire-story-title">${a.title}</div>
      <div class="wire-story-meta">
        <span class="wire-story-source">${a.source}</span>
        <span>${timeAgo(a.publishedAt)}</span>
      </div>
    </div>
  `).join('');

  // Live feed with real data
  document.getElementById('live-feed').innerHTML = articles.slice(0, 8).map(a => `
    <div class="feed-item">
      <span class="feed-dot ${a.isBreaking ? 'breaking' : 'update'}"></span>
      <div>
        <div class="feed-text">${a.title}</div>
        <div class="feed-time">${timeAgo(a.publishedAt)}</div>
      </div>
    </div>
  `).join('');

  // Update alerts panel
  renderAlertsPanel();

  // Update stats bar
  renderStatsBar();
}

function renderWireFallback() {
  // Show mock breaking news
  const mockBreaking = [];
  Object.entries(MOCK_NEWS).forEach(([cc, articles]) => {
    articles.forEach(a => { if (a.isBreaking) mockBreaking.push({ ...a, countryCode: cc }); });
  });

  const breakingContainer = document.getElementById('breaking-news');
  if (mockBreaking.length > 0) {
    breakingContainer.innerHTML = mockBreaking.slice(0, 5).map(a => `
      <div class="wire-story breaking">
        <span class="wire-story-badge breaking">⚡ BREAKING</span>
        <div class="wire-story-title">${getCountryFlag(a.countryCode)} ${a.title}</div>
        <div class="wire-story-meta">
          <span class="wire-story-source">${a.source}</span>
          <span>${timeAgo(a.publishedAt)}</span>
        </div>
      </div>
    `).join('');
  }
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
  // Category filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.dataset.category;
      if (state.isNewsPanelOpen && state.selectedCountry) {
        renderNewsForCountry(state.selectedCountry, state.activeCategory);
      }
    });
  });

  // Search
  const searchInput = document.getElementById('search-input');
  const searchDropdown = document.getElementById('search-dropdown');

  searchInput.addEventListener('input', debounce(e => {
    const q = e.target.value;
    if (q.length < 1) { searchDropdown.classList.add('hidden'); return; }
    const results = searchCountries(q, countriesGeoJson);
    if (results.length === 0) { searchDropdown.classList.add('hidden'); return; }
    searchDropdown.innerHTML = results.map(f => {
      const iso = f.properties.ISO_A2;
      return `<div class="search-result" data-iso="${iso}">
        <span class="flag">${getCountryFlag(iso)}</span>
        <span class="name">${f.properties.NAME}</span>
        <span class="region">${f.properties.REGION_UN || ''}</span>
      </div>`;
    }).join('');
    searchDropdown.classList.remove('hidden');
    searchDropdown.querySelectorAll('.search-result').forEach(r => {
      r.addEventListener('click', () => {
        const feature = countriesGeoJson.find(f => f.properties.ISO_A2 === r.dataset.iso);
        if (feature) {
          const center = getCountryCenter(feature);
          flyToCountry(center.lat, center.lng);
          selectCountry(feature.properties);

          // Show search pin on globe
          showSearchPin(center.lat, center.lng, feature.properties.NAME);

          searchDropdown.classList.add('hidden');
          searchInput.value = '';
        }
      });
    });
  }, 200));

  document.addEventListener('click', e => {
    if (!e.target.closest('#search-container')) searchDropdown.classList.add('hidden');
  });

  document.getElementById('close-news-panel').addEventListener('click', closeNewsPanel);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      searchDropdown.classList.add('hidden');
      if (state.isNewsPanelOpen) closeNewsPanel();
      // Close flight detail
      dismissFlightDetail();
    }
  });

  // Click anywhere on globe to dismiss flight route overlay
  document.getElementById('globe-container').addEventListener('click', e => {
    // Don't dismiss if clicking a flight icon or the flight detail overlay itself
    if (e.target.closest('.flight-icon-wrap') || e.target.closest('#flight-detail-overlay')) return;
    dismissFlightDetail();
  });
}

// ========== COUNTRY SELECTION ==========
function selectCountry(properties) {
  const iso = properties.ISO_A2;
  if (!iso || iso === '-99') return;

  state.selectedCountry = iso;
  state.isNewsPanelOpen = true;

  const extra = COUNTRY_EXTRA_DATA[iso] || {};
  const panel = document.getElementById('news-panel');
  const content = document.getElementById('news-panel-content');
  const placeholder = document.getElementById('news-panel-placeholder');

  panel.classList.add('open');
  panel.classList.remove('minimized');
  placeholder.style.display = 'none';
  content.classList.remove('hidden');

  document.getElementById('news-panel-title').textContent = (properties.NAME || iso).toUpperCase();
  document.getElementById('country-flag').textContent = getCountryFlag(iso);
  document.getElementById('country-name').textContent = properties.NAME || iso;
  document.getElementById('country-region').textContent = (properties.SUBREGION || properties.REGION_UN || '').toUpperCase();

  const pop = properties.POP_EST;
  const gdp = properties.GDP_MD_EST;
  document.getElementById('country-stats').innerHTML = `
    <div class="country-stat"><div class="country-stat-label">CAPITAL</div><div class="country-stat-value">${extra.capital || 'N/A'}</div></div>
    <div class="country-stat"><div class="country-stat-label">POPULATION</div><div class="country-stat-value">${pop ? formatNumber(pop) : 'N/A'}</div></div>
    <div class="country-stat"><div class="country-stat-label">GDP</div><div class="country-stat-value">${gdp ? '$' + formatNumber(gdp * 1e6) : 'N/A'}</div></div>
    <div class="country-stat"><div class="country-stat-label">CURRENCY</div><div class="country-stat-value">${extra.currency || 'N/A'}</div></div>
  `;

  renderNewsForCountry(iso, state.activeCategory);
}

async function renderNewsForCountry(iso, category) {
  const newsCount = document.getElementById('news-count');
  const newsList = document.getElementById('news-list');

  newsCount.textContent = 'LOADING...';
  newsList.innerHTML = '<div class="no-news"><div class="loading-spinner" style="width:20px;height:20px;border-width:2px;margin:10px auto;"></div></div>';

  let allNews;
  try { allNews = await fetchLiveNews(iso); } catch { allNews = MOCK_NEWS[iso] || []; }
  if (state.selectedCountry !== iso) return;

  // If API returned nothing, always fall back to mock
  if (!allNews || allNews.length === 0) {
    allNews = MOCK_NEWS[iso] || [];
  }

  const filtered = filterNewsByCategory(allNews, category);
  if (filtered.length === 0) {
    newsCount.textContent = '';
    newsList.innerHTML = '<div class="no-news"><p class="dim-text">No news available for this region</p></div>';
    return;
  }

  newsCount.textContent = `${filtered.length} ARTICLE${filtered.length !== 1 ? 'S' : ''} ${category !== 'all' ? '• ' + category.toUpperCase() : ''}`;
  newsList.innerHTML = filtered.map(createNewsCard).join('');
}

function closeNewsPanel() {
  state.isNewsPanelOpen = false;
  state.selectedCountry = null;
  const panel = document.getElementById('news-panel');
  panel.classList.remove('open');
  document.getElementById('news-panel-content').classList.add('hidden');
  document.getElementById('news-panel-placeholder').style.display = '';
  resetSelection();
}

// ========== LIVE FEED ==========
function startLiveFeed() {
  state.liveFeedIndex = 5;
  setInterval(() => {
    const feed = document.getElementById('live-feed');
    if (!feed) return;
    const ev = LIVE_FEED_EVENTS[state.liveFeedIndex % LIVE_FEED_EVENTS.length];
    const wrapper = document.createElement('div');
    wrapper.innerHTML = createLiveFeedItem({ ...ev, time: 'just now' });
    const el = wrapper.firstElementChild;
    if (el) feed.insertBefore(el, feed.firstChild);
    while (feed.children.length > 10) feed.lastElementChild.remove();
    state.liveFeedIndex++;
  }, 8000);
}

// ========== STATS BAR ==========
function renderStatsBar() {
  let total = 0, breaking = 0;
  const sources = new Set();

  // Count from cache (live data)
  Object.values(newsCache).forEach(cached => {
    const articles = cached.articles || cached;
    if (Array.isArray(articles)) {
      total += articles.length;
      articles.forEach(a => { if (a.isBreaking) breaking++; sources.add(a.source); });
    }
  });

  // Also count mock data
  Object.values(MOCK_NEWS).forEach(articles => {
    total += articles.length;
    articles.forEach(a => { if (a.isBreaking) breaking++; sources.add(a.source); });
  });

  const regions = new Set([...Object.keys(newsCache), ...Object.keys(MOCK_NEWS)]).size;

  animateCounter(document.getElementById('stat-articles'), total);
  animateCounter(document.getElementById('stat-regions'), regions);
  animateCounter(document.getElementById('stat-breaking'), breaking);
  animateCounter(document.getElementById('stat-sources'), sources.size);
  document.getElementById('stat-updated').textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
}
