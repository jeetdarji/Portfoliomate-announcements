import React from 'react';
import PropTypes from 'prop-types';

const SIZE_MAP = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
};

const COLOR_MAP = {
  white:  'border-white/20 border-t-white',
  indigo: 'border-[#4F39F5]/20 border-t-[#4F39F5]',
  gray:   'border-[#90A1B9]/20 border-t-[#90A1B9]',
};

export const Spinner = ({
  size = 'md',
  color = 'indigo',
  className = '',
}) => {
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;
  const colorClasses = COLOR_MAP[color] || COLOR_MAP.indigo;

  const classes = `rounded-full animate-spin ${sizeClasses} ${colorClasses} ${className}`.trim();

  return (
    <span role="status" aria-label="Loading" className="inline-flex items-center justify-center">
      <div className={classes}></div>
      <span className="sr-only">Loading...</span>
    </span>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf(['white', 'indigo', 'gray']),
  className: PropTypes.string,
};

export default Spinner;