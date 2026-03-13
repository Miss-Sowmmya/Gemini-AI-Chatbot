import React, { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import GeminiService from '../config/gemini';
import { FiRefreshCw, FiDownload, FiTrash2 } from 'react-icons/fi';
import './ChatInterface.css';

function ChatInterface({ apiKey }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geminiService, setGeminiService] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (apiKey) {
      try {
        const service = new GeminiService(apiKey);
        setGeminiService(service);
        setError(null);
      } catch (err) {
        setError('Failed to initialize Gemini service. Please check your API key.');
      }
    }
  }, [apiKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content) => {
    if (!content.trim() || !geminiService) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      content,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      let botResponse = '';
      
      // Add placeholder for bot message
      const botMessageId = Date.now() + 1;
      setMessages(prev => [...prev, {
        id: botMessageId,
        content: '',
        role: 'bot',
        timestamp: new Date().toISOString(),
        isLoading: true
      }]);

      // Stream the response
      await geminiService.sendMessageWithStream(content, (chunk, fullResponse) => {
        botResponse = fullResponse;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, content: botResponse, isLoading: false }
              : msg
          )
        );
      });

    } catch (err) {
      setError(err.message);
      // Remove the loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setMessages([]);
      setError(null);
      // Reinitialize chat
      if (geminiService) {
        geminiService.initializeChat();
      }
    }
  };

  const handleExportChat = () => {
    const chatData = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      // You can process the file content here
      // For now, just send it as a message
      await handleSendMessage(`[File: ${file.name}]\n\n${content}`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-header-left">
          <h2>Chat Session</h2>
          {messages.length > 0 && (
            <span className="message-count">{messages.length} messages</span>
          )}
        </div>
        <div className="chat-header-right">
          <button 
            className="icon-btn" 
            onClick={handleClearChat}
            title="Clear chat"
          >
            <FiTrash2 />
          </button>
          <button 
            className="icon-btn" 
            onClick={handleExportChat}
            disabled={messages.length === 0}
            title="Export chat"
          >
            <FiDownload />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            accept=".txt,.json,.md,.js,.jsx,.py,.html,.css"
          />
          <button 
            className="icon-btn"
            onClick={() => fileInputRef.current.click()}
            title="Upload file"
          >
            📎
          </button>
          {geminiService && (
            <button 
              className="icon-btn" 
              onClick={() => geminiService.initializeChat()}
              title="Reset conversation"
            >
              <FiRefreshCw />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      <MessageList 
        messages={messages} 
        messagesEndRef={messagesEndRef}
      />

      <MessageInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={!geminiService}
      />
    </div>
  );
}

export default ChatInterface;