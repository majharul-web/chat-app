'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { useLoginMutation } from '@/store/api/chatApi';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loginMutation, { isLoading }] = useLoginMutation();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (phone: string, name: string) => {
    setError(null);
    try {
      const response = await loginMutation({ phone, name }).unwrap();
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      dispatch(setCredentials({ user: response.user, token: response.token }));
      router.push('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return <LoginForm onLogin={handleLogin} isLoading={isLoading} error={error} />;
}
