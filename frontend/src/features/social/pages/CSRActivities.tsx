import React, { useState, useEffect } from 'react';
import { MdAdd, MdNature, MdBloodtype, MdWaterDrop, MdSchool, MdCheckCircle, MdCancel } from 'react-icons/md';
import { Button } from '../../../components/common/Button';
import { Table } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';
import { SocialService } from '../services/SocialService';
import type { CSRActivity, EmployeeParticipation } from '../types';

export const CSRActivities: React.FC = () => {
  const [activities, setActivities] = useState<CSRActivity[]>([]);
  const [participations, setParticipations] = useState<EmployeeParticipation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [acts, parts] = await Promise.all([
          SocialService.getCSRActivities(),
          SocialService.getEmployeeParticipations()
        ]);
        setActivities(acts);
        setParticipations(parts);
      } catch (error) {
        console.error("Failed to load CSR data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'tree': return <MdNature size={24} />;
      case 'blood': return <MdBloodtype size={24} />;
      case 'beach': return <MdWaterDrop size={24} />;
      case 'workshop': return <MdSchool size={24} />;
      default: return <MdNature size={24} />;
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  const columns = [
    { key: 'employeeName', header: 'Employee' },
    { key: 'activityChallenge', header: 'Activity/Challenge' },
    { key: 'proof', header: 'Proof' },
    { key: 'points', header: 'Points' },
    {
      key: 'approvalStatus',
      header: 'Approval',
      render: (row: EmployeeParticipation) => (
        <Badge variant={getApprovalColor(row.approvalStatus)} className="w-[100px] text-center capitalize tracking-wider font-bold text-[11px]">
          {row.approvalStatus}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: EmployeeParticipation) => {
        if (row.approvalStatus !== 'pending') {
          return <span className="text-slate-400 text-xs italic">No actions needed</span>;
        }
        return (
          <div className="flex gap-2">
            <button 
              className="flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Approve"
            >
              <MdCheckCircle size={16} /> Approve
            </button>
            <button 
              className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Reject"
            >
              <MdCancel size={16} /> Reject
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="primary" leftIcon={<MdAdd size={20} />} className="bg-blue-500 hover:bg-blue-600 border-none shadow-blue-500/20">
          New Activity
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-200 rounded-3xl animate-pulse"></div>)
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 bg-slate-50 rounded-xl ${activity.color} group-hover:scale-110 transition-transform`}>
                    {getIcon(activity.icon)}
                  </div>
                  <h3 className="font-bold text-slate-800">{activity.title}</h3>
                </div>
                <div className="text-sm text-slate-500 space-y-1 mb-6">
                  <p><span className="font-semibold text-slate-700">{activity.participantsCount}</span> joined</p>
                  <p className="text-xs text-slate-400 capitalize">{activity.status.replace('_', ' ')}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">Join</Button>
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-[#0D3B3E] mb-4">Employee Participation: Approval Queue</h3>
        <Table 
          columns={columns} 
          data={participations} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};
