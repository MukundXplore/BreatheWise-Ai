import os
import json
import requests

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.is_active = False
        
        if self.api_key:
            self.is_active = True
            print("AIService: Direct REST Gemini Client initialized with API key.")
        else:
            print("AIService: GEMINI_API_KEY not found. Using high-fidelity local Mock LLM reasoning.")

    def generate_assessment(self, profile: dict, guidelines: list, current_aqi: int) -> dict:
        """
        Generates personalized respiratory health recommendations based on:
        - User profile (age, condition, symptoms)
        - Delhi real-time AQI
        - Retrieved health/medical guidelines from Elastic
        """
        if self.is_active:
            try:
                system_instruction = (
                    "You are BreatheWise AI, an expert Respiratory Health Assistant specialized in Delhi's air quality challenges.\n"
                    "Your role is to assess user health risks under current AQI conditions based ONLY on retrieved medical and health guidelines. Do not diagnose diseases. Provide structured, empathetic, and highly actionable suggestions."
                )
                
                prompt = f"""
Analyze the following user profile and medical guidelines to generate a structured JSON health assessment.

User Profile:
- Age: {profile.get('age')}
- Location: {profile.get('location')}
- Chronic Respiratory Condition: {profile.get('condition')}
- Current Symptoms: {', '.join(profile.get('symptoms', []))}
- Current Delhi AQI: {current_aqi}

Retrieved Guidelines from Knowledge Base (Elasticsearch):
{json.dumps(guidelines, indent=2)}

You MUST return a JSON response with the following keys:
1. "risk": Must be exactly one of "Low", "Medium", or "High".
2. "reason": A short 2-3 sentence explanation detailing why this risk was assigned. Connect the current AQI ({current_aqi}), their age/condition, and symptoms with the guidelines.
3. "recommendations": An array of 3-4 specific, actionable health recommendations (e.g. wearing N95 mask, running air purifiers, timing medication).
4. "hospital": Suggested nearest prominent Delhi hospital for respiratory care (e.g. AIIMS Delhi, Safdarjung Hospital, Fortis, Max Healthcare).
5. "doctor": The suggested medical specialist type (e.g. "Senior Pulmonologist" or "General Physician") to consult based on risk level.

JSON Format:
{{
  "risk": "High" | "Medium" | "Low",
  "reason": "...",
  "recommendations": ["...", "..."],
  "hospital": "...",
  "doctor": "..."
}}
"""
                # Prepare direct REST payload for Gemini API
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
                headers = {"Content-Type": "application/json"}
                
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": prompt
                        }]
                    }],
                    "systemInstruction": {
                        "parts": [{
                            "text": system_instruction
                        }]
                    },
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "temperature": 0.2
                    }
                }

                # Send request
                res = requests.post(url, headers=headers, json=payload, timeout=8)
                
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        # Parse JSON from response text
                        result = json.loads(content_text)
                        return result
                    else:
                        print(f"Gemini API returned empty candidates: {data}")
                else:
                    print(f"Gemini API REST call failed with status code {res.status_code}: {res.text}")
                    
            except Exception as e:
                print(f"Gemini API generation failed: {e}. Falling back to Local Mock LLM.")

        # Local Mock LLM Reasoning Engine (high-fidelity fallback)
        return self._generate_mock_assessment(profile, guidelines, current_aqi)

    def _generate_mock_assessment(self, profile: dict, guidelines: list, current_aqi: int) -> dict:
        """
        Determines risk level and advice programmatically to ensure
        reliable fallback when Gemini API key is not present.
        """
        age = profile.get("age", 30)
        condition = (profile.get("condition") or "None").strip()
        symptoms = profile.get("symptoms", [])
        
        # Risk Logic
        risk_score = 0
        
        # 1. AQI Impact
        if current_aqi > 300:
            risk_score += 4 # Severe
        elif current_aqi > 200:
            risk_score += 3 # Very Poor
        elif current_aqi > 100:
            risk_score += 2 # Poor
        else:
            risk_score += 1 # Moderate/Good
            
        # 2. Condition Impact
        if condition != "None":
            risk_score += 3
        if age > 60 or age < 10:
            risk_score += 2
            
        # 3. Symptoms Impact
        risk_score += len(symptoms)
        
        # Risk classification
        if risk_score >= 7:
            risk = "High"
            reason = f"At an AQI of {current_aqi} (Dangerous range), your respiratory risk is High. Being {age} years old with {condition} and experiencing symptoms like {', '.join(symptoms) or 'respiratory distress'} is a critical concern."
            hospital = "AIIMS New Delhi (Pulmonary Medicine Division) or Safdarjung Hospital"
            doctor = "Senior Pulmonologist & Critical Care Specialist"
        elif risk_score >= 4:
            risk = "Medium"
            reason = f"At an AQI of {current_aqi}, your risk is Moderate. Having {condition if condition != 'None' else 'sensitive airways'} requires caution to prevent symptoms from worsening into acute conditions."
            hospital = "Max Super Speciality Hospital, Saket or Fortis Delhi"
            doctor = "Consultant Pulmonologist / General Physician"
        else:
            risk = "Low"
            reason = f"With a moderate AQI of {current_aqi} and no major chronic conditions or symptoms, your respiratory risk is Low. Keep monitoring pollution levels."
            hospital = "Local Clinic / General Hospital"
            doctor = "General Practitioner"
            
        # Extract recommendations from guidelines, or construct custom ones
        recommendations = []
        for g in guidelines:
            rec = g.get("recommendation")
            if rec and rec not in recommendations:
                recommendations.append(rec)
                
        # Default safety recommendations if guidelines are sparse
        if len(recommendations) < 3:
            if risk == "High":
                recommendations.extend([
                    "Stay strictly indoors with doors and windows closed.",
                    "Use a high-quality air purifier with HEPA filtration.",
                    "Keep rescue inhalers/nebulizers close at hand and monitor oxygen saturation.",
                    "Wear an N95 respirator mask if outdoor travel is absolutely unavoidable."
                ])
            elif risk == "Medium":
                recommendations.extend([
                    "Limit outdoor exposure, particularly during early morning hours.",
                    "Wear an N95 mask during any outdoor activities or commute.",
                    "Avoid intense cardiovascular exercises outdoors; perform light yoga or stretch indoors instead."
                ])
            else:
                recommendations.extend([
                    "Air quality is currently acceptable, but check daily index updates before long outdoor trips.",
                    "Stay hydrated to flush out micro-particles from your airways."
                ])
                
        # Ensure list contains only unique items and limit size
        unique_recs = []
        for rec in recommendations:
            if rec not in unique_recs:
                unique_recs.append(rec)
        
        return {
            "risk": risk,
            "reason": reason,
            "recommendations": unique_recs[:4],
            "hospital": hospital,
            "doctor": doctor
        }
