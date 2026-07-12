import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MdAdd, MdGavel, MdEco, MdShield, MdLock, MdHandshake, MdDelete, MdEdit } from 'react-icons/md';
import { Button } from '../../../components/common/Button';
import { Table } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';
import { GovernanceService } from '../services/GovernanceService';
import { CreatePolicyModal } from '../components/CreatePolicyModal';
import { CreateAuditModal } from '../components/CreateAuditModal';
import type { Policy, PolicyAcknowledgement, Audit, ComplianceIssue } from '../types';

export const PoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [acknowledgements, setAcknowledgements] = useState<PolicyAcknowledgement[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [policyToEdit, setPolicyToEdit] = useState<Policy | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  const location = useLocation();
  const policiesRef = useRef<HTMLDivElement>(null);
  const acksRef = useRef<HTMLDivElement>(null);
  const auditsRef = useRef<HTMLDivElement>(null);
  const complianceRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [pols, acks, auditData, issueData] = await Promise.all([
          GovernanceService.getPolicies(),
          GovernanceService.getPolicyAcknowledgements(),
          GovernanceService.getAudits(),
          GovernanceService.getComplianceIssues()
        ]);
        setPolicies(pols);
        setAcknowledgements(acks);
        setAudits(auditData);
        setIssues(issueData);
      } catch (error) {
        console.error("Failed to load governance data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle smooth scrolling based on current route
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        if (location.pathname.includes('compliance') && complianceRef.current) {
          complianceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (location.pathname.includes('audits') && auditsRef.current) {
          auditsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (location.pathname.includes('acknowledgements') && acksRef.current) {
          acksRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (location.pathname.includes('policies') && policiesRef.current) {
          policiesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.pathname, isLoading]);

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'gavel': return <MdGavel size={24} />;
      case 'eco': return <MdEco size={24} />;
      case 'shield': return <MdShield size={24} />;
      case 'lock': return <MdLock size={24} />;
      case 'handshake': return <MdHandshake size={24} />;
      default: return <MdGavel size={24} />;
    }
  };

  const getAckColor = (status: string) => {
    switch (status) {
      case 'acknowledged': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'danger';
      default: return 'default';
    }
  };
  
  const getAuditStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Under Review': return 'warning';
      case 'In Progress': return 'default';
      case 'Scheduled': return 'default';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getIssueStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'danger';
      case 'Resolved': return 'success';
      case 'In Progress': return 'warning';
      default: return 'default';
    }
  };

  const handleDeletePolicy = (id: string) => {
    if(window.confirm('Are you sure you want to delete this policy?')) {
      setPolicies(policies.filter(p => p.id !== id));
    }
  };

  const handleAcceptAck = (id: string) => {
    setAcknowledgements(acknowledgements.map(ack => 
      ack.id === id ? { ...ack, status: 'acknowledged', date: new Date().toISOString().split('T')[0] } : ack
    ));
  };

  const handleRejectAck = (id: string) => {
    if(window.confirm('Are you sure you want to reject this acknowledgement?')) {
      // In a real app this might trigger a reminder or reset the status
      setAcknowledgements(acknowledgements.filter(ack => ack.id !== id));
    }
  };

  const handleCancelAck = (id: string) => {
    setAcknowledgements(acknowledgements.map(ack => 
      ack.id === id ? { ...ack, status: 'pending' } : ack
    ));
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ audits, issues }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'governance-data.json';
    a.click();
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  const handleExportPDF = () => {
    window.print();
    setIsExportOpen(false);
  };

  const ackColumns = [
    { key: 'employeeName', header: 'Employee' },
    { key: 'policyTitle', header: 'Policy' },
    { key: 'department', header: 'Department' },
    { key: 'date', header: 'Signed Date' },
    {
      key: 'status',
      header: 'Status',
      render: (row: PolicyAcknowledgement) => (
        <Badge variant={getAckColor(row.status)} className="w-[120px] text-center capitalize tracking-wider font-bold text-[11px]">
          {row.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: PolicyAcknowledgement) => {
        if (row.status === 'acknowledged') {
          return (
            <button 
              onClick={() => handleCancelAck(row.id)}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
          );
        }
        return (
          <div className="flex gap-2">
            <button 
              onClick={() => handleAcceptAck(row.id)}
              className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              Accept
            </button>
            <button 
              onClick={() => handleRejectAck(row.id)}
              className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              Reject
            </button>
          </div>
        );
      }
    }
  ];

  const auditColumns = [
    { key: 'title', header: 'Title' },
    { key: 'department', header: 'Department' },
    { key: 'auditor', header: 'Auditor' },
    { key: 'date', header: 'Date' },
    { key: 'findings', header: 'Findings' },
    {
      key: 'status',
      header: 'Status',
      render: (row: Audit) => (
        <Badge variant={getAuditStatusColor(row.status)} className="w-[120px] text-center font-bold text-[11px] uppercase tracking-wider">
          {row.status}
        </Badge>
      )
    }
  ];

  const issueColumns = [
    { key: 'issue', header: 'Issue' },
    {
      key: 'severity',
      header: 'Severity',
      render: (row: ComplianceIssue) => (
        <Badge variant={getSeverityColor(row.severity)} className="w-[120px] text-center font-bold text-[11px] uppercase tracking-wider">
          {row.severity}
        </Badge>
      )
    },
    { key: 'department', header: 'Department' },
    {
      key: 'status',
      header: 'Status',
      render: (row: ComplianceIssue) => (
        <Badge variant={getIssueStatusColor(row.status)} className="w-[120px] text-center font-bold text-[11px] uppercase tracking-wider">
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-12 pb-8">
      
      {/* POLICIES SECTION */}
      <div id="policies" ref={policiesRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Company Policies</h2>
            <p className="text-sm text-slate-500">Manage and update active ESG and corporate policies.</p>
          </div>
          <Button 
            variant="primary" 
            leftIcon={<MdAdd size={20} />} 
            className="bg-[#4CAF3A] hover:bg-[#439c33] border-none shadow-green-500/20 text-white"
            onClick={() => setIsModalOpen(true)}
          >
            New Policy
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-200 rounded-3xl animate-pulse"></div>)
          ) : (
            policies.map((policy) => (
              <div key={policy.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:border-slate-200 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
                
                <div>
                  <div className="flex items-start justify-between mb-5 pt-1">
                    <div className="flex gap-3 items-start">
                      <div className={`p-3 rounded-2xl ${policy.color || 'bg-slate-50 text-slate-600'} group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm`}>
                        {getIcon(policy.icon)}
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <Badge variant={policy.status === 'active' ? 'success' : policy.status === 'draft' ? 'warning' : 'default'} className="uppercase text-[9px] w-fit">
                          {policy.status}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{policy.department}</span>
                      </div>
                    </div>
                    
                    {/* Sleek Action Menu */}
                    <div className="flex gap-0.5 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={() => setPolicyToEdit(policy)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Modify Policy">
                        <MdEdit size={18} />
                      </button>
                      <button onClick={() => handleDeletePolicy(policy.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete Policy">
                        <MdDelete size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-extrabold text-slate-800 text-lg mb-2 leading-tight group-hover:text-[#0D3B3E] transition-colors">{policy.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-6">{policy.description}</p>
                </div>
                
                {/* Premium Metadata Footer */}
                <div className="mt-auto pt-4 border-t border-slate-100/80 bg-slate-50/50 -mx-6 -mb-6 px-6 py-4 flex justify-between items-center group-hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Version</span>
                    <span className="text-xs font-bold text-slate-700">{policy.version}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Last Updated</span>
                    <span className="text-xs font-bold text-slate-700">
                      {new Date(policy.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="w-full h-px bg-slate-200"></div>

      {/* ACKNOWLEDGEMENTS SECTION */}
      <div id="acknowledgements" ref={acksRef} className="scroll-mt-28">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#0D3B3E]">Policy Acknowledgements</h2>
          <p className="text-sm text-slate-500">Track employee signatures and compliance with active policies.</p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <Table 
            columns={ackColumns} 
            data={acknowledgements} 
            isLoading={isLoading} 
          />
        </div>
      </div>
      
      <div className="w-full h-px bg-slate-200"></div>

      {/* AUDITS SECTION */}
      <div id="audits" ref={auditsRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Audits & Assessments</h2>
            <p className="text-sm text-slate-500">Manage compliance audits and review findings.</p>
          </div>
          <div className="flex gap-3 relative" ref={exportRef}>
            <Button 
              variant="primary" 
              leftIcon={<MdAdd size={20} />} 
              className="bg-[#4CAF3A] hover:bg-[#439c33] border-none shadow-green-500/20 text-white"
              onClick={() => setIsAuditModalOpen(true)}
            >
              New Audit
            </Button>
            <div className="relative">
              <Button variant="outline" rightIcon={<span className="text-xs">▼</span>} className="bg-slate-100 border-none" onClick={() => setIsExportOpen(!isExportOpen)}>
                Export
              </Button>
              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <button onClick={handleExportPDF} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-50 font-medium">
                    Download PDF
                  </button>
                  <button onClick={handleExportJSON} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
                    Download JSON Data
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <Table 
            columns={auditColumns} 
            data={audits} 
            isLoading={isLoading} 
          />
        </div>
      </div>

      <div className="w-full h-px bg-slate-200"></div>

      {/* COMPLIANCE ISSUES SECTION */}
      <div id="compliance" ref={complianceRef} className="scroll-mt-28">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#0D3B3E]">Compliance Issues</h2>
          <p className="text-sm text-slate-500">Track and resolve issues raised from audits with severity tagging.</p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <Table 
            columns={issueColumns} 
            data={issues} 
            isLoading={isLoading} 
          />
        </div>
      </div>

      {/* Modals */}
      <CreatePolicyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newPolicy) => setPolicies([newPolicy as Policy, ...policies])}
      />
      
      <CreatePolicyModal 
        isOpen={!!policyToEdit}
        onClose={() => setPolicyToEdit(null)}
        initialData={policyToEdit}
        onSuccess={(updatedPolicy) => {
          setPolicies(policies.map(p => p.id === updatedPolicy.id ? updatedPolicy as Policy : p));
          setPolicyToEdit(null);
        }}
      />

      <CreateAuditModal 
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onSuccess={(newAudit) => setAudits([newAudit as Audit, ...audits])}
      />
    </div>
  );
};
