'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import ProjectCard from '../../../components/ProjectCard';
import ProjectForm from '../../../components/ProjectForm';
import Spinner from '../../../components/ui/Spinner';
import api from '../../../lib/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await api.get('/api/projects', { params });
      setProjects(res.data.projects);
      setTotal(res.data.total);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(fetchProjects, 300);
    return () => clearTimeout(t);
  }, [fetchProjects]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (editTarget) {
        await api.put(`/api/projects/${editTarget.id}`, data);
        toast.success('Project updated');
      } else {
        await api.post('/api/projects', data);
        toast.success('Project created');
      }
      setFormOpen(false);
      setEditTarget(null);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    if (!confirm(`Delete "${project.name}"? All tasks will be removed.`)) return;
    try {
      await api.delete(`/api/projects/${project.id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide">Projects</h1>
          <p className="text-gray-500 font-mono text-sm mt-0.5">{total} project{total !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" onClick={() => { setEditTarget(null); setFormOpen(true); }}>
          <Plus size={16} /> New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            className="brut-input pl-9"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            className="brut-input pl-9 pr-8 appearance-none cursor-pointer"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-14 h-14 bg-brut-pink border-2 border-brut-black shadow-brut flex items-center justify-center">
            <AlertCircle size={28} className="text-white" />
          </div>
          <div>
            <p className="font-bold uppercase tracking-wide">Failed to load projects</p>
            <p className="text-sm font-mono text-gray-500 mt-1">Check your connection and try again.</p>
          </div>
          <Button variant="ghost" onClick={fetchProjects}>
            <RefreshCw size={14} /> Retry
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-block border-2 border-brut-black shadow-brut px-8 py-6 bg-white">
            <p className="text-lg font-bold uppercase tracking-wide">No projects yet</p>
            <p className="text-sm font-mono text-gray-500 mt-1">Create your first project to get started</p>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={() => { setEditTarget(p); setFormOpen(true); }}
              onDelete={() => handleDelete(p)}
            />
          ))}
        </div>
      )}

      <ProjectForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSubmit={handleSubmit}
        initial={editTarget}
        loading={saving}
      />
    </div>
  );
}
