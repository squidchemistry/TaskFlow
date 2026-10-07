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
  priority:    z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status:      z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  due_date:    z.string().optional(),
});

export default function TaskForm({ open, onClose, onSubmit, initial, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', priority: 'MEDIUM', status: 'PENDING', due_date: '' },
  });

  useEffect(() => {
    if (initial) {
      reset({
        name:        initial.name || '',
        description: initial.description || '',
        priority:    initial.priority || 'MEDIUM',
        status:      initial.status   || 'PENDING',
        due_date:    initial.due_date ? initial.due_date.split('T')[0] : '',
      });
    } else {
      reset({ name: '', description: '', priority: 'MEDIUM', status: 'PENDING', due_date: '' });
    }
  }, [initial, reset, open]);

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Task Name *" error={errors.name?.message} {...register('name')} />

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

        <div className="grid grid-cols-2 gap-3">
          <Select label="Priority" {...register('priority')}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>
          <Select label="Status" {...register('status')}>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </Select>
        </div>

        <Input label="Due Date" type="date" {...register('due_date')} />

        <div className="flex justify-end gap-3 pt-2 border-t-2 border-brut-black">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>
            {initial ? 'Save Changes' : 'Add Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
