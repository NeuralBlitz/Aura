
import React, { useState, useEffect, useRef } from 'react';
import { CloudRain, Wind, Droplets, MapPin, Navigation, Thermometer, Sun, Cloud, CloudLightning, Plus, Trash2, Search, Crosshair } from 'lucide-react';
import DataVisualizer from '../DataVisualizer';
import { executeTool } from '../../services/toolService';
import ModuleLayout from '../ui/ModuleLayout';

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
      try {
        const response = await fetch('/api/weather');
        const weatherData = await response.json();
        
        // Adapt backend data to component format if needed
        const adaptedData = {
          ...weatherData,
          humidity: Math.round(40 + Math.random() * 40),
          wind: Math.round(5 + Math.random() * 20),
          pressure: 1012 + Math.floor(Math.random() * 10),
          forecast: Array.from({ length: 8 }, (_, i) => ({
            time: `${(i * 3 + 12) % 24}:00`,
            temp: weatherData.temp - 5 + Math.random() * 10,
            precip: Math.random() * 100
          }))
        };
        setData(adaptedData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
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
    <ModuleLayout title="Atmospherics" subtitle="Telemetry" status={loading ? "SYNCING" : "LIVE"} icon={CloudLightning} color="blue">
      <div className="flex h-full bg-black/20 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl font-sans w-full">
        {/* Sidebar */}
        <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0">
           <div className="p-6">
              <div className="flex items-center gap-3 text-blue-500 mb-6">
                 <CloudLightning className="w-6 h-6" />
                 <h2 className="text-sm font-black uppercase tracking-widest text-white">Atmospherics</h2>
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500/50 transition-all">
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
           </div>

           <div className="flex-1 overflow-y-auto px-3 space-y-1">
              <div className="px-3 mb-2 text-[9px] font-black text-neutral-600 uppercase tracking-widest">Monitored Zones</div>
              {locations.map((loc, i) => (
                 <button 
                    key={i}
                    onClick={() => setActiveCity(loc)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${activeCity.city === loc.city ? 'bg-blue-900/20 text-blue-400 border border-blue-500/20' : 'text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent'}`}
                 >
                    <div className="flex items-center gap-3">
                       <MapPin className="w-4 h-4" />
                       <span className="text-xs font-bold truncate">{loc.city}</span>
                    </div>
                    {activeCity.city === loc.city && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                 </button>
              ))}
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-black/40 backdrop-blur-md shrink-0">
             <h1 className="text-sm font-black text-white uppercase tracking-widest">
               {activeCity.city} Sector
             </h1>
          </div>

          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
             {!data || loading ? (
                <div className="h-full flex items-center justify-center opacity-50">
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Syncing Telemetry...</span>
                   </div>
                </div>
             ) : (
                <div className="space-y-8 animate-slide-up max-w-4xl mx-auto">
                   {/* Hero Card */}
                   <div className="relative h-80 glass-morphic bg-neutral-900/30 border border-white/5 rounded-[3.5rem] overflow-hidden flex flex-col items-center justify-center text-center p-8 group shadow-2xl">
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
                      <div className="glass-morphic bg-neutral-900/30 border border-white/5 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-3">
                         <Wind className="w-8 h-8 text-neutral-500" />
                         <span className="text-2xl font-black text-white">{data.wind} <span className="text-xs text-neutral-600">mph</span></span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Velocity</span>
                      </div>
                      <div className="glass-morphic bg-neutral-900/30 border border-white/5 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-3">
                         <Droplets className="w-8 h-8 text-blue-500" />
                         <span className="text-2xl font-black text-white">{data.humidity}<span className="text-xs text-neutral-600">%</span></span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Saturation</span>
                      </div>
                      <div className="glass-morphic bg-neutral-900/30 border border-white/5 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-3">
                         <Thermometer className="w-8 h-8 text-rose-500" />
                         <span className="text-2xl font-black text-white">{data.pressure}</span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Pressure (hPa)</span>
                      </div>
                   </div>

                   {/* Chart */}
                   <div className="h-64 glass-morphic bg-neutral-900/30 border border-white/5 rounded-[3rem] overflow-hidden p-8">
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
      </div>
    </ModuleLayout>
  );
};

export default WeatherView;
