import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';

import type { Reward } from '../types';

interface CreateRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Reward>) => void;
  initialData?: Reward | null;
}

export const CreateRewardModal: React.FC<CreateRewardModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {
      name: '',
      description: '',
      costXP: 100,
      status: 'Available'
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      reset(initialData || { name: '', description: '', costXP: 100, status: 'Available' });
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Reward" : "New Reward"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Reward Name" {...register('name', { required: 'Name is required' })} error={errors.name?.message as string} />
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="Cost (XP)" type="number" {...register('costXP', { required: true })} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select {...register('status')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF3A]">
              <option value="Available">Available</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF3A]"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" className="bg-[#4CAF3A] hover:bg-[#3d8c2f] text-white">
            {initialData ? 'Save Changes' : 'Create Reward'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
