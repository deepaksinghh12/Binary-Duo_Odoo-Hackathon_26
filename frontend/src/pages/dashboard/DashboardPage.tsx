import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ESGScoreCard } from '../../components/dashboard/ESGScoreCard';
import { EmissionTrendChart } from '../../components/dashboard/EmissionTrendChart';
import { DepartmentRankingChart } from '../../components/dashboard/DepartmentRankingChart';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { DashboardService } from '../../services/DashboardService';
import type { DashboardSummary, QuickActionResponse } from '../../types/dashboard.types';
import { MdEco, MdPeople, MdGavel, MdStars, MdAdd, MdPlayArrow, MdInsertChart, MdCheck } from 'react-icons/md';

// ── Rich mock fallbacks (shown when DB is empty or API fails) ─────────────────

const MOCK_SUMMARY: DashboardSummary = {
  scores: {
    environmental: 74,
    social: 61,
    governance: 85,
    overall: 72,
  },
  emissions: [
    { month: 'Aug', emissions: 520 },
    { month: 'Sep', emissions: 490 },
    { month: 'Oct', emissions: 530 },
    { month: 'Nov', emissions: 480 },
    { month: 'Dec', emissions: 460 },
    { month: 'Jan', emissions: 440 },
    { month: 'Feb', emissions: 420 },
    { month: 'Mar', emissions: 390 },
    { month: 'Apr', emissions: 370 },
    { month: 'May', emissions: 350 },
    { month: 'Jun', emissions: 330 },
    { month: 'Jul', emissions: 310 },
  ],
  rankings: [
    { department: 'Corporate',     score: 91 },
    { department: 'IT',            score: 85 },
    { department: 'HR',            score: 78 },
    { department: 'Operations',    score: 72 },
    { department: 'Manufacturing', score: 65 },
    { department: 'Logistics',     score: 58 },
  ],
  activities: [
    { id: '1', type: 'environmental', title: 'Carbon transaction logged',            description: 'Fleet diesel — Q3 2026', timestamp: 'Jul 12, 9:30 AM' },
    { id: '2', type: 'governance',    title: 'Policy published',                     description: 'Data Privacy v4.1 is now active', timestamp: 'Jul 11, 2:15 PM' },
    { id: '3', type: 'social',        title: 'CSR activity approved',                description: 'Tree Plantation Drive — 24 participants', timestamp: 'Jul 10, 11:00 AM' },
    { id: '4', type: 'gamification',  title: 'Challenge completed',                  description: 'Carbon Footprint Challenge — Karan Shah', timestamp: 'Jul 9, 4:45 PM' },
    { id: '5', type: 'governance',    title: 'Audit scheduled',                      description: 'Energy Efficiency Assessment — Jul 15', timestamp: 'Jul 8, 10:20 AM' },
  ],
};

const MOCK_QUICK_ACTIONS: QuickActionResponse[] = [
  { action: 'Log Carbon Emission',       route: '/dashboard/environmental/transactions' },
  { action: 'Start New Challenge',       route: '/dashboard/gamification/challenges' },
  { action: 'View ESG Reports',          route: '/dashboard/reports/summary' },
  { action: 'Acknowledge Policy',        route: '/dashboard/governance/acknowledgements' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary>(MOCK_SUMMARY);
  const [quickActions, setQuickActions] = useState<QuickActionResponse[]>(MOCK_QUICK_ACTIONS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const [summaryRes, emissionRes, rankingRes, activityRes, actionsRes] = await Promise.all([
          DashboardService.getSummary(),
          DashboardService.getEmissionTrend(),
          DashboardService.getDepartmentRanking(),
          DashboardService.getRecentActivities(),
          DashboardService.getQuickActions(),
        ]);

        const s = summaryRes.data?.data;
        const e = emissionRes.data?.data;
        const r = rankingRes.data?.data;
        const a = activityRes.data?.data;

        // Only update if the API returned meaningful data
        const hasScores = s && (s.environmentalScore > 0 || s.socialScore > 0 || s.governanceScore > 0);
        const hasEmissions = Array.isArray(e) && e.length > 0;
        const hasRankings = Array.isArray(r) && r.length > 0;
        const hasActivities = Array.isArray(a) && a.length > 0;

        setData({
          scores: hasScores ? {
            environmental: s.environmentalScore,
            social: s.socialScore,
            governance: s.governanceScore,
            overall: s.overallScore,
          } : MOCK_SUMMARY.scores,
          emissions: hasEmissions
            ? e.map((item: any) => ({ month: item.month, emissions: item.emission }))
            : MOCK_SUMMARY.emissions,
          rankings: hasRankings
            ? r.map((item: any) => ({ department: item.departmentName, score: item.overallScore }))
            : MOCK_SUMMARY.rankings,
          activities: hasActivities
            ? a.map((item: any) => {
                const date = new Date(item.timestamp);
                const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                return { id: item.id, type: item.type, title: item.title, description: item.description, timestamp: formatted };
              })
            : MOCK_SUMMARY.activities,
        });

        const actions = actionsRes.data?.data;
        if (Array.isArray(actions) && actions.length > 0) {
          setQuickActions(actions);
        }
      } catch {
        // Keep mock data on any error — page stays fully rendered
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActionIcon = (actionStr: string) => {
    const lower = actionStr.toLowerCase();
    if (lower.includes('log') || lower.includes('carbon')) return <MdAdd size={24} />;
    if (lower.includes('challenge')) return <MdPlayArrow size={24} />;
    if (lower.includes('report')) return <MdInsertChart size={24} />;
    if (lower.includes('acknowledge') || lower.includes('policy')) return <MdCheck size={24} />;
    return <MdStars size={24} />;
  };

  const getActionColor = (actionStr: string) => {
    const lower = actionStr.toLowerCase();
    if (lower.includes('log') || lower.includes('carbon')) return 'bg-[#4CAF3A] hover:bg-[#3f7628]';
    if (lower.includes('challenge')) return 'bg-amber-500 hover:bg-amber-600';
    if (lower.includes('report')) return 'bg-indigo-500 hover:bg-indigo-600';
    if (lower.includes('acknowledge') || lower.includes('policy')) return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-[#0D3B3E] hover:bg-slate-800';
  };

  return (
    <div className="w-full pb-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ESGScoreCard title="Environmental Score" score={data.scores.environmental} icon={<MdEco />} color="green"  isLoading={isLoading} />
        <ESGScoreCard title="Social Score"        score={data.scores.social}        icon={<MdPeople />} color="blue" isLoading={isLoading} />
        <ESGScoreCard title="Governance Score"    score={data.scores.governance}    icon={<MdGavel />} color="indigo" isLoading={isLoading} />
        <ESGScoreCard title="Overall ESG Score"   score={data.scores.overall}       icon={<MdStars />} color="amber"  isLoading={isLoading} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EmissionTrendChart data={data.emissions} isLoading={isLoading} />
        <DepartmentRankingChart data={data.rankings} isLoading={isLoading} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity activities={data.activities} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-bold text-[#0D3B3E] mb-4">Quick Actions</h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-slate-200 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(action.route)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-white ${getActionColor(action.action)} transition-all duration-200 active:scale-95 shadow-md text-left`}
                  >
                    <div className="bg-white/20 p-2 rounded-lg shrink-0">
                      {getActionIcon(action.action)}
                    </div>
                    <span className="font-bold">{action.action}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
