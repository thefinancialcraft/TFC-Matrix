import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'TFC Axom Lite - Performance Intelligence',
  description: 'Welcome Back, Admin. Performance Intelligence Dashboard.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen bg-[#080B11] overflow-hidden font-roboto text-[#F1F5F9] antialiased selection:bg-[#14B8A6]/25 selection:text-[#14B8A6]">
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative bg-[#080B11]">
          {/* Select Organic Ambient Glowing Blobs (Deep dark canvas with isolated spots) */}
          <div className="fixed inset-0 left-[245px] pointer-events-none overflow-hidden select-none -z-0">
            {/* Blob 1: Top-Left Violet Glow near First Card */}
            <div className="absolute -top-10 left-[4%] w-[320px] h-[280px] rounded-full bg-[#7c3aed]/[0.10] blur-[100px]" />
            
            {/* Blob 2: Top-Right Berry Glow near End Card & Month Switcher */}
            <div className="absolute -top-8 right-[5%] w-[300px] h-[260px] rounded-full bg-[#e11d48]/[0.09] blur-[95px]" />
            
            {/* Blob 3: Center-Mid Sapphire Blue Floating Glow */}
            <div className="absolute top-[48%] left-[38%] w-[360px] h-[300px] rounded-full bg-[#0284c7]/[0.08] blur-[110px]" />
            
            {/* Blob 4: Bottom-Left Emerald Glow Accent */}
            <div className="absolute -bottom-8 left-[14%] w-[330px] h-[280px] rounded-full bg-[#10b981]/[0.07] blur-[105px]" />
          </div>

          <div className="relative z-10 min-h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
