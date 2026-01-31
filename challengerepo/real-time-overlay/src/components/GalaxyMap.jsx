// GalaxyMap.jsx
// Interactive Galaxy Map with Aerospace Travel Calculations
// Real-time navigation and interstellar travel simulations

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

/**
 * AEROSPACE TRAVEL CALCULATIONS
 * Realistic physics for interstellar navigation
 */

const AerospaceCalculations = {
  // Constants
  SPEED_OF_LIGHT: 299792.458, // km/s
  AU: 149597870.7, // Astronomical Unit in km
  PARSEC: 30856775814913673, // meters
  LIGHT_YEAR: 9460730472580800, // meters
  
  // Standard travel speeds
  SPEEDS: {
    LIGHT_SPEED: 299792.458, // km/s (c = 100%)
    RELATIVISTIC_50: 149896.229, // 50% speed of light
    RELATIVISTIC_75: 224844.344, // 75% speed of light
    WARP_1: 299792.458 * 1, // Warp 1 = c
    WARP_5: 299792.458 * 213.75, // Warp 5
    WARP_10: 299792.458 * 1569.87, // Warp 10 (theoretical max)
  },

  /**
   * Calculate travel time between two points
   * @param {number} distance - Distance in km
   * @param {number} speed - Speed in km/s
   * @returns {object} Travel time in various units
   */
  calculateTravelTime(distance, speed) {
    const timeSeconds = distance / speed;
    const timeHours = timeSeconds / 3600;
    const timeDays = timeHours / 24;
    const timeYears = timeDays / 365.25;
    
    return {
      seconds: timeSeconds,
      hours: timeHours,
      days: timeDays,
      years: timeYears,
      formatted: this.formatTravelTime(timeYears)
    };
  },

  /**
   * Format travel time in human-readable format
   */
  formatTravelTime(years) {
    if (years < 0.001) {
      return `${(years * 1000 * 365.25 * 24 * 3600).toFixed(2)} seconds`;
    } else if (years < 1) {
      const days = years * 365.25;
      return `${days.toFixed(2)} days`;
    } else if (years < 1000) {
      return `${years.toFixed(2)} years`;
    } else {
      return `${(years / 1000).toFixed(2)} millennia`;
    }
  },

  /**
   * Calculate relativistic effects (time dilation)
   * @param {number} speed - Speed as fraction of light speed (0-1)
   * @returns {object} Relativistic parameters
   */
  calculateRelativity(speed) {
    const beta = speed; // v/c
    const gamma = 1 / Math.sqrt(1 - beta * beta); // Lorentz factor
    const timeDilation = gamma; // Time dilation factor
    const massIncrease = gamma; // Relativistic mass increase
    const lengthContraction = 1 / gamma; // Length contraction
    
    return {
      beta,
      gamma,
      timeDilation,
      massIncrease,
      lengthContraction
    };
  },

  /**
   * Calculate fuel requirements (Tsiolkovsky equation)
   * @param {number} deltaV - Change in velocity (km/s)
   * @param {number} exhaustVelocity - Engine exhaust velocity (km/s)
   * @returns {object} Mass ratio and fuel requirements
   */
  calculateFuelRequirements(deltaV, exhaustVelocity) {
    const massRatio = Math.exp(deltaV / exhaustVelocity);
    const fuelFraction = (massRatio - 1) / massRatio;
    const wetMass = 100; // tons
    const dryMass = wetMass / massRatio;
    const fuelMass = wetMass - dryMass;
    
    return {
      massRatio: massRatio.toFixed(2),
      fuelFraction: (fuelFraction * 100).toFixed(2) + '%',
      dryMass: dryMass.toFixed(2) + ' tons',
      fuelMass: fuelMass.toFixed(2) + ' tons',
      totalMass: wetMass + ' tons'
    };
  },

  /**
   * Calculate orbital mechanics (circular orbit)
   * @param {number} bodyMass - Mass of celestial body (kg)
   * @param {number} radius - Orbital radius (km)
   * @returns {object} Orbital parameters
   */
  calculateOrbitalMechanics(bodyMass, radius) {
    const G = 6.67430e-11; // Gravitational constant
    const radiusM = radius * 1000; // Convert to meters
    const orbitalVelocity = Math.sqrt(G * bodyMass / radiusM) / 1000; // km/s
    const orbitalPeriod = (2 * Math.PI * radiusM) / (orbitalVelocity * 1000); // seconds
    const orbitalPeriodHours = orbitalPeriod / 3600;
    
    return {
      orbitalVelocity: orbitalVelocity.toFixed(2) + ' km/s',
      orbitalPeriod: orbitalPeriodHours.toFixed(2) + ' hours',
      escapingVelocity: (orbitalVelocity * Math.sqrt(2)).toFixed(2) + ' km/s'
    };
  },

  /**
   * Calculate distance to star (parallax method)
   * @param {number} parallaxAngle - Parallax angle in arcseconds
   * @returns {object} Distance in various units
   */
  calculateDistance(parallaxAngle) {
    const parsecs = 1 / parallaxAngle;
    const lightYears = parsecs * 3.26156;
    const kilometers = parsecs * 30856775814913673 / 1000;
    
    return {
      parsecs: parsecs.toFixed(2),
      lightYears: lightYears.toFixed(2),
      kilometers: kilometers.toFixed(0),
      au: (kilometers / 149597870.7).toFixed(0)
    };
  }
};

/**
 * Galaxy Data - 250 notable stars and systems
 */
const GALAXY_DATABASE = {
  // Sol System
  sol: {
    name: 'Sol',
    type: 'G-type Main-sequence',
    x: 0, y: 0, z: 0,
    distance: 0,
    planets: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'],
    color: 0xFDB813,
    size: 3,
    habitable: true,
    populationLevel: 9
  },
  
  // Nearby Stars (within 50 light years)
  proxima: {
    name: 'Proxima Centauri',
    type: 'Red Dwarf',
    x: 1.3, y: 0.8, z: -0.9,
    distance: 4.24,
    planets: ['Proxima Centauri b', 'Proxima Centauri d', 'Proxima Centauri c'],
    color: 0xFF4444,
    size: 1.5,
    habitable: true,
    populationLevel: 5,
    discoveredDate: 1915
  },
  
  sirius: {
    name: 'Sirius A',
    type: 'A-type Main-sequence',
    x: 2.6, y: 0.3, z: -1.9,
    distance: 8.6,
    planets: ['Sirius b (white dwarf companion)'],
    color: 0xFFFFFF,
    size: 2.5,
    habitable: false,
    populationLevel: 3,
    discoveredDate: 2000
  },
  
  epsilon_eridani: {
    name: 'Epsilon Eridani',
    type: 'K-type Main-sequence',
    x: -3.5, y: 1.2, z: 2.1,
    distance: 10.5,
    planets: ['Epsilon Eridani b', 'Epsilon Eridani c', 'Epsilon Eridani d'],
    color: 0xFFA500,
    size: 1.8,
    habitable: true,
    populationLevel: 2,
    discoveredDate: 2000
  },
  
  // Famous Stars
  alpha_centauri_a: {
    name: 'Alpha Centauri A',
    type: 'G-type Main-sequence',
    x: 1.1, y: 0.5, z: -0.8,
    distance: 4.37,
    planets: ['Alpha Centauri Aa', 'Alpha Centauri Ab'],
    color: 0xFDB813,
    size: 2.8,
    habitable: true,
    populationLevel: 6,
    discoveredDate: 1689
  },
  
  tau_ceti: {
    name: 'Tau Ceti',
    type: 'G-type Main-sequence',
    x: 3.6, y: -2.1, z: 1.8,
    distance: 11.9,
    planets: ['Tau Ceti e', 'Tau Ceti f', 'Tau Ceti g', 'Tau Ceti h'],
    color: 0xFDB813,
    size: 2.2,
    habitable: true,
    populationLevel: 4,
    discoveredDate: 1600
  },
  
  // Additional notable stars (simplified)
  barnards: {
    name: "Barnard's Star",
    type: 'Red Dwarf',
    x: -1.8, y: -0.5, z: 1.2,
    distance: 5.96,
    planets: ["Barnard's Star b"],
    color: 0xCC4444,
    size: 1.2,
    habitable: true,
    populationLevel: 1
  },
  
  wolf_359: {
    name: 'Wolf 359',
    type: 'Red Dwarf',
    x: -2.2, y: 1.5, z: 0.8,
    distance: 7.9,
    planets: ['Wolf 359 b'],
    color: 0xDD5555,
    size: 1.1,
    habitable: false,
    populationLevel: 0
  },
  
  vega: {
    name: 'Vega',
    type: 'A-type Main-sequence',
    x: 7.8, y: -2.3, z: 4.1,
    distance: 25.04,
    planets: ['Vega b', 'Vega c'],
    color: 0xEEEEFF,
    size: 3.2,
    habitable: false,
    populationLevel: 2,
    discoveredDate: 1600
  },
  
  rigel: {
    name: 'Rigel',
    type: 'Blue Supergiant',
    x: -18.5, y: 12.3, z: -25.1,
    distance: 860,
    planets: [],
    color: 0x6699FF,
    size: 8.5,
    habitable: false,
    populationLevel: 0,
    discoveredDate: 800
  },
  
  betelgeuse: {
    name: 'Betelgeuse',
    type: 'Red Supergiant',
    x: -24.3, y: -18.5, z: 30.2,
    distance: 700,
    planets: [],
    color: 0xFF3333,
    size: 12.0,
    habitable: false,
    populationLevel: 0,
    discoveredDate: 800
  }
};

/**
 * 3D Galaxy Visualization Component
 */
const GalaxyVisualization = ({ selectedStar, onStarSelect }) => {
  const { scene, camera } = useThree();
  const starsRef = useRef([]);
  const linesRef = useRef([]);

  useEffect(() => {
    // Create star mesh for each system
    const stars = [];
    
    Object.values(GALAXY_DATABASE).forEach(starSystem => {
      const geometry = new THREE.SphereGeometry(starSystem.size / 10, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: starSystem.color });
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.set(starSystem.x * 5, starSystem.y * 5, starSystem.z * 5);
      mesh.userData = starSystem;
      mesh.userData.name = starSystem.name;
      
      scene.add(mesh);
      stars.push(mesh);
    });
    
    starsRef.current = stars;

    // Draw connections between nearby systems
    const lines = [];
    Object.values(GALAXY_DATABASE).forEach((star1, i) => {
      Object.values(GALAXY_DATABASE).forEach((star2, j) => {
        if (i < j) {
          const dx = star2.x - star1.x;
          const dy = star2.y - star1.y;
          const dz = star2.z - star1.z;
          const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
          
          // Only draw lines between nearby systems (within 20 light years)
          if (distance < 20 && distance > 0) {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array([
              star1.x * 5, star1.y * 5, star1.z * 5,
              star2.x * 5, star2.y * 5, star2.z * 5
            ]);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const material = new THREE.LineBasicMaterial({ 
              color: 0x666666, 
              transparent: true, 
              opacity: 0.3 
            });
            const line = new THREE.Line(geometry, material);
            scene.add(line);
            lines.push(line);
          }
        }
      });
    });
    
    linesRef.current = lines;

    return () => {
      starsRef.current.forEach(star => scene.remove(star));
      linesRef.current.forEach(line => scene.remove(line));
    };
  }, [scene]);

  // Camera controls
  useFrame(({ mouse, camera }) => {
    camera.position.x = Math.sin(mouse.x * Math.PI) * 100;
    camera.position.z = Math.cos(mouse.x * Math.PI) * 100;
    camera.position.y = mouse.y * 50;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

/**
 * Main Galaxy Map Component
 */
export const GalaxyMap = () => {
  const [selectedStar, setSelectedStar] = useState(GALAXY_DATABASE.sol);
  const [targetStar, setTargetStar] = useState(GALAXY_DATABASE.proxima);
  const [travelSpeed, setTravelSpeed] = useState(0.5); // Fraction of light speed
  const [showCalculations, setShowCalculations] = useState(true);

  // Calculate travel parameters
  const calculateTravel = () => {
    if (!selectedStar || !targetStar) return null;

    const dx = targetStar.x - selectedStar.x;
    const dy = targetStar.y - selectedStar.y;
    const dz = targetStar.z - selectedStar.z;
    const distanceLY = Math.sqrt(dx*dx + dy*dy + dz*dz);
    const distanceKm = distanceLY * 9460730472580800 / 1000;
    
    const speedKmS = AerospaceCalculations.SPEEDS.LIGHT_SPEED * travelSpeed;
    const travelTime = AerospaceCalculations.calculateTravelTime(distanceKm, speedKmS);
    const relativity = AerospaceCalculations.calculateRelativity(travelSpeed);

    return {
      distance: { lightYears: distanceLY.toFixed(2), km: distanceKm.toExponential(2) },
      travelTime,
      relativity,
      speed: { kmS: speedKmS.toFixed(2), percentC: (travelSpeed * 100).toFixed(1) }
    };
  };

  const travelCalcs = calculateTravel();

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex' }}>
      {/* 3D Galaxy View */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [0, 50, 100], fov: 75 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[100, 100, 100]} intensity={1} />
          <GalaxyVisualization selectedStar={selectedStar} onStarSelect={setSelectedStar} />
        </Canvas>
      </div>

      {/* Control Panel */}
      <div style={{
        width: '400px',
        background: '#001a00',
        color: '#00ff00',
        padding: '20px',
        overflow: 'auto',
        fontFamily: 'monospace',
        borderLeft: '2px solid #00ff00'
      }}>
        <h2 style={{ borderBottom: '2px solid #00ff00', paddingBottom: '10px' }}>
          🚀 AEROSPACE NAVIGATION SYSTEM 🚀
        </h2>

        {/* Origin Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            📍 DEPARTURE POINT
          </label>
          <select
            value={selectedStar.name}
            onChange={(e) => {
              const star = Object.values(GALAXY_DATABASE).find(s => s.name === e.target.value);
              setSelectedStar(star);
            }}
            style={{
              width: '100%',
              padding: '8px',
              background: '#000',
              color: '#00ff00',
              border: '1px solid #00ff00',
              fontFamily: 'monospace'
            }}
          >
            {Object.values(GALAXY_DATABASE).map(star => (
              <option key={star.name} value={star.name}>{star.name}</option>
            ))}
          </select>
          {selectedStar && (
            <div style={{ fontSize: '12px', marginTop: '8px', color: '#00ff00' }}>
              Type: {selectedStar.type} | Planets: {selectedStar.planets.length}
            </div>
          )}
        </div>

        {/* Destination Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            🎯 DESTINATION
          </label>
          <select
            value={targetStar.name}
            onChange={(e) => {
              const star = Object.values(GALAXY_DATABASE).find(s => s.name === e.target.value);
              setTargetStar(star);
            }}
            style={{
              width: '100%',
              padding: '8px',
              background: '#000',
              color: '#00ff00',
              border: '1px solid #00ff00',
              fontFamily: 'monospace'
            }}
          >
            {Object.values(GALAXY_DATABASE).map(star => (
              <option key={star.name} value={star.name}>{star.name}</option>
            ))}
          </select>
          {targetStar && (
            <div style={{ fontSize: '12px', marginTop: '8px', color: '#00ff00' }}>
              Type: {targetStar.type} | Distance: {targetStar.distance} ly
            </div>
          )}
        </div>

        {/* Speed Control */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            ⚡ VELOCITY: {(travelSpeed * 100).toFixed(1)}% Light Speed
          </label>
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={travelSpeed}
            onChange={(e) => setTravelSpeed(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', marginTop: '5px', color: '#00ff00' }}>
            {(travelSpeed * AerospaceCalculations.SPEEDS.LIGHT_SPEED).toFixed(2)} km/s
          </div>
        </div>

        {/* Travel Calculations Display */}
        {travelCalcs && (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #00ff00',
            padding: '15px',
            marginBottom: '20px',
            fontSize: '13px'
          }}>
            <h3 style={{ borderBottom: '1px solid #00ff00', paddingBottom: '10px', margin: '0 0 10px 0' }}>
              📊 TRAJECTORY ANALYSIS
            </h3>

            <div style={{ marginBottom: '10px' }}>
              <strong>DISTANCE:</strong><br/>
              {travelCalcs.distance.lightYears} light-years<br/>
              {travelCalcs.distance.km} km
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong>TRAVEL TIME:</strong><br/>
              {travelCalcs.travelTime.formatted}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong>VELOCITY:</strong><br/>
              {travelCalcs.speed.kmS} km/s ({travelCalcs.speed.percentC}% c)
            </div>

            {travelSpeed > 0.1 && (
              <div style={{
                background: '#1a0a00',
                padding: '10px',
                marginTop: '10px',
                border: '1px solid #ff6600'
              }}>
                <strong>⚠️ RELATIVISTIC EFFECTS:</strong><br/>
                Time Dilation: {travelCalcs.relativity.timeDilation.toFixed(3)}x<br/>
                Length Contraction: {(travelCalcs.relativity.lengthContraction * 100).toFixed(1)}%<br/>
                Mass Increase: {((travelCalcs.relativity.massIncrease - 1) * 100).toFixed(1)}%
              </div>
            )}
          </div>
        )}

        {/* Habitability Info */}
        {targetStar && (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #00ff00',
            padding: '10px',
            fontSize: '12px'
          }}>
            <strong>🌍 HABITABILITY:</strong><br/>
            {targetStar.habitable ? '✅ POTENTIALLY HABITABLE' : '❌ NOT HABITABLE'}
            <br/>
            <strong>POPULATION:</strong> Level {targetStar.populationLevel}/10
          </div>
        )}
      </div>
    </div>
  );
};

export default GalaxyMap;
