import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { Table } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { EnvironmentService } from '../services/EnvironmentService';
import type { EmissionFactor } from '../types';
import { CreateEmissionFactorModal } from '../components/CreateEmissionFactorModal';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { MdAdd, MdSearch, MdVisibility, MdEdit, MdDelete } from 'react-icons/md';

export const EmissionFactorList: React.FC = () => {
  const [data, setData] = useState<EmissionFactor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EmissionFactor | null>(null);
  const [itemToEdit, setItemToEdit] = useState<EmissionFactor | null>(null);
  const [itemToView, setItemToView] = useState<EmissionFactor | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const factors = await EnvironmentService.getEmissionFactors();
      setData(factors);
    } catch (error) {
      console.error('Failed to load emission factors', error);
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

  const filteredData = data.filter(item => 
    item.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { key: 'category', header: 'Category' },
    { key: 'activity', header: 'Activity' },
    { key: 'unit', header: 'Unit' },
    { key: 'co2e', header: 'CO2e Factor' },
    { key: 'source', header: 'Source' },
    { key: 'year', header: 'Year' },
    { 
      key: 'status', 
      header: 'Status',
      render: (row: EmissionFactor) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'} className="inline-block w-[96px] text-center">
          {row.status.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: EmissionFactor) => (
        <div className="flex gap-2 items-center">
          <button 
            className="bg-slate-100 text-slate-500 hover:text-[#4CAF3A] hover:bg-green-50 transition-colors p-1.5 rounded-full cursor-pointer" 
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

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="Emission Factors" 
        description="Manage and track emission factors for carbon footprint calculations."
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex gap-4 items-center w-full">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by activity or category..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4CAF3A] focus:ring-1 focus:ring-[#4CAF3A] transition-all bg-slate-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="primary" leftIcon={<MdAdd size={20} />} onClick={() => setIsModalOpen(true)}>Add Factor</Button>
      </div>

      <Table 
        columns={columns} 
        data={filteredData} 
        isLoading={isLoading} 
      />

      <CreateEmissionFactorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newFactor) => {
          setData([{ ...newFactor } as EmissionFactor, ...data]);
        }}
      />

      <CreateEmissionFactorModal 
        isOpen={!!itemToEdit}
        onClose={() => setItemToEdit(null)}
        initialData={itemToEdit}
        onSuccess={(updatedFactor) => {
          setData(data.map(item => item.id === updatedFactor.id ? { ...item, ...updatedFactor } as EmissionFactor : item));
          setItemToEdit(null);
        }}
      />

      <CreateEmissionFactorModal 
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
        title="Delete Emission Factor"
        message={`Are you sure you want to delete the emission factor for "${itemToDelete?.activity}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};
