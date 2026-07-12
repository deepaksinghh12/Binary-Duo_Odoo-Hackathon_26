import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Select } from '../../../components/common/Select';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import type { EnvironmentalGoal } from '../types';
import { MdFlag, MdDateRange, MdAnalytics, MdTrendingUp, MdTrendingFlat, MdStraighten, MdBusinessCenter, MdCheckCircle } from 'react-icons/md';

interface CreateEnvironmentalGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: Partial<EnvironmentalGoal>) => void;
  initialData?: EnvironmentalGoal | null;
  isViewOnly?: boolean;
}

export const CreateEnvironmentalGoalModal: React.FC<CreateEnvironmentalGoalModalProps> = ({
  isOpen, onClose, onSuccess, initialData, isViewOnly
}) => {
  const [formData, setFormData] = useState({
    title: '',
    targetDate: new Date().toISOString().split('T')[0],
    metric: '',
    targetValue: '',
    currentValue: '',
    unit: '',
    department: '',
    status: 'on_track',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  React.useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title || '',
        targetDate: initialData.targetDate || new Date().toISOString().split('T')[0],
        metric: initialData.metric || '',
        targetValue: initialData.targetValue ? initialData.targetValue.toString() : '',
        currentValue: initialData.currentValue ? initialData.currentValue.toString() : '',
        unit: initialData.unit || '',
        department: initialData.department || '',
        status: initialData.status || 'on_track',
      });
    } else if (!isOpen) {
      setFormData({
        title: '',
        targetDate: new Date().toISOString().split('T')[0],
        metric: '',
        targetValue: '',
        currentValue: '',
        unit: '',
        department: '',
        status: 'on_track',
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
    
    if (!formData.title || !formData.targetDate || !formData.metric || !formData.targetValue || !formData.currentValue) {
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
        targetValue: parseFloat(formData.targetValue),
        currentValue: parseFloat(formData.currentValue),
        status: formData.status as 'on_track' | 'at_risk' | 'behind' | 'achieved',
        id: initialData ? initialData.id : `GOAL${Math.floor(Math.random() * 10000)}`,
      });
      onClose();
    } catch (err) {
      setError('Failed to save goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass = "absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 transition-all pointer-events-none peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1";

  if (isViewOnly && initialData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="View Environmental Goal" maxWidth="max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdFlag size={20} className="text-purple-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Goal Title</p>
              <p className="font-bold text-slate-800">{initialData.title}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdBusinessCenter size={20} className="text-blue-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Department</p>
              <p className="font-bold text-slate-800">{initialData.department}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdTrendingUp size={20} className="text-indigo-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Target</p>
              <p className="font-bold text-slate-800">{initialData.targetValue} {initialData.unit}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdTrendingFlat size={20} className="text-cyan-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Current Progress</p>
              <p className="font-bold text-slate-800">{initialData.currentValue} {initialData.unit}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdDateRange size={20} className="text-red-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Deadline</p>
              <p className="font-bold text-slate-800">{initialData.targetDate}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdCheckCircle size={20} className={initialData.status === 'achieved' ? 'text-green-500' : initialData.status === 'on_track' ? 'text-emerald-500' : 'text-orange-500'} /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Status</p>
              <p className="font-bold text-slate-800 uppercase">{initialData.status.replace('_', ' ')}</p>
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
      title={initialData ? "Edit Goal" : "Create New Goal"} 
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
            <MdFlag className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" size={20} />
            <input 
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 bg-transparent placeholder-transparent"
              placeholder="Goal Title"
            />
            <label className={labelClass}>Goal Title</label>
          </div>

          <div className="relative">
            <MdBusinessCenter className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
            <input 
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-transparent placeholder-transparent"
              placeholder="Department"
            />
            <label className={labelClass}>Department</label>
          </div>

          <div className="relative">
            <MdAnalytics className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
            <input 
              name="metric"
              value={formData.metric}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-transparent placeholder-transparent"
              placeholder="Metric (e.g. Total Emissions)"
            />
            <label className={labelClass}>Metric</label>
          </div>

          <div className="relative">
            <MdTrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" size={20} />
            <input 
              name="targetValue"
              type="number"
              step="0.01"
              value={formData.targetValue}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-transparent placeholder-transparent"
              placeholder="Target Value"
            />
            <label className={labelClass}>Target Value</label>
          </div>

          <div className="relative">
            <MdTrendingFlat className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
            <input 
              name="currentValue"
              type="number"
              step="0.01"
              value={formData.currentValue}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-transparent placeholder-transparent"
              placeholder="Current Value"
            />
            <label className={labelClass}>Current Value</label>
          </div>

          <div className="relative">
            <MdStraighten className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
            <input 
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 bg-transparent placeholder-transparent"
              placeholder="Unit (e.g. tCO2e)"
            />
            <label className={labelClass}>Unit</label>
          </div>

          <div className="relative">
            <MdDateRange className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={20} />
            <input 
              name="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 bg-transparent placeholder-transparent"
              placeholder="Target Date"
            />
            <label className={labelClass}>Target Date</label>
          </div>

          <div className="md:col-span-2">
            <Select
              options={[
                { value: 'on_track', label: 'On Track' },
                { value: 'at_risk', label: 'At Risk' },
                { value: 'behind', label: 'Behind Schedule' },
                { value: 'achieved', label: 'Achieved' }
              ]}
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
              label="Goal Status"
              icon={<MdCheckCircle className={
                formData.status === 'achieved' ? 'text-green-500' :
                formData.status === 'on_track' ? 'text-emerald-500' :
                formData.status === 'at_risk' ? 'text-orange-500' :
                'text-red-500'
              } size={20} />}
              activeColorClass={
                formData.status === 'achieved' ? 'border-green-500' :
                formData.status === 'on_track' ? 'border-emerald-500' :
                formData.status === 'at_risk' ? 'border-orange-500' :
                'border-red-500'
              }
            />
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>{initialData ? "Update Goal" : "Save Goal"}</Button>
        </div>
      </form>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeSave}
        title="Update Goal"
        message={`Are you sure you want to update the goal "${formData.title}"?`}
        confirmText="Update"
        isDestructive={false}
      />
    </Modal>
  );
};
