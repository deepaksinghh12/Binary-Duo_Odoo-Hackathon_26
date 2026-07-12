import type { Policy, PolicyAcknowledgement, Audit, ComplianceIssue } from '../types';

export class GovernanceService {
  static async getPolicies(): Promise<Policy[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'POL-001',
            title: 'Code of Conduct & Ethics',
            description: 'Core principles guiding employee behavior and business ethics.',
            department: 'HR & Legal',
            lastUpdated: '2026-01-15',
            status: 'active',
            version: 'v2.4',
            icon: 'gavel',
            color: 'text-purple-600 bg-purple-50'
          },
          {
            id: 'POL-002',
            title: 'Environmental Sustainability',
            description: 'Guidelines for minimizing environmental impact across operations.',
            department: 'Operations',
            lastUpdated: '2026-03-22',
            status: 'active',
            version: 'v1.2',
            icon: 'eco',
            color: 'text-emerald-600 bg-emerald-50'
          },
          {
            id: 'POL-003',
            title: 'Anti-Bribery & Corruption',
            description: 'Strict guidelines preventing unethical financial practices.',
            department: 'Legal',
            lastUpdated: '2025-11-05',
            status: 'active',
            version: 'v3.0',
            icon: 'shield',
            color: 'text-blue-600 bg-blue-50'
          },
          {
            id: 'POL-004',
            title: 'Data Privacy (GDPR/CCPA)',
            description: 'Protocols for handling customer and employee data securely.',
            department: 'IT Security',
            lastUpdated: '2026-05-10',
            status: 'active',
            version: 'v4.1',
            icon: 'lock',
            color: 'text-orange-600 bg-orange-50'
          },
          {
            id: 'POL-005',
            title: 'Supplier Supplier Code',
            description: 'ESG requirements for third-party vendors and suppliers.',
            department: 'Procurement',
            lastUpdated: '2026-06-01',
            status: 'draft',
            version: 'v1.0',
            icon: 'handshake',
            color: 'text-slate-600 bg-slate-100'
          }
        ]);
      }, 600);
    });
  }

  static async getPolicyAcknowledgements(): Promise<PolicyAcknowledgement[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'ACK-1', employeeName: 'Aditi Rao', policyTitle: 'Code of Conduct & Ethics', department: 'Engineering', date: '2026-02-01', status: 'acknowledged' },
          { id: 'ACK-2', employeeName: 'Karan Shah', policyTitle: 'Environmental Sustainability', department: 'Manufacturing', date: '2026-04-12', status: 'acknowledged' },
          { id: 'ACK-3', employeeName: 'Riya Patel', policyTitle: 'Data Privacy (GDPR/CCPA)', department: 'Sales', date: '-', status: 'pending' },
          { id: 'ACK-4', employeeName: 'Amit Singh', policyTitle: 'Anti-Bribery & Corruption', department: 'Procurement', date: '-', status: 'overdue' },
          { id: 'ACK-5', employeeName: 'Neha Sharma', policyTitle: 'Code of Conduct & Ethics', department: 'HR', date: '2026-02-05', status: 'acknowledged' },
        ]);
      }, 700);
    });
  }

  static async getAudits(): Promise<Audit[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'AUD-001', title: 'Q2 Waste Audit', department: 'Manufacturing', auditor: 'S. Nair', date: '2026-06-12', findings: '3 minor issues', status: 'Completed' },
          { id: 'AUD-002', title: 'Vendor Compliance Check', department: 'Procurement', auditor: 'R. Iyer', date: '2026-07-01', findings: '1 open issue', status: 'Under Review' },
          { id: 'AUD-003', title: 'Energy Efficiency Assessment', department: 'Facilities', auditor: 'External (Ecolab)', date: '2026-07-15', findings: 'Pending', status: 'Scheduled' },
          { id: 'AUD-004', title: 'Data Security Audit', department: 'IT', auditor: 'M. Gupta', date: '2026-07-10', findings: 'In progress', status: 'In Progress' }
        ]);
      }, 500);
    });
  }

  static async getComplianceIssues(): Promise<ComplianceIssue[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'ISS-001', issue: 'Missing MSDS sheets', severity: 'High', department: 'Manufacturing', status: 'Open' },
          { id: 'ISS-002', issue: 'Late vendor disclosure', severity: 'Medium', department: 'Procurement', status: 'Resolved' },
          { id: 'ISS-003', issue: 'HVAC maintenance overdue', severity: 'Low', department: 'Facilities', status: 'In Progress' },
          { id: 'ISS-004', issue: 'Incomplete employee training records', severity: 'Medium', department: 'HR', status: 'Open' }
        ]);
      }, 600);
    });
  }
}
