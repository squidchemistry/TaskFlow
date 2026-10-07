'use client';
import { useSearchParams } from 'next/navigation';
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
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get('expired') === '1';
  const googleError = searchParams.get('error') === 'google';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/api/auth/login', data);
      login(res.data.token, res.data.user);
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
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
          <h1 className="text-2xl font-bold uppercase tracking-wide">Welcome back</h1>
          <p className="text-gray-500 text-sm font-mono mt-1">Sign in to your account</p>
        </div>
      </div>

      {expired && (
        <div className="bg-brut-yellow border-2 border-brut-black px-4 py-3 text-sm font-bold text-center">
          Your session expired — please sign in again.
        </div>
      )}
      {googleError && (
        <div className="bg-brut-pink border-2 border-brut-black px-4 py-3 text-sm font-bold text-white text-center">
          Google sign-in failed. Please try again.
        </div>
      )}

      <GoogleButton />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-[2px] bg-brut-black" />
        <span className="text-xs font-mono font-bold uppercase text-gray-400 tracking-widest">or email</span>
        <div className="flex-1 h-[2px] bg-brut-black" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <Button type="submit" variant="primary" className="w-full" size="lg" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm font-mono text-gray-500">
        No account?{' '}
        <Link href="/register" className="font-bold text-brut-black underline underline-offset-2 hover:text-brut-blue transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}
