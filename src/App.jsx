import { useState } from 'react'
import './App.css'
import TeamMembers from './TeamMembers'
import Overlay from './Overlay'
import Dashboard from './Dashboard'
import Secrets from './Secrets'

function App() {
  const [count, setCount] = useState(0)
  const [currentPage, setCurrentPage] = useState('overlay')
  const [headerExpanded, setHeaderExpanded] = useState(true)
  const [videoSize, setVideoSize] = useState('medium') // small, medium, large, fullscreen

  const handleNavigation = (e, page) => {
    e.preventDefault()
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  const cycleVideoSize = () => {
    const sizes = ['small', 'medium', 'large', 'fullscreen']
    const currentIndex = sizes.indexOf(videoSize)
    setVideoSize(sizes[(currentIndex + 1) % sizes.length])
  }

  return (
    <div className="app-container">
      <header className={`app-header ${headerExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="header-top">
          <div className="header-title">
            <h1>🚀 NetworkBuster</h1>
            <p>Real-Time Monitoring & Analytics Platform</p>
          </div>
          <button 
            className="btn-toggle-header" 
            onClick={() => setHeaderExpanded(!headerExpanded)}
            title={headerExpanded ? 'Collapse header' : 'Expand header'}
          >
            {headerExpanded ? '−' : '+'}
          </button>
        </div>

        {headerExpanded && (
          <div className="header-expanded">
            <div className="header-info">
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className="status-badge online">🟢 Online</span>
              </div>
              <div className="info-item">
                <span className="info-label">Port</span>
                <span className="info-value">5173</span>
              </div>
              <div className="info-item">
                <span className="info-label">Backend</span>
                <span className="info-value">3001</span>
              </div>
              <div className="info-item">
                <span className="info-label">Version</span>
                <span className="info-value">1.0.1</span>
              </div>
            </div>

            {currentPage === 'overlay' && (
              <div className="header-video-controls">
                <span className="video-label">Video Size:</span>
                <button className="btn-video-size" onClick={cycleVideoSize}>
                  📹 {videoSize.charAt(0).toUpperCase() + videoSize.slice(1)}
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <nav className="app-nav">
        <ul>
          <li><a href="/overlay" onClick={(e) => handleNavigation(e, 'overlay')}>Overlay</a></li>
          <li><a href="/dashboard" onClick={(e) => handleNavigation(e, 'dashboard')}>Dashboard</a></li>
          <li><a href="/secrets" onClick={(e) => handleNavigation(e, 'secrets')}>Secrets</a></li>
          <li><a href="/team" onClick={(e) => handleNavigation(e, 'team')}>Team</a></li>
          <li><a href="http://localhost:3001/home" target="_blank">Backend Home</a></li>
        </ul>
      </nav>

      <main className="app-main" data-video-size={videoSize}>
        {currentPage === 'overlay' && <Overlay videoSize={videoSize} />}
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'secrets' && <Secrets />}
        {currentPage === 'team' && <TeamMembers />}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 NetworkBuster Development Platform</p>
      </footer>
    </div>
  )
}

export default App
