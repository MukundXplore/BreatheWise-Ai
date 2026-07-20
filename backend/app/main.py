import os
import random
import requests
import math
from flask import Flask, request, jsonify, abort
from dotenv import load_dotenv

# Compute absolute path to .env file in the backend root
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv(dotenv_path=env_path)

from app.elastic_service import ElasticService
from app.ai_service import AIService

app = Flask(__name__)

# Simple manual CORS handling to avoid installing external dependencies
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Handle preflight OPTIONS requests automatically
@app.route('/api/assess', methods=['OPTIONS'])
@app.route('/api/search', methods=['OPTIONS'])
@app.route('/api/aqi', methods=['OPTIONS'])
def options_handler():
    return '', 200

# Initialize Services
elastic_service = ElasticService()
ai_service = AIService()

DELHI_LOCATIONS = {
    "delhi": {"lat": 28.6139, "lon": 77.2090, "name": "Delhi (General)"},
    "dwarka": {"lat": 28.5833, "lon": 77.0667, "name": "Dwarka"},
    "connaught place": {"lat": 28.6304, "lon": 77.2177, "name": "Connaught Place"},
    "cp": {"lat": 28.6304, "lon": 77.2177, "name": "Connaught Place"},
    "okhla": {"lat": 28.5355, "lon": 77.2750, "name": "Okhla"},
    "anand vihar": {"lat": 28.6476, "lon": 77.3149, "name": "Anand Vihar"},
    "delhi university": {"lat": 28.6904, "lon": 77.2120, "name": "Delhi University"},
    "rohini": {"lat": 28.7041, "lon": 77.1025, "name": "Rohini"},
    "noida": {"lat": 28.5355, "lon": 77.3910, "name": "Noida"},
    "gurugram": {"lat": 28.4595, "lon": 77.0266, "name": "Gurugram"}
}

HOSPITALS_DB = [
    {"name": "AIIMS New Delhi", "lat": 28.5672, "lon": 77.2100, "doctor": "Senior Pulmonologist & Critical Care Specialist", "address": "Ansari Nagar, New Delhi"},
    {"name": "Safdarjung Hospital", "lat": 28.5678, "lon": 77.2057, "doctor": "Senior Pulmonologist", "address": "Safdarjung Tomb Area, New Delhi"},
    {"name": "Max Super Speciality Hospital, Saket", "lat": 28.5283, "lon": 77.2198, "doctor": "Consultant Pulmonologist", "address": "Press Enclave Road, Saket, New Delhi"},
    {"name": "Fortis Escorts Heart Institute, Okhla", "lat": 28.5583, "lon": 77.2831, "doctor": "Consultant Pulmonologist / Physician", "address": "Okhla Road, New Delhi"},
    {"name": "Dr. Ram Manohar Lohia Hospital (RML)", "lat": 28.6258, "lon": 77.2008, "doctor": "Senior Pulmonologist", "address": "Baba Kharak Singh Marg, New Delhi"},
    {"name": "Sir Ganga Ram Hospital", "lat": 28.6384, "lon": 77.1897, "doctor": "Senior Pulmonologist & Asthma Care", "address": "Rajinder Nagar, New Delhi"},
    {"name": "Indraprastha Apollo Hospital, Jasola", "lat": 28.5367, "lon": 77.2917, "doctor": "Consultant Pulmonologist", "address": "Mathura Road, Jasola, New Delhi"},
    {"name": "Lok Nayak Jai Prakash Hospital (LNJP)", "lat": 28.6358, "lon": 77.2422, "doctor": "General Physician", "address": "Jawaharlal Nehru Marg, New Delhi"},
    {"name": "Dharamshila Narayana Superspeciality Hospital", "lat": 28.6015, "lon": 77.3235, "doctor": "Consultant Pulmonologist", "address": "Vasundhara Enclave, New Delhi"},
    {"name": "Venkateshwar Hospital, Dwarka", "lat": 28.5888, "lon": 77.0396, "doctor": "Consultant Pulmonologist", "address": "Sector 18, Dwarka, New Delhi"}
]

WMO_WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
}

def calculate_distance(lat1, lon1, lat2, lon2) -> float:
    """Calculates distance between two lat/lon points in kilometers using Haversine formula."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

def get_closest_hospitals(location_str: str) -> list:
    """Finds hospitals sorted by distance. Filters to 5-7km if any are available, else returns the sorted list."""
    clean_loc = (location_str or "").lower()
    
    # Get coordinates of selected location
    user_lat, user_lon = 28.6139, 77.2090
    for key, coords in DELHI_LOCATIONS.items():
        if key in clean_loc:
            user_lat, user_lon = coords["lat"], coords["lon"]
            break
            
    # Calculate distance for all
    hospitals_with_dist = []
    for h in HOSPITALS_DB:
        dist = calculate_distance(user_lat, user_lon, h["lat"], h["lon"])
        hospitals_with_dist.append({
            "name": h["name"],
            "lat": h["lat"],
            "lon": h["lon"],
            "doctor": h["doctor"],
            "address": h["address"],
            "distance_km": dist
        })
        
    # Sort by distance
    hospitals_with_dist.sort(key=lambda x: x["distance_km"])
    
    # Filter within user radius (7km)
    within_radius = [h for h in hospitals_with_dist if h["distance_km"] <= 7.0]
    
    # If we have hospitals within 7km, return those, else return all sorted
    return within_radius if within_radius else hospitals_with_dist

def fetch_waqi_aqi(location: str, token: str) -> int:
    """Fetches current AQI from WAQI API."""
    try:
        url = f"https://api.waqi.info/feed/{location}/?token={token}"
        res = requests.get(url, timeout=3)
        if res.status_code == 200:
            data = res.json()
            if data.get("status") == "ok":
                aqi = data.get("data", {}).get("aqi")
                if isinstance(aqi, int):
                    return aqi
    except Exception as e:
        print(f"WAQI fetch failed: {e}")
    return None

def fetch_openweather_aqi(lat: float, lon: float, api_key: str) -> dict:
    """Fetches current air pollution data from OpenWeather API and maps to US AQI scale."""
    try:
        url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={api_key}"
        res = requests.get(url, timeout=3)
        if res.status_code == 200:
            data = res.json()
            list_data = data.get("list", [])
            if list_data:
                components = list_data[0].get("components", {})
                pm2_5 = components.get("pm2_5", 0.0)
                pm10 = components.get("pm10", 0.0)
                
                # Standard PM2.5 to US AQI mapping (approximate formula)
                if pm2_5 <= 12.0:
                    aqi = (50 / 12.0) * pm2_5
                elif pm2_5 <= 35.4:
                    aqi = 50 + (50 / (35.4 - 12.0)) * (pm2_5 - 12.0)
                elif pm2_5 <= 55.4:
                    aqi = 100 + (50 / (55.4 - 35.4)) * (pm2_5 - 35.4)
                elif pm2_5 <= 150.4:
                    aqi = 150 + (50 / (150.4 - 55.4)) * (pm2_5 - 55.4)
                elif pm2_5 <= 250.4:
                    aqi = 200 + (100 / (250.4 - 150.4)) * (pm2_5 - 150.4)
                else:
                    aqi = 300 + (200 / (500.4 - 250.4)) * (pm2_5 - 250.4)
                
                return {
                    "aqi": int(min(500, max(0, aqi))),
                    "pm2_5": pm2_5,
                    "pm10": pm10
                }
    except Exception as e:
        print(f"OpenWeather fetch failed: {e}")
    return None

def fetch_delhi_weather_and_aqi(location: str) -> dict:
    """
    Attempts to fetch Delhi live AQI and Weather.
    First tries WAQI or OpenWeather if keys are set, otherwise falls back to Open-Meteo.
    If all fails, generates simulated values.
    """
    clean_loc = (location or "").lower()
    
    # Default coordinates for general Delhi
    lat, lon = 28.6139, 77.2090
    matched_key = "delhi"
    
    for key, coords in DELHI_LOCATIONS.items():
        if key in clean_loc:
            lat, lon = coords["lat"], coords["lon"]
            matched_key = key
            break
            
    # Try fetching from WAQI or OpenWeather first
    waqi_token = os.getenv("WAQI_TOKEN")
    openweather_key = os.getenv("OPENWEATHER_API_KEY")
    
    live_aqi = None
    pm2_5 = 0.0
    pm10 = 0.0
    historical_trend = None
    
    if waqi_token:
        # Try WAQI
        waqi_aqi = fetch_waqi_aqi(matched_key, waqi_token)
        if waqi_aqi is not None:
            live_aqi = waqi_aqi
            pm2_5 = round(live_aqi * 0.6, 1)
            pm10 = round(live_aqi * 1.1, 1)
            print("Successfully fetched AQI from WAQI API.")
            
    if live_aqi is None and openweather_key:
        # Try OpenWeather
        ow_data = fetch_openweather_aqi(lat, lon, openweather_key)
        if ow_data:
            live_aqi = ow_data["aqi"]
            pm2_5 = ow_data["pm2_5"]
            pm10 = ow_data["pm10"]
            print("Successfully fetched AQI from OpenWeather Air Pollution API.")

    # Try fetching weather (and AQI if not already fetched) from Open-Meteo
    weather_info = None
    try:
        # Fetch weather
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia/Kolkata"
        weather_res = requests.get(weather_url, timeout=3)
        if weather_res.status_code == 200:
            w_data = weather_res.json().get("current", {})
            w_code = w_data.get("weather_code", 0)
            weather_desc = WMO_WEATHER_CODES.get(w_code, "Unknown")
            weather_info = {
                "temp": w_data.get("temperature_2m"),
                "humidity": w_data.get("relative_humidity_2m"),
                "wind": w_data.get("wind_speed_10m"),
                "weather_desc": weather_desc,
                "weather_code": w_code
            }
    except Exception as e:
        print(f"Open-Meteo weather fetch failed: {e}.")

    try:
        # Always fetch Open-Meteo AQI to get historical trend
        aqi_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=us_aqi,pm2_5,pm10&hourly=us_aqi&past_days=6&timezone=Asia/Kolkata"
        aqi_res = requests.get(aqi_url, timeout=3)
        if aqi_res.status_code == 200:
            a_data = aqi_res.json()
            
            # If live AQI is not provided by previous APIs, use this
            if live_aqi is None:
                current_data = a_data.get("current", {})
                live_aqi = int(current_data.get("us_aqi", random.randint(150, 350)))
                pm2_5 = current_data.get("pm2_5", 0.0)
                pm10 = current_data.get("pm10", 0.0)
                print("Successfully fetched AQI from Open-Meteo Air Quality API.")
                
            # Extract historical trend
            hourly_aqi = a_data.get("hourly", {}).get("us_aqi", [])
            if hourly_aqi:
                trend_list = []
                for i in range(0, len(hourly_aqi), 24):
                    chunk = hourly_aqi[i:i+24]
                    valid_chunk = [x for x in chunk if x is not None]
                    if valid_chunk:
                        trend_list.append(round(sum(valid_chunk) / len(valid_chunk)))
                historical_trend = trend_list[:7]
    except Exception as e:
        print(f"Open-Meteo weather/aqi fetch failed: {e}.")

    # Assemble response
    if live_aqi is not None and weather_info is not None:
        return {
            "aqi": live_aqi,
            "pm2_5": pm2_5,
            "pm10": pm10,
            "weather": weather_info,
            "trend": historical_trend
        }

    # Simulation fallback (if everything fails)
    print("Falling back to full location-based simulation.")
    hotspots = {
        "dwarka": (280, 390),
        "okhla": (290, 410),
        "connaught place": (150, 240),
        "cp": (150, 240),
        "anand vihar": (350, 480),
        "delhi university": (180, 290),
        "rohini": (260, 370),
        "noida": (240, 350),
        "gurugram": (220, 340)
    }
    
    aqi_range = hotspots.get(matched_key, (280, 360))
    simulated_aqi = random.randint(*aqi_range)
    
    simulated_temp = random.randint(18, 42) if "delhi" in clean_loc else 25
    simulated_humidity = random.randint(30, 85)
    simulated_wind = round(random.uniform(2.0, 15.0), 1)
    
    return {
        "aqi": simulated_aqi,
        "pm2_5": round(simulated_aqi * 0.6, 1),
        "pm10": round(simulated_aqi * 1.1, 1),
        "weather": {
            "temp": simulated_temp,
            "humidity": simulated_humidity,
            "wind": simulated_wind,
            "weather_desc": "Haze (Simulated)",
            "weather_code": 45
        },
        "trend": None
    }

@app.route("/", methods=["GET"])
def read_root():
    return jsonify({
        "app": "BreatheWise AI Backend (Flask)",
        "status": "active",
        "elastic_connected": elastic_service.is_connected,
        "gemini_active": ai_service.is_active
    })

@app.route("/api/aqi", methods=["GET"])
def get_aqi():
    location = request.args.get("location", "Delhi")
    data = fetch_delhi_weather_and_aqi(location)
    category = elastic_service.map_aqi_score(data["aqi"])
    closest_hospitals = get_closest_hospitals(location)
    
    return jsonify({
        "location": location,
        "aqi": data["aqi"],
        "category": category,
        "pm2_5": data["pm2_5"],
        "pm10": data["pm10"],
        "weather": data["weather"],
        "trend": data.get("trend"),
        "nearby_hospitals": closest_hospitals
    })

@app.route("/api/search", methods=["POST"])
def search_knowledge():
    payload = request.json or {}
    query = payload.get("query")
    condition = payload.get("condition")
    symptoms = payload.get("symptoms")
    aqi_score = payload.get("aqi_score")
    
    results = elastic_service.search_guidelines(
        condition=condition,
        symptoms=symptoms,
        aqi_score=aqi_score,
        text_query=query
    )
    return jsonify(results)

@app.route("/api/assess", methods=["POST"])
def assess_respiratory_health():
    payload = request.json or {}
    age = payload.get("age")
    condition = payload.get("condition")
    symptoms = payload.get("symptoms", [])
    location = payload.get("location", "Delhi")
    
    if age is None or condition is None:
        abort(400, description="Missing age or condition parameters")

    try:
        # 1. Fetch current weather and AQI for location
        data = fetch_delhi_weather_and_aqi(location)
        current_aqi = data["aqi"]
        
        # 2. Retrieve guidelines from Elasticsearch (RAG)
        guidelines = elastic_service.search_guidelines(
            condition=condition,
            symptoms=symptoms,
            aqi_score=current_aqi
        )
        
        # 3. Call AI reasoning engine to generate personalized assessment
        profile_dict = {
            "age": int(age),
            "condition": condition,
            "symptoms": symptoms,
            "location": location
        }
        
        assessment = ai_service.generate_assessment(
            profile=profile_dict,
            guidelines=guidelines,
            current_aqi=current_aqi
        )
        
        closest_hospitals = get_closest_hospitals(location)
        primary_hospital = closest_hospitals[0]["name"] if closest_hospitals else "General Hospital"
        primary_doctor = closest_hospitals[0]["doctor"] if closest_hospitals else "General Practitioner"
        
        # Format the final output to match API Contract
        return jsonify({
            "risk": assessment.get("risk", "Medium"),
            "reason": assessment.get("reason", "Incomplete analysis due to API constraints."),
            "recommendations": assessment.get("recommendations", []),
            "hospital": primary_hospital,
            "doctor": primary_doctor,
            "aqi": current_aqi,
            "pm2_5": data["pm2_5"],
            "pm10": data["pm10"],
            "weather": data["weather"],
            "trend": data.get("trend"),
            "nearby_hospitals": closest_hospitals
        })
        
    except Exception as e:
        return jsonify({"error": f"Assessment process failed: {str(e)}"}), 500

@app.route("/api/chat", methods=["POST"])
def chat_agent():
    payload = request.json or {}
    query = payload.get("query")
    history = payload.get("history", [])
    
    if not query:
        abort(400, description="Missing 'query' parameter")
        
    response_text = ai_service.generate_chat_response(query, history)
    return jsonify({"response": response_text})

@app.route("/api/knowledge-chat", methods=["POST"])
def knowledge_chat():
    """
    RAG Knowledge Chat endpoint.
    1. Searches Elasticsearch for relevant docs based on the user's question
    2. Builds context from retrieved hits
    3. Sends context + conversation history to Gemini for a grounded answer
    """
    payload = request.json or {}
    query = payload.get("query")
    history = payload.get("history", [])
    condition = payload.get("condition")  # optional topic filter

    if not query:
        abort(400, description="Missing 'query' parameter")

    # Step 1: Retrieve relevant docs from Elasticsearch
    context_docs = elastic_service.search_guidelines(
        condition=condition,
        text_query=query
    )

    # Step 2: Generate grounded response via Gemini
    response_text = ai_service.generate_knowledge_chat_response(
        query=query,
        context_docs=context_docs,
        history=history
    )

    return jsonify({
        "response": response_text,
        "sources": [
            {
                "source": d.get("source", ""),
                "title": d.get("title", ""),
                "condition": d.get("condition", "")
            } for d in context_docs[:3]
        ]
    })

if __name__ == "__main__":
    app.run(port=8000, debug=True)
