import React, { useState } from 'react';
import { 
  MdNature, MdPeople, MdAccountBalance, MdDashboard,
  MdPlayArrow, MdPictureAsPdf, MdTableChart, MdDataArray, MdKeyboardArrowDown
} from 'react-icons/md';
import { Button } from '../../../components/common/Button';
import { Table } from '../../../components/common/Table';
import { Modal } from '../../../components/common/Modal';
import toast from 'react-hot-toast';

// ── Export Utilities ──────────────────────────────────────────────────────────
function downloadCSV(data: any[], filename: string) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).filter(k => k !== 'id').join(',');
  const rows = data.map(obj => Object.keys(obj).filter(k => k !== 'id').map(k => `"${obj[k]}"`).join(',')).join('\n');
  const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function downloadExcel(data: any[], filename: string) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).filter(k => k !== 'id').join('\t');
  const rows = data.map(obj => Object.keys(obj).filter(k => k !== 'id').map(k => `"${obj[k]}"`).join('\t')).join('\n');
  const blob = new Blob([headers + '\n' + rows], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.xls`; a.click();
  URL.revokeObjectURL(url);
}

interface ReportData {
  id: string;
  metric: string;
  value: string;
  trend: string;
  department: string;
}

const CustomFilterSelect = ({ options, value, onChange, placeholder }: { options: {value:string, label:string}[], value: string, onChange: (v:string)=>void, placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative flex-1" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 px-4 py-2.5 text-sm text-white cursor-pointer flex items-center justify-between transition-colors shadow-sm"
      >
        <span className={selected ? 'text-white font-medium' : 'text-white/70'}>{selected ? selected.label : placeholder}</span>
        <MdKeyboardArrowDown className={`text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a2e30] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
          <div 
            onClick={() => { onChange(''); setIsOpen(false); }}
            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${value === '' ? 'bg-[#4CAF3A]/20 text-[#4CAF3A] font-medium' : 'text-white/70 hover:bg-white/10'}`}
          >
            {placeholder} (Clear)
          </div>
          {options.map(opt => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${value === opt.value ? 'bg-[#4CAF3A]/20 text-[#4CAF3A] font-medium' : 'text-white hover:bg-white/10'}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData[] | null>(null);
  const [reportTitle, setReportTitle] = useState<string>('');
  
  const [filters, setFilters] = useState({
    dateRange: '', department: '', module: '', employee: '', challenge: '', category: ''
  });

  const handleGenerate = (title: string) => {
    setReportTitle(title);
    setReportData([
      { id: '1', metric: `${title} Main Score`, value: '85/100', trend: '+5%', department: 'All' },
      { id: '2', metric: `Active Initiatives`, value: '12', trend: '+2', department: 'Operations' },
      { id: '3', metric: `Compliance Rate`, value: '98%', trend: '+1%', department: 'Legal' },
      { id: '4', metric: `Budget Utilization`, value: '$45,000', trend: '-$5,000', department: 'Finance' },
      { id: '5', metric: `Target Completion`, value: '75%', trend: '+15%', department: 'HR' },
    ]);
    toast.success(`${title} generated successfully.`);
  };

  const handleExportPDF = () => {
    if (!reportData) return toast.error("Please generate a report first.");
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData) return toast.error("Please generate a report first.");
    downloadCSV(reportData, reportTitle.replace(/\s+/g, '-').toLowerCase());
  };

  const handleExportExcel = () => {
    if (!reportData) return toast.error("Please generate a report first.");
    downloadExcel(reportData, reportTitle.replace(/\s+/g, '-').toLowerCase());
  };

  const columns = [
    { key: 'metric', header: 'Metric' },
    { key: 'value', header: 'Value', render: (row: ReportData) => <span className="font-bold">{row.value}</span> },
    { key: 'trend', header: 'Trend', render: (row: ReportData) => <span className={row.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}>{row.trend}</span> },
    { key: 'department', header: 'Department' },
  ];

  const quickReports = [
    {
      id: 'environmental',
      title: 'Environmental Report',
      description: 'Emissions, goals, vendor & product breakdown',
      icon: <MdNature size={24} className="text-emerald-500" />
    },
    {
      id: 'social',
      title: 'Social Report',
      description: 'Diversity, CSR participation, training completion',
      icon: <MdPeople size={24} className="text-blue-500" />
    },
    {
      id: 'governance',
      title: 'Governance Report',
      description: 'Policies, audits, compliance & risk summary',
      icon: <MdAccountBalance size={24} className="text-purple-500" />
    },
    {
      id: 'summary',
      title: 'ESG Summary',
      description: 'Executive overview: all 4 scores + dept comparison',
      icon: <MdDashboard size={24} className="text-orange-500" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* QUICK REPORTS - Grid view for Environmental, Social, Governance, Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickReports.map((report) => (
          <div key={report.id} id={report.id} className="scroll-mt-28">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  {report.icon}
                </div>
                <h3 className="font-bold text-slate-800 leading-tight">{report.title}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6 flex-1">
                {report.description}
              </p>
              <Button variant="outline" className="w-full justify-center" onClick={() => handleGenerate(report.title)}>Generate</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* CUSTOM REPORT BUILDER */}
      <div id="builder" className="scroll-mt-28">
        <div className="bg-[#0D3B3E] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MdDashboard className="text-[#4CAF3A]" />
              Custom Report Builder: Filters
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <CustomFilterSelect 
                placeholder="Date Range" 
                value={filters.dateRange} 
                onChange={v => setFilters({...filters, dateRange: v})}
                options={[
                  {value: 'q1', label: 'Q1 2026'},
                  {value: 'q2', label: 'Q2 2026'},
                  {value: 'year', label: 'Year to Date'}
                ]} 
              />
              <CustomFilterSelect 
                placeholder="Department" 
                value={filters.department} 
                onChange={v => setFilters({...filters, department: v})}
                options={[
                  {value: 'hr', label: 'HR'},
                  {value: 'it', label: 'IT'},
                  {value: 'sales', label: 'Sales'}
                ]} 
              />
              <CustomFilterSelect 
                placeholder="Module" 
                value={filters.module} 
                onChange={v => setFilters({...filters, module: v})}
                options={[
                  {value: 'env', label: 'Environmental'},
                  {value: 'soc', label: 'Social'},
                  {value: 'gov', label: 'Governance'}
                ]} 
              />
              <CustomFilterSelect 
                placeholder="Employee" 
                value={filters.employee} 
                onChange={v => setFilters({...filters, employee: v})}
                options={[
                  {value: 'all', label: 'All Employees'}
                ]} 
              />
              <CustomFilterSelect 
                placeholder="Challenge" 
                value={filters.challenge} 
                onChange={v => setFilters({...filters, challenge: v})}
                options={[
                  {value: 'active', label: 'Active Challenges'}
                ]} 
              />
              <CustomFilterSelect 
                placeholder="ESG Category" 
                value={filters.category} 
                onChange={v => setFilters({...filters, category: v})}
                options={[
                  {value: 'all', label: 'All Categories'}
                ]} 
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" className="bg-[#4CAF3A] hover:bg-[#3d8c2f] text-white border-none" leftIcon={<MdPlayArrow size={20} />} onClick={() => handleGenerate('Custom Builder Report')}>
                Run Report
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleExportPDF} className="text-white border-white/20 hover:bg-white/10" leftIcon={<MdPictureAsPdf size={18} />}>
                  Export: PDF
                </Button>
                <Button variant="outline" onClick={handleExportExcel} className="text-white border-white/20 hover:bg-white/10" leftIcon={<MdTableChart size={18} />}>
                  Export: Excel
                </Button>
                <Button variant="outline" onClick={handleExportCSV} className="text-white border-white/20 hover:bg-white/10" leftIcon={<MdDataArray size={18} />}>
                  Export: CSV
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GENERATED REPORT PREVIEW MODAL */}
      <Modal isOpen={!!reportData} onClose={() => setReportData(null)} title={`${reportTitle} Preview`}>
        <div className="overflow-hidden rounded-2xl border border-slate-100 my-4">
          <Table columns={columns} data={reportData || []} />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={handleExportPDF} leftIcon={<MdPictureAsPdf size={18} />}>PDF</Button>
          <Button variant="outline" onClick={handleExportExcel} leftIcon={<MdTableChart size={18} />}>Excel</Button>
          <Button variant="outline" onClick={handleExportCSV} leftIcon={<MdDataArray size={18} />}>CSV</Button>
          <Button variant="primary" onClick={() => setReportData(null)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
};
