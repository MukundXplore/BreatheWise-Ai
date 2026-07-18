import os
import json
from elasticsearch import Elasticsearch

# Seed data defined inline as fallback
SEED_DATA = [
  {
    "condition": "Asthma",
    "aqi": "Severe",
    "symptom": "Any",
    "recommendation": "Avoid all outdoor physical activity. Keep emergency inhalers within reach. Stay in a room with an air purifier running. Seek medical help if breathing difficulty increases.",
    "source": "WHO & CPCB Asthma Advisory"
  },
  {
    "condition": "Asthma",
    "aqi": "Very Poor",
    "symptom": "Wheezing",
    "recommendation": "Limit outdoor exposure strictly. If you must go outside, wear an N95 respirator. Keep your quick-relief inhaler handy.",
    "source": "CPCB Respiratory Guidelines"
  },
  {
    "condition": "Asthma",
    "aqi": "Poor",
    "symptom": "Cough",
    "recommendation": "Reduce strenuous outdoor activities. Monitor symptoms like coughing or wheezing. Shift exercise sessions indoors.",
    "source": "Indian Chest Society Advisory"
  },
  {
    "condition": "COPD",
    "aqi": "Severe",
    "symptom": "Chest Tightness",
    "recommendation": "Strictly remain indoors. Ensure oxygen therapy equipment (if prescribed) is functional. Contact pulmonologist immediately if chest tightness or shortness of breath worsens.",
    "source": "Global Initiative for Chronic Obstructive Lung Disease (GOLD) Delhi Guide"
  },
  {
    "condition": "COPD",
    "aqi": "Very Poor",
    "symptom": "Shortness of Breath",
    "recommendation": "Avoid outdoor movement. Keep doors and windows closed. Avoid cooking methods that generate smoke (incense, frying) inside the house.",
    "source": "GOLD Guidelines for Severe Air Pollution"
  },
  {
    "condition": "COPD",
    "aqi": "Poor",
    "symptom": "Cough",
    "recommendation": "Minimize exposure to heavy traffic areas in Delhi. Wear N95 mask outside. Ensure routine maintenance medicines are taken regularly.",
    "source": "Delhi Health Advisory"
  },
  {
    "condition": "Bronchitis",
    "aqi": "Severe",
    "symptom": "Sputum Production",
    "recommendation": "Stay in clean, temperature-controlled indoor environments. Use warm saline steam inhalation. Avoid any exposure to Delhi's smog.",
    "source": "CPCB Bronchitis Bulletin"
  },
  {
    "condition": "General",
    "aqi": "Severe",
    "recommendation": "Avoid outdoor physical exertion, especially in the early morning and late evening. Wear N95 masks for mandatory travel. Children, pregnant women, and the elderly should remain indoors.",
    "source": "WHO Clean Air Delhi Guide"
  },
  {
    "condition": "General",
    "aqi": "Very Poor",
    "recommendation": "Limit prolonged outdoor activities. Use public transport or carpool to reduce further emissions. Wear N95 masks when visiting high-traffic spots.",
    "source": "CPCB Air Quality Bulletin"
  },
  {
    "condition": "General",
    "aqi": "Poor",
    "recommendation": "People with sensitive airways may experience discomfort. Consider wearing a mask if spending long hours outdoors. Keep active children indoors when pollution peaks.",
    "source": "Delhi Pollution Control Committee"
  },
  {
    "condition": "General",
    "aqi": "Moderate",
    "recommendation": "Air quality is acceptable. However, unusually sensitive individuals should monitor their symptoms and limit heavy outdoor exertion.",
    "source": "CPCB Standard Guide"
  },
  {
    "condition": "Diabetes",
    "aqi": "Poor",
    "recommendation": "High pollution levels can increase insulin resistance and systemic inflammation. Diabetic patients should monitor blood glucose levels more frequently and avoid exercising outdoors when AQI exceeds 150.",
    "source": "Endocrine Society & Respiratory Joint Advisory"
  },
  {
    "condition": "General",
    "aqi": "Very Poor",
    "recommendation": "During peak winter smog (November to February), avoid early morning walks when ground-level ozone and particulate matter concentration are highest. Shift outdoor walks to sunny afternoons.",
    "source": "Delhi Government Winter Action Plan"
  },
  {
    "condition": "General",
    "aqi": "Moderate",
    "recommendation": "Reduce indoor air pollution by avoiding the use of incense sticks (agarbatti), candles, and wood stoves. Ensure proper kitchen ventilation with chimneys or exhaust fans when cooking.",
    "source": "Ministry of Health Indoor Air Quality Guide"
  },
  {
    "condition": "General",
    "aqi": "Severe",
    "recommendation": "Children under 12 and senior citizens over 70 should strictly stay indoors. Avoid physical exertion. Ensure air purifiers are running in bedrooms and common spaces.",
    "source": "Indian Academy of Pediatrics & Geriatric Advisory"
  },
  {
    "condition": "General",
    "aqi": "Severe",
    "recommendation": "Under GRAP Stage IV emergency protocols, all outdoor physical activity in schools is suspended. Citizens are advised to work from home if possible, use public transport, and report open burning immediately.",
    "source": "CPCB GRAP Stage IV Mandate"
  }
]

class ElasticService:
    def __init__(self):
        self.cloud_id = os.getenv("ELASTIC_CLOUD_ID")
        self.api_key = os.getenv("ELASTIC_API_KEY")
        self.url = os.getenv("ELASTIC_URL", "http://localhost:9200")
        self.client = None
        self.is_connected = False
        
        # Try establishing connection
        self.connect()

    def connect(self):
        try:
            if self.cloud_id and self.api_key:
                print("Connecting to Elastic Cloud with API Key...")
                self.client = Elasticsearch(cloud_id=self.cloud_id, api_key=self.api_key)
                if self.client.ping():
                    self.is_connected = True
                    print("ElasticService: Connected to Elastic Cloud!")
                    return
            
            if self.api_key:
                print(f"Connecting to Elasticsearch at {self.url} with API Key...")
                self.client = Elasticsearch(self.url, api_key=self.api_key)
                if self.client.ping():
                    self.is_connected = True
                    print("ElasticService: Connected to Elasticsearch using API Key!")
                    return
                else:
                    print("API Key connection failed. Trying without authentication...")
            
            # Fallback to connection without API Key
            self.client = Elasticsearch(self.url)
            if self.client.ping():
                self.is_connected = True
                print("ElasticService: Connected to local/unauthenticated Elasticsearch!")
            else:
                self.is_connected = False
                print("ElasticService: Elasticsearch is not reachable. Using in-memory fallback database.")
        except Exception as e:
            self.is_connected = False
            print(f"ElasticService connection error: {e}. Falling back to in-memory mode.")

    def map_aqi_score(self, aqi: int) -> str:
        if aqi <= 50:
            return "Good"
        elif aqi <= 100:
            return "Moderate"
        elif aqi <= 200:
            return "Poor"
        elif aqi <= 300:
            return "Very Poor"
        else:
            return "Severe"

    def search_guidelines(self, condition: str = None, symptoms: list = None, aqi_score: int = None, text_query: str = None) -> list:
        aqi_status = self.map_aqi_score(aqi_score) if aqi_score is not None else None
        
        if self.is_connected:
            try:
                # Build Elasticsearch search query
                must_clauses = []
                
                if condition:
                    # Search condition
                    must_clauses.append({
                        "bool": {
                            "should": [
                                {"match": {"condition": condition}},
                                {"match": {"condition": "General"}}
                            ]
                        }
                    })
                
                if aqi_status:
                    must_clauses.append({"match": {"aqi": aqi_status}})
                
                if text_query:
                    must_clauses.append({"multi_match": {
                        "query": text_query,
                        "fields": ["condition", "recommendation", "source", "symptom"]
                    }})

                # If symptoms are provided, rank or match them in should clauses
                should_clauses = []
                if symptoms:
                    for symptom in symptoms:
                        should_clauses.append({"match": {"symptom": symptom}})

                body = {
                    "query": {
                        "bool": {
                            "must": must_clauses,
                            "should": should_clauses
                        }
                    }
                }

                # Search indices
                response = self.client.search(index="health_guidelines,respiratory_guidelines", body=body, size=5)
                hits = response.get('hits', {}).get('hits', [])
                results = [hit['_source'] for hit in hits]
                
                if results:
                    return results
            except Exception as e:
                print(f"Elasticsearch query failed: {e}. Falling back to in-memory search.")
        
        # In-Memory Search Fallback
        results = []
        target_condition = (condition or "").lower()
        target_aqi = (aqi_status or "").lower()
        
        # Filter logic
        for doc in SEED_DATA:
            doc_condition = doc.get("condition", "").lower()
            doc_aqi = doc.get("aqi", "").lower()
            doc_symptom = doc.get("symptom", "").lower()
            doc_recommendation = doc.get("recommendation", "").lower()
            
            # Condition match
            cond_match = False
            if not target_condition:
                cond_match = True
            elif doc_condition == target_condition or doc_condition == "general":
                cond_match = True
                
            # AQI match
            aqi_match = False
            if not target_aqi:
                aqi_match = True
            elif doc_aqi == target_aqi:
                aqi_match = True
                
            # Text query match
            query_match = True
            if text_query:
                query_match = (
                    text_query.lower() in doc_condition or
                    text_query.lower() in doc_recommendation or
                    text_query.lower() in doc_aqi or
                    text_query.lower() in doc_symptom
                )
                
            if cond_match and aqi_match and query_match:
                # Add score or rank based on symptoms matching
                score = 0
                if symptoms:
                    for sym in symptoms:
                        if sym.lower() in doc_symptom or sym.lower() in doc_recommendation:
                            score += 1
                doc_copy = doc.copy()
                doc_copy["_score"] = score
                results.append(doc_copy)
        
        # Sort by score descending
        results.sort(key=lambda x: x.get("_score", 0), reverse=True)
        # Strip _score parameter before returning
        for r in results:
            r.pop("_score", None)
            
        # Return top 5 matches, if empty return general guidelines matching the AQI
        if not results and target_aqi:
            results = [doc for doc in SEED_DATA if doc.get("condition", "").lower() == "general" and doc.get("aqi", "").lower() == target_aqi]
            
        return results[:5]
