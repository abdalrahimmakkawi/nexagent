import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'light' | 'dark'
  className?: string
}

export default function LogoMinimal({ size = 'md', variant = 'default', className }: LogoProps) {
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
      'flex items-center justify-center font-bold',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      {/* Minimal N with neural dots */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'transition-all duration-300',
          variant === 'light' ? 'text-neutral-900' : 'text-current'
        )}
      >
        {/* Letter N */}
        <path
          d="M4 4H7C7.55 4 8 4.45 8 5V8C8 6.34 6.34 5 5H4V4Z"
          fill="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Neural dots */}
        <circle cx="16" cy="6" r="1" fill="currentColor" opacity="0.7" />
        <circle cx="18" cy="10" r="1" fill="currentColor" opacity="0.7" />
        <circle cx="16" cy="14" r="1" fill="currentColor" opacity="0.7" />
        
        {/* Connection lines */}
        <line x1="7" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
        <line x1="7" y1="6" x2="18" y2="10" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
        <line x1="7" y1="6" x2="16" y2="14" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      </svg>
    </div>
  )
}
