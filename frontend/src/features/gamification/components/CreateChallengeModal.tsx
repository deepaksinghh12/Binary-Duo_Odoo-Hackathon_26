import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';

import type { Challenge } from '../types';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Challenge>) => void;
  initialData?: Challenge | null;
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {
      title: '',
      xp: 100,
      difficulty: 'Medium',
      deadline: '',
      status: 'Draft',
      description: ''
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      reset(initialData || { title: '', xp: 100, difficulty: 'Medium', deadline: '', status: 'Draft', description: '' });
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Challenge" : "New Challenge"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Challenge Title" {...register('title', { required: 'Title is required' })} error={errors.title?.message as string} />
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="XP Reward" type="number" {...register('xp', { required: true })} />
          <Input label="Deadline" type="date" {...register('deadline', { required: true })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
            <select {...register('difficulty')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF3A]">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select {...register('status')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF3A]">
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
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
            {initialData ? 'Save Changes' : 'Create Challenge'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
