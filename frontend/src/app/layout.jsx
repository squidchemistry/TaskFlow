import { Space_Grotesk, Space_Mono } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata = {
  title: 'TaskFlow — Project Manager',
  description: 'Project and task management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                border: '2px solid #111',
                boxShadow: '4px 4px 0 #111',
                borderRadius: '0',
                background: '#FFF8E7',
                color: '#111',
                fontFamily: 'var(--font-space-grotesk)',
                fontWeight: '600',
                padding: '12px 16px',
              },
              success: { style: { background: '#6BCB77' } },
              error:   { style: { background: '#FF6B9D', color: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
