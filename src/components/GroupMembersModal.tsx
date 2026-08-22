"use client";

import Modal from "@/components/Modal";
import { getAvatarColor } from "@/lib/utils";
import { User } from "@/types";

interface GroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: User[];
  groupName?: string;
}

export default function GroupMembersModal({ isOpen, onClose, members, groupName }: GroupMembersModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={groupName || "Group Members"} size='sm'>
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
    </Modal>
  );
}
