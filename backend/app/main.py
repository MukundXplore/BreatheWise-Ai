import os
import random
import requests
from flask import Flask, request, jsonify, abort
from dotenv import load_dotenv

# Load env variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))

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

def fetch_delhi_aqi(location: str) -> int:
    """
    Attempts to fetch Delhi live AQI from AQICN. If it fails or is offline,
    generates a realistic, location-specific AQI for Delhi.
    """
    clean_loc = (location or "").lower()
    
    # 1. Check if we can reach WAQI API (using demo token)
    try:
        url = f"https://api.waqi.info/feed/delhi/?token=demo"
        res = requests.get(url, timeout=3)
        if res.status_code == 200:
            data = res.json()
            if data.get("status") == "ok":
                aqi_val = data.get("data", {}).get("aqi")
                if isinstance(aqi_val, int):
                    # Add small variance based on location to make it feel dynamic
                    offset = random.randint(-15, 15)
                    return max(50, min(500, aqi_val + offset))
    except Exception as e:
        print(f"Failed to fetch live AQI via WAQI API: {e}. Simulating instead.")

    # 2. Simulated AQI based on common Delhi hotspots
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
    
    for key, (low, high) in hotspots.items():
        if key in clean_loc:
            return random.randint(low, high)
            
    # Default general Delhi range (Very Poor / Severe context)
    return random.randint(280, 360)

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
    aqi_val = fetch_delhi_aqi(location)
    category = elastic_service.map_aqi_score(aqi_val)
    return jsonify({
        "location": location,
        "aqi": aqi_val,
        "category": category
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
        # 1. Fetch current AQI for location
        current_aqi = fetch_delhi_aqi(location)
        
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
        
        # Format the final output to match API Contract
        return jsonify({
            "risk": assessment.get("risk", "Medium"),
            "reason": assessment.get("reason", "Incomplete analysis due to API constraints."),
            "recommendations": assessment.get("recommendations", []),
            "hospital": assessment.get("hospital", "General Hospital"),
            "doctor": assessment.get("doctor", "General Practitioner"),
            "aqi": current_aqi
        })
        
    except Exception as e:
        return jsonify({"error": f"Assessment process failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=8000, debug=True)
