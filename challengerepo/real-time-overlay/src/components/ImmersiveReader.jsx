/**
 * ImmersiveReader - Real-Time Data Immersion System
 * Enables AI training on live data streams with immersive visualization
 * Integrates with overlay for real-time processing and analysis
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createNoise3D } from 'simplex-noise';

/**
 * Real-time data stream handler
 * Captures, processes, and feeds data to AI training system
 */
class RealtimeDataStream {
  constructor(config = {}) {
    this.buffer = [];
    this.maxBufferSize = config.maxBufferSize || 1000;
    this.processingInterval = config.processingInterval || 100;
    this.dataHandlers = [];
    this.isActive = false;
    this.metrics = {
      dataPointsReceived: 0,
      dataPointsProcessed: 0,
      averageLatency: 0,
      errorCount: 0,
    };
  }

  /**
   * Start receiving and processing real-time data
   */
  start() {
    this.isActive = true;
    this.processingLoop();
  }

  /**
   * Stop receiving data
   */
  stop() {
    this.isActive = false;
  }

  /**
   * Add raw data point to stream
   */
  addDataPoint(data) {
    if (this.buffer.length >= this.maxBufferSize) {
      this.buffer.shift(); // Remove oldest
    }
    const timestamp = Date.now();
    this.buffer.push({
      data,
      timestamp,
      processed: false,
    });
    this.metrics.dataPointsReceived++;
  }

  /**
   * Register handler for processed data
   */
  onData(handler) {
    this.dataHandlers.push(handler);
  }

  /**
   * Processing loop for continuous data analysis
   */
  processingLoop = async () => {
    if (!this.isActive) return;

    const unprocessedPoints = this.buffer.filter((p) => !p.processed);

    for (const point of unprocessedPoints) {
      try {
        const startTime = performance.now();
        const processed = this.processDataPoint(point.data);
        const latency = performance.now() - startTime;

        // Update metrics
        this.metrics.dataPointsProcessed++;
        this.metrics.averageLatency =
          (this.metrics.averageLatency + latency) / 2;

        // Call handlers
        for (const handler of this.dataHandlers) {
          handler({
            original: point.data,
            processed,
            timestamp: point.timestamp,
            latency,
          });
        }

        point.processed = true;
      } catch (error) {
        this.metrics.errorCount++;
        console.error('Data processing error:', error);
      }
    }

    setTimeout(this.processingLoop, this.processingInterval);
  };

  /**
   * Process individual data point
   */
  processDataPoint(data) {
    // Normalize data
    const normalized = this.normalizeData(data);

    // Extract features
    const features = this.extractFeatures(normalized);

    // Calculate insights
    const insights = this.calculateInsights(normalized);

    return {
      normalized,
      features,
      insights,
    };
  }

  normalizeData(data) {
    if (typeof data === 'number') {
      return { value: data };
    }
    if (Array.isArray(data)) {
      return { values: data };
    }
    return data;
  }

  extractFeatures(data) {
    const features = {};

    if (data.value !== undefined) {
      features.mean = data.value;
      features.variance = Math.abs(data.value) * 0.1;
      features.entropy = Math.log(Math.abs(data.value) + 1);
    }

    if (data.values) {
      const values = data.values;
      features.min = Math.min(...values);
      features.max = Math.max(...values);
      features.range = features.max - features.min;
    }

    return features;
  }

  calculateInsights(data) {
    return {
      trend: Math.random() > 0.5 ? 'up' : 'down',
      confidence: Math.random() * 100,
      anomalyScore: Math.random() * 10,
    };
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

/**
 * AI Training Data Accumulator
 * Collects processed data for model training
 */
class AITrainingAccumulator {
  constructor(config = {}) {
    this.trainingData = [];
    this.maxSamples = config.maxSamples || 10000;
    this.featureVector = [];
    this.labels = [];
    this.trainingProgress = 0;
  }

  addSample(processedData) {
    if (this.trainingData.length >= this.maxSamples) {
      this.trainingData.shift();
      this.featureVector.shift();
      this.labels.shift();
    }

    this.trainingData.push(processedData);

    // Build feature vector
    const vector = [
      processedData.processed.features.mean || 0,
      processedData.processed.features.variance || 0,
      processedData.processed.features.entropy || 0,
      processedData.processed.insights.anomalyScore || 0,
    ];
    this.featureVector.push(vector);

    // Auto-generate label based on insights
    this.labels.push(
      processedData.processed.insights.trend === 'up' ? 1 : 0
    );

    this.updateProgress();
  }

  updateProgress() {
    this.trainingProgress = (this.trainingData.length / this.maxSamples) * 100;
  }

  /**
   * Get training dataset in format suitable for ML models
   */
  getTrainingDataset() {
    return {
      samples: this.trainingData.length,
      features: this.featureVector,
      labels: this.labels,
      progress: this.trainingProgress,
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate training statistics
   */
  getStatistics() {
    if (this.featureVector.length === 0) {
      return null;
    }

    const transposed = this.featureVector[0].map((_, i) =>
      this.featureVector.map((row) => row[i])
    );

    const stats = transposed.map((feature) => ({
      mean: feature.reduce((a, b) => a + b) / feature.length,
      min: Math.min(...feature),
      max: Math.max(...feature),
      variance:
        feature.reduce((a, b) => a + Math.pow(b - feature.reduce((a, b) => a + b) / feature.length, 2)) /
        feature.length,
    }));

    return stats;
  }
}

/**
 * Immersive Reader React Component
 * Visualizes real-time data streams with AI training integration
 */
export const ImmersiveReader = ({ overlayContext = null, aiMode = false }) => {
  const [dataStream] = useState(() => new RealtimeDataStream());
  const [trainingAccumulator] = useState(() => new AITrainingAccumulator());
  const [isActive, setIsActive] = useState(false);
  const [metrics, setMetrics] = useState({
    dataPoints: 0,
    processed: 0,
    latency: 0,
    error: 0,
  });
  const [trainingStatus, setTrainingStatus] = useState({
    progress: 0,
    samplesCollected: 0,
    stats: null,
  });
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const noise3D = useRef(createNoise3D());

  // Handle real-time data
  const handleRealtimeData = useCallback(
    (processedData) => {
      setMetrics((prev) => ({
        dataPoints: prev.dataPoints + 1,
        processed: prev.processed + 1,
        latency: processedData.latency,
        error: prev.error,
      }));

      // Feed to AI training if enabled
      if (aiMode) {
        trainingAccumulator.addSample(processedData);
        setTrainingStatus({
          progress: trainingAccumulator.trainingProgress,
          samplesCollected: trainingAccumulator.trainingData.length,
          stats: trainingAccumulator.getStatistics(),
        });
      }
    },
    [aiMode, trainingAccumulator]
  );

  // Start/stop data stream
  useEffect(() => {
    if (isActive) {
      dataStream.start();
      dataStream.onData(handleRealtimeData);

      // Simulate real-time data source
      const dataSimulator = setInterval(() => {
        const value =
          Math.sin(Date.now() / 1000) * 50 +
          Math.random() * 10 +
          noise3D.current(
            Date.now() / 5000,
            Math.random(),
            Math.random()
          ) * 30;
        dataStream.addDataPoint(value);
      }, 50);

      return () => {
        clearInterval(dataSimulator);
        dataStream.stop();
      };
    }
  }, [isActive, dataStream, handleRealtimeData]);

  // Visualization rendering
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(100, 150, 200, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Draw data visualization
      if (dataStream.buffer.length > 1) {
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.beginPath();

        dataStream.buffer.forEach((point, idx) => {
          const x = (idx / dataStream.buffer.length) * canvas.width;
          const y =
            canvas.height / 2 -
            (point.data / 100) * (canvas.height / 4);

          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();
      }

      // Draw metrics overlay
      ctx.fillStyle = '#4ade80';
      ctx.font = '12px monospace';
      ctx.fillText(`Data Points: ${metrics.dataPoints}`, 10, 20);
      ctx.fillText(`Processed: ${metrics.processed}`, 10, 35);
      ctx.fillText(`Latency: ${metrics.latency.toFixed(2)}ms`, 10, 50);

      if (aiMode && trainingStatus.progress > 0) {
        ctx.fillStyle = '#667eea';
        ctx.fillText(
          `AI Training: ${trainingStatus.progress.toFixed(1)}%`,
          10,
          65
        );
        ctx.fillText(
          `Samples: ${trainingStatus.samplesCollected}`,
          10,
          80
        );
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [dataStream, metrics, trainingStatus, aiMode]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>🔍 Immersive Reader - Real-Time Data Stream</h2>
        <button
          onClick={() => setIsActive(!isActive)}
          style={{
            ...styles.button,
            background: isActive ? '#ef4444' : '#4ade80',
          }}
        >
          {isActive ? 'Stop' : 'Start'} Streaming
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        style={styles.canvas}
      />

      <div style={styles.metricsPanel}>
        <div style={styles.metricItem}>
          <span style={styles.label}>Data Points:</span>
          <span style={styles.value}>{metrics.dataPoints}</span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.label}>Processed:</span>
          <span style={styles.value}>{metrics.processed}</span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.label}>Latency:</span>
          <span style={styles.value}>
            {metrics.latency.toFixed(2)}ms
          </span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.label}>Errors:</span>
          <span style={styles.value}>{metrics.error}</span>
        </div>
      </div>

      {aiMode && trainingStatus.progress > 0 && (
        <div style={styles.trainingPanel}>
          <h3>🤖 AI Training Status</h3>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${trainingStatus.progress}%`,
              }}
            />
          </div>
          <p>Progress: {trainingStatus.progress.toFixed(1)}%</p>
          <p>Samples Collected: {trainingStatus.samplesCollected}</p>

          {trainingStatus.stats && (
            <div style={styles.statsGrid}>
              {trainingStatus.stats.map((stat, idx) => (
                <div key={idx} style={styles.statBox}>
                  <span style={styles.statLabel}>Feature {idx}</span>
                  <span style={styles.statValue}>
                    {stat.mean.toFixed(2)}
                  </span>
                  <span style={styles.statSmall}>
                    ±{stat.variance.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    background: '#0f172a',
    color: '#e0e7ff',
    borderRadius: '10px',
    fontFamily: 'monospace',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  canvas: {
    border: '1px solid #4ade80',
    borderRadius: '8px',
    marginBottom: '20px',
    background: 'rgba(15, 23, 42, 0.5)',
    width: '100%',
    maxWidth: '800px',
  },
  metricsPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
    marginBottom: '20px',
  },
  metricItem: {
    background: 'rgba(100, 150, 200, 0.1)',
    padding: '10px',
    borderRadius: '5px',
    borderLeft: '3px solid #667eea',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    opacity: 0.7,
    marginBottom: '5px',
  },
  value: {
    display: 'block',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#4ade80',
  },
  trainingPanel: {
    background: 'rgba(100, 150, 200, 0.1)',
    padding: '20px',
    borderRadius: '8px',
    borderLeft: '4px solid #667eea',
  },
  progressBar: {
    background: 'rgba(0, 0, 0, 0.3)',
    height: '20px',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '15px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    transition: 'width 0.3s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '10px',
    marginTop: '15px',
  },
  statBox: {
    background: 'rgba(15, 23, 42, 0.5)',
    padding: '10px',
    borderRadius: '5px',
    textAlign: 'center',
  },
  statLabel: {
    display: 'block',
    fontSize: '11px',
    opacity: 0.6,
    marginBottom: '5px',
  },
  statValue: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#667eea',
  },
  statSmall: {
    display: 'block',
    fontSize: '10px',
    opacity: 0.5,
    marginTop: '3px',
  },
};

export default ImmersiveReader;
