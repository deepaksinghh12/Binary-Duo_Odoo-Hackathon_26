import { api } from '../../../services/api';
import type { Policy, PolicyAcknowledgement, Audit, ComplianceIssue } from '../types';

// ── Rich mock fallbacks ───────────────────────────────────────────────────────

const MOCK_POLICIES: Policy[] = [
  { id: 'POL-001', title: 'Code of Conduct & Ethics',     description: 'Core principles guiding employee behavior and business ethics.',             department: 'HR & Legal',    lastUpdated: '2026-01-15', status: 'active', version: 'v2.4', icon: 'gavel',     color: 'text-purple-600 bg-purple-50' },
  { id: 'POL-002', title: 'Environmental Sustainability',  description: 'Guidelines for minimizing environmental impact across operations.',           department: 'Operations',    lastUpdated: '2026-03-22', status: 'active', version: 'v1.2', icon: 'eco',       color: 'text-emerald-600 bg-emerald-50' },
  { id: 'POL-003', title: 'Anti-Bribery & Corruption',    description: 'Strict guidelines preventing unethical financial practices.',                department: 'Legal',         lastUpdated: '2025-11-05', status: 'active', version: 'v3.0', icon: 'shield',    color: 'text-blue-600 bg-blue-50' },
  { id: 'POL-004', title: 'Data Privacy (GDPR/CCPA)',     description: 'Protocols for handling customer and employee data securely.',                 department: 'IT Security',   lastUpdated: '2026-05-10', status: 'active', version: 'v4.1', icon: 'lock',      color: 'text-orange-600 bg-orange-50' },
  { id: 'POL-005', title: 'Supplier Code of Conduct',     description: 'ESG requirements for third-party vendors and suppliers.',                    department: 'Procurement',   lastUpdated: '2026-06-01', status: 'draft',  version: 'v1.0', icon: 'handshake', color: 'text-slate-600 bg-slate-100' },
];

const MOCK_ACKS: PolicyAcknowledgement[] = [
  { id: 'ACK-1', employeeName: 'Aditi Rao',   policyTitle: 'Code of Conduct & Ethics',    department: 'Engineering',   date: '2026-02-01', status: 'acknowledged' },
  { id: 'ACK-2', employeeName: 'Karan Shah',  policyTitle: 'Environmental Sustainability', department: 'Manufacturing', date: '2026-04-12', status: 'acknowledged' },
  { id: 'ACK-3', employeeName: 'Riya Patel',  policyTitle: 'Data Privacy (GDPR/CCPA)',    department: 'Sales',         date: '-',          status: 'pending' },
  { id: 'ACK-4', employeeName: 'Amit Singh',  policyTitle: 'Anti-Bribery & Corruption',   department: 'Procurement',   date: '-',          status: 'overdue' },
  { id: 'ACK-5', employeeName: 'Neha Sharma', policyTitle: 'Code of Conduct & Ethics',    department: 'HR',            date: '2026-02-05', status: 'acknowledged' },
];

const MOCK_AUDITS: Audit[] = [
  { id: 'AUD-001', title: 'Q2 Waste Audit',              department: 'Manufacturing', auditor: 'S. Nair',          date: '2026-06-12', findings: '3 minor issues',  status: 'Completed' },
  { id: 'AUD-002', title: 'Vendor Compliance Check',     department: 'Procurement',   auditor: 'R. Iyer',          date: '2026-07-01', findings: '1 open issue',    status: 'Under Review' },
  { id: 'AUD-003', title: 'Energy Efficiency Assessment', department: 'Facilities',   auditor: 'External (Ecolab)', date: '2026-07-15', findings: 'Pending',        status: 'Scheduled' },
  { id: 'AUD-004', title: 'Data Security Audit',         department: 'IT',            auditor: 'M. Gupta',         date: '2026-07-10', findings: 'In progress',     status: 'In Progress' },
];

const MOCK_ISSUES: ComplianceIssue[] = [
  { id: 'ISS-001', issue: 'Missing MSDS sheets',                      severity: 'High',   department: 'Manufacturing', status: 'Open' },
  { id: 'ISS-002', issue: 'Late vendor disclosure report',             severity: 'Medium', department: 'Procurement',   status: 'Resolved' },
  { id: 'ISS-003', issue: 'HVAC maintenance overdue',                  severity: 'Low',    department: 'Facilities',    status: 'In Progress' },
  { id: 'ISS-004', issue: 'Incomplete employee training records',      severity: 'Medium', department: 'HR',            status: 'Open' },
];

// ── Service ───────────────────────────────────────────────────────────────────

export class GovernanceService {
  static async getPolicies(): Promise<Policy[]> {
    try {
      const res = await api.get('/policies');
      const raw: any[] = res.data?.data?.policies || res.data?.data || [];
      if (!raw.length) return MOCK_POLICIES;
      return raw.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description || '',
        department: p.department_name || p.department_id || 'Corporate',
        lastUpdated: p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : '',
        status: p.status === 'active' ? 'active' : 'draft',
        version: p.version || 'v1.0',
        icon: p.icon || 'shield',
        color: p.color || 'text-blue-600 bg-blue-50',
      }));
    } catch {
      return MOCK_POLICIES;
    }
  }

  static async getPolicyAcknowledgements(): Promise<PolicyAcknowledgement[]> {
    try {
      const res = await api.get('/policies');
      const policies: any[] = res.data?.data?.policies || res.data?.data || [];
      if (!policies.length) return MOCK_ACKS;

      const ackRes = await api.get(`/policies/${policies[0].id}/acknowledgements`);
      const raw: any[] = ackRes.data?.data || [];
      if (!raw.length) return MOCK_ACKS;

      return raw.map(a => ({
        id: a.id,
        employeeName: a.employee_name || a.user_name || 'Employee',
        policyTitle: a.policy_title || policies[0].title || '',
        department: a.department_name || 'Engineering',
        date: a.acknowledged_at ? new Date(a.acknowledged_at).toISOString().split('T')[0] : 'Pending',
        status: a.status || 'acknowledged',
      }));
    } catch {
      return MOCK_ACKS;
    }
  }

  static async getAudits(): Promise<Audit[]> {
    try {
      const res = await api.get('/audits');
      const raw: any[] = res.data?.data?.audits || res.data?.data || [];
      if (!raw.length) return MOCK_AUDITS;
      return raw.map(a => ({
        id: a.id,
        title: a.title,
        department: a.department_name || a.department_id || 'Operations',
        auditor: a.auditor_name || a.auditor || 'Internal Auditor',
        date: a.audit_date ? new Date(a.audit_date).toISOString().split('T')[0] : '',
        findings: a.findings || 'No findings',
        status: a.status || 'Completed',
      }));
    } catch {
      return MOCK_AUDITS;
    }
  }

  static async getComplianceIssues(): Promise<ComplianceIssue[]> {
    try {
      const res = await api.get('/compliance-issues');
      const raw: any[] = res.data?.data?.issues || res.data?.data || [];
      if (!raw.length) return MOCK_ISSUES;
      return raw.map(i => ({
        id: i.id,
        issue: i.description || 'Compliance Violation',
        severity: i.severity || 'Medium',
        department: i.department_name || i.department_id || 'Operations',
        status: i.status || 'Open',
      }));
    } catch {
      return MOCK_ISSUES;
    }
  }
}
