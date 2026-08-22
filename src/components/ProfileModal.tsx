"use client";

import Modal from "@/components/Modal";
import { getAvatarColor } from "@/lib/utils";
import { User } from "@/types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title='My Profile' size='sm'>
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
          <div className='text-xs text-gray-500 mb-1'>User ID</div>
          <div className='text-sm font-medium font-mono break-all'>{user._id}</div>
        </div>

        <div className='p-3 bg-gray-50 rounded-lg'>
          <div className='text-xs text-gray-500 mb-1'>Member Since</div>
          <div className='text-sm font-medium'>{new Date(user.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
    </Modal>
  );
}
