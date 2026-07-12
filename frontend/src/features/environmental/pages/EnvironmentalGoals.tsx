import React, { useState, useEffect } from 'react';
import { Table } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { EnvironmentService } from '../services/EnvironmentService';
import type { EnvironmentalGoal } from '../types';
import { MdAdd, MdSearch, MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { CreateEnvironmentalGoalModal } from '../components/CreateEnvironmentalGoalModal';

export const EnvironmentalGoals: React.FC = () => {
  const [data, setData] = useState<EnvironmentalGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EnvironmentalGoal | null>(null);
  const [itemToEdit, setItemToEdit] = useState<EnvironmentalGoal | null>(null);
  const [itemToView, setItemToView] = useState<EnvironmentalGoal | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const goals = await EnvironmentService.getEnvironmentalGoals();
      setData(goals);
    } catch (error) {
      console.error('Failed to load goals', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (itemToDelete) {
      setData(data.filter(item => item.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };


  const columns = [
    { key: 'title', header: 'Name' },
    { key: 'department', header: 'Department' },
    { 
      key: 'targetValue', 
      header: 'Target CO₂',
      render: (row: EnvironmentalGoal) => `${row.targetValue} ${row.unit}`
    },
    { 
      key: 'currentValue', 
      header: 'Current CO₂',
      render: (row: EnvironmentalGoal) => `${row.currentValue} ${row.unit}`
    },
    { 
      key: 'progress', 
      header: 'Progress',
      render: (row: EnvironmentalGoal) => {
        const percentage = Math.min(100, Math.round((row.currentValue / (row.targetValue || 1)) * 100));
        let gradientClass = 'from-blue-400 to-blue-500';
        if (row.status === 'achieved') gradientClass = 'from-emerald-400 to-emerald-500';
        else if (row.status === 'on_track') gradientClass = 'from-[#4CAF3A] to-green-500';
        else if (row.status === 'behind' || row.status === 'at_risk') gradientClass = 'from-orange-400 to-red-500';

        return (
          <div className="w-full max-w-[180px] flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-bold text-slate-700">{percentage}%</span>
              <span className="text-slate-400 font-medium">{row.currentValue} / {row.targetValue}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full bg-gradient-to-r ${gradientClass} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      }
    },
    { key: 'targetDate', header: 'Deadline' },
    { 
      key: 'status', 
      header: 'Status',
      render: (row: EnvironmentalGoal) => (
        <Badge variant={row.status === 'achieved' ? 'info' : row.status === 'on_track' ? 'success' : 'default'} className="inline-block w-[96px] text-center">
          {row.status === 'achieved' ? 'Completed' : row.status === 'on_track' ? 'On Track' : 'Active'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: EnvironmentalGoal) => (
      <div className="flex gap-2 items-center">
          <button 
            className="bg-slate-100 text-slate-500 hover:text-blue-500 hover:bg-blue-50 transition-colors p-1.5 rounded-full cursor-pointer" 
            title="View"
            onClick={() => setItemToView(row)}
          >
            <MdVisibility size={18} />
          </button>
          <button 
            className="bg-slate-100 text-slate-500 hover:text-orange-500 hover:bg-orange-50 transition-colors p-1.5 rounded-full cursor-pointer" 
            title="Edit"
            onClick={() => setItemToEdit(row)}
          >
            <MdEdit size={18} />
          </button>
          <button 
            className="bg-slate-100 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors p-1.5 rounded-full cursor-pointer" 
            title="Delete"
            onClick={() => setItemToDelete(row)}
          >
            <MdDelete size={18} />
          </button>
        </div>
      )
    }
  ];

  const filteredData = data.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500">
      
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex gap-4 items-center w-full">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search goals..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4CAF3A] focus:ring-1 focus:ring-[#4CAF3A] transition-all bg-slate-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="primary" leftIcon={<MdAdd size={20} />} onClick={() => setIsModalOpen(true)}>New Goal</Button>
        </div>
      </div>

      <Table 
        columns={columns} 
        data={filteredData} 
        isLoading={isLoading} 
      />

      <CreateEnvironmentalGoalModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newGoal) => {
          setData([{ ...newGoal } as EnvironmentalGoal, ...data]);
        }}
      />

      <CreateEnvironmentalGoalModal 
        isOpen={!!itemToEdit}
        onClose={() => setItemToEdit(null)}
        initialData={itemToEdit}
        onSuccess={(updatedGoal) => {
          setData(data.map(item => item.id === updatedGoal.id ? { ...item, ...updatedGoal } as EnvironmentalGoal : item));
          setItemToEdit(null);
        }}
      />

      <CreateEnvironmentalGoalModal 
        isOpen={!!itemToView}
        onClose={() => setItemToView(null)}
        initialData={itemToView}
        isViewOnly={true}
        onSuccess={() => {}}
      />

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Goal"
        message={`Are you sure you want to delete the goal "${itemToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};
