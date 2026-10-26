'use client'

import React, { useState, useEffect } from 'react'
import UnderConstruction from './UnderConstruction'
import Sidebar from './Sidebar'
import { Eye, ShieldAlert, X } from 'lucide-react'

interface MaintenanceGateProps {
  children: React.ReactNode
}

export default function MaintenanceGate({ children }: MaintenanceGateProps) {
  // Maintenance mode is ENABLED by default to decouple the entire project
  const [isBypassed, setIsBypassed] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    // Check if URL contains bypass param or session storage
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const hasBypassParam = searchParams.get('preview') === 'matrix' || searchParams.get('preview') === 'true'
      const storedBypass = sessionStorage.getItem('tfc_matrix_preview') === 'true'

      if (hasBypassParam || storedBypass) {
        setIsBypassed(true)
        sessionStorage.setItem('tfc_matrix_preview', 'true')
      }
    }
  }, [])

  const handleEnableBypass = () => {
    setIsBypassed(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tfc_matrix_preview', 'true')
    }
  }

  const handleDisableBypass = () => {
    setIsBypassed(false)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('tfc_matrix_preview')
    }
  }

  // Prior to hydration, render UnderConstruction to avoid flash of dashboard
  if (!mounted || !isBypassed) {
    return <UnderConstruction onBypass={handleEnableBypass} />
  }

  // Admin Bypass Mode: Shows original decoupled project with a floating indicator
  return (
    <div className="flex h-screen flex-col md:flex-row bg-[#080B11] overflow-hidden font-roboto text-[#F1F5F9] antialiased selection:bg-[#14B8A6]/25 selection:text-[#14B8A6]">
      {/* Admin Floating Banner */}
      <aside className="fixed top-3 right-4 z-[9999] flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e11d48]/20 border border-[#e11d48]/40 backdrop-blur-md shadow-lg text-xs text-white">
        <ShieldAlert className="w-3.5 h-3.5 text-[#fb7185] animate-pulse" />
        <span className="font-semibold text-[#fecdd3]">Admin Preview Mode</span>
        <button 
          onClick={handleDisableBypass}
          className="ml-2 pl-2 border-l border-white/20 text-white/70 hover:text-white flex items-center gap-1"
          title="Return to Public New Features Page"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </aside>

      <Sidebar />
      <main className="flex-1 min-h-0 h-full pb-[68px] md:pb-0 overflow-y-auto overflow-x-hidden relative bg-[#080B11]">
        {/* Organic Ambient Glowing Blobs */}
        <div className="fixed inset-0 md:left-[245px] pointer-events-none overflow-hidden select-none -z-0">
          <div className="absolute -top-10 left-[4%] w-[320px] h-[280px] rounded-full bg-[#7c3aed]/[0.10] blur-[100px]" />
          <div className="absolute -top-8 right-[5%] w-[300px] h-[260px] rounded-full bg-[#e11d48]/[0.09] blur-[95px]" />
          <div className="absolute top-[48%] left-[38%] w-[360px] h-[300px] rounded-full bg-[#0284c7]/[0.08] blur-[110px]" />
          <div className="absolute -bottom-8 left-[14%] w-[330px] h-[280px] rounded-full bg-[#10b981]/[0.07] blur-[105px]" />
        </div>

        <div className="relative z-10 min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
