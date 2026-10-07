'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Spinner from '../../components/ui/Spinner';

export default function ProtectedLayout({ children }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) router.replace('/login');
  }, [token, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brut-cream flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-brut-cream">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
