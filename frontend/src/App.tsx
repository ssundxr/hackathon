import { useState, useEffect } from 'react'
import './App.css'

interface Message {
  sender: 'user' | 'assistant' | 'system';
  text: string;
  time: string;
}

interface ServerStatus {
  status: string;
  backend: string;
  framework: string;
  env: string;
  ec2_ip: string;
  loaded_models: string[];
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'system',
      text: 'Project initialized. Connected to local server.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      sender: 'assistant',
      text: 'Hello! I am your FastAPI AI backend assistant. How can I help you build your hackathon project today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [serverInfo, setServerInfo] = useState<ServerStatus>({
    status: 'offline',
    backend: 'Python 3.x',
    framework: 'FastAPI',
    env: 'Production (Docker)',
    ec2_ip: '13.206.221.56',
    loaded_models: ['gemini-2.5-flash', 'gpt-4o-mini']
  });

  // Check backend server status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setServerInfo(prev => ({
            ...prev,
            status: 'online',
            ...data
          }));
        }
      } catch (err) {
        console.error("Failed to connect to backend", err);
        setServerInfo(prev => ({ ...prev, status: 'offline' }));
      }
    };

    fetchStatus();
    // Poll every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const promptToSend = inputText;
    setInputText('');
    setIsSending(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptToSend }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      const botMessage: Message = {
        sender: 'assistant',
        text: data.response || 'No response received.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        sender: 'system',
        text: 'Error: Failed to connect to FastAPI. Please check if backend is running.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'system',
        text: 'Chat history cleared.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo-section">
          <div className="logo-badge">⚡</div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI HACKATHON</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Starter Template
            </span>
          </div>
        </div>

        <div className="status-badge" style={serverInfo.status === 'offline' ? {
          color: '#ef4444',
          borderColor: 'rgba(239, 68, 68, 0.2)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)'
        } : {}}>
          <div className="status-dot" style={serverInfo.status === 'offline' ? {
            backgroundColor: '#ef4444',
            boxShadow: '0 0 8px #ef4444',
            animation: 'none'
          } : {}} />
          {serverInfo.status === 'online' ? 'EC2 Connected' : 'Local Only / Offline'}
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h1>Build Something Legendary</h1>
        <p style={{ maxWidth: '600px', margin: '0' }}>
          This boilerplate bridges your frontend and backend seamlessly. Modify files locally, 
          push to GitHub, and watch GitHub Actions deploy to AWS automatically.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Play Area (Left) */}
        <div className="glass-card chat-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>AI Playground</h3>
            <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={clearChat}>
              Clear Chat
            </button>
          </div>

          <div className="messages-list">
            {messages.map((msg, i) => (
              <div key={i} className={`message-bubble ${msg.sender}`}>
                <div style={{ fontSize: '0.95rem' }}>{msg.text}</div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--text-muted)', 
                  textAlign: msg.sender === 'user' ? 'right' : 'left',
                  marginTop: '0.25rem' 
                }}>
                  {msg.time}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="message-bubble assistant" style={{ opacity: 0.7 }}>
                <span className="pulse">Backend is thinking...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-row">
            <input
              type="text"
              className="text-input"
              placeholder="Ask the AI backend..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
            />
            <button type="submit" className="btn" disabled={isSending || !inputText.trim()}>
              Send 🚀
            </button>
          </form>
        </div>

        {/* Server & CI/CD status (Right) */}
        <div className="details-panel">
          {/* Environment */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Environment Details</h3>
            <div className="detail-section">
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value" style={{ color: serverInfo.status === 'online' ? 'var(--accent-emerald)' : '#ef4444' }}>
                  {serverInfo.status.toUpperCase()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">EC2 Public IP</span>
                <span className="detail-value">{serverInfo.ec2_ip}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Backend Stack</span>
                <span className="detail-value">{serverInfo.framework} ({serverInfo.backend})</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Environment</span>
                <span className="detail-value">{serverInfo.env}</span>
              </div>
            </div>
          </div>

          {/* Prompt / API Reference */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>API Endpoint Test</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              Your FastAPI backend exposes these endpoints:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="code-snippet">
                GET /api/status
              </div>
              <div className="code-snippet">
                POST /api/generate
                <br />
                {`{ "prompt": "Hello!" }`}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass-card interactive-card" style={{ cursor: 'pointer' }} onClick={() => window.open('/docs', '_blank')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>FastAPI Swagger Docs</h4>
                <p style={{ fontSize: '0.8rem', margin: 0 }}>View interactive API testing panel</p>
              </div>
              <span style={{ fontSize: '1.25rem' }}>📖</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)' }}>
          Hackathon Deployer Boilerplate. AWS EC2 t3.small + Docker Compose + GitHub Actions.
        </p>
      </footer>
    </div>
  )
}

export default App
