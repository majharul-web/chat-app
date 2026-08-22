"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { User } from "@/types";
import { getAvatarColor } from "@/lib/utils";
import Modal from "@/components/Modal";
import { API_BASE } from "@/app_config";

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  currentUserId?: string;
  selectedUsers: User[];
  onSelect: (users: User[]) => void;
  convType: "direct" | "group";
  onConvTypeChange: (type: "direct" | "group") => void;
  groupName?: string;
  onGroupNameChange?: (name: string) => void;
  title?: string;
  submitLabel?: string;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

export default function UserSearchModal({
  isOpen,
  onClose,
  token,
  currentUserId,
  selectedUsers,
  onSelect,
  convType,
  onConvTypeChange,
  groupName = "",
  onGroupNameChange,
  title = "New Conversation",
  submitLabel = "Create",
  onSubmit,
  isSubmitting = false,
}: UserSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setIsSearching(false);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const search = useMemo(() => {
    const seen = new Set<string>();
    return results.filter((u) => {
      if (u._id === currentUserId) return false;
      if (seen.has(u._id)) return false;
      seen.add(u._id);
      return true;
    });
  }, [results, currentUserId]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!value.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE}/api/users/search?q=${encodeURIComponent(value)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("User search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const toggleUser = (user: User) => {
    const exists = selectedUsers.find((u) => u._id === user._id);
    if (exists) {
      onSelect(selectedUsers.filter((u) => u._id !== user._id));
    } else if (convType === "direct") {
      onSelect([user]);
    } else {
      onSelect([...selectedUsers, user]);
    }
  };

  const isSelected = (user: User) => selectedUsers.some((u) => u._id === user._id);
  const canSubmit = convType === "direct" ? selectedUsers.length === 1 : selectedUsers.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size='md'>
      <div className='flex gap-2 mb-4'>
        <button
          type='button'
          onClick={() => onConvTypeChange("direct")}
          className={`flex-1 py-2 px-4 rounded-md border transition ${
            convType === "direct"
              ? "bg-primary border-primary text-white"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          Direct Message
        </button>
        <button
          type='button'
          onClick={() => onConvTypeChange("group")}
          className={`flex-1 py-2 px-4 rounded-md border transition ${
            convType === "group" ? "bg-primary border-primary text-white" : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          Group
        </button>
      </div>

      {convType === "group" && onGroupNameChange && (
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Group Name</label>
          <input
            type='text'
            value={groupName}
            onChange={(e) => onGroupNameChange(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-primary outline-none'
            placeholder='Enter group name'
          />
        </div>
      )}

      <div className='mb-4 relative'>
        <input
          type='text'
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-primary outline-none'
          placeholder='Search by name or phone...'
          autoFocus
        />
        {isSearching && (
          <div className='absolute right-3 top-2.5'>
            <div className='w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin' />
          </div>
        )}
      </div>

      {selectedUsers.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-4'>
          {selectedUsers.map((user) => (
            <div
              key={user._id}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
                convType === "group" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full ${getAvatarColor(user._id)} flex items-center justify-center text-white text-[10px] font-semibold`}
              >
                {(user.name || user.phone).charAt(0).toUpperCase()}
              </div>
              <span className='max-w-[120px] truncate'>{user.name || user.phone}</span>
              <button
                type='button'
                onClick={() => onSelect(selectedUsers.filter((u) => u._id !== user._id))}
                className='ml-0.5 text-gray-500 hover:text-gray-700'
              >
                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {search.length > 0 && (
        <div className='border border-gray-200 rounded-md shadow-sm max-h-64 overflow-y-auto mb-4'>
          {search.map((u) => {
            const selected = isSelected(u);
            return (
              <button
                key={u._id}
                type='button'
                onClick={() => toggleUser(u)}
                className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 transition flex items-center gap-3 ${
                  selected ? "bg-primary/5" : ""
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full ${getAvatarColor(u._id)} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}
                >
                  {(u.name || u.phone).charAt(0).toUpperCase()}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='font-medium text-gray-900 text-sm truncate'>{u.name}</div>
                  <div className='text-xs text-gray-500 truncate'>{u.phone}</div>
                </div>
                {selected && (
                  <svg
                    className='w-5 h-5 text-primary flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      {query && !isSearching && search.length === 0 && (
        <div className='text-center py-8 text-gray-500 text-sm'>
          No users found matching &quot;{query}&quot;
        </div>
      )}

      <div className='flex gap-2 justify-end'>
        <button
          type='button'
          onClick={onClose}
          className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition'
        >
          Cancel
        </button>
        <button
          type='button'
          onClick={() => {
            if (onSubmit) onSubmit();
          }}
          disabled={!canSubmit || isSubmitting}
          className='px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition'
        >
          {isSubmitting ? "Creating..." : submitLabel}
        </button>
      </div>
    </Modal>
  );
}
