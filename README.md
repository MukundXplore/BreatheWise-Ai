<p align="center">
  <h1 align="center">🌬️ BreatheWise AI</h1>
  <p align="center">
    <strong>AI-Powered Respiratory Health Companion for Delhi</strong>
  </p>
  <p align="center">
    Real-time AQI monitoring · Personalized health risk assessments · RAG-powered medical recommendations
  </p>
  <p align="center">
    <em>Built for the GDG Build with AI Hackathon 2026</em>
  </p>
</p>

---

## 🎯 What is BreatheWise AI?

BreatheWise AI is an intelligent respiratory health assistant designed for Delhi's pollution challenges. It combines **real-time air quality data**, **Elasticsearch-powered medical knowledge retrieval (RAG)**, and **Google Gemini AI** to deliver personalized health risk assessments and actionable safety recommendations for users with conditions like Asthma, COPD, and Bronchitis.

### ✨ Key Features

| Feature | Description |
|---|---|
| **Live AQI Dashboard** | Real-time Air Quality Index with PM2.5, PM10, temperature, humidity, and wind data for 9+ Delhi locations |
| **AI Health Risk Assessment** | Personalized risk scoring (Low / Medium / High) based on age, condition, symptoms, and current AQI |
| **RAG Knowledge Engine** | Elasticsearch-backed retrieval of medical guidelines from WHO, CPCB, GOLD, and Indian Chest Society |
| **RAG Knowledge Chat** | Conversational AI grounded in retrieved medical documents for follow-up Q&A |
| **AI Chat Assistant** | General-purpose respiratory health chatbot powered by Gemini |
| **Hospital Finder** | Distance-sorted list of 10 real Delhi hospitals with Google Maps deep links |
| **SOS & Emergency Panel** | One-tap access to CATS Ambulance (102), Delhi Police, National Ambulance (108), and DPCC helpline |
| **7-Day AQI Trend Chart** | Visual AQI trend graph for the selected Delhi location |
| **Bilingual UI** | Full English and Hindi language support |
| **Graceful Fallbacks** | Works fully offline — in-memory Elastic fallback + mock AI engine when API keys are absent |

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│         React Frontend          │
│   (Vite + JSX · Port 5173)     │
│                                 │
│  Health Form → Risk Dashboard   │
│  Knowledge Library → RAG Chat   │
│  AQI Widget → Hospital Finder   │
│  SOS Panel → Trend Chart        │
└──────────────┬──────────────────┘
               │  REST API (JSON)
               ▼
┌─────────────────────────────────┐
│         Flask Backend           │
│      (Python · Port 8000)       │
│                                 │
│  main.py ─── API Endpoints      │
│  ai_service.py ─── Gemini AI    │
│  elastic_service.py ─── RAG     │
└──────┬──────────────┬───────────┘
       │              │
       ▼              ▼
┌──────────────┐  ┌──────────────────┐
│ Elasticsearch│  │  Gemini API      │
│ (Cloud/Local)│  │  (Flash Lite)    │
│              │  │                  │
│ 3 Indexes:   │  │  Health Assess.  │
│ • health_    │  │  Knowledge Chat  │
│   guidelines │  │  General Chat    │
│ • respiratory│  │                  │
│   _guidelines│  └──────────────────┘
│ • aqi_data   │
└──────────────┘
       ▲
       │
┌──────────────┐
│ AQI Data APIs│
│ • Open-Meteo │
│ • WAQI       │
│ • OpenWeather│
└──────────────┘
```

---

## 📁 Project Structure

```
GDG-build-with-AI/
├── backend/
│   ├── app/
│   │   ├── __init__.py             # Package initializer
│   │   ├── main.py                 # Flask server, API endpoints, AQI fetching, hospital finder
│   │   ├── ai_service.py           # Gemini REST client + deterministic mock AI fallback
│   │   └── elastic_service.py      # Elasticsearch client + in-memory fallback search engine
│   ├── .env                        # Environment variables (API keys — not committed)
│   └── requirements.txt            # Python dependencies
│
├── elastic/
│   ├── seed_data.json              # 16 curated medical guidelines (WHO, CPCB, GOLD, etc.)
│   └── index_setup.py              # Script to create and populate Elasticsearch indexes
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                # React entry point
│   │   ├── App.jsx                 # Full application (health form, dashboard, chat, SOS)
│   │   ├── App.css                 # Complete styling (dark theme, glassmorphism, animations)
│   │   └── index.css               # Base CSS resets and fonts
│   ├── index.html                  # HTML shell
│   ├── package.json                # Node dependencies (React 18, Vite)
│   └── vite.config.js              # Vite configuration
│
├── run_servers.ps1                 # PowerShell helper to launch both servers
├── .gitignore
├── REMAINING_TASKS.md              # Roadmap of enhancement ideas
└── README.md                       # ← You are here
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** with `pip`
- **Node.js 18+** with `npm`
- _(Optional)_ A [Gemini API key](https://aistudio.google.com/app/apikey) for AI-powered assessments
- _(Optional)_ Elasticsearch Cloud or local instance for full RAG

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/GDG-build-with-AI.git
cd GDG-build-with-AI
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `backend/.env` file:

```env
# Required for AI-powered assessments (optional — mock engine works without it)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional — Elasticsearch Cloud connection
ELASTIC_CLOUD_ID=your_elastic_cloud_id
ELASTIC_API_KEY=your_elastic_api_key

# Optional — Live AQI feeds
WAQI_TOKEN=your_waqi_token
OPENWEATHER_API_KEY=your_openweather_key
```

> **💡 No API keys?** The app works fully without any keys — it uses an in-memory search engine with 16 pre-loaded medical guidelines and a deterministic mock AI engine for health assessments.

### 4. Frontend Setup

```bash
cd frontend
npm install
```

### 5. Start Both Servers

**Option A — PowerShell helper script (Windows):**

```powershell
.\run_servers.ps1
```

**Option B — Manual (two terminals):**

```bash
# Terminal 1 — Backend (Flask on port 8000)
cd backend
.venv\Scripts\activate
python -m flask --app app.main run --port 8000 --debug

# Terminal 2 — Frontend (React/Vite on port 5173)
cd frontend
npm run dev
```

### 6. Open the App

Navigate to **http://localhost:5173** in your browser.

---

## 🔌 API Reference

The Flask backend exposes the following REST endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check — returns backend status, Elastic connection state, and Gemini availability |
| `GET` | `/api/aqi?location=Dwarka` | Fetches live AQI, weather data, and nearby hospitals for a Delhi location |
| `POST` | `/api/assess` | Generates a personalized health risk assessment using RAG + AI |
| `POST` | `/api/search` | Queries the Elasticsearch knowledge base directly |
| `POST` | `/api/chat` | General-purpose AI chat for respiratory health questions |
| `POST` | `/api/knowledge-chat` | RAG-grounded conversational AI (Elastic retrieves → Gemini answers) |

### Example: Health Assessment Request

```bash
curl -X POST http://localhost:8000/api/assess \
  -H "Content-Type: application/json" \
  -d '{
    "age": 45,
    "condition": "Asthma",
    "symptoms": ["Wheezing", "Cough"],
    "location": "Dwarka"
  }'
```

### Example Response

```json
{
  "risk": "High",
  "reason": "At an AQI of 320 (Dangerous range), your respiratory risk is High...",
  "recommendations": [
    "Avoid all outdoor physical activity.",
    "Keep emergency inhalers within reach.",
    "Use a high-quality air purifier with HEPA filtration.",
    "Wear an N95 respirator mask if outdoor travel is unavoidable."
  ],
  "hospital": "Venkateshwar Hospital, Dwarka",
  "doctor": "Consultant Pulmonologist",
  "aqi": 320,
  "pm2_5": 192.0,
  "pm10": 352.0,
  "weather": { "temp": 34, "humidity": 55, "wind": 8.2, "weather_desc": "Haze" },
  "nearby_hospitals": [...]
}
```

---

## ⚙️ Elasticsearch Setup (Optional)

If you have Elasticsearch credentials, you can enable full RAG retrieval:

```bash
cd backend
.venv\Scripts\activate
python ..\elastic\index_setup.py
```

This creates three indexes (`health_guidelines`, `respiratory_guidelines`, `aqi_data`) and seeds them with 16 curated medical documents covering Asthma, COPD, Bronchitis, Diabetes co-morbidity, GRAP emergency protocols, and general AQI advisories.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Vanilla CSS (dark glassmorphism theme) |
| **Backend** | Python, Flask 3.0 |
| **AI Engine** | Google Gemini Flash Lite (REST API) |
| **Search / RAG** | Elasticsearch 8.14 with in-memory fallback |
| **AQI Data** | Open-Meteo Air Quality API, WAQI API, OpenWeather API |
| **Weather Data** | Open-Meteo Forecast API |
| **Language Support** | English, Hindi (हिंदी) |

---

## 🏥 Delhi Hospitals Database

The backend includes a curated database of 10 real Delhi hospitals with GPS coordinates for distance-sorted proximity matching:

| Hospital | Specialist |
|---|---|
| AIIMS New Delhi | Senior Pulmonologist & Critical Care |
| Safdarjung Hospital | Senior Pulmonologist |
| Max Super Speciality, Saket | Consultant Pulmonologist |
| Fortis Escorts, Okhla | Consultant Pulmonologist |
| Dr. Ram Manohar Lohia Hospital | Senior Pulmonologist |
| Sir Ganga Ram Hospital | Senior Pulmonologist & Asthma Care |
| Indraprastha Apollo, Jasola | Consultant Pulmonologist |
| Lok Nayak Hospital (LNJP) | General Physician |
| Dharamshila Narayana Hospital | Consultant Pulmonologist |
| Venkateshwar Hospital, Dwarka | Consultant Pulmonologist |

---

## 📍 Supported Delhi Locations

Delhi (General) · Dwarka · Connaught Place · Okhla · Anand Vihar · Delhi University · Rohini · Noida · Gurugram

---

## 📄 License

This project was built for the **GDG Build with AI Hackathon 2026**.
