import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'light' | 'dark'
  className?: string
}

export default function LogoIcon({ size = 'md', variant = 'default', className }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  }

  const variantClasses = {
    default: 'text-white',
    light: 'text-neutral-900', 
    dark: 'text-white'
  }

  return (
    <div className={cn(
      'flex items-center justify-center',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      {/* Simple AI icon */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'transition-all duration-300',
          variant === 'light' ? 'text-neutral-900' : 'text-current'
        )}
      >
        {/* AI head */}
        <circle cx="12" cy="8" r="3" fill="currentColor" />
        <path
          d="M12 11C10.34 11 9 11.66 9 10.5V8.5C9 7.67 10.34 7 12 7.67C13.66 7 15 7.67 15 8.5V10.5C15 9.66 13.66 11 12 11Z"
          fill="currentColor"
        />
        
        {/* Neural connections */}
        <circle cx="6" cy="6" r="1" fill="currentColor" opacity="0.4" />
        <circle cx="18" cy="6" r="1" fill="currentColor" opacity="0.4" />
        <circle cx="6" cy="18" r="1" fill="currentColor" opacity="0.4" />
        <circle cx="18" cy="18" r="1" fill="currentColor" opacity="0.4" />
        
        {/* Connection lines */}
        <line x1="6" y1="6" x2="12" y2="8" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <line x1="12" y1="8" x2="18" y2="6" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <line x1="6" y1="18" x2="12" y2="10" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <line x1="12" y1="10" x2="18" y2="18" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <line x1="6" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <line x1="18" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <line x1="18" y1="18" x2="6" y2="18" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
      </svg>
    </div>
  )
}
