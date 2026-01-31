import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [specs, setSpecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/specs')
      .then(res => res.json())
      .then(data => {
        setSpecs(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container"><h2>Loading...</h2></div>;
  if (error) return <div className="container error"><h2>Error: {error}</h2></div>;

  return (
    <div className="container">
      <h1>🚀 NetworkBuster Dashboard</h1>
      <div className="specs-grid">
        {specs && Object.entries(specs).map(([key, value]) => (
          <div key={key} className="spec-card">
            <h3>{key.replace(/_/g, ' ').toUpperCase()}</h3>
            <pre>{JSON.stringify(value, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
