import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useState, useEffect } from 'react';

export default function ConnectionGraph() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const update = () => {
            const now = new Date().toLocaleTimeString();
            const newPoint = {
                time: now,
                cpu: 40 + Math.random() * 30, // Random load between 40-70
                gpu: 50 + Math.random() * 40, // Random load between 50-90
                npu: 30 + Math.random() * 20, // Random load between 30-50
            };

            setData(prev => {
                const newData = [...prev, newPoint];
                if (newData.length > 20) newData.shift(); // Keep last 20 points
                return newData;
            });
        };

        const interval = setInterval(update, 500); // 2Hz update
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full p-2 flex flex-col">
            <h3 className="text-[#00f0ff] text-xs uppercase tracking-widest mb-2 border-b border-[#00f0ff]/20 pb-1">Connection Strength (Simulated)</h3>
            <div className="flex-1 w-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, 100]} hide />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #00f0ff' }}
                            itemStyle={{ fontSize: '10px' }}
                        />
                        <Line type="monotone" dataKey="cpu" stroke="#00f0ff" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="gpu" stroke="#ff003c" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="npu" stroke="#00ff00" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[10px] mt-1 text-gray-400">
                <span style={{ color: '#00f0ff' }}>CPU: {data[data.length - 1]?.cpu.toFixed(1)}%</span>
                <span style={{ color: '#ff003c' }}>GPU: {data[data.length - 1]?.gpu.toFixed(1)}%</span>
                <span style={{ color: '#00ff00' }}>NPU: {data[data.length - 1]?.npu.toFixed(1)}%</span>
            </div>
        </div>
    );
}
