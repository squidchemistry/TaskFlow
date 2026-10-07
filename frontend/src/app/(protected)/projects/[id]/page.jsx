'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Filter, Edit2, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../../../components/ui/Button';
import Badge from '../../../../components/ui/Badge';
import TaskCard from '../../../../components/TaskCard';
import TaskForm from '../../../../components/TaskForm';
import ProjectForm from '../../../../components/ProjectForm';
import Spinner from '../../../../components/ui/Spinner';
import api from '../../../../lib/api';
import { PROJECT_STATUS_COLORS, STATUS_LABELS, formatDate } from '../../../../lib/utils';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/api/projects/${id}`);
      setProject(res.data.project);
      setError(false);
    } catch {
      setError(true);
    }
  }, [id]);

  const fetchTasks = useCallback(async () => {
    try {
      const params = { projectId: id };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await api.get('/api/tasks', { params });
      setTasks(res.data.tasks);
    } catch {
      toast.error('Failed to load tasks');
    }
  }, [id, search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchProject().finally(() => setLoading(false));
  }, [fetchProject]);

  useEffect(() => {
    const t = setTimeout(fetchTasks, 300);
    return () => clearTimeout(t);
  }, [fetchTasks]);

  const handleTaskSubmit = async (data) => {
    setSaving(true);
    try {
      if (editTask) {
        await api.put(`/api/tasks/${editTask.id}`, data);
        toast.success('Task updated');
      } else {
        await api.post('/api/tasks', { ...data, project_id: id });
        toast.success('Task created');
      }
      setTaskFormOpen(false);
      setEditTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!confirm(`Delete "${task.name}"?`)) return;
    try {
      await api.delete(`/api/tasks/${task.id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleToggleTask = async (task) => {
    const next = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.put(`/api/tasks/${task.id}`, { status: next });
      fetchTasks();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleProjectSave = async (data) => {
    setSaving(true);
    try {
      await api.put(`/api/projects/${id}`, data);
      toast.success('Project updated');
      setProjectFormOpen(false);
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Delete project "${project?.name}" and all its tasks?`)) return;
    try {
      await api.delete(`/api/projects/${id}`);
      toast.success('Project deleted');
      router.push('/projects');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 bg-brut-pink border-2 border-brut-black shadow-brut flex items-center justify-center">
          <AlertCircle size={32} className="text-white" />
        </div>
        <div>
          <p className="font-bold uppercase tracking-wide">Failed to load project</p>
          <p className="text-sm font-mono text-gray-500 mt-1">It may not exist or you may have lost connection.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => { setLoading(true); fetchProject().finally(() => setLoading(false)); }}>
            <RefreshCw size={14} /> Retry
          </Button>
          <Button variant="ghost" onClick={() => router.push('/projects')}>
            <ArrowLeft size={14} /> Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project header */}
      <div className="flex items-start gap-4 flex-wrap">
        <button
          onClick={() => router.back()}
          className="mt-1 p-2 border-2 border-brut-black bg-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut transition-all"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold uppercase tracking-wide truncate">{project?.name}</h1>
            {project && (
              <Badge className={PROJECT_STATUS_COLORS[project.status] ?? 'bg-gray-200 text-brut-black'}>
                {STATUS_LABELS[project.status]}
              </Badge>
            )}
          </div>
          {project?.description && (
            <p className="text-gray-500 font-mono text-sm mt-1">{project.description}</p>
          )}
          {(project?.start_date || project?.end_date) && (
            <p className="text-gray-400 font-mono text-xs mt-1">
              {formatDate(project.start_date)} → {formatDate(project.end_date)}
            </p>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setProjectFormOpen(true)}>
            <Edit2 size={13} /> Edit
          </Button>
          <Button variant="danger" size="sm" onClick={handleDeleteProject}>
            <Trash2 size={13} /> Delete
          </Button>
        </div>
      </div>

      {/* Tasks section */}
      <div className="border-t-2 border-brut-black pt-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-bold uppercase tracking-wide">
            Tasks <span className="font-mono text-gray-400">({tasks.length})</span>
          </h2>
          <Button variant="primary" size="sm" onClick={() => { setEditTask(null); setTaskFormOpen(true); }}>
            <Plus size={14} /> Add Task
          </Button>
        </div>

        {/* Task filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              className="brut-input pl-8 text-xs"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="brut-input appearance-none cursor-pointer text-xs"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select
            className="brut-input appearance-none cursor-pointer text-xs"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block border-2 border-brut-black shadow-brut px-6 py-4 bg-white">
              <p className="font-bold uppercase tracking-wide">No tasks found</p>
              <p className="text-sm font-mono text-gray-500 mt-1">Add a task to get started</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => { setEditTask(task); setTaskFormOpen(true); }}
                onDelete={() => handleDeleteTask(task)}
                onToggle={handleToggleTask}
              />
            ))}
          </div>
        )}
      </div>

      <TaskForm
        open={taskFormOpen}
        onClose={() => { setTaskFormOpen(false); setEditTask(null); }}
        onSubmit={handleTaskSubmit}
        initial={editTask}
        loading={saving}
      />

      <ProjectForm
        open={projectFormOpen}
        onClose={() => setProjectFormOpen(false)}
        onSubmit={handleProjectSave}
        initial={project}
        loading={saving}
      />
    </div>
  );
}
