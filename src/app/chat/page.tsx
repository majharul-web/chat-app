'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import ChatPanel from '@/components/ChatPanel';

export default function ChatPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (!user || !token) {
      router.push('/chat/login');
    }
  }, [user, token, router]);

  if (!user || !token) {
    return null;
  }

  return <ChatPanel />;
}
