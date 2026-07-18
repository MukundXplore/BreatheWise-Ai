import os
import json
from dotenv import load_dotenv
from elasticsearch import Elasticsearch

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../backend/.env'))

ELASTIC_CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY")
ELASTIC_URL = os.getenv("ELASTIC_URL", "http://localhost:9200")

def get_elastic_client():
    if ELASTIC_CLOUD_ID and ELASTIC_API_KEY:
        print("Connecting to Elastic Cloud...")
        return Elasticsearch(cloud_id=ELASTIC_CLOUD_ID, api_key=ELASTIC_API_KEY)
    else:
        print(f"Connecting to Local Elasticsearch at {ELASTIC_URL}...")
        return Elasticsearch(ELASTIC_URL)

def setup_indexes():
    es = get_elastic_client()
    
    # Check connection
    try:
        if not es.ping():
            print("Elasticsearch is not reachable. Ensure the server is running or credentials are correct.")
            return False
        print("Connected to Elasticsearch successfully.")
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

    indexes = ["health_guidelines", "respiratory_guidelines", "aqi_data"]
    
    for idx in indexes:
        if es.indices.exists(index=idx):
            print(f"Index '{idx}' already exists. Deleting it for clean setup...")
            es.indices.delete(index=idx)
        
        # Create index
        es.indices.create(index=idx)
        print(f"Created index '{idx}'")

    # Load seed data
    seed_file = os.path.join(os.path.dirname(__file__), 'seed_data.json')
    if os.path.exists(seed_file):
        with open(seed_file, 'r', encoding='utf-8') as f:
            documents = json.load(f)
        
        # Index seed data into health_guidelines & respiratory_guidelines for demo
        for i, doc in enumerate(documents):
            # health_guidelines
            es.index(index="health_guidelines", id=f"hg_{i}", document=doc)
            # respiratory_guidelines
            es.index(index="respiratory_guidelines", id=f"rg_{i}", document=doc)
            
        print(f"Successfully indexed {len(documents)} documents into 'health_guidelines' and 'respiratory_guidelines'.")
    else:
        print("Seed data file not found.")

    # Create dummy aqi_data index entry
    dummy_aqi = {
        "location": "Delhi",
        "station": "Dwarka Sector 8",
        "aqi": 345,
        "status": "Severe",
        "timestamp": "2026-07-18T12:00:00Z"
    }
    es.index(index="aqi_data", id="aqi_delhi", document=dummy_aqi)
    print("Indexed dummy Delhi AQI entry to 'aqi_data'.")
    return True

if __name__ == "__main__":
    setup_indexes()
