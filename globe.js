/* ============================================
   PULSEMAP — GLOBE
   3D Globe initialization and interactions
   ============================================ */

let globe;
let countriesGeoJson = [];
let selectedPolygon = null;
let autoRotateTimer = null;
let autoRotateRAF = null;
let isUserInteracting = false;
let hoveredPolygon = null;
let currentHotspots = [];
let flightsActive = false;
let currentFlightsOnGlobe = [];
let cityLabelsVisible = false;
let currentCityLabels = [];
let selectedFlightCallsign = null;

// ========== CITY DATABASE ==========
const WORLD_CITIES = [
  // Lebanon
  { name:'Beirut',lat:33.89,lng:35.50,country:'LB',pop:2e6 },
  { name:'Baalbek',lat:34.01,lng:36.21,country:'LB',pop:82000 },
  { name:'Tripoli',lat:34.43,lng:35.84,country:'LB',pop:500000 },
  { name:'Sidon',lat:33.56,lng:35.38,country:'LB',pop:200000 },
  { name:'Tyre',lat:33.27,lng:35.20,country:'LB',pop:175000 },
  { name:'Jounieh',lat:33.98,lng:35.62,country:'LB',pop:100000 },
  { name:'Zahle',lat:33.85,lng:35.90,country:'LB',pop:150000 },
  // Syria
  { name:'Damascus',lat:33.51,lng:36.29,country:'SY',pop:2.5e6 },
  { name:'Aleppo',lat:36.20,lng:37.15,country:'SY',pop:2.1e6 },
  { name:'Homs',lat:34.73,lng:36.72,country:'SY',pop:800000 },
  { name:'Latakia',lat:35.54,lng:35.78,country:'SY',pop:400000 },
  { name:'Hama',lat:35.13,lng:36.75,country:'SY',pop:600000 },
  { name:'Deir ez-Zor',lat:35.33,lng:40.14,country:'SY',pop:300000 },
  { name:'Raqqa',lat:35.95,lng:39.01,country:'SY',pop:200000 },
  { name:'Idlib',lat:35.93,lng:36.63,country:'SY',pop:165000 },
  // Palestine
  { name:'Gaza City',lat:31.50,lng:34.47,country:'PS',pop:600000 },
  { name:'Ramallah',lat:31.90,lng:35.20,country:'PS',pop:38000 },
  { name:'Hebron',lat:31.53,lng:35.10,country:'PS',pop:215000 },
  { name:'Nablus',lat:32.22,lng:35.26,country:'PS',pop:150000 },
  { name:'Khan Yunis',lat:31.35,lng:34.31,country:'PS',pop:200000 },
  { name:'Rafah',lat:31.28,lng:34.25,country:'PS',pop:150000 },
  { name:'Jerusalem',lat:31.77,lng:35.23,country:'PS',pop:950000 },
  { name:'Tel Aviv',lat:32.08,lng:34.78,country:'PS',pop:460000 },
  { name:'Haifa',lat:32.82,lng:34.99,country:'PS',pop:285000 },
  { name:'Beer Sheva',lat:31.25,lng:34.79,country:'PS',pop:210000 },
  { name:'Nazareth',lat:32.70,lng:35.30,country:'PS',pop:77000 },
  { name:'Acre',lat:32.93,lng:35.08,country:'PS',pop:48000 },
  { name:'Jenin',lat:32.46,lng:35.30,country:'PS',pop:40000 },
  { name:'Tulkarm',lat:32.31,lng:35.03,country:'PS',pop:60000 },
  { name:'Bethlehem',lat:31.71,lng:35.21,country:'PS',pop:30000 },
  // Iraq
  { name:'Baghdad',lat:33.31,lng:44.37,country:'IQ',pop:7.5e6 },
  { name:'Basra',lat:30.51,lng:47.81,country:'IQ',pop:2.6e6 },
  { name:'Mosul',lat:36.34,lng:43.13,country:'IQ',pop:1.8e6 },
  { name:'Erbil',lat:36.19,lng:44.01,country:'IQ',pop:1.5e6 },
  { name:'Kirkuk',lat:35.47,lng:44.39,country:'IQ',pop:900000 },
  { name:'Sulaymaniyah',lat:35.56,lng:45.44,country:'IQ',pop:800000 },
  // Iran
  { name:'Tehran',lat:35.69,lng:51.39,country:'IR',pop:9e6 },
  { name:'Isfahan',lat:32.65,lng:51.68,country:'IR',pop:2e6 },
  { name:'Mashhad',lat:36.30,lng:59.60,country:'IR',pop:3.3e6 },
  { name:'Tabriz',lat:38.08,lng:46.29,country:'IR',pop:1.7e6 },
  { name:'Shiraz',lat:29.59,lng:52.58,country:'IR',pop:1.9e6 },
  { name:'Ahvaz',lat:31.32,lng:48.69,country:'IR',pop:1.3e6 },
  // Yemen
  { name:"Sana'a",lat:15.37,lng:44.19,country:'YE',pop:3.9e6 },
  { name:'Aden',lat:12.80,lng:45.03,country:'YE',pop:800000 },
  { name:'Taiz',lat:13.58,lng:44.02,country:'YE',pop:600000 },
  { name:'Hodeidah',lat:14.80,lng:42.95,country:'YE',pop:400000 },
  // Sudan
  { name:'Khartoum',lat:15.50,lng:32.56,country:'SD',pop:5.2e6 },
  { name:'Omdurman',lat:15.64,lng:32.48,country:'SD',pop:2.8e6 },
  { name:'Port Sudan',lat:19.62,lng:37.22,country:'SD',pop:490000 },
  { name:'El Fasher',lat:13.63,lng:25.35,country:'SD',pop:260000 },
  { name:'Nyala',lat:12.05,lng:24.88,country:'SD',pop:560000 },
  // Myanmar
  { name:'Naypyidaw',lat:19.76,lng:96.13,country:'MM',pop:1.2e6 },
  { name:'Yangon',lat:16.87,lng:96.20,country:'MM',pop:5.5e6 },
  { name:'Mandalay',lat:21.97,lng:96.08,country:'MM',pop:1.6e6 },
  // Ukraine
  { name:'Kyiv',lat:50.45,lng:30.52,country:'UA',pop:3e6 },
  { name:'Kharkiv',lat:49.99,lng:36.23,country:'UA',pop:1.4e6 },
  { name:'Odesa',lat:46.48,lng:30.73,country:'UA',pop:1e6 },
  { name:'Dnipro',lat:48.46,lng:35.05,country:'UA',pop:980000 },
  { name:'Lviv',lat:49.84,lng:24.03,country:'UA',pop:720000 },
  { name:'Zaporizhzhia',lat:47.84,lng:35.14,country:'UA',pop:700000 },
  { name:'Mariupol',lat:47.10,lng:37.55,country:'UA',pop:430000 },
  { name:'Donetsk',lat:48.00,lng:37.80,country:'UA',pop:900000 },
  // Russia
  { name:'Moscow',lat:55.76,lng:37.62,country:'RU',pop:12.6e6 },
  { name:'Saint Petersburg',lat:59.93,lng:30.32,country:'RU',pop:5.4e6 },
  { name:'Novosibirsk',lat:55.04,lng:82.93,country:'RU',pop:1.6e6 },
  { name:'Yekaterinburg',lat:56.84,lng:60.60,country:'RU',pop:1.5e6 },
  { name:'Vladivostok',lat:43.12,lng:131.87,country:'RU',pop:600000 },
  // USA
  { name:'New York',lat:40.71,lng:-74.01,country:'US',pop:8.3e6 },
  { name:'Los Angeles',lat:34.05,lng:-118.24,country:'US',pop:3.9e6 },
  { name:'Chicago',lat:41.88,lng:-87.63,country:'US',pop:2.7e6 },
  { name:'Houston',lat:29.76,lng:-95.37,country:'US',pop:2.3e6 },
  { name:'Phoenix',lat:33.45,lng:-112.07,country:'US',pop:1.6e6 },
  { name:'Philadelphia',lat:39.95,lng:-75.17,country:'US',pop:1.6e6 },
  { name:'San Francisco',lat:37.77,lng:-122.42,country:'US',pop:870000 },
  { name:'Washington DC',lat:38.91,lng:-77.04,country:'US',pop:690000 },
  { name:'Miami',lat:25.76,lng:-80.19,country:'US',pop:450000 },
  { name:'Dallas',lat:32.78,lng:-96.80,country:'US',pop:1.3e6 },
  { name:'Atlanta',lat:33.75,lng:-84.39,country:'US',pop:500000 },
  { name:'Seattle',lat:47.61,lng:-122.33,country:'US',pop:740000 },
  { name:'Denver',lat:39.74,lng:-104.99,country:'US',pop:715000 },
  { name:'Boston',lat:42.36,lng:-71.06,country:'US',pop:675000 },
  // UK
  { name:'London',lat:51.51,lng:-0.13,country:'GB',pop:9e6 },
  { name:'Birmingham',lat:52.48,lng:-1.90,country:'GB',pop:1.1e6 },
  { name:'Manchester',lat:53.48,lng:-2.24,country:'GB',pop:550000 },
  { name:'Glasgow',lat:55.86,lng:-4.25,country:'GB',pop:630000 },
  { name:'Edinburgh',lat:55.95,lng:-3.19,country:'GB',pop:520000 },
  { name:'Liverpool',lat:53.41,lng:-2.98,country:'GB',pop:490000 },
  // France
  { name:'Paris',lat:48.86,lng:2.35,country:'FR',pop:2.2e6 },
  { name:'Marseille',lat:43.30,lng:5.37,country:'FR',pop:870000 },
  { name:'Lyon',lat:45.76,lng:4.84,country:'FR',pop:520000 },
  { name:'Toulouse',lat:43.60,lng:1.44,country:'FR',pop:480000 },
  { name:'Nice',lat:43.71,lng:7.26,country:'FR',pop:340000 },
  // Germany
  { name:'Berlin',lat:52.52,lng:13.41,country:'DE',pop:3.6e6 },
  { name:'Hamburg',lat:53.55,lng:9.99,country:'DE',pop:1.9e6 },
  { name:'Munich',lat:48.14,lng:11.58,country:'DE',pop:1.5e6 },
  { name:'Frankfurt',lat:50.11,lng:8.68,country:'DE',pop:750000 },
  { name:'Cologne',lat:50.94,lng:6.96,country:'DE',pop:1.1e6 },
  // Japan
  { name:'Tokyo',lat:35.68,lng:139.69,country:'JP',pop:14e6 },
  { name:'Osaka',lat:34.69,lng:135.50,country:'JP',pop:2.7e6 },
  { name:'Yokohama',lat:35.44,lng:139.64,country:'JP',pop:3.7e6 },
  { name:'Nagoya',lat:35.18,lng:136.91,country:'JP',pop:2.3e6 },
  { name:'Kyoto',lat:35.01,lng:135.77,country:'JP',pop:1.5e6 },
  { name:'Hiroshima',lat:34.40,lng:132.46,country:'JP',pop:1.2e6 },
  // China
  { name:'Beijing',lat:39.90,lng:116.40,country:'CN',pop:21.5e6 },
  { name:'Shanghai',lat:31.23,lng:121.47,country:'CN',pop:24.9e6 },
  { name:'Guangzhou',lat:23.13,lng:113.26,country:'CN',pop:15e6 },
  { name:'Shenzhen',lat:22.54,lng:114.06,country:'CN',pop:12.6e6 },
  { name:'Chengdu',lat:30.57,lng:104.07,country:'CN',pop:16e6 },
  { name:'Hong Kong',lat:22.32,lng:114.17,country:'HK',pop:7.5e6 },
  // India
  { name:'New Delhi',lat:28.61,lng:77.21,country:'IN',pop:11e6 },
  { name:'Mumbai',lat:19.08,lng:72.88,country:'IN',pop:12.5e6 },
  { name:'Bangalore',lat:12.97,lng:77.59,country:'IN',pop:8.4e6 },
  { name:'Chennai',lat:13.08,lng:80.27,country:'IN',pop:4.6e6 },
  { name:'Kolkata',lat:22.57,lng:88.36,country:'IN',pop:4.5e6 },
  { name:'Hyderabad',lat:17.39,lng:78.49,country:'IN',pop:6.8e6 },
  // Brazil
  { name:'São Paulo',lat:-23.55,lng:-46.63,country:'BR',pop:12.3e6 },
  { name:'Rio de Janeiro',lat:-22.91,lng:-43.17,country:'BR',pop:6.7e6 },
  { name:'Brasília',lat:-15.79,lng:-47.88,country:'BR',pop:3e6 },
  { name:'Salvador',lat:-12.97,lng:-38.51,country:'BR',pop:2.9e6 },
  // Turkey
  { name:'Istanbul',lat:41.01,lng:28.98,country:'TR',pop:15.5e6 },
  { name:'Ankara',lat:39.93,lng:32.86,country:'TR',pop:5.7e6 },
  { name:'Izmir',lat:38.42,lng:27.14,country:'TR',pop:4.4e6 },
  { name:'Antalya',lat:36.90,lng:30.69,country:'TR',pop:2.5e6 },
  // Egypt
  { name:'Cairo',lat:30.04,lng:31.24,country:'EG',pop:10e6 },
  { name:'Alexandria',lat:31.20,lng:29.92,country:'EG',pop:5.2e6 },
  { name:'Luxor',lat:25.69,lng:32.64,country:'EG',pop:507000 },
  // Saudi Arabia
  { name:'Riyadh',lat:24.69,lng:46.72,country:'SA',pop:7.7e6 },
  { name:'Jeddah',lat:21.49,lng:39.19,country:'SA',pop:4.7e6 },
  { name:'Mecca',lat:21.39,lng:39.86,country:'SA',pop:2e6 },
  // UAE
  { name:'Dubai',lat:25.20,lng:55.27,country:'AE',pop:3.4e6 },
  { name:'Abu Dhabi',lat:24.45,lng:54.65,country:'AE',pop:1.5e6 },
  // South Korea
  { name:'Seoul',lat:37.57,lng:126.98,country:'KR',pop:9.7e6 },
  { name:'Busan',lat:35.18,lng:129.08,country:'KR',pop:3.4e6 },
  { name:'Incheon',lat:37.46,lng:126.71,country:'KR',pop:3e6 },
  // Taiwan
  { name:'Taipei',lat:25.03,lng:121.57,country:'TW',pop:2.6e6 },
  { name:'Kaohsiung',lat:22.62,lng:120.31,country:'TW',pop:2.8e6 },
  // Italy
  { name:'Rome',lat:41.90,lng:12.50,country:'IT',pop:2.9e6 },
  { name:'Milan',lat:45.46,lng:9.19,country:'IT',pop:1.4e6 },
  { name:'Naples',lat:40.85,lng:14.27,country:'IT',pop:960000 },
  // Spain
  { name:'Madrid',lat:40.42,lng:-3.70,country:'ES',pop:3.2e6 },
  { name:'Barcelona',lat:41.39,lng:2.17,country:'ES',pop:1.6e6 },
  { name:'Valencia',lat:39.47,lng:-0.38,country:'ES',pop:790000 },
  // Canada
  { name:'Toronto',lat:43.65,lng:-79.38,country:'CA',pop:2.9e6 },
  { name:'Vancouver',lat:49.28,lng:-123.12,country:'CA',pop:630000 },
  { name:'Montreal',lat:45.50,lng:-73.57,country:'CA',pop:1.8e6 },
  { name:'Ottawa',lat:45.42,lng:-75.70,country:'CA',pop:1e6 },
  // Mexico
  { name:'Mexico City',lat:19.43,lng:-99.13,country:'MX',pop:9.2e6 },
  { name:'Guadalajara',lat:20.67,lng:-103.35,country:'MX',pop:1.5e6 },
  { name:'Monterrey',lat:25.67,lng:-100.31,country:'MX',pop:1.1e6 },
  // Australia
  { name:'Sydney',lat:-33.87,lng:151.21,country:'AU',pop:5.3e6 },
  { name:'Melbourne',lat:-37.81,lng:144.96,country:'AU',pop:5e6 },
  { name:'Brisbane',lat:-27.47,lng:153.03,country:'AU',pop:2.6e6 },
  { name:'Perth',lat:-31.95,lng:115.86,country:'AU',pop:2.1e6 },
  // South Africa
  { name:'Johannesburg',lat:-26.20,lng:28.05,country:'ZA',pop:5.8e6 },
  { name:'Cape Town',lat:-33.93,lng:18.42,country:'ZA',pop:4.6e6 },
  { name:'Durban',lat:-29.86,lng:31.02,country:'ZA',pop:3.7e6 },
  // Nigeria
  { name:'Lagos',lat:6.52,lng:3.38,country:'NG',pop:15.4e6 },
  { name:'Abuja',lat:9.06,lng:7.49,country:'NG',pop:3.6e6 },
  { name:'Kano',lat:12.00,lng:8.52,country:'NG',pop:4e6 },
  // Pakistan
  { name:'Karachi',lat:24.86,lng:67.01,country:'PK',pop:16.1e6 },
  { name:'Lahore',lat:31.55,lng:74.35,country:'PK',pop:12.6e6 },
  { name:'Islamabad',lat:33.69,lng:73.04,country:'PK',pop:1.1e6 },
  // Kenya
  { name:'Nairobi',lat:-1.29,lng:36.82,country:'KE',pop:4.4e6 },
  { name:'Mombasa',lat:-4.05,lng:39.67,country:'KE',pop:1.2e6 },
  // Argentina
  { name:'Buenos Aires',lat:-34.60,lng:-58.38,country:'AR',pop:3e6 },
  { name:'Córdoba',lat:-31.42,lng:-64.18,country:'AR',pop:1.4e6 },
  // Colombia
  { name:'Bogotá',lat:4.71,lng:-74.07,country:'CO',pop:7.4e6 },
  { name:'Medellín',lat:6.25,lng:-75.56,country:'CO',pop:2.5e6 },
  // Thailand
  { name:'Bangkok',lat:13.76,lng:100.50,country:'TH',pop:10.5e6 },
  { name:'Chiang Mai',lat:18.79,lng:98.98,country:'TH',pop:130000 },
  // Others
  { name:'Singapore',lat:1.35,lng:103.82,country:'SG',pop:5.9e6 },
  { name:'Jakarta',lat:-6.21,lng:106.85,country:'ID',pop:10.6e6 },
  { name:'Manila',lat:14.60,lng:120.98,country:'PH',pop:1.8e6 },
  { name:'Kuala Lumpur',lat:3.14,lng:101.69,country:'MY',pop:1.8e6 },
  { name:'Hanoi',lat:21.03,lng:105.85,country:'VN',pop:8e6 },
  { name:'Ho Chi Minh City',lat:10.82,lng:106.63,country:'VN',pop:9e6 },
  { name:'Doha',lat:25.29,lng:51.53,country:'QA',pop:2.4e6 },
  { name:'Kuwait City',lat:29.38,lng:47.99,country:'KW',pop:2.4e6 },
  { name:'Amman',lat:31.95,lng:35.93,country:'JO',pop:4.1e6 },
  { name:'Athens',lat:37.98,lng:23.73,country:'GR',pop:660000 },
  { name:'Lisbon',lat:38.72,lng:-9.14,country:'PT',pop:510000 },
  { name:'Dublin',lat:53.35,lng:-6.26,country:'IE',pop:1.2e6 },
  { name:'Stockholm',lat:59.33,lng:18.07,country:'SE',pop:980000 },
  { name:'Oslo',lat:59.91,lng:10.75,country:'NO',pop:690000 },
  { name:'Copenhagen',lat:55.68,lng:12.57,country:'DK',pop:630000 },
  { name:'Helsinki',lat:60.17,lng:24.94,country:'FI',pop:660000 },
  { name:'Warsaw',lat:52.23,lng:21.01,country:'PL',pop:1.8e6 },
  { name:'Amsterdam',lat:52.37,lng:4.90,country:'NL',pop:870000 },
  { name:'Brussels',lat:50.85,lng:4.35,country:'BE',pop:1.2e6 },
  { name:'Vienna',lat:48.21,lng:16.37,country:'AT',pop:1.9e6 },
  { name:'Zurich',lat:47.38,lng:8.54,country:'CH',pop:430000 },
  { name:'Kabul',lat:34.53,lng:69.17,country:'AF',pop:4.4e6 },
  { name:'Dhaka',lat:23.81,lng:90.41,country:'BD',pop:8.9e6 },
  { name:'Colombo',lat:6.93,lng:79.85,country:'LK',pop:750000 },
  { name:'Kathmandu',lat:27.72,lng:85.32,country:'NP',pop:1.4e6 },
  { name:'Addis Ababa',lat:9.02,lng:38.75,country:'ET',pop:5e6 },
  { name:'Accra',lat:5.60,lng:-0.19,country:'GH',pop:2.5e6 },
  { name:'Casablanca',lat:33.57,lng:-7.59,country:'MA',pop:3.7e6 },
  { name:'Rabat',lat:34.01,lng:-6.83,country:'MA',pop:580000 },
  { name:'Tripoli',lat:32.90,lng:13.18,country:'LY',pop:1.2e6 },
  { name:'Tunis',lat:36.81,lng:10.17,country:'TN',pop:2.3e6 },
  { name:'Havana',lat:23.11,lng:-82.37,country:'CU',pop:2.1e6 },
  { name:'Caracas',lat:10.49,lng:-66.88,country:'VE',pop:2.1e6 },
  { name:'Lima',lat:-12.05,lng:-77.04,country:'PE',pop:10.7e6 },
  { name:'Santiago',lat:-33.45,lng:-70.67,country:'CL',pop:5.6e6 },
  { name:'Bucharest',lat:44.43,lng:26.10,country:'RO',pop:1.8e6 },
  { name:'Belgrade',lat:44.79,lng:20.47,country:'RS',pop:1.2e6 },
  { name:'Budapest',lat:47.50,lng:19.04,country:'HU',pop:1.8e6 },
  { name:'Prague',lat:50.08,lng:14.44,country:'CZ',pop:1.3e6 },
  { name:'Auckland',lat:-36.85,lng:174.76,country:'NZ',pop:1.7e6 },
  { name:'Wellington',lat:-41.29,lng:174.78,country:'NZ',pop:215000 },
  // ---- EXPANDED COVERAGE ----
  // Central America & Caribbean
  { name:'Guatemala City',lat:14.63,lng:-90.51,country:'GT',pop:2.5e6 },
  { name:'San Salvador',lat:13.69,lng:-89.19,country:'SV',pop:1.8e6 },
  { name:'Tegucigalpa',lat:14.07,lng:-87.22,country:'HN',pop:1.2e6 },
  { name:'Managua',lat:12.15,lng:-86.27,country:'NI',pop:1.1e6 },
  { name:'San José',lat:9.93,lng:-84.08,country:'CR',pop:350000 },
  { name:'Panama City',lat:8.98,lng:-79.52,country:'PA',pop:880000 },
  { name:'Kingston',lat:18.00,lng:-76.79,country:'JM',pop:940000 },
  { name:'Port-au-Prince',lat:18.54,lng:-72.34,country:'HT',pop:2.8e6 },
  { name:'Santo Domingo',lat:18.47,lng:-69.90,country:'DO',pop:3.2e6 },
  { name:'San Juan',lat:18.47,lng:-66.10,country:'PR',pop:320000 },
  { name:'Nassau',lat:25.05,lng:-77.35,country:'BS',pop:270000 },
  { name:'Port of Spain',lat:10.65,lng:-61.52,country:'TT',pop:37000 },
  // South America (expanded)
  { name:'Quito',lat:-0.18,lng:-78.47,country:'EC',pop:1.8e6 },
  { name:'Guayaquil',lat:-2.17,lng:-79.92,country:'EC',pop:2.7e6 },
  { name:'La Paz',lat:-16.50,lng:-68.15,country:'BO',pop:900000 },
  { name:'Asunción',lat:-25.26,lng:-57.58,country:'PY',pop:530000 },
  { name:'Montevideo',lat:-34.88,lng:-56.17,country:'UY',pop:1.3e6 },
  { name:'Georgetown',lat:6.80,lng:-58.16,country:'GY',pop:240000 },
  { name:'Recife',lat:-8.05,lng:-34.87,country:'BR',pop:1.6e6 },
  { name:'Fortaleza',lat:-3.72,lng:-38.53,country:'BR',pop:2.7e6 },
  { name:'Manaus',lat:-3.12,lng:-60.02,country:'BR',pop:2.2e6 },
  { name:'Curitiba',lat:-25.43,lng:-49.27,country:'BR',pop:1.9e6 },
  { name:'Belo Horizonte',lat:-19.92,lng:-43.94,country:'BR',pop:2.5e6 },
  { name:'Rosario',lat:-32.95,lng:-60.65,country:'AR',pop:1.2e6 },
  { name:'Cali',lat:3.45,lng:-76.53,country:'CO',pop:2.2e6 },
  { name:'Barranquilla',lat:10.96,lng:-74.78,country:'CO',pop:1.2e6 },
  { name:'Maracaibo',lat:10.63,lng:-71.64,country:'VE',pop:1.6e6 },
  // West Africa
  { name:'Dakar',lat:14.72,lng:-17.47,country:'SN',pop:3.7e6 },
  { name:'Bamako',lat:12.64,lng:-8.00,country:'ML',pop:2.7e6 },
  { name:'Ouagadougou',lat:12.37,lng:-1.52,country:'BF',pop:2.5e6 },
  { name:'Niamey',lat:13.51,lng:2.13,country:'NE',pop:1.3e6 },
  { name:'Conakry',lat:9.64,lng:-13.58,country:'GN',pop:2e6 },
  { name:'Freetown',lat:8.48,lng:-13.23,country:'SL',pop:1.2e6 },
  { name:'Monrovia',lat:6.30,lng:-10.80,country:'LR',pop:1.5e6 },
  { name:'Abidjan',lat:5.36,lng:-4.01,country:'CI',pop:5.6e6 },
  { name:'Lomé',lat:6.17,lng:1.23,country:'TG',pop:1.8e6 },
  { name:'Cotonou',lat:6.37,lng:2.39,country:'BJ',pop:680000 },
  { name:'Port Harcourt',lat:4.75,lng:7.01,country:'NG',pop:3.1e6 },
  // Central Africa
  { name:'Douala',lat:4.05,lng:9.77,country:'CM',pop:3.7e6 },
  { name:'Yaoundé',lat:3.87,lng:11.52,country:'CM',pop:4e6 },
  { name:'Kinshasa',lat:-4.32,lng:15.31,country:'CD',pop:17e6 },
  { name:'Brazzaville',lat:-4.27,lng:15.28,country:'CG',pop:2.4e6 },
  { name:'Libreville',lat:0.39,lng:9.45,country:'GA',pop:830000 },
  { name:'Bangui',lat:4.37,lng:18.56,country:'CF',pop:900000 },
  { name:"N'Djamena",lat:12.11,lng:15.04,country:'TD',pop:1.4e6 },
  // East Africa
  { name:'Kampala',lat:0.35,lng:32.58,country:'UG',pop:1.7e6 },
  { name:'Kigali',lat:-1.94,lng:30.06,country:'RW',pop:1.1e6 },
  { name:'Bujumbura',lat:-3.38,lng:29.36,country:'BI',pop:1.1e6 },
  { name:'Dar es Salaam',lat:-6.79,lng:39.28,country:'TZ',pop:7.4e6 },
  { name:'Mogadishu',lat:2.05,lng:45.34,country:'SO',pop:2.6e6 },
  { name:'Djibouti',lat:11.59,lng:43.15,country:'DJ',pop:600000 },
  { name:'Asmara',lat:15.34,lng:38.93,country:'ER',pop:900000 },
  // Southern Africa
  { name:'Lusaka',lat:-15.39,lng:28.32,country:'ZM',pop:3.3e6 },
  { name:'Harare',lat:-17.83,lng:31.05,country:'ZW',pop:1.5e6 },
  { name:'Maputo',lat:-25.97,lng:32.57,country:'MZ',pop:1.1e6 },
  { name:'Lilongwe',lat:-13.96,lng:33.79,country:'MW',pop:1.1e6 },
  { name:'Gaborone',lat:-24.65,lng:25.91,country:'BW',pop:230000 },
  { name:'Windhoek',lat:-22.56,lng:17.08,country:'NA',pop:430000 },
  { name:'Luanda',lat:-8.84,lng:13.23,country:'AO',pop:8.3e6 },
  { name:'Antananarivo',lat:-18.91,lng:47.53,country:'MG',pop:3.2e6 },
  // North Africa (expanded)
  { name:'Algiers',lat:36.75,lng:3.06,country:'DZ',pop:3.9e6 },
  { name:'Oran',lat:35.70,lng:-0.63,country:'DZ',pop:860000 },
  { name:'Benghazi',lat:32.12,lng:20.09,country:'LY',pop:630000 },
  // Central Asia
  { name:'Tashkent',lat:41.30,lng:69.28,country:'UZ',pop:2.6e6 },
  { name:'Almaty',lat:43.24,lng:76.95,country:'KZ',pop:2e6 },
  { name:'Nur-Sultan',lat:51.17,lng:71.43,country:'KZ',pop:1.2e6 },
  { name:'Bishkek',lat:42.87,lng:74.59,country:'KG',pop:1.1e6 },
  { name:'Dushanbe',lat:38.56,lng:68.77,country:'TJ',pop:920000 },
  { name:'Ashgabat',lat:37.96,lng:58.38,country:'TM',pop:1e6 },
  // Caucasus
  { name:'Tbilisi',lat:41.69,lng:44.80,country:'GE',pop:1.2e6 },
  { name:'Yerevan',lat:40.18,lng:44.51,country:'AM',pop:1.1e6 },
  { name:'Baku',lat:40.41,lng:49.87,country:'AZ',pop:2.3e6 },
  // Southeast Asia (expanded)
  { name:'Phnom Penh',lat:11.56,lng:104.92,country:'KH',pop:2.1e6 },
  { name:'Vientiane',lat:17.97,lng:102.63,country:'LA',pop:950000 },
  { name:'Surabaya',lat:-7.25,lng:112.75,country:'ID',pop:2.9e6 },
  { name:'Bandung',lat:-6.91,lng:107.61,country:'ID',pop:2.5e6 },
  { name:'Cebu City',lat:10.31,lng:123.89,country:'PH',pop:1e6 },
  { name:'Davao',lat:7.07,lng:125.61,country:'PH',pop:1.8e6 },
  // Eastern Europe (expanded)
  { name:'Minsk',lat:53.90,lng:27.57,country:'BY',pop:2e6 },
  { name:'Chișinău',lat:47.01,lng:28.86,country:'MD',pop:690000 },
  { name:'Tirana',lat:41.33,lng:19.82,country:'AL',pop:860000 },
  { name:'Skopje',lat:42.00,lng:21.43,country:'MK',pop:600000 },
  { name:'Sarajevo',lat:43.86,lng:18.41,country:'BA',pop:280000 },
  { name:'Zagreb',lat:45.81,lng:15.98,country:'HR',pop:800000 },
  { name:'Ljubljana',lat:46.06,lng:14.51,country:'SI',pop:290000 },
  { name:'Bratislava',lat:48.15,lng:17.11,country:'SK',pop:430000 },
  { name:'Sofia',lat:42.70,lng:23.32,country:'BG',pop:1.3e6 },
  { name:'Tallinn',lat:59.44,lng:24.75,country:'EE',pop:440000 },
  { name:'Riga',lat:56.95,lng:24.11,country:'LV',pop:620000 },
  { name:'Vilnius',lat:54.69,lng:25.28,country:'LT',pop:590000 },
  // US (expanded)
  { name:'Las Vegas',lat:36.17,lng:-115.14,country:'US',pop:640000 },
  { name:'San Diego',lat:32.72,lng:-117.16,country:'US',pop:1.4e6 },
  { name:'Portland',lat:45.52,lng:-122.68,country:'US',pop:650000 },
  { name:'Nashville',lat:36.16,lng:-86.78,country:'US',pop:690000 },
  { name:'Austin',lat:30.27,lng:-97.74,country:'US',pop:960000 },
  { name:'Detroit',lat:42.33,lng:-83.05,country:'US',pop:640000 },
  { name:'Minneapolis',lat:44.98,lng:-93.27,country:'US',pop:430000 },
  { name:'Salt Lake City',lat:40.76,lng:-111.89,country:'US',pop:200000 },
  { name:'New Orleans',lat:29.95,lng:-90.07,country:'US',pop:390000 },
  { name:'Charlotte',lat:35.23,lng:-80.84,country:'US',pop:880000 },
  { name:'San Antonio',lat:29.42,lng:-98.49,country:'US',pop:1.5e6 },
  { name:'Columbus',lat:39.96,lng:-82.99,country:'US',pop:900000 },
  { name:'Indianapolis',lat:39.77,lng:-86.16,country:'US',pop:880000 },
  // Canada (expanded)
  { name:'Calgary',lat:51.05,lng:-114.07,country:'CA',pop:1.3e6 },
  { name:'Edmonton',lat:53.55,lng:-113.49,country:'CA',pop:1e6 },
  { name:'Winnipeg',lat:49.90,lng:-97.14,country:'CA',pop:750000 },
  { name:'Quebec City',lat:46.81,lng:-71.21,country:'CA',pop:540000 },
  { name:'Halifax',lat:44.65,lng:-63.57,country:'CA',pop:440000 },
  // UK (expanded)
  { name:'Leeds',lat:53.80,lng:-1.55,country:'GB',pop:790000 },
  { name:'Bristol',lat:51.45,lng:-2.59,country:'GB',pop:470000 },
  { name:'Cardiff',lat:51.48,lng:-3.18,country:'GB',pop:360000 },
  { name:'Belfast',lat:54.60,lng:-5.93,country:'GB',pop:340000 },
  // Germany (expanded)
  { name:'Stuttgart',lat:48.78,lng:9.18,country:'DE',pop:635000 },
  { name:'Düsseldorf',lat:51.23,lng:6.78,country:'DE',pop:620000 },
  { name:'Leipzig',lat:51.34,lng:12.37,country:'DE',pop:600000 },
  { name:'Dresden',lat:51.05,lng:13.74,country:'DE',pop:560000 },
  // France (expanded)
  { name:'Bordeaux',lat:44.84,lng:-0.58,country:'FR',pop:260000 },
  { name:'Strasbourg',lat:48.57,lng:7.75,country:'FR',pop:280000 },
  { name:'Nantes',lat:47.22,lng:-1.55,country:'FR',pop:310000 },
  { name:'Lille',lat:50.63,lng:3.06,country:'FR',pop:230000 },
  // Oceania
  { name:'Suva',lat:-18.14,lng:178.44,country:'FJ',pop:93000 },
  { name:'Port Moresby',lat:-9.44,lng:147.18,country:'PG',pop:380000 },
  { name:'Adelaide',lat:-34.93,lng:138.60,country:'AU',pop:1.4e6 },
  { name:'Christchurch',lat:-43.53,lng:172.64,country:'NZ',pop:380000 },
  // Mongolia
  { name:'Ulaanbaatar',lat:47.92,lng:106.91,country:'MN',pop:1.5e6 },
  // Bangladesh (expanded)
  { name:'Chittagong',lat:22.36,lng:91.78,country:'BD',pop:2.6e6 },
  // Pakistan (expanded)
  { name:'Faisalabad',lat:31.42,lng:73.08,country:'PK',pop:3.2e6 },
  { name:'Rawalpindi',lat:33.60,lng:73.05,country:'PK',pop:2.1e6 },
  { name:'Peshawar',lat:34.01,lng:71.58,country:'PK',pop:2e6 },
  // India (expanded)
  { name:'Ahmedabad',lat:23.02,lng:72.57,country:'IN',pop:5.6e6 },
  { name:'Pune',lat:18.52,lng:73.86,country:'IN',pop:3.1e6 },
  { name:'Jaipur',lat:26.92,lng:75.79,country:'IN',pop:3e6 },
  { name:'Lucknow',lat:26.85,lng:80.95,country:'IN',pop:2.8e6 },
  { name:'Surat',lat:21.17,lng:72.83,country:'IN',pop:4.5e6 },
  // China (expanded)
  { name:'Wuhan',lat:30.59,lng:114.31,country:'CN',pop:11.1e6 },
  { name:"Xi'an",lat:34.26,lng:108.94,country:'CN',pop:9e6 },
  { name:'Hangzhou',lat:30.27,lng:120.15,country:'CN',pop:10.4e6 },
  { name:'Chongqing',lat:29.56,lng:106.55,country:'CN',pop:8.9e6 },
  { name:'Nanjing',lat:32.06,lng:118.80,country:'CN',pop:8.5e6 },
  { name:'Tianjin',lat:39.14,lng:117.18,country:'CN',pop:13.6e6 },
  // Japan (expanded)
  { name:'Sapporo',lat:43.06,lng:141.35,country:'JP',pop:2e6 },
  { name:'Fukuoka',lat:33.59,lng:130.40,country:'JP',pop:1.6e6 },
  { name:'Kobe',lat:34.69,lng:135.20,country:'JP',pop:1.5e6 },
  // Russia (expanded)
  { name:'Kazan',lat:55.80,lng:49.11,country:'RU',pop:1.3e6 },
  { name:'Rostov-on-Don',lat:47.24,lng:39.71,country:'RU',pop:1.1e6 },
  { name:'Samara',lat:53.20,lng:50.15,country:'RU',pop:1.2e6 },
  { name:'Krasnoyarsk',lat:56.01,lng:92.85,country:'RU',pop:1.1e6 },
  // Italy (expanded)
  { name:'Turin',lat:45.07,lng:7.69,country:'IT',pop:870000 },
  { name:'Florence',lat:43.77,lng:11.25,country:'IT',pop:380000 },
  { name:'Venice',lat:45.44,lng:12.32,country:'IT',pop:260000 },
  { name:'Palermo',lat:38.12,lng:13.36,country:'IT',pop:670000 },
  // Spain (expanded)
  { name:'Seville',lat:37.39,lng:-5.98,country:'ES',pop:690000 },
  { name:'Bilbao',lat:43.26,lng:-2.93,country:'ES',pop:350000 },
  { name:'Málaga',lat:36.72,lng:-4.42,country:'ES',pop:570000 },
  // Mexico (expanded)
  { name:'Cancún',lat:21.16,lng:-86.85,country:'MX',pop:890000 },
  { name:'Tijuana',lat:32.51,lng:-117.04,country:'MX',pop:1.8e6 },
  { name:'Puebla',lat:19.04,lng:-98.21,country:'MX',pop:1.6e6 },
  // Turkey (expanded)
  { name:'Bursa',lat:40.18,lng:29.06,country:'TR',pop:3.1e6 },
  { name:'Adana',lat:37.00,lng:35.32,country:'TR',pop:2.2e6 },
  // Egypt (expanded)
  { name:'Aswan',lat:24.09,lng:32.90,country:'EG',pop:300000 },
  { name:'Sharm el-Sheikh',lat:27.92,lng:34.33,country:'EG',pop:73000 },
  // Poland (expanded)
  { name:'Kraków',lat:50.06,lng:19.94,country:'PL',pop:780000 },
  { name:'Wrocław',lat:51.11,lng:17.04,country:'PL',pop:640000 },
  { name:'Gdańsk',lat:54.35,lng:18.65,country:'PL',pop:470000 },
];

// Load GeoJSON with fallback chain
async function loadGeoJson(urls, idx) {
  if (idx >= urls.length) throw new Error('All GeoJSON sources failed');
  try {
    const res = await fetch(urls[idx]);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    // Handle TopoJSON (world-atlas format) vs GeoJSON
    if (data.type === 'Topology' && data.objects) {
      // Convert TopoJSON to GeoJSON using inline conversion
      const key = Object.keys(data.objects)[0];
      return topojsonToGeojson(data, key);
    }
    return data;
  } catch (e) {
    console.warn('GeoJSON source', idx, 'failed:', e.message);
    return loadGeoJson(urls, idx + 1);
  }
}

// Minimal TopoJSON to GeoJSON converter
function topojsonToGeojson(topology, objectName) {
  const obj = topology.objects[objectName];
  const arcs = topology.arcs;
  const transform = topology.transform;

  function decodeArc(arcIdx) {
    const reversed = arcIdx < 0;
    const arc = arcs[reversed ? ~arcIdx : arcIdx];
    const coords = [];
    let x = 0, y = 0;
    for (const point of arc) {
      x += point[0]; y += point[1];
      if (transform) {
        coords.push([x * transform.scale[0] + transform.translate[0], y * transform.scale[1] + transform.translate[1]]);
      } else {
        coords.push([x, y]);
      }
    }
    if (reversed) coords.reverse();
    return coords;
  }

  function decodeRing(indices) {
    const coords = [];
    for (const idx of indices) {
      const arc = decodeArc(idx);
      // Skip first point of subsequent arcs (shared with previous arc end)
      coords.push(...(coords.length > 0 ? arc.slice(1) : arc));
    }
    return coords;
  }

  function decodeGeometry(geom) {
    if (geom.type === 'Polygon') {
      return { type: 'Polygon', coordinates: geom.arcs.map(decodeRing) };
    } else if (geom.type === 'MultiPolygon') {
      return { type: 'MultiPolygon', coordinates: geom.arcs.map(poly => poly.map(decodeRing)) };
    }
    return geom;
  }

  const features = (obj.geometries || []).map(geom => ({
    type: 'Feature',
    properties: geom.properties || {},
    geometry: decodeGeometry(geom),
  }));

  return { type: 'FeatureCollection', features };
}

function initGlobe() {
  const container = document.getElementById('globe-container');
  const loading = document.getElementById('globe-loading');

  if (!container || container.offsetWidth === 0) {
    setTimeout(initGlobe, 100);
    return;
  }

  try {
    globe = Globe()
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#4d9de0')
      .atmosphereAltitude(0.2)
      .backgroundColor('rgba(0,0,0,0)')
      .width(container.offsetWidth)
      .height(container.offsetHeight)
      (document.getElementById('globeViz'));
  } catch (e) {
    console.error('Globe init failed:', e);
    loading.innerHTML = '<span style="color: var(--red);">Failed to initialize globe</span>';
    return;
  }

  globe.pointOfView({ lat: 20, lng: 10, altitude: 2.2 }, 0);

  // GeoJSON sources — 110m has ISO_A2 and is reliable
  const geoJsonUrls = [
    'https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson',
  ];

  loadGeoJson(geoJsonUrls, 0)
    .then(geoJson => {
      // Transform GeoJSON: rename Israel → Palestine, merge into PS
      geoJson.features.forEach(f => {
        if (f.properties.ISO_A2 === 'IL') {
          f.properties.ISO_A2 = 'PS';
          f.properties.NAME = 'Palestine';
          f.properties.NAME_LONG = 'Palestine';
          f.properties.ADMIN = 'Palestine';
          f.properties.SOVEREIGNT = 'Palestine';
        }
      });

      countriesGeoJson = geoJson.features.filter(d => {
        const iso = d.properties.ISO_A2;
        return iso && iso !== '-99' && iso !== 'AQ';
      });

      globe
        .polygonsData(countriesGeoJson)
        .polygonGeoJsonGeometry(d => d.geometry)
        .polygonCapColor(d => getPolygonColor(d))
        .polygonSideColor(() => 'rgba(0, 240, 255, 0.10)')
        .polygonStrokeColor(() => 'rgba(0, 240, 255, 0.55)')
        .polygonAltitude(d => d === selectedPolygon ? 0.03 : 0.006)
        .polygonLabel(d => {
          const iso = d.properties.ISO_A2;
          const name = d.properties.NAME || '';
          const hotspot = currentHotspots.find(h => h.countryCode === iso);
          let statusLabel = '';
          if (hotspot) {
            if (hotspot.crisisType === 'war') statusLabel = '<span style="color:#ff3b3b;"> ⚠ CONFLICT</span>';
            else if (hotspot.intensity >= 0.8) statusLabel = '<span style="color:#ff9500;"> ● HIGH ACTIVITY</span>';
            else if (hotspot.intensity >= 0.5) statusLabel = '<span style="color:#f59e0b;"> ● MODERATE</span>';
          }
          return `<div class="globe-tooltip">${getCountryFlag(iso)} ${name}${statusLabel}</div>`;
        })
        .onPolygonHover(handlePolygonHover)
        .onPolygonClick(handlePolygonClick)
        .polygonsTransitionDuration(200);

      // Initialize layers
      globe.pointsData([]).arcsData([]);

      // Setup ring layer for news heat — ALWAYS persistent, never cleared
      globe
        .ringsData([])
        .ringLat(d => d.lat)
        .ringLng(d => d.lng)
        .ringAltitude(0.003)
        .ringColor(d => d.color)
        .ringMaxRadius(d => d.maxRadius)
        .ringPropagationSpeed(d => d.speed)
        .ringRepeatPeriod(d => d.repeat);

      // htmlElements start empty
      globe.htmlElementsData([]);

      // Setup label layer for city names — sizes adapt to zoom and population
      globe
        .labelsData([])
        .labelLat(d => d.lat)
        .labelLng(d => d.lng)
        .labelText(d => d.name)
        .labelSize(d => {
          const alt = globe.pointOfView().altitude;
          // Base size by population tier
          let base;
          if (d.pop > 10e6) base = 0.6;
          else if (d.pop > 5e6) base = 0.48;
          else if (d.pop > 1e6) base = 0.38;
          else if (d.pop > 300000) base = 0.28;
          else if (d.pop > 100000) base = 0.22;
          else base = 0.18;
          // Scale by zoom — much smaller when zoomed out
          if (alt > 1.4) return base * 0.5;
          if (alt > 1.0) return base * 0.6;
          if (alt > 0.7) return base * 0.75;
          if (alt > 0.4) return base * 0.9;
          return base;
        })
        .labelDotRadius(d => {
          if (d.pop > 5e6) return 0.08;
          if (d.pop > 1e6) return 0.05;
          if (d.pop > 100000) return 0.03;
          return 0.02;
        })
        .labelColor(d => {
          // Brighter for bigger cities, dimmer for small ones
          if (d.pop > 5e6) return 'rgba(200, 240, 255, 0.95)';
          if (d.pop > 1e6) return 'rgba(200, 240, 255, 0.8)';
          return 'rgba(180, 220, 240, 0.6)';
        })
        .labelResolution(2)
        .labelAltitude(0.007)
        .labelsTransitionDuration(200);

      if (loading) loading.classList.add('loaded');

      if (typeof onGlobeReady === 'function') onGlobeReady();
      startAutoRotate();

      // Monitor zoom level to show/hide city labels and adjust borders
      startZoomMonitor();
    })
    .catch(err => {
      console.error('Failed to load GeoJSON:', err);
      if (loading) loading.innerHTML = '<span style="color: var(--red);">Failed to load globe data. Refresh to retry.</span>';
    });

  let resizeTimeout;
  const resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (globe && container.offsetWidth > 0 && container.offsetHeight > 0) {
        globe.width(container.offsetWidth).height(container.offsetHeight);
      }
    }, 150);
  });
  resizeObserver.observe(container);

  ['mousedown', 'touchstart', 'wheel'].forEach(event => {
    container.addEventListener(event, () => {
      isUserInteracting = true;
      stopAutoRotate();
      clearTimeout(autoRotateTimer);
      autoRotateTimer = setTimeout(() => {
        isUserInteracting = false;
        startAutoRotate();
      }, 15000);
    }, { passive: true });
  });
}

// Country coloring based on crisis level
function getPolygonColor(d) {
  if (d === selectedPolygon) return 'rgba(0, 240, 255, 0.22)';
  const iso = d.properties?.ISO_A2;
  if (iso) {
    const hotspot = currentHotspots.find(h => h.countryCode === iso);
    if (hotspot) {
      if (hotspot.crisisType === 'war') return 'rgba(255, 59, 59, 0.18)';
      if (hotspot.intensity >= 0.8) return 'rgba(255, 149, 0, 0.12)';
      if (hotspot.intensity >= 0.5) return 'rgba(255, 200, 0, 0.08)';
    }
  }
  return 'rgba(10, 14, 23, 0.55)';
}

function refreshPolygonColors() {
  if (!globe) return;
  globe
    .polygonCapColor(d => getPolygonColor(d))
    .polygonAltitude(d => d === selectedPolygon ? 0.03 : 0.006);
}

function handlePolygonHover(polygon) {
  if (polygon === hoveredPolygon) return;
  hoveredPolygon = polygon;
  globe
    .polygonCapColor(d => {
      if (d === selectedPolygon) return 'rgba(0, 240, 255, 0.22)';
      if (d === polygon) return 'rgba(0, 240, 255, 0.1)';
      return getPolygonColor(d);
    })
    .polygonAltitude(d => {
      if (d === selectedPolygon) return 0.03;
      if (d === polygon) return 0.02;
      return 0.006;
    });
  const el = document.getElementById('globe-container');
  if (el) el.style.cursor = polygon ? 'pointer' : 'grab';
}

function handlePolygonClick(polygon) {
  if (!polygon) return;
  selectedPolygon = polygon;
  const props = polygon.properties;
  const center = getCountryCenter(polygon);
  globe.pointOfView({ lat: center.lat, lng: center.lng, altitude: 1.6 }, 1000);
  refreshPolygonColors();
  if (typeof onCountrySelect === 'function') onCountrySelect(props);
}

function flyToCountry(lat, lng) {
  if (globe) globe.pointOfView({ lat, lng, altitude: 1.6 }, 1000);
}

function resetSelection() {
  selectedPolygon = null;
  refreshPolygonColors();
}

// ========== NEWS HEAT RINGS (always visible, never cleared by flights) ==========
function updateNewsHeatRings(hotspots) {
  if (!globe) return;
  currentHotspots = hotspots;
  const rings = hotspots.map(h => ({
    lat: h.lat,
    lng: h.lng,
    color: t => {
      if (h.crisisType === 'war') return `rgba(255, 59, 59, ${1 - t})`;
      if (h.intensity >= 0.8) return `rgba(255, 149, 0, ${1 - t})`;
      if (h.intensity >= 0.5) return `rgba(255, 200, 0, ${1 - t})`;
      return `rgba(0, 240, 255, ${1 - t})`;
    },
    maxRadius: h.crisisType === 'war' ? 5 : (h.intensity >= 0.8 ? 3.5 : (h.intensity >= 0.5 ? 2.5 : 1.5)),
    speed: h.crisisType === 'war' ? 4 : (h.intensity >= 0.8 ? 3 : 2),
    repeat: h.crisisType === 'war' ? 600 : (h.intensity >= 0.8 ? 800 : 1500),
  }));
  globe.ringsData(rings);
  refreshPolygonColors();
}

// ========== NEWS POINT MARKERS (dots on globe) ==========
function updateGlobeMarkers(hotspots) {
  if (!globe) return;
  currentHotspots = hotspots;
  globe
    .pointsData(hotspots)
    .pointLat(d => d.lat)
    .pointLng(d => d.lng)
    .pointColor(d => {
      if (d.crisisType === 'war') return '#ff3b3b';
      if (d.intensity >= 0.8) return '#ff9500';
      if (d.intensity >= 0.5) return '#f5c518';
      return '#00f0ff';
    })
    .pointAltitude(0.015)
    .pointRadius(d => {
      if (d.crisisType === 'war') return 0.5;
      if (d.intensity >= 0.8) return 0.35;
      if (d.intensity >= 0.5) return 0.25;
      return 0.15;
    })
    .pointsMerge(false);

  // Only set htmlElements to pulsing markers if flights aren't active
  if (!flightsActive) {
    const pulsing = hotspots.filter(h => h.isBreaking || h.crisisType === 'war');
    globe
      .htmlElementsData(pulsing)
      .htmlLat(d => d.lat)
      .htmlLng(d => d.lng)
      .htmlAltitude(0.02)
      .htmlElement(d => {
        const el = document.createElement('div');
        el.className = 'globe-marker';
        const cls = d.crisisType === 'war' ? 'war' : (d.intensity >= 0.8 ? 'hot' : 'breaking');
        el.innerHTML = `<div class="globe-marker-dot ${cls}"></div><div class="globe-marker-ring ${cls}"></div>`;
        return el;
      });
  }
}

// ========== SEARCH PIN ==========
function showSearchPin(lat, lng, name) {
  if (!globe) return;
  const existing = globe.pointsData() || [];
  const pin = { lat, lng, isSearchPin: true, name, intensity: 1 };
  globe.pointsData([...existing.filter(p => !p.isSearchPin), pin])
    .pointColor(d => d.isSearchPin ? '#ff3b3b' : (d.crisisType === 'war' ? '#ff3b3b' : d.intensity >= 0.8 ? '#ff9500' : d.intensity >= 0.5 ? '#f5c518' : '#00f0ff'))
    .pointAltitude(d => d.isSearchPin ? 0.08 : 0.015)
    .pointRadius(d => d.isSearchPin ? 0.5 : (d.crisisType === 'war' ? 0.5 : d.intensity >= 0.8 ? 0.35 : d.intensity >= 0.5 ? 0.25 : 0.15));
}

// ========== FLIGHT RENDERING ==========
// Flights use htmlElements layer ONLY. Rings and points layers are NEVER touched here.
function renderFlightsOnGlobe(flights) {
  if (!globe) return;
  flightsActive = true;
  currentFlightsOnGlobe = flights;

  const sample = flights.slice(0, 300);
  globe
    .htmlElementsData(sample)
    .htmlLat(d => d.lat)
    .htmlLng(d => d.lng)
    .htmlAltitude(0.015)
    .htmlElement(d => {
      const el = document.createElement('div');
      el.className = 'flight-icon-wrap';
      el.innerHTML = `<svg class="flight-svg" viewBox="0 0 24 24" width="20" height="20" style="transform:rotate(${(d.heading || 0)}deg)">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#ff9500"/>
      </svg>`;
      el.title = `${d.callsign} | ${d.origin} → ${d.destAirport || '?'} | ${d.altitude.toLocaleString()}ft | ${d.speed}kts`;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof onFlightSelect === 'function') onFlightSelect(d);
      });
      return el;
    });

  // CRITICAL: rings (heat zones) and points (markers) are SEPARATE layers
  // They are NEVER cleared by flight rendering. They persist always.
}

// Show flight route: origin ---dim---> [PLANE] ===bright===> destination
function showFlightRoute(flight) {
  if (!globe || !flight) return;
  selectedFlightCallsign = flight.callsign;

  const arcs = [];

  // MAIN ARC: from plane current position → destination (bright, animated, moves forward)
  if (flight.destLat != null && flight.destLng != null) {
    arcs.push({
      startLat: flight.lat,
      startLng: flight.lng,
      endLat: flight.destLat,
      endLng: flight.destLng,
      color: ['rgba(255,149,0,0.95)', 'rgba(255,60,60,0.95)'],
      stroke: 0.5,
      dashLen: 0.25,
      dashGap: 0.1,
      animTime: 2000, // animation moves toward destination
    });
  }

  // TRAIL ARC: from origin → plane position (dim, dotted, no animation — already traveled)
  if (flight.originLat != null && flight.originLng != null) {
    arcs.push({
      startLat: flight.originLat,
      startLng: flight.originLng,
      endLat: flight.lat,
      endLng: flight.lng,
      color: ['rgba(0,200,255,0.15)', 'rgba(0,200,255,0.15)'],
      stroke: 0.25,
      dashLen: 0.08,
      dashGap: 0.06,
      animTime: 0,
    });
  }

  // If no destination could be determined, estimate from heading
  if (arcs.length === 0) {
    const dest = estimateDestination(flight.lat, flight.lng, flight.heading, flight.speed);
    arcs.push({
      startLat: flight.lat,
      startLng: flight.lng,
      endLat: dest.lat,
      endLng: dest.lng,
      color: ['rgba(255,149,0,0.95)', 'rgba(255,60,60,0.95)'],
      stroke: 0.5,
      dashLen: 0.25,
      dashGap: 0.1,
      animTime: 2000,
    });
  }

  globe
    .arcsData(arcs)
    .arcStartLat(d => d.startLat)
    .arcStartLng(d => d.startLng)
    .arcEndLat(d => d.endLat)
    .arcEndLng(d => d.endLng)
    .arcColor(d => d.color)
    .arcDashLength(d => d.dashLen)
    .arcDashGap(d => d.dashGap)
    .arcDashAnimateTime(d => d.animTime)
    .arcStroke(d => d.stroke)
    .arcsTransitionDuration(200);
}

function clearFlightRoute() {
  if (!globe) return;
  selectedFlightCallsign = null;
  globe.arcsData([]);
}

function estimateDestination(lat, lng, heading, speed) {
  const R = 6371;
  const d = (speed * 1.852) * 2.5;
  const brng = heading * Math.PI / 180;
  const lat1 = lat * Math.PI / 180;
  const lng1 = lng * Math.PI / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) + Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng));
  const lng2 = lng1 + Math.atan2(Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: lat2 * 180 / Math.PI, lng: lng2 * 180 / Math.PI };
}

// ========== SEA ZONE RENDERING ==========
let seaZoneElements = [];

function renderSeaZones(zones) {
  if (!globe) return;
  // Add sea zones as rings + point markers
  const existingRings = globe.ringsData() || [];
  const seaRings = zones.map(z => ({
    lat: z.lat,
    lng: z.lng,
    color: t => {
      if (z.crisisType === 'war') return `rgba(255, 59, 59, ${0.8 * (1 - t)})`;
      if (z.intensity >= 0.8) return `rgba(255, 149, 0, ${0.7 * (1 - t)})`;
      if (z.intensity >= 0.6) return `rgba(255, 200, 0, ${0.6 * (1 - t)})`;
      return `rgba(0, 200, 255, ${0.5 * (1 - t)})`;
    },
    maxRadius: z.radius || 3,
    speed: z.crisisType === 'war' ? 3 : 2,
    repeat: z.crisisType === 'war' ? 700 : 1200,
    isSeaZone: true,
  }));
  // Merge: keep non-sea rings, add new sea rings
  const landRings = existingRings.filter(r => !r.isSeaZone);
  globe.ringsData([...landRings, ...seaRings]);

  // Add sea zone point markers
  const existingPoints = globe.pointsData() || [];
  const seaPoints = zones.map(z => ({
    lat: z.lat,
    lng: z.lng,
    isSeaZone: true,
    seaZoneId: z.id,
    intensity: z.intensity,
    crisisType: z.crisisType,
  }));
  const landPoints = existingPoints.filter(p => !p.isSeaZone);
  globe.pointsData([...landPoints, ...seaPoints])
    .pointColor(d => {
      if (d.isSearchPin) return '#ff3b3b';
      if (d.isSeaZone) {
        if (d.crisisType === 'war') return '#ff3b3b';
        if (d.intensity >= 0.8) return '#ff9500';
        return '#00c8ff';
      }
      if (d.crisisType === 'war') return '#ff3b3b';
      if (d.intensity >= 0.8) return '#ff9500';
      if (d.intensity >= 0.5) return '#f5c518';
      return '#00f0ff';
    })
    .pointAltitude(d => d.isSearchPin ? 0.08 : d.isSeaZone ? 0.01 : 0.015)
    .pointRadius(d => {
      if (d.isSearchPin) return 0.5;
      if (d.isSeaZone) return d.crisisType === 'war' ? 0.6 : 0.4;
      if (d.crisisType === 'war') return 0.5;
      if (d.intensity >= 0.8) return 0.35;
      if (d.intensity >= 0.5) return 0.25;
      return 0.15;
    });

  seaZoneElements = zones;
}

// Restore news markers when flights panel is closed
function restoreNewsMarkers() {
  flightsActive = false;
  currentFlightsOnGlobe = [];
  if (currentHotspots.length > 0) {
    updateGlobeMarkers(currentHotspots);
  } else {
    globe.htmlElementsData([]);
  }
}

// Auto-rotation
function startAutoRotate() {
  if (autoRotateRAF) return;
  let lastTime = performance.now();
  function rotate(time) {
    if (isUserInteracting) { autoRotateRAF = null; return; }
    const delta = time - lastTime;
    lastTime = time;
    if (globe) {
      const pov = globe.pointOfView();
      globe.pointOfView({ lat: pov.lat, lng: pov.lng + delta * 0.002, altitude: pov.altitude }, 0);
    }
    autoRotateRAF = requestAnimationFrame(rotate);
  }
  autoRotateRAF = requestAnimationFrame(rotate);
}

function stopAutoRotate() {
  if (autoRotateRAF) { cancelAnimationFrame(autoRotateRAF); autoRotateRAF = null; }
}

// ========== ZOOM-BASED CITY LABELS & BORDER ENHANCEMENT ==========
let lastZoomLevel = -1; // track which zoom bracket we're in
function startZoomMonitor() {
  let lastAlt = -1;
  function check() {
    if (globe) {
      const pov = globe.pointOfView();
      const alt = pov.altitude;
      // Update when altitude changes meaningfully
      if (Math.abs(alt - lastAlt) > 0.03) {
        lastAlt = alt;
        updateCityLabelsForZoom(pov);
        updateBordersForZoom(alt);
      }
    }
    requestAnimationFrame(check);
  }
  requestAnimationFrame(check);
}

function updateBordersForZoom(alt) {
  if (!globe) return;
  // Determine zoom bracket
  let zoomLevel;
  if (alt < 0.6) zoomLevel = 3;       // very close
  else if (alt < 1.0) zoomLevel = 2;   // close
  else if (alt < 1.8) zoomLevel = 1;   // medium
  else zoomLevel = 0;                   // far

  if (zoomLevel === lastZoomLevel) return;
  lastZoomLevel = zoomLevel;

  // Make borders brighter and sides taller when zoomed in
  const strokeColors = [
    'rgba(0, 240, 255, 0.35)',  // far
    'rgba(0, 240, 255, 0.55)',  // medium
    'rgba(0, 240, 255, 0.75)',  // close
    'rgba(0, 240, 255, 0.9)',   // very close
  ];
  const sideColors = [
    'rgba(0, 240, 255, 0.06)',
    'rgba(0, 240, 255, 0.10)',
    'rgba(0, 240, 255, 0.15)',
    'rgba(0, 240, 255, 0.22)',
  ];
  const baseAlt = [0.006, 0.008, 0.012, 0.018];

  globe
    .polygonStrokeColor(() => strokeColors[zoomLevel])
    .polygonSideColor(() => sideColors[zoomLevel])
    .polygonAltitude(d => {
      if (d === selectedPolygon) return 0.03;
      return baseAlt[zoomLevel];
    });
}

function updateCityLabelsForZoom(pov) {
  if (!globe) return;
  const alt = pov.altitude;

  if (alt > 2.0) {
    if (cityLabelsVisible) {
      globe.labelsData([]);
      cityLabelsVisible = false;
    }
    return;
  }

  cityLabelsVisible = true;
  const viewLat = pov.lat;
  const viewLng = pov.lng;

  // Zoom brackets: radiusDeg = viewport, minPop = filter, minSpacing = declutter distance, maxLabels = cap
  let radiusDeg, minPop, minSpacing, maxLabels;
  if (alt < 0.25) {
    radiusDeg = 4; minPop = 0; minSpacing = 0.3; maxLabels = 30;
  } else if (alt < 0.4) {
    radiusDeg = 6; minPop = 0; minSpacing = 0.5; maxLabels = 25;
  } else if (alt < 0.6) {
    radiusDeg = 10; minPop = 20000; minSpacing = 0.8; maxLabels = 22;
  } else if (alt < 0.8) {
    radiusDeg = 15; minPop = 80000; minSpacing = 1.5; maxLabels = 18;
  } else if (alt < 1.0) {
    radiusDeg = 20; minPop = 200000; minSpacing = 2.5; maxLabels = 15;
  } else if (alt < 1.4) {
    radiusDeg = 30; minPop = 800000; minSpacing = 4.0; maxLabels = 12;
  } else if (alt < 2.0) {
    radiusDeg = 50; minPop = 3000000; minSpacing = 6.0; maxLabels = 8;
  } else {
    globe.labelsData([]);
    return;
  }

  // Filter by viewport and population
  const candidates = WORLD_CITIES.filter(c => {
    if (c.pop < minPop) return false;
    const dLat = Math.abs(c.lat - viewLat);
    const dLng = Math.abs(c.lng - viewLng);
    return dLat < radiusDeg && dLng < radiusDeg * 1.5;
  });

  // Sort by population descending — bigger cities always win
  candidates.sort((a, b) => b.pop - a.pop);

  // Declutter with Euclidean distance check and max cap
  const placed = [];
  for (const city of candidates) {
    if (placed.length >= maxLabels) break;
    let tooClose = false;
    for (const p of placed) {
      const dLat = city.lat - p.lat;
      const dLng = (city.lng - p.lng) * Math.cos(city.lat * Math.PI / 180); // longitude correction
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minSpacing) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) placed.push(city);
  }

  globe.labelsData(placed);
}
