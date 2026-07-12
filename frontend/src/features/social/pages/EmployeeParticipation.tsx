import React, { useState, useEffect } from 'react';
import { MdLeaderboard, MdTrendingUp, MdCheckCircle, MdGroup } from 'react-icons/md';
import { SocialService } from '../services/SocialService';
import type { EmployeeParticipation } from '../types';
import { Table } from '../../../components/common/Table';

export const EmployeeParticipationDashboard: React.FC = () => {
  const [participations, setParticipations] = useState<EmployeeParticipation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const parts = await SocialService.getEmployeeParticipations();
        setParticipations(parts);
      } catch (error) {
        console.error("Failed to load participation data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    { key: 'employeeName', header: 'Employee' },
    { key: 'activityChallenge', header: 'Recent Activity' },
    { 
      key: 'points', 
      header: 'Total Points',
      render: (row: EmployeeParticipation) => (
        <span className="font-bold text-[#4CAF3A]">{row.points * 3}</span> // Just multiplying for mock total
      )
    },
    {
      key: 'rank',
      header: 'Department Rank',
      render: (row: EmployeeParticipation) => (
        <span className="font-semibold text-slate-600">#{Math.floor(Math.random() * 10) + 1}</span>
      )
    }
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-8">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><MdGroup size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Participants</p>
            <h4 className="text-2xl font-bold text-slate-800">142</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl"><MdTrendingUp size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Avg. Engagement Rate</p>
            <h4 className="text-2xl font-bold text-slate-800">68%</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><MdCheckCircle size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Challenges Completed</p>
            <h4 className="text-2xl font-bold text-slate-800">450+</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <MdLeaderboard className="text-[#4CAF3A]" size={24} />
            <h3 className="text-lg font-bold text-[#0D3B3E]">Engagement Leaderboard</h3>
          </div>
          <Table 
            columns={columns} 
            data={participations} 
            isLoading={isLoading} 
          />
        </div>
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-[#0D3B3E] mb-6">Department Activity</h3>
          {isLoading ? (
            <div className="space-y-4">
               {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse"></div>)}
            </div>
          ) : (
            <div className="space-y-6">
              {[
                { name: 'Engineering', val: 85, color: 'bg-blue-500' },
                { name: 'Sales', val: 72, color: 'bg-indigo-500' },
                { name: 'Marketing', val: 65, color: 'bg-purple-500' },
                { name: 'HR', val: 92, color: 'bg-emerald-500' }
              ].map(dept => (
                <div key={dept.name} className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm font-semibold text-slate-700">
                    <span>{dept.name}</span>
                    <span>{dept.val}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full ${dept.color} rounded-full`} style={{ width: `${dept.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
