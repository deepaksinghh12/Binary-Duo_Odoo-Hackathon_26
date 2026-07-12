import type { Department, EsgCategory, EsgConfiguration, NotificationConfiguration } from '../types';

const mockDepartments: Department[] = [
  { id: '1', name: 'Manufacturing', code: 'MFG', head: 'R. Iyer', parentDept: '—', employeeCount: 154, status: 'active' },
  { id: '2', name: 'Logistics', code: 'LOG', head: 'S. Nair', parentDept: 'Manufacturing', employeeCount: 42, status: 'active' },
  { id: '3', name: 'Corporate', code: 'CORP', head: 'M. Gupta', parentDept: '—', employeeCount: 28, status: 'active' },
  { id: '4', name: 'Facilities', code: 'FAC', head: 'A. Kumar', parentDept: 'Operations', employeeCount: 15, status: 'active' },
];

const mockCategories: EsgCategory[] = [
  { id: '1', name: 'Environmental Awareness', type: 'Challenge', status: 'active' },
  { id: '2', name: 'Community Outreach', type: 'CSR Activity', status: 'active' },
  { id: '3', name: 'Health & Wellness', type: 'CSR Activity', status: 'active' },
  { id: '4', name: 'Waste Reduction', type: 'Challenge', status: 'active' },
];

const mockEsgConfig: EsgConfiguration = {
  autoEmissionEnabled: true,
  evidenceRequirementEnabled: true,
  badgeAutoAwardEnabled: true,
  fieldOwnerRequired: true,
  environmentalWeight: 40,
  socialWeight: 30,
  governanceWeight: 30,
};

const mockNotificationConfig: NotificationConfiguration = {
  complianceIssueAlerts: true,
  csrApprovalAlerts: true,
  policyReminderAlerts: true,
  badgeUnlockAlerts: true,
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const SettingsService = {
  getDepartments: async (): Promise<Department[]> => {
    await delay(300);
    return [...mockDepartments];
  },
  getCategories: async (): Promise<EsgCategory[]> => {
    await delay(300);
    return [...mockCategories];
  },
  getEsgConfig: async (): Promise<EsgConfiguration> => {
    await delay(200);
    return { ...mockEsgConfig };
  },
  getNotificationConfig: async (): Promise<NotificationConfiguration> => {
    await delay(200);
    return { ...mockNotificationConfig };
  }
};
