import React, { useState } from 'react';
import PropTypes from 'prop-types';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const SIZE_MAP = {
  xxs: { container: 'w-[29px] h-[29px]', text: 'text-[9px]' },
  xs: { container: 'w-6 h-6', text: 'text-[10px]' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-12 h-12', text: 'text-sm' },
  xl: { container: 'w-11 h-11', text: 'text-sm' },
};

export const Avatar = ({
  src,
  name,
  size = 'md',
  ring = false,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  
  const sizeStyles = SIZE_MAP[size] || SIZE_MAP.md;
  
  let containerClasses = `relative inline-flex items-center justify-center rounded-full flex-shrink-0 overflow-hidden ${sizeStyles.container}`;
  if (ring) {
    containerClasses += ' ring-2 ring-white ring-offset-1';
  }
  if (className) {
    containerClasses += ` ${className}`;
  }

  const showInitials = !src || imgError;

  if (showInitials) {
    return (
      <div 
        className={`${containerClasses} bg-[#E0E7FF] text-[#4F39F5] font-semibold`}
        aria-label={name}
        title={name}
      >
        <span className={sizeStyles.text}>{getInitials(name)}</span>
      </div>
    );
  }

  return (
    <div className={containerClasses} title={name}>
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover rounded-full"
      />
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['xxs', 'xs', 'sm', 'md', 'lg', 'xl']),
  ring: PropTypes.bool,
  className: PropTypes.string,
};

export default Avatar;