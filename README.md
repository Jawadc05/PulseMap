# PulseMap — Global Intelligence Dashboard

A real-time 3D intelligence dashboard built on an interactive WebGL globe. Track breaking news across 190+ countries, monitor live flights, watch global webcams, and follow maritime conflict zones — all in one interface.

## Features

- **3D Interactive Globe** — WebGL-powered globe with country selection, zoom-adaptive city labels, and population-based rendering
- **Live News Engine** — 6-API fallback chain (GNews, NewsData.io, Currents, TheNewsAPI, MediaStack, NewsAPI.org) delivering real-time articles for every country on Earth
- **Flight Tracker** — Live aircraft positions via OpenSky Network with detailed aircraft data (operator, type, registration, photos) from hexdb.io and Planespotters.net
- **Maritime Intelligence** — 8 monitored sea zones (Red Sea, South China Sea, Taiwan Strait, etc.) with crisis tracking and threat assessments
- **Live Webcams** — 18 global camera feeds powered by Windy Webcams API with 70,000+ available streams
- **News TV Stations** — 18 embedded live news channels (Al Jazeera, Sky News, France 24, Bloomberg, and more)
- **Market Ticker** — Real-time stock data via Finnhub API
- **Conflict Alerts** — Live feed of global security events with severity classification

## Tech Stack

- **Globe.gl** — 3D globe rendering (polygons, points, arcs, rings, HTML overlays)
- **Three.js / WebGL** — Underlying 3D engine
- **Vanilla JavaScript** — No frameworks, no build step
- **6 News APIs** — Multi-API fallback chain with independent failure handling and 60-second cache
- **OpenSky Network API** — Real-time ADS-B flight data
- **Windy Webcams API** — Dynamic webcam discovery by geolocation
- **Finnhub API** — Live market data

## Screenshots

<img width="1512" height="866" alt="image" src="https://github.com/user-attachments/assets/4cc74761-25d3-4390-a3d9-66fe4ed98de7" />

<img width="496" height="459" alt="Screenshot 2026-03-28 at 12 59 48 AM" src="https://github.com/user-attachments/assets/66224112-3799-457e-930f-3f2b764a26db" />

<img width="1512" height="846" alt="Screenshot 2026-03-28 at 1 01 41 AM" src="https://github.com/user-attachments/assets/c27e3d5b-7ed0-455f-9d9f-a5e431e4b79d" />

## Setup

1. Clone the repo
2. Open `index.html` in a browser (or use Live Server in VS Code)
3. API keys are pre-configured for demo use

## API Keys Used

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| GNews | News headlines by country | 100 req/day |
| NewsData.io | Keyword news search | 200 req/day |
| Currents API | Global news fallback | 600 req/day |
| TheNewsAPI | International coverage | 150 req/day |
| MediaStack | 7,500+ sources | 500 req/month |
| NewsAPI.org | 80,000+ sources | 100 req/day |
| OpenSky Network | Live flight positions | Free |
| Windy Webcams | Global webcam feeds | Free |
| Finnhub | Stock market data | Free |
| hexdb.io | Aircraft identification | Free |
| Planespotters.net | Aircraft photos | Free |

## License

MIT
