"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { AVATAR_OPTIONS, AVATARS_PATH } from "@/constants/avatars";

interface AvatarModalProps {
  currentAvatar: string;
  onSelect: (avatar: string) => void;
  onClose: () => void;
}

const AvatarModal = ({ currentAvatar, onSelect, onClose }: AvatarModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85">
      <div 
        ref={modalRef}
        className="dark-gradient rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Choose your Avatar</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {AVATAR_OPTIONS.map((avatar, index) => {
            // Fix: Use the full path for the avatar
            const fullAvatarPath = `${AVATARS_PATH}${avatar}`;
            
            return (
              <div 
                key={index}
                className={`relative cursor-pointer rounded-full p-1 transition-all ${
                  currentAvatar === fullAvatarPath ? 'border-2 border-primary-200 bg-primary-200/20' : 'border border-gray-700 hover:border-primary-200/50'
                }`}
                onClick={() => onSelect(fullAvatarPath)}
              >
                <Image 
                  src={fullAvatarPath}
                  alt={`Avatar option ${index + 1}`}
                  width={80}
                  height={80}
                  className="rounded-full object-cover aspect-square"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;