"""
Weather App - Backend Flask
Aplicação de clima mundial usando Open-Meteo API (gratuita, sem chave necessária)
"""

from flask import Flask, jsonify, request, send_from_directory
import requests
import os
import urllib3

# Desabilitar avisos de SSL em ambientes com certificados problemáticos
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__, static_folder='static', static_url_path='')

# Verificar SSL: desabilitar se houver problemas no ambiente local
VERIFY_SSL = os.environ.get('VERIFY_SSL', 'false').lower() == 'true'


@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/api/search')
def search_cities():
    """Busca cidades pelo nome usando Open-Meteo Geocoding API"""
    query = request.args.get('q', '').strip()
    if not query or len(query) < 2:
        return jsonify({'results': []})

    try:
        resp = requests.get(
            'https://geocoding-api.open-meteo.com/v1/search',
            params={
                'name': query,
                'count': 10,
                'language': 'pt',
                'format': 'json'
            },
            timeout=10,
            verify=VERIFY_SSL
        )
        resp.raise_for_status()
        data = resp.json()

        results = []
        for item in data.get('results', []):
            results.append({
                'id': item.get('id'),
                'name': item.get('name'),
                'country': item.get('country', ''),
                'admin1': item.get('admin1', ''),
                'latitude': item.get('latitude'),
                'longitude': item.get('longitude'),
                'timezone': item.get('timezone', ''),
                'population': item.get('population', 0),
            })

        return jsonify({'results': results})

    except requests.RequestException as e:
        return jsonify({'error': f'Erro ao buscar cidades: {str(e)}'}), 500


@app.route('/api/weather')
def get_weather():
    """Obtém dados climáticos completos para uma localização"""
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if not lat or not lon:
        return jsonify({'error': 'Parâmetros lat e lon são obrigatórios'}), 400

    try:
        lat = float(lat)
        lon = float(lon)
    except ValueError:
        return jsonify({'error': 'Coordenadas inválidas'}), 400

    try:
        # Dados atuais + previsão horária + previsão diária
        resp = requests.get(
            'https://api.open-meteo.com/v1/forecast',
            params={
                'latitude': lat,
                'longitude': lon,
                'current': ','.join([
                    'temperature_2m',
                    'relative_humidity_2m',
                    'apparent_temperature',
                    'is_day',
                    'precipitation',
                    'rain',
                    'showers',
                    'snowfall',
                    'weather_code',
                    'cloud_cover',
                    'pressure_msl',
                    'surface_pressure',
                    'wind_speed_10m',
                    'wind_direction_10m',
                    'wind_gusts_10m',
                ]),
                'hourly': ','.join([
                    'temperature_2m',
                    'relative_humidity_2m',
                    'precipitation_probability',
                    'precipitation',
                    'rain',
                    'snowfall',
                    'weather_code',
                    'wind_speed_10m',
                    'wind_direction_10m',
                ]),
                'daily': ','.join([
                    'weather_code',
                    'temperature_2m_max',
                    'temperature_2m_min',
                    'apparent_temperature_max',
                    'apparent_temperature_min',
                    'sunrise',
                    'sunset',
                    'uv_index_max',
                    'precipitation_sum',
                    'rain_sum',
                    'showers_sum',
                    'snowfall_sum',
                    'precipitation_hours',
                    'precipitation_probability_max',
                    'wind_speed_10m_max',
                    'wind_gusts_10m_max',
                    'wind_direction_10m_dominant',
                ]),
                'timezone': 'auto',
                'forecast_days': 7,
            },
            timeout=15,
            verify=VERIFY_SSL
        )
        resp.raise_for_status()
        data = resp.json()

        return jsonify(data)

    except requests.RequestException as e:
        return jsonify({'error': f'Erro ao obter dados climáticos: {str(e)}'}), 500


@app.route('/api/air-quality')
def get_air_quality():
    """Obtém dados de qualidade do ar"""
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if not lat or not lon:
        return jsonify({'error': 'Parâmetros lat e lon são obrigatórios'}), 400

    try:
        resp = requests.get(
            'https://air-quality-api.open-meteo.com/v1/air-quality',
            params={
                'latitude': float(lat),
                'longitude': float(lon),
                'current': ','.join([
                    'pm10',
                    'pm2_5',
                    'carbon_monoxide',
                    'nitrogen_dioxide',
                    'ozone',
                    'uv_index',
                    'european_aqi',
                ]),
                'timezone': 'auto',
            },
            timeout=10,
            verify=VERIFY_SSL
        )
        resp.raise_for_status()
        data = resp.json()
        return jsonify(data)

    except requests.RequestException as e:
        return jsonify({'error': f'Erro ao obter qualidade do ar: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
