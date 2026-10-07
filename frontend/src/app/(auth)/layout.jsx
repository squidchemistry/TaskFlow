'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';

export default function AuthLayout({ children }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && token) router.replace('/dashboard');
  }, [token, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brut-cream flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-brut-cream flex items-center justify-center px-4 py-12">
      {/* Diagonal stripe texture via repeating linear-gradient */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #111 0, #111 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }}
      />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
