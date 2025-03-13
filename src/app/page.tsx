'use client';

import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('@/components/Globe'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Globe />
    </main>
  );
}
