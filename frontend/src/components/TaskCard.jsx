'use client';
import { useState } from 'react';
import { Pencil, Trash2, Check } from 'lucide-react';
import { formatDate, TASK_STATUS_COLORS, PRIORITY_COLORS, STATUS_LABELS, PRIORITY_LABELS } from '../lib/utils';
import Badge from './ui/Badge';

export default function TaskCard({ task, onEdit, onDelete, onToggle }) {
  const [confirming, setConfirming] = useState(false);
  const isComplete = task.status === 'COMPLETED';

  const handleDelete = () => {
    if (!confirming) { setConfirming(true); return; }
    onDelete(task.id);
    setConfirming(false);
  };

  return (
    <div className={`brut-card p-4 bg-white ${isComplete ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task)}
          className={`mt-0.5 w-5 h-5 shrink-0 border-2 border-brut-black flex items-center justify-center transition-colors ${
            isComplete ? 'bg-brut-green' : 'bg-white hover:bg-brut-yellow'
          }`}
          aria-label={isComplete ? 'Mark incomplete' : 'Mark complete'}
        >
          {isComplete && <Check size={12} strokeWidth={3} className="text-brut-black" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 mb-1.5">
            <span className={`font-bold text-sm text-brut-black leading-snug ${isComplete ? 'line-through opacity-60' : ''}`}>
              {task.name}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className={TASK_STATUS_COLORS[task.status] ?? 'bg-gray-200 text-brut-black'}>
              {STATUS_LABELS[task.status] ?? task.status}
            </Badge>
            <Badge className={PRIORITY_COLORS[task.priority] ?? 'bg-gray-200 text-brut-black'}>
              {PRIORITY_LABELS[task.priority] ?? task.priority}
            </Badge>
            {task.due_date && (
              <span className="text-xs font-mono text-gray-500 border-2 border-gray-300 px-1.5 py-0.5">
                DUE {formatDate(task.due_date)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 border-2 border-brut-black bg-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-sm hover:bg-brut-blue hover:text-white transition-all"
            aria-label="Edit task"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={handleDelete}
            onBlur={() => setConfirming(false)}
            className={`p-1.5 border-2 border-brut-black transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-sm ${
              confirming ? 'bg-brut-pink text-white border-brut-pink' : 'bg-white hover:bg-brut-pink hover:text-white'
            }`}
            aria-label={confirming ? 'Confirm delete' : 'Delete task'}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
