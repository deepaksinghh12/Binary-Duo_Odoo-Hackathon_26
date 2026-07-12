import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Select } from '../../../components/common/Select';
import type { Audit } from '../types';

interface CreateAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (audit: Partial<Audit>) => void;
}

export const CreateAuditModal: React.FC<CreateAuditModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    date: '',
    status: 'scheduled' as 'completed' | 'under_review' | 'in_progress' | 'scheduled',
    auditor: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      id: `ADT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      ...formData,
    });
    setFormData({ title: '', department: '', date: '', status: 'scheduled', auditor: '' });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Audit"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Audit Title</label>
          <input 
            type="text" 
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#4CAF3A]"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="e.g., Annual Data Privacy Review"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <Select 
              options={[
                { value: 'HR', label: 'HR' },
                { value: 'Legal', label: 'Legal' },
                { value: 'Operations', label: 'Operations' },
                { value: 'IT Security', label: 'IT Security' },
                { value: 'Procurement', label: 'Procurement' },
              ]}
              value={formData.department}
              onChange={(val) => setFormData({...formData, department: val})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input 
              type="date" 
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#4CAF3A]"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Auditor Name</label>
          <input 
            type="text" 
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#4CAF3A]"
            value={formData.auditor}
            onChange={(e) => setFormData({...formData, auditor: e.target.value})}
            placeholder="e.g., Jane Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <Select 
            options={[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'under_review', label: 'Under Review' },
              { value: 'completed', label: 'Completed' },
            ]}
            value={formData.status}
            onChange={(val) => setFormData({...formData, status: val as any})}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" className="bg-[#4CAF3A] hover:bg-[#439c33] text-white border-none shadow-green-500/20">Schedule Audit</Button>
        </div>
      </form>
    </Modal>
  );
};
