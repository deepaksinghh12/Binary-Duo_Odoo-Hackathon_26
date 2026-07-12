import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MdFactory, MdBolt, MdLocalShipping, MdNature, MdEco, MdTrendingDown,
  MdDownload, MdInventory, MdRecycling, MdOutlinedFlag, MdCheckCircle,
  MdWaterDrop, MdAdd
} from 'react-icons/md';
import { EnvironmentService } from '../services/EnvironmentService';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Table } from '../../../components/common/Table';
import type { EmissionFactor, ProductESGProfile, EnvironmentalGoal } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const getRatingColor = (r: string) => {
  const m: Record<string, string> = { A: 'success', B: 'info', C: 'warning', D: 'danger', F: 'danger' };
  return (m[r] ?? 'default') as any;
};

const getGoalStatusColor = (s: string) => {
  const m: Record<string, string> = { on_track: 'success', achieved: 'info', at_risk: 'warning', missed: 'danger' };
  return (m[s] ?? 'default') as any;
};

const getGoalStatusLabel = (s: string) => {
  const m: Record<string, string> = { on_track: 'On Track', achieved: 'Achieved', at_risk: 'At Risk', missed: 'Missed' };
  return m[s] ?? s;
};

const SCOPE_CARDS = [
  { label: 'Total Scope 1', value: '12,450', unit: 'tCO2e', icon: <MdFactory size={22} />, color: 'bg-orange-50 text-orange-600' },
  { label: 'Total Scope 2', value: '8,920',  unit: 'tCO2e', icon: <MdBolt size={22} />,    color: 'bg-yellow-50 text-yellow-600' },
  { label: 'Total Scope 3', value: '45,100', unit: 'tCO2e', icon: <MdLocalShipping size={22} />, color: 'bg-blue-50 text-blue-600' },
  { label: 'Renewable Energy', value: '45', unit: '%', icon: <MdBolt size={22} />, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Carbon Offsets',   value: '500',  unit: 'tCO2e', icon: <MdNature size={22} />,  color: 'bg-green-50 text-green-600' },
  { label: 'YoY Reduction',    value: '−8.4', unit: '%',     icon: <MdTrendingDown size={22} />, color: 'bg-teal-50 text-teal-600' },
];

// ── Export Utilities ──────────────────────────────────────────────────────────

function downloadSVG(svgEl: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.svg`; a.click();
  URL.revokeObjectURL(url);
}

function downloadPNG(svgEl: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const canvas = document.createElement('canvas');
  const { width, height } = svgEl.getBoundingClientRect();
  canvas.width = width * 2; canvas.height = height * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${filename}.png`; a.click();
  };
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
}

// ── Inline Bar Chart SVG ───────────────────────────────────────────────────────

interface BarChartProps { data: { label: string; value: number; color: string }[]; title: string; unit: string; }

const BarChartSVG = React.forwardRef<SVGSVGElement, BarChartProps>(({ data, title, unit }, ref) => {
  const W = 520, H = 200, PAD_L = 60, PAD_B = 40, PAD_T = 20, PAD_R = 20;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = (W - PAD_L - PAD_R) / data.length - 10;
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H + PAD_T + PAD_B}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <text x={W / 2} y={14} textAnchor="middle" fontSize="11" fontWeight="600" fill="#0D3B3E">{title}</text>
      {data.map((d, i) => {
        const barH = ((d.value / maxVal) * H);
        const x = PAD_L + i * ((W - PAD_L - PAD_R) / data.length) + 5;
        const y = PAD_T + (H - barH);
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill={d.color} opacity="0.85" />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">{d.value}{unit}</text>
            <text x={x + barW / 2} y={PAD_T + H + 14} textAnchor="middle" fontSize="9" fill="#6B7280">{d.label}</text>
          </g>
        );
      })}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + H} stroke="#E5E7EB" strokeWidth="1" />
      <line x1={PAD_L} y1={PAD_T + H} x2={W - PAD_R} y2={PAD_T + H} stroke="#E5E7EB" strokeWidth="1" />
    </svg>
  );
});

// ── Export Dropdown ───────────────────────────────────────────────────────────

interface ExportDropdownProps { onPNG: () => void; onSVG: () => void; }

const ExportDropdown: React.FC<ExportDropdownProps> = ({ onPNG, onSVG }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <Button variant="outline" rightIcon={<span className="text-xs">▼</span>} className="bg-slate-100 border-none text-sm" onClick={() => setOpen(!open)}>
        <MdDownload size={16} className="mr-1" /> Export
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <button onClick={() => { onPNG(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors border-b border-slate-50">
            Download PNG
          </button>
          <button onClick={() => { onSVG(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors">
            Download SVG
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export const EnvironmentalOverview: React.FC = () => {
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [products, setProducts] = useState<ProductESGProfile[]>([]);
  const [goals, setGoals] = useState<EnvironmentalGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const emissionsRef = useRef<HTMLDivElement>(null);
  const productsRef  = useRef<HTMLDivElement>(null);
  const goalsRef     = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<SVGSVGElement>(null);
  const location = useLocation();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [f, p, g] = await Promise.all([
          EnvironmentService.getEmissionFactors(),
          EnvironmentService.getProductProfiles(),
          EnvironmentService.getEnvironmentalGoals(),
        ]);
        setFactors(f); setProducts(p); setGoals(g);
      } finally { setIsLoading(false); }
    };
    load();
  }, []);

  // Smooth-scroll to section based on route
  useEffect(() => {
    if (isLoading) return;
    setTimeout(() => {
      if (location.pathname.includes('goals') && goalsRef.current) goalsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (location.pathname.includes('products') && productsRef.current) productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (location.pathname.includes('emissions') && emissionsRef.current) emissionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }, [location.pathname, isLoading]);

  const chartData = [
    { label: 'Scope 1', value: 12450, color: '#f97316' },
    { label: 'Scope 2', value: 8920,  color: '#eab308' },
    { label: 'Scope 3', value: 45100, color: '#3b82f6' },
    { label: 'Offsets', value: 500,   color: '#22c55e' },
  ];

  const factorColumns = [
    { key: 'category', header: 'Category' },
    { key: 'activity', header: 'Activity' },
    { key: 'unit', header: 'Unit' },
    { key: 'co2e', header: 'CO2e Factor', render: (r: EmissionFactor) => <span className="font-bold text-orange-600">{r.co2e}</span> },
    { key: 'source', header: 'Source' },
    { key: 'year', header: 'Year' },
    {
      key: 'status', header: 'Status',
      render: (r: EmissionFactor) => (
        <Badge variant={r.status === 'active' ? 'success' : 'default'} className="uppercase text-[10px] font-bold">{r.status}</Badge>
      )
    },
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-12 pb-8">

      {/* KPI CARDS */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Environmental Overview</h2>
            <p className="text-sm text-slate-500">High-level summary of your organisation's environmental footprint.</p>
          </div>
          <ExportDropdown
            onPNG={() => chartRef.current && downloadPNG(chartRef.current, 'env-emissions-chart')}
            onSVG={() => chartRef.current && downloadSVG(chartRef.current, 'env-emissions-chart')}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {SCOPE_CARDS.map((c) => (
            <div key={c.label} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col gap-2">
              <div className={`p-2 rounded-xl w-fit ${c.color}`}>{c.icon}</div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">{c.label}</p>
              <p className="text-2xl font-extrabold text-[#0D3B3E]">{c.value} <span className="text-sm font-medium text-slate-400">{c.unit}</span></p>
            </div>
          ))}
        </div>

        {/* SVG Emissions Bar Chart */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Emissions by Scope (tCO2e)</h3>
          <div className="h-56">
            <BarChartSVG ref={chartRef} data={chartData} title="" unit="" />
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* EMISSION FACTORS TABLE */}
      <div id="emissions" ref={emissionsRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Emission Factors</h2>
            <p className="text-sm text-slate-500">Reference CO2e coefficients used in carbon calculations.</p>
          </div>
          <Button variant="primary" leftIcon={<MdAdd size={20} />} className="bg-[#4CAF3A] hover:bg-[#439c33] border-none text-white">
            Add Factor
          </Button>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <Table columns={factorColumns} data={factors} isLoading={isLoading} />
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* PRODUCT ESG PROFILES CARDS */}
      <div id="products" ref={productsRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Product ESG Profiles</h2>
            <p className="text-sm text-slate-500">Carbon footprint, water use, and recycled material ratings per product.</p>
          </div>
          <Button variant="primary" leftIcon={<MdAdd size={20} />} className="bg-[#4CAF3A] hover:bg-[#439c33] border-none text-white">
            Add Profile
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-200 rounded-3xl animate-pulse" />)
          ) : products.map(p => (
            <div key={p.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:border-slate-200 transition-all duration-300 group flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant={getRatingColor(p.rating)} className="uppercase text-[10px] font-bold mb-2">Rating {p.rating}</Badge>
                  <h3 className="font-extrabold text-slate-800 text-base group-hover:text-[#0D3B3E] transition-colors">{p.productName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{p.category}</p>
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <MdEco size={22} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-100">
                <div className="flex flex-col items-center gap-1">
                  <MdFactory size={14} className="text-orange-400" />
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Carbon</span>
                  <span className="text-xs font-bold text-slate-700">{p.carbonFootprint} kg</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <MdWaterDrop size={14} className="text-blue-400" />
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Water</span>
                  <span className="text-xs font-bold text-slate-700">{p.waterUsage} L</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <MdRecycling size={14} className="text-green-400" />
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Recycled</span>
                  <span className="text-xs font-bold text-slate-700">{p.recycledMaterial}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* ENVIRONMENTAL GOALS */}
      <div id="goals" ref={goalsRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Environmental Goals</h2>
            <p className="text-sm text-slate-500">Track progress against reduction targets and sustainability milestones.</p>
          </div>
          <Button variant="primary" leftIcon={<MdAdd size={20} />} className="bg-[#4CAF3A] hover:bg-[#439c33] border-none text-white">
            New Goal
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-44 bg-slate-200 rounded-3xl animate-pulse" />)
          ) : goals.map(g => {
            const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
            return (
              <div key={g.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant={getGoalStatusColor(g.status)} className="uppercase text-[10px] font-bold mb-2">{getGoalStatusLabel(g.status)}</Badge>
                    <h3 className="font-extrabold text-slate-800 text-base">{g.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{g.department}</p>
                  </div>
                  <div className="p-2.5 bg-teal-50 text-teal-600 rounded-2xl">
                    <MdOutlinedFlag size={20} />
                  </div>
                </div>
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                    <span>{g.currentValue} {g.unit}</span>
                    <span>{g.targetValue} {g.unit} target</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-700 ${g.status === 'achieved' ? 'bg-blue-500' : g.status === 'at_risk' ? 'bg-amber-400' : 'bg-[#4CAF3A]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 text-right font-medium">{pct}% complete · Due {new Date(g.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
