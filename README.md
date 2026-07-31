# 🌍 Clima Mundial - Previsão do Tempo Global

Aplicação web completa para consulta de condições climáticas em tempo real de qualquer cidade do mundo.

**🔗 Acesse o site:** [https://climamundial.onrender.com](https://climamundial.onrender.com)

---

## 📸 Visão Geral

O Clima Mundial permite buscar qualquer cidade do planeta e visualizar dados meteorológicos detalhados, incluindo temperatura, chuva, neve, vento, qualidade do ar e previsões para os próximos 7 dias.

---

## ✨ Funcionalidades

| Recurso | Descrição |
|---------|-----------|
| 🔍 Busca inteligente | Autocompletar com cidades de todo o mundo |
| 🌡️ Temperatura atual | Temperatura real e sensação térmica |
| 🌧️ Precipitação | Dados de chuva, garoa e pancadas |
| ❄️ Neve | Quantidade de queda de neve em cm |
| 💨 Vento | Velocidade, direção e rajadas |
| 💧 Umidade | Umidade relativa do ar |
| ☁️ Nuvens | Cobertura de nuvens em porcentagem |
| 📊 Pressão | Pressão atmosférica ao nível do mar |
| 🌬️ Qualidade do ar | PM2.5, PM10, NO₂, Ozônio e índice AQI |
| ⏰ Previsão horária | Próximas 24 horas com probabilidade de chuva |
| 📅 Previsão 7 dias | Temperaturas máx/mín, vento e precipitação |
| ☀️ Sol | Nascer e pôr do sol, índice UV máximo |
| 🌙 Modo noturno | Adaptação automática baseada no horário local |
| 📱 Responsivo | Funciona em desktop, tablet e celular |

---

## 🛠️ Tecnologias Utilizadas

- **Backend:** Python 3.10 + Flask
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **API de Clima:** [Open-Meteo](https://open-meteo.com/) (gratuita, sem chave)
- **API de Geocoding:** [Open-Meteo Geocoding](https://geocoding-api.open-meteo.com/)
- **API de Qualidade do Ar:** [Open-Meteo Air Quality](https://air-quality-api.open-meteo.com/)
- **Deploy:** [Render](https://render.com/)
- **Servidor WSGI:** Gunicorn

---

## 📁 Estrutura do Projeto

```
weather_app/
├── app.py              # Backend Flask (API endpoints)
├── requirements.txt    # Dependências Python
├── Procfile            # Configuração para deploy
├── render.yaml         # Configuração do Render
├── .gitignore          # Arquivos ignorados pelo Git
└── static/
    ├── index.html      # Página principal
    ├── styles.css      # Estilos (responsivo)
    └── app.js          # Lógica do frontend
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Python 3.10+
- pip

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/monica1602/climamundial.git
cd climamundial

# Instalar dependências
pip install -r requirements.txt

# Rodar o servidor
python app.py
```

Acesse http://localhost:5000 no navegador.

---

## 🌐 Deploy no Render

O site está hospedado no **Render** com deploy automático a cada push no GitHub.

**URL de produção:** https://climamundial.onrender.com

### Configuração do Render

| Configuração | Valor |
|-------------|-------|
| Runtime | Python |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app` |
| Branch | `main` |
| Plano | Free |

> ⚠️ No plano gratuito do Render, o serviço entra em hibernação após 15 minutos de inatividade. A primeira requisição pode levar alguns segundos a mais para responder.

---

## 📡 Endpoints da API

| Método | Endpoint | Descrição | Parâmetros |
|--------|----------|-----------|------------|
| GET | `/api/search` | Busca cidades | `q` (nome da cidade) |
| GET | `/api/weather` | Dados climáticos completos | `lat`, `lon` |
| GET | `/api/air-quality` | Qualidade do ar | `lat`, `lon` |

### Exemplo de uso

```bash
# Buscar cidades
curl "https://climamundial.onrender.com/api/search?q=São Paulo"

# Obter clima (São Paulo)
curl "https://climamundial.onrender.com/api/weather?lat=-23.55&lon=-46.63"

# Qualidade do ar
curl "https://climamundial.onrender.com/api/air-quality?lat=-23.55&lon=-46.63"
```

---

## 📊 Dados Disponíveis

### Clima Atual
- Temperatura e sensação térmica (°C)
- Umidade relativa (%)
- Velocidade e direção do vento (km/h)
- Rajadas de vento (km/h)
- Precipitação total (mm)
- Queda de neve (cm)
- Cobertura de nuvens (%)
- Pressão atmosférica (hPa)
- Código WMO do clima

### Qualidade do Ar
- PM2.5 e PM10 (µg/m³)
- Dióxido de Nitrogênio - NO₂ (µg/m³)
- Ozônio - O₃ (µg/m³)
- Monóxido de Carbono (µg/m³)
- Índice UV
- European AQI (índice de qualidade)

### Previsão 7 Dias
- Temperaturas máxima e mínima
- Precipitação acumulada e probabilidade
- Neve acumulada
- Velocidade máxima do vento e rajadas
- Nascer e pôr do sol
- Índice UV máximo

---

## 🙏 Créditos

- Dados meteorológicos: [Open-Meteo](https://open-meteo.com/) - API aberta e gratuita
- Hospedagem: [Render](https://render.com/)

---

## 📄 Licença

Este projeto é de uso livre para fins educacionais e pessoais.
