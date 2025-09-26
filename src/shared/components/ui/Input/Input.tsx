import React, { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'success' | 'error'
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  error,
  label,
  hint,
  leftIcon,
  rightIcon,
  variant = 'default',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  const baseClasses = 'w-full px-3 py-2 text-sm bg-white border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    default: 'border-gray-300 focus:border-dnd-primary focus:ring-dnd-primary/20',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
  }

  const hasError = error || variant === 'error'
  const finalVariant = hasError ? 'error' : variant

  const inputClasses = `${baseClasses} ${variantClasses[finalVariant]} ${className}`.trim()

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">
              {leftIcon}
            </div>
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`${inputClasses} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="text-gray-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>

      {hint && !hasError && (
        <p className="text-xs text-gray-500">
          {hint}
        </p>
      )}

      {hasError && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input