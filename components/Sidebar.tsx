'use client'

import { 
  LayoutDashboard, 
  Users, 
  CalendarDays,
  Target,
  UserPlus,
  FileText, 
  CreditCard,
  Settings, 
  LogOut
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
    { label: "Agents", href: "/agents", icon: <Users size={18} /> },
    { label: "Teams", href: "/teams", icon: <Users size={18} /> },
    { label: "Payment Grid", href: "/payment-grid", icon: <CreditCard size={18} /> },
    { label: "Monthly Overview", href: "/monthly-overview", icon: <CalendarDays size={18} /> }
  ]

  return (
    <aside className="fixed bottom-0 left-0 z-50 w-full h-[68px] md:static md:w-[245px] md:h-full bg-[#0C101A] border-t md:border-t-0 md:border-r border-[#1E293B] flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="hidden md:block px-5 pt-10 pb-3">
        <h1 className="font-poppins text-[18px] md:text-[20px] font-[500] text-white/60 tracking-tight text-left">
          TFC Matrix
        </h1>
      </div>

      {/* Navigation Links (Clean Flat List without Categories) */}
      <nav className="flex h-full md:flex-1 flex-row md:flex-col gap-1 px-2 md:px-4 py-1 md:pt-4 md:py-1 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto" aria-label="Main Navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/" && pathname === "")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-menu-link group flex flex-1 md:flex-none flex-col md:flex-row items-center justify-center md:justify-start gap-0.5 md:gap-2.5 shrink-0 md:w-full px-2 md:px-3 py-1.5 rounded-xl bg-transparent transition-all duration-300 ease-out ${
                isActive
                  ? "text-white font-medium"
                  : "text-[#64748B] hover:text-white font-normal"
              }`}
            >
              <span className={`transition-all mt-0 md:mt-1 duration-300 ease-out flex items-center justify-center ${
                isActive 
                  ? "text-white scale-105 " 
                  : "text-[#64748B] group-hover:text-white scale-100"
              }`}>
                {item.icon}
              </span>
              <span className={`font-roboto text-[10px] md:text-[14px] pl-0 md:pl-1 mt-0 md:mt-1 transition-all duration-300 ease-out leading-none origin-left inline-block ${
                isActive 
                  ? "text-white font-medium scale-[1.15]" 
                  : "text-[#64748B] group-hover:text-white font-normal scale-100"
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>


      {/* User Profile Bar */}
      <div className="hidden md:flex px-5 py-4 border-t border-[#1E293B] items-center justify-between bg-[#0C101A]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center font-poppins font-bold text-xs text-white">
            K
          </div>
          <div>
            <div className="font-poppins text-[13px] font-semibold text-white leading-tight">Admin</div>
            <div className="font-roboto text-[10px] text-[#64748B] leading-tight">The Financial Craft</div>
          </div>
        </div>
        <button 
          aria-label="Log out" 
          className="p-1.5 text-[#64748B] hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
