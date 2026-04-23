import React from 'react';
import PropTypes from 'prop-types';

const VARIANT_MAP = {
  'indigo':        { bg: 'bg-[#E0E7FF]',  text: 'text-[#4F39F5]' },
  'indigo-active': { bg: 'bg-[#4F39F5]',  text: 'text-white' },
  'pink':          { bg: 'bg-[#FCE7F3]',  text: 'text-[#DB2777]' },
  'gray':          { bg: 'bg-[#F1F5F9]',  text: 'text-[#62748E]' },
  'green':         { bg: 'bg-[#DCFCE7]',  text: 'text-[#22C55E]' },
};

export const Badge = ({
  variant = 'indigo',
  leftIcon: LeftIcon,
  onClick,
  className = '',
  children,
}) => {
  const variantStyles = VARIANT_MAP[variant] || VARIANT_MAP.indigo;
  
  let classes = `inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${variantStyles.bg} ${variantStyles.text}`;
  
  if (onClick) {
    classes += ' cursor-pointer hover:opacity-90 transition-opacity duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F39F5]/30';
  } else {
    classes += ' cursor-default';
  }

  if (className) {
    classes += ` ${className}`;
  }

  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <span
      className={classes}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : 'status'}
      tabIndex={onClick ? 0 : undefined}
    >
      {LeftIcon && <LeftIcon size={12} className="flex-shrink-0" />}
      {children}
    </span>
  );
};

Badge.propTypes = {
  variant: PropTypes.oneOf(['indigo', 'indigo-active', 'pink', 'gray', 'green']),
  leftIcon: PropTypes.elementType,
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Badge;