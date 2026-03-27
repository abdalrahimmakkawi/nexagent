"use client";

import React, { useState } from 'react'
import Logo from '@/components/Logo'
import LogoMinimal from '@/components/LogoMinimal'
import LogoWordmark from '@/components/LogoWordmark'
import LogoIcon from '@/components/LogoIcon'

export default function LogoShowcase() {
  const [selectedLogo, setSelectedLogo] = useState<'brain' | 'minimal' | 'wordmark' | 'icon'>('brain' as const)

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12 text-white">
          NexAgent Logo Showcase
        </h1>
        
        <div className="text-center mb-12">
          <p className="text-gray-400 mb-4">
            Choose your favorite logo design. Each logo represents AI intelligence and neural networks.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {['brain', 'minimal', 'wordmark', 'icon'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedLogo(type as 'brain' | 'minimal' | 'wordmark' | 'icon')}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${
                  selectedLogo === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Logo Display */}
        <div className="flex justify-center items-center mb-16">
          <div className="bg-gray-900 rounded-2xl p-12 border border-gray-700">
            {selectedLogo === 'brain' && <Logo size="xl" />}
            {selectedLogo === 'minimal' && <LogoMinimal size="xl" />}
            {selectedLogo === 'wordmark' && <LogoWordmark size="xl" />}
            {selectedLogo === 'icon' && <LogoIcon size="xl" />}
          </div>
        </div>

        {/* Logo Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Brain Logo</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Detailed brain illustration with neural network</li>
              <li>• "NexAgent" text alongside</li>
              <li>• Multiple connection points showing intelligence</li>
              <li>• Best for main branding and hero sections</li>
            </ul>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Minimal Logo</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Clean "N" with neural dots</li>
              <li>• Subtle connection lines</li>
              <li>• Compact and modern</li>
              <li>• Best for navigation and small spaces</li>
            </ul>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Wordmark Logo</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Full "NexAgent" text</li>
              <li>• Neural accent elements</li>
              <li>• Professional and established</li>
              <li>• Best for headers and business cards</li>
            </ul>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Icon Logo</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Simple AI head icon</li>
              <li>• Neural network connections</li>
              <li>• Minimal and scalable</li>
              <li>• Best for favicons and small spaces</li>
            </ul>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-white">
            How to Use in Your Project
          </h2>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Import & Usage</h3>
            <div className="bg-black rounded-lg p-4 mb-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`// Import any logo variant
import Logo from '@/components/Logo'
import LogoMinimal from '@/components/LogoMinimal' 
import LogoWordmark from '@/components/LogoWordmark'
import LogoIcon from '@/components/LogoIcon'

// Use in components
<Logo size="md" variant="default" />
<LogoMinimal size="md" variant="light" />
<LogoWordmark size="lg" variant="dark" />
<LogoIcon size="sm" variant="default" />

// Available props
interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'light' | 'dark'
  className?: string
}`}
              </pre>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-white">Size options:</strong> sm (32px), md (40px), lg (48px), xl (64px)
              </p>
              <p>
                <strong className="text-white">Variant options:</strong> default (white), light (dark text), dark (white)
              </p>
              <p>
                <strong className="text-white">Best uses:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Brain: Hero sections, main branding</li>
                <li>Minimal: Navigation, headers, small spaces</li>
                <li>Wordmark: Business cards, headers, professional contexts</li>
                <li>Icon: Favicons, mobile apps, compact contexts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Color Variations */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-white">
            Color Compatibility
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h4 className="font-semibold mb-3 text-white">Default (White)</h4>
              <div className="flex justify-center p-4 bg-black rounded-lg">
                <Logo size="md" variant="default" />
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h4 className="font-semibold mb-3 text-white">Light (Dark Text)</h4>
              <div className="flex justify-center p-4 bg-gray-100 rounded-lg">
                <Logo size="md" variant="light" />
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h4 className="font-semibold mb-3 text-white">Dark (White)</h4>
              <div className="flex justify-center p-4 bg-blue-600 rounded-lg">
                <Logo size="md" variant="dark" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
