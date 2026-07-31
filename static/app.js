/**
 * Clima Mundial - Frontend JavaScript
 * Gerencia busca de cidades, exibição de dados climáticos e interações
 */

// ==========================================
// Estado da Aplicação
// ==========================================
let searchTimeout = null;
let currentCity = null;

// ==========================================
// Elementos DOM
// ==========================================
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const clearBtn = document.getElementById('clearBtn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const weatherContent = document.getElementById('weatherContent');

// ==========================================
// Mapeamento de Códigos WMO para ícones e descrições
// ==========================================
const weatherCodes = {
    0: { icon: '☀️', iconNight: '🌙', desc: 'Céu limpo' },
    1: { icon: '🌤️', iconNight: '🌙', desc: 'Predominantemente limpo' },
    2: { icon: '⛅', iconNight: '☁️', desc: 'Parcialmente nublado' },
    3: { icon: '☁️', iconNight: '☁️', desc: 'Nublado' },
    45: { icon: '🌫️', iconNight: '🌫️', desc: 'Nevoeiro' },
    48: { icon: '🌫️', iconNight: '🌫️', desc: 'Nevoeiro com geada' },
    51: { icon: '🌦️', iconNight: '🌧️', desc: 'Garoa leve' },
    53: { icon: '🌦️', iconNight: '🌧️', desc: 'Garoa moderada' },
    55: { icon: '🌧️', iconNight: '🌧️', desc: 'Garoa intensa' },
    56: { icon: '🌧️', iconNight: '🌧️', desc: 'Garoa congelante leve' },
    57: { icon: '🌧️', iconNight: '🌧️', desc: 'Garoa congelante intensa' },
    61: { icon: '🌧️', iconNight: '🌧️', desc: 'Chuva leve' },
    63: { icon: '🌧️', iconNight: '🌧️', desc: 'Chuva moderada' },
    65: { icon: '🌧️', iconNight: '🌧️', desc: 'Chuva forte' },
    66: { icon: '🌨️', iconNight: '🌨️', desc: 'Chuva congelante leve' },
    67: { icon: '🌨️', iconNight: '🌨️', desc: 'Chuva congelante forte' },
    71: { icon: '🌨️', iconNight: '🌨️', desc: 'Neve leve' },
    73: { icon: '🌨️', iconNight: '🌨️', desc: 'Neve moderada' },
    75: { icon: '❄️', iconNight: '❄️', desc: 'Neve forte' },
    77: { icon: '❄️', iconNight: '❄️', desc: 'Grãos de neve' },
    80: { icon: '🌦️', iconNight: '🌧️', desc: 'Pancadas de chuva leve' },
    81: { icon: '🌧️', iconNight: '🌧️', desc: 'Pancadas de chuva moderada' },
    82: { icon: '⛈️', iconNight: '⛈️', desc: 'Pancadas de chuva forte' },
    85: { icon: '🌨️', iconNight: '🌨️', desc: 'Pancadas de neve leve' },
    86: { icon: '❄️', iconNight: '❄️', desc: 'Pancadas de neve forte' },
    95: { icon: '⛈️', iconNight: '⛈️', desc: 'Tempestade' },
    96: { icon: '⛈️', iconNight: '⛈️', desc: 'Tempestade com granizo leve' },
    99: { icon: '⛈️', iconNight: '⛈️', desc: 'Tempestade com granizo forte' },
};

// ==========================================
// Event Listeners
// ==========================================
searchInput.addEventListener('input', handleSearchInput);
searchInput.addEventListener('focus', () => {
    if (searchResults.children.length > 0) {
        searchResults.classList.remove('hidden');
    }
});

clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.add('hidden');
    searchResults.classList.add('hidden');
    searchResults.innerHTML = '';
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        searchResults.classList.add('hidden');
    }
});

// ==========================================
// Busca de Cidades
// ==========================================
function handleSearchInput(e) {
    const query = e.target.value.trim();

    clearBtn.classList.toggle('hidden', query.length === 0);

    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    if (query.length < 2) {
        searchResults.classList.add('hidden');
        searchResults.innerHTML = '';
        return;
    }

    searchTimeout = setTimeout(() => searchCities(query), 300);
}

async function searchCities(query) {
    try {
        const resp = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await resp.json();

        if (data.error) {
            showSearchError(data.error);
            return;
        }

        displaySearchResults(data.results);
    } catch (err) {
        showSearchError('Erro ao buscar cidades. Tente novamente.');
    }
}

function displaySearchResults(results) {
    if (!results || results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item"><span class="result-info"><span class="result-name">Nenhuma cidade encontrada</span></span></div>';
        searchResults.classList.remove('hidden');
        return;
    }

    searchResults.innerHTML = results.map(city => `
        <div class="search-result-item" onclick="selectCity(${JSON.stringify(city).replace(/"/g, '&quot;')})">
            <span class="result-icon">📍</span>
            <div class="result-info">
                <span class="result-name">${city.name}</span>
                <span class="result-details">${[city.admin1, city.country].filter(Boolean).join(', ')}${city.population ? ` • Pop: ${formatNumber(city.population)}` : ''}</span>
            </div>
        </div>
    `).join('');

    searchResults.classList.remove('hidden');
}

function showSearchError(message) {
    searchResults.innerHTML = `<div class="search-result-item"><span class="result-info"><span class="result-name" style="color: #ef4444">${message}</span></span></div>`;
    searchResults.classList.remove('hidden');
}

// ==========================================
// Seleção de Cidade e Carregamento de Dados
// ==========================================
async function selectCity(city) {
    currentCity = city;
    searchResults.classList.add('hidden');
    searchInput.value = `${city.name}, ${city.country}`;

    showLoading();
    hideError();
    hideWeather();

    try {
        const weatherData = await fetchWeather(city.latitude, city.longitude);
        displayWeather(weatherData, city);

        // Carregar qualidade do ar em paralelo
        fetchAirQuality(city.latitude, city.longitude);
    } catch (err) {
        showError('Não foi possível obter os dados climáticos. Tente novamente.');
    } finally {
        hideLoading();
    }
}

async function fetchWeather(lat, lon) {
    const resp = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    const data = await resp.json();

    if (data.error) {
        throw new Error(data.error);
    }

    return data;
}

async function fetchAirQuality(lat, lon) {
    try {
        const resp = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
        const data = await resp.json();

        if (!data.error) {
            displayAirQuality(data);
        }
    } catch {
        document.getElementById('airQualityContent').innerHTML = '<p class="loading-text">Dados indisponíveis</p>';
    }
}

// ==========================================
// Exibição dos Dados Climáticos
// ==========================================
function displayWeather(data, city) {
    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;
    const isDay = current.is_day === 1;

    // Atualizar fundo baseado no horário
    document.body.classList.toggle('night-mode', !isDay);

    // Cabeçalho da cidade
    document.getElementById('cityName').textContent = `${city.name}, ${city.country}`;
    document.getElementById('cityDetails').textContent = city.admin1 ? `${city.admin1} • ${city.timezone}` : city.timezone;
    document.getElementById('localTime').textContent = `Atualizado: ${new Date().toLocaleString('pt-BR')}`;

    // Dados atuais
    const weatherInfo = getWeatherInfo(current.weather_code, isDay);
    document.getElementById('weatherIcon').textContent = weatherInfo.icon;
    document.getElementById('currentTemp').textContent = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById('weatherDescription').textContent = weatherInfo.desc;
    document.getElementById('feelsLike').textContent = `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('wind').textContent = `${current.wind_speed_10m} km/h ${getWindDirection(current.wind_direction_10m)}`;
    document.getElementById('gusts').textContent = `${current.wind_gusts_10m} km/h`;
    document.getElementById('precipitation').textContent = `${current.precipitation} mm`;
    document.getElementById('clouds').textContent = `${current.cloud_cover}%`;
    document.getElementById('pressure').textContent = `${Math.round(current.pressure_msl)} hPa`;
    document.getElementById('snow').textContent = `${current.snowfall} cm`;

    // Informações do sol
    if (daily.sunrise && daily.sunrise[0]) {
        document.getElementById('sunrise').textContent = formatTime(daily.sunrise[0]);
        document.getElementById('sunset').textContent = formatTime(daily.sunset[0]);
        document.getElementById('uvIndex').textContent = daily.uv_index_max[0].toFixed(1);
    }

    // Previsão horária
    displayHourlyForecast(hourly);

    // Previsão diária
    displayDailyForecast(daily);

    showWeather();
}

function displayHourlyForecast(hourly) {
    const container = document.getElementById('hourlyForecast');
    const now = new Date();
    const currentHour = now.getHours();

    // Encontrar o índice da hora atual
    let startIndex = 0;
    for (let i = 0; i < hourly.time.length; i++) {
        const hourDate = new Date(hourly.time[i]);
        if (hourDate >= now) {
            startIndex = i;
            break;
        }
    }

    let html = '';
    for (let i = startIndex; i < startIndex + 24 && i < hourly.time.length; i++) {
        const time = new Date(hourly.time[i]);
        const hour = time.getHours();
        const isDay = hour >= 6 && hour < 18;
        const weatherInfo = getWeatherInfo(hourly.weather_code[i], isDay);
        const rainProb = hourly.precipitation_probability[i];

        html += `
            <div class="hourly-item">
                <span class="hourly-time">${hour.toString().padStart(2, '0')}:00</span>
                <span class="hourly-icon">${weatherInfo.icon}</span>
                <span class="hourly-temp">${Math.round(hourly.temperature_2m[i])}°</span>
                ${rainProb > 0 ? `<span class="hourly-rain">💧${rainProb}%</span>` : ''}
            </div>
        `;
    }

    container.innerHTML = html;
}

function displayDailyForecast(daily) {
    const container = document.getElementById('dailyForecast');
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const fullDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    let html = '';
    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i] + 'T12:00:00');
        const dayName = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : fullDays[date.getDay()];
        const weatherInfo = getWeatherInfo(daily.weather_code[i], true);

        html += `
            <div class="daily-item">
                <span class="daily-day">${dayName}</span>
                <span class="daily-icon">${weatherInfo.icon}</span>
                <div class="daily-details">
                    <span class="daily-detail-item">💧 ${daily.precipitation_sum[i]}mm</span>
                    <span class="daily-detail-item">💨 ${Math.round(daily.wind_speed_10m_max[i])}km/h</span>
                    ${daily.snowfall_sum[i] > 0 ? `<span class="daily-detail-item">❄️ ${daily.snowfall_sum[i]}cm</span>` : ''}
                    <span class="daily-detail-item">☔ ${daily.precipitation_probability_max[i]}%</span>
                </div>
                <div class="daily-temps">
                    <span class="daily-max">${Math.round(daily.temperature_2m_max[i])}°</span>
                    <span class="daily-min">${Math.round(daily.temperature_2m_min[i])}°</span>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function displayAirQuality(data) {
    const container = document.getElementById('airQualityContent');
    const current = data.current;

    if (!current) {
        container.innerHTML = '<p class="loading-text">Dados indisponíveis</p>';
        return;
    }

    const aqi = current.european_aqi;
    const aqiClass = getAqiClass(aqi);
    const aqiText = getAqiText(aqi);

    container.innerHTML = `
        <div class="aqi-item">
            <span class="aqi-value ${aqiClass}">${aqi || '--'}</span>
            <span class="aqi-label">AQI (${aqiText})</span>
        </div>
        <div class="aqi-item">
            <span class="aqi-value">${current.pm2_5 !== null ? current.pm2_5.toFixed(1) : '--'}</span>
            <span class="aqi-label">PM2.5 (µg/m³)</span>
        </div>
        <div class="aqi-item">
            <span class="aqi-value">${current.pm10 !== null ? current.pm10.toFixed(1) : '--'}</span>
            <span class="aqi-label">PM10 (µg/m³)</span>
        </div>
        <div class="aqi-item">
            <span class="aqi-value">${current.ozone !== null ? current.ozone.toFixed(0) : '--'}</span>
            <span class="aqi-label">Ozônio (µg/m³)</span>
        </div>
        <div class="aqi-item">
            <span class="aqi-value">${current.nitrogen_dioxide !== null ? current.nitrogen_dioxide.toFixed(1) : '--'}</span>
            <span class="aqi-label">NO₂ (µg/m³)</span>
        </div>
        <div class="aqi-item">
            <span class="aqi-value">${current.uv_index !== null ? current.uv_index.toFixed(1) : '--'}</span>
            <span class="aqi-label">Índice UV</span>
        </div>
    `;
}

// ==========================================
// Funções Auxiliares
// ==========================================
function getWeatherInfo(code, isDay) {
    const info = weatherCodes[code] || { icon: '🌡️', iconNight: '🌡️', desc: 'Desconhecido' };
    return {
        icon: isDay ? info.icon : info.iconNight,
        desc: info.desc
    };
}

function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
}

function getAqiClass(aqi) {
    if (!aqi) return '';
    if (aqi <= 20) return 'aqi-good';
    if (aqi <= 40) return 'aqi-moderate';
    if (aqi <= 60) return 'aqi-poor';
    if (aqi <= 80) return 'aqi-bad';
    return 'aqi-very-bad';
}

function getAqiText(aqi) {
    if (!aqi) return 'N/A';
    if (aqi <= 20) return 'Bom';
    if (aqi <= 40) return 'Razoável';
    if (aqi <= 60) return 'Moderado';
    if (aqi <= 80) return 'Ruim';
    return 'Muito Ruim';
}

// ==========================================
// Controle de UI
// ==========================================
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showWeather() {
    weatherContent.classList.remove('hidden');
}

function hideWeather() {
    weatherContent.classList.add('hidden');
}

// Tornar selectCity global para os event handlers inline
window.selectCity = selectCity;
