import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getChatHistory, getAllSessions, deleteSession, deleteAllVectors } from '../api/client';
import { ChatMessage } from '../../../shared/types';
import { formatDisplayText } from '../utils/formatText';

interface Session {
  id: string;
  title: string;
  messageCount: number;
  lastActivity: string;
  preview: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    const existing = sessionStorage.getItem('chatSessionId');
    if (existing) return existing;
    const newId = `session-${Date.now()}`;
    sessionStorage.setItem('chatSessionId', newId);
    return newId;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history for current session
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const result = await getChatHistory(currentSessionId);
        if (result.history && result.history.length > 0) {
          setMessages(result.history);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    loadHistory();
  }, [currentSessionId]);

  // Load all sessions for sidebar
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const result = await getAllSessions();
        setSessions(result.sessions || []);
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    };
    loadSessions();
  }, [messages]); // Reload when messages change

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const resumeId = sessionStorage.getItem('resumeId');
      const result = await sendChatMessage(input, currentSessionId, resumeId || undefined);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    const newId = `session-${Date.now()}`;
    setCurrentSessionId(newId);
    sessionStorage.setItem('chatSessionId', newId);
    setMessages([]);
  };

  const switchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    sessionStorage.setItem('chatSessionId', sessionId);
    setMessages([]);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      try {
        await deleteSession(sessionId);
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (sessionId === currentSessionId) {
          startNewChat();
        }
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const handleClearAllVectors = async () => {
    if (!window.confirm('⚠️ This will delete ALL resumes and job descriptions from the vector database. This action cannot be undone. Continue?')) {
      return;
    }

    try {
      await deleteAllVectors();
      alert('✅ All vector data cleared successfully!');
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to clear vectors:', error);
      alert('❌ Failed to clear data. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', background: '#f9fafb' }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{
          width: '260px',
          background: '#1f2937',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #374151'
        }}>
          {/* New Chat Button */}
          <div style={{ padding: '16px' }}>
            <button
              onClick={startNewChat}
              style={{
                width: '100%',
                padding: '12px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              + New Chat
            </button>
          </div>

          {/* Sessions List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
            {sessions.map(session => (
              <div
                key={session.id}
                onClick={() => switchSession(session.id)}
                style={{
                  padding: '12px',
                  margin: '4px 0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: session.id === currentSessionId ? '#374151' : 'transparent',
                  transition: 'background 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  if (session.id !== currentSessionId) {
                    e.currentTarget.style.background = '#2d3748';
                  }
                }}
                onMouseLeave={(e) => {
                  if (session.id !== currentSessionId) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {session.title}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginTop: '4px'
                  }}>
                    {session.messageCount} messages
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    fontSize: '18px'
                  }}
                  title="Delete conversation"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #374151'
          }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
              {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                width: '100%',
                padding: '8px',
                background: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
              Settings
            </h3>
            
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#ef4444' }}>
                ⚠️ Danger Zone
              </h4>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                Delete all resumes and job descriptions from the vector database. This action cannot be undone.
              </p>
              <button
                onClick={handleClearAllVectors}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🗑️ Clear All Vector Data
              </button>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ☰
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            Chat with AI Assistant
          </h2>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%'
        }}>
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#9ca3af',
              padding: '60px 20px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>Start a conversation</p>
              <p style={{ fontSize: '14px' }}>
                Ask me anything about the candidate's resume!
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                marginBottom: '24px',
                display: 'flex',
                gap: '16px'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: msg.role === 'user' ? '#4f46e5' : '#10b981',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0
              }}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#374151'
                }}>
                  {msg.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: '#1f2937',
                  whiteSpace: 'pre-wrap'
                }}>
                  {formatDisplayText(msg.content)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#10b981',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                🤖
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  AI Assistant
                </div>
                <div style={{ color: '#9ca3af' }}>Thinking...</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '16px 24px',
          background: 'white',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'flex',
            gap: '12px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none'
              }}
            />
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '12px 24px',
                opacity: loading || !input.trim() ? 0.5 : 1,
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
