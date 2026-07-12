import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Select } from '../../../components/common/Select';
import type { Policy } from '../types';

interface CreatePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (policy: Partial<Policy>) => void;
  initialData?: Policy | null;
  isViewOnly?: boolean;
}

export const CreatePolicyModal: React.FC<CreatePolicyModalProps> = ({ isOpen, onClose, onSuccess, initialData, isViewOnly }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    status: 'draft' as 'active' | 'draft' | 'archived',
    version: 'v1.0'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        department: initialData.department,
        status: initialData.status,
        version: initialData.version
      });
    } else {
      setFormData({
        title: '',
        description: '',
        department: '',
        status: 'draft',
        version: 'v1.0'
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      id: initialData?.id || `POL-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      ...formData,
      lastUpdated: new Date().toISOString().split('T')[0],
      icon: 'gavel',
      color: 'text-blue-600 bg-blue-50'
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewOnly ? "View Policy Details" : initialData ? "Edit Policy" : "Create New Policy"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Policy Title</label>
          <input 
            type="text" 
            required
            disabled={isViewOnly}
            className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 ${isViewOnly ? 'bg-slate-50 opacity-80' : ''}`}
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="e.g., Code of Conduct"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea 
            required
            disabled={isViewOnly}
            className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 ${isViewOnly ? 'bg-slate-50 opacity-80' : ''}`}
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Brief description of the policy..."
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
              disabled={isViewOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Version</label>
            <input 
              type="text" 
              required
              disabled={isViewOnly}
              className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 ${isViewOnly ? 'bg-slate-50 opacity-80' : ''}`}
              value={formData.version}
              onChange={(e) => setFormData({...formData, version: e.target.value})}
              placeholder="e.g., v1.0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <Select 
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'active', label: 'Active' },
              { value: 'archived', label: 'Archived' },
            ]}
            value={formData.status}
            onChange={(val) => setFormData({...formData, status: val as any})}
            disabled={isViewOnly}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>{isViewOnly ? 'Close' : 'Cancel'}</Button>
          {!isViewOnly && <Button type="submit" variant="primary">{initialData ? 'Save Changes' : 'Create Policy'}</Button>}
        </div>
      </form>
    </Modal>
  );
};
