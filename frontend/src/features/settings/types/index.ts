export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  parentDept: string;
  employeeCount: number;
  status: 'active' | 'inactive';
}

export interface EsgCategory {
  id: string;
  name: string;
  type: 'CSR Activity' | 'Challenge';
  status: 'active' | 'inactive';
}

export interface EsgConfiguration {
  autoEmissionEnabled: boolean;
  evidenceRequirementEnabled: boolean;
  badgeAutoAwardEnabled: boolean;
  fieldOwnerRequired: boolean;
  environmentalWeight: number;
  socialWeight: number;
  governanceWeight: number;
}

export interface NotificationConfiguration {
  complianceIssueAlerts: boolean;
  csrApprovalAlerts: boolean;
  policyReminderAlerts: boolean;
  badgeUnlockAlerts: boolean;
}
