import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { formatDate, PROJECT_STATUS_COLORS, STATUS_LABELS } from '../lib/utils';
import Badge from './ui/Badge';

export default function ProjectCard({ project, onEdit, onDelete }) {
  return (
    <div className="brut-card p-5 bg-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-lg active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-100">
      {/* Yellow top accent */}
      <div className="h-1.5 bg-brut-yellow -mt-5 -mx-5 mb-4" style={{ width: 'calc(100% + 40px)' }} />

      <div className="flex items-start justify-between gap-3 mb-2">
        <Link href={`/projects/${project.id}`} className="group flex-1 min-w-0">
          <h3 className="font-bold text-base text-brut-black line-clamp-2 leading-snug group-hover:underline">
            {project.name}
          </h3>
        </Link>
        <Badge className={PROJECT_STATUS_COLORS[project.status] ?? 'bg-gray-200 text-brut-black'}>
          {STATUS_LABELS[project.status] ?? project.status}
        </Badge>
      </div>

      {project.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">{project.description}</p>
      )}

      <div className="flex items-center justify-between border-t-2 border-brut-black pt-3 mt-3">
        <div className="text-xs font-mono text-gray-500">
          {project.task_count != null && (
            <span className="font-bold">
              <span className="text-brut-black">{project.task_count}</span> TASKS
            </span>
          )}
          {project.end_date && (
            <span className="ml-3">DUE {formatDate(project.end_date)}</span>
          )}
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={(e) => { e.preventDefault(); onEdit(project); }}
                className="p-1.5 border-2 border-brut-black bg-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-sm hover:bg-brut-blue hover:text-white transition-all"
                aria-label="Edit project"
              >
                <Pencil size={12} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.preventDefault(); onDelete(project); }}
                className="p-1.5 border-2 border-brut-black bg-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-sm hover:bg-brut-pink hover:text-white transition-all"
                aria-label="Delete project"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
