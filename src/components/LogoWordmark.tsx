import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'light' | 'dark'
  className?: string
}

export default function LogoWordmark({ size = 'md', variant = 'default', className }: LogoProps) {
  const sizeClasses = {
    sm: 'w-16 h-6',
    md: 'w-20 h-8', 
    lg: 'w-24 h-10',
    xl: 'w-32 h-12'
  }

  const variantClasses = {
    default: 'text-white',
    light: 'text-neutral-900', 
    dark: 'text-white'
  }

  return (
    <div className={cn(
      'flex items-center font-bold tracking-tight',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      {/* NexAgent wordmark */}
      <svg
        viewBox="0 0 120 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'transition-all duration-300',
          variant === 'light' ? 'text-neutral-900' : 'text-current'
        )}
      >
        {/* Nex */}
        <path
          d="M8 12C8 8.95 8.45 9 9V15C9 15.55 8.55 8 8.45 8V12Z"
          fill="currentColor"
        />
        <path
          d="M12 8L15 11L18 8L15 5L12 8Z"
          fill="currentColor"
          opacity="0.8"
        />
        
        {/* Agent */}
        <text
          x="28"
          y="32"
          fontSize="24"
          fontWeight="bold"
          fill="currentColor"
          className="tracking-tight"
        >
          Agent
        </text>
        
        {/* Neural accent */}
        <circle cx="95" cy="16" r="2" fill="currentColor" opacity="0.3" />
        <circle cx="105" cy="32" r="2" fill="currentColor" opacity="0.3" />
        <circle cx="95" cy="48" r="2" fill="currentColor" opacity="0.3" />
        
        {/* Connections */}
        <line x1="95" y1="16" x2="105" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.2" />
        <line x1="105" y1="32" x2="95" y2="48" stroke="currentColor" strokeWidth="1" opacity="0.2" />
        <line x1="95" y1="48" x2="105" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      </svg>
    </div>
  )
}
