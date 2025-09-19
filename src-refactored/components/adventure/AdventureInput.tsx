import React from 'react';
import { ButtonSize } from '../../types/combatant';

interface AdventureInputProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'search';
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: ButtonSize;
  className?: string;
  'aria-label'?: string;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
  required?: boolean;
  autoFocus?: boolean;
  name?: string;
  id?: string;
}

/**
 * Adventure-Themed Input Component
 * 
 * Provides consistent input styling across the D&D Encounter Builder
 * with medieval/fantasy aesthetic and proper accessibility support.
 * 
 * IMPROVEMENTS IMPLEMENTED:
 * ✅ Consistent adventure theming with parchment backgrounds
 * ✅ Multiple size options for different use cases
 * ✅ Focus states with amber accent colors
 * ✅ Accessibility features (ARIA labels, semantic HTML)
 * ✅ Error state styling support
 * ✅ Disabled state handling
 */
export const AdventureInput: React.FC<AdventureInputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
  min,
  max,
  maxLength,
  required = false,
  autoFocus = false,
  name,
  id,
}) => {
  // Base styles for all inputs
  const baseStyles = `
    border border-amber-300/60 rounded-lg
    bg-gradient-to-br from-yellow-50 to-amber-50
    text-amber-900 placeholder-amber-500
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400
    hover:border-amber-400/80 hover:shadow-sm
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:bg-amber-100/50 disabled:border-amber-200
    font-adventure-body
  `;

  // Size-specific styles
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs min-h-[24px]',
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-base min-h-[40px]',
    lg: 'px-5 py-3 text-lg min-h-[48px]',
    xl: 'px-6 py-4 text-xl min-h-[56px]'
  };

  // Combine all styles
  const combinedClassName = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={combinedClassName}
      aria-label={ariaLabel}
      min={min}
      max={max}
      maxLength={maxLength}
      required={required}
      autoFocus={autoFocus}
      name={name}
      id={id}
    />
  );
};

// Textarea variant for longer text inputs
interface AdventureTextareaProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
  'aria-label'?: string;
  maxLength?: number;
  required?: boolean;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const AdventureTextarea: React.FC<AdventureTextareaProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  rows = 3,
  className = '',
  'aria-label': ariaLabel,
  maxLength,
  required = false,
  autoFocus = false,
  name,
  id,
  resize = 'vertical',
}) => {
  const baseStyles = `
    border border-amber-300/60 rounded-lg
    bg-gradient-to-br from-yellow-50 to-amber-50
    text-amber-900 placeholder-amber-500
    px-4 py-3 text-base
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400
    hover:border-amber-400/80 hover:shadow-sm
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:bg-amber-100/50 disabled:border-amber-200
    font-adventure-body
    resize-${resize}
  `;

  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={`${baseStyles} ${className}`.trim()}
      aria-label={ariaLabel}
      maxLength={maxLength}
      required={required}
      autoFocus={autoFocus}
      name={name}
      id={id}
    />
  );
};

// Select variant for dropdown inputs
interface AdventureSelectProps {
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  placeholder?: string;
  disabled?: boolean;
  size?: ButtonSize;
  className?: string;
  'aria-label'?: string;
  required?: boolean;
  name?: string;
  id?: string;
}

export const AdventureSelect: React.FC<AdventureSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
  required = false,
  name,
  id,
}) => {
  const baseStyles = `
    border border-amber-300/60 rounded-lg
    bg-gradient-to-br from-yellow-50 to-amber-50
    text-amber-900
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400
    hover:border-amber-400/80 hover:shadow-sm
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:bg-amber-100/50 disabled:border-amber-200
    font-adventure-body
    cursor-pointer
  `;

  const sizeStyles = {
    xs: 'px-2 py-1 text-xs min-h-[24px]',
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-base min-h-[40px]',
    lg: 'px-5 py-3 text-lg min-h-[48px]',
    xl: 'px-6 py-4 text-xl min-h-[56px]'
  };

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${className}`.trim()}
      aria-label={ariaLabel}
      required={required}
      name={name}
      id={id}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Input group for labeled inputs
interface AdventureInputGroupProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

export const AdventureInputGroup: React.FC<AdventureInputGroupProps> = ({
  label,
  children,
  error,
  helpText,
  required = false,
  className = '',
  id,
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`space-y-1 ${className}`.trim()}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium font-adventure-body text-amber-900"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div>
        {React.cloneElement(children as React.ReactElement, { id: inputId })}
      </div>

      {error && (
        <div className="text-red-600 text-xs font-adventure-body flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {helpText && !error && (
        <div className="text-amber-600 text-xs font-adventure-body">
          {helpText}
        </div>
      )}
    </div>
  );
};

// Compound exports
AdventureInput.Textarea = AdventureTextarea;
AdventureInput.Select = AdventureSelect;
AdventureInput.Group = AdventureInputGroup;

// Export types
export type { 
  AdventureInputProps, 
  AdventureTextareaProps, 
  AdventureSelectProps, 
  AdventureInputGroupProps 
};