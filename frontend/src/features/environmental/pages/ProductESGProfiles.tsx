import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { Table } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';
import { EnvironmentService } from '../services/EnvironmentService';
import type { ProductESGProfile } from '../types';
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import { Button } from '../../../components/common/Button';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { CreateProductProfileModal } from '../components/CreateProductProfileModal';

export const ProductESGProfiles: React.FC = () => {
  const [data, setData] = useState<ProductESGProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ProductESGProfile | null>(null);
  const [itemToEdit, setItemToEdit] = useState<ProductESGProfile | null>(null);
  const [itemToView, setItemToView] = useState<ProductESGProfile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const profiles = await EnvironmentService.getProductProfiles();
      setData(profiles);
    } catch (error) {
      console.error('Failed to load profiles', error);
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
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'A': return 'success';
      case 'B': return 'info';
      case 'C': return 'warning';
      case 'D': 
      case 'F': return 'danger';
      default: return 'default';
    }
  };

  const columns = [
    { key: 'productName', header: 'Product Name' },
    { key: 'category', header: 'Category' },
    { key: 'carbonFootprint', header: 'Carbon Footprint (kg CO2e)' },
    { key: 'waterUsage', header: 'Water Usage (Liters)' },
    { 
      key: 'recycledMaterial', 
      header: 'Recycled Material',
      render: (row: ProductESGProfile) => `${row.recycledMaterial}%`
    },
    { 
      key: 'rating', 
      header: 'ESG Rating',
      render: (row: ProductESGProfile) => (
        <Badge variant={getRatingColor(row.rating)}>
          Grade {row.rating}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: ProductESGProfile) => (
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

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="Product ESG Profiles" 
        description="Monitor the environmental impact of individual products."
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex gap-4 items-center">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4CAF3A] focus:ring-1 focus:ring-[#4CAF3A] transition-all bg-slate-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="primary" leftIcon={<MdAdd size={20} />} onClick={() => setIsModalOpen(true)}>Add Profile</Button>
      </div>

      <Table 
        columns={columns} 
        data={filteredData} 
        isLoading={isLoading} 
      />

      <CreateProductProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newProfile) => {
          setData([{ ...newProfile } as ProductESGProfile, ...data]);
        }}
      />

      <CreateProductProfileModal 
        isOpen={!!itemToEdit}
        onClose={() => setItemToEdit(null)}
        initialData={itemToEdit}
        onSuccess={(updatedProfile) => {
          setData(data.map(item => item.id === updatedProfile.id ? { ...item, ...updatedProfile } as ProductESGProfile : item));
          setItemToEdit(null);
        }}
      />

      <CreateProductProfileModal 
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
        title="Delete Product Profile"
        message={`Are you sure you want to delete the ESG profile for "${itemToDelete?.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};
