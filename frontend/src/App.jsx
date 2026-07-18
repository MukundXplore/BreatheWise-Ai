import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('assess'); // 'assess' or 'search'
  
  // Assessment Form State
  const [age, setAge] = useState(65);
  const [condition, setCondition] = useState('Asthma');
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Cough', 'Wheezing']);
  const [location, setLocation] = useState('Delhi');
  
  // Assessment API Result State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Delhi live AQI overlay state
  const [liveAqi, setLiveAqi] = useState(null);
  const [liveAqiCategory, setLiveAqiCategory] = useState('');

  // Search Engine State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Available Delhi locations for live testing/simulations
  const delhiLocations = [
    { value: 'Delhi', label: 'Delhi (General)' },
    { value: 'Dwarka Sector 8, Delhi', label: 'Dwarka (Severe Pollution)' },
    { value: 'Connaught Place, Delhi', label: 'Connaught Place (Moderate Pollution)' },
    { value: 'Okhla Phase 3, Delhi', label: 'Okhla (Very Poor Pollution)' },
    { value: 'Anand Vihar, Delhi', label: 'Anand Vihar (Hazardous Pollution)' },
    { value: 'Delhi University, Delhi', label: 'Delhi University (Poor Pollution)' }
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

  const handleAssessSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parseInt(age) || 0,
          condition,
          symptoms: selectedSymptoms,
          location
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned code ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      // Synchronize dashboard AQI widget
      setLiveAqi(data.aqi);
      // Determine label
      if (data.aqi <= 50) setLiveAqiCategory('Good');
      else if (data.aqi <= 100) setLiveAqiCategory('Moderate');
      else if (data.aqi <= 200) setLiveAqiCategory('Poor');
      else if (data.aqi <= 300) setLiveAqiCategory('Very Poor');
      else setLiveAqiCategory('Severe');

    } catch (err) {
      setError(`Failed to perform health assessment. Check if FastAPI backend is running on localhost:8000. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="app-container">
      
      {/* App Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="pulse-dot"></div>
          <div>
            <h1 className="app-title">BreatheWise AI</h1>
            <p className="app-subtitle">Respiratory Companion & Delhi AQI-RAG Advisor</p>
          </div>
        </div>

        <nav className="nav-tabs">
          <button 
            className={`tab-btn ${activeTab === 'assess' ? 'active' : ''}`}
            onClick={() => setActiveTab('assess')}
          >
            Health Assessment
          </button>
          <button 
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Elastic Knowledge Library
          </button>
        </nav>
      </header>

      {/* Main Tab Routing */}
      {activeTab === 'assess' ? (
        <div className="dashboard-grid">
          
          {/* User Profile Form Column */}
          <div className="glass-panel form-card">
            <h2 className="form-title">Respiratory Profile</h2>
            
            <form onSubmit={handleAssessSubmit}>
              
              <div className="form-group">
                <label className="form-label">Age</label>
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
                <label className="form-label">Delhi Location Hotspot</label>
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
                <label className="form-label">Chronic Respiratory Condition</label>
                <select 
                  className="select-field"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="None">None (Healthy Airways)</option>
                  <option value="Asthma">Asthma</option>
                  <option value="COPD">COPD (Chronic Obstructive Pulmonary Disease)</option>
                  <option value="Bronchitis">Chronic Bronchitis</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Symptoms</label>
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
                        <span className="checkbox-label">{symptom}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Analyzing Guidelines...</span>
                  </>
                ) : (
                  <span>Analyze Health Risk</span>
                )}
              </button>

            </form>
          </div>

          {/* AI recommendations + live AQI Column */}
          <div className="result-column">
            
            {/* Live AQI Widget */}
            {liveAqi !== null && (
              <div className="glass-panel aqi-bar-container">
                <div className="aqi-info">
                  <span className="aqi-label">Delhi Station AQI</span>
                  <span className="aqi-value-text">{liveAqi}</span>
                </div>
                <div className={`aqi-badge ${getAqiStyleClass(liveAqiCategory)}`}>
                  {liveAqiCategory || 'Unknown'}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'var(--risk-high)', color: '#fca5a5', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '8px' }}>Connection Error</h3>
                <p style={{ fontSize: '0.9rem' }}>{error}</p>
                <div style={{ marginTop: '12px', fontSize: '0.8rem', opacity: 0.8 }}>
                  💡 Ensure the FastAPI backend is running via <strong>uvicorn app.main:app --reload</strong> inside BreatheWise/backend folder.
                </div>
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
                      <span className="risk-title">Respiratory Risk</span>
                      <span className={`risk-value ${result.risk.toLowerCase()}`}>{result.risk} Level</span>
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
                  Personalized Recommendations
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
                    Healthcare Assistance Navigation
                  </div>

                  <div className="hospital-details">
                    <div className="detail-item">
                      <span className="detail-icon">🏥</span>
                      <span className="detail-text">
                        Nearest Hospital: <strong>{result.hospital}</strong>
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">👨‍⚕️</span>
                      <span className="detail-text">
                        Recommended Specialist: <strong>{result.doctor}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="action-btn-row">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.hospital + ' Delhi')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-sub-btn"
                    >
                      Locate Hospital
                    </a>
                    
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.doctor + ' near ' + location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-sub-btn"
                    >
                      Find Pulmonologist
                    </a>

                    <a 
                      href="tel:102"
                      className="action-sub-btn emergency"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Emergency Hotline Call Triggered! Dialing National Ambulance Service (102) for Delhi Respiratory Emergency Support.");
                      }}
                    >
                      Emergency Contact (102)
                    </a>
                  </div>
                </div>

              </div>
            ) : (
              /* Prompt when no results are present */
              <div className="glass-panel result-placeholder">
                <div className="placeholder-icon">🫁</div>
                <h3 style={{ marginBottom: '8px' }}>No Active Assessment</h3>
                <p className="placeholder-text">
                  Submit your details on the left. The RAG engine will pull clinical recommendations from Elastic and analyze them via Gemini.
                </p>
              </div>
            )}

          </div>
        </div>
      ) : (
        /* Elastic Search Knowledge Base Center */
        <div className="glass-panel search-container">
          <div className="search-header">
            <h2 className="form-title" style={{ marginBottom: '4px' }}>Elastic Guidelines Center</h2>
            <p className="search-description">
              Directly query the indexed knowledge base of healthcare regulations, CPCB mandates, and WHO guidelines.
            </p>
          </div>

          <form onSubmit={handleSearch} className="search-box-row">
            <input 
              type="text" 
              className="input-field search-input" 
              placeholder="Search guidelines (e.g. Asthma, N95, COPD, Severe AQI advice...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn-search" disabled={searchLoading}>
              {searchLoading ? 'Searching...' : 'Query Indexes'}
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
                    Source: {res.source || 'Clinical Guideline Base'}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                No matching guideline documents found in Elastic indices. Try querying for terms like "mask", "asthma", "copd", or "severe".
              </div>
            )}
          </div>
        </div>
      )}

      {/* Presentation/Demo footer */}
      <footer style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <p>BreatheWise AI Prototype — Powered by FastAPI, React, and Gemini 2.5 Flash / Elasticsearch RAG Interface.</p>
      </footer>
    </div>
  );
}

export default App;
