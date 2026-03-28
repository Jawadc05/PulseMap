/* ============================================
   WORLD NEWS MAP — UTILITIES
   Helper functions used across modules
   ============================================ */

function formatNumber(num) {
  if (num == null) return 'N/A';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toLocaleString();
}

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getCountryFlag(isoA2) {
  if (!isoA2 || isoA2.length !== 2) return '🌍';
  return String.fromCodePoint(
    ...Array.from(isoA2.toUpperCase()).map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  );
}

function getCountryCenter(feature) {
  if (!feature || !feature.geometry) return { lat: 0, lng: 0 };

  // Check if we have extra data with pre-defined coordinates
  const iso = feature.properties.ISO_A2;
  if (COUNTRY_EXTRA_DATA[iso]) {
    return { lat: COUNTRY_EXTRA_DATA[iso].lat, lng: COUNTRY_EXTRA_DATA[iso].lng };
  }

  // Fallback: calculate centroid from coordinates
  let totalLat = 0, totalLng = 0, count = 0;
  const coords = feature.geometry.type === 'MultiPolygon'
    ? feature.geometry.coordinates.flat(2)
    : feature.geometry.coordinates.flat(1);

  coords.forEach(([lng, lat]) => {
    totalLng += lng;
    totalLat += lat;
    count++;
  });

  return count > 0
    ? { lat: totalLat / count, lng: totalLng / count }
    : { lat: 0, lng: 0 };
}

function animateCounter(element, target, duration = 1500) {
  const start = performance.now();
  const startVal = 0;

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutExpo
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = Math.round(startVal + (target - startVal) * eased);
    element.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function getArticleUrl(article) {
  if (!article.url || article.url === '#') return null;
  if (article.url === 'SEARCH') {
    return 'https://news.google.com/search?q=' + encodeURIComponent(article.title);
  }
  return article.url;
}

function createNewsCard(article) {
  const imgHtml = article.imageUrl
    ? `<img class="news-thumb" src="${article.imageUrl}" alt="" loading="lazy" onerror="this.style.display='none'">`
    : '';
  const url = getArticleUrl(article);
  const titleHtml = url
    ? `<a href="${url}" class="news-title-link" target="_blank" rel="noopener"><h4 class="news-title">${article.title}</h4></a>`
    : `<h4 class="news-title">${article.title}</h4>`;
  return `
    <div class="news-card" data-category="${article.category}">
      ${imgHtml}
      <div class="news-card-badges">
        <span class="category-badge ${article.category}">${article.category}</span>
        ${article.isBreaking ? '<span class="breaking-badge">BREAKING</span>' : ''}
      </div>
      ${titleHtml}
      <p class="news-desc">${article.description}</p>
      <div class="news-meta">
        <span class="news-source">${article.source}</span>
        <span class="news-time">${timeAgo(article.publishedAt)}</span>
      </div>
      ${url ? `<a href="${url}" class="read-more" target="_blank" rel="noopener">Read full article &rarr;</a>` : ''}
    </div>
  `;
}

function createTrendingItem(topic, index) {
  const color = CATEGORY_COLORS[topic.category] || '#00f0ff';
  return `
    <div class="trending-item">
      <span class="trending-rank">${index + 1}</span>
      <div class="trending-info">
        <div class="trending-topic" style="color: ${color}">${topic.topic}</div>
        <div class="trending-meta">${formatNumber(topic.articleCount)} articles</div>
      </div>
      <span class="trending-arrow ${topic.trend}">${topic.trend === 'up' ? '↑' : '↓'}</span>
    </div>
  `;
}

function createTopStoryItem(story) {
  return `
    <div class="top-story" data-country="${story.countryCode}">
      <div class="top-story-title">${story.title}</div>
      <div class="top-story-meta">
        <span class="top-story-source">${story.source}</span>
        <span>${getCountryFlag(story.countryCode)} ${story.country}</span>
        <span>${story.timeAgo}</span>
      </div>
    </div>
  `;
}

function createLiveFeedItem(event) {
  return `
    <div class="feed-item">
      <span class="feed-dot ${event.type}"></span>
      <div>
        <div class="feed-text">${getCountryFlag(event.country)} ${event.text}</div>
        <div class="feed-time">${event.time}</div>
      </div>
    </div>
  `;
}

function filterNewsByCategory(news, category) {
  if (!news) return [];
  if (category === 'all') return news;
  return news.filter(article => article.category === category);
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function searchCountries(query, countriesList) {
  if (!query || !countriesList) return [];
  const q = query.toLowerCase().trim();
  if (q.length === 0) return [];

  const matches = countriesList
    .filter(f => f.properties.NAME && f.properties.NAME.toLowerCase().includes(q))
    .sort((a, b) => {
      const aName = a.properties.NAME.toLowerCase();
      const bName = b.properties.NAME.toLowerCase();
      const aStarts = aName.startsWith(q);
      const bStarts = bName.startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return aName.localeCompare(bName);
    });

  return matches.slice(0, 8);
}
