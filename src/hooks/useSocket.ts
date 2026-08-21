'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://frontend-task-chatapp.onrender.com';

export function useSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingMessages, setIncomingMessages] = useState<Map<string, Message>>(new Map());

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('message:received', (message: Message) => {
      setIncomingMessages(prev => {
        const next = new Map(prev);
        next.set(message._id, message);
        return next;
      });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('conversation:join', conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('conversation:leave', conversationId);
    }
  }, []);

  const consumeMessage = useCallback((conversationId: string) => {
    const messages: Message[] = [];
    incomingMessages.forEach((msg) => {
      if (msg.conversation === conversationId) {
        messages.push(msg);
      }
    });
    if (messages.length > 0) {
      setIncomingMessages(prev => {
        const next = new Map(prev);
        messages.forEach(msg => next.delete(msg._id));
        return next;
      });
    }
    return messages;
  }, [incomingMessages]);

  return {
    isConnected,
    joinConversation,
    leaveConversation,
    consumeMessage,
  };
}
