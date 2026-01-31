/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-bg': '#050505',
        'cyber-primary': '#00f0ff',
        'cyber-secondary': '#ff003c',
        'cyber-text': '#e0e0e0',
        'cyber-panel': 'rgba(10, 15, 20, 0.85)',
        'neon-green': '#00ff00',
        'neon-blue': '#0099ff',
        'neon-purple': '#ff00ff',
      },
      fontFamily: {
        'mono': '"Share Tech Mono", monospace',
        'sans': '"Inter", sans-serif',
      },
      animation: {
        'pulse-cyber': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
            textShadow: '0 0 10px rgba(0, 240, 255, 0.8)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(0, 240, 255, 0.8)',
            textShadow: '0 0 20px rgba(0, 240, 255, 1)',
          },
        },
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(12px)',
      },
      boxShadow: {
        'cyber': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.5)',
        'glow-red': '0 0 20px rgba(255, 0, 60, 0.5)',
        'glow-green': '0 0 20px rgba(0, 255, 0, 0.5)',
      },
      opacity: {
        '5': '0.05',
        '10': '0.1',
      },
    },
  },
  plugins: [],
}
