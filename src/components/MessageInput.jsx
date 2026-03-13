import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiStopCircle } from 'react-icons/fi';
import './MessageInput.css';

function MessageInput({ onSendMessage, isLoading, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStopGeneration = () => {
    // This would need to be implemented with proper abort controller
    console.log('Stop generation');
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            className="message-textarea"
            placeholder={disabled ? "Please enter API key first" : "Type your message... (Shift+Enter for new line)"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            rows={1}
          />
          <div className="input-actions">
            {isLoading ? (
              <button
                type="button"
                className="send-btn stop"
                onClick={handleStopGeneration}
                title="Stop generating"
              >
                <FiStopCircle />
              </button>
            ) : (
              <button
                type="submit"
                className="send-btn"
                disabled={!message.trim() || disabled}
                title="Send message"
              >
                <FiSend />
              </button>
            )}
          </div>
        </div>
      </form>
      <div className="input-footer">
        <span className="hint">
          {disabled ? (
            '⚠️ API key required'
          ) : (
            <>
              <span className="shortcut-hint">Press Enter to send</span>
              <span className="shortcut-hint">Shift+Enter for new line</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

export default MessageInput;