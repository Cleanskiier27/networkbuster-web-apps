import { useState, useEffect, useRef } from 'react';

export default function CameraFeed({ id, fps, quality }) {
    const [frameData, setFrameData] = useState(0);
    const [timestamp, setTimestamp] = useState(new Date().toISOString());
    const canvasRef = useRef(null);

    // Simulate Frame Updates
    useEffect(() => {
        const interval = 1000 / fps;
        const timer = setInterval(() => {
            setFrameData(f => (f + 1) % 1000);
            setTimestamp(new Date().toISOString());

            // Draw Noise/Scanlines to simulate video feed
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                const w = canvasRef.current.width;
                const h = canvasRef.current.height;

                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, w, h);

                // Random noise
                for (let i = 0; i < 50; i++) {
                    ctx.fillStyle = `rgba(0, 240, 255, ${Math.random() * 0.5})`;
                    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
                }

                // Moving scanline
                const lineY = (Date.now() / 5) % h;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(0, lineY, w, 2);

                ctx.fillStyle = '#fff';
                ctx.font = '10px monospace';
                ctx.fillText(`CAM_${id} | ${quality} | FPS: ${fps}`, 10, 20);
                ctx.fillText(timestamp, 10, h - 10);
            }

        }, interval);

        return () => clearInterval(timer);
    }, [fps, id, quality]);

    return (
        <div className="relative w-full h-full bg-black border border-[#00f0ff]/30 overflow-hidden group">
            <canvas ref={canvasRef} className="w-full h-full object-cover opacity-80" width={320} height={240} />

            <div className="absolute top-0 right-0 bg-[#00f0ff] text-black text-[10px] px-1 font-bold">
                REQ: {fps}
            </div>

            {/* Overlay UI */}
            <div className="absolute inset-0 border-[1px] border-transparent group-hover:border-[#ff003c] transition-colors pointer-events-none"></div>

            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 border border-[#00f0ff]/50 -translate-x-1/2 -translate-y-1/2"></div>
        </div>
    );
}
