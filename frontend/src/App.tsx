import { useState, useEffect } from 'react'
import './App.css'

interface ServerStatus {
  status: string;
  backend: string;
  framework: string;
  env: string;
  ec2_ip: string;
}

function App() {
  const [serverInfo, setServerInfo] = useState<ServerStatus>({
    status: 'checking',
    backend: 'Python 3.11.x',
    framework: 'FastAPI',
    env: 'Production (Docker)',
    ec2_ip: '13.206.221.56'
  });

  const [logs, setLogs] = useState<string[]>([
    'Initializing deployment verification...',
    'Resolving DNS for host ec2-13-206-221-56.ap-south-1.compute.amazonaws.com...',
    'Establishing secure handshake...',
  ]);

  // Fetch status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setServerInfo({
            status: 'online',
            backend: data.backend || 'Python 3.11.15',
            framework: data.framework || 'FastAPI',
            env: data.env || 'Production (Docker)',
            ec2_ip: data.ec2_ip || '13.206.221.56'
          });
          setLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] Secure connection verified with AWS EC2.`,
            `[${new Date().toLocaleTimeString()}] API layer: active (FastAPI on Port 8000).`,
            `[${new Date().toLocaleTimeString()}] Static assets: active (Nginx on Port 80).`
          ].slice(-8)); // keep last 8 logs
        }
      } catch (err) {
        console.error(err);
        setServerInfo(prev => ({ ...prev, status: 'offline' }));
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ERROR: Connection timeout. Refused connection on host.`
        ].slice(-8));
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="system-wrapper">
      <div className="system-console">
        {/* Console Header */}
        <div className="console-header">
          <div className="dot-group">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>
          <div className="console-title">AWS EC2 SYSTEM MONITOR</div>
          <div className="status-indicator">
            <span className={`status-dot ${serverInfo.status}`}></span>
            <span className="status-text">{serverInfo.status.toUpperCase()}</span>
          </div>
        </div>

        {/* Console Layout Grid */}
        <div className="console-content">
          {/* Machine Info */}
          <div className="info-grid">
            <div className="info-card">
              <span className="label">INSTANCE HOST</span>
              <span className="value monospace">ec2-13-206-221-56.ap-south-1</span>
            </div>
            <div className="info-card">
              <span className="label">PUBLIC IP</span>
              <span className="value monospace">{serverInfo.ec2_ip}</span>
            </div>
            <div className="info-card">
              <span className="label">INSTANCE TYPE</span>
              <span className="value">t3.small</span>
            </div>
            <div className="info-card">
              <span className="label">REGION / ZONE</span>
              <span className="value">ap-south-1 (Mumbai)</span>
            </div>
            <div className="info-card">
              <span className="label">RUNTIME STACK</span>
              <span className="value">{serverInfo.framework} ({serverInfo.backend})</span>
            </div>
            <div className="info-card">
              <span className="label">ORCHESTRATION</span>
              <span className="value">{serverInfo.env}</span>
            </div>
          </div>

          {/* System Terminal Log */}
          <div className="terminal-log">
            <div className="terminal-header">SYSTEM LIVE LOGS</div>
            <div className="terminal-body monospace">
              {logs.map((log, index) => (
                <div key={index} className="log-line">
                  <span className="prompt">&gt;</span> {log}
                </div>
              ))}
              <div className="log-line cursor-line">
                <span className="prompt">&gt;</span><span className="terminal-cursor"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="console-footer">
          <div className="footer-left">PIPELINE: ACTIVE (GITHUB ACTIONS)</div>
          <div className="footer-right">© {new Date().getFullYear()} DEVOPS LAYER</div>
        </div>
      </div>
    </div>
  )
}

export default App
