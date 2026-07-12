import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ESGScoreCard } from '../../components/dashboard/ESGScoreCard';
import { EmissionTrendChart } from '../../components/dashboard/EmissionTrendChart';
import { DepartmentRankingChart } from '../../components/dashboard/DepartmentRankingChart';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { DashboardService } from '../../services/DashboardService';
import type { DashboardSummary, QuickActionResponse } from '../../types/dashboard.types';
import { MdEco, MdPeople, MdGavel, MdStars, MdAdd, MdPlayArrow, MdInsertChart, MdCheck } from 'react-icons/md';
import { toast } from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [quickActions, setQuickActions] = useState<QuickActionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const [
          summaryRes, 
          emissionRes, 
          rankingRes, 
          activityRes,
          actionsRes
        ] = await Promise.all([
          DashboardService.getSummary(),
          DashboardService.getEmissionTrend(),
          DashboardService.getDepartmentRanking(),
          DashboardService.getRecentActivities(),
          DashboardService.getQuickActions()
        ]);

        if (summaryRes.data.success) {
          const s = summaryRes.data.data;
          const e = emissionRes.data.data;
          const r = rankingRes.data.data;
          const a = activityRes.data.data;

          setData({
            scores: {
              environmental: s.environmentalScore,
              social: s.socialScore,
              governance: s.governanceScore,
              overall: s.overallScore
            },
            emissions: e.map(item => ({ month: item.month, emissions: item.emission })),
            rankings: r.map(item => ({ department: item.departmentName, score: item.overallScore })),
            activities: a.map(item => {
              // Format timestamp
              const date = new Date(item.timestamp);
              const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              return {
                id: item.id,
                type: item.type,
                title: item.title,
                description: item.description,
                timestamp: formattedDate
              };
            })
          });
        }

        if (actionsRes.data.success) {
          setQuickActions(actionsRes.data.data);
        }

      } catch (error) {
        toast.error('Failed to load dashboard data');
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
        <ESGScoreCard 
          title="Environmental Score" 
          score={data?.scores.environmental || 0} 
          icon={<MdEco />} 
          color="green" 
          isLoading={isLoading} 
        />
        <ESGScoreCard 
          title="Social Score" 
          score={data?.scores.social || 0} 
          icon={<MdPeople />} 
          color="blue" 
          isLoading={isLoading} 
        />
        <ESGScoreCard 
          title="Governance Score" 
          score={data?.scores.governance || 0} 
          icon={<MdGavel />} 
          color="indigo" 
          isLoading={isLoading} 
        />
        <ESGScoreCard 
          title="Overall ESG Score" 
          score={data?.scores.overall || 0} 
          icon={<MdStars />} 
          color="amber" 
          isLoading={isLoading} 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EmissionTrendChart data={data?.emissions || []} isLoading={isLoading} />
        <DepartmentRankingChart data={data?.rankings || []} isLoading={isLoading} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity activities={data?.activities || []} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-bold text-[#0D3B3E] mb-4">Quick Actions</h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-200 rounded-xl animate-pulse"></div>)}
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
                {quickActions.length === 0 && !isLoading && (
                  <div className="text-slate-500 text-sm py-4">No quick actions available.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
