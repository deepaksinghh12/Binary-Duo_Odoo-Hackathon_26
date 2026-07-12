import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Select } from '../../../components/common/Select';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import type { EmissionFactor } from '../types';
import { MdCategory, MdWork, MdStraighten, MdCo2, MdSource, MdDateRange, MdCheckCircle } from 'react-icons/md';

interface CreateEmissionFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newFactor: Partial<EmissionFactor>) => void;
  initialData?: EmissionFactor | null;
  isViewOnly?: boolean;
}

export const CreateEmissionFactorModal: React.FC<CreateEmissionFactorModalProps> = ({ isOpen, onClose, onSuccess, initialData, isViewOnly = false }) => {
  const [formData, setFormData] = useState({
    category: '',
    activity: '',
    unit: '',
    co2e: '',
    source: '',
    year: new Date().getFullYear().toString(),
    status: 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  React.useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        category: initialData.category || '',
        activity: initialData.activity || '',
        unit: initialData.unit || '',
        co2e: initialData.co2e ? initialData.co2e.toString() : '',
        source: initialData.source || '',
        year: initialData.year ? initialData.year.toString() : new Date().getFullYear().toString(),
        status: initialData.status || 'active',
      });
    } else if (!isOpen) {
      setFormData({
        category: '',
        activity: '',
        unit: '',
        co2e: '',
        source: '',
        year: new Date().getFullYear().toString(),
        status: 'active',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isViewOnly) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!formData.category || !formData.activity || !formData.co2e || !formData.unit) {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      onSuccess({
        ...formData,
        co2e: parseFloat(formData.co2e),
        year: parseInt(formData.year),
        status: formData.status as 'active' | 'deprecated',
        id: initialData ? initialData.id : Math.random().toString(36).substr(2, 9),
      });
      onClose();
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isViewOnly && initialData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="View Emission Factor" maxWidth="max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdCategory size={20} className="text-blue-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Category</p>
              <p className="font-bold text-slate-800">{initialData.category}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdWork size={20} className="text-purple-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Activity</p>
              <p className="font-bold text-slate-800">{initialData.activity}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdStraighten size={20} className="text-orange-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Unit</p>
              <p className="font-bold text-slate-800">{initialData.unit}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdCo2 size={20} className="text-red-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">CO2e Factor</p>
              <p className="font-bold text-slate-800">{initialData.co2e}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdSource size={20} className="text-teal-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Source Database</p>
              <p className="font-bold text-slate-800">{initialData.source || 'N/A'}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdDateRange size={20} className="text-indigo-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Year</p>
              <p className="font-bold text-slate-800">{initialData.year}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdCheckCircle size={20} className={initialData.status === 'active' ? "text-green-500" : "text-slate-400"} /></div>
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

  const labelClass = "absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 transition-all pointer-events-none peer-focus:left-3 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1";

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Edit Emission Factor" : "Add Emission Factor"} 
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5 pb-20">
          
          <div className="relative">
            <MdCategory className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
            <input 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-transparent placeholder-transparent"
              placeholder="Category"
            />
            <label className={labelClass}>Category</label>
          </div>

          <div className="relative">
            <MdWork className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" size={20} />
            <input 
              name="activity"
              value={formData.activity}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 bg-transparent placeholder-transparent"
              placeholder="Activity"
            />
            <label className={labelClass}>Activity</label>
          </div>

          <Select
            options={[
              { value: 'kWh', label: 'kWh' },
              { value: 'Liters', label: 'Liters' },
              { value: 'kg', label: 'kg' },
              { value: 'tCO2e', label: 'tCO2e' }
            ]}
            value={formData.unit}
            onChange={(val) => setFormData({ ...formData, unit: val })}
            label="Unit"
            icon={<MdStraighten className="text-orange-500" size={20} />}
            activeColorClass="border-orange-500"
          />

          <div className="relative">
            <MdCo2 className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={20} />
            <input 
              name="co2e"
              type="number"
              step="0.0001"
              value={formData.co2e}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 bg-transparent placeholder-transparent"
              placeholder="CO2e Factor"
            />
            <label className={labelClass}>CO2e Factor</label>
          </div>

          <div className="relative">
            <MdSource className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500" size={20} />
            <input 
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 bg-transparent placeholder-transparent"
              placeholder="Source Database"
            />
            <label className={labelClass}>Source Database</label>
          </div>

          <div className="relative">
            <MdDateRange className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
            <input 
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-transparent placeholder-transparent"
              placeholder="Year"
            />
            <label className={labelClass}>Year</label>
          </div>

          <Select
            options={[
              { value: 'active', label: 'Active' },
              { value: 'deprecated', label: 'Deprecated' }
            ]}
            value={formData.status}
            onChange={(val) => setFormData({ ...formData, status: val })}
            label="Status"
            icon={<MdCheckCircle className={formData.status === 'active' ? 'text-green-500' : 'text-slate-400'} size={20} />}
            activeColorClass="border-green-500"
          />

        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>{initialData ? "Update Factor" : "Save Factor"}</Button>
        </div>
      </form>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeSave}
        title="Update Emission Factor"
        message={`Are you sure you want to update the emission factor for "${formData.activity}"?`}
        confirmText="Update"
        isDestructive={false}
      />
    </Modal>
  );
};
