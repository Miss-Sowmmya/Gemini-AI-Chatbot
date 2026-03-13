import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiKey } from 'react-icons/fi';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [isKeyValid, setIsKeyValid] = useState(false);

  useEffect(() => {
    // Check for API key in localStorage on mount
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeyValid(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem('gemini_api_key', tempApiKey.trim());
      setApiKey(tempApiKey.trim());
      setIsKeyValid(true);
      setTempApiKey('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveApiKey();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 Gemini AI Chatbot</h1>
        <div className="subtitle">Powered by Google Gemini 2.0 Flash</div>
      </header>

      <main className="main-container">
        {!isKeyValid ? (
          <div className="api-key-warning">
            <FiAlertCircle />
            <div style={{ flex: 1 }}>
              <strong>API Key Required</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                Please enter your Gemini API key to start chatting. Your key will be stored locally in your browser.
              </p>
              <div className="api-key-input-group">
                <FiKey style={{ alignSelf: 'center' }} />
                <input
                  type="password"
                  className="api-key-input"
                  placeholder="Enter your Gemini API key"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  className="save-key-btn"
                  onClick={handleSaveApiKey}
                  disabled={!tempApiKey.trim()}
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ChatInterface apiKey={apiKey} />
        )}
      </main>
    </div>
  );
}

export default App;