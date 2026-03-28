/* ============================================
   PULSEMAP — PANELS
   Floating panel logic: TV, Cameras, Stocks,
   Flights, Alerts
   ============================================ */

// ========== LIVE TV CHANNELS ==========
// Mix of direct video IDs (most reliable) and channel-based fallbacks
// TV channels: using direct website embeds where possible (most reliable),
// YouTube direct video IDs second, live_stream?channel= as last resort
const TV_CHANNELS = [
  // --- Verified direct video ID embeds (most reliable on YouTube) ---
  { name: 'Al Jazeera English', desc: 'Live 24/7 News — Qatar', embedUrl: 'https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1&mute=0', region: 'middleeast' },
  { name: 'France 24 English', desc: 'International News — France', embedUrl: 'https://www.youtube.com/embed/h3MuIUNCCzI?autoplay=1&mute=0', region: 'europe' },
  { name: 'DW News', desc: 'Deutsche Welle — Germany', embedUrl: 'https://www.youtube.com/embed/GE_SfNVNyqk?autoplay=1&mute=0', region: 'europe' },
  { name: 'Sky News', desc: 'Breaking News — UK', embedUrl: 'https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=1&mute=0', region: 'europe' },
  { name: 'ABC News Live', desc: '24/7 Coverage — USA', embedUrl: 'https://www.youtube.com/embed/w_Ma8oQLmSM?autoplay=1&mute=0', region: 'namerica' },
  { name: 'NBC News NOW', desc: 'Live US News', embedUrl: 'https://www.youtube.com/embed/Mva-JMH3MmU?autoplay=1&mute=0', region: 'namerica' },
  { name: 'CNA 24/7', desc: 'Channel NewsAsia — Singapore', embedUrl: 'https://www.youtube.com/embed/XWq5kBlakcQ?autoplay=1&mute=0', region: 'asia' },
  { name: 'NHK World', desc: 'Japan Broadcasting', embedUrl: 'https://www.youtube.com/embed/f0lYkdA-Gdg?autoplay=1&mute=0', region: 'asia' },
  // --- Direct website stream embeds (bypass YouTube entirely) ---
  { name: 'Euronews', desc: 'European News — Live', embedUrl: 'https://www.euronews.com/embed/live', region: 'europe' },
  { name: 'CGTN', desc: 'China Global TV Network', embedUrl: 'https://news.cgtn.com/resource/live/english/cgtn-news.m3u8', region: 'asia' },
  { name: 'TRT World', desc: 'International — Turkey', embedUrl: 'https://www.youtube.com/embed/CV5Fooi8YJA?autoplay=1&mute=0', region: 'middleeast' },
  { name: 'WION', desc: 'World Is One News — India', embedUrl: 'https://www.youtube.com/embed/VsJmrjGaVU0?autoplay=1&mute=0', region: 'asia' },
  { name: 'India Today', desc: 'Live News — India', embedUrl: 'https://www.youtube.com/embed/Nq2wYlWFucg?autoplay=1&mute=0', region: 'asia' },
  { name: 'NDTV 24x7', desc: 'Live News — India', embedUrl: 'https://www.youtube.com/embed/MN8p-Vrn6G0?autoplay=1&mute=0', region: 'asia' },
  { name: 'Arirang TV', desc: 'South Korea — International', embedUrl: 'https://www.youtube.com/embed/bLvRwaJMsew?autoplay=1&mute=0', region: 'asia' },
  { name: 'RT News', desc: 'Russia Today — Live', embedUrl: 'https://odysee.com/$/embed/live:932e046cb4834898bbdf51bbb2c8a804d97d71b3?autoplay=1', region: 'europe' },
  { name: 'Bloomberg TV', desc: 'Markets & Business', embedUrl: 'https://www.youtube.com/embed/dp8PhLsUcFE?autoplay=1&mute=0', region: 'namerica' },
  { name: 'Reuters Live', desc: 'Breaking World News', embedUrl: 'https://www.youtube.com/embed/JBwnEMXq8MU?autoplay=1&mute=0', region: 'global' },
];

function renderTVPanel() {
  const container = document.getElementById('tv-channels');
  const player = document.getElementById('tv-player');
  const iframe = document.getElementById('tv-iframe');

  container.innerHTML = TV_CHANNELS.map((ch, i) => `
    <div class="tv-channel" data-idx="${i}">
      <span class="tv-channel-live"></span>
      <div>
        <div class="tv-channel-name">${ch.name}</div>
        <div class="tv-channel-desc">${ch.desc}</div>
      </div>
      <span class="tv-channel-viewers">LIVE</span>
    </div>
  `).join('');

  container.querySelectorAll('.tv-channel').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.idx);
      const ch = TV_CHANNELS[idx];
      iframe.src = ch.embedUrl;
      player.classList.remove('hidden');
      container.style.display = 'none';

      if (!document.getElementById('tv-back')) {
        const backBtn = document.createElement('button');
        backBtn.id = 'tv-back';
        backBtn.className = 'action-btn';
        backBtn.textContent = '← BACK TO CHANNELS';
        backBtn.style.marginBottom = '10px';
        backBtn.addEventListener('click', () => {
          iframe.src = '';
          player.classList.add('hidden');
          container.style.display = '';
          backBtn.remove();
        });
        player.parentElement.insertBefore(backBtn, player);
      }
    });
  });
}

// ========== LIVE CAMERAS ==========
// Uses Windy Webcams API to fetch real, working webcam embed URLs
// Get your free key at: https://api.windy.com -> sign up -> Keys -> Webcams -> create key
const WINDY_WEBCAMS_KEY = 'VTtribbA4c3dQRIG5NSBX9RtCQqg6yeF';

// Camera locations -- Windy API finds nearest working webcam
const CAMERA_LOCATIONS = [
  // North America
  { name: 'New York City', lat: 40.758, lng: -73.985, region: 'namerica', thumb: '🗽' },
  { name: 'Miami Beach', lat: 25.790, lng: -80.130, region: 'namerica', thumb: '🏖' },
  { name: 'Los Angeles', lat: 34.052, lng: -118.243, region: 'namerica', thumb: '🎬' },
  { name: 'Las Vegas', lat: 36.169, lng: -115.140, region: 'namerica', thumb: '🎰' },
  { name: 'Niagara Falls', lat: 43.083, lng: -79.074, region: 'namerica', thumb: '🌊' },
  // Europe
  { name: 'London', lat: 51.507, lng: -0.127, region: 'europe', thumb: '🇬🇧' },
  { name: 'Paris', lat: 48.858, lng: 2.294, region: 'europe', thumb: '🇫🇷' },
  { name: 'Venice', lat: 45.434, lng: 12.338, region: 'europe', thumb: '🇮🇹' },
  { name: 'Barcelona', lat: 41.385, lng: 2.173, region: 'europe', thumb: '🇪🇸' },
  { name: 'Amsterdam', lat: 52.370, lng: 4.895, region: 'europe', thumb: '🇳🇱' },
  { name: 'Santorini', lat: 36.393, lng: 25.461, region: 'europe', thumb: '🇬🇷' },
  // Asia
  { name: 'Tokyo', lat: 35.659, lng: 139.700, region: 'asia', thumb: '🏙' },
  { name: 'Seoul', lat: 37.566, lng: 126.978, region: 'asia', thumb: '🇰🇷' },
  { name: 'Bangkok', lat: 13.756, lng: 100.501, region: 'asia', thumb: '🇹🇭' },
  { name: 'Bali', lat: -8.409, lng: 115.189, region: 'asia', thumb: '🌴' },
  // Other
  { name: 'Dubai', lat: 25.197, lng: 55.274, region: 'other', thumb: '🏗' },
  { name: 'Sydney', lat: -33.857, lng: 151.215, region: 'other', thumb: '🇦🇺' },
  { name: 'Cape Town', lat: -33.918, lng: 18.423, region: 'other', thumb: '🇿🇦' },
];

// Cache fetched webcam data
let webcamCache = {};
let activeCamRegion = 'all';

// Fetch nearest webcam with embed player URL from Windy API
async function fetchWebcamForLocation(loc) {
  const cacheKey = loc.lat + ',' + loc.lng;
  if (webcamCache[cacheKey]) return webcamCache[cacheKey];
  if (WINDY_WEBCAMS_KEY === 'YOUR_WINDY_KEY') return null;

  try {
    const url = 'https://api.windy.com/webcams/api/v3/webcams?lang=en&limit=5&offset=0&nearby=' + loc.lat + ',' + loc.lng + ',50&include=player,images,location';
    const res = await fetch(url, {
      headers: { 'x-windy-api-key': WINDY_WEBCAMS_KEY },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.webcams && data.webcams.length > 0) {
      for (const wc of data.webcams) {
        if (wc.player && (wc.player.day || wc.player.month || wc.player.lifetime)) {
          const result = {
            embedUrl: wc.player.day || wc.player.month || wc.player.lifetime,
            title: wc.title || loc.name,
            thumbnail: (wc.images && wc.images.current) ? wc.images.current.preview : null,
            location: (wc.location && wc.location.city) ? wc.location.city : loc.name,
          };
          webcamCache[cacheKey] = result;
          return result;
        }
      }
    }
  } catch (e) { /* silent fail */ }
  return null;
}

function renderCamerasPanel() {
  const grid = document.getElementById('cameras-grid');
  const filtered = activeCamRegion === 'all'
    ? CAMERA_LOCATIONS
    : CAMERA_LOCATIONS.filter(c => c.region === activeCamRegion);

  grid.innerHTML = filtered.map((loc, i) => `
    <div class="cam-card" data-idx="${i}">
      <div class="cam-thumb-placeholder" id="cam-thumb-${i}">${loc.thumb}</div>
      <div class="cam-info">
        <div class="cam-name">${loc.name}</div>
        <div class="cam-location">${loc.region.replace('namerica','N. America').replace('europe','Europe').replace('asia','Asia').replace('other','Other')}</div>
      </div>
      <div class="cam-status" id="cam-status-${i}">LOADING...</div>
    </div>
  `).join('');

  // Fetch webcam data for each location
  filtered.forEach(async (loc, i) => {
    const wc = await fetchWebcamForLocation(loc);
    const statusEl = document.getElementById('cam-status-' + i);
    const thumbEl = document.getElementById('cam-thumb-' + i);
    if (!statusEl) return;

    if (wc) {
      statusEl.textContent = 'LIVE';
      statusEl.style.color = 'var(--green)';
      if (wc.thumbnail && thumbEl) {
        thumbEl.style.backgroundImage = 'url(' + wc.thumbnail + ')';
        thumbEl.style.backgroundSize = 'cover';
        thumbEl.style.backgroundPosition = 'center';
        thumbEl.textContent = '';
      }
    } else {
      statusEl.textContent = WINDY_WEBCAMS_KEY === 'YOUR_WINDY_KEY' ? 'NEED API KEY' : 'OFFLINE';
      statusEl.style.color = 'var(--text-muted)';
    }
  });

  grid.querySelectorAll('.cam-card').forEach(card => {
    card.addEventListener('click', async () => {
      const idx = parseInt(card.dataset.idx);
      const allLocs = activeCamRegion === 'all'
        ? CAMERA_LOCATIONS
        : CAMERA_LOCATIONS.filter(c => c.region === activeCamRegion);
      const loc = allLocs[idx];
      if (!loc) return;

      const wc = await fetchWebcamForLocation(loc);
      if (wc && wc.embedUrl) {
        openCameraViewer(wc.embedUrl, wc.title || loc.name);
      } else {
        openCameraViewer('about:blank', loc.name + (WINDY_WEBCAMS_KEY === 'YOUR_WINDY_KEY' ? ' — Add Windy API key' : ' — No webcam found'));
      }
    });
  });

  document.querySelectorAll('.cam-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cam-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCamRegion = btn.dataset.region;
      renderCamerasPanel();
    });
  });
}

function openCameraViewer(url, name) {
  const grid = document.getElementById('cameras-grid');
  grid.innerHTML = `
    <div style="grid-column: 1/-1;">
      <button class="action-btn" id="cam-back" style="margin-bottom:8px;">← BACK TO CAMERAS</button>
      <div style="font-size:11px;color:var(--green);margin-bottom:6px;font-weight:700;">${name}</div>
      <iframe src="${url}" style="width:100%;height:260px;border:1px solid var(--border);border-radius:var(--radius);background:#000;" allowfullscreen allow="autoplay; encrypted-media"></iframe>
    </div>
  `;
  document.getElementById('cam-back').addEventListener('click', () => renderCamerasPanel());
}

// ========== STOCKS ==========
const FINNHUB_KEY = 'ctdm5e1r01qjg0bmuhmgctdm5e1r01qjg0bmuhn0';

const STOCK_INDICES = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'Nasdaq 100' },
  { symbol: 'DIA', name: 'Dow Jones' },
  { symbol: 'IWM', name: 'Russell 2000' },
  { symbol: 'VGK', name: 'Europe (STOXX)' },
  { symbol: 'EWJ', name: 'Japan (Nikkei)' },
  { symbol: 'FXI', name: 'China (CSI)' },
  { symbol: 'EEM', name: 'Emerging Mkts' },
];

const STOCK_MOVERS_LIST = [
  'NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'JPM', 'V', 'XOM',
  'AMD', 'NFLX', 'COIN', 'PLTR', 'SOFI',
];

const CRYPTO_LIST = [
  { symbol: 'BINANCE:BTCUSDT', name: 'BTC' },
  { symbol: 'BINANCE:ETHUSDT', name: 'ETH' },
  { symbol: 'BINANCE:SOLUSDT', name: 'SOL' },
  { symbol: 'BINANCE:BNBUSDT', name: 'BNB' },
  { symbol: 'BINANCE:XRPUSDT', name: 'XRP' },
  { symbol: 'BINANCE:ADAUSDT', name: 'ADA' },
  { symbol: 'BINANCE:DOGEUSDT', name: 'DOGE' },
  { symbol: 'BINANCE:DOTUSDT', name: 'DOT' },
];

let stocksCache = {};

async function fetchQuote(symbol) {
  if (stocksCache[symbol] && Date.now() - stocksCache[symbol]._ts < 60000) return stocksCache[symbol];
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    data._ts = Date.now();
    stocksCache[symbol] = data;
    return data;
  } catch (e) {
    console.warn('Quote fetch failed:', symbol, e.message);
    return null;
  }
}

async function searchStock(query) {
  try {
    const res = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_KEY}`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return (data.result || []).slice(0, 8);
  } catch (e) {
    console.warn('Stock search failed:', e.message);
    return [];
  }
}

async function renderStocksPanel(tab = 'indices') {
  const content = document.getElementById('stocks-content');
  content.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;margin:20px auto;"></div>';

  let rows = [];
  if (tab === 'indices') {
    const results = await Promise.all(STOCK_INDICES.map(async s => {
      const q = await fetchQuote(s.symbol);
      if (!q || q.c === 0) return { name: s.name, symbol: s.symbol, change: 0, price: 0 };
      const pctChange = q.pc > 0 ? ((q.c - q.pc) / q.pc * 100) : 0;
      return { name: s.name, symbol: s.symbol, change: pctChange, price: q.c };
    }));
    rows = results;
  } else if (tab === 'movers') {
    const results = await Promise.all(STOCK_MOVERS_LIST.map(async sym => {
      const q = await fetchQuote(sym);
      if (!q || q.c === 0) return { name: sym, symbol: sym, change: 0, price: 0 };
      const pctChange = q.pc > 0 ? ((q.c - q.pc) / q.pc * 100) : 0;
      return { name: sym, symbol: sym, change: pctChange, price: q.c };
    }));
    rows = results.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  } else {
    const results = await Promise.all(CRYPTO_LIST.map(async s => {
      const q = await fetchQuote(s.symbol);
      if (!q || q.c === 0) return { name: s.name, symbol: s.symbol, change: 0, price: 0 };
      const pctChange = q.pc > 0 ? ((q.c - q.pc) / q.pc * 100) : 0;
      return { name: s.name, symbol: s.symbol, change: pctChange, price: q.c };
    }));
    rows = results;
  }

  const maxAbs = Math.max(...rows.map(d => Math.abs(d.change)), 0.01);

  content.innerHTML = `
    <div style="font-size:9px;color:var(--text-muted);margin-bottom:8px;letter-spacing:1px;">
      MARKET ${tab.toUpperCase()} — LIVE DATA
    </div>
    ${rows.map(s => {
      const dir = s.change >= 0 ? 'up' : 'down';
      const barW = (Math.abs(s.change) / maxAbs * 100).toFixed(0);
      return `
        <div class="stock-row clickable" data-symbol="${s.symbol}">
          <span class="stock-expand">${s.change >= 0 ? '▲' : '▼'}</span>
          <span class="stock-name">${s.name}</span>
          <span class="stock-price">$${s.price ? s.price.toFixed(2) : '—'}</span>
          <span class="stock-change ${dir}">${s.change >= 0 ? '+' : ''}${s.change.toFixed(2)}%</span>
          <div class="stock-bar-wrap"><div class="stock-bar ${dir}" style="width:${barW}%"></div></div>
        </div>`;
    }).join('')}
  `;

  // Click a stock row to see TradingView chart
  content.querySelectorAll('.stock-row.clickable').forEach(row => {
    row.addEventListener('click', () => {
      showStockChart(row.dataset.symbol);
    });
  });

  document.querySelectorAll('.stock-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.stock-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderStocksPanel(btn.dataset.stock);
    });
  });
}

function showStockChart(symbol) {
  const content = document.getElementById('stocks-content');
  // Use TradingView mini chart widget
  const tvSymbol = symbol.includes(':') ? symbol : symbol;
  content.innerHTML = `
    <div class="stock-detail-card">
      <button class="action-btn" onclick="renderStocksPanel('indices')" style="margin:0 0 10px 0;padding:4px 12px;font-size:9px;">← BACK</button>
      <div class="stock-detail-symbol-header">${symbol}</div>
      <div id="tv-chart-container">
        <iframe src="https://www.google.com/finance/quote/${symbol}:NASDAQ?window=1M" style="display:none;"></iframe>
        <!-- TradingView Widget -->
        <div class="tradingview-widget-container" style="height:320px;width:100%;">
          <iframe
            src="https://s.tradingview.com/widgetembed/?symbol=${tvSymbol}&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=0a0e17&studies=&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=pulsemap"
            style="width:100%;height:320px;border:1px solid var(--border);border-radius:var(--radius);background:#0a0e17;"
            allowtransparency="true"
            frameborder="0"
            allowfullscreen>
          </iframe>
        </div>
      </div>
    </div>
  `;
}

function initStockSearch() {
  const input = document.getElementById('stock-search-input');
  const results = document.getElementById('stock-search-results');
  if (!input) return;

  input.addEventListener('input', debounce(async (e) => {
    const q = e.target.value.trim();
    if (q.length < 1) { results.classList.add('hidden'); return; }
    const matches = await searchStock(q);
    if (matches.length === 0) { results.classList.add('hidden'); return; }
    results.innerHTML = matches.map(m => `
      <div class="stock-search-result" data-symbol="${m.symbol}">
        <span class="ssr-symbol">${m.symbol}</span>
        <span class="ssr-name">${m.description}</span>
        <span class="ssr-type">${m.type || ''}</span>
      </div>
    `).join('');
    results.classList.remove('hidden');

    results.querySelectorAll('.stock-search-result').forEach(el => {
      el.addEventListener('click', () => {
        results.classList.add('hidden');
        input.value = el.dataset.symbol;
        showStockChart(el.dataset.symbol);
      });
    });
  }, 300));

  document.addEventListener('click', e => {
    if (!e.target.closest('#stock-search-container')) results.classList.add('hidden');
  });
}

// ========== FLIGHTS ==========
let flightsData = [];
let flightsLoaded = false;
let flightRefreshTimer = null;

// Comprehensive airport database
const AIRPORTS = [
  { code:'JFK',name:'New York JFK',lat:40.64,lng:-73.78,country:'US' },
  { code:'LAX',name:'Los Angeles',lat:33.94,lng:-118.41,country:'US' },
  { code:'ORD',name:'Chicago O\'Hare',lat:41.97,lng:-87.91,country:'US' },
  { code:'ATL',name:'Atlanta',lat:33.64,lng:-84.43,country:'US' },
  { code:'DFW',name:'Dallas',lat:32.90,lng:-97.04,country:'US' },
  { code:'DEN',name:'Denver',lat:39.85,lng:-104.67,country:'US' },
  { code:'SFO',name:'San Francisco',lat:37.62,lng:-122.38,country:'US' },
  { code:'SEA',name:'Seattle',lat:47.45,lng:-122.31,country:'US' },
  { code:'MIA',name:'Miami',lat:25.80,lng:-80.29,country:'US' },
  { code:'BOS',name:'Boston',lat:42.36,lng:-71.01,country:'US' },
  { code:'LHR',name:'London Heathrow',lat:51.47,lng:-0.46,country:'GB' },
  { code:'LGW',name:'London Gatwick',lat:51.15,lng:-0.18,country:'GB' },
  { code:'CDG',name:'Paris CDG',lat:49.01,lng:2.55,country:'FR' },
  { code:'FRA',name:'Frankfurt',lat:50.03,lng:8.57,country:'DE' },
  { code:'MUC',name:'Munich',lat:48.35,lng:11.79,country:'DE' },
  { code:'AMS',name:'Amsterdam',lat:52.31,lng:4.77,country:'NL' },
  { code:'MAD',name:'Madrid',lat:40.49,lng:-3.57,country:'ES' },
  { code:'BCN',name:'Barcelona',lat:41.30,lng:2.08,country:'ES' },
  { code:'FCO',name:'Rome',lat:41.80,lng:12.25,country:'IT' },
  { code:'IST',name:'Istanbul',lat:41.26,lng:28.74,country:'TR' },
  { code:'DXB',name:'Dubai',lat:25.25,lng:55.36,country:'AE' },
  { code:'DOH',name:'Doha',lat:25.27,lng:51.61,country:'QA' },
  { code:'SIN',name:'Singapore',lat:1.35,lng:103.99,country:'SG' },
  { code:'HKG',name:'Hong Kong',lat:22.31,lng:113.91,country:'HK' },
  { code:'NRT',name:'Tokyo Narita',lat:35.76,lng:140.39,country:'JP' },
  { code:'HND',name:'Tokyo Haneda',lat:35.55,lng:139.78,country:'JP' },
  { code:'ICN',name:'Seoul Incheon',lat:37.46,lng:126.44,country:'KR' },
  { code:'PEK',name:'Beijing',lat:40.08,lng:116.58,country:'CN' },
  { code:'PVG',name:'Shanghai',lat:31.14,lng:121.81,country:'CN' },
  { code:'BKK',name:'Bangkok',lat:13.69,lng:100.75,country:'TH' },
  { code:'DEL',name:'New Delhi',lat:28.56,lng:77.10,country:'IN' },
  { code:'BOM',name:'Mumbai',lat:19.09,lng:72.87,country:'IN' },
  { code:'SYD',name:'Sydney',lat:-33.95,lng:151.18,country:'AU' },
  { code:'MEL',name:'Melbourne',lat:-37.67,lng:144.84,country:'AU' },
  { code:'YYZ',name:'Toronto',lat:43.68,lng:-79.63,country:'CA' },
  { code:'YVR',name:'Vancouver',lat:49.19,lng:-123.18,country:'CA' },
  { code:'GRU',name:'São Paulo',lat:-23.43,lng:-46.47,country:'BR' },
  { code:'MEX',name:'Mexico City',lat:19.44,lng:-99.07,country:'MX' },
  { code:'JNB',name:'Johannesburg',lat:-26.14,lng:28.25,country:'ZA' },
  { code:'CAI',name:'Cairo',lat:30.12,lng:31.41,country:'EG' },
  { code:'NBO',name:'Nairobi',lat:-1.32,lng:36.93,country:'KE' },
  { code:'ADD',name:'Addis Ababa',lat:8.98,lng:38.80,country:'ET' },
  { code:'LOS',name:'Lagos',lat:6.58,lng:3.32,country:'NG' },
  { code:'CMN',name:'Casablanca',lat:33.37,lng:-7.59,country:'MA' },
  { code:'TLV',name:'Tel Aviv',lat:32.01,lng:34.89,country:'PS' },
  { code:'RUH',name:'Riyadh',lat:24.96,lng:46.70,country:'SA' },
  { code:'KUL',name:'Kuala Lumpur',lat:2.74,lng:101.70,country:'MY' },
  { code:'CGK',name:'Jakarta',lat:-6.13,lng:106.66,country:'ID' },
  { code:'MNL',name:'Manila',lat:14.51,lng:121.02,country:'PH' },
  { code:'SVO',name:'Moscow',lat:55.97,lng:37.41,country:'RU' },
  { code:'WAW',name:'Warsaw',lat:52.17,lng:20.97,country:'PL' },
  { code:'ZRH',name:'Zurich',lat:47.46,lng:8.55,country:'CH' },
  { code:'VIE',name:'Vienna',lat:48.11,lng:16.57,country:'AT' },
  { code:'CPH',name:'Copenhagen',lat:55.62,lng:12.66,country:'DK' },
  { code:'OSL',name:'Oslo',lat:60.19,lng:11.10,country:'NO' },
  { code:'ARN',name:'Stockholm',lat:59.65,lng:17.94,country:'SE' },
  { code:'HEL',name:'Helsinki',lat:60.32,lng:24.95,country:'FI' },
  { code:'DUB',name:'Dublin',lat:53.42,lng:-6.27,country:'IE' },
  { code:'LIS',name:'Lisbon',lat:38.77,lng:-9.13,country:'PT' },
  { code:'ATH',name:'Athens',lat:37.94,lng:23.94,country:'GR' },
  { code:'BEY',name:'Beirut',lat:33.82,lng:35.49,country:'LB' },
  { code:'BGW',name:'Baghdad',lat:33.26,lng:44.23,country:'IQ' },
  { code:'IKA',name:'Tehran',lat:35.42,lng:51.15,country:'IR' },
  { code:'ISB',name:'Islamabad',lat:33.62,lng:73.10,country:'PK' },
  { code:'DAC',name:'Dhaka',lat:23.84,lng:90.40,country:'BD' },
  { code:'HAN',name:'Hanoi',lat:21.22,lng:105.81,country:'VN' },
  { code:'EZE',name:'Buenos Aires',lat:-34.82,lng:-58.54,country:'AR' },
  { code:'SCL',name:'Santiago',lat:-33.39,lng:-70.79,country:'CL' },
  { code:'BOG',name:'Bogota',lat:4.70,lng:-74.15,country:'CO' },
  { code:'AKL',name:'Auckland',lat:-37.01,lng:174.79,country:'NZ' },
];

function findBestAirport(lat, lng, heading, originCountry) {
  let best = null;
  let bestScore = Infinity;

  AIRPORTS.forEach(apt => {
    // Skip airports in same country (plane is likely going somewhere else)
    const dlat = apt.lat - lat;
    const dlng = apt.lng - lng;
    const dist = Math.sqrt(dlat * dlat + dlng * dlng);

    // Bearing from plane to airport
    const bearing = Math.atan2(dlng, dlat) * 180 / Math.PI;
    const normalizedBearing = ((bearing % 360) + 360) % 360;
    const normalizedHeading = ((heading % 360) + 360) % 360;
    const headingDiff = Math.abs(((normalizedBearing - normalizedHeading + 540) % 360) - 180);

    // Must be in roughly the right direction (within 60 degrees) and at least 3 degrees away
    if (headingDiff < 60 && dist > 3 && dist < 180) {
      const score = dist * 0.4 + headingDiff * 1.2;
      if (score < bestScore) {
        bestScore = score;
        best = apt;
      }
    }
  });

  // If no good match found in heading direction, find nearest major airport ahead
  if (!best) {
    AIRPORTS.forEach(apt => {
      const dlat = apt.lat - lat;
      const dlng = apt.lng - lng;
      const dist = Math.sqrt(dlat * dlat + dlng * dlng);
      const bearing = Math.atan2(dlng, dlat) * 180 / Math.PI;
      const normalizedBearing = ((bearing % 360) + 360) % 360;
      const normalizedHeading = ((heading % 360) + 360) % 360;
      const headingDiff = Math.abs(((normalizedBearing - normalizedHeading + 540) % 360) - 180);

      if (headingDiff < 90 && dist > 2) {
        const score = dist * 0.5 + headingDiff * 1.0;
        if (score < bestScore) {
          bestScore = score;
          best = apt;
        }
      }
    });
  }

  return best;
}

function findOriginAirport(lat, lng, heading, originCountry) {
  // Find the airport behind us (reverse heading) that matches origin country
  const reverseHeading = (heading + 180) % 360;
  let best = null;
  let bestDist = Infinity;

  // First try to match origin country
  AIRPORTS.forEach(apt => {
    if (apt.country === originCountry || apt.name.toLowerCase().includes(originCountry.toLowerCase())) {
      const dlat = apt.lat - lat;
      const dlng = apt.lng - lng;
      const dist = Math.sqrt(dlat * dlat + dlng * dlng);
      if (dist < bestDist) {
        bestDist = dist;
        best = apt;
      }
    }
  });

  // If no country match, find nearest behind us
  if (!best) {
    bestDist = Infinity;
    AIRPORTS.forEach(apt => {
      const dlat = apt.lat - lat;
      const dlng = apt.lng - lng;
      const dist = Math.sqrt(dlat * dlat + dlng * dlng);
      const bearing = Math.atan2(dlng, dlat) * 180 / Math.PI;
      const normalizedBearing = ((bearing % 360) + 360) % 360;
      const headingDiff = Math.abs(((normalizedBearing - reverseHeading + 540) % 360) - 180);

      if (headingDiff < 90 && dist > 1 && dist < bestDist) {
        bestDist = dist;
        best = apt;
      }
    });
  }

  return best;
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

let flightDataSource = 'none'; // 'live' or 'simulated'

async function loadFlights() {
  const btn = document.getElementById('load-flights-btn');
  const info = document.getElementById('flight-info');
  const list = document.getElementById('flight-list');
  const overlay = document.getElementById('flight-overlay');

  if (btn) btn.disabled = true;
  info.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;margin:10px auto;"></div><p class="dim-text">Fetching live aircraft data from OpenSky Network...</p>';

  // Try multiple approaches for OpenSky
  let rawData = null;
  const endpoints = [
    'https://opensky-network.org/api/states/all',
    'https://corsproxy.io/?https://opensky-network.org/api/states/all',
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        rawData = await res.json();
        if (rawData && rawData.states && rawData.states.length > 0) {
          flightDataSource = 'live';
          break;
        }
      }
    } catch (e) {
      continue;
    }
  }

  if (!rawData || !rawData.states || rawData.states.length === 0) {
    // Fallback to simulated data but clearly mark it
    rawData = { states: generateSimulatedFlights() };
    flightDataSource = 'simulated';
  }

  const states = (rawData.states || []).slice(0, 600);
  flightsData = states.filter(s => {
    if (Array.isArray(s)) return s[5] != null && s[6] != null;
    return s.lng != null && s.lat != null;
  }).map(s => {
    let callsign, originCountry, lng, lat, altitude, speed, heading, onGround, icao24;
    if (Array.isArray(s)) {
      icao24 = (s[0] || '').trim();
      callsign = (s[1] || '').trim();
      originCountry = s[2] || '??';
      lng = s[5]; lat = s[6];
      altitude = s[7] ? Math.round(s[7] * 3.281) : 0;
      speed = s[9] ? Math.round(s[9] * 1.944) : 0;
      heading = s[10] || 0;
      onGround = s[8];
    } else {
      icao24 = s.icao24 || '';
      callsign = s.callsign;
      originCountry = s.origin;
      lng = s.lng; lat = s.lat;
      altitude = s.altitude;
      speed = s.speed;
      heading = s.heading;
      onGround = false;
    }

    const destApt = findBestAirport(lat, lng, heading, originCountry);
    const originApt = findOriginAirport(lat, lng, heading, originCountry);

    return {
      icao24, callsign, origin: originCountry, lng, lat, altitude, speed, heading, onGround,
      destAirport: destApt ? destApt.code : '—',
      destName: destApt ? destApt.name : '—',
      destLat: destApt ? destApt.lat : null,
      destLng: destApt ? destApt.lng : null,
      originAirport: originApt ? originApt.code : '—',
      originName: originApt ? originApt.name : '—',
      originLat: originApt ? originApt.lat : null,
      originLng: originApt ? originApt.lng : null,
      distToDestKm: destApt ? Math.round(haversineDistance(lat, lng, destApt.lat, destApt.lng)) : null,
    };
  }).filter(f => !f.onGround && f.callsign);

  flightsLoaded = true;
  renderFlightsOnGlobe(flightsData);

  overlay.classList.remove('hidden');
  document.getElementById('flight-count').textContent = flightsData.length;

  const sourceLabel = flightDataSource === 'live'
    ? `<div style="font-size:9px;color:var(--green);margin-bottom:4px;">● LIVE DATA — ${flightsData.length} AIRCRAFT</div>`
    : `<div style="font-size:9px;color:var(--amber);margin-bottom:4px;">⚠ SIMULATED DATA (OpenSky unavailable) — ${flightsData.length} AIRCRAFT</div>`;

  info.innerHTML = sourceLabel +
    `<button class="action-btn" id="refresh-flights-btn" style="margin:0 0 8px 0;padding:4px 12px;font-size:9px;">REFRESH</button>` +
    `<div id="flight-route-search" style="margin-top:8px;">
      <div class="section-label" style="margin-bottom:6px;">SEARCH ROUTES</div>
      <div style="display:flex;gap:4px;margin-bottom:6px;">
        <input id="flight-from-input" type="text" placeholder="FROM (e.g. Canada, JFK)" style="flex:1;height:26px;padding:0 8px;font-family:var(--font);font-size:10px;color:var(--green);background:rgba(0,240,255,0.03);border:1px solid var(--border);border-radius:var(--radius);outline:none;">
        <span style="color:var(--amber);font-size:12px;line-height:26px;">→</span>
        <input id="flight-to-input" type="text" placeholder="TO (e.g. Germany, FRA)" style="flex:1;height:26px;padding:0 8px;font-family:var(--font);font-size:10px;color:var(--green);background:rgba(0,240,255,0.03);border:1px solid var(--border);border-radius:var(--radius);outline:none;">
      </div>
      <button id="flight-search-btn" class="action-btn" style="margin:0 0 4px 0;padding:4px 12px;font-size:9px;width:100%;">SEARCH ROUTES</button>
      <button id="flight-clear-search-btn" class="action-btn" style="margin:0;padding:3px 10px;font-size:8px;width:100%;opacity:0.6;display:none;">CLEAR SEARCH</button>
    </div>`;

  document.getElementById('refresh-flights-btn').addEventListener('click', loadFlights);

  // Route search
  document.getElementById('flight-search-btn').addEventListener('click', () => {
    const fromQ = document.getElementById('flight-from-input').value.trim().toLowerCase();
    const toQ = document.getElementById('flight-to-input').value.trim().toLowerCase();
    filterFlightsByRoute(fromQ, toQ);
  });
  ['flight-from-input', 'flight-to-input'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const fromQ = document.getElementById('flight-from-input').value.trim().toLowerCase();
        const toQ = document.getElementById('flight-to-input').value.trim().toLowerCase();
        filterFlightsByRoute(fromQ, toQ);
      }
    });
  });

  renderFlightList(flightsData);

  clearInterval(flightRefreshTimer);
  flightRefreshTimer = setInterval(loadFlights, 45000);
}

function filterFlightsByRoute(fromQ, toQ) {
  if (!fromQ && !toQ) { renderFlightList(flightsData); return; }

  const matches = flightsData.filter(f => {
    const matchFrom = !fromQ || matchesFlight(f, fromQ, 'origin');
    const matchTo = !toQ || matchesFlight(f, toQ, 'dest');
    return matchFrom && matchTo;
  });

  const clearBtn = document.getElementById('flight-clear-search-btn');
  if (clearBtn) {
    clearBtn.style.display = 'block';
    clearBtn.onclick = () => {
      document.getElementById('flight-from-input').value = '';
      document.getElementById('flight-to-input').value = '';
      clearBtn.style.display = 'none';
      renderFlightList(flightsData);
      renderFlightsOnGlobe(flightsData);
    };
  }

  if (matches.length === 0) {
    document.getElementById('flight-list').innerHTML = '<div class="dim-text" style="padding:12px;">No flights found for this route.</div>';
    return;
  }

  renderFlightList(matches);
  renderFlightsOnGlobe(matches);

  // Show all matching routes on globe
  if (matches.length <= 20) {
    const arcs = matches.filter(f => f.destLat != null).map(f => ({
      startLat: f.lat, startLng: f.lng,
      endLat: f.destLat, endLng: f.destLng,
      color: ['rgba(255,149,0,0.7)', 'rgba(255,59,59,0.7)'],
      stroke: 0.4, dashLen: 0.3, dashGap: 0.15, animTime: 2000,
    }));
    if (arcs.length > 0 && globe) {
      globe.arcsData(arcs)
        .arcStartLat(d => d.startLat).arcStartLng(d => d.startLng)
        .arcEndLat(d => d.endLat).arcEndLng(d => d.endLng)
        .arcColor(d => d.color).arcDashLength(d => d.dashLen)
        .arcDashGap(d => d.dashGap).arcDashAnimateTime(d => d.animTime)
        .arcStroke(d => d.stroke).arcsTransitionDuration(200);
    }
  }
}

function matchesFlight(flight, query, direction) {
  const q = query.toLowerCase();
  if (direction === 'origin') {
    return (flight.origin || '').toLowerCase().includes(q)
      || (flight.originAirport || '').toLowerCase().includes(q)
      || (flight.originName || '').toLowerCase().includes(q)
      || matchesAirportCountry(flight.originAirport, q);
  } else {
    return (flight.destAirport || '').toLowerCase().includes(q)
      || (flight.destName || '').toLowerCase().includes(q)
      || matchesAirportCountry(flight.destAirport, q);
  }
}

function matchesAirportCountry(aptCode, query) {
  if (!aptCode || aptCode === '—') return false;
  const apt = AIRPORTS.find(a => a.code === aptCode);
  if (!apt) return false;
  return apt.country.toLowerCase().includes(query)
    || apt.name.toLowerCase().includes(query)
    || matchCountryName(apt.country, query);
}

function matchCountryName(isoCode, query) {
  const names = {
    'US':'united states,usa,america', 'GB':'united kingdom,uk,britain,england',
    'CA':'canada', 'DE':'germany,deutschland', 'FR':'france', 'JP':'japan',
    'CN':'china', 'IN':'india', 'AU':'australia', 'BR':'brazil',
    'AE':'uae,emirates,dubai', 'QA':'qatar,doha', 'SG':'singapore',
    'TR':'turkey,turkiye', 'PS':'palestine,palestinian', 'SA':'saudi arabia',
    'KR':'south korea,korea', 'RU':'russia', 'IT':'italy',
    'ES':'spain', 'NL':'netherlands,holland', 'CH':'switzerland',
    'MX':'mexico', 'AR':'argentina', 'TH':'thailand',
    'MY':'malaysia', 'ID':'indonesia', 'PH':'philippines',
    'EG':'egypt', 'ZA':'south africa', 'NG':'nigeria',
    'KE':'kenya', 'ET':'ethiopia', 'PK':'pakistan',
    'LB':'lebanon', 'IQ':'iraq', 'IR':'iran',
    'PL':'poland', 'SE':'sweden', 'NO':'norway',
    'DK':'denmark', 'FI':'finland', 'IE':'ireland',
    'PT':'portugal', 'GR':'greece', 'AT':'austria',
    'CL':'chile', 'CO':'colombia', 'NZ':'new zealand',
  };
  const alts = names[isoCode] || '';
  return alts.split(',').some(n => n.includes(query));
}

function renderFlightList(flights) {
  const list = document.getElementById('flight-list');
  list.innerHTML = flights.slice(0, 80).map(f => `
    <div class="flight-row clickable" data-callsign="${f.callsign}">
      <span class="flight-callsign">${f.callsign}</span>
      <span class="flight-origin">${f.originAirport}</span>
      <span class="flight-arrow">→</span>
      <span class="flight-dest">${f.destAirport}</span>
      <span class="flight-alt">${f.altitude.toLocaleString()}ft</span>
      <span class="flight-speed">${f.speed}kts</span>
    </div>
  `).join('');

  list.querySelectorAll('.flight-row').forEach(row => {
    row.addEventListener('click', () => {
      const cs = row.dataset.callsign;
      const flight = flightsData.find(f => f.callsign === cs);
      if (flight && typeof onFlightSelect === 'function') onFlightSelect(flight);
    });
  });
}

// Generate realistic simulated flights along major air corridors
function generateSimulatedFlights() {
  const corridors = [
    // Transatlantic
    { from: 'US', route: [[40,-74],[45,-40],[50,-10],[51,-0.5]], callsigns: ['UAL123','DAL456','AAL789','BAW112'] },
    { from: 'US', route: [[33,-118],[35,-140],[38,-160],[35,139]], callsigns: ['UAL901','JAL002','ANA007'] },
    // Europe internal
    { from: 'Germany', route: [[50,8],[49,5],[48.9,2.3]], callsigns: ['DLH441','AFR220'] },
    { from: 'United Kingdom', route: [[51,-0.5],[52,4.5],[52.5,13]], callsigns: ['BAW335','EZY421'] },
    // Middle East
    { from: 'UAE', route: [[25,55],[28,50],[35,35],[41,29]], callsigns: ['UAE231','QTR556'] },
    { from: 'UAE', route: [[25,55],[22,60],[18,73],[28,77]], callsigns: ['UAE742','ETD501'] },
    // Asia
    { from: 'China', route: [[31,121],[30,125],[33,130],[35,139]], callsigns: ['CCA801','CSN502'] },
    { from: 'Singapore', route: [[1,104],[5,105],[10,106],[14,121]], callsigns: ['SIA321','CPA810'] },
    { from: 'Japan', route: [[35,140],[37,145],[40,160],[42,-170]], callsigns: ['JAL061','ANA003'] },
    // Americas
    { from: 'Brazil', route: [[-23,-46],[-10,-35],[5,-20],[15,-10]], callsigns: ['TAM800','GLO123'] },
    { from: 'Mexico', route: [[19,-99],[25,-95],[30,-90],[33,-84]], callsigns: ['AMX404','VOI567'] },
    // Africa
    { from: 'South Africa', route: [[-26,28],[-15,30],[-1,37],[9,38]], callsigns: ['SAA201','ETH700'] },
    { from: 'Kenya', route: [[-1,37],[10,40],[20,45],[25,55]], callsigns: ['KQA401','ETH503'] },
    // Oceania
    { from: 'Australia', route: [[-34,151],[-25,140],[-10,120],[1,104]], callsigns: ['QFA001','QFA009'] },
    // India routes
    { from: 'India', route: [[28,77],[25,60],[23,55],[25,55]], callsigns: ['AIC301','IGO505'] },
    { from: 'India', route: [[19,73],[15,80],[10,100],[1,104]], callsigns: ['AIC201','SEJ301'] },
    // Russia
    { from: 'Russia', route: [[55,37],[55,50],[55,70],[55,90]], callsigns: ['AFL101','AFL203'] },
    // South America to US
    { from: 'Colombia', route: [[4,-74],[10,-78],[20,-85],[25,-80]], callsigns: ['AVA100','CMP201'] },
  ];

  const flights = [];
  corridors.forEach(corridor => {
    corridor.callsigns.forEach((cs, i) => {
      // Place plane at a random point along the route
      const progress = Math.random();
      const routeLen = corridor.route.length - 1;
      const segIdx = Math.min(Math.floor(progress * routeLen), routeLen - 1);
      const segProgress = (progress * routeLen) - segIdx;
      const p1 = corridor.route[segIdx];
      const p2 = corridor.route[segIdx + 1];

      const lat = p1[0] + (p2[0] - p1[0]) * segProgress + (Math.random() - 0.5) * 3;
      const lng = p1[1] + (p2[1] - p1[1]) * segProgress + (Math.random() - 0.5) * 3;
      const heading = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180 / Math.PI;
      const normalizedHeading = ((heading % 360) + 360) % 360;

      // Generate a fake but realistic ICAO hex for simulated flights
      const fakeHex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
      flights.push({
        icao24: fakeHex,
        callsign: cs,
        origin: corridor.from,
        lat, lng,
        altitude: 28000 + Math.floor(Math.random() * 13000),
        speed: 400 + Math.floor(Math.random() * 150),
        heading: normalizedHeading,
      });
    });
  });

  return flights;
}

// ========== ALERTS ==========
function renderAlertsPanel() {
  const content = document.getElementById('alerts-content');
  const alerts = [];

  // Gather from live news cache
  Object.entries(newsCache || {}).forEach(([cc, cached]) => {
    const articles = cached.articles || cached;
    if (Array.isArray(articles)) {
      articles.forEach(a => {
        if (a.isBreaking) alerts.push({ ...a, countryCode: cc });
      });
    }
  });

  // Add from mock data (conflict-focused)
  Object.entries(MOCK_NEWS || {}).forEach(([cc, articles]) => {
    articles.forEach(a => {
      if ((a.isBreaking || a.isAlert) && !alerts.find(al => al.title === a.title)) {
        alerts.push({ ...a, countryCode: cc });
      }
    });
  });

  // Add from GLOBAL_ALERTS
  if (typeof GLOBAL_ALERTS !== 'undefined') {
    GLOBAL_ALERTS.forEach(a => {
      if (!alerts.find(al => al.title === a.title)) alerts.push(a);
    });
  }

  // Add from SEA_ZONES
  if (typeof SEA_ZONES !== 'undefined') {
    SEA_ZONES.forEach(z => {
      z.intel.forEach(item => {
        if (!alerts.find(al => al.title === item.title)) {
          alerts.push({
            title: item.title,
            source: item.source,
            countryCode: '⚓',
            description: `${z.name} — ${z.subtitle}`,
            publishedAt: new Date().toISOString(),
            severity: item.severity,
            category: 'politics',
          });
        }
      });
    });
  }

  if (alerts.length === 0) {
    content.innerHTML = `<div class="dim-text" style="padding:20px;"><p>No active alerts at this time.</p></div>`;
    return;
  }

  alerts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  content.innerHTML = alerts.map(a => {
    const severityClass = a.severity === 'critical' ? 'critical' : (a.severity === 'high' ? 'high' : '');
    return `
    <div class="alert-item ${severityClass}" ${a.url && a.url !== '#' ? `onclick="window.open('${a.url}','_blank')" style="cursor:pointer;"` : ''}>
      <div class="alert-badge">${getCountryFlag(a.countryCode)} ${a.countryCode || ''} ${a.severity === 'critical' ? '🔴 CRITICAL' : a.severity === 'high' ? '🟠 HIGH' : ''}</div>
      <div class="alert-title">⚠ ${a.title}</div>
      <div class="alert-desc">${a.description || ''}</div>
      <div class="alert-time">${a.source || ''} — ${timeAgo(a.publishedAt)}</div>
    </div>`;
  }).join('');
}

// ========== PANEL MANAGEMENT ==========
function initPanels() {
  document.querySelectorAll('.sidebar-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const panelId = 'panel-' + tab.dataset.panel;
      const panel = document.getElementById(panelId);
      if (!panel) return;

      if (panel.classList.contains('open')) {
        panel.classList.remove('open');
        tab.classList.remove('active');
        // When closing flights panel, restore news markers
        if (tab.dataset.panel === 'flights' && typeof restoreNewsMarkers === 'function') {
          restoreNewsMarkers();
        }
      } else {
        panel.classList.add('open');
        panel.classList.remove('minimized');
        tab.classList.add('active');
        initPanelContent(tab.dataset.panel);
      }
    });
  });

  document.querySelectorAll('.panel-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.closest('.floating-panel');
      panel.classList.remove('open');
      const panelName = panel.dataset.panel;
      if (panelName) {
        const tab = document.querySelector(`.sidebar-tab[data-panel="${panelName}"]`);
        if (tab) tab.classList.remove('active');
      }
      if (panel.id === 'panel-tv') document.getElementById('tv-iframe').src = '';
      if (panel.id === 'panel-flights' && typeof restoreNewsMarkers === 'function') {
        restoreNewsMarkers();
        clearInterval(flightRefreshTimer);
        document.getElementById('flight-overlay').classList.add('hidden');
        const fdOverlay = document.getElementById('flight-detail-overlay');
        if (fdOverlay) fdOverlay.classList.add('hidden');
        clearFlightRoute();
      }
    });
  });

  document.querySelectorAll('.panel-minimize').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.floating-panel').classList.toggle('minimized');
    });
  });

  document.querySelectorAll('.panel-titlebar').forEach(titlebar => makeDraggable(titlebar));
  initPanelContent('wire');
}

const panelInitialized = {};

function initPanelContent(name) {
  if (panelInitialized[name]) return;
  panelInitialized[name] = true;
  switch (name) {
    case 'tv': renderTVPanel(); break;
    case 'cameras': renderCamerasPanel(); break;
    case 'stocks': renderStocksPanel(); initStockSearch(); break;
    case 'flights': document.getElementById('load-flights-btn').addEventListener('click', loadFlights); break;
    case 'breaking': renderAlertsPanel(); break;
  }
}

// ========== DRAGGABLE PANELS ==========
function makeDraggable(titlebar) {
  const panel = titlebar.closest('.floating-panel');
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.closest('.panel-controls')) return;
    isDragging = true;
    const rect = panel.getBoundingClientRect();
    startX = e.clientX; startY = e.clientY;
    startLeft = rect.left; startTop = rect.top;
    panel.style.position = 'fixed';
    panel.style.zIndex = ++panelZIndex;
    titlebar.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panel.style.left = (startLeft + e.clientX - startX) + 'px';
    panel.style.top = (startTop + e.clientY - startY) + 'px';
    panel.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => { isDragging = false; titlebar.style.cursor = 'grab'; });
}

let panelZIndex = 60;
document.addEventListener('mousedown', (e) => {
  const panel = e.target.closest('.floating-panel');
  if (panel) panel.style.zIndex = ++panelZIndex;
});
