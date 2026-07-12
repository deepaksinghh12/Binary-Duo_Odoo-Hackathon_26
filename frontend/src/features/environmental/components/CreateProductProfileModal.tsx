import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Select } from '../../../components/common/Select';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import type { ProductESGProfile } from '../types';
import { MdInventory, MdCategory, MdCo2, MdWaterDrop, MdRecycling, MdGrade } from 'react-icons/md';

interface CreateProductProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: Partial<ProductESGProfile>) => void;
  initialData?: ProductESGProfile | null;
  isViewOnly?: boolean;
}

export const CreateProductProfileModal: React.FC<CreateProductProfileModalProps> = ({
  isOpen, onClose, onSuccess, initialData, isViewOnly
}) => {
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    carbonFootprint: '',
    waterUsage: '',
    recycledMaterial: '',
    rating: 'C',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  React.useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        productName: initialData.productName || '',
        category: initialData.category || '',
        carbonFootprint: initialData.carbonFootprint ? initialData.carbonFootprint.toString() : '',
        waterUsage: initialData.waterUsage ? initialData.waterUsage.toString() : '',
        recycledMaterial: initialData.recycledMaterial ? initialData.recycledMaterial.toString() : '',
        rating: initialData.rating || 'C',
      });
    } else if (!isOpen) {
      setFormData({
        productName: '',
        category: '',
        carbonFootprint: '',
        waterUsage: '',
        recycledMaterial: '',
        rating: 'C',
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
    
    if (!formData.productName || !formData.category || !formData.carbonFootprint || !formData.waterUsage || !formData.recycledMaterial) {
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
        carbonFootprint: parseFloat(formData.carbonFootprint),
        waterUsage: parseFloat(formData.waterUsage),
        recycledMaterial: parseFloat(formData.recycledMaterial),
        rating: formData.rating as 'A' | 'B' | 'C' | 'D' | 'F',
        id: initialData ? initialData.id : Math.random().toString(36).substr(2, 9),
      });
      onClose();
    } catch (err) {
      setError('Failed to save product profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass = "absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 transition-all pointer-events-none peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1";

  if (isViewOnly && initialData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="View Product ESG Profile" maxWidth="max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdInventory size={20} className="text-blue-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Product Name</p>
              <p className="font-bold text-slate-800">{initialData.productName}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdCategory size={20} className="text-purple-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Category</p>
              <p className="font-bold text-slate-800">{initialData.category}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdCo2 size={20} className="text-red-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Carbon Footprint</p>
              <p className="font-bold text-slate-800">{initialData.carbonFootprint} kg CO2e</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdWaterDrop size={20} className="text-cyan-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Water Usage</p>
              <p className="font-bold text-slate-800">{initialData.waterUsage} Liters</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdRecycling size={20} className="text-green-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Recycled Material</p>
              <p className="font-bold text-slate-800">{initialData.recycledMaterial}%</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><MdGrade size={20} className="text-yellow-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">ESG Rating</p>
              <p className="font-bold text-slate-800 uppercase">Grade {initialData.rating}</p>
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
      title={initialData ? "Edit Product Profile" : "Add Product Profile"} 
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
            <MdInventory className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
            <input 
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-transparent placeholder-transparent"
              placeholder="Product Name"
            />
            <label className={labelClass}>Product Name</label>
          </div>

          <div className="relative">
            <MdCategory className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" size={20} />
            <input 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 bg-transparent placeholder-transparent"
              placeholder="Category"
            />
            <label className={labelClass}>Category</label>
          </div>

          <div className="relative">
            <MdCo2 className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={20} />
            <input 
              name="carbonFootprint"
              type="number"
              step="0.01"
              value={formData.carbonFootprint}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 bg-transparent placeholder-transparent"
              placeholder="Carbon Footprint (kg CO2e)"
            />
            <label className={labelClass}>Carbon Footprint</label>
          </div>

          <div className="relative">
            <MdWaterDrop className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" size={20} />
            <input 
              name="waterUsage"
              type="number"
              step="0.01"
              value={formData.waterUsage}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-transparent placeholder-transparent"
              placeholder="Water Usage (Liters)"
            />
            <label className={labelClass}>Water Usage</label>
          </div>

          <div className="relative">
            <MdRecycling className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" size={20} />
            <input 
              name="recycledMaterial"
              type="number"
              step="0.1"
              value={formData.recycledMaterial}
              onChange={handleChange}
              className="peer w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 bg-transparent placeholder-transparent"
              placeholder="Recycled Material (%)"
            />
            <label className={labelClass}>Recycled Material (%)</label>
          </div>

          <Select
            options={[
              { value: 'A', label: 'Grade A' },
              { value: 'B', label: 'Grade B' },
              { value: 'C', label: 'Grade C' },
              { value: 'D', label: 'Grade D' },
              { value: 'F', label: 'Grade F' }
            ]}
            value={formData.rating}
            onChange={(val) => setFormData({ ...formData, rating: val })}
            label="ESG Rating"
            icon={<MdGrade className={formData.rating === 'A' ? 'text-green-500' : formData.rating === 'B' ? 'text-blue-500' : formData.rating === 'C' ? 'text-yellow-500' : 'text-red-500'} size={20} />}
            activeColorClass={formData.rating === 'A' ? 'border-green-500' : formData.rating === 'B' ? 'border-blue-500' : formData.rating === 'C' ? 'border-yellow-500' : 'border-red-500'}
          />

        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>{initialData ? "Update Profile" : "Save Profile"}</Button>
        </div>
      </form>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeSave}
        title="Update Product Profile"
        message={`Are you sure you want to update the profile for "${formData.productName}"?`}
        confirmText="Update"
        isDestructive={false}
      />
    </Modal>
  );
};
