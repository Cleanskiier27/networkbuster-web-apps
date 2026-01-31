import './Overlay.css'
import { useState, useEffect } from 'react'

function Overlay({ videoSize = 'medium' }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Generate animated particles for visual effect
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="overlay-page">
      <div className="particle-background">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`
            }}
          />
        ))}
      </div>

      <div className="overlay-content">
        <section className="overlay-header">
          <h1>🎨 Real-Time Overlay</h1>
          <p>Advanced 3D Visualization & Interactive Monitoring</p>
        </section>

        <section className="overlay-stats">
          <div className="stat-card">
            <div className="stat-icon">📡</div>
            <h3>Network Status</h3>
            <p className="stat-value">99.99%</p>
            <p className="stat-label">Uptime</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <h3>Performance</h3>
            <p className="stat-value">&lt;50ms</p>
            <p className="stat-label">Response Time</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <h3>Security</h3>
            <p className="stat-value">A+</p>
            <p className="stat-label">Rating</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🌍</div>
            <h3>Global Reach</h3>
            <p className="stat-value">50+</p>
            <p className="stat-label">Regions</p>
          </div>
        </section>

        <section className="visualization-section">
          <h2>Live Metrics</h2>
          <div className="viz-grid">
            <div className="viz-item">
              <div className="viz-chart">
                <div className="bar" style={{height: '85%', animation: 'pulse 2s infinite'}}></div>
                <div className="bar" style={{height: '72%', animation: 'pulse 2.2s infinite'}}></div>
                <div className="bar" style={{height: '90%', animation: 'pulse 2.4s infinite'}}></div>
                <div className="bar" style={{height: '78%', animation: 'pulse 2.6s infinite'}}></div>
              </div>
              <p>Request Volume</p>
            </div>
            <div className="viz-item">
              <div className="viz-chart">
                <div className="line-chart">
                  <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                    <polyline points="0,30 25,20 50,25 75,10 100,15" fill="none" stroke="#667eea" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
              <p>Latency Trend</p>
            </div>
            <div className="viz-item">
              <div className="donut-chart">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#667eea" strokeWidth="8" strokeDasharray="62.8 100"/>
                </svg>
                <span>62.8%</span>
              </div>
              <p>CPU Usage</p>
            </div>
          </div>
        </section>

        <section className="network-map">
          <h2>Network Connections</h2>
          <div className="map-container">
            <div className="node primary-node">
              <div className="node-label">Main Server</div>
            </div>
            <div className="node secondary-node">
              <div className="node-label">Cache Layer</div>
            </div>
            <div className="node secondary-node">
              <div className="node-label">Database</div>
            </div>
            <div className="node secondary-node">
              <div className="node-label">API Gateway</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Overlay
