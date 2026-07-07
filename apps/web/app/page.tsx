'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '../stores/demoStore';

export default function Home() {
  const router = useRouter();
  const { activeUser } = useDemoStore();

  useEffect(() => {
    if (activeUser) {
      router.push('/executive');
    } else {
      router.push('/login');
    }
  }, [activeUser, router]);

  return (
    <div className="min-h-screen bg-[#FFF9ED] flex items-center justify-center">
      <div className="animate-pulse font-sans text-[#16263A] font-bold text-sm">
        Redirecting to YellowSense C360 Portal...
      </div>
    </div>
  );
}
