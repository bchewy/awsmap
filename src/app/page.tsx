'use client';

import dynamic from 'next/dynamic';
import { useTheme } from '@/contexts/ThemeContext';

const Globe = dynamic(() => import('@/components/Globe'), { ssr: false });

export default function Home() {
  const { theme } = useTheme();
  
  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Globe />
    </main>
  );
}
