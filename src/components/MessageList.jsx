import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiUser, FiCpu } from 'react-icons/fi';
import './MessageList.css';

function MessageList({ messages, messagesEndRef }) {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const CodeBlock = ({ language, value }) => {
    return (
      <div className="code-block">
        <div className="code-header">
          <span>{language || 'text'}</span>
          <button 
            className="copy-btn"
            onClick={() => navigator.clipboard.writeText(value)}
          >
            Copy
          </button>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language || 'text'}
          PreTag="div"
        >
          {value}
        </SyntaxHighlighter>
      </div>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="message-list empty-state">
        <div className="empty-state-content">
          <FiCpu className="empty-icon" />
          <h3>Start a conversation</h3>
          <p>Send a message to begin chatting with Gemini AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message ${message.role} ${message.isLoading ? 'loading' : ''}`}
        >
          <div className="message-avatar">
            {message.role === 'user' ? <FiUser /> : <FiCpu />}
          </div>
          <div className="message-content">
            <div className="message-header">
              <span className="message-sender">
                {message.role === 'user' ? 'You' : 'Gemini AI'}
              </span>
              <span className="message-time">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
            <div className="message-body">
              {message.isLoading ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <CodeBlock
                          language={match[1]}
                          value={String(children).replace(/\n$/, '')}
                          {...props}
                        />
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;