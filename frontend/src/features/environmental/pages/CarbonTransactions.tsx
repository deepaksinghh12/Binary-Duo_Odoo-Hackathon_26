import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { Table } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';
import { EnvironmentService } from '../services/EnvironmentService';
import type { CarbonTransaction } from '../types';
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete, MdShoppingCart, MdPrecisionManufacturing, MdLocalShipping, MdReceipt, MdPanTool, MdInfoOutline } from 'react-icons/md';
import { Button } from '../../../components/common/Button';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { CreateCarbonTransactionModal } from '../components/CreateCarbonTransactionModal';

export const CarbonTransactions: React.FC = () => {
  const [data, setData] = useState<CarbonTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CarbonTransaction | null>(null);
  const [itemToEdit, setItemToEdit] = useState<CarbonTransaction | null>(null);
  const [itemToView, setItemToView] = useState<CarbonTransaction | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const txs = await EnvironmentService.getCarbonTransactions();
      setData(txs);
    } catch (error) {
      console.error('Failed to load transactions', error);
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
    item.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'offset': return 'info';
      case 'credit': return 'success';
      case 'tax': return 'danger';
      case 'emission': return 'warning';
      default: return 'default';
    }
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'purchase': return <MdShoppingCart size={16} className="text-blue-500" />;
      case 'manufacturing': return <MdPrecisionManufacturing size={16} className="text-orange-500" />;
      case 'fleet': return <MdLocalShipping size={16} className="text-emerald-500" />;
      case 'expenses': return <MdReceipt size={16} className="text-purple-500" />;
      default: return <MdPanTool size={16} className="text-slate-400" />;
    }
  };

  const columns = [
    { key: 'id', header: 'Transaction ID' },
    { key: 'date', header: 'Date' },
    { 
      key: 'type', 
      header: 'Type',
      render: (row: CarbonTransaction) => (
        <Badge variant={getTypeColor(row.type)} className="inline-block w-[100px] text-center text-[11px] font-bold tracking-wide">
          {row.type.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'sourceModule',
      header: 'Source',
      render: (row: CarbonTransaction) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100 w-fit whitespace-nowrap">
          {getSourceIcon(row.sourceModule)}
          <span className="capitalize">{row.sourceModule || 'Manual'}</span>
        </div>
      )
    },
    { key: 'project', header: 'Project / Entity' },
    { 
      key: 'amount', 
      header: 'Amount',
      render: (row: CarbonTransaction) => `${row.amount} tCO2e`
    },
    { 
      key: 'cost', 
      header: 'Cost',
      render: (row: CarbonTransaction) => row.cost > 0 ? `$${row.cost.toLocaleString()}` : '-'
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (row: CarbonTransaction) => (
        <Badge variant={getStatusColor(row.status)} className="inline-block w-[100px] text-center text-[11px] font-bold tracking-wide">
          {row.status.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: CarbonTransaction) => (
        <div className="flex gap-2 items-center">
          <button 
            className="bg-slate-100 text-slate-500 hover:text-blue-500 hover:bg-blue-50 transition-colors p-1.5 rounded-full cursor-pointer" 
            title="View"
            onClick={() => setItemToView(row)}
          >
            <MdVisibility size={18} />
          </button>
          
          {row.sourceModule !== 'manual' && row.sourceModule !== undefined ? (
            <div className="flex gap-2 opacity-40 cursor-not-allowed" title="Auto-generated from Odoo modules. Edit in source module.">
              <button className="bg-slate-100 text-slate-500 p-1.5 rounded-full" disabled><MdEdit size={18} /></button>
              <button className="bg-slate-100 text-slate-500 p-1.5 rounded-full" disabled><MdDelete size={18} /></button>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="Carbon Transactions" 
        description="Track carbon offsets, credits, and carbon tax payments."
      />

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex gap-3 items-start">
        <MdInfoOutline className="text-blue-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-semibold text-blue-900 mb-1">Odoo Auto-Sync Active</h4>
          <p className="text-xs text-blue-700">Carbon emissions are automatically generated in real-time from your <strong>Purchase, Manufacturing, Fleet, and Expenses</strong> modules. Auto-generated transactions cannot be modified here and must be managed in their respective source modules.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex gap-4 items-center">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#4CAF3A] focus:ring-1 focus:ring-[#4CAF3A] transition-all bg-slate-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="primary" leftIcon={<MdAdd size={20} />} onClick={() => setIsModalOpen(true)}>Add Transaction</Button>
      </div>

      <Table 
        columns={columns} 
        data={filteredData} 
        isLoading={isLoading} 
      />

      <CreateCarbonTransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newTx) => {
          setData([{ ...newTx } as CarbonTransaction, ...data]);
        }}
      />

      <CreateCarbonTransactionModal 
        isOpen={!!itemToEdit}
        onClose={() => setItemToEdit(null)}
        initialData={itemToEdit}
        onSuccess={(updatedTx) => {
          setData(data.map(item => item.id === updatedTx.id ? { ...item, ...updatedTx } as CarbonTransaction : item));
          setItemToEdit(null);
        }}
      />

      <CreateCarbonTransactionModal 
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
        title="Delete Transaction"
        message={`Are you sure you want to delete transaction "${itemToDelete?.id}" for ${itemToDelete?.project}? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};
