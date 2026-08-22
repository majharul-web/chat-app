"use client";

import { getAvatarColor } from "@/lib/utils";
import { User } from "@/types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm'>
      <div className='bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-gray-900'>My Profile</h3>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        <div className='flex items-center gap-4 mb-6'>
          <div
            className={`w-16 h-16 rounded-full ${getAvatarColor(user._id)} flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0`}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className='text-xl font-semibold text-gray-900'>{user.name}</div>
            <div className='text-sm text-gray-500'>{user.phone}</div>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='p-3 bg-gray-50 rounded-lg'>
            <div className='text-xs text-gray-500 mb-1'>Member Since</div>
            <div className='text-sm font-medium'>{new Date(user.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
