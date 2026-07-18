# BreatheWise AI

AI-powered Respiratory Health Companion for Delhi. BreatheWise AI provides real-time AQI awareness, personalized health risk assessments, and elastic-retrieved healthcare recommendations for users with respiratory conditions like Asthma or COPD.

## Folder Structure

```
BreatheWise/
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI Server & Endpoints
│   │   ├── elastic_service.py  # Elastic search and fallback engine
│   │   └── ai_service.py       # Gemini API client and fallback engine
│   ├── .env                    # Environment variables
│   └── requirements.txt        # Backend dependencies
├── elastic/
│   ├── seed_data.json          # Medical advice and respiratory guidelines
│   └── index_setup.py          # Script to create/populate Elasticsearch indexes
└── frontend/                   # React web dashboard
```

## Quick Start

### 1. Backend Setup
Navigate to the `backend/` directory:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend Setup
Navigate to the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
