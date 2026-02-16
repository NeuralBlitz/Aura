
import React, { useState, useEffect } from 'react';
import { Calculator, Key, Globe, RefreshCcw, ArrowRight, Ruler, Clock, Hash, Scale, Thermometer } from 'lucide-react';
import { executeTool } from '../../services/toolService';

type UtilityTab = 'world' | 'key' | 'fx' | 'unit';

const UtilityView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UtilityTab>('world');
  const [pwdLength, setPwdLength] = useState(16);
  const [generatedPwd, setGeneratedPwd] = useState('');
  const [fxAmount, setFxAmount] = useState(100);
  const [fxFrom, setFxFrom] = useState('USD');
  const [fxTo, setFxTo] = useState('EUR');
  const [fxResult, setFxResult] = useState<number | null>(null);
  
  // Unit Converter State
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'temp'>('length');
  const [unitVal, setUnitVal] = useState(1);
  const [unitRes, setUnitRes] = useState<number | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleForgePwd = async () => {
    const res = await executeTool('forge_secure_key', { length: pwdLength });
    setGeneratedPwd(res.key);
  };

  const handleConvertFx = async () => {
    const res = await executeTool('convert_currency', { from: fxFrom, to: fxTo, amount: fxAmount });
    setFxResult(res.result);
  };

  const handleUnitConvert = () => {
     // Simple mock conversion for UI demo
     if (unitCategory === 'length') setUnitRes(unitVal * 3.28084); // M to Ft
     if (unitCategory === 'weight') setUnitRes(unitVal * 2.20462); // Kg to Lbs
     if (unitCategory === 'temp') setUnitRes((unitVal * 9/5) + 32); // C to F
  };

  const SidebarBtn = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all mb-1 ${activeTab === id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="flex h-full bg-[#050505] font-sans overflow-hidden animate-fade-in">
      {/* Sidebar */}
      <div className="w-64 bg-black/50 border-r border-white/5 flex flex-col p-6 shrink-0">
         <div className="flex items-center gap-3 mb-10 text-emerald-500">
            <Calculator className="w-6 h-6" />
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Toolkit Matrix</h2>
         </div>
         <div className="space-y-1">
            <SidebarBtn id="world" label="World Mesh" icon={Globe} />
            <SidebarBtn id="key" label="Key Smith" icon={Key} />
            <SidebarBtn id="fx" label="FX Exchange" icon={RefreshCcw} />
            <SidebarBtn id="unit" label="Converters" icon={Ruler} />
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-12 relative">
         
         {activeTab === 'world' && (
            <div className="max-w-2xl mx-auto animate-slide-up">
               <h1 className="text-3xl font-black text-white italic tracking-tighter mb-8">World Mesh Clock</h1>
               <div className="grid grid-cols-1 gap-4">
                  {[
                     { city: 'San Francisco', tz: 'America/Los_Angeles' },
                     { city: 'New York', tz: 'America/New_York' },
                     { city: 'London', tz: 'Europe/London' },
                     { city: 'Tokyo', tz: 'Asia/Tokyo' }
                  ].map((clock, i) => (
                     <div key={i} className="flex justify-between items-center p-6 bg-black/40 border border-white/5 rounded-[2rem] group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="p-3 rounded-full bg-white/5 text-blue-500"><Clock className="w-5 h-5" /></div>
                           <div>
                              <p className="text-sm font-black text-white tracking-tight">{clock.city}</p>
                              <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mt-1">{clock.tz.split('/')[1]}</p>
                           </div>
                        </div>
                        <p className="text-2xl font-black text-blue-400 italic tabular-nums">
                           {currentTime.toLocaleTimeString('en-US', { timeZone: clock.tz, hour12: false, hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {activeTab === 'key' && (
            <div className="max-w-xl mx-auto animate-slide-up">
               <h1 className="text-3xl font-black text-white italic tracking-tighter mb-8">Entropy Key Smith</h1>
               <div className="metallic-card amber rounded-[3rem] p-10 bg-black/20">
                  <div className="space-y-8">
                     <div className="space-y-4">
                        <div className="flex justify-between px-2">
                           <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Complexity</span>
                           <span className="text-[10px] font-black text-amber-500">{pwdLength} bits</span>
                        </div>
                        <input 
                           type="range" min="8" max="64" value={pwdLength} 
                           onChange={(e) => setPwdLength(parseInt(e.target.value))}
                           className="w-full h-2 bg-black/50 rounded-full appearance-none cursor-pointer accent-amber-500 border border-white/5"
                        />
                     </div>
                     {generatedPwd && (
                        <div className="p-6 bg-black/60 border border-amber-500/20 rounded-[2rem] relative group/key">
                           <p className="text-xs font-mono text-amber-400 break-all leading-relaxed pr-8">{generatedPwd}</p>
                           <button onClick={() => navigator.clipboard.writeText(generatedPwd)} className="absolute top-4 right-4 text-neutral-600 hover:text-white transition-colors">
                              <ArrowRight className="w-5 h-5" />
                           </button>
                        </div>
                     )}
                     <button onClick={handleForgePwd} className="w-full py-5 bg-amber-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-amber-900/30 active:scale-95 transition-all hover:bg-amber-500">
                        Forge Key
                     </button>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'fx' && (
            <div className="max-w-2xl mx-auto animate-slide-up">
               <h1 className="text-3xl font-black text-white italic tracking-tighter mb-8">FX Exchange Substrate</h1>
               <div className="metallic-card emerald rounded-[3rem] p-10 bg-black/20">
                  <div className="flex flex-col gap-8 items-center">
                     <div className="flex-1 w-full">
                        <input 
                           type="number" value={fxAmount} 
                           onChange={(e) => setFxAmount(parseFloat(e.target.value))}
                           className="w-full bg-black/40 border border-white/5 rounded-[2.5rem] p-8 text-4xl font-black text-white focus:outline-none focus:border-emerald-500/50 transition-all tracking-tight text-center"
                        />
                     </div>
                     <div className="flex gap-4 items-center w-full">
                        <select value={fxFrom} onChange={(e) => setFxFrom(e.target.value)} className="flex-1 bg-neutral-900 text-white p-5 rounded-2xl border border-white/10 font-black text-sm outline-none cursor-pointer hover:border-emerald-500/30 text-center">
                           <option>USD</option><option>EUR</option><option>GBP</option><option>BTC</option>
                        </select>
                        <ArrowRight className="w-6 h-6 text-neutral-600" />
                        <select value={fxTo} onChange={(e) => setFxTo(e.target.value)} className="flex-1 bg-neutral-900 text-white p-5 rounded-2xl border border-white/10 font-black text-sm outline-none cursor-pointer hover:border-emerald-500/30 text-center">
                           <option>EUR</option><option>USD</option><option>GBP</option><option>BTC</option>
                        </select>
                     </div>
                     <button onClick={handleConvertFx} className="w-full px-12 py-6 bg-emerald-600 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-900/30 active:scale-95 transition-all hover:bg-emerald-500">
                        Sync Logic
                     </button>
                  </div>
                  {fxResult !== null && (
                     <div className="mt-12 pt-10 border-t border-white/5 flex flex-col items-center">
                        <p className="text-6xl font-black text-white italic tracking-tighter drop-shadow-lg">{fxResult.toFixed(fxTo === 'BTC' ? 8 : 2)} <span className="text-emerald-500 text-4xl">{fxTo}</span></p>
                     </div>
                  )}
               </div>
            </div>
         )}

         {activeTab === 'unit' && (
            <div className="max-w-xl mx-auto animate-slide-up">
               <h1 className="text-3xl font-black text-white italic tracking-tighter mb-8">Universal Converters</h1>
               <div className="metallic-card purple rounded-[3rem] p-10 bg-black/20">
                  <div className="flex gap-2 mb-8 bg-black/40 p-1 rounded-2xl border border-white/5">
                     {['length', 'weight', 'temp'].map((c: any) => (
                        <button 
                           key={c}
                           onClick={() => { setUnitCategory(c); setUnitRes(null); }}
                           className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${unitCategory === c ? 'bg-purple-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                        >
                           {c}
                        </button>
                     ))}
                  </div>
                  
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-[2.5rem] p-6">
                        {unitCategory === 'length' && <Ruler className="w-6 h-6 text-purple-500" />}
                        {unitCategory === 'weight' && <Scale className="w-6 h-6 text-purple-500" />}
                        {unitCategory === 'temp' && <Thermometer className="w-6 h-6 text-purple-500" />}
                        <input 
                           type="number" value={unitVal} 
                           onChange={e => setUnitVal(parseFloat(e.target.value))}
                           className="flex-1 bg-transparent text-2xl font-black text-white outline-none"
                        />
                        <span className="text-sm font-bold text-neutral-500 uppercase">
                           {unitCategory === 'length' ? 'Meters' : unitCategory === 'weight' ? 'Kg' : 'Celsius'}
                        </span>
                     </div>

                     <button onClick={handleUnitConvert} className="w-full py-4 border border-purple-500/30 text-purple-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-purple-500/10 transition-all">
                        Convert Signal
                     </button>

                     {unitRes !== null && (
                        <div className="text-center pt-4 border-t border-white/5">
                           <span className="text-4xl font-black text-white">{unitRes.toFixed(2)}</span>
                           <span className="text-sm font-bold text-neutral-500 uppercase ml-2">
                              {unitCategory === 'length' ? 'Feet' : unitCategory === 'weight' ? 'Lbs' : 'Fahrenheit'}
                           </span>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}

      </div>
    </div>
  );
};

export default UtilityView;
