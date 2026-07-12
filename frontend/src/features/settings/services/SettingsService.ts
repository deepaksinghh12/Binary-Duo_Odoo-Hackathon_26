import { api } from '../../../services/api';
import type { Department, EsgCategory, EsgConfiguration, NotificationConfiguration } from '../types';

// ── Rich mock fallbacks ───────────────────────────────────────────────────────

const MOCK_DEPARTMENTS: Department[] = [
  { id: '1', name: 'Manufacturing', code: 'MFG',  head: 'R. Iyer',    parentDept: '—',             employeeCount: 154, status: 'active' },
  { id: '2', name: 'Logistics',     code: 'LOG',  head: 'S. Nair',    parentDept: 'Manufacturing', employeeCount: 42,  status: 'active' },
  { id: '3', name: 'Corporate',     code: 'CORP', head: 'M. Gupta',   parentDept: '—',             employeeCount: 28,  status: 'active' },
  { id: '4', name: 'Facilities',    code: 'FAC',  head: 'A. Kumar',   parentDept: 'Operations',    employeeCount: 15,  status: 'active' },
  { id: '5', name: 'IT Security',   code: 'ITS',  head: 'P. Sharma',  parentDept: 'Corporate',     employeeCount: 21,  status: 'active' },
  { id: '6', name: 'Procurement',   code: 'PRO',  head: 'D. Mehta',   parentDept: '—',             employeeCount: 36,  status: 'active' },
];

const MOCK_CATEGORIES: EsgCategory[] = [
  { id: '1', name: 'Environmental Awareness',  type: 'Challenge',    status: 'active' },
  { id: '2', name: 'Community Outreach',       type: 'CSR Activity', status: 'active' },
  { id: '3', name: 'Health & Wellness',        type: 'CSR Activity', status: 'active' },
  { id: '4', name: 'Waste Reduction',          type: 'Challenge',    status: 'active' },
  { id: '5', name: 'Carbon Footprint Reduction', type: 'Challenge',  status: 'active' },
];

const DEFAULT_ESG_CONFIG: EsgConfiguration = {
  autoEmissionEnabled: true,
  evidenceRequirementEnabled: true,
  badgeAutoAwardEnabled: true,
  fieldOwnerRequired: true,
  environmentalWeight: 40,
  socialWeight: 30,
  governanceWeight: 30,
};

const DEFAULT_NOTIFY_CONFIG: NotificationConfiguration = {
  complianceIssueAlerts: true,
  csrApprovalAlerts: true,
  policyReminderAlerts: true,
  badgeUnlockAlerts: true,
};

// ── Service ───────────────────────────────────────────────────────────────────

export const SettingsService = {
  getDepartments: async (): Promise<Department[]> => {
    try {
      const res = await api.get('/departments');
      const raw: any[] = res.data?.data?.departments || res.data?.data || [];
      if (!raw.length) return MOCK_DEPARTMENTS;
      return raw.map(d => ({
        id: d.id,
        name: d.name,
        code: d.code,
        head: d.manager_name || d.head || '—',
        parentDept: d.parent_department_name || d.parent_id || '—',
        employeeCount: Number(d.employee_count || 0),
        status: d.status === 'active' ? 'active' : 'inactive',
      }));
    } catch {
      return MOCK_DEPARTMENTS;
    }
  },

  getCategories: async (): Promise<EsgCategory[]> => {
    try {
      const res = await api.get('/categories');
      const raw: any[] = res.data?.data?.categories || res.data?.data || [];
      if (!raw.length) return MOCK_CATEGORIES;
      return raw.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type === 'challenge' ? 'Challenge' : 'CSR Activity',
        status: c.status === 'active' ? 'active' : 'inactive',
      }));
    } catch {
      return MOCK_CATEGORIES;
    }
  },

  getEsgConfig: async (): Promise<EsgConfiguration> => {
    try {
      const res = await api.get('/settings');
      const raw: any[] = res.data?.data || [];
      if (!raw.length) return DEFAULT_ESG_CONFIG;
      const get = (key: string) => raw.find(s => s.key === key)?.value;
      return {
        autoEmissionEnabled:        get('auto_calculate_emissions') === 'true',
        evidenceRequirementEnabled: get('evidence_requirement')     !== 'false',
        badgeAutoAwardEnabled:      get('badge_auto_award')         !== 'false',
        fieldOwnerRequired:         get('compliance_owner_required') !== 'false',
        environmentalWeight: 40,
        socialWeight: 30,
        governanceWeight: 30,
      };
    } catch {
      return DEFAULT_ESG_CONFIG;
    }
  },

  getNotificationConfig: async (): Promise<NotificationConfiguration> => {
    try {
      const res = await api.get('/settings');
      const raw: any[] = res.data?.data || [];
      if (!raw.length) return DEFAULT_NOTIFY_CONFIG;
      const get = (key: string) => raw.find(s => s.key === key)?.value;
      return {
        complianceIssueAlerts: get('compliance_issue_alerts')  !== 'false',
        csrApprovalAlerts:     get('csr_approval_alerts')      !== 'false',
        policyReminderAlerts:  get('policy_reminder_alerts')   !== 'false',
        badgeUnlockAlerts:     get('badge_unlock_alerts')      !== 'false',
      };
    } catch {
      return DEFAULT_NOTIFY_CONFIG;
    }
  },
};
