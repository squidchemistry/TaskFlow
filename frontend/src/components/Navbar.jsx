'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderKanban, LogOut, Layers, User, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/projects',  label: 'Projects',  Icon: FolderKanban },
];

function UserAvatar({ name, avatarUrl }) {
  const initials = name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-8 h-8 object-cover border-2 border-brut-black"
      />
    );
  }
  return (
    <div className="w-8 h-8 bg-brut-yellow border-2 border-brut-black text-brut-black text-xs font-bold flex items-center justify-center select-none font-mono">
      {initials}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    logout();
    router.push('/login');
    toast.success('Logged out');
  };

  return (
    <nav className="bg-brut-black border-b-2 border-brut-black sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* Logo + desktop nav */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-brut-yellow font-bold text-lg shrink-0 font-mono uppercase tracking-wider">
              <Layers size={20} />
              <span className="hidden sm:block">TaskFlow</span>
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              {navItems.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold uppercase tracking-wide border-2 transition-all duration-100 ${
                    pathname.startsWith(href)
                      ? 'bg-brut-yellow border-brut-yellow text-brut-black'
                      : 'border-transparent text-gray-300 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: user + mobile toggle */}
          <div className="flex items-center gap-2">

            {/* Desktop dropdown */}
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 px-2 py-1 border-2 border-transparent hover:border-gray-500 transition-all"
              >
                <UserAvatar name={user?.full_name} avatarUrl={user?.avatar_url} />
                <span className="text-sm font-bold text-white max-w-32 truncate uppercase tracking-wide">{user?.full_name}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-brut-cream border-2 border-brut-black shadow-brut z-50">
                  <div className="px-4 py-2 border-b-2 border-brut-black">
                    <p className="text-xs font-mono text-gray-600 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-bold uppercase tracking-wide text-brut-black hover:bg-brut-yellow transition-colors"
                  >
                    <User size={15} />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold uppercase tracking-wide text-brut-pink border-t-2 border-brut-black hover:bg-brut-pink hover:text-white transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-2 text-white hover:text-brut-yellow transition-colors border-2 border-transparent hover:border-gray-500"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t-2 border-gray-700 bg-brut-black px-4 pt-3 pb-4 space-y-1">
          {navItems.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-wide border-2 transition-all ${
                pathname.startsWith(href)
                  ? 'bg-brut-yellow border-brut-yellow text-brut-black'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <div className="border-t-2 border-gray-700 pt-3 mt-2 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2">
              <UserAvatar name={user?.full_name} avatarUrl={user?.avatar_url} />
              <div className="min-w-0">
                <p className="text-sm font-bold text-white uppercase tracking-wide truncate">{user?.full_name}</p>
                <p className="text-xs font-mono text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-wide text-gray-300 hover:text-brut-yellow transition-colors border-2 border-transparent"
            >
              <User size={16} /> Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-wide text-brut-pink hover:text-white transition-colors border-2 border-transparent"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
