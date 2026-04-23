import React from 'react';
import PropTypes from 'prop-types';
import Spinner from './Spinner';

export const Button = ({
  variant = 'primary',
  size = 'md',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  children,
  ...props
}) => {
  // Base classes
  let baseClasses = 'inline-flex items-center justify-center transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F39F5]/30 focus-visible:ring-offset-1';
  
  if (fullWidth) baseClasses += ' w-full';
  
  // Interactive states
  if (disabled || loading) {
    baseClasses += ' opacity-50 cursor-not-allowed';
  } else if (variant !== 'icon') {
    baseClasses += ' active:scale-[0.98]';
  }

  // Variant classes
  let variantClasses = '';
  if (variant === 'primary') {
    variantClasses = 'bg-[#4F39F5] text-white rounded-lg hover:opacity-90 font-medium';
  } else if (variant === 'ghost') {
    variantClasses = 'bg-transparent text-[#62748E] border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] hover:text-[#0F172B] font-medium';
  } else if (variant === 'icon') {
    variantClasses = 'bg-transparent text-[#90A1B9] rounded-md hover:bg-[#F1F5F9] hover:text-[#0F172B]';
  }

  // Size classes
  let sizeClasses = '';
  if (variant === 'icon') {
    sizeClasses = size === 'sm' ? 'p-1' : size === 'lg' ? 'p-2' : 'p-1.5';
  } else {
    if (size === 'sm') sizeClasses = 'px-3 py-1.5 text-xs';
    else if (size === 'lg') sizeClasses = 'px-5 py-2.5 text-sm';
    else sizeClasses = 'px-4 py-2 text-sm'; // md
  }

  // Combine classes
  const classes = [baseClasses, variantClasses, sizeClasses, className].filter(Boolean).join(' ');

  // Spinner logic
  const renderContent = () => {
    if (loading) {
      return (
        <Spinner 
          size="sm" 
          color={variant === 'primary' ? 'white' : 'gray'} 
        />
      );
    }
    
    if (variant === 'icon') {
      return children;
    }

    return (
      <>
        {LeftIcon && <span className="mr-2 flex-shrink-0"><LeftIcon size={16} /></span>}
        {children}
        {RightIcon && <span className="ml-2 flex-shrink-0"><RightIcon size={16} /></span>}
      </>
    );
  };

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'ghost', 'icon']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  leftIcon: PropTypes.elementType,
  rightIcon: PropTypes.elementType,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  children: PropTypes.node,
  'aria-label': function(props, propName, componentName) {
    if (props.variant === 'icon' && (!props[propName] || typeof props[propName] !== 'string')) {
      return new Error(`Invalid or missing prop \`${propName}\` supplied to \`${componentName}\`. It is required when variant is 'icon'.`);
    }
  },
};

export default Button;