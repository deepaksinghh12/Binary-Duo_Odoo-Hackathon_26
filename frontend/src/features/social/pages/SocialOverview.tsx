import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MdNature, MdBloodtype, MdWaterDrop, MdSchool, MdPeople,
  MdCheckCircle, MdHourglassEmpty, MdAdd, MdDownload, MdTrendingUp,
  MdTrendingDown, MdTrendingFlat, MdStars, MdEdit, MdDelete
} from 'react-icons/md';
import { SocialService } from '../services/SocialService';
import { CreateCSRModal } from '../components/CreateCSRModal';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Table } from '../../../components/common/Table';
import type { CSRActivity, EmployeeParticipation, DiversityMetric } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const getActivityIcon = (name: string, className = 'text-white') => {
  const map: Record<string, React.ReactNode> = {
    tree:     <MdNature size={22} className={className} />,
    blood:    <MdBloodtype size={22} className={className} />,
    beach:    <MdWaterDrop size={22} className={className} />,
    workshop: <MdSchool size={22} className={className} />,
  };
  return map[name] ?? <MdStars size={22} className={className} />;
};

const ACTIVITY_GRADIENTS: Record<string, string> = {
  tree:     'from-emerald-500 to-green-400',
  blood:    'from-red-500 to-rose-400',
  beach:    'from-orange-500 to-amber-400',
  workshop: 'from-blue-500 to-indigo-400',
};

// ── Export helpers ─────────────────────────────────────────────────────────────

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

// ── Participation donut SVG ────────────────────────────────────────────────────

interface DonutProps { approved: number; pending: number; }
const ParticipationDonut = React.forwardRef<SVGSVGElement, DonutProps>(({ approved, pending }, ref) => {
  const total = approved + pending || 1;
  const r = 50, cx = 70, cy = 70, stroke = 16;
  const circ = 2 * Math.PI * r;
  const approvedDash = (approved / total) * circ;
  return (
    <svg ref={ref} viewBox="0 0 140 140" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4CAF3A" strokeWidth={stroke}
        strokeDasharray={`${approvedDash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#0D3B3E">{approved}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">Approved</text>
    </svg>
  );
});

// ── Export Dropdown ────────────────────────────────────────────────────────────

interface ExportDropdownProps { onPNG: () => void; onSVG: () => void; }
const ExportDropdown: React.FC<ExportDropdownProps> = ({ onPNG, onSVG }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <Button variant="outline" rightIcon={<span className="text-xs">▼</span>} className="bg-slate-100 border-none text-sm" onClick={() => setOpen(!open)}>
        <MdDownload size={16} className="mr-1" /> Export
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <button onClick={() => { onPNG(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors border-b border-slate-50">Download PNG</button>
          <button onClick={() => { onSVG(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors">Download SVG</button>
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

export const SocialOverview: React.FC = () => {
  const [activities, setActivities] = useState<CSRActivity[]>([]);
  const [participations, setParticipations] = useState<EmployeeParticipation[]>([]);
  const [diversity, setDiversity] = useState<DiversityMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCSRModalOpen, setIsCSRModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<CSRActivity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<CSRActivity | null>(null);

  const csrRef          = useRef<HTMLDivElement>(null);
  const participRef     = useRef<HTMLDivElement>(null);
  const diversityRef    = useRef<HTMLDivElement>(null);
  const donutRef        = useRef<SVGSVGElement>(null);
  const location = useLocation();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [a, p, d] = await Promise.all([
          SocialService.getCSRActivities(),
          SocialService.getEmployeeParticipations(),
          SocialService.getDiversityMetrics(),
        ]);
        setActivities(a); setParticipations(p); setDiversity(d);
      } finally { setIsLoading(false); }
    };
    load();
  }, []);

  const handleDeleteActivity = (id: string) => {
    setActivityToDelete(activities.find(a => a.id === id) || null);
  };

  const confirmDeleteActivity = () => {
    if (activityToDelete) {
      setActivities(activities.filter(a => a.id !== activityToDelete.id));
      setActivityToDelete(null);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    setTimeout(() => {
      if (location.pathname.includes('diversity') && diversityRef.current) diversityRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (location.pathname.includes('participation') && participRef.current) participRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (location.pathname.includes('csr') && csrRef.current) csrRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }, [location.pathname, isLoading]);

  const approved = participations.filter(p => p.approvalStatus === 'approved').length;
  const pending  = participations.filter(p => p.approvalStatus === 'pending').length;
  const totalParticipants = activities.reduce((s, a) => s + a.participantsCount, 0);

  const KPI_CARDS = [
    { label: 'CSR Activities',    value: activities.length,    unit: 'active',      icon: <MdNature size={20} />,        color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Participants', value: totalParticipants,   unit: 'employees',   icon: <MdPeople size={20} />,        color: 'bg-blue-50 text-blue-600' },
    { label: 'Approved Records',  value: approved,             unit: 'records',     icon: <MdCheckCircle size={20} />,   color: 'bg-green-50 text-green-600' },
    { label: 'Pending Review',    value: pending,              unit: 'records',     icon: <MdHourglassEmpty size={20} />, color: 'bg-amber-50 text-amber-600' },
  ];

  const participColumns = [
    { key: 'employeeName', header: 'Employee' },
    { key: 'activityChallenge', header: 'Activity / Challenge' },
    { key: 'proof', header: 'Proof' },
    { key: 'points', header: 'Points', render: (r: EmployeeParticipation) => <span className="font-bold text-[#0D3B3E]">{r.points} XP</span> },
    {
      key: 'approvalStatus', header: 'Status',
      render: (r: EmployeeParticipation) => {
        const v = r.approvalStatus === 'approved' ? 'success' : r.approvalStatus === 'rejected' ? 'danger' : 'warning';
        return <Badge variant={v as any} className="capitalize font-bold text-[10px] uppercase">{r.approvalStatus}</Badge>;
      }
    },
  ];

  const getTrendIcon = (t: string) => {
    if (t === 'up')   return <MdTrendingUp   size={18} className="text-emerald-500" />;
    if (t === 'down') return <MdTrendingDown size={18} className="text-red-400" />;
    return                   <MdTrendingFlat  size={18} className="text-slate-400" />;
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-12 pb-8">

      {/* KPI ROW */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Social Overview</h2>
            <p className="text-sm text-slate-500">Summary of CSR activities, participation, and diversity metrics.</p>
          </div>
          <ExportDropdown
            onPNG={() => donutRef.current && downloadPNG(donutRef.current, 'social-participation')}
            onSVG={() => donutRef.current && downloadSVG(donutRef.current, 'social-participation')}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {KPI_CARDS.map(c => (
            <div key={c.label} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-300 flex flex-col gap-2">
              <div className={`p-2 rounded-xl w-fit ${c.color}`}>{c.icon}</div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">{c.label}</p>
              <p className="text-2xl font-extrabold text-[#0D3B3E]">{c.value} <span className="text-sm font-medium text-slate-400">{c.unit}</span></p>
            </div>
          ))}
        </div>

        {/* Participation Donut + Summary */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-8">
          <div className="w-36 h-36 shrink-0">
            <ParticipationDonut ref={donutRef} approved={approved} pending={pending} />
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Participation Breakdown</h3>
            <div className="flex gap-6 flex-wrap">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#4CAF3A]" /><span className="text-sm font-bold text-slate-700">{approved} Approved</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400" /><span className="text-sm font-bold text-slate-700">{pending} Pending</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-200" /><span className="text-sm font-bold text-slate-700">{participations.length} Total records</span></div>
            </div>
            <p className="text-xs text-slate-400">Participation approval rate: <strong className="text-[#0D3B3E]">{participations.length ? Math.round((approved / participations.length) * 100) : 0}%</strong></p>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* CSR ACTIVITIES CARDS */}
      <div id="csr" ref={csrRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">CSR Activities</h2>
            <p className="text-sm text-slate-500">Corporate Social Responsibility initiatives and participant stats.</p>
          </div>
          <Button 
            variant="primary" 
            leftIcon={<MdAdd size={20} />} 
            className="bg-[#4CAF3A] hover:bg-[#439c33] border-none text-white"
            onClick={() => setIsCSRModalOpen(true)}
          >
            New Activity
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-44 bg-slate-200 rounded-3xl animate-pulse" />)
          ) : activities.map(act => (
            <div key={act.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:border-slate-200 transition-all duration-300 group flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ACTIVITY_GRADIENTS[act.icon] ?? 'from-slate-400 to-slate-300'} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                  {getActivityIcon(act.icon)}
                </div>
                <div className="flex gap-0.5 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={() => setActivityToEdit(act)}
                    className="p-2 text-slate-400 hover:text-[#4CAF3A] hover:bg-[#4CAF3A]/10 rounded-full transition-colors cursor-pointer"
                    title="Modify"
                  >
                    <MdEdit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteActivity(act.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-extrabold text-slate-800 text-base group-hover:text-[#0D3B3E] transition-colors">{act.title}</h3>
                <Badge
                  variant={act.status === 'open' ? 'success' : 'warning'}
                  className="mt-1 capitalize text-[10px] font-bold uppercase"
                >
                  {act.status === 'evidence_required' ? 'Evidence Required' : act.status}
                </Badge>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Participants</span>
                  <span className="text-lg font-extrabold text-[#0D3B3E]">{act.participantsCount}</span>
                </div>
                <MdPeople size={28} className="text-slate-200 group-hover:text-[#4CAF3A] transition-colors duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* EMPLOYEE PARTICIPATION TABLE */}
      <div id="participation" ref={participRef} className="scroll-mt-28">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#0D3B3E]">Employee Participation</h2>
          <p className="text-sm text-slate-500">Individual employee records for CSR and challenge activity.</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <Table columns={participColumns} data={participations} isLoading={isLoading} />
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* DIVERSITY METRICS */}
      <div id="diversity" ref={diversityRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Diversity & Inclusion Metrics</h2>
            <p className="text-sm text-slate-500">Workforce representation, pay equity, and inclusion indicators.</p>
          </div>
          <Button variant="primary" leftIcon={<MdAdd size={20} />} className="bg-[#4CAF3A] hover:bg-[#439c33] border-none text-white">
            Add Metric
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-slate-200 rounded-3xl animate-pulse" />)
          ) : diversity.map(d => (
            <div key={d.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.category}</span>
                {getTrendIcon(d.trend)}
              </div>
              <p className="text-sm font-semibold text-slate-700 leading-snug">{d.label}</p>
              <p className="text-3xl font-extrabold text-[#0D3B3E] mt-auto">{d.value}<span className="text-base font-medium text-slate-400 ml-0.5">%</span></p>
            </div>
          ))}
        </div>
      </div>
      
      <CreateCSRModal 
        isOpen={isCSRModalOpen || !!activityToEdit}
        onClose={() => {
          setIsCSRModalOpen(false);
          setActivityToEdit(null);
        }}
        initialData={activityToEdit}
        onSuccess={(updatedActivity) => {
          if (activityToEdit) {
            setActivities(activities.map(a => a.id === updatedActivity.id ? updatedActivity as CSRActivity : a));
          } else {
            setActivities([updatedActivity as CSRActivity, ...activities]);
          }
          setIsCSRModalOpen(false);
          setActivityToEdit(null);
        }}
      />
      
      <ConfirmModal
        isOpen={!!activityToDelete}
        onClose={() => setActivityToDelete(null)}
        onConfirm={confirmDeleteActivity}
        title="Delete CSR Activity"
        message={`Are you sure you want to delete "${activityToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmStyle="danger"
      />
    </div>
  );
};
