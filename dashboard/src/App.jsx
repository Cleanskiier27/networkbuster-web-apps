import React from 'react';
import './App.css';

function App() {
  return (
    <div className="container">
      <h1>Vercel Admin Dashboard</h1>
      <p>Welcome to the Vercel admin template. Use this dashboard to manage your deployments and settings.</p>
      <div className="admin-panel">
        <h2>Project Overview</h2>
        <ul>
          <li>Environment: <strong>Production</strong></li>
          <li>Status: <strong>Online</strong></li>
          <li>Last Deploy: <strong>Just now</strong></li>
        </ul>
      </div>
    </div>
  );
}

export default App;
