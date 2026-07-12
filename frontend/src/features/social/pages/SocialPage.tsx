import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MdNature, MdBloodtype, MdWaterDrop, MdSchool,
  MdCheckCircle, MdCancel, MdTrendingUp, MdTrendingDown, MdTrendingFlat,
  MdAdd, MdEdit, MdDelete
} from 'react-icons/md';
import { SocialService } from '../services/SocialService';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Table } from '../../../components/common/Table';
import { CreateCSRModal } from '../components/CreateCSRModal';
import type { CSRActivity, EmployeeParticipation, DiversityMetric } from '../types';

// ── Helpers ────────────────────────────────────────────────────────────────────

const getActivityIcon = (name: string) => {
  const map: Record<string, React.ReactNode> = {
    tree:     <MdNature size={24} />,
    blood:    <MdBloodtype size={24} />,
    beach:    <MdWaterDrop size={24} />,
    workshop: <MdSchool size={24} />,
  };
  return map[name] ?? <MdNature size={24} />;
};

const ACTIVITY_COLORS: Record<string, { bg: string; icon: string; label: string }> = {
  tree:     { bg: 'bg-emerald-50 text-emerald-600', icon: '', label: 'text-emerald-600' },
  blood:    { bg: 'bg-red-50 text-red-600',         icon: '', label: 'text-red-600' },
  beach:    { bg: 'bg-orange-50 text-orange-600',   icon: '', label: 'text-orange-600' },
  workshop: { bg: 'bg-blue-50 text-blue-600',       icon: '', label: 'text-blue-600' },
};

const getCategoryColor = (category: string) => {
  const m: Record<string, string> = {
    Gender:     'text-purple-600 bg-purple-50',
    'Pay Equity': 'text-emerald-600 bg-emerald-50',
    Age:        'text-blue-600 bg-blue-50',
  };
  return m[category] ?? 'text-slate-600 bg-slate-100';
};

const getTrendIcon = (trend: string) => {
  if (trend === 'up')   return <MdTrendingUp size={16} className="text-emerald-500" />;
  if (trend === 'down') return <MdTrendingDown size={16} className="text-red-500" />;
  return <MdTrendingFlat size={16} className="text-slate-400" />;
};

// ── Export helpers ─────────────────────────────────────────────────────────────

function downloadCSV(data: any[], filename: string) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function downloadExcel(data: any[], filename: string) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).join('\t');
  const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join('\t')).join('\n');
  const blob = new Blob([headers + '\n' + rows], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.xls`; a.click();
  URL.revokeObjectURL(url);
}

// ── Export Dropdown ────────────────────────────────────────────────────────────

interface ExportDropdownProps {
  onPDF: () => void;
  onExcel: () => void;
  onCSV: () => void;
}
const ExportDropdown: React.FC<ExportDropdownProps> = ({ onPDF, onExcel, onCSV }) => {
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
        Export
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <button onClick={() => { onPDF(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors border-b border-slate-50">Download PDF</button>
          <button onClick={() => { onExcel(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors border-b border-slate-50">Download Excel</button>
          <button onClick={() => { onCSV(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors">Download CSV</button>
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

export const SocialPage: React.FC = () => {
  const [activities, setActivities]       = useState<CSRActivity[]>([]);
  const [participations, setParticipations] = useState<EmployeeParticipation[]>([]);
  const [diversity, setDiversity]         = useState<DiversityMetric[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  
  const [isCSRModalOpen, setIsCSRModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<CSRActivity | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const csrRef       = useRef<HTMLDivElement>(null);
  const participRef  = useRef<HTMLDivElement>(null);
  const diversityRef = useRef<HTMLDivElement>(null);
  const location     = useLocation();

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

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    setActivities(prev => prev.filter(a => a.id !== itemToDelete.id));
    setItemToDelete(null);
  };

  // Smooth scroll on tab click
  useEffect(() => {
    if (isLoading) return;
    setTimeout(() => {
      if (location.pathname.includes('diversity') && diversityRef.current)
        diversityRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (location.pathname.includes('participation') && participRef.current)
        participRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (location.pathname.includes('csr') && csrRef.current)
        csrRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }, [location.pathname, isLoading]);

  // Approve / reject handlers
  const handleApprove = (id: string) => {
    setParticipations(prev => prev.map(p => p.id === id ? { ...p, approvalStatus: 'approved' } : p));
  };
  const handleReject = (id: string) => {
    setParticipations(prev => prev.map(p => p.id === id ? { ...p, approvalStatus: 'rejected' } : p));
  };

  // Participation table columns — mirror Governance Acknowledgements table
  const participColumns = [
    { key: 'employeeName',       header: 'Employee' },
    { key: 'activityChallenge',  header: 'Activity / Challenge' },
    { key: 'proof',              header: 'Proof' },
    { key: 'points',             header: 'Points', render: (r: EmployeeParticipation) => <span className="font-bold text-[#0D3B3E]">{r.points} XP</span> },
    {
      key: 'approvalStatus', header: 'Status',
      render: (r: EmployeeParticipation) => {
        const v = r.approvalStatus === 'approved' ? 'success' : r.approvalStatus === 'rejected' ? 'danger' : 'warning';
        return <Badge variant={v as any} className="w-[110px] text-center capitalize tracking-wider font-bold text-[11px]">{r.approvalStatus}</Badge>;
      }
    },
    {
      key: 'actions', header: 'Actions',
      render: (r: EmployeeParticipation) => {
        if (r.approvalStatus === 'approved') {
          return (
            <button onClick={() => handleReject(r.id)} className="flex items-center gap-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">
              Cancel
            </button>
          );
        }
        if (r.approvalStatus === 'rejected') {
          return <span className="text-slate-400 text-xs italic">No actions needed</span>;
        }
        return (
          <div className="flex gap-2">
            <button onClick={() => handleApprove(r.id)} className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">
              <MdCheckCircle size={14} /> Accept
            </button>
            <button onClick={() => handleReject(r.id)} className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">
              <MdCancel size={14} /> Reject
            </button>
          </div>
        );
      }
    },
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-12 pb-8">

      {/* ── CSR ACTIVITIES ───────────────────────────────────────────────── */}
      <div id="csr" ref={csrRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">CSR Activities</h2>
            <p className="text-sm text-slate-500">Manage and track active Corporate Social Responsibility initiatives.</p>
          </div>
          <Button variant="primary" leftIcon={<MdAdd size={20} />}
            className="bg-[#4CAF3A] hover:bg-[#439c33] border-none shadow-green-500/20 text-white"
            onClick={() => setIsCSRModalOpen(true)}>
            New Activity
          </Button>
        </div>

        {/* Cards — same layout as Governance Policies cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-200 rounded-3xl animate-pulse" />)
          ) : activities.map(act => {
            const colors = ACTIVITY_COLORS[act.icon] ?? { bg: 'bg-slate-50 text-slate-600', label: 'text-slate-600' };
            return (
              <div key={act.id}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:border-slate-200 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between mb-5 pt-1">
                    <div className="flex gap-3 items-start">
                      <div className={`p-3 rounded-2xl ${colors.bg} group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm`}>
                        {getActivityIcon(act.icon)}
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <Badge
                          variant={act.status === 'open' ? 'success' : act.status === 'evidence_required' ? 'warning' : 'default'}
                          className="uppercase text-[9px] w-fit"
                        >
                          {act.status === 'evidence_required' ? 'Evidence Required' : act.status}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CSR Initiative</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-0.5 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => { setActivityToEdit(act); setIsCSRModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-[#4CAF3A] hover:bg-[#4CAF3A]/10 rounded-full transition-colors cursor-pointer"
                        title="Modify"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button 
                        onClick={() => setItemToDelete({ id: act.id, name: act.title })}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-lg mb-2 leading-tight group-hover:text-[#0D3B3E] transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-6">
                    Employee-driven initiative open for participation and proof submission.
                  </p>
                </div>

                {/* Metadata footer — same pattern as Policy card */}
                <div className="mt-auto pt-4 border-t border-slate-100/80 bg-slate-50/50 -mx-6 -mb-6 px-6 py-4 flex justify-between items-center group-hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Participants</span>
                    <span className="text-xs font-bold text-slate-700">{act.participantsCount} enrolled</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Module</span>
                    <span className="text-xs font-bold text-slate-700">Social</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* ── EMPLOYEE PARTICIPATION ───────────────────────────────────────── */}
      <div id="participation" ref={participRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Employee Participation</h2>
            <p className="text-sm text-slate-500">Track employee sign-ups and approval status for active activities.</p>
          </div>
          <ExportDropdown
            onPDF={() => window.print()}
            onExcel={() => downloadExcel(participations, 'employee-participation')}
            onCSV={() => downloadCSV(participations, 'employee-participation')}
          />
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <Table columns={participColumns} data={participations} isLoading={isLoading} />
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* ── DIVERSITY & INCLUSION ────────────────────────────────────────── */}
      <div id="diversity" ref={diversityRef} className="scroll-mt-28">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#0D3B3E]">Diversity & Inclusion</h2>
          <p className="text-sm text-slate-500">Workforce representation, pay equity, and inclusion indicators.</p>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl animate-pulse" />)
          ) : diversity.map(d => {
            const colorCls = getCategoryColor(d.category);
            return (
              <div key={d.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${colorCls}`}>{d.category}</span>
                  <div className="p-1.5 bg-slate-50 rounded-full">{getTrendIcon(d.trend)}</div>
                </div>
                <p className="text-sm font-semibold text-slate-700 leading-snug">{d.label}</p>
                <p className="text-3xl font-extrabold text-[#0D3B3E] mt-auto">{d.value}<span className="text-base font-medium text-slate-400 ml-0.5">%</span></p>
              </div>
            );
          })}
        </div>


      </div>

      <CreateCSRModal
        isOpen={isCSRModalOpen || !!activityToEdit}
        onClose={() => { setIsCSRModalOpen(false); setActivityToEdit(null); }}
        onSuccess={(data) => {
          if (activityToEdit) {
            setActivities(prev => prev.map(a => a.id === activityToEdit.id ? { ...a, ...data } as CSRActivity : a));
          } else {
            setActivities(prev => [{ ...data, id: `csr-${Date.now()}`, participantsCount: 0 } as CSRActivity, ...prev]);
          }
          setIsCSRModalOpen(false);
          setActivityToEdit(null);
        }}
        initialData={activityToEdit}
      />

      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Delete Activity"
        message={`Are you sure you want to delete ${itemToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onClose={() => setItemToDelete(null)}
      />

    </div>
  );
};
