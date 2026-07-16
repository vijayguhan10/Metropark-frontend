import React from 'react';

const Input = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-label-md font-label-md text-on-surface mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full border rounded-lg bg-surface-container transition-all
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            py-2.5
            ${error
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
              : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20'
            }
            text-body-md placeholder:text-on-surface-variant/50
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-outline">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-label-sm text-error">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-label-sm text-on-surface-variant">{helperText}</p>}
    </div>
  );
};

export default Input;