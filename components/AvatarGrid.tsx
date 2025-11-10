import React from 'react';
import { avatars } from '../utils/avatars';

interface AvatarGridProps {
  selectedAvatar: string;
  onSelectAvatar: (avatarUrl: string) => void;
}

const AvatarGrid: React.FC<AvatarGridProps> = ({ selectedAvatar, onSelectAvatar }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {avatars.map((avatarUrl) => (
        <button
          key={avatarUrl}
          onClick={() => onSelectAvatar(avatarUrl)}
          className={`rounded-full transition-all duration-200 ${
            selectedAvatar === avatarUrl
              ? 'ring-4 ring-primary'
              : 'ring-2 ring-transparent hover:ring-primary/50'
          }`}
        >
          <img
            src={avatarUrl}
            alt="User Avatar"
            className="w-full h-full rounded-full"
          />
        </button>
      ))}
    </div>
  );
};

export default AvatarGrid;
