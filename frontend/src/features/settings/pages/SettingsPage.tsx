import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MdCorporateFare, MdCategory, MdSettings, MdNotifications, MdAdd,
  MdEdit, MdDelete, MdCheckCircle, MdOutlineSave, MdRefresh, MdShield
} from 'react-icons/md';
import { SettingsService } from '../services/SettingsService';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Table } from '../../../components/common/Table';
import type { Department, EsgCategory, EsgConfiguration, NotificationConfiguration } from '../types';

export const SettingsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories]   = useState<EsgCategory[]>([]);
  const [esgConfig, setEsgConfig]     = useState<EsgConfiguration>({
    autoEmissionEnabled: true,
    evidenceRequirementEnabled: true,
    badgeAutoAwardEnabled: true,
    fieldOwnerRequired: true,
    environmentalWeight: 40,
    socialWeight: 30,
    governanceWeight: 30,
  });
  const [notifyConfig, setNotifyConfig] = useState<NotificationConfiguration>({
    complianceIssueAlerts: true,
    csrApprovalAlerts: true,
    policyReminderAlerts: true,
    badgeUnlockAlerts: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const deptsRef   = useRef<HTMLDivElement>(null);
  const catsRef    = useRef<HTMLDivElement>(null);
  const esgRef     = useRef<HTMLDivElement>(null);
  const notifyRef  = useRef<HTMLDivElement>(null);
  const location   = useLocation();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [d, c, e, n] = await Promise.all([
          SettingsService.getDepartments(),
          SettingsService.getCategories(),
          SettingsService.getEsgConfig(),
          SettingsService.getNotificationConfig(),
        ]);
        setDepartments(d);
        setCategories(c);
        setEsgConfig(e);
        setNotifyConfig(n);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Smooth scroll sync on tab selection
  useEffect(() => {
    if (isLoading) return;
    const pathname = location.pathname;
    setTimeout(() => {
      if (pathname.includes('notifications') && notifyRef.current)
        notifyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (pathname.includes('esg') && esgRef.current)
        esgRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (pathname.includes('categories') && catsRef.current)
        catsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (pathname.includes('departments') && deptsRef.current)
        deptsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }, [location.pathname, isLoading]);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    await new Promise(r => setTimeout(r, 600)); // mock network request
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleToggleEsg = (key: keyof EsgConfiguration) => {
    setEsgConfig(prev => ({
      ...prev,
      [key]: !prev[key as any]
    }));
  };

  const handleToggleNotify = (key: keyof NotificationConfiguration) => {
    setNotifyConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleWeightChange = (key: 'environmentalWeight' | 'socialWeight' | 'governanceWeight', val: number) => {
    setEsgConfig(prev => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, val))
    }));
  };

  const totalWeights = esgConfig.environmentalWeight + esgConfig.socialWeight + esgConfig.governanceWeight;

  const deptColumns = [
    { key: 'name',          header: 'Name' },
    { key: 'code',          header: 'Code' },
    { key: 'head',          header: 'Head' },
    { key: 'parentDept',    header: 'Parent Department' },
    { key: 'employeeCount', header: 'Employees' },
    {
      key: 'status', header: 'Status',
      render: (r: Department) => (
        <Badge variant={r.status === 'active' ? 'success' : 'default'} className="uppercase text-[10px] font-bold">
          {r.status}
        </Badge>
      )
    },
    {
      key: 'actions', header: 'Actions',
      render: () => (
        <div className="flex gap-2">
          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><MdEdit size={16} /></button>
          <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><MdDelete size={16} /></button>
        </div>
      )
    }
  ];

  const catColumns = [
    { key: 'name', header: 'Category Name' },
    {
      key: 'type', header: 'Type',
      render: (r: EsgCategory) => (
        <Badge variant={r.type === 'Challenge' ? 'info' : 'success'} className="font-bold text-[10px] uppercase">
          {r.type}
        </Badge>
      )
    },
    {
      key: 'status', header: 'Status',
      render: (r: EsgCategory) => (
        <Badge variant={r.status === 'active' ? 'success' : 'default'} className="uppercase text-[10px] font-bold">
          {r.status}
        </Badge>
      )
    },
    {
      key: 'actions', header: 'Actions',
      render: () => (
        <div className="flex gap-2">
          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><MdEdit size={16} /></button>
          <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><MdDelete size={16} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-12 pb-12">

      {/* ── DEPARTMENTS SECTION ─────────────────────────────────────────── */}
      <div id="departments" ref={deptsRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Departments Management</h2>
            <p className="text-sm text-slate-500">Configure organizational hierarchy, heads of department, and ESG ownership.</p>
          </div>
          <Button variant="primary" leftIcon={<MdAdd size={20} />}
            className="bg-[#4CAF3A] hover:bg-[#439c33] border-none shadow-green-500/20 text-white font-bold">
            New Department
          </Button>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <Table columns={deptColumns} data={departments} isLoading={isLoading} />
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* ── CATEGORIES SECTION ──────────────────────────────────────────── */}
      <div id="categories" ref={catsRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Category Configuration</h2>
            <p className="text-sm text-slate-500">Define shared categories across CSR Activities and Gamification Challenges.</p>
          </div>
          <Button variant="primary" leftIcon={<MdAdd size={20} />}
            className="bg-[#4CAF3A] hover:bg-[#439c33] border-none shadow-green-500/20 text-white font-bold">
            New Category
          </Button>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <Table columns={catColumns} data={categories} isLoading={isLoading} />
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* ── ESG CONFIGURATION ───────────────────────────────────────────── */}
      <div id="esg" ref={esgRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">ESG Configuration</h2>
            <p className="text-sm text-slate-500">Set system-wide ESG calculation behaviors, evidence criteria, and weights.</p>
          </div>
          <Button variant="outline" leftIcon={<MdRefresh size={18} />} className="text-sm font-bold text-slate-600 border-slate-200 hover:bg-slate-50">
            Reset Defaults
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Toggles */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Core Settings & Toggles</h3>

            {[
              { key: 'autoEmissionEnabled', label: 'Enable auto emission calculator', desc: 'Automatically calculate carbon footprint on new Purchase, Fleet, or Mfg logs.' },
              { key: 'evidenceRequirementEnabled', label: 'Require evidence for all CSR activities', desc: 'Require files and proof uploads from employees before approving CSR points.' },
              { key: 'badgeAutoAwardEnabled', label: 'Auto-award badges on challenge completion', desc: 'Trigger badge awarding immediately when criteria matches, bypassing approval.' },
              { key: 'fieldOwnerRequired', label: 'Require owner & due date for compliance issues', desc: 'Force compliance issues to be assigned to a department head with a resolution deadline.' }
            ].map(t => (
              <div key={t.key} className="flex items-start justify-between gap-4 p-1.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-extrabold text-slate-800">{t.label}</span>
                  <span className="text-xs text-slate-400 leading-normal">{t.desc}</span>
                </div>
                <button
                  onClick={() => handleToggleEsg(t.key as any)}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${esgConfig[t.key as keyof EsgConfiguration] ? 'bg-[#4CAF3A]' : 'bg-slate-200'}`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${esgConfig[t.key as keyof EsgConfiguration] ? 'translate-x-5.5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>

          {/* Weighting Configuration */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Weighted Score Distribution</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Determine the weight of Environmental, Social, and Governance scores when calculating the organization's overall ESG Score. Values must total 100%.
              </p>

              <div className="space-y-6">
                {[
                  { key: 'environmentalWeight', label: 'Environmental Weight', color: 'accent-[#4CAF3A]' },
                  { key: 'socialWeight', label: 'Social Weight', color: 'accent-blue-500' },
                  { key: 'governanceWeight', label: 'Governance Weight', color: 'accent-purple-500' }
                ].map(w => (
                  <div key={w.key} className="space-y-2">
                    <div className="flex justify-between text-sm font-extrabold text-slate-700">
                      <span>{w.label}</span>
                      <span className="text-[#0d3b3e]">{esgConfig[w.key as 'environmentalWeight' | 'socialWeight' | 'governanceWeight']}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={esgConfig[w.key as 'environmentalWeight' | 'socialWeight' | 'governanceWeight']}
                      onChange={(e) => handleWeightChange(w.key as any, parseInt(e.target.value) || 0)}
                      className={`w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer ${w.color}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Weight</span>
                <span className={`text-lg font-black ${totalWeights === 100 ? 'text-[#4CAF3A]' : 'text-red-500'}`}>{totalWeights}%</span>
              </div>
              {totalWeights !== 100 && (
                <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-xl">Must equal 100%</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-slate-200" />

      {/* ── NOTIFICATION SETTINGS ───────────────────────────────────────── */}
      <div id="notifications" ref={notifyRef} className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D3B3E]">Notification Settings</h2>
            <p className="text-sm text-slate-500">Configure alert levels and event notifications for the organization.</p>
          </div>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="flex items-center gap-1 text-[#4CAF3A] text-sm font-extrabold animate-fade-in">
                <MdCheckCircle size={18} /> Settings Saved
              </span>
            )}
            <Button
              variant="primary"
              leftIcon={<MdOutlineSave size={20} />}
              className="bg-[#4CAF3A] hover:bg-[#439c33] border-none shadow-green-500/20 text-white font-extrabold w-44 justify-center"
              onClick={handleSaveConfig}
              disabled={isSaving || totalWeights !== 100}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm max-w-2xl space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Notification Routing & Rules</h3>

          {[
            { key: 'complianceIssueAlerts', label: 'Compliance Issue Alerts', desc: 'Notify assigned owners when a compliance issue is raised or resolved.' },
            { key: 'csrApprovalAlerts', label: 'CSR & Challenge Approval Notifications', desc: 'Alert employees immediately when their submissions get approved or rejected.' },
            { key: 'policyReminderAlerts', label: 'Policy Acknowledgement Reminders', desc: 'Send automatic reminders to users with pending/overdue policy signatures.' },
            { key: 'badgeUnlockAlerts', label: 'Badge Unlock & Achievements', desc: 'Announce badge achievements to users dynamically on matching criteria.' }
          ].map(t => (
            <div key={t.key} className="flex items-start justify-between gap-4 p-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-extrabold text-slate-800">{t.label}</span>
                <span className="text-xs text-slate-400 leading-normal">{t.desc}</span>
              </div>
              <button
                onClick={() => handleToggleNotify(t.key as any)}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${notifyConfig[t.key as keyof NotificationConfiguration] ? 'bg-[#4CAF3A]' : 'bg-slate-200'}`}
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${notifyConfig[t.key as keyof NotificationConfiguration] ? 'translate-x-5.5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
