import React, { useState, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, Bar, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  LineChart, Line, 
  AreaChart, Area,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter,
  Treemap, Sankey, Brush,
  LabelList
} from 'recharts';
import { 
  Settings2, ZoomIn, Eye, EyeOff, 
  FileJson, FileSpreadsheet, Image as ImageIcon, 
  FileCode, Loader2, AlertCircle, RefreshCw 
} from 'lucide-react';

interface ChartConfig {
  type: string;
  title: string;
  data?: any[];
  dataSourceUrl?: string;
  xAxisKey: string;
  yAxisKey: string | string[]; 
  colors?: string[];
  nodes?: any[]; 
  links?: any[]; 
}

const PALETTES = {
  aura: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  ocean: ['#0EA5E9', '#06B6D4', '#2DD4BF', '#14B8A6', '#0D9488', '#0891B2'],
  sunset: ['#F43F5E', '#FB7185', '#FDA4AF', '#FECDD3', '#FFE4E6', '#FFF1F2'],
  forest: ['#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0', '#DCFCE7', '#F0FDF4'],
};

const DataVisualizer: React.FC<{ config: ChartConfig }> = ({ config }) => {
  const [activePalette, setActivePalette] = useState<keyof typeof PALETTES>('aura');
  const [showGrid, setShowGrid] = useState(true);
  const [showBrush, setShowBrush] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dynamicData, setDynamicData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chartRef = useRef<HTMLDivElement>(null);

  const colors = PALETTES[activePalette];
  const yKeys = Array.isArray(config.yAxisKey) ? config.yAxisKey : [config.yAxisKey];
  const activeData = dynamicData || config.data || [];

  const fetchData = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch data source');
      const data = await response.json();
      setDynamicData(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (config.dataSourceUrl) {
      fetchData(config.dataSourceUrl);
    }
  }, [config.dataSourceUrl]);

  const toggleSeries = (key: string) => {
    const newHidden = new Set(hiddenSeries);
    if (newHidden.has(key)) newHidden.delete(key);
    else newHidden.add(key);
    setHiddenSeries(newHidden);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl shadow-2xl animate-fade-in ring-1 ring-black/5 z-[100]">
          <p className="text-xs font-bold text-neutral-500 mb-2 border-b border-neutral-100 dark:border-neutral-800 pb-1">{label || 'Value'}</p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">{entry.name}:</span>
                </div>
                <span className="font-bold text-neutral-900 dark:text-white">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (isLoading) return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Fetching Data...</span>
      </div>
    );

    if (error) return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-red-500">
        <AlertCircle className="w-8 h-8" />
        <span className="text-xs font-bold uppercase tracking-widest text-center">{error}</span>
        <button onClick={() => fetchData(config.dataSourceUrl!)} className="mt-2 text-xs font-bold text-blue-500 flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );

    if (activeData.length === 0 && !config.nodes) return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-neutral-500">
        <AlertCircle className="w-6 h-6 opacity-20" />
        <span className="text-xs font-bold uppercase tracking-widest">No Data Available</span>
      </div>
    );

    const commonProps = {
      data: activeData,
      margin: { top: 10, right: 10, left: 0, bottom: 0 }
    };

    const type = (config.type || 'bar').toLowerCase();

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />}
            <XAxis dataKey={config.xAxisKey} stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {yKeys.map((key, i) => !hiddenSeries.has(key) && (
              <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={3} dot={showLabels} activeDot={{ r: 6 }}>
                {showLabels && <LabelList dataKey={key} position="top" style={{ fontSize: '10px', fill: '#888' }} />}
              </Line>
            ))}
            {showBrush && <Brush dataKey={config.xAxisKey} height={30} stroke={colors[0]} fill="transparent" />}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />}
            <XAxis dataKey={config.xAxisKey} stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {yKeys.map((key, i) => !hiddenSeries.has(key) && (
              <Area key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.2} />
            ))}
            {showBrush && <Brush dataKey={config.xAxisKey} height={30} stroke={colors[0]} fill="transparent" />}
          </AreaChart>
        );
      case 'pie':
      case 'donut':
        return (
          <PieChart>
            <Pie 
              data={activeData} 
              cx="50%" cy="50%" 
              innerRadius={type === 'donut' ? 60 : 0} 
              outerRadius={80} 
              paddingAngle={5} 
              dataKey={yKeys[0]} 
              nameKey={config.xAxisKey} 
              stroke="none"
            >
              {activeData.map((_, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        );
      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={activeData}>
            <PolarGrid stroke="rgba(128,128,128,0.2)" />
            <PolarAngleAxis dataKey={config.xAxisKey} tick={{ fill: '#888', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#444', fontSize: 8 }} />
            {yKeys.map((key, i) => !hiddenSeries.has(key) && (
              <Radar key={key} name={key} dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.5} />
            ))}
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        );
      case 'treemap':
        return (
          <Treemap {...commonProps} dataKey={yKeys[0]} aspectRatio={4 / 3} stroke="#fff" fill={colors[0]}>
             <Tooltip content={<CustomTooltip />} />
          </Treemap>
        );
      case 'sankey':
        return (
          <Sankey
            data={{ nodes: config.nodes || [], links: config.links || [] }}
            margin={{ top: 10, left: 10, right: 10, bottom: 10 }}
            nodeWidth={10}
            nodePadding={30}
            linkCurvature={0.5}
            link={{ stroke: colors[0], strokeOpacity: 0.2 }}
            node={{ fill: colors[1] }}
          >
            <Tooltip />
          </Sankey>
        );
      case 'bar':
      default:
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />}
            <XAxis dataKey={config.xAxisKey} stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {yKeys.map((key, i) => !hiddenSeries.has(key) && (
              <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]}>
                {showLabels && <LabelList dataKey={key} position="top" style={{ fontSize: '10px', fill: '#888' }} />}
              </Bar>
            ))}
            {showBrush && <Brush dataKey={config.xAxisKey} height={30} stroke={colors[0]} fill="transparent" />}
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full bg-neutral-100 dark:bg-neutral-900/50 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 p-6 my-6 transition-all shadow-xl group overflow-visible relative min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{config.title || 'Data Analysis'}</h4>
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{config.type || 'chart'} visualization</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full transition-colors ${isMenuOpen ? 'bg-blue-600 text-white' : 'hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500'}`}
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute top-16 right-6 z-50 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">Palette</p>
              <div className="flex gap-2">
                {Object.keys(PALETTES).map(p => (
                  <button 
                    key={p} 
                    onClick={() => setActivePalette(p as any)}
                    className={`w-6 h-6 rounded-full border-2 ${activePalette === p ? 'border-blue-500' : 'border-transparent'}`}
                    style={{ backgroundColor: PALETTES[p as keyof typeof PALETTES][0] }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Show Labels</span>
              <button onClick={() => setShowLabels(!showLabels)} className={`w-8 h-4 rounded-full relative transition-colors ${showLabels ? 'bg-blue-600' : 'bg-neutral-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${showLabels ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Zoom Slider</span>
              <button onClick={() => setShowBrush(!showBrush)} className={`w-8 h-4 rounded-full relative transition-colors ${showBrush ? 'bg-blue-600' : 'bg-neutral-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${showBrush ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {yKeys.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {yKeys.map((key, i) => (
            <button
              key={key}
              onClick={() => toggleSeries(key)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${hiddenSeries.has(key) ? 'bg-neutral-100 dark:bg-neutral-800 border-transparent text-neutral-400 opacity-50' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200'}`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
              {key}
              {hiddenSeries.has(key) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          ))}
        </div>
      )}

      <div ref={chartRef} className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DataVisualizer;