import { useState } from 'react'
import AvatarWorld from './components/AvatarWorld'
import SatelliteMap from './components/SatelliteMap'
import CameraFeed from './components/CameraFeed'
import ConnectionGraph from './components/ConnectionGraph'
import ImmersiveReader from './components/ImmersiveReader'
import { Monitor, Cpu, Map as MapIcon, Video, Eye, Brain } from 'lucide-react'

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [aiTrainingEnabled, setAiTrainingEnabled] = useState(false);

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            {/* 3D Background */}
            <AvatarWorld />

            {/* Overlay UI Layer */}
            <div className="absolute inset-0 z-10 p-6 flex flex-col pointer-events-none">

                {/* Header */}
                <header className="flex justify-between items-center mb-6 pointer-events-auto">
                    <div className="glass-panel px-4 py-2 flex items-center gap-2">
                        <Monitor className="text-[#00f0ff]" size={20} />
                        <h1 className="text-xl font-bold tracking-widest text-white glow-text">SYSTEM OVERLAY // V.1.0</h1>
                    </div>
                    <div className="glass-panel px-4 py-2 text-xs text-[#00f0ff]">
                        SYSTEM CLOCK: {new Date().toLocaleTimeString()}
                    </div>
                </header>

                {/* Main Content Grid */}
                <main className="flex-1 grid grid-cols-12 gap-6 pointer-events-auto">

                    {/* Left Column: Camera Feeds */}
                    <div className="col-span-3 flex flex-col gap-4">
                        <div className="glass-panel p-2 flex-1 flex flex-col gap-4">
                            <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
                                <Video size={16} className="text-[#ff003c]" />
                                <h2 className="text-sm font-bold text-[#ff003c]">LIVE FEEDS</h2>
                            </div>

                            <div className="grid grid-rows-2 gap-4 flex-1">
                                <CameraFeed id="01" fps={30} quality="SD" />
                                <CameraFeed id="02" fps={60} quality="HD" />
                            </div>
                            <div className="grid grid-rows-2 gap-4 flex-1">
                                <CameraFeed id="03" fps={30} quality="IR" />
                                <CameraFeed id="04" fps={60} quality="HD-AUX" />
                            </div>
                        </div>
                    </div>

                    {/* Center Column: Satellite Map */}
                    <div className="col-span-6 flex flex-col">
                        <div className="glass-panel p-1 w-full h-full flex flex-col">
                            <div className="flex items-center justify-between px-3 py-2 bg-black/40 mb-1">
                                <div className="flex items-center gap-2">
                                    <MapIcon size={16} className="text-[#00f0ff]" />
                                    <span className="text-sm font-bold text-[#00f0ff]">SATELLITE LINK</span>
                                </div>
                                <div className="text-[10px] text-gray-400">LAT: 51.505 | LNG: -0.090</div>
                            </div>
                            <div className="flex-1 relative overflow-hidden rounded border border-white/5">
                                <SatelliteMap />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Analytics & Status */}
                    <div className="col-span-3 flex flex-col gap-4">
                        <div className="glass-panel p-4 flex-1">
                            <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-4">
                                <Cpu size={16} className="text-[#00ff00]" />
                                <h2 className="text-sm font-bold text-[#00ff00]">SYS.METRICS</h2>
                            </div>

                            <div className="h-48 mb-4">
                                <ConnectionGraph />
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between p-2 bg-white/5 rounded">
                                    <span className="text-gray-400">UPLINK</span>
                                    <span className="text-[#00f0ff]">450 MBPS</span>
                                </div>
                                <div className="flex justify-between p-2 bg-white/5 rounded">
                                    <span className="text-gray-400">DOWNLINK</span>
                                    <span className="text-[#00f0ff]">890 MBPS</span>
                                </div>
                                <div className="flex justify-between p-2 bg-white/5 rounded">
                                    <span className="text-gray-400">LATENCY</span>
                                    <span className="text-[#00ff00]">12 MS</span>
                                </div>
                                
                                {/* Immersive Reader Toggle */}
                                <button
                                    onClick={() => setActiveTab(activeTab === 'immersive' ? 'dashboard' : 'immersive')}
                                    className={`w-full mt-2 p-2 rounded flex items-center justify-center gap-2 transition ${
                                        activeTab === 'immersive'
                                            ? 'bg-[#667eea] text-white'
                                            : 'bg-white/5 text-[#00f0ff] hover:bg-white/10'
                                    }`}
                                >
                                    <Eye size={14} />
                                    <span className="text-xs font-bold">IMMERSIVE READER</span>
                                </button>
                                
                                {/* AI Training Toggle */}
                                <button
                                    onClick={() => setAiTrainingEnabled(!aiTrainingEnabled)}
                                    className={`w-full mt-1 p-2 rounded flex items-center justify-center gap-2 transition ${
                                        aiTrainingEnabled
                                            ? 'bg-[#764ba2] text-white'
                                            : 'bg-white/5 text-[#ff003c] hover:bg-white/10'
                                    }`}
                                >
                                    <Brain size={14} />
                                    <span className="text-xs font-bold">{aiTrainingEnabled ? 'AI ON' : 'AI OFF'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </main>
                
                {/* Immersive Reader Panel */}
                {activeTab === 'immersive' && (
                    <div className="fixed inset-4 z-50 pointer-events-auto overflow-auto">
                        <div className="bg-black/95 border border-[#667eea] rounded-lg p-4 backdrop-blur">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-[#667eea] flex items-center gap-2">
                                    <Eye size={20} />
                                    IMMERSIVE READER - REAL-TIME DATA STREAM
                                </h2>
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className="text-[#ff003c] hover:text-white text-xl"
                                >
                                    ✕
                                </button>
                            </div>
                            <ImmersiveReader 
                                overlayContext={{ activeTab }}
                                aiMode={aiTrainingEnabled}
                            />
                        </div>
                    </div>
                )}

                {/* Scanline Effect Overlay */}
                <div className="scanline"></div>
            </div>
        </div>
    )
}

export default App
