import './Secrets.css'
import { useState } from 'react'

function Secrets() {
  const [secrets, setSecrets] = useState([
    { id: 1, name: 'API_KEY_MAIN', status: 'active', created: '2025-01-15', expires: '2026-01-15', environment: 'production' },
    { id: 2, name: 'DB_PASSWORD', status: 'active', created: '2024-12-01', expires: '2025-12-01', environment: 'production' },
    { id: 3, name: 'GITHUB_TOKEN', status: 'active', created: '2025-02-10', expires: '2026-02-10', environment: 'staging' },
    { id: 4, name: 'JWT_SECRET', status: 'expiring', created: '2024-11-15', expires: '2025-12-20', environment: 'production' },
    { id: 5, name: 'STRIPE_KEY', status: 'active', created: '2025-01-20', expires: '2026-01-20', environment: 'production' },
    { id: 6, name: 'AWS_ACCESS_KEY', status: 'expired', created: '2024-08-15', expires: '2024-11-15', environment: 'staging' }
  ])

  const [showForm, setShowForm] = useState(false)
  const [newSecret, setNewSecret] = useState({
    name: '',
    environment: 'production',
    expiryDays: 365
  })

  const handleAddSecret = (e) => {
    e.preventDefault()
    const secret = {
      id: secrets.length + 1,
      name: newSecret.name,
      status: 'active',
      created: new Date().toISOString().split('T')[0],
      expires: new Date(Date.now() + newSecret.expiryDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      environment: newSecret.environment
    }
    setSecrets([...secrets, secret])
    setNewSecret({ name: '', environment: 'production', expiryDays: 365 })
    setShowForm(false)
  }

  const handleDeleteSecret = (id) => {
    setSecrets(secrets.filter(s => s.id !== id))
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'status-active'
      case 'expiring': return 'status-expiring'
      case 'expired': return 'status-expired'
      default: return 'status-active'
    }
  }

  const activeCount = secrets.filter(s => s.status === 'active').length
  const expiringCount = secrets.filter(s => s.status === 'expiring').length
  const expiredCount = secrets.filter(s => s.status === 'expired').length

  return (
    <div className="secrets-page">
      <div className="secrets-header">
        <h1>🔐 Secrets Management</h1>
        <p>Manage API keys, credentials, and environment variables</p>
      </div>

      <div className="secrets-content">
        {/* Stats Cards */}
        <section className="stats-section">
          <div className="stat-card active-card">
            <div className="stat-number">{activeCount}</div>
            <div className="stat-label">Active Secrets</div>
          </div>
          <div className="stat-card warning-card">
            <div className="stat-number">{expiringCount}</div>
            <div className="stat-label">Expiring Soon</div>
          </div>
          <div className="stat-card danger-card">
            <div className="stat-number">{expiredCount}</div>
            <div className="stat-label">Expired</div>
          </div>
        </section>

        {/* Add Secret Form */}
        <section className="form-section">
          {!showForm ? (
            <button className="btn-add-secret" onClick={() => setShowForm(true)}>
              + Add New Secret
            </button>
          ) : (
            <div className="add-secret-form">
              <h2>Create New Secret</h2>
              <form onSubmit={handleAddSecret}>
                <div className="form-group">
                  <label>Secret Name</label>
                  <input
                    type="text"
                    placeholder="e.g., API_KEY_PRODUCTION"
                    value={newSecret.name}
                    onChange={(e) => setNewSecret({...newSecret, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Environment</label>
                    <select
                      value={newSecret.environment}
                      onChange={(e) => setNewSecret({...newSecret, environment: e.target.value})}
                    >
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Expires In (days)</label>
                    <input
                      type="number"
                      min="1"
                      max="730"
                      value={newSecret.expiryDays}
                      onChange={(e) => setNewSecret({...newSecret, expiryDays: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-submit">Create Secret</button>
                  <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </section>

        {/* Secrets Table */}
        <section className="secrets-table-section">
          <h2>Active Secrets</h2>
          <div className="secrets-table">
            <div className="table-header">
              <div className="col-name">Secret Name</div>
              <div className="col-env">Environment</div>
              <div className="col-status">Status</div>
              <div className="col-created">Created</div>
              <div className="col-expires">Expires</div>
              <div className="col-actions">Actions</div>
            </div>
            {secrets.map(secret => (
              <div key={secret.id} className="table-row">
                <div className="col-name">
                  <code>{secret.name}</code>
                </div>
                <div className="col-env">
                  <span className={`env-badge env-${secret.environment}`}>
                    {secret.environment}
                  </span>
                </div>
                <div className="col-status">
                  <span className={`status-badge ${getStatusColor(secret.status)}`}>
                    {secret.status === 'active' && '✓ Active'}
                    {secret.status === 'expiring' && '⚠ Expiring'}
                    {secret.status === 'expired' && '✗ Expired'}
                  </span>
                </div>
                <div className="col-created">{secret.created}</div>
                <div className="col-expires">{secret.expires}</div>
                <div className="col-actions">
                  <button className="btn-rotate" title="Rotate Secret">🔄</button>
                  <button className="btn-copy" title="Copy Secret">📋</button>
                  <button 
                    className="btn-delete" 
                    title="Delete Secret"
                    onClick={() => handleDeleteSecret(secret.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Guidelines */}
        <section className="guidelines-section">
          <h2>🛡️ Security Guidelines</h2>
          <div className="guidelines-grid">
            <div className="guideline-card">
              <div className="guideline-icon">🔒</div>
              <h3>Never Share Secrets</h3>
              <p>Keep all secrets private and never commit them to version control.</p>
            </div>
            <div className="guideline-card">
              <div className="guideline-icon">🔄</div>
              <h3>Rotate Regularly</h3>
              <p>Rotate secrets at least every 90 days or immediately if compromised.</p>
            </div>
            <div className="guideline-card">
              <div className="guideline-icon">👁️</div>
              <h3>Audit Access</h3>
              <p>Monitor who accesses your secrets and when they're used.</p>
            </div>
            <div className="guideline-card">
              <div className="guideline-icon">🔑</div>
              <h3>Use Unique Keys</h3>
              <p>Create different secrets for different environments and services.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Secrets
