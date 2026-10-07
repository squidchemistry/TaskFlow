'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';

const schema = z.object({
  name:        z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  status:      z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  start_date:  z.string().optional(),
  end_date:    z.string().optional(),
});

export default function ProjectForm({ open, onClose, onSubmit, initial, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', status: 'NOT_STARTED', start_date: '', end_date: '' },
  });

  useEffect(() => {
    if (initial) {
      reset({
        name:        initial.name || '',
        description: initial.description || '',
        status:      initial.status || 'NOT_STARTED',
        start_date:  initial.start_date ? initial.start_date.split('T')[0] : '',
        end_date:    initial.end_date   ? initial.end_date.split('T')[0]   : '',
      });
    } else {
      reset({ name: '', description: '', status: 'NOT_STARTED', start_date: '', end_date: '' });
    }
  }, [initial, reset, open]);

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Project' : 'New Project'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Project Name *" error={errors.name?.message} {...register('name')} />

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider font-mono text-brut-black mb-1">
            Description
          </label>
          <textarea
            className="brut-input resize-none"
            rows={3}
            {...register('description')}
          />
        </div>

        <Select label="Status" error={errors.status?.message} {...register('status')}>
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Start Date" type="date" {...register('start_date')} />
          <Input label="End Date"   type="date" {...register('end_date')} />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t-2 border-brut-black">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>
            {initial ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
