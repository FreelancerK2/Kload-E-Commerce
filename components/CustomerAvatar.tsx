'use client';

import { useState } from 'react';

interface CustomerAvatarProps {
  imageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function CustomerAvatar({
  imageUrl,
  firstName,
  lastName,
  email,
  size = 'md',
  className = '',
}: CustomerAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = () => {
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs';
      case 'lg':
        return 'w-12 h-12 text-lg';
      default:
        return 'w-10 h-10 text-sm';
    }
  };

  const sizeClasses = getSizeClasses();

  if (imageUrl && !imageError) {
    return (
      <div className={`${sizeClasses} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
        <img
          src={imageUrl}
          alt={`${firstName || ''} ${lastName || ''}`.trim() || 'Customer'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 ${className}`}>
      <span className="text-gray-500 font-medium">
        {getInitials()}
      </span>
    </div>
  );
}
