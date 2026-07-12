import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import type { Badge } from '../types';

interface CreateBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Badge>) => void;
  initialData?: Badge | null;
}

export const CreateBadgeModal: React.FC<CreateBadgeModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {
      name: '',
      description: '',
      icon: 'MdStar',
      color: 'emerald'
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      reset(initialData || { name: '', description: '', icon: 'MdStar', color: 'emerald' });
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Badge" : "New Badge"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Badge Name" {...register('name', { required: 'Name is required' })} error={errors.name?.message as string} />
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="Icon Name (e.g. MdStar)" {...register('icon', { required: true })} />
          <Input label="Color (e.g. emerald, blue)" {...register('color', { required: true })} />
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
            {initialData ? 'Save Changes' : 'Create Badge'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
