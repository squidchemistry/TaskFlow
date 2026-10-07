'use client';
import { useEffect, useState, useCallback } from 'react';
import { LayoutDashboard, FolderKanban, CheckCircle, Clock, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import Spinner from '../../../components/ui/Spinner';
import Button from '../../../components/ui/Button';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(() => {
    setLoading(true);
    setError(false);
    api.get('/api/dashboard')
      .then((r) => setStats(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <div className="w-16 h-16 bg-brut-pink border-2 border-brut-black shadow-brut flex items-center justify-center">
          <AlertCircle size={32} className="text-white" />
        </div>
        <div>
          <p className="font-bold uppercase tracking-wide">Failed to load dashboard</p>
          <p className="text-sm font-mono text-gray-500 mt-1">Check your connection and try again.</p>
        </div>
        <Button variant="ghost" onClick={fetchStats}>
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold uppercase tracking-wide">
          Hey, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 font-mono mt-1 text-sm">Here&apos;s an overview of your work.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Projects"   value={stats?.total_projects}       accent="blue"   Icon={FolderKanban} />
        <StatCard label="In Progress"      value={stats?.projects_in_progress} accent="yellow" Icon={TrendingUp} />
        <StatCard label="Total Tasks"      value={stats?.total_tasks}          accent="cream"  Icon={LayoutDashboard} />
        <StatCard label="Completed Tasks"  value={stats?.completed_tasks}      accent="green"  Icon={CheckCircle} />
        <StatCard label="Pending Tasks"    value={stats?.pending_tasks}        accent="pink"   Icon={Clock} />
      </div>
    </div>
  );
}
