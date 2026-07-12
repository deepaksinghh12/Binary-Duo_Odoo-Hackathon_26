import type { CSRActivity, EmployeeParticipation, DiversityMetric } from '../types';

const mockCSRActivities: CSRActivity[] = [
  { id: '1', title: 'Tree Plantation', icon: 'tree', participantsCount: 24, status: 'evidence_required', color: 'text-[#4CAF3A]' },
  { id: '2', title: 'Blood Donation', icon: 'blood', participantsCount: 18, status: 'evidence_required', color: 'text-red-500' },
  { id: '3', title: 'Beach Cleanup', icon: 'beach', participantsCount: 31, status: 'open', color: 'text-orange-500' },
  { id: '4', title: 'ESG Workshop', icon: 'workshop', participantsCount: 52, status: 'open', color: 'text-blue-500' },
];

const mockParticipations: EmployeeParticipation[] = [
  { id: '1', employeeName: 'Aditi Rao', activityChallenge: 'Tree Plantation', proof: 'photo.jpg', points: 50, approvalStatus: 'pending' },
  { id: '2', employeeName: 'Karan Shah', activityChallenge: 'ESG Workshop', proof: 'cert.pdf', points: 30, approvalStatus: 'approved' },
  { id: '3', employeeName: 'Riya Patel', activityChallenge: 'Blood Donation', proof: 'receipt.pdf', points: 100, approvalStatus: 'approved' },
  { id: '4', employeeName: 'Amit Singh', activityChallenge: 'Beach Cleanup', proof: 'selfie.jpg', points: 75, approvalStatus: 'pending' },
];

const mockDiversityMetrics: DiversityMetric[] = [
  { id: '1', category: 'Gender', label: 'Female Representation in Leadership', value: 42, trend: 'up' },
  { id: '2', category: 'Gender', label: 'Overall Female Workforce', value: 48, trend: 'flat' },
  { id: '3', category: 'Pay Equity', label: 'Gender Pay Gap', value: 2.1, trend: 'down' }, // Lower is better
  { id: '4', category: 'Age', label: 'Under 30 Workforce', value: 35, trend: 'up' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const SocialService = {
  getCSRActivities: async (): Promise<CSRActivity[]> => {
    await delay(400);
    return [...mockCSRActivities];
  },
  
  getEmployeeParticipations: async (): Promise<EmployeeParticipation[]> => {
    await delay(400);
    return [...mockParticipations];
  },

  getDiversityMetrics: async (): Promise<DiversityMetric[]> => {
    await delay(400);
    return [...mockDiversityMetrics];
  }
};
