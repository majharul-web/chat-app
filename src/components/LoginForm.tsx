"use client";

import { useState } from "react";

interface LoginFormProps {
  onLogin: (phone: string, name: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function LoginForm({ onLogin, isLoading, error }: LoginFormProps) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(phone, name);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8'>
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Welcome to ChatWithMe</h1>
          <p className='text-gray-600'>Enter your phone number and name to log in</p>
        </div>

        {error && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-1.5'>
              Phone Number
            </label>
            <input
              id='phone'
              type='tel'
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring focus:ring-primary focus:border-transparent outline-none transition'
              placeholder='Enter your phone number'
            />
          </div>

          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1.5'>
              Your Name
            </label>
            <input
              id='name'
              type='text'
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring focus:ring-primary focus:border-transparent outline-none transition'
              placeholder='Enter your name'
            />
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-primary text-white py-2.5 px-4 rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium'
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className='mt-6 text-xs text-center text-gray-500'>
          New phone numbers are automatically registered as new users.
        </p>
      </div>
    </div>
  );
}
