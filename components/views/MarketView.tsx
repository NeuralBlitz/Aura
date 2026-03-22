
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, RefreshCw, BarChart3, Zap, 
  Wallet, PieChart, ArrowRightLeft, History, CreditCard, ChevronRight, Sliders
} from 'lucide-react';
import DataVisualizer from '../DataVisualizer';

type MarketTab = 'dashboard' | 'trade' | 'wallet' | 'analysis';

const MarketView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MarketTab>('dashboard');
  const [data, setData] = useState<any[]>([]);
  const [btcPrice, setBtcPrice] = useState(65420.50);
  
  // Trade State
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [leverage, setLeverage] = useState(1);
  const [amount, setAmount] = useState(0);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/market/prices');
      const marketData = await response.json();
      setData(marketData.history);
      setBtcPrice(marketData.btc);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5000);
    return () => clearInterval(interval);
  }, []);

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all mb-2 ${activeTab === id ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
  );

  return (
    <div className="flex h-full bg-[#050505] animate-fade-in font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-black/50 border-r border-white/5 flex flex-col p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10 text-emerald-500">
           <Activity className="w-6 h-6" />
           <h2 className="text-sm font-black uppercase tracking-widest text-white">Fin.Terminal</h2>
        </div>
        
        <div className="space-y-1">
           <SidebarItem id="dashboard" label="Overview" icon={BarChart3} />
           <SidebarItem id="trade" label="Trade Deck" icon={ArrowRightLeft} />
           <SidebarItem id="wallet" label="Assets" icon={Wallet} />
           <SidebarItem id="analysis" label="Deep Scan" icon={PieChart} />
        </div>

        <div className="mt-auto pt-6 border-t border-white/5">
           <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl">
              <span className="text-[9px] font-black uppercase text-emerald-600 block mb-1">Net Liquidity</span>
              <span className="text-xl font-black text-white">$14,240.52</span>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        
        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-slide-up">
             <div className="flex justify-between items-end">
                <div>
                   <h1 className="text-3xl font-black text-white italic tracking-tighter">Market Overview</h1>
                   <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Live Global Tickers</p>
                </div>
                <div className="flex gap-2">
                   <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-black uppercase">Market Open</span>
                </div>
             </div>

             <div className="h-80 metallic-card emerald rounded-[2.5rem] p-6 bg-black/20">
                <DataVisualizer config={{
                   type: 'area',
                   title: 'BTC/USD Aggr.',
                   data: data,
                   xAxisKey: 'time',
                   yAxisKey: ['BTC'],
                   colors: ['#10b981']
                }} />
             </div>

             <div className="grid grid-cols-2 gap-4">
                {[
                   { s: 'BTC', n: 'Bitcoin', p: btcPrice, c: 2.4 },
                   { s: 'ETH', n: 'Ethereum', p: 3512.10, c: -1.2 },
                   { s: 'SOL', n: 'Solana', p: 148.90, c: 5.7 },
                   { s: 'NVDA', n: 'Nvidia', p: 124.50, c: 0.8 }
                ].map(asset => (
                   <div key={asset.s} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex justify-between items-center hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center font-black text-[10px] text-neutral-400 border border-white/10">{asset.s}</div>
                         <div>
                            <span className="block text-sm font-bold text-white">{asset.n}</span>
                            <span className={`text-[10px] font-black ${asset.c > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{asset.c > 0 ? '+' : ''}{asset.c}%</span>
                         </div>
                      </div>
                      <span className="text-lg font-black text-white tracking-tight">${asset.p.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* Trade Deck */}
        {activeTab === 'trade' && (
           <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
              <h1 className="text-3xl font-black text-white italic tracking-tighter text-center">Execution Deck</h1>
              
              <div className="metallic-card emerald rounded-[3rem] p-8 bg-black/40 backdrop-blur-xl">
                 <div className="flex bg-black/50 p-1 rounded-2xl border border-white/10 mb-8">
                    <button 
                      onClick={() => setTradeSide('buy')}
                      className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tradeSide === 'buy' ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                    >
                       Buy / Long
                    </button>
                    <button 
                      onClick={() => setTradeSide('sell')}
                      className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tradeSide === 'sell' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                    >
                       Sell / Short
                    </button>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest ml-2 mb-2 block">Asset Pair</label>
                       <div className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-2xl">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-black text-[8px] text-black">BTC</div>
                             <span className="text-lg font-black text-white">Bitcoin</span>
                          </div>
                          <span className="text-sm font-mono text-emerald-400">${btcPrice.toFixed(2)}</span>
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest ml-2 mb-2 block">Amount (USD)</label>
                       <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus-within:border-emerald-500/50 transition-all">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(parseFloat(e.target.value))} 
                            className="flex-1 bg-transparent text-2xl font-black text-white outline-none placeholder-neutral-700" 
                            placeholder="0.00"
                          />
                       </div>
                    </div>

                    <div>
                       <div className="flex justify-between items-center mb-2 px-2">
                          <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Leverage</label>
                          <span className="text-xs font-bold text-yellow-500">{leverage}x</span>
                       </div>
                       <input 
                         type="range" min="1" max="100" step="1" 
                         value={leverage} 
                         onChange={e => setLeverage(parseInt(e.target.value))}
                         className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-yellow-500"
                       />
                    </div>

                    <button className={`w-full py-6 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all ${tradeSide === 'buy' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}>
                       Confirm {tradeSide.toUpperCase()} Order
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* Wallet View */}
        {activeTab === 'wallet' && (
           <div className="space-y-8 animate-slide-up">
              <h1 className="text-3xl font-black text-white italic tracking-tighter">Asset Custody</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-neutral-900 to-black border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet className="w-32 h-32 text-white" /></div>
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Total Balance</span>
                    <h2 className="text-4xl font-black text-white mt-2 mb-8 tracking-tight">$14,240.52</h2>
                    
                    <div className="space-y-4">
                       <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-orange-500 text-black flex items-center justify-center font-bold text-[10px]">BTC</div>
                             <span className="text-xs font-bold text-white">0.0421 BTC</span>
                          </div>
                          <span className="text-xs font-mono text-neutral-400">$2,754.20</span>
                       </div>
                       <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-blue-500 text-black flex items-center justify-center font-bold text-[10px]">ETH</div>
                             <span className="text-xs font-bold text-white">1.45 ETH</span>
                          </div>
                          <span className="text-xs font-mono text-neutral-400">$5,092.15</span>
                       </div>
                    </div>
                 </div>

                 <div className="p-8 rounded-[2.5rem] bg-black border border-white/10">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><History className="w-4 h-4" /> Recent Activity</h3>
                    <div className="space-y-4">
                       {[1,2,3,4].map(i => (
                          <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                             <div>
                                <span className="text-xs font-bold text-white block">Bought BTC</span>
                                <span className="text-[9px] text-neutral-500 uppercase tracking-widest">May {10+i}, 14:00</span>
                             </div>
                             <span className="text-xs font-mono text-emerald-500">+0.002 BTC</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default MarketView;
