import type { Metadata } from 'next'
import './globals.css'
import MaintenanceGate from '@/components/MaintenanceGate'

export const metadata: Metadata = {
  title: 'TFC Matrix - We are working on some new features',
  description: 'TFC Matrix is currently upgrading core modules and deploying next-generation performance intelligence features.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080B11] text-[#F1F5F9] font-roboto antialiased selection:bg-[#14B8A6]/25 selection:text-[#14B8A6]">
        <MaintenanceGate>
          {children}
        </MaintenanceGate>
      </body>
    </html>
  )
}

