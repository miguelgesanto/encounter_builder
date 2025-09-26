import React, { forwardRef } from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variantClasses = {
    primary: 'bg-dnd-primary text-white hover:bg-dnd-primary/90 focus:ring-dnd-primary',
    secondary: 'bg-dnd-secondary text-white hover:bg-dnd-secondary/90 focus:ring-dnd-secondary',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
    outline: 'border border-dnd-primary text-dnd-primary hover:bg-dnd-primary hover:text-white focus:ring-dnd-primary',
    ghost: 'text-dnd-primary hover:bg-dnd-primary/10 focus:ring-dnd-primary'
  }

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
})

Button.displayName = 'Button'

export default Button