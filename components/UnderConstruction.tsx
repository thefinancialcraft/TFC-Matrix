'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface UnderConstructionProps {
  onBypass?: () => void
}

export default function UnderConstruction({ onBypass }: UnderConstructionProps = {}) {
  // Allows optional toggle between glowing amber alert icon and theme cyber mascot
  const [showMascot, setShowMascot] = useState(false)

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0A0912] font-roboto select-none">
      
      {/* Background Soft Glow Gradients - Deep warm vignette */}
      <div 
        className="fixed inset-0 pointer-events-none -z-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #181329 0%, #0f0c1c 50%, #07060d 100%)'
        }}
      />

      {/* Subtle warm ambient glow behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-[#3b2d54]/25 blur-[120px] pointer-events-none -z-0" />

      {/* Centered Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[460px] p-8 sm:p-12 rounded-[28px] bg-[#141220]/75 border border-white/[0.08] backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col items-center text-center transition-all duration-300">
        
        {/* Top Glowing Icon / Character Area */}
        <div 
          className="relative mb-6 cursor-pointer group" 
          onClick={() => setShowMascot(!showMascot)} 
          title="Click to toggle icon/mascot"
        >
          {/* Circular Amber Ambient Halo */}
          <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-xl scale-125 pointer-events-none transition-all group-hover:scale-150" />

          {!showMascot ? (
            /* Amber Alert Exclamation Icon */
            <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-amber-500/[0.08] border-[2.5px] border-[#F59E0B] text-[#F59E0B] shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-transform group-hover:scale-105">
              <svg 
                className="w-7 h-7" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 7V13" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
                <circle 
                  cx="12" 
                  cy="17" 
                  r="1.25" 
                  fill="currentColor" 
                />
              </svg>
            </div>
          ) : (
            /* Theme Cyber Bot Mascot */
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] bg-[#0C101A] transition-transform group-hover:scale-105">
              <Image 
                src="/feature-bot.png" 
                alt="TFC Matrix Bot" 
                fill 
                className="object-cover object-center" 
                sizes="56px"
              />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="font-poppins text-[22px] sm:text-[24px] font-semibold text-white tracking-tight mb-3">
          Under Maintenance
        </h1>

        {/* Subtitle Message */}
        <p className="text-[13px] sm:text-[14px] text-[#8E8B9E] font-normal leading-relaxed max-w-[320px]">
          TFC Matrix is being updated to serve you better with some new features. We&apos;ll be back shortly.
        </p>

      </div>

    </div>
  )
}
