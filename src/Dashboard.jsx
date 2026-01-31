import './Dashboard.css'
import { useState, useEffect } from 'react'

function Dashboard() {
  const [metrics, setMetrics] = useState({
    activeUsers: 1247,
    totalRequests: 52847,
    avgResponseTime: 45,
    errorRate: 0.23
  })

  const [chartData] = useState([
    { time: '00:00', value: 120 },
    { time: '04:00', value: 150 },
    { time: '08:00', value: 280 },
    { time: '12:00', value: 420 },
    { time: '16:00', value: 310 },
    { time: '20:00', value: 380 },
    { time: '24:00', value: 250 }
  ])

  const [services] = useState([
    { name: 'API Gateway', status: 'healthy', uptime: 99.99, latency: 12 },
    { name: 'Database', status: 'healthy', uptime: 99.95, latency: 28 },
    { name: 'Cache Layer', status: 'healthy', uptime: 99.98, latency: 5 },
    { name: 'Message Queue', status: 'healthy', uptime: 99.92, latency: 18 },
    { name: 'Auth Service', status: 'healthy', uptime: 100, latency: 8 },
    { name: 'Search Engine', status: 'warning', uptime: 99.87, latency: 156 }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        activeUsers: Math.max(1000, prev.activeUsers + Math.floor(Math.random() * 200 - 100)),
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 500),
        avgResponseTime: Math.max(30, Math.min(100, prev.avgResponseTime + Math.random() * 20 - 10)),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + Math.random() * 0.5 - 0.25))
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const maxValue = Math.max(...chartData.map(d => d.value))

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Real-time monitoring and analytics</p>
        <div className="header-status">
          <span className="status-indicator healthy"></span>
          <span>All Systems Operational</span>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Key Metrics */}
        <section className="metrics-section">
          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div className="metric-info">
              <h3>Active Users</h3>
              <p className="metric-value">{metrics.activeUsers.toLocaleString()}</p>
              <p className="metric-change">↑ 12.5% from last hour</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📡</div>
            <div className="metric-info">
              <h3>Total Requests</h3>
              <p className="metric-value">{metrics.totalRequests.toLocaleString()}</p>
              <p className="metric-change">↑ 8.3% from last hour</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⚡</div>
            <div className="metric-info">
              <h3>Avg Response Time</h3>
              <p className="metric-value">{metrics.avgResponseTime.toFixed(0)}ms</p>
              <p className="metric-change">↓ 2.1% from last hour</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⚠️</div>
            <div className="metric-info">
              <h3>Error Rate</h3>
              <p className="metric-value">{metrics.errorRate.toFixed(2)}%</p>
              <p className="metric-change">↓ 0.5% from last hour</p>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="charts-section">
          <div className="chart-container">
            <h2>Request Volume (24h)</h2>
            <div className="bar-chart">
              {chartData.map((data, idx) => (
                <div key={idx} className="chart-bar-wrapper">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${(data.value / maxValue) * 200}px`,
                      animation: `slideUp 0.5s ease-out ${idx * 0.1}s both`
                    }}
                  >
                    <span className="bar-value">{data.value}</span>
                  </div>
                  <span className="bar-label">{data.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-container">
            <h2>Service Health</h2>
            <div className="pie-chart">
              <div className="pie-stat">
                <div className="pie-item healthy-pie"></div>
                <span>Healthy (5)</span>
              </div>
              <div className="pie-stat">
                <div className="pie-item warning-pie"></div>
                <span>Warning (1)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Service Status Table */}
        <section className="services-section">
          <h2>Service Status</h2>
          <div className="services-table">
            <div className="table-header">
              <div className="col-service">Service</div>
              <div className="col-status">Status</div>
              <div className="col-uptime">Uptime</div>
              <div className="col-latency">Latency</div>
            </div>
            {services.map((service, idx) => (
              <div key={idx} className="table-row">
                <div className="col-service">{service.name}</div>
                <div className="col-status">
                  <span className={`status-badge ${service.status}`}>
                    {service.status === 'healthy' ? '✓ Healthy' : '⚠ Warning'}
                  </span>
                </div>
                <div className="col-uptime">
                  <div className="uptime-bar">
                    <div className="uptime-fill" style={{width: `${service.uptime}%`}}></div>
                  </div>
                  <span>{service.uptime}%</span>
                </div>
                <div className="col-latency">{service.latency}ms</div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="activity-section">
          <h2>Recent Activity</h2>
          <div className="activity-feed">
            <div className="activity-item success">
              <span className="activity-icon">✓</span>
              <div className="activity-text">
                <p><strong>Deployment completed</strong></p>
                <p className="activity-time">2 minutes ago</p>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">ℹ</span>
              <div className="activity-text">
                <p><strong>Database backup finished</strong></p>
                <p className="activity-time">15 minutes ago</p>
              </div>
            </div>
            <div className="activity-item warning">
              <span className="activity-icon">⚠</span>
              <div className="activity-text">
                <p><strong>High CPU usage detected</strong></p>
                <p className="activity-time">28 minutes ago</p>
              </div>
            </div>
            <div className="activity-item success">
              <span className="activity-icon">✓</span>
              <div className="activity-text">
                <p><strong>Cache cleared successfully</strong></p>
                <p className="activity-time">45 minutes ago</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
