// GPU-accelerated table processing
const table = await GPUApp.readTableFile(csvFile);
const result = await GPUApp.process(table);
console.log(result.statistics);  // min, max, mean, median, sum

// Satellite frequency analysis
const dopplerShift = SatelliteFrequencyMode.calculateDopplerShift(
    145.8e6,  // frequency in Hz
    7500      // velocity in m/s
);