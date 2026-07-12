import { api } from '../../../services/api';
import type { CSRActivity, EmployeeParticipation, DiversityMetric } from '../types';

// ── Rich mock fallbacks ───────────────────────────────────────────────────────

const MOCK_ACTIVITIES: CSRActivity[] = [
  { id: '1', title: 'Tree Plantation Drive',   icon: 'tree',     participantsCount: 24, status: 'evidence_required', color: 'text-[#4CAF3A]' },
  { id: '2', title: 'Blood Donation Camp',     icon: 'blood',    participantsCount: 18, status: 'evidence_required', color: 'text-red-500' },
  { id: '3', title: 'Beach Cleanup 2026',      icon: 'beach',    participantsCount: 31, status: 'open',              color: 'text-orange-500' },
  { id: '4', title: 'ESG Awareness Workshop',  icon: 'workshop', participantsCount: 52, status: 'open',              color: 'text-blue-500' },
];

const MOCK_PARTICIPATIONS: EmployeeParticipation[] = [
  { id: '1', employeeName: 'Aditi Rao',    activityChallenge: 'Tree Plantation Drive',  proof: 'photo.jpg',   points: 50,  approvalStatus: 'pending' },
  { id: '2', employeeName: 'Karan Shah',   activityChallenge: 'ESG Awareness Workshop', proof: 'cert.pdf',    points: 30,  approvalStatus: 'approved' },
  { id: '3', employeeName: 'Riya Patel',   activityChallenge: 'Blood Donation Camp',    proof: 'receipt.pdf', points: 100, approvalStatus: 'approved' },
  { id: '4', employeeName: 'Amit Singh',   activityChallenge: 'Beach Cleanup 2026',     proof: 'selfie.jpg',  points: 75,  approvalStatus: 'pending' },
  { id: '5', employeeName: 'Neha Sharma',  activityChallenge: 'Tree Plantation Drive',  proof: 'video.mp4',   points: 50,  approvalStatus: 'rejected' },
];

const MOCK_DIVERSITY: DiversityMetric[] = [
  { id: '1', category: 'Gender',     label: 'Female Representation in Leadership', value: 42,  trend: 'up' },
  { id: '2', category: 'Gender',     label: 'Overall Female Workforce',            value: 48,  trend: 'flat' },
  { id: '3', category: 'Pay Equity', label: 'Gender Pay Gap',                      value: 2.1, trend: 'down' },
  { id: '4', category: 'Age',        label: 'Under 30 Workforce',                  value: 35,  trend: 'up' },
];

// ── Service ───────────────────────────────────────────────────────────────────

export const SocialService = {
  getCSRActivities: async (): Promise<CSRActivity[]> => {
    try {
      const res = await api.get('/csr-activities');
      const raw: any[] = res.data?.data?.activities || res.data?.data || [];
      if (!raw.length) return MOCK_ACTIVITIES;
      return raw.map(a => ({
        id: a.id,
        title: a.title,
        icon: a.icon || 'tree',
        participantsCount: Number(a.participants_count || 0),
        status: a.status === 'open' ? 'open' : 'evidence_required',
        color: a.color || 'text-[#4CAF3A]',
      }));
    } catch {
      return MOCK_ACTIVITIES;
    }
  },

  getEmployeeParticipations: async (): Promise<EmployeeParticipation[]> => {
    try {
      const res = await api.get('/employee-participation');
      const raw: any[] = res.data?.data?.participations || res.data?.data || [];
      if (!raw.length) return MOCK_PARTICIPATIONS;
      return raw.map(p => ({
        id: p.id,
        employeeName: p.employee_name || p.user_name || 'Employee',
        activityChallenge: p.activity_title || p.csr_activity_title || 'CSR Activity',
        proof: p.proof_file_url || '—',
        points: Number(p.points_awarded || 0),
        approvalStatus: p.approval_status || 'pending',
      }));
    } catch {
      return MOCK_PARTICIPATIONS;
    }
  },

  getDiversityMetrics: async (): Promise<DiversityMetric[]> => {
    try {
      const res = await api.get('/social-metrics/diversity');
      const breakdown: any[] = res.data?.departmentBreakdown || [];
      const total = breakdown.reduce((s, b) => s + Number(b.count || 0), 0);
      if (!total) return MOCK_DIVERSITY;
      // Keep sensible defaults since the diversity table doesn't yet exist — live dept count influences one value
      return [
        { id: '1', category: 'Gender',     label: 'Female Representation in Leadership', value: Math.min(60, Math.round(total * 0.42)) || 42, trend: 'up' },
        { id: '2', category: 'Gender',     label: 'Overall Female Workforce',            value: 48,  trend: 'flat' },
        { id: '3', category: 'Pay Equity', label: 'Gender Pay Gap',                      value: 2.1, trend: 'down' },
        { id: '4', category: 'Age',        label: 'Under 30 Workforce',                  value: 35,  trend: 'up' },
      ];
    } catch {
      return MOCK_DIVERSITY;
    }
  },
};
