import React, { useState, useEffect } from 'react';
import './App.css';

const translations = {
  EN: {
    title: "BreatheWise AI",
    subtitle: "Respiratory Companion & Delhi AQI-RAG Advisor",
    healthAssessment: "Health Assessment",
    elasticLibrary: "Elastic Knowledge Library",
    profileTitle: "Respiratory Profile",
    age: "Age",
    hotspot: "Delhi Location Hotspot",
    condition: "Chronic Respiratory Condition",
    symptoms: "Current Symptoms",
    btnAnalyze: "Analyze Health Risk",
    btnAnalyzing: "Analyzing Guidelines...",
    stationAqi: "Delhi Station AQI",
    connectionError: "Connection Error",
    connectionSuggest: "Ensure the FastAPI backend is running on localhost:8000.",
    respiratoryRisk: "Respiratory Risk",
    riskLevel: "Level",
    personalizedRecs: "Personalized Recommendations",
    healthcareCenter: "Healthcare Assistance Navigation",
    nearestHospital: "Nearest Hospital",
    recommendedSpecialist: "Recommended Specialist",
    locateHospital: "Locate Hospital",
    findPulmonologist: "Find Pulmonologist",
    emergencyContact: "Emergency Contact (102)",
    placeholderTitle: "No Active Assessment",
    placeholderText: "Submit your details on the left. The RAG engine will pull clinical recommendations from Elastic and analyze them via Gemini.",
    elasticCenter: "Elastic Guidelines Center",
    elasticDesc: "Directly query the indexed knowledge base of healthcare regulations, CPCB mandates, and WHO guidelines.",
    searchPlaceholder: "Search guidelines (e.g. Asthma, N95, COPD, Severe AQI advice...)",
    btnSearch: "Query Indexes",
    btnSearching: "Searching...",
    noResults: "No matching guideline documents found in Elastic indices. Try querying for terms like \"mask\", \"asthma\", \"copd\", or \"severe\".",
    generalAdvice: "General Advice",
    source: "Source",
    trendTitle: "7-Day AQI Trend",
    temperature: "Temperature",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    pm25: "PM2.5",
    pm10: "PM10",
    weatherCondition: "Weather Condition",
    sosTab: "SOS & Support",
    sosEmergencyTitle: "Emergency Services Directory",
    catsHelpline: "CATS Ambulance",
    policeHelpline: "Delhi Police Support",
    ambulanceHelpline: "National Ambulance",
    dpccHelpline: "Green Delhi (DPCC)",
    emergencyGuideTitle: "Severe Smog Emergency Protocol"
  },
  HI: {
    title: "ब्रीदवाइज AI",
    subtitle: "श्वसन साथी और दिल्ली एक्यूआई-आरएजी सलाहकार",
    healthAssessment: "स्वास्थ्य मूल्यांकन",
    elasticLibrary: "इलास्टिक ज्ञान पुस्तकालय",
    profileTitle: "श्वसन प्रोफ़ाइल",
    age: "आयु (उम्र)",
    hotspot: "दिल्ली स्थान हॉटस्पॉट",
    condition: "पुरानी सांस की बीमारी",
    symptoms: "वर्तमान लक्षण",
    btnAnalyze: "स्वास्थ्य जोखिम विश्लेषण",
    btnAnalyzing: "विश्लेषण किया जा रहा है...",
    stationAqi: "दिल्ली स्टेशन AQI",
    connectionError: "कनेक्शन त्रुटि",
    connectionSuggest: "सुनिश्चित करें कि बैकएंड localhost:8000 पर चल रहा है।",
    respiratoryRisk: "श्वसन जोखिम",
    riskLevel: "स्तर",
    personalizedRecs: "व्यक्तिगत सिफारिशें",
    healthcareCenter: "स्वास्थ्य सहायता नेविगेशन",
    nearestHospital: "निकटतम अस्पताल",
    recommendedSpecialist: "अनुशंसित विशेषज्ञ",
    locateHospital: "अस्पताल का पता लगाएं",
    findPulmonologist: "पल्मोनोलॉजिस्ट खोजें",
    emergencyContact: "आपातकालीन संपर्क (102)",
    placeholderTitle: "कोई सक्रिय मूल्यांकन नहीं",
    placeholderText: "बाईं ओर विवरण सबमिट करें। RAG इंजन इलास्टिक से सिफारिशें लेगा और मिथुन (Gemini) से विश्लेषण करेगा।",
    elasticCenter: "इलास्टिक दिशानिर्देश केंद्र",
    elasticDesc: "स्वास्थ्य नियमों, सीपीसीबी और डब्ल्यूएचओ दिशानिर्देशों के ज्ञान आधार को सीधे खोजें।",
    searchPlaceholder: "दिशानिर्देश खोजें (जैसे: अस्थमा, एन95, सीओपीडी, गंभीर एक्यूआई सलाह...)",
    btnSearch: "खोज करें",
    btnSearching: "खोज जारी है...",
    noResults: "कोई मिलान दिशानिर्देश नहीं मिले। \"मास्क\", \"अस्थमा\", \"सीओपीडी\" खोजें।",
    generalAdvice: "सामान्य सलाह",
    source: "स्रोत",
    trendTitle: "7-दिवसीय एक्यूआई (AQI) रुझान",
    temperature: "तापमान",
    humidity: "आर्द्रता (नमी)",
    windSpeed: "हवा की गति",
    pm25: "पीएम २.५",
    pm10: "पीएम १०",
    weatherCondition: "मौसम की स्थिति",
    sosTab: "एसओएस और सहायता",
    sosEmergencyTitle: "आपातकालीन सेवा निर्देशिका",
    catsHelpline: "CATS एम्बुलेंस (दिल्ली सरकार)",
    policeHelpline: "दिल्ली पुलिस",
    ambulanceHelpline: "राष्ट्रीय एम्बुलेंस सेवा",
    dpccHelpline: "ग्रीन दिल्ली हेल्पलाइन (DPCC)",
    emergencyGuideTitle: "गंभीर स्मॉग आपातकालीन प्रोटोकॉल"
  }
};

const conditionOptions = {
  EN: [
    { value: 'None', label: 'None (Healthy Airways)' },
    { value: 'Asthma', label: 'Asthma' },
    { value: 'COPD', label: 'COPD (Chronic Obstructive Pulmonary Disease)' },
    { value: 'Bronchitis', label: 'Chronic Bronchitis' }
  ],
  HI: [
    { value: 'None', label: 'कोई नहीं (स्वस्थ फेफड़े)' },
    { value: 'Asthma', label: 'अस्थमा' },
    { value: 'COPD', label: 'सीओपीडी (फेफड़ों की पुरानी बीमारी)' },
    { value: 'Bronchitis', label: 'क्रोनिक ब्रोंकाइटिस' }
  ]
};

const symptomTranslations = {
  EN: {
    'Cough': 'Cough',
    'Dry Cough': 'Dry Cough',
    'Wheezing': 'Wheezing',
    'Chest Tightness': 'Chest Tightness',
    'Shortness of Breath': 'Shortness of Breath',
    'Sputum Production': 'Sputum Production'
  },
  HI: {
    'Cough': 'खांसी',
    'Dry Cough': 'सूखी खांसी',
    'Wheezing': 'घरघराहट',
    'Chest Tightness': 'छाती में जकड़न',
    'Shortness of Breath': 'सांस की तकलीफ',
    'Sputum Production': 'बलगम बनना'
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('assess'); // 'assess' or 'search'
  const [lang, setLang] = useState('EN'); // 'EN' or 'HI'
  const t = translations[lang];
  
  // Theme and proximity hospital states
  const [theme, setTheme] = useState('dark');
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Assessment Form State
  const [age, setAge] = useState(65);
  const [condition, setCondition] = useState('Asthma');
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Cough', 'Wheezing']);
  const [location, setLocation] = useState('Delhi');
  
  // Debounced age state to avoid excessive backend requests
  const [debouncedAge, setDebouncedAge] = useState(age);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAge(age);
    }, 400);
    return () => clearTimeout(handler);
  }, [age]);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = theme === 'light' ? 'theme-light' : '';
  }, [theme]);

  // Assessment API Result State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Delhi live AQI overlay state
  const [liveAqi, setLiveAqi] = useState(null);
  const [liveAqiCategory, setLiveAqiCategory] = useState('');
  const [weather, setWeather] = useState(null);
  const [pm25, setPm25] = useState(null);
  const [pm10, setPm10] = useState(null);

  // Search Engine State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Chatbot Agent State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      sender: 'model', 
      text: lang === 'EN' 
        ? "Hello! I am your BreatheWise AI assistant. Ask me anything about Delhi air pollution, respiratory disease care, or mask protocols!" 
        : "नमस्ते! मैं आपका ब्रीदवाइज एआई सहायक हूं। मुझसे दिल्ली वायु प्रदूषण, श्वसन रोग देखभाल, या मास्क प्रोटोकॉल के बारे में कुछ भी पूछें!" 
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    setChatHistory(prev => {
      if (prev.length === 1 && prev[0].sender === 'model') {
        return [{
          sender: 'model',
          text: lang === 'EN'
            ? "Hello! I am your BreatheWise AI assistant. Ask me anything about Delhi air pollution, respiratory disease care, or mask protocols!"
            : "नमस्ते! मैं आपका ब्रीदवाइज एआई सहायक हूं। मुझसे दिल्ली वायु प्रदूषण, श्वसन रोग देखभाल, या मास्क प्रोटोकॉल के बारे में कुछ भी पूछें!"
        }];
      }
      return prev;
    });
  }, [lang]);

  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { sender: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.text,
          history: chatHistory
        })
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const data = await response.json();
      setChatHistory(prev => [...prev, { sender: 'model', text: data.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'model', text: lang === 'EN' ? "Error: Could not reach the AI server." : "त्रुटि: एआई सर्वर तक नहीं पहुँचा जा सका।" }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Available Delhi locations for live testing/simulations
  const delhiLocations = [
    { value: 'Delhi', label: 'Delhi (General)' },
    { value: 'Dwarka Sector 8, Delhi', label: 'Dwarka' },
    { value: 'Connaught Place, Delhi', label: 'Connaught Place' },
    { value: 'Okhla Phase 3, Delhi', label: 'Okhla' },
    { value: 'Anand Vihar, Delhi', label: 'Anand Vihar' },
    { value: 'Delhi University, Delhi', label: 'Delhi University' },
    { value: 'Rohini, Delhi', label: 'Rohini' },
    { value: 'Noida', label: 'Noida (NCR)' },
    { value: 'Gurugram', label: 'Gurugram (NCR)' }
  ];

  // Available standard symptoms
  const symptomOptions = [
    'Cough',
    'Dry Cough',
    'Wheezing',
    'Chest Tightness',
    'Shortness of Breath',
    'Sputum Production'
  ];

  // Fetch initial live AQI
  useEffect(() => {
    fetchLiveAqi();
  }, [location]);

  const fetchLiveAqi = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/aqi?location=${encodeURIComponent(location)}`);
      if (res.ok) {
        const data = await res.json();
        setLiveAqi(data.aqi);
        setLiveAqiCategory(data.category);
        setWeather(data.weather);
        setPm25(data.pm2_5);
        setPm10(data.pm10);
        if (data.nearby_hospitals && data.nearby_hospitals.length > 0) {
          setNearbyHospitals(data.nearby_hospitals);
          setSelectedHospital(data.nearby_hospitals[0]);
        }
      }
    } catch (e) {
      console.warn("Could not fetch live AQI. Backend might not be running yet.", e);
    }
  };

  const handleSymptomChange = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  // Auto-run assessment on parameter updates
  useEffect(() => {
    const triggerAutoAssess = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8000/api/assess', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            age: parseInt(debouncedAge) || 0,
            condition,
            symptoms: selectedSymptoms,
            location,
            lang
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned code ${response.status}`);
        }

        const data = await response.json();
        setResult(data);
        setLiveAqi(data.aqi);
        setWeather(data.weather);
        setPm25(data.pm2_5);
        setPm10(data.pm10);
        if (data.nearby_hospitals && data.nearby_hospitals.length > 0) {
          setNearbyHospitals(data.nearby_hospitals);
          // Only update selected hospital if the current selection is no longer in the new list
          const stillExists = data.nearby_hospitals.find(h => selectedHospital && h.name === selectedHospital.name);
          if (!stillExists) {
            setSelectedHospital(data.nearby_hospitals[0]);
          }
        }

        if (data.aqi <= 50) setLiveAqiCategory('Good');
        else if (data.aqi <= 100) setLiveAqiCategory('Moderate');
        else if (data.aqi <= 200) setLiveAqiCategory('Poor');
        else if (data.aqi <= 300) setLiveAqiCategory('Very Poor');
        else setLiveAqiCategory('Severe');

      } catch (err) {
        setError(`${t.connectionError}. ${t.connectionSuggest} Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    triggerAutoAssess();
  }, [debouncedAge, condition, selectedSymptoms, location, lang]);

  // Direct elastic search query
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearchLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error("Elastic Search API returned error");
      }
    } catch (err) {
      console.error("Failed to query knowledge base:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Run empty search to fetch all guidelines initially when opening search tab
  useEffect(() => {
    if (activeTab === 'search') {
      handleSearch();
    }
  }, [activeTab]);

  // Helper mapping for AQI visual colors
  const getAqiStyleClass = (cat) => {
    const clean = (cat || '').toLowerCase().replace(/\s+/g, '');
    if (clean === 'good') return 'aqi-good';
    if (clean === 'moderate') return 'aqi-moderate';
    if (clean === 'poor') return 'aqi-poor';
    if (clean === 'verypoor') return 'aqi-verypoor';
    return 'aqi-severe'; // Severe
  };

  // Custom SVG Trend Chart
  const renderTrendChart = () => {
    if (liveAqi === null) return null;
    
    const seed = liveAqi || 250;
    const trendValues = [
      Math.round(seed * 0.85),
      Math.round(seed * 0.92),
      Math.round(seed * 1.05),
      Math.round(seed * 0.97),
      Math.round(seed * 1.12),
      Math.round(seed * 1.02),
      seed
    ];
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const width = 320;
    const height = 120;
    const padding = 20;
    const maxVal = Math.max(...trendValues, 300);
    const minVal = Math.min(...trendValues, 50);
    
    const getX = (index) => padding + (index * (width - padding * 2)) / (trendValues.length - 1);
    const getY = (val) => height - padding - ((val - minVal) * (height - padding * 2)) / (maxVal - minVal || 1);
    
    let pathD = `M ${getX(0)} ${getY(trendValues[0])}`;
    for (let i = 1; i < trendValues.length; i++) {
      pathD += ` L ${getX(i)} ${getY(trendValues[i])}`;
    }
    const areaD = `${pathD} L ${getX(trendValues.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;
    
    return (
      <div className="glass-panel trend-chart-container" style={{ marginTop: '1.5rem', padding: '1rem' }}>
        <h3 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          {t.trendTitle} ({location.split(',')[0]})
        </h3>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <path d={areaD} fill="url(#chartGrad)" />
          <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {trendValues.map((val, idx) => (
            <g key={idx}>
              <circle cx={getX(idx)} cy={getY(val)} r="4" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="2" />
              <text x={getX(idx)} y={getY(val) - 8} fill="var(--text-light)" fontSize="9" fontWeight="bold" textAnchor="middle">{val}</text>
              <text x={getX(idx)} y={height - 4} fill="var(--text-muted)" fontSize="9" textAnchor="middle">{days[idx]}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="app-container">
      
      {/* App Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="pulse-dot"></div>
          <div>
            <h1 className="app-title">{t.title}</h1>
            <p className="app-subtitle">{t.subtitle}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Theme Switcher */}
          <button 
            className="theme-toggle-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Language Switcher */}
          <div className="lang-switcher" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2px' }}>
            <button 
              className={`lang-btn ${lang === 'EN' ? 'active' : ''}`}
              onClick={() => setLang('EN')}
              style={{ border: 'none', background: lang === 'EN' ? 'var(--primary)' : 'transparent', color: '#fff', padding: '4px 10px', borderRadius: '18px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
            >
              EN
            </button>
            <button 
              className={`lang-btn ${lang === 'HI' ? 'active' : ''}`}
              onClick={() => setLang('HI')}
              style={{ border: 'none', background: lang === 'HI' ? 'var(--primary)' : 'transparent', color: '#fff', padding: '4px 10px', borderRadius: '18px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
            >
              हिन्दी
            </button>
          </div>

          <nav className="nav-tabs">
            <button 
              className={`tab-btn ${activeTab === 'assess' ? 'active' : ''}`}
              onClick={() => setActiveTab('assess')}
            >
              {t.healthAssessment}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              {t.elasticLibrary}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'sos' ? 'active' : ''}`}
              onClick={() => setActiveTab('sos')}
              style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '15px' }}
            >
              🚨 {t.sosTab}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Tab Routing */}
      {activeTab === 'assess' && (
        <div className="dashboard-grid">
          
          {/* User Profile Form Column */}
          <div className="glass-panel form-card">
            <h2 className="form-title">{t.profileTitle}</h2>
            
            <form onSubmit={(e) => e.preventDefault()}>
              
              <div className="form-group">
                <label className="form-label">{t.age}</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="0"
                  max="120"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.hotspot}</label>
                <select 
                  className="select-field"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {delhiLocations.map(loc => (
                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.condition}</label>
                <select 
                  className="select-field"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  {conditionOptions[lang].map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.symptoms}</label>
                <div className="checkbox-grid">
                  {symptomOptions.map(symptom => {
                    const isChecked = selectedSymptoms.includes(symptom);
                    return (
                      <div 
                        key={symptom} 
                        className={`checkbox-item ${isChecked ? 'checked' : ''}`}
                        onClick={() => handleSymptomChange(symptom)}
                      >
                        <input 
                           type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by click on wrapper
                        />
                        <span className="checkbox-label">{symptomTranslations[lang][symptom]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', marginTop: '1.5rem' }}>
                <span className="pulse-dot" style={{ width: '8px', height: '8px', background: '#10b981' }}></span>
                <span>{loading ? "Recalculating..." : "Auto-sync active"}</span>
              </div>

            </form>
          </div>

          {/* AI recommendations + live AQI Column */}
          <div className="result-column">
            
            {/* Live AQI Widget */}
            {liveAqi !== null && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                <div className="glass-panel aqi-bar-container" style={{ marginBottom: 0 }}>
                  <div className="aqi-info">
                    <span className="aqi-label">{t.stationAqi}</span>
                    <span className="aqi-value-text">{liveAqi}</span>
                  </div>
                  <div className={`aqi-badge ${getAqiStyleClass(liveAqiCategory)}`}>
                    {liveAqiCategory || 'Unknown'}
                  </div>
                </div>

                {/* Weather & Particulate Matter Details */}
                {weather && (
                  <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.6rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ⛅ {t.weatherCondition}
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#60a5fa' }}>
                        {weather.weather_desc}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>🌡️ {t.temperature}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{weather.temp}°C</div>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>💧 {t.humidity}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{weather.humidity}%</div>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>💨 {t.windSpeed}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{weather.wind} km/h</div>
                      </div>
                    </div>

                    {pm25 !== null && pm10 !== null && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'center', marginTop: '4px' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                          <div style={{ fontSize: '0.75rem', color: '#fca5a5', marginBottom: '4px' }}>🔴 {t.pm25}</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fca5a5' }}>{pm25} µg/m³</div>
                        </div>
                        <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                          <div style={{ fontSize: '0.75rem', color: '#fcd34d', marginBottom: '4px' }}>🟡 {t.pm10}</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fcd34d' }}>{pm10} µg/m³</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SVG Trend Chart */}
            {renderTrendChart()}

            {/* Error Message */}
            {error && (
              <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'var(--risk-high)', color: '#fca5a5', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '8px' }}>{t.connectionError}</h3>
                <p style={{ fontSize: '0.9rem' }}>{error}</p>
              </div>
            )}

            {/* Assessment Result Dashboard */}
            {result ? (
              <div className="glass-panel assessment-container">
                
                {/* Result Title & Pulse Indicator */}
                <div className="assessment-header">
                  <div className="risk-meter">
                    <div className={`risk-glow-circle ${result.risk.toLowerCase()}`}>
                      {result.risk}
                    </div>
                    <div className="risk-label-group">
                      <span className="risk-title">{t.respiratoryRisk}</span>
                      <span className={`risk-value ${result.risk.toLowerCase()}`}>{result.risk} {t.riskLevel}</span>
                    </div>
                  </div>
                </div>

                {/* AI RAG Reason */}
                <div className={`reason-block ${result.risk.toLowerCase()}`}>
                  <p>{result.reason}</p>
                </div>

                {/* Actionable Recommendations List */}
                <div className="section-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  {t.personalizedRecs}
                </div>
                <div className="recommendations-list">
                  {result.recommendations && result.recommendations.map((rec, index) => (
                    <div key={index} className="rec-card">
                      <div className="rec-number">{index + 1}</div>
                      <div className="rec-text">{rec}</div>
                    </div>
                  ))}
                </div>

                {/* Healthcare Action Center */}
                <div className="healthcare-card">
                  <div className="section-label" style={{ color: '#fff', marginBottom: '12px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    {t.healthcareCenter}
                  </div>

                  {nearbyHospitals.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                        Closest Hospitals (Within 5-7km):
                      </span>
                      <div style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                        {nearbyHospitals.map((h, i) => (
                          <div 
                            key={i}
                            className={`hospital-item-card ${selectedHospital && selectedHospital.name === h.name ? 'active' : ''}`}
                            onClick={() => setSelectedHospital(h)}
                          >
                            <div className="hospital-item-info">
                              <span className="hospital-item-name">{h.name}</span>
                              <span className="hospital-item-address">{h.address}</span>
                              <span style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '2px' }}>
                                👨‍⚕️ {h.doctor}
                              </span>
                            </div>
                            <span className="hospital-item-distance">{h.distance_km} km</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedHospital && (
                    <>
                      <div className="hospital-details" style={{ marginTop: '15px' }}>
                        <div className="detail-item">
                          <span className="detail-icon">🏥</span>
                          <span className="detail-text">
                            Selected Hospital: <strong>{selectedHospital.name}</strong>
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">👨‍⚕️</span>
                          <span className="detail-text">
                            Recommended Specialist: <strong>{selectedHospital.doctor}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Map Overlay Iframe */}
                      <div className="map-overlay-container" style={{ margin: '15px 0', overflow: 'hidden', borderRadius: '8px' }}>
                        <iframe
                          title="Delhi Hospital Map Overlay"
                          width="100%"
                          height="180"
                          frameBorder="0"
                          scrolling="no"
                          marginHeight="0"
                          marginWidth="0"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(location + ', Delhi ' + selectedHospital.name)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                          style={{ border: 'none', background: '#1a1a24' }}
                        ></iframe>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="action-btn-row">
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedHospital.name + ' Delhi')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-sub-btn"
                        >
                          {t.locateHospital}
                        </a>
                        
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedHospital.doctor + ' near ' + location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-sub-btn"
                        >
                          {t.findPulmonologist}
                        </a>

                        <a 
                          href="tel:102"
                          className="action-sub-btn emergency"
                          onClick={(e) => {
                            e.preventDefault();
                            alert("Emergency Hotline Call Triggered! Dialing National Ambulance Service (102) for Delhi Respiratory Emergency Support.");
                          }}
                        >
                          {t.emergencyContact}
                        </a>
                      </div>
                    </>
                  )}
                </div>

              </div>
            ) : (
              /* Prompt when no results are present */
              <div className="glass-panel result-placeholder">
                <div className="placeholder-icon">🫁</div>
                <h3 style={{ marginBottom: '8px' }}>{t.placeholderTitle}</h3>
                <p className="placeholder-text">
                  {t.placeholderText}
                </p>
              </div>
            )}

          </div>
        </div>
      )}
      
      {activeTab === 'search' && (
        /* Elastic Search Knowledge Base Center */
        <div className="glass-panel search-container">
          <div className="search-header">
            <h2 className="form-title" style={{ marginBottom: '4px' }}>{t.elasticCenter}</h2>
            <p className="search-description">
              {t.elasticDesc}
            </p>
          </div>

          <form onSubmit={handleSearch} className="search-box-row">
            <input 
              type="text" 
              className="input-field search-input" 
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn-search" disabled={searchLoading}>
              {searchLoading ? t.btnSearching : t.btnSearch}
            </button>
          </form>

          {/* Search Result display */}
          <div className="search-results-list">
            {searchResults.length > 0 ? (
              searchResults.map((res, index) => (
                <div key={index} className="search-result-card">
                  <div className="result-card-header">
                    <span className="result-badge">{res.condition || 'General'} Advice</span>
                    {res.aqi && (
                      <span className={`result-aqi-badge ${getAqiStyleClass(res.aqi)}`}>
                        AQI: {res.aqi}
                      </span>
                    )}
                  </div>
                  <p className="result-recommendation">
                    {res.recommendation}
                  </p>
                  <div className="result-source">
                    {t.source}: {res.source || 'Clinical Guideline Base'}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                {t.noResults}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sos' && (
        <div className="glass-panel sos-container">
          <div className="search-header">
            <h2 className="form-title" style={{ color: '#ef4444', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🚨 {lang === 'EN' ? "SOS Emergency Room" : "एसओएस आपातकालीन कक्ष"}
            </h2>
            <p className="search-description">
              {lang === 'EN' 
                ? "Immediate medical assistance support contacts, location coordinate templates, and smog safety protocols for Delhi."
                : "दिल्ली के लिए तत्काल चिकित्सा सहायता संपर्क, स्थान निर्देशांक टेम्पलेट और स्मॉग सुरक्षा प्रोटोकॉल।"}
            </p>
          </div>

          <div className="sos-grid">
            {/* Pulsing SOS trigger */}
            <div className="sos-card-red">
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fca5a5' }}>
                {lang === 'EN' ? "RESPIRATORY EMERGENCY" : "श्वसन आपातकाल"}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {lang === 'EN' 
                  ? "Clicking below calls the National Ambulance Service (102) to request immediate transport with oxygen support."
                  : "नीचे क्लिक करने से ऑक्सीजन सहायता के साथ तत्काल परिवहन का अनुरोध करने के लिए राष्ट्रीय एम्बुलेंस सेवा (102) को कॉल किया जाता है।"}
              </p>
              <button 
                className="sos-pulsing-btn"
                onClick={() => alert("SOS Emergency Call Triggered! Simulating call to National Ambulance Service (102)...")}
              >
                🔴 SOS (102)
              </button>
              
              <div style={{ width: '100%', marginTop: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>
                  📋 {lang === 'EN' ? "Emergency Message Template" : "आपातकालीन संदेश टेम्पलेट"}
                </span>
                <textarea 
                  className="input-field" 
                  readOnly 
                  rows="3"
                  style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', resize: 'none', fontFamily: 'monospace' }}
                  value={`EMERGENCY: I am experiencing severe respiratory distress in Delhi. Current location hotspot: ${location}. Please dispatch CATS/Ambulance with oxygen support.`}
                />
                <button 
                  className="action-sub-btn" 
                  style={{ width: '100%', marginTop: '8px', padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => {
                    navigator.clipboard.writeText(`EMERGENCY: I am experiencing severe respiratory distress in Delhi. Current location hotspot: ${location}. Please dispatch CATS/Ambulance with oxygen support.`);
                    alert("Emergency template copied to clipboard!");
                  }}
                >
                  {lang === 'EN' ? "Copy Template" : "टेम्पलेट कॉपी करें"}
                </button>
              </div>
            </div>

            {/* Helpline Directories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 className="section-label" style={{ color: '#fff', marginBottom: '10px' }}>
                  📞 {t.sosEmergencyTitle}
                </h3>
                
                <div className="emergency-directory-grid">
                  <div className="emergency-contact-card">
                    <div className="emergency-contact-info">
                      <span className="emergency-contact-name">{t.ambulanceHelpline}</span>
                      <span className="emergency-contact-phone">102</span>
                    </div>
                    <a href="tel:102" className="emergency-call-icon-btn" onClick={(e) => { e.preventDefault(); alert("Dialing 102..."); }}>📞</a>
                  </div>

                  <div className="emergency-contact-card">
                    <div className="emergency-contact-info">
                      <span className="emergency-contact-name">{t.catsHelpline}</span>
                      <span className="emergency-contact-phone">1099</span>
                    </div>
                    <a href="tel:1099" className="emergency-call-icon-btn" onClick={(e) => { e.preventDefault(); alert("Dialing 1099..."); }}>📞</a>
                  </div>

                  <div className="emergency-contact-card">
                    <div className="emergency-contact-info">
                      <span className="emergency-contact-name">{t.policeHelpline}</span>
                      <span className="emergency-contact-phone">112</span>
                    </div>
                    <a href="tel:112" className="emergency-call-icon-btn" onClick={(e) => { e.preventDefault(); alert("Dialing 112..."); }}>📞</a>
                  </div>

                  <div className="emergency-contact-card">
                    <div className="emergency-contact-info">
                      <span className="emergency-contact-name">{t.dpccHelpline}</span>
                      <span className="emergency-contact-phone">155200</span>
                    </div>
                    <a href="tel:155200" className="emergency-call-icon-btn" onClick={(e) => { e.preventDefault(); alert("Dialing Green Delhi Helpline (155200)..."); }}>📞</a>
                  </div>
                </div>
              </div>

              {/* Protocol guidance */}
              <div className="glass-panel" style={{ padding: '1.2rem', borderLeft: '4px solid #ef4444' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#fca5a5', marginBottom: '8px' }}>
                  ⚠️ {t.emergencyGuideTitle}
                </h3>
                <div className="protocol-checklist">
                  <div className="protocol-item">
                    <span className="protocol-icon-warn">1.</span>
                    <span>{lang === 'EN' ? "Use a rescue inhaler or bronchodilator if prescribed, repeating doses as directed." : "यदि चिकित्सक द्वारा निर्धारित हो, तो रेस्क्यू इनहेलर या ब्रोंकोडायलेटर का उपयोग करें।"}</span>
                  </div>
                  <div className="protocol-item">
                    <span className="protocol-icon-warn">2.</span>
                    <span>{lang === 'EN' ? "Sit upright and loosen tight clothing. Do not lie down as this can restrict lung expansion." : "सीधे बैठें और तंग कपड़े ढीले करें। लेटे नहीं क्योंकि इससे फेफड़ों का फैलाव बाधित हो सकता है।"}</span>
                  </div>
                  <div className="protocol-item">
                    <span className="protocol-icon-warn">3.</span>
                    <span>{lang === 'EN' ? "Stay inside an air-conditioned room equipped with a HEPA air purifier." : "HEPA एयर प्यूरीफायर से सुसज्जित वातानुकूलित कमरे के अंदर रहें।"}</span>
                  </div>
                  <div className="protocol-item">
                    <span className="protocol-icon-warn">4.</span>
                    <span>{lang === 'EN' ? "If oxygen levels drop below 90% or breathing worsens, trigger the SOS call immediately." : "यदि ऑक्सीजन का स्तर 90% से नीचे चला जाता है या सांस खराब हो जाती है, तो तुरंत एसओएस कॉल करें।"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button 
        className="chat-fab-btn" 
        onClick={() => setChatOpen(!chatOpen)}
        title="Chat with BreatheWise Agent"
      >
        💬 <span className="chat-fab-text">{lang === 'EN' ? "Talk to AI Agent" : "एआई एजेंट से बात करें"}</span>
      </button>

      {/* Chat Drawer Overlay */}
      {chatOpen && (
        <div className="chat-drawer-panel glass-panel">
          <div className="chat-drawer-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-dot"></span>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
                BreatheWise AI Chat Agent
              </h3>
            </div>
            <button className="chat-close-btn" onClick={() => setChatOpen(false)}>✕</button>
          </div>

          <div className="chat-messages-container">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`chat-message-bubble ${msg.sender}`}>
                <div className="chat-bubble-text">{msg.text}</div>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-message-bubble model loading">
                <span className="loading-dot">.</span>
                <span className="loading-dot">.</span>
                <span className="loading-dot">.</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChatMessage} className="chat-input-row">
            <input 
              type="text" 
              className="input-field chat-input-field" 
              placeholder={lang === 'EN' ? "Type a message..." : "एक संदेश लिखें..."}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
            />
            <button type="submit" className="action-sub-btn chat-send-btn" disabled={chatLoading}>
              ➤
            </button>
          </form>
        </div>
      )}

      <footer style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <p>BreatheWise AI Prototype — Powered by FastAPI, React, and Gemini 2.5 Flash / Elasticsearch RAG Interface.</p>
      </footer>
    </div>
  );
}

export default App;
