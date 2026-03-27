import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'light' | 'dark'
  className?: string
}

export default function Logo({ size = 'md', variant = 'default', className }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const variantClasses = {
    default: 'text-white',
    light: 'text-neutral-900', 
    dark: 'text-white'
  }

  return (
    <div className={cn(
      'flex items-center justify-center font-bold',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      {/* AI Brain Icon */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'transition-all duration-300',
          variant === 'light' ? 'text-neutral-900' : 'text-current'
        )}
      >
        {/* Main brain shape */}
        <path
          d="M12 2C6.48 2 2 6.48C2 8.42 3.58 9.88 5.5C11.26 7.28 12 9.5C12 11.72 11.26 13.58 9.88 16.42 9.88 18C9.88 20.58 8.42 21.58 6.48 21.58C4.28 21.58 2 20.58 2 18C2 15.32 3.58 13.72 5.5 12C7.42 10.28 8.42 9.88 6.48 9.88C4.28 9.88 3.58 8.42 2 7.42 2 6.48C2 4.28 3.58 2.72 5.5 2 7.42C2 10.28 2 11.72 5.5 13C5.5 14.58 6.48 15.32 7.42 16.42 7.42 18C7.42 19.58 6.48 20.58 4.28 20.58 2 19.58C2 17.32 3.58 16.72 5.5 16C4.28 14.28 2.42 13.72 4.28 12 6.48 4.28 11.72 5.5 10C5.5 8.42 6.48 6.58 7.42 6.48 5.72C7.42 4.28 8.42 3.58 9.88 10 5.5C10.28 2 11.72 4.28 12 6.48 4.28 13.72 5.5 14C6.48 15.32 7.42 16.42 7.42 18"
          fill="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Neural network connections */}
        <circle cx="8" cy="8" r="1.5" fill="currentColor" opacity="0.6" />
        <circle cx="16" cy="8" r="1.5" fill="currentColor" opacity="0.6" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
        <circle cx="8" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
        <circle cx="16" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
        
        {/* Connection lines */}
        <line x1="8" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="12" y1="12" x2="16" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="8" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="12" y1="12" x2="16" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="8" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="16" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="8" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      </svg>
      
      {/* Text */}
      <span className="ml-2 text-sm font-bold tracking-tight">
        NexAgent
      </span>
    </div>
  )
}
