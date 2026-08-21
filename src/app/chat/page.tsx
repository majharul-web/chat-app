'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ChatPanel from '@/components/ChatPanel';

export default function ChatPage() {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/chat/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !token) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/chat/login');
  };

  return <ChatPanel token={token} currentUserId={user._id} onLogout={handleLogout} />;
}
