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
    env: 'Docker Compose',
    ec2_ip: '13.206.221.56'
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setServerInfo({
            status: 'active',
            backend: data.backend || 'Python 3.11.15',
            framework: data.framework || 'FastAPI',
            env: data.env || 'Docker Compose',
            ec2_ip: data.ec2_ip || '13.206.221.56'
          });
        }
      } catch (err) {
        console.error(err);
        setServerInfo(prev => ({ ...prev, status: 'inactive' }));
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <div className="status-card">
        {/* Status Indicator Row */}
        <div className="status-header">
          <div className="status-indicator">
            <span className={`status-dot ${serverInfo.status}`}></span>
            <span className="status-label">
              SYSTEM {serverInfo.status.toUpperCase()}
            </span>
          </div>
          <span className="badge">AWS EC2</span>
        </div>

        {/* Title */}
        <div className="title-section">
          <h1>Deployment Node Status</h1>
          <p className="subtitle">
            Automated CI/CD pipeline verification dashboard
          </p>
        </div>

        {/* Details Table */}
        <div className="details-list">
          <div className="detail-row">
            <span className="label">Instance Host</span>
            <span className="value monospace">ec2-13-206-221-56.ap-south-1.compute.amazonaws.com</span>
          </div>
          <div className="detail-row">
            <span className="label">Public IP Address</span>
            <span className="value monospace">{serverInfo.ec2_ip}</span>
          </div>
          <div className="detail-row">
            <span className="label">Stack</span>
            <span className="value">{serverInfo.framework} / {serverInfo.backend}</span>
          </div>
          <div className="detail-row">
            <span className="label">Environment</span>
            <span className="value">{serverInfo.env}</span>
          </div>
          <div className="detail-row">
            <span className="label">Pipeline</span>
            <span className="value">GitHub Actions (Continuous Deployment)</span>
          </div>
        </div>

        {/* Footer */}
        <div className="status-footer">
          <span>Connected successfully</span>
          <span>Last checked: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>
    </div>
  )
}

export default App
