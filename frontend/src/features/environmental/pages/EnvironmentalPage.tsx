import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MdFactory, MdBolt, MdLocalShipping, MdNature, MdEco, MdTrendingDown,
  MdInventory, MdRecycling, MdOutlinedFlag, MdWaterDrop, MdAdd,
  MdEdit, MdDelete, MdScience, MdEnergySavingsLeaf, MdDirectionsCar,
  MdGrass, MdAir, MdOutlineElectricBolt
} from 'react-icons/md';
import { EnvironmentService } from '../services/EnvironmentService';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import type { EmissionFactor, ProductESGProfile, CarbonTransaction, EnvironmentalGoal } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

type GoalStatus = 'on_track' | 'at_risk' | 'behind' | 'achieved';

// ── Helpers ────────────────────────────────────────────────────────────────────

const computeGoalStatus = (current: number, target: number, targetDate: string): GoalStatus => {
  const pct = current / (target || 1);
  if (pct >= 1) return 'achieved';
  const now = new Date();
  const due = new Date(targetDate);
  const totalMs = due.getTime() - new Date('2023-01-01').getTime(); // rough start
  const elapsedMs = now.getTime() - new Date('2023-01-01').getTime();
  const timeProgress = Math.min(1, elapsedMs / totalMs);
  if (pct >= timeProgress * 0.9) return 'on_track';
  if (pct >= timeProgress * 0.6) return 'at_risk';
  return 'behind';
};

const GOAL_STATUS_META: Record<GoalStatus, { label: string; variant: 'success' | 'info' | 'warning' | 'danger'; barColor: string }> = {
  on_track: { label: 'On Track',  variant: 'success', barColor: 'bg-[#4CAF3A]' },
  at_risk:  { label: 'At Risk',   variant: 'warning', barColor: 'bg-amber-400' },
  behind:   { label: 'Behind',    variant: 'danger',  barColor: 'bg-red-400'   },
  achieved: { label: 'Achieved',  variant: 'info',    barColor: 'bg-blue-500'  },
};

const EMISSION_ICON_MAP: Record<string, React.ReactNode> = {
  Energy:     <MdBolt size={22} />,
  Transport:  <MdLocalShipping size={22} />,
  Materials:  <MdInventory size={22} />,
  Agriculture:<MdGrass size={22} />,
  Waste:      <MdRecycling size={22} />,
  Air:        <MdAir size={22} />,
};

const EMISSION_COLOR_MAP: Record<string, string> = {
  Energy:     'bg-yellow-50 text-yellow-600',
  Transport:  'bg-blue-50 text-blue-600',
  Materials:  'bg-slate-50 text-slate-600',
  Agriculture:'bg-lime-50 text-lime-600',
  Waste:      'bg-orange-50 text-orange-600',
  Air:        'bg-sky-50 text-sky-600',
};

const getRatingColor = (r: string) => {
  const m: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
    A: 'success', B: 'info', C: 'warning', D: 'danger', F: 'danger'
  };
  return m[r] ?? 'default';
};

const getTransactionTypeColor = (type: string) => {
  const m: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
    offset: 'info', credit: 'success', tax: 'danger', emission: 'warning'
  };
  return m[type] ?? 'default';
};

const getTransactionStatusColor = (s: string) => {
  const m: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    completed: 'success', pending: 'warning', failed: 'danger'
  };
  return m[s] ?? 'default';
};

// ── Export Utilities ──────────────────────────────────────────────────────────

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.json`; a.click();
  URL.revokeObjectURL(url);
}

// ── Export Dropdown ───────────────────────────────────────────────────────────

interface ExportDropdownProps { label?: string; onPDF: () => void; onJSON: () => void; }
const ExportDropdown: React.FC<ExportDropdownProps> = ({ label = 'Export', onPDF, onJSON }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <Button variant="outline" rightIcon={<span className="text-xs">▼</span>} className="bg-slate-100 border-none" onClick={() => setOpen(!open)}>
        {label}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <button onClick={() => { onPDF(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors border-b border-slate-50">Download PDF</button>
          <button onClick={() => { onJSON(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors">Download JSON</button>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export const EnvironmentalPage: React.FC = () => {
  const [factors, setFactors]           = useState<EmissionFactor[]>([]);
  const [products, setProducts]         = useState<ProductESGProfile[]>([]);
  const [transactions, setTransactions] = useState<CarbonTransaction[]>([]);
  const [goals, setGoals]               = useState<EnvironmentalGoal[]>([]);
  const [isLoading, setIsLoading]       = useState(true);

  const emissionsRef    = useRef<HTMLDivElement>(null);
  const productsRef     = useRef<HTMLDivElement>(null);
  const transactionsRef = useRef<HTMLDivElement>(null);
  const goalsRef        = useRef<HTMLDivElement>(null);
  const location        = useLocation();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [f, p, t, g] = await Promise.all([
          EnvironmentService.getEmissionFactors(),
          EnvironmentService.getProductProfiles(),
          EnvironmentService.getCarbonTransactions(),
          EnvironmentService.getEnvironmentalGoals(),
        ]);
        setFactors(f);
        setProducts(p);
        // Only manual entries
        setTransactions(t.filter(tx => !tx.sourceModule || tx.sourceModule === 'manual'));
        setGoals(g);
      } finally { setIsLoading(false); }
    };
    load();
  }, []);

  // Scroll to section on tab-based navigation
  useEffect(() => {
    if (isLoading) return;
    const pathname = location.pathname;
    setTimeout(() => {
      if (pathname.includes('goals') && goalsRef.current)
        goalsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (pathname.includes('transactions') && transactionsRef.current)
        transactionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (pathname.includes('products') && productsRef.current)
        productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (pathname.includes('emissions') && emissionsRef.current)
        emissionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }, [location.pathname, isLoading]);

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-12 pb-8">

      {/* ── EMISSION FACTORS ─────────────────────────────────────────────── */}
      <div id="emissions" ref={emissionsRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Emission Factors</h2>
            <p className="text-sm text-slate-500">Reference CO2e coefficients used across carbon calculations.</p>
          </div>
          <div className="flex gap-3">
            <ExportDropdown
              onPDF={() => window.print()}
              onJSON={() => downloadJSON(factors, 'emission-factors')}
            />
            <Button variant="primary" leftIcon={<MdAdd size={20} />}
              className="bg-[#4CAF3A] hover:bg-[#439c33] border-none shadow-green-500/20 text-white">
              Add Factor
            </Button>
          </div>
        </div>

        {/* Cards — same layout as Governance Policies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-200 rounded-3xl animate-pulse" />)
          ) : factors.map(f => {
            const iconBg  = EMISSION_COLOR_MAP[f.category] ?? 'bg-slate-50 text-slate-600';
            const iconEl  = EMISSION_ICON_MAP[f.category]  ?? <MdScience size={22} />;
            return (
              <div key={f.id}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:border-slate-200 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between mb-5 pt-1">
                    <div className="flex gap-3 items-start">
                      <div className={`p-3 rounded-2xl ${iconBg} group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm`}>
                        {iconEl}
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <Badge variant={f.status === 'active' ? 'success' : 'default'} className="uppercase text-[9px] w-fit">
                          {f.status}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.category}</span>
                      </div>
                    </div>

                    {/* Hover actions */}
                    <div className="flex gap-0.5 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Edit">
                        <MdEdit size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete">
                        <MdDelete size={18} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-lg mb-2 leading-tight group-hover:text-[#0D3B3E] transition-colors">
                    {f.activity}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-6">
                    CO2e coefficient sourced from <strong>{f.source}</strong> ({f.year}). Used to calculate emissions per unit of activity.
                  </p>
                </div>

                {/* Metadata footer */}
                <div className="mt-auto pt-4 border-t border-slate-100/80 bg-slate-50/50 -mx-6 -mb-6 px-6 py-4 flex justify-between items-center group-hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">CO2e Factor</span>
                    <span className="text-xs font-bold text-orange-600">{f.co2e} per {f.unit}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Source Year</span>
                    <span className="text-xs font-bold text-slate-700">{f.year}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* ── PRODUCT ESG PROFILES ─────────────────────────────────────────── */}
      <div id="products" ref={productsRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Product ESG Profiles</h2>
            <p className="text-sm text-slate-500">Carbon footprint, water use, and recycled material ratings per product.</p>
          </div>
          <div className="flex gap-3">
            <ExportDropdown
              onPDF={() => window.print()}
              onJSON={() => downloadJSON(products, 'product-esg-profiles')}
            />
            <Button variant="primary" leftIcon={<MdAdd size={20} />}
              className="bg-[#4CAF3A] hover:bg-[#439c33] border-none shadow-green-500/20 text-white">
              Add Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-52 bg-slate-200 rounded-3xl animate-pulse" />)
          ) : products.map(p => (
            <div key={p.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:border-slate-200 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between mb-5 pt-1">
                  <div className="flex gap-3 items-start">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm">
                      <MdEco size={22} />
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      <Badge variant={getRatingColor(p.rating)} className="uppercase text-[9px] w-fit">
                        Rating {p.rating}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Edit"><MdEdit size={18} /></button>
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete"><MdDelete size={18} /></button>
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-800 text-lg mb-2 leading-tight group-hover:text-[#0D3B3E] transition-colors">
                  {p.productName}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-6">
                  Lifecycle ESG assessment covering carbon, water consumption, and materials sourcing.
                </p>
              </div>

              {/* 3-col metric footer */}
              <div className="mt-auto pt-4 border-t border-slate-100/80 bg-slate-50/50 -mx-6 -mb-6 px-6 py-4 grid grid-cols-3 gap-2 group-hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center gap-0.5">
                  <MdFactory size={13} className="text-orange-400" />
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Carbon</span>
                  <span className="text-xs font-bold text-slate-700">{p.carbonFootprint} kg</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <MdWaterDrop size={13} className="text-blue-400" />
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Water</span>
                  <span className="text-xs font-bold text-slate-700">{p.waterUsage} L</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <MdRecycling size={13} className="text-green-400" />
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Recycled</span>
                  <span className="text-xs font-bold text-slate-700">{p.recycledMaterial}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* ── CARBON TRANSACTIONS (manual only) ───────────────────────────── */}
      <div id="transactions" ref={transactionsRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Carbon Transactions</h2>
            <p className="text-sm text-slate-500">Manually logged carbon offsets, credits, and tax payments.</p>
          </div>
          <ExportDropdown
            onPDF={() => window.print()}
            onJSON={() => downloadJSON(transactions, 'carbon-transactions')}
          />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <MdNature size={48} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No manual carbon transactions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {['Transaction ID', 'Date', 'Type', 'Project / Entity', 'Amount', 'Cost', 'Status'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{tx.id}</td>
                      <td className="px-5 py-3.5 text-slate-600">{tx.date}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={getTransactionTypeColor(tx.type)} className="inline-block w-[90px] text-center text-[11px] font-bold tracking-wide uppercase">
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700">{tx.project}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-700">{tx.amount} tCO2e</td>
                      <td className="px-5 py-3.5 text-slate-600">{tx.cost > 0 ? `$${tx.cost.toLocaleString()}` : '—'}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={getTransactionStatusColor(tx.status)} className="inline-block w-[90px] text-center text-[11px] font-bold tracking-wide uppercase">
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* ── ENVIRONMENTAL GOALS ──────────────────────────────────────────── */}
      <div id="goals" ref={goalsRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Environmental Goals</h2>
            <p className="text-sm text-slate-500">Track progress against reduction targets. Status updates automatically based on completion.</p>
          </div>
          <div className="flex gap-3">
            <ExportDropdown
              onPDF={() => window.print()}
              onJSON={() => downloadJSON(goals, 'environmental-goals')}
            />
            <Button variant="primary" leftIcon={<MdAdd size={20} />}
              className="bg-[#4CAF3A] hover:bg-[#439c33] border-none shadow-green-500/20 text-white">
              New Goal
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-52 bg-slate-200 rounded-3xl animate-pulse" />)
          ) : goals.map(g => {
            const pct    = Math.min(100, Math.round((g.currentValue / (g.targetValue || 1)) * 100));
            const status = computeGoalStatus(g.currentValue, g.targetValue, g.targetDate);
            const meta   = GOAL_STATUS_META[status];
            return (
              <div key={g.id}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:border-slate-200 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between mb-5 pt-1">
                    <div className="flex gap-3 items-start">
                      <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm">
                        <MdOutlinedFlag size={22} />
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <Badge variant={meta.variant} className="uppercase text-[9px] w-fit">
                          {meta.label}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{g.department}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Edit"><MdEdit size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete"><MdDelete size={18} /></button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-lg mb-2 leading-tight group-hover:text-[#0D3B3E] transition-colors">
                    {g.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    Target: <strong>{g.targetValue} {g.unit}</strong> · Metric: {g.metric}
                  </p>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                      <span>{g.currentValue} {g.unit} current</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-700 ${meta.barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-slate-100/80 bg-slate-50/50 -mx-6 -mb-6 px-6 py-4 flex justify-between items-center group-hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Target</span>
                    <span className="text-xs font-bold text-slate-700">{g.targetValue} {g.unit}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Due</span>
                    <span className="text-xs font-bold text-slate-700">
                      {new Date(g.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
