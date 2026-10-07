'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name required').max(100),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password required'),
  new_password:     z.string().min(6, 'At least 6 characters'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

function Avatar({ name, avatarUrl }) {
  const initials = name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="w-20 h-20 object-cover border-2 border-brut-black" />;
  }
  return (
    <div className="w-20 h-20 bg-brut-yellow border-2 border-brut-black shadow-brut-sm flex items-center justify-center font-bold font-mono text-2xl text-brut-black select-none">
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user?.full_name || '' },
  });

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const onProfileSave = async (data) => {
    setSaving(true);
    try {
      const res = await api.patch('/api/auth/me', { full_name: data.full_name });
      const stored = localStorage.getItem('token');
      login(stored, res.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSave = async (data) => {
    setSavingPw(true);
    try {
      await api.patch('/api/auth/me', {
        current_password: data.current_password,
        new_password:     data.new_password,
      });
      toast.success('Password changed');
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold uppercase tracking-wide">Profile</h1>
        <p className="text-gray-500 font-mono text-sm mt-1">Manage your account details</p>
      </div>

      {/* Identity card */}
      <div className="brut-card bg-white p-6 flex items-center gap-5">
        <Avatar name={user?.full_name} avatarUrl={user?.avatar_url} />
        <div className="min-w-0">
          <p className="text-lg font-bold uppercase tracking-wide truncate">{user?.full_name}</p>
          <p className="text-sm font-mono text-gray-500 truncate">{user?.email}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {user?.has_google && (
              <Badge className="bg-brut-pink text-white">Google</Badge>
            )}
            {user?.has_password && (
              <Badge className="bg-brut-blue text-white">Email</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="brut-card bg-white p-6 space-y-4">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wide border-b-2 border-brut-black pb-3">
          <User size={16} />
          <span>Personal Info</span>
        </div>
        <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
          <Input
            label="Full name"
            error={profileForm.formState.errors.full_name?.message}
            {...profileForm.register('full_name')}
          />
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider font-mono text-brut-black mb-1">
              Email address
            </label>
            <input
              value={user?.email || ''}
              disabled
              className="brut-input bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs font-mono text-gray-400 mt-1">Email cannot be changed.</p>
          </div>
          <Button type="submit" variant="primary" loading={saving} size="sm">
            <Save size={14} /> Save changes
          </Button>
        </form>
      </div>

      {/* Change password */}
      {user?.has_password && (
        <div className="brut-card bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wide border-b-2 border-brut-black pb-3">
            <Lock size={16} />
            <span>Change Password</span>
          </div>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSave)} className="space-y-4">
            <Input
              label="Current password"
              type="password"
              placeholder="••••••••"
              error={passwordForm.formState.errors.current_password?.message}
              {...passwordForm.register('current_password')}
            />
            <Input
              label="New password"
              type="password"
              placeholder="••••••••"
              error={passwordForm.formState.errors.new_password?.message}
              {...passwordForm.register('new_password')}
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="••••••••"
              error={passwordForm.formState.errors.confirm_password?.message}
              {...passwordForm.register('confirm_password')}
            />
            <Button type="submit" variant="blue" loading={savingPw} size="sm">
              <Lock size={14} /> Update password
            </Button>
          </form>
        </div>
      )}

      {user?.has_google && !user?.has_password && (
        <div className="border-2 border-brut-yellow bg-brut-yellow bg-opacity-20 shadow-brut-sm px-5 py-4 text-sm font-mono text-brut-black">
          You signed in with Google — password management is not available for Google-only accounts.
        </div>
      )}
    </div>
  );
}
