"use client";

import { getAvatarColor } from "@/lib/utils";
import { User } from "@/types";

interface GroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: User[];
  groupName?: string;
}

export default function GroupMembersModal({ isOpen, onClose, members, groupName }: GroupMembersModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm'>
      <div className='bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900'>{groupName || "Group Members"}</h3>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        <div className='space-y-3 max-h-80 overflow-y-auto'>
          {members.map((member) => (
            <div key={member._id} className='flex items-center gap-3'>
              <div
                className={`w-10 h-10 rounded-full ${getAvatarColor(member._id)} flex items-center justify-center text-white font-semibold flex-shrink-0`}
              >
                {(member.name || member.phone).charAt(0).toUpperCase()}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='font-medium text-gray-900 truncate'>{member.name}</div>
                <div className='text-sm text-gray-500 truncate'>{member.phone}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
