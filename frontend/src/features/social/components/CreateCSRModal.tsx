import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { Button } from '../../../components/common/Button';
import { Select } from '../../../components/common/Select';
import type { CSRActivity } from '../types';

interface CreateCSRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (activity: Partial<CSRActivity>) => void;
  initialData?: CSRActivity | null;
}

export const CreateCSRModal: React.FC<CreateCSRModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('tree');
  const [status, setStatus] = useState('open');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setIcon(initialData.icon || 'tree');
      setStatus(initialData.status);
    } else {
      setTitle('');
      setIcon('tree');
      setStatus('open');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      id: initialData?.id || `csr-${Date.now()}`,
      title,
      icon,
      status: status as 'open' | 'evidence_required' | 'closed',
      participantsCount: initialData?.participantsCount || 0,
      color: initialData?.color || 'text-emerald-600 bg-emerald-100',
    });
    onClose();
  };

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'evidence_required', label: 'Evidence Required' },
    { value: 'closed', label: 'Closed' }
  ];

  const iconOptions = [
    { value: 'tree', label: 'Tree / Environment' },
    { value: 'blood', label: 'Blood Donation' },
    { value: 'beach', label: 'Beach / Water' },
    { value: 'workshop', label: 'Workshop / Education' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D3B3E]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
          <h2 className="text-xl font-bold text-[#0D3B3E]">
            {initialData ? 'Edit CSR Activity' : 'New CSR Activity'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Activity Title</label>
            <input 
              type="text"
              placeholder="e.g. Tree Planting Drive"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-transparent focus:border-[#4CAF3A] focus:ring-1 focus:ring-[#4CAF3A] outline-none transition-all"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Icon" 
              value={icon}
              onChange={setIcon}
              options={iconOptions}
            />
            
            <Select 
              label="Status" 
              value={status}
              onChange={setStatus}
              options={statusOptions}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1 bg-[#4CAF3A] hover:bg-[#439c33] border-none shadow-green-500/20">
              {initialData ? 'Save Changes' : 'Create Activity'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
