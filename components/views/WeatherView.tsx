
import React, { useState, useEffect, useRef } from 'react';
import { CloudRain, Wind, Droplets, MapPin, Navigation, Thermometer, Sun, Cloud, CloudLightning, Plus, Trash2, Search, Crosshair } from 'lucide-react';
import DataVisualizer from '../DataVisualizer';
import { executeTool } from '../../services/toolService';

const SAVED_LOCATIONS = [
  { city: 'San Francisco', lat: 37.77, lon: -122.41 },
  { city: 'New York', lat: 40.71, lon: -74.00 },
  { city: 'Tokyo', lat: 35.67, lon: 139.65 },
  { city: 'London', lat: 51.50, lon: -0.12 }
];

const WeatherView: React.FC = () => {
  const [activeCity, setActiveCity] = useState(SAVED_LOCATIONS[0]);
  const [data, setData] = useState<any>(null);
  const [locations, setLocations] = useState(SAVED_LOCATIONS);
  const [newCity, setNewCity] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(r => setTimeout(r, 800));
      
      const mockData = {
        temp: Math.round(60 + Math.random() * 20),
        condition: Math.random() > 0.5 ? 'rain' : 'clear',
        humidity: Math.round(40 + Math.random() * 40),
        wind: Math.round(5 + Math.random() * 20),
        pressure: 1012 + Math.floor(Math.random() * 10),
        forecast: Array.from({ length: 8 }, (_, i) => ({
          time: `${(i * 3 + 12) % 24}:00`,
          temp: 60 + Math.random() * 15,
          precip: Math.random() * 100
        }))
      };
      setData(mockData);
      setLoading(false);
    };
    fetchWeather();
  }, [activeCity]);

  // Rain Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data?.condition !== 'rain') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let drops: any[] = [];
    const width = canvas.width;
    const height = canvas.height;

    for (let i = 0; i < 100; i++) {
      drops.push({ x: Math.random() * width, y: Math.random() * height, speed: 2 + Math.random() * 3, len: 10 + Math.random() * 20 });
    }

    let frameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1;
      
      drops.forEach(d => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.len);
        ctx.stroke();
        d.y += d.speed;
        if (d.y > height) {
          d.y = -d.len;
          d.x = Math.random() * width;
        }
      });
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, [data]);

  const handleAddCity = () => {
    if(!newCity) return;
    setLocations([...locations, { city: newCity, lat: 0, lon: 0 }]); // Mock coords
    setNewCity('');
  };

  return (
    <div className="flex h-full bg-[#050505] font-sans overflow-hidden animate-fade-in">
      {/* Sidebar */}
      <div className="w-72 bg-black/50 border-r border-white/5 flex flex-col p-6 shrink-0">
         <div className="flex items-center gap-3 mb-8 text-blue-500">
            <CloudLightning className="w-6 h-6" />
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Atmospherics</h2>
         </div>

         <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 mb-6 focus-within:border-blue-500/50 transition-all">
            <Search className="w-4 h-4 text-neutral-500" />
            <input 
               value={newCity} 
               onChange={e => setNewCity(e.target.value)}
               placeholder="Add coordinates..." 
               className="bg-transparent border-none text-xs text-white w-full outline-none placeholder-neutral-600"
               onKeyDown={e => e.key === 'Enter' && handleAddCity()}
            />
            <button onClick={handleAddCity} className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white"><Plus className="w-3 h-3" /></button>
         </div>

         <div className="flex-1 overflow-y-auto space-y-2">
            <div className="px-2 mb-2 text-[9px] font-black text-neutral-600 uppercase tracking-widest">Monitored Zones</div>
            {locations.map((loc, i) => (
               <button 
                  key={i}
                  onClick={() => setActiveCity(loc)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${activeCity.city === loc.city ? 'bg-blue-600/10 border-blue-500/30 text-white' : 'bg-transparent border-transparent hover:bg-white/5 text-neutral-400'}`}
               >
                  <div className="flex items-center gap-3">
                     <MapPin className={`w-4 h-4 ${activeCity.city === loc.city ? 'text-blue-500' : 'text-neutral-600'}`} />
                     <span className="text-xs font-bold">{loc.city}</span>
                  </div>
                  {activeCity.city === loc.city && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
               </button>
            ))}
         </div>
      </div>

      {/* Main Dashboard */}
      <div className="flex-1 p-8 overflow-y-auto">
         {!data || loading ? (
            <div className="h-full flex items-center justify-center opacity-50">
               <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Syncing Telemetry...</span>
               </div>
            </div>
         ) : (
            <div className="space-y-8 animate-slide-up">
               {/* Hero Card */}
               <div className="relative h-80 metallic-card blue rounded-[3.5rem] bg-gradient-to-br from-blue-900/40 to-black overflow-hidden flex flex-col items-center justify-center text-center p-8 group shadow-2xl">
                  {data.condition === 'rain' && <canvas ref={canvasRef} width={600} height={320} className="absolute inset-0 z-0 opacity-40 pointer-events-none" />}
                  <div className="relative z-10">
                     <div className="flex items-center justify-center gap-2 mb-6 text-neutral-400 bg-black/40 px-5 py-2 rounded-full border border-white/5 backdrop-blur-md">
                        <Crosshair className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{activeCity.city} Sector</span>
                     </div>
                     <h2 className="text-9xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl flex items-start justify-center">
                        {data.temp}<span className="text-4xl mt-4 text-blue-400">°</span>
                     </h2>
                     <div className="px-8 py-3 bg-blue-500/20 rounded-full border border-blue-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-200">{data.condition.toUpperCase()}</span>
                     </div>
                  </div>
               </div>

               {/* Metrics Grid */}
               <div className="grid grid-cols-3 gap-6">
                  <div className="metallic-card blue rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-3 bg-black/20">
                     <Wind className="w-8 h-8 text-neutral-500" />
                     <span className="text-2xl font-black text-white">{data.wind} <span className="text-xs text-neutral-600">mph</span></span>
                     <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Velocity</span>
                  </div>
                  <div className="metallic-card blue rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-3 bg-black/20">
                     <Droplets className="w-8 h-8 text-blue-500" />
                     <span className="text-2xl font-black text-white">{data.humidity}<span className="text-xs text-neutral-600">%</span></span>
                     <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Saturation</span>
                  </div>
                  <div className="metallic-card red rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-3 bg-black/20">
                     <Thermometer className="w-8 h-8 text-rose-500" />
                     <span className="text-2xl font-black text-white">{data.pressure}</span>
                     <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Pressure (hPa)</span>
                  </div>
               </div>

               {/* Chart */}
               <div className="h-64 metallic-card blue rounded-[3rem] overflow-hidden p-8 bg-black/40 border border-white/5">
                  <div className="mb-4 flex items-center gap-2">
                     <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">24h Thermal Projection</span>
                  </div>
                  <DataVisualizer config={{
                     type: 'area',
                     title: '',
                     data: data.forecast,
                     xAxisKey: 'time',
                     yAxisKey: 'temp',
                     colors: ['#3b82f6']
                  }} />
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default WeatherView;
