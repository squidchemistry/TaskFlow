'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Layers } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import GoogleButton from '../../../components/GoogleButton';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

const schema = z.object({
  full_name: z.string().min(1, 'Full name required').max(100),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ full_name, email, password }) => {
    try {
      const res = await api.post('/api/auth/register', { full_name, email, password });
      login(res.data.token, res.data.user);
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="brut-card bg-white p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-brut-yellow border-2 border-brut-black shadow-brut flex items-center justify-center">
            <Layers size={28} className="text-brut-black" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide">Create account</h1>
          <p className="text-gray-500 text-sm font-mono mt-1">Start managing your projects today</p>
        </div>
      </div>

      <GoogleButton />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-[2px] bg-brut-black" />
        <span className="text-xs font-mono font-bold uppercase text-gray-400 tracking-widest">or email</span>
        <div className="flex-1 h-[2px] bg-brut-black" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" placeholder="Jane Smith" error={errors.full_name?.message} {...register('full_name')} />
        <Input label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <Input label="Confirm Password" type="password" placeholder="••••••••" error={errors.confirm?.message} {...register('confirm')} />
        <Button type="submit" variant="primary" className="w-full" size="lg" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm font-mono text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-brut-black underline underline-offset-2 hover:text-brut-blue transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
