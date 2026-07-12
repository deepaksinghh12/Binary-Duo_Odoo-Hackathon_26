import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Select } from '../../../components/common/Select';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import type { CarbonTransaction } from '../types';
import { MdEco, MdDateRange, MdSwapHoriz, MdCo2, MdAttachMoney, MdCheckCircle } from 'react-icons/md';

interface CreateCarbonTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: Partial<CarbonTransaction>) => void;
  initialData?: CarbonTransaction | null;
  isViewOnly?: boolean;
}

export const CreateCarbonTransactionModal: React.FC<CreateCarbonTransactionModalProps> = ({
  isOpen, onClose, onSuccess, initialData, isViewOnly
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'offset',
    amount: '',
    cost: '',
    project: '',
    status: 'completed',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  React.useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        date: initialData.date || new Date().toISOString().split('T')[0],
        type: initialData.type || 'offset',
        amount: initialData.amount ? initialData.amount.toString() : '',
        cost: initialData.cost ? initialData.cost.toString() : '',
        project: initialData.project || '',
        status: initialData.status || 'completed',
      });
    } else if (!isOpen) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'offset',
        amount: '',
        cost: '',
        project: '',
        status: 'completed',
      });
      setError('');
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.amount || !formData.cost || !formData.project) {
      setError('Please fill in all required fields.');
      return;
    }

    if (initialData && !showConfirmModal) {
      setShowConfirmModal(true);
      return;
    }

    executeSave();
  };

  const executeSave = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      onSuccess({
        ...formData,
        amount: parseFloat(formData.amount),
        cost: parseFloat(formData.cost),
        type: formData.type as 'offset' | 'credit' | 'tax',
        status: formData.status as 'completed' | 'pending' | 'failed',
        id: initialData ? initialData.id : `TXN${Math.floor(Math.random() * 10000)}`,
      });
      onClose();
    } catch (err) {
      setError('Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass = "absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 transition-all pointer-events-none peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1";

  if (isViewOnly && initialData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="View Carbon Transaction" maxWidth="max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdEco size={20} className="text-emerald-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Project / Entity</p>
              <p className="font-bold text-slate-800">{initialData.project}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdDateRange size={20} className="text-blue-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Date</p>
              <p className="font-bold text-slate-800">{initialData.date}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdSwapHoriz size={20} className="text-indigo-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Transaction Type</p>
              <p className="font-bold text-slate-800 uppercase">{initialData.type}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdCo2 size={20} className="text-red-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Amount</p>
              <p className="font-bold text-slate-800">{initialData.amount} tCO2e</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdAttachMoney size={20} className="text-yellow-600" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Cost</p>
              <p className="font-bold text-slate-800">${initialData.cost.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdCheckCircle size={20} className={initialData.status === 'completed' ? 'text-green-500' : initialData.status === 'pending' ? 'text-orange-500' : 'text-red-500'} /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Status</p>
              <p className="font-bold text-slate-800 uppercase">{initialData.status}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="primary" onClick={onClose} type="button">Close</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Edit Carbon Transaction" : "Add Carbon Transaction"} 
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5 pb-20">
          
          <div className="relative md:col-span-2">
            <MdEco className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
            <input 
              name="project"
              value={formData.project}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-transparent placeholder-transparent"
              placeholder="Project / Entity"
            />
            <label className={labelClass}>Project / Entity</label>
          </div>

          <div className="relative">
            <MdDateRange className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
            <input 
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-transparent placeholder-transparent"
              placeholder="Date"
            />
            <label className={labelClass}>Date</label>
          </div>

          <Select
            options={[
              { value: 'offset', label: 'Offset' },
              { value: 'credit', label: 'Credit' },
              { value: 'tax', label: 'Tax' }
            ]}
            value={formData.type}
            onChange={(val) => setFormData({ ...formData, type: val })}
            label="Transaction Type"
            icon={<MdSwapHoriz className="text-indigo-500" size={20} />}
            activeColorClass="border-indigo-500"
          />

          <div className="relative">
            <MdCo2 className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={20} />
            <input 
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 bg-transparent placeholder-transparent"
              placeholder="Amount (tCO2e)"
            />
            <label className={labelClass}>Amount (tCO2e)</label>
          </div>

          <div className="relative">
            <MdAttachMoney className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-600" size={20} />
            <input 
              name="cost"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-600 bg-transparent placeholder-transparent"
              placeholder="Cost ($)"
            />
            <label className={labelClass}>Cost ($)</label>
          </div>

          <div className="md:col-span-2">
            <Select
              options={[
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' }
              ]}
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
              label="Status"
              icon={<MdCheckCircle className={formData.status === 'completed' ? 'text-green-500' : formData.status === 'pending' ? 'text-orange-500' : 'text-red-500'} size={20} />}
              activeColorClass={formData.status === 'completed' ? 'border-green-500' : formData.status === 'pending' ? 'border-orange-500' : 'border-red-500'}
            />
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>{initialData ? "Update Transaction" : "Save Transaction"}</Button>
        </div>
      </form>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeSave}
        title="Update Transaction"
        message={`Are you sure you want to update this transaction?`}
        confirmText="Update"
        isDestructive={false}
      />
    </Modal>
  );
};
