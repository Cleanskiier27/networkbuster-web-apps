# Implementation Guide: AI Training & Personalization

## Quick Start

This guide walks through implementing AI training and data personalization in the NetworkBuster platform.

## Prerequisites

```bash
# Required packages
pip install scikit-learn pandas numpy tensorflow
pip install flask redis sqlalchemy
npm install express redis ioredis
```

## Step 1: Set Up Data Collection

### Backend Event Tracking (Node.js/Express)

```javascript
// api/routes/events.js
const express = require('express');
const redis = require('ioredis');
const router = express.Router();

const redisClient = new redis();

router.post('/api/events', async (req, res) => {
  try {
    const event = {
      userId: req.body.userId,
      sessionId: req.body.sessionId,
      eventType: req.body.eventType,
      timestamp: new Date().toISOString(),
      data: req.body.data,
      context: req.body.context
    };
    
    // Store event in Redis for real-time processing
    await redisClient.lpush('events:stream', JSON.stringify(event));
    
    // Also store for batch processing
    const date = new Date().toISOString().split('T')[0];
    await redisClient.lpush(`events:${date}`, JSON.stringify(event));
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

module.exports = router;
```

### Frontend Event Tracking (JavaScript)

```javascript
// web-app/src/utils/analytics.js
class Analytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserId() {
    // Get from localStorage or authentication service
    return localStorage.getItem('userId') || 'anonymous';
  }

  async track(eventType, eventData = {}) {
    const event = {
      userId: this.userId,
      sessionId: this.sessionId,
      eventType,
      data: eventData,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    };

    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  trackPageView(pageName) {
    this.track('page_view', { pageName });
  }

  trackClick(elementId, context = {}) {
    this.track('click', { elementId, ...context });
  }

  trackSearch(query) {
    this.track('search', { query });
  }

  trackEngagement(contentId, timeSpent) {
    this.track('engagement', { contentId, timeSpent });
  }
}

export const analytics = new Analytics();
```

## Step 2: Feature Engineering Pipeline

### Python Feature Engineering Script

```python
# data/features/engineer.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
from typing import Dict, List, Tuple

class FeatureEngineer:
    def __init__(self, redis_client, db_connection):
        self.redis = redis_client
        self.db = db_connection
    
    def load_user_events(self, user_id: str, days: int = 30) -> List[Dict]:
        """Load user events from the last N days"""
        events = []
        
        for i in range(days):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            key = f"events:{date}"
            
            raw_events = self.redis.lrange(key, 0, -1)
            for event_data in raw_events:
                event = json.loads(event_data)
                if event.get('userId') == user_id:
                    events.append(event)
        
        return events
    
    def create_user_features(self, user_id: str) -> Dict:
        """Create comprehensive user feature vector"""
        events = self.load_user_events(user_id)
        
        if not events:
            return self._create_default_features()
        
        df = pd.DataFrame(events)
        
        features = {
            'user_id': user_id,
            
            # Behavioral features
            'total_events': len(df),
            'unique_sessions': df['sessionId'].nunique(),
            'session_frequency': len(df) / max(1, df['sessionId'].nunique()),
            
            # Event type distribution
            'page_view_count': len(df[df['eventType'] == 'page_view']),
            'click_count': len(df[df['eventType'] == 'click']),
            'search_count': len(df[df['eventType'] == 'search']),
            'engagement_count': len(df[df['eventType'] == 'engagement']),
            
            # Time-based features
            'last_active': df['timestamp'].max(),
            'activity_recency_hours': self._get_hours_since(df['timestamp'].max()),
            'active_hours': self._extract_active_hours(df),
            'active_days': self._extract_active_days(df),
            
            # Content features
            'top_categories': self._get_top_categories(df),
            'content_affinity': self._calculate_content_affinity(df),
            
            # Engagement metrics
            'avg_session_duration': self._calculate_avg_session_duration(df),
            'bounce_rate': self._calculate_bounce_rate(df),
            'engagement_rate': self._calculate_engagement_rate(df),
        }
        
        return features
    
    def _create_default_features(self) -> Dict:
        """Create default feature vector for new users"""
        return {
            'total_events': 0,
            'unique_sessions': 0,
            'session_frequency': 0,
            'page_view_count': 0,
            'click_count': 0,
            'search_count': 0,
            'engagement_count': 0,
            'last_active': None,
            'activity_recency_hours': float('inf'),
            'active_hours': [],
            'active_days': [],
            'top_categories': [],
            'content_affinity': {},
            'avg_session_duration': 0,
            'bounce_rate': 1.0,
            'engagement_rate': 0,
        }
    
    def _get_hours_since(self, timestamp: str) -> float:
        """Get hours since a timestamp"""
        if not timestamp:
            return float('inf')
        
        event_time = pd.to_datetime(timestamp)
        now = datetime.now()
        delta = now - event_time
        return delta.total_seconds() / 3600
    
    def _extract_active_hours(self, df: pd.DataFrame) -> List[int]:
        """Extract which hours user is most active"""
        df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
        hour_counts = df['hour'].value_counts().head(5).index.tolist()
        return sorted(hour_counts)
    
    def _extract_active_days(self, df: pd.DataFrame) -> List[str]:
        """Extract which days user is most active"""
        df['day'] = pd.to_datetime(df['timestamp']).dt.day_name()
        day_counts = df['day'].value_counts().head(3).index.tolist()
        return day_counts
    
    def _get_top_categories(self, df: pd.DataFrame) -> List[str]:
        """Get user's top content categories"""
        data_col = df['data'].apply(lambda x: x.get('category') if isinstance(x, dict) else None)
        top_cats = data_col.value_counts().head(5).index.tolist()
        return [str(c) for c in top_cats if c]
    
    def _calculate_content_affinity(self, df: pd.DataFrame) -> Dict:
        """Calculate affinity scores for content types"""
        affinities = {}
        
        for event_type in df['eventType'].unique():
            count = len(df[df['eventType'] == event_type])
            affinities[event_type] = count / len(df)
        
        return affinities
    
    def _calculate_avg_session_duration(self, df: pd.DataFrame) -> float:
        """Calculate average session duration"""
        grouped = df.groupby('sessionId')['timestamp'].agg(['min', 'max'])
        durations = (pd.to_datetime(grouped['max']) - 
                     pd.to_datetime(grouped['min'])).dt.total_seconds()
        return durations.mean() if len(durations) > 0 else 0
    
    def _calculate_bounce_rate(self, df: pd.DataFrame) -> float:
        """Calculate bounce rate (sessions with single event)"""
        sessions = df.groupby('sessionId').size()
        single_event_sessions = (sessions == 1).sum()
        return single_event_sessions / len(sessions) if len(sessions) > 0 else 0
    
    def _calculate_engagement_rate(self, df: pd.DataFrame) -> float:
        """Calculate engagement rate"""
        engagement_events = df[df['eventType'].isin(['click', 'engagement', 'search'])]
        return len(engagement_events) / len(df) if len(df) > 0 else 0
    
    def batch_create_features(self, user_ids: List[str]) -> pd.DataFrame:
        """Create features for multiple users"""
        features_list = []
        
        for user_id in user_ids:
            features = self.create_user_features(user_id)
            features_list.append(features)
        
        return pd.DataFrame(features_list)
    
    def save_features(self, features: Dict, user_id: str):
        """Save features to database"""
        # Store in database
        self.db.execute("""
            INSERT INTO user_features (user_id, features, created_at)
            VALUES (%s, %s, NOW())
            ON DUPLICATE KEY UPDATE features = %s, updated_at = NOW()
        """, (user_id, json.dumps(features), json.dumps(features)))
        
        # Cache in Redis for quick access
        self.redis.setex(
            f"features:{user_id}",
            3600,  # 1 hour TTL
            json.dumps(features)
        )
```

## Step 3: Model Training

### Training Script

```python
# data/models/train.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import json
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelTrainer:
    def __init__(self, model_dir='models'):
        self.model_dir = model_dir
        self.scaler = StandardScaler()
    
    def load_training_data(self, query: str) -> pd.DataFrame:
        """Load training data from database"""
        # Fetch features and labels from database
        df = pd.read_sql(query, con=db_connection)
        return df
    
    def prepare_data(self, df: pd.DataFrame, target_col: str) -> Tuple:
        """Prepare data for training"""
        # Separate features and target
        X = df.drop(columns=[target_col, 'user_id', 'created_at'])
        y = df[target_col]
        
        # Fill missing values
        X = X.fillna(X.mean())
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        return X_train_scaled, X_test_scaled, y_train, y_test, X.columns.tolist()
    
    def train_conversion_model(self, df: pd.DataFrame):
        """Train conversion prediction model"""
        logger.info("Training conversion model...")
        
        X_train, X_test, y_train, y_test, feature_names = self.prepare_data(
            df, 'converted'
        )
        
        # Train model
        model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        model.fit(X_train, y_train)
        
        # Evaluate
        train_score = model.score(X_train, y_train)
        test_score = model.score(X_test, y_test)
        
        logger.info(f"Train score: {train_score:.4f}, Test score: {test_score:.4f}")
        
        # Save model
        model_path = f"{self.model_dir}/conversion_model_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
        joblib.dump({
            'model': model,
            'scaler': self.scaler,
            'features': feature_names,
            'train_score': train_score,
            'test_score': test_score,
            'trained_at': datetime.now().isoformat()
        }, model_path)
        
        logger.info(f"Model saved to {model_path}")
        
        return model
    
    def train_churn_model(self, df: pd.DataFrame):
        """Train churn prediction model"""
        logger.info("Training churn model...")
        
        # Create churn label (user inactive for 30+ days)
        df['churn'] = (df['activity_recency_hours'] > 30 * 24).astype(int)
        
        X_train, X_test, y_train, y_test, feature_names = self.prepare_data(
            df, 'churn'
        )
        
        model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        model.fit(X_train, y_train)
        
        train_score = model.score(X_train, y_train)
        test_score = model.score(X_test, y_test)
        
        logger.info(f"Train score: {train_score:.4f}, Test score: {test_score:.4f}")
        
        model_path = f"{self.model_dir}/churn_model_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
        joblib.dump({
            'model': model,
            'scaler': self.scaler,
            'features': feature_names,
            'train_score': train_score,
            'test_score': test_score,
            'trained_at': datetime.now().isoformat()
        }, model_path)
        
        logger.info(f"Model saved to {model_path}")
        
        return model

# Usage
if __name__ == '__main__':
    trainer = ModelTrainer()
    
    # Load training data
    query = """
        SELECT * FROM user_features 
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 90 DAY)
    """
    df = trainer.load_training_data(query)
    
    # Train models
    trainer.train_conversion_model(df)
    trainer.train_churn_model(df)
```

## Step 4: Deploy Personalization Engine

### Flask API Endpoint

```python
# api/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import json
import redis
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load models
conversion_model = joblib.load('models/conversion_model.pkl')
churn_model = joblib.load('models/churn_model.pkl')

redis_client = redis.Redis(host='localhost', port=6379, db=0)

@app.route('/api/personalize/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    try:
        # Get user features from cache
        cached_features = redis_client.get(f"features:{user_id}")
        
        if cached_features:
            features = json.loads(cached_features)
        else:
            # Compute features if not cached
            features = compute_user_features(user_id)
        
        # Get recommendations
        recommendations = generate_recommendations(user_id, features)
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/personalize/churn/<user_id>', methods=['GET'])
def get_churn_risk(user_id):
    try:
        features = get_cached_features(user_id)
        feature_vector = extract_feature_vector(features)
        
        # Predict churn probability
        churn_prob = churn_model['model'].predict_proba([feature_vector])[0, 1]
        
        risk_level = 'high' if churn_prob > 0.7 else 'medium' if churn_prob > 0.4 else 'low'
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'churn_probability': float(churn_prob),
            'risk_level': risk_level
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_recommendations(user_id, features):
    """Generate content recommendations for user"""
    # Implementation here
    return [
        {'id': 'content_1', 'score': 0.95},
        {'id': 'content_2', 'score': 0.87},
        {'id': 'content_3', 'score': 0.82}
    ]

if __name__ == '__main__':
    app.run(debug=False, port=5000)
```

## Step 5: Integration with Frontend

```javascript
// web-app/src/hooks/usePersonalization.js
import { useEffect, useState } from 'react';

export function usePersonalization(userId) {
  const [recommendations, setRecommendations] = useState([]);
  const [churnRisk, setChurnRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonalization = async () => {
      try {
        const [recsRes, riskRes] = await Promise.all([
          fetch(`/api/personalize/recommendations/${userId}`),
          fetch(`/api/personalize/churn/${userId}`)
        ]);

        const recsData = await recsRes.json();
        const riskData = await riskRes.json();

        setRecommendations(recsData.recommendations || []);
        setChurnRisk(riskData.risk_level || null);
      } catch (error) {
        console.error('Error fetching personalization:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPersonalization();
    }
  }, [userId]);

  return { recommendations, churnRisk, loading };
}
```

## Step 6: Testing

```python
# tests/test_personalization.py
import pytest
import json
from datetime import datetime
from data.features.engineer import FeatureEngineer
from api.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_event_tracking(client):
    """Test event tracking endpoint"""
    event = {
        'userId': 'test_user',
        'sessionId': 'session_123',
        'eventType': 'page_view',
        'data': {'pageName': 'home'},
        'context': {'userAgent': 'Test'}
    }
    
    response = client.post('/api/events', 
                          data=json.dumps(event),
                          content_type='application/json')
    
    assert response.status_code == 200

def test_feature_engineering():
    """Test feature engineering"""
    engineer = FeatureEngineer(redis_client=None, db_connection=None)
    
    default_features = engineer._create_default_features()
    
    assert 'user_id' not in default_features
    assert 'total_events' in default_features
    assert default_features['total_events'] == 0

def test_recommendations_endpoint(client):
    """Test recommendations endpoint"""
    response = client.get('/api/personalize/recommendations/test_user')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'recommendations' in data
```

## Deployment Checklist

- [ ] Data pipeline running and collecting events
- [ ] Feature engineering working on schedule
- [ ] Models trained and validated
- [ ] API endpoints operational
- [ ] Frontend integrated with personalization
- [ ] Monitoring and alerting configured
- [ ] Privacy controls implemented
- [ ] Documentation complete

---

**Last Updated**: December 2024
**Version**: 1.0
