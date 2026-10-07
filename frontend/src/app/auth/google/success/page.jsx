'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../lib/api';
import Spinner from '../../../../components/ui/Spinner';

// Landing page after Google OAuth callback — extracts token from URL hash,
// fetches user info, stores session, then redirects to dashboard.
export default function GoogleSuccessPage() {
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash; // '#token=...'
    const token = new URLSearchParams(hash.slice(1)).get('token');

    if (!token) {
      router.replace('/login?error=google');
      return;
    }

    // Store token first so the /me request sends it
    localStorage.setItem('token', token);

    api.get('/api/auth/me')
      .then((res) => {
        login(token, res.data);
        router.replace('/dashboard');
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.replace('/login?error=google');
      });
  }, [login, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-brut-cream">
      <Spinner size="lg" />
      <p className="text-gray-500 text-sm font-mono">Signing you in with Google…</p>
    </div>
  );
}
