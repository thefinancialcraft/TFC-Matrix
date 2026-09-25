'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import { 
  IndianRupee, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  CheckCircle2,
  Target,
  TrendingUp,
  Zap,
  Calendar,
  Clock,
  ArrowRight,
  CreditCard,
  AlertTriangle,
  Trophy,
  Users,
  Star,
  ChevronDown,
  Building2,
  Tag,
  Crown,
  Coins,
  BarChart3
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip
} from 'recharts'

const formatLakhs = (val: number) => `₹${((val || 0) / 100000).toFixed(2)}L`
const formatMMMYY = (monthStr: string) => {
  if (!monthStr) return "Sep 26"
  const parts = monthStr.trim().split(" ")
  const mmm = parts[0].slice(0, 3)
  if (parts.length > 1) {
    const yy = parts[1].slice(-2)
    return `${mmm} ${yy}`
  }
  return `${mmm} 26`
}

function CornerBorderBeam({ color, glowKey, delay = 0 }: { color: string; glowKey: string; delay?: number }) {
  const pathD = "M 109 0 L 109 27 A 24 24 0 0 1 85 51 L 0 51"
  return (
    <div className="absolute bottom-0 right-0 w-[110px] h-[52px] pointer-events-none overflow-hidden rounded-br-[24px]">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 110 52" fill="none">
        <defs>
          <linearGradient id={`baseGrad-${glowKey}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="35%" stopColor={color} stopOpacity="0.85" />
            <stop offset="70%" stopColor={color} stopOpacity="0.75" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {/* Base corner border */}
        <path
          d={pathD}
          stroke={`url(#baseGrad-${glowKey})`}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Moveable shining beam: Slim outer tapered ends */}
        <path
          d={pathD}
          stroke="#ffffff"
          strokeWidth="0.5"
          strokeLinecap="round"
          className="kpi-beam-outer"
          style={{ animationDelay: `${delay}s` }}
        />
        {/* Moveable shining beam: Mid transition taper */}
        <path
          d={pathD}
          stroke="#ffffff"
          strokeWidth="1"
          strokeLinecap="round"
          className="kpi-beam-mid"
          style={{ animationDelay: `${delay}s` }}
        />
        {/* Moveable shining beam: Glowing radiant core */}
        <path
          d={pathD}
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinecap="round"
          className="kpi-beam-core"
          style={{
            filter: `drop-shadow(0 0 3px #ffffff) drop-shadow(0 0 8px ${color})`,
            animationDelay: `${delay}s`
          }}
        />
      </svg>
    </div>
  )
}

const CustomTrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="backdrop-blur-xl bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs min-w-[155px] pointer-events-none shadow-md shadow-black/25">
        <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/15">
          <span className="font-poppins font-semibold text-white tracking-wide">{d.fullMonth || label}</span>
          <span className="font-poppins font-semibold text-[#38BDF8] text-[13px]">
            {Number(d.achievement || 0).toFixed(1)}%
          </span>
        </div>
        <div className="space-y-1 font-poppins">
          <div className="flex items-center justify-between gap-3 text-[#94A3B8]">
            <span className="flex items-center gap-1.5 text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
              Achieved:
            </span>
            <span className="text-white font-medium">{formatLakhs(d.score)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[#94A3B8]">
            <span className="flex items-center gap-1.5 text-white/50">
              <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
              Target:
            </span>
            <span className="text-white/80 font-medium">{formatLakhs(d.target)}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

const KPI_CARD_THEMES = [
  {
    // KPI 1: Final Premium (Vibrant Purple)
    name: 'purple',
    accent: '#a78bfa',
    accentText: 'text-[#a78bfa]',
    borderStyle: 'border-[#a78bfa]/45 border-t-[#a78bfa]/75 border-b-[#a78bfa]/90',
    blob1: 'from-[#8b5cf6]/[0.22] via-[#7c3aed]/[0.08] to-transparent',
    blob2: 'bg-[#a78bfa]/[0.12]',
    zapFilter: 'drop-shadow(0 0 10px rgba(167,139,250,0.90))',
    svgFilter: 'hue-rotate(86deg) saturate(1.25) drop-shadow(0 8px 35px rgba(167,139,250,0.35))',
  },
  {
    // KPI 2: Gross Premium (Emerald Green)
    name: 'green',
    accent: '#34d399',
    accentText: 'text-[#34d399]',
    borderStyle: 'border-[#34d399]/45 border-t-[#34d399]/75 border-b-[#34d399]/90',
    blob1: 'from-[#10b981]/[0.22] via-[#059669]/[0.08] to-transparent',
    blob2: 'bg-[#34d399]/[0.12]',
    zapFilter: 'drop-shadow(0 0 10px rgba(52,211,153,0.90))',
    svgFilter: 'hue-rotate(-20deg) saturate(1.2) drop-shadow(0 8px 35px rgba(52,211,153,0.30))',
  },
  {
    // KPI 3: Target (Sky Blue)
    name: 'blue',
    accent: '#38bdf8',
    accentText: 'text-[#38bdf8]',
    borderStyle: 'border-[#38bdf8]/45 border-t-[#38bdf8]/75 border-b-[#38bdf8]/90',
    blob1: 'from-[#38bdf8]/[0.22] via-[#0284c7]/[0.08] to-transparent',
    blob2: 'bg-[#38bdf8]/[0.12]',
    zapFilter: 'drop-shadow(0 0 10px rgba(56,189,248,0.90))',
    svgFilter: 'hue-rotate(25deg) saturate(1.3) drop-shadow(0 8px 35px rgba(56,189,248,0.32))',
  },
  {
    // KPI 4: Achievement (Radiant Berry / Rose)
    name: 'berry',
    accent: '#fb7185',
    accentText: 'text-[#fb7185]',
    borderStyle: 'border-[#fb7185]/45 border-t-[#fb7185]/75 border-b-[#fb7185]/90',
    blob1: 'from-[#f43f5e]/[0.22] via-[#e11d48]/[0.08] to-transparent',
    blob2: 'bg-[#fb7185]/[0.12]',
    zapFilter: 'drop-shadow(0 0 10px rgba(251,113,133,0.90))',
    svgFilter: 'hue-rotate(176deg) saturate(1.35) drop-shadow(0 8px 35px rgba(251,113,133,0.32))',
  },
  {
    // KPI 5: NOP (Amethyst Violet / Blend)
    name: 'violet',
    accent: '#c084fc',
    accentText: 'text-[#c084fc]',
    borderStyle: 'border-[#c084fc]/45 border-t-[#c084fc]/75 border-b-[#c084fc]/90',
    blob1: 'from-[#c084fc]/[0.22] via-[#a855f7]/[0.08] to-transparent',
    blob2: 'bg-[#c084fc]/[0.12]',
    zapFilter: 'drop-shadow(0 0 10px rgba(192,132,252,0.90))',
    svgFilter: 'hue-rotate(101deg) saturate(1.3) drop-shadow(0 8px 35px rgba(192,132,252,0.32))',
  },
]

function getRandomKpiTheme(excludeName?: string) {
  const pool = KPI_CARD_THEMES.filter((t) => t.name !== excludeName)
  return pool[Math.floor(Math.random() * pool.length)]
}

function LatestPaymentCarousel({
  deckCards,
  isPaymentTransitioning,
  isUpdating
}: {
  deckCards: any[]
  isPaymentTransitioning: boolean
  isUpdating: boolean
}) {
  return (
    <>
      {deckCards.map((item: any, index: number) => {
        let posStyles: React.CSSProperties = {}
        let cardClasses = ""
        let innerFilter = "blur(0px)"
        let innerOpacity = 1
        let innerTransition = "none"

        if (isPaymentTransitioning) {
          if (index === 0) {
            cardClasses = "pointer-events-none"
            posStyles = {
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: "translateY(-50px) scale(0.97)",
              opacity: 0,
              filter: "blur(5px)",
              zIndex: 30,
              willChange: "transform, opacity, filter",
              transition: "transform 1000ms cubic-bezier(0.25, 1, 0.5, 1), opacity 900ms cubic-bezier(0.3, 0, 0.5, 1) 150ms, filter 800ms ease-out",
            }
            innerFilter = "blur(3px)"
            innerOpacity = 0
            innerTransition = "opacity 850ms cubic-bezier(0.3, 0, 0.5, 1) 150ms, filter 700ms ease-out"
          } else if (index === 1) {
            cardClasses = "pointer-events-auto"
            posStyles = {
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: "scale(1)",
              opacity: 1,
              filter: "blur(0px)",
              zIndex: 20,
              willChange: "transform, opacity, filter",
              transition: "all 1000ms cubic-bezier(0.25, 1, 0.5, 1)",
            }
            innerFilter = "blur(0px)"
            innerOpacity = 1
            innerTransition = "filter 800ms cubic-bezier(0.25, 1, 0.5, 1)"
          } else if (index === 2) {
            cardClasses = "pointer-events-none"
            posStyles = {
              top: 18,
              left: 14,
              right: 14,
              bottom: -18,
              transform: "scale(0.96)",
              opacity: 0.88,
              filter: "blur(1.2px)",
              zIndex: 10,
              willChange: "transform, opacity, filter",
              transition: "all 1000ms cubic-bezier(0.25, 1, 0.5, 1)",
            }
          } else if (index === 3) {
            cardClasses = "pointer-events-none animate-simultaneous-third-card"
            posStyles = {
              top: 34,
              left: 26,
              right: 26,
              bottom: -34,
              transform: "scale(0.92)",
              opacity: 0.72,
              filter: "blur(4px)",
              zIndex: 0,
              willChange: "transform, opacity, filter",
            }
          }
        } else {
          if (index === 0) {
            posStyles = { 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              transform: "scale(1)", 
              opacity: 1, 
              filter: "blur(0px)", 
              zIndex: 20,
              willChange: "transform, opacity, filter",
            }
          } else if (index === 1) {
            posStyles = { 
              top: 18, 
              left: 14, 
              right: 14, 
              bottom: -18, 
              transform: "scale(0.96)", 
              opacity: 0.88, 
              filter: "blur(1.2px)", 
              zIndex: 10,
              willChange: "transform, opacity, filter",
            }
          } else if (index === 2) {
            posStyles = { 
              top: 34, 
              left: 26, 
              right: 26, 
              bottom: -34, 
              transform: "scale(0.92)", 
              opacity: 0.72, 
              filter: "blur(4px)", 
              zIndex: 0,
              willChange: "transform, opacity, filter",
            }
          }
        }

        const payment = item.payment
        const theme = item.theme || KPI_CARD_THEMES[0]

        return (
          <div
            key={item.id}
            style={posStyles}
            className={`absolute rounded-[28px] bg-[#0A0E17]/90 backdrop-blur-xl border ${theme.borderStyle} p-6 overflow-hidden flex flex-col justify-between shadow-xl shadow-black/10 ${index === 0 && !isPaymentTransitioning ? 'group/card' : ''} ${cardClasses}`}
          >
            {/* Atmospheric gradient curved swooshes */}
            <div className={`absolute top-0 right-1/4 w-[280px] h-[190px] rounded-full bg-gradient-to-br ${theme.blob1} blur-[65px] pointer-events-none`} />
            <div className={`absolute -bottom-10 right-10 w-[200px] h-[150px] rounded-full ${theme.blob2} blur-[60px] pointer-events-none`} />

            {/* Inner Content Wrapper */}
            <div 
              className="relative z-10 w-full h-full flex flex-col justify-between"
              style={{
                opacity: innerOpacity,
                filter: innerFilter,
                transition: innerTransition,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Zap 
                    className="w-5 h-5" 
                    style={{ 
                      color: theme.accent, 
                      fill: theme.accent, 
                      filter: theme.zapFilter 
                    }} 
                  />
                  <h2 className="font-poppins font-medium text-[18px] text-white tracking-wide">
                    Latest Payment
                  </h2>
                </div>
                <Link 
                  href="/payments" 
                  title="View All Payments"
                  className="flex items-center -translate-y-5 opacity-80 hover:opacity-100 transition-all"
                >
                  <div className="w-7 sm:w-8 h-1 rounded-full bg-white/20 overflow-hidden relative">
                    <div 
                      key={`${item.id}-${isPaymentTransitioning}`}
                      className={`h-full rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.75)] ${
                        index === 0 && !isPaymentTransitioning 
                          ? 'animate-timer-bar' 
                          : (index === 0 ? 'w-full' : 'w-0')
                      }`} 
                    />
                  </div>
                </Link>
              </div>

              {/* Middle Row: Amount on Left */}
              <div className="flex items-center justify-between gap-3 mt-2">
                <div className="flex flex-col z-10 min-w-0">
                  {isUpdating ? (
                    <div className="h-8 w-44 kpi-skeleton my-0.5 rounded-lg" />
                  ) : (
                    <span className="font-roboto text-[26px] sm:text-[28px] xl:text-[32px] font-bold text-white tracking-tight leading-none truncate kpi-value-fade">
                      {payment?.amount 
                        ? `₹${Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '₹59,433.56'}
                    </span>
                  )}
                  {isUpdating ? (
                    <div className="h-4 w-28 kpi-skeleton mt-2 rounded" />
                  ) : (
                    <span className={`font-poppins text-[13.5px] sm:text-[14px] ${theme.accentText} mt-2 truncate kpi-value-fade`}>
                      by {payment?.agent || 'Piyush Mittal'}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Bottom Credit Card Illustration */}
              <div className="absolute -right-3 -bottom-7 sm:-right-4 sm:-bottom-8 z-0 pointer-events-none select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/credit-card-amico.svg" 
                  alt="Credit Card Illustration" 
                  style={{ filter: theme.svgFilter }}
                  className={`w-[180px] h-[160px] sm:w-[150px] sm:h-[155px] xl:w-[168px] xl:h-[172px] object-contain ${index === 0 && !isPaymentTransitioning ? 'group-hover/card:scale-105' : ''} transition-transform duration-300 ease-out`}
                />
              </div>

              {/* Footer Row: Date & Relative Status */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-[13px] font-roboto text-[#94A3B8]">
                  <Calendar size={15} style={{ color: theme.accent }} />
                  {isUpdating ? (
                    <div className="h-3.5 w-20 kpi-skeleton rounded" />
                  ) : (
                    <span className="kpi-value-fade">{payment?.date || '2026-09-17'}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[13px] font-roboto text-[#94A3B8]">
                  <Clock size={15} className="text-[#94A3B8]" />
                  {isUpdating ? (
                    <div className="h-3.5 w-16 kpi-skeleton rounded" />
                  ) : (
                    <span className="kpi-value-fade">{Number(payment?.companyZeroDays || 0) === 0 ? "Today" : `${payment?.companyZeroDays} Days Ago`}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

interface DonutSegment {
  label: string
  value: number
  color: string
}

function DualRingDonutChart({
  outerSegments,
  innerSegments,
  totalLabel = "Total",
  size = 108,
  strokeWidth = 7.5,
  gapBetweenRings = 7,
  isUpdating = false,
}: {
  outerSegments: DonutSegment[]
  innerSegments: DonutSegment[]
  totalLabel?: string
  size?: number
  strokeWidth?: number
  gapBetweenRings?: number
  isUpdating?: boolean
}) {
  const outerRadius = (size - strokeWidth) / 2
  const innerRadius = outerRadius - strokeWidth - gapBetweenRings

  const outerCircumference = 2 * Math.PI * outerRadius
  const innerCircumference = 2 * Math.PI * innerRadius

  const outerTotal = outerSegments.reduce((sum, s) => sum + (Number(s.value) || 0), 0)
  const innerTotal = innerSegments.reduce((sum, s) => sum + (Number(s.value) || 0), 0)

  // Outer ring calculations
  const outerNonZero = outerSegments.filter(s => (Number(s.value) || 0) > 0)
  const outerVisualGap = outerNonZero.length > 1 ? 3.5 : 0
  const outerGapBetweenCaps = strokeWidth + outerVisualGap
  const outerAvailable = Math.max(0, outerCircumference - (outerGapBetweenCaps * outerNonZero.length))

  // Inner ring calculations
  const innerNonZero = innerSegments.filter(s => (Number(s.value) || 0) > 0)
  const innerVisualGap = innerNonZero.length > 1 ? 3.5 : 0
  const innerGapBetweenCaps = strokeWidth + innerVisualGap
  const innerAvailable = Math.max(0, innerCircumference - (innerGapBetweenCaps * innerNonZero.length))

  let outerOffset = 0
  let innerOffset = 0

  return (
    <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Outer track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={outerRadius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth={strokeWidth}
        />

        {/* Inner track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerRadius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth={strokeWidth}
        />

        {/* Outer Ring Segments */}
        {outerTotal > 0 &&
          outerSegments.map((seg, i) => {
            const val = Math.max(0, Number(seg.value) || 0)
            if (val <= 0) return null

            const rawStrokeLength = (val / outerTotal) * outerAvailable
            const strokeLength = Math.max(0.1, rawStrokeLength)
            const strokeDasharray = `${strokeLength} ${outerCircumference - strokeLength}`
            const strokeDashoffset = -(outerOffset + strokeWidth / 2)
            outerOffset += strokeLength + outerGapBetweenCaps

            return (
              <circle
                key={`outer-${i}`}
                cx={size / 2}
                cy={size / 2}
                r={outerRadius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            )
          })}

        {/* Inner Ring Segments */}
        {innerTotal > 0 &&
          innerSegments.map((seg, i) => {
            const val = Math.max(0, Number(seg.value) || 0)
            if (val <= 0) return null

            const rawStrokeLength = (val / innerTotal) * innerAvailable
            const strokeLength = Math.max(0.1, rawStrokeLength)
            const strokeDasharray = `${strokeLength} ${innerCircumference - strokeLength}`
            const strokeDashoffset = -(innerOffset + strokeWidth / 2)
            innerOffset += strokeLength + innerGapBetweenCaps

            return (
              <circle
                key={`inner-${i}`}
                cx={size / 2}
                cy={size / 2}
                r={innerRadius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            )
          })}
      </svg>

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        {isUpdating ? (
          <div className="h-4 w-7 kpi-skeleton rounded my-0.5" />
        ) : (
          <span className="font-roboto font-bold text-[18px] sm:text-[19px] text-white leading-none tracking-tight">
            {outerTotal || innerTotal || 55}
          </span>
        )}
        <span className="font-poppins text-[9.5px] text-white/50 font-medium leading-none mt-0.5">
          {totalLabel}
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [displayMonth, setDisplayMonth] = useState<string>('')
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [transitionState, setTransitionState] = useState<{
    outgoing: string
    incoming: string
    direction: 'backward' | 'forward'
  } | null>(null)
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'zero' | 'below50' | 'above50'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const headerInnerRef = useRef<HTMLDivElement>(null)
  const headerTitleRef = useRef<HTMLHeadingElement>(null)

  // Dynamic Real-time Header Adjustment Locked to Scroll Progress (0px to 80px)
  useEffect(() => {
    const mainEl = document.querySelector('main')
    let rafId: number | null = null

    const updateHeader = () => {
      const scrollPos = mainEl ? mainEl.scrollTop : window.scrollY
      const progress = Math.min(1, Math.max(0, scrollPos / 80))
      const isMobile = window.innerWidth < 640

      if (headerRef.current) {
        headerRef.current.style.backgroundColor = `rgba(8, 11, 17, ${(progress * 0.85).toFixed(3)})`
        headerRef.current.style.borderBottomColor = `rgba(255, 255, 255, ${(progress * 0.06).toFixed(3)})`
        const blurAmount = progress * 20
        const blurValue = progress > 0.02 ? `blur(${blurAmount.toFixed(1)}px)` : 'none'
        headerRef.current.style.backdropFilter = blurValue
        headerRef.current.style.setProperty('-webkit-backdrop-filter', blurValue)
        headerRef.current.style.boxShadow = progress > 0.1 ? `0 10px 30px -10px rgba(0, 0, 0, ${(progress * 0.4).toFixed(3)})` : 'none'
      }

      if (headerInnerRef.current) {
        const pt = isMobile ? 12 - progress * 4 : 42 - progress * 29
        const pb = isMobile ? 7 + progress * 2 : 10 + progress * 3
        headerInnerRef.current.style.paddingTop = `${pt.toFixed(1)}px`
        headerInnerRef.current.style.paddingBottom = `${pb.toFixed(1)}px`
      }

      if (headerTitleRef.current) {
        const fontSize = isMobile ? 21 - progress * 2 : 28 - progress * 8
        headerTitleRef.current.style.fontSize = `${fontSize.toFixed(1)}px`
      }
    }

    const onScroll = () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateHeader)
    }

    if (mainEl) {
      mainEl.addEventListener('scroll', onScroll, { passive: true })
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    updateHeader()

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (mainEl) {
        mainEl.removeEventListener('scroll', onScroll)
      }
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // 3D Stacked Carousel State for Latest Payments (Queue-based seamless 3-card stack)
  const paymentsList = useMemo(() => {
    const raw = data?.recentPayments && data.recentPayments.length > 0
      ? data.recentPayments
      : (data?.paymentInfo ? [data.paymentInfo] : [])

    const p0 = raw[0] || { amount: 59433.56, agent: 'Piyush Mittal', date: '2026-09-17', companyZeroDays: 2 }
    const p1 = raw[1] || { amount: 84250.00, agent: 'Rohit Sharma', date: '2026-09-16', companyZeroDays: 3 }
    const p2 = raw[2] || { amount: 42190.20, agent: 'Anjali Verma', date: '2026-09-15', companyZeroDays: 4 }

    return [p0, p1, p2]
  }, [JSON.stringify(data?.recentPayments), JSON.stringify(data?.paymentInfo)])

  // Top 5 Agents Leaderboard Data from backend with fallback
  const topAgentsList = useMemo(() => {
    if (data?.topAgents && Array.isArray(data.topAgents) && data.topAgents.length > 0) {
      return data.topAgents.slice(0, 5)
    }
    return [
      { name: 'Piyush Mittal', score: 285400, nop: 8, percent: 142.7 },
      { name: 'Rohit Sharma', score: 241200, nop: 6, percent: 120.6 },
      { name: 'Anjali Verma', score: 218900, nop: 5, percent: 109.4 },
      { name: 'Vikas Kumar', score: 195000, nop: 5, percent: 97.5 },
      { name: 'Sunita Rao', score: 182300, nop: 4, percent: 91.1 },
    ]
  }, [JSON.stringify(data?.topAgents)])

  interface DeckCardItem {
    id: number
    payment: {
      amount: number | string
      agent: string
      date: string
      companyZeroDays: number
    }
    theme: typeof KPI_CARD_THEMES[0]
  }

  const nextCardIdRef = useRef(3)
  const cycleIndexRef = useRef(3)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [deckCards, setDeckCards] = useState<DeckCardItem[]>(() => {
    const t0 = getRandomKpiTheme()
    const t1 = getRandomKpiTheme(t0.name)
    const t2 = getRandomKpiTheme(t1.name)
    return [
      { id: 0, payment: { amount: 59433.56, agent: 'Piyush Mittal', date: '2026-09-17', companyZeroDays: 2 }, theme: t0 },
      { id: 1, payment: { amount: 84250.00, agent: 'Rohit Sharma', date: '2026-09-16', companyZeroDays: 3 }, theme: t1 },
      { id: 2, payment: { amount: 42190.20, agent: 'Anjali Verma', date: '2026-09-15', companyZeroDays: 4 }, theme: t2 },
    ]
  })
  const [isPaymentTransitioning, setIsPaymentTransitioning] = useState(false)

  // Sync deckCards when paymentsList updates while preserving existing card colors/themes
  useEffect(() => {
    if (paymentsList.length > 0) {
      setDeckCards((prev) => {
        if (prev.length >= 3) {
          // Keep existing card themes and colors, only update payment data
          return prev.map((card, i) => ({
            ...card,
            payment: paymentsList[i % paymentsList.length] || card.payment,
          }))
        }
        const t0 = getRandomKpiTheme()
        const t1 = getRandomKpiTheme(t0.name)
        const t2 = getRandomKpiTheme(t1.name)
        return [
          { id: nextCardIdRef.current++, payment: paymentsList[0], theme: t0 },
          { id: nextCardIdRef.current++, payment: paymentsList[1], theme: t1 },
          { id: nextCardIdRef.current++, payment: paymentsList[2], theme: t2 },
        ]
      })
    }
  }, [paymentsList])

  // Continuous seamless auto-cycle: 5s display + 1s transition
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const runCycle = () => {
      // Step 1: Wait full 5000ms for current card display & timer bar completion
      timeoutId = setTimeout(() => {
        const nextPayment = paymentsList[cycleIndexRef.current % paymentsList.length]
        cycleIndexRef.current += 1
        const incomingId = nextCardIdRef.current++

        // Step 2: Trigger transition exactly as the 5s bar reaches 100%
        setDeckCards((prev) => {
          if (prev.length !== 3) return prev
          const lastTheme = prev[prev.length - 1]?.theme?.name
          const incomingTheme = getRandomKpiTheme(lastTheme)
          return [...prev, { id: incomingId, payment: nextPayment, theme: incomingTheme }]
        })
        setIsPaymentTransitioning(true)

        // Step 3: Complete transition after 1000ms and start the next 5s cycle
        timeoutId = setTimeout(() => {
          setDeckCards((prev) => {
            if (prev.length > 3) {
              return prev.slice(1)
            }
            return prev
          })
          setIsPaymentTransitioning(false)
          runCycle()
        }, 1000)
      }, 5000)
    }

    runCycle()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [paymentsList])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Clear transition after animation duration
  useEffect(() => {
    if (transitionState) {
      const timer = setTimeout(() => {
        setTransitionState(null)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [transitionState])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMonthDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (data) {
      setIsUpdating(true)
    } else {
      setLoading(true)
    }
    const startTime = Date.now()
    const url = selectedMonth 
      ? `/api/dashboard?month=${selectedMonth}` 
      : '/api/dashboard'
      
    fetch(url)
      .then(res => res.json())
      .then(json => {
        const elapsed = Date.now() - startTime
        const minSkeletonTime = 450
        const delay = Math.max(0, minSkeletonTime - elapsed)
        setTimeout(() => {
          setData(json)
          if (!displayMonth && json.currentMonth) {
            setDisplayMonth(formatMMMYY(json.currentMonth))
          }
          setLoading(false)
          setIsUpdating(false)
        }, delay)
      })
      .catch(err => {
        console.error("Failed to fetch dashboard data:", err)
        setLoading(false)
        setIsUpdating(false)
      })
  }, [selectedMonth])

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] text-[#94A3B8]">
        <div className="w-12 h-12 rounded-full border-2 border-[#14B8A6] border-t-transparent animate-spin mb-4"></div>
        <p className="font-poppins text-sm font-semibold tracking-wider text-white">
          Welcome Back, Admin
        </p>
        <p className="font-roboto text-xs text-[#64748B] mt-1">Loading Performance Intelligence...</p>
      </div>
    )
  }

  if (!data || data.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] text-red-400">
        <p className="font-poppins text-base font-semibold mb-2">Failed to load dashboard data.</p>
        <p className="font-roboto text-xs text-[#64748B]">{data?.error || "Make sure the Python backend is running."}</p>
        <button 
          onClick={() => setSelectedMonth(null)}
          className="mt-4 px-4 py-2 bg-[#0F766E] text-white font-poppins text-xs font-semibold rounded-2xl hover:bg-[#115E59] transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const activeMonthDisplay = displayMonth || (data?.currentMonth ? formatMMMYY(data.currentMonth) : 'Sep 26')

  const isCurrentMonth = data?.availableMonths
    ? (displayMonth ? displayMonth === formatMMMYY(data.availableMonths[0].name) : (!selectedMonth || (data.selectedMonthIndex ?? 0) <= 0))
    : true

  const handlePrevMonth = () => {
    if (data?.availableMonths && data.selectedMonthIndex < data.availableMonths.length - 1) {
      setIsUpdating(true)
      const nextMonthObj = data.availableMonths[data.selectedMonthIndex + 1]
      const incomingText = formatMMMYY(nextMonthObj.name)
      const outgoingText = activeMonthDisplay
      setTransitionState({
        outgoing: outgoingText,
        incoming: incomingText,
        direction: 'backward'
      })
      setDisplayMonth(incomingText)
      setSelectedMonth(nextMonthObj.date)
    }
  }

  const handleNextMonth = () => {
    if (data?.availableMonths && data.selectedMonthIndex > 0) {
      setIsUpdating(true)
      const nextMonthObj = data.availableMonths[data.selectedMonthIndex - 1]
      const incomingText = formatMMMYY(nextMonthObj.name)
      const outgoingText = activeMonthDisplay
      setTransitionState({
        outgoing: outgoingText,
        incoming: incomingText,
        direction: 'forward'
      })
      setDisplayMonth(incomingText)
      setSelectedMonth(nextMonthObj.date)
    }
  }

  const handleSelectMonth = (mDate: string, mName: string) => {
    const incomingText = formatMMMYY(mName)
    if (activeMonthDisplay !== incomingText) {
      setIsUpdating(true)
      const currentIdx = data?.selectedMonthIndex ?? 0
      const targetIdx = data?.availableMonths?.findIndex((m: any) => m.date === mDate) ?? 0
      const dir = targetIdx > currentIdx ? 'backward' : 'forward'
      setTransitionState({
        outgoing: activeMonthDisplay,
        incoming: incomingText,
        direction: dir
      })
      setDisplayMonth(incomingText)
      setSelectedMonth(mDate)
    }
    setMonthDropdownOpen(false)
  }

  const chartData = (() => {
    const rawList = (data?.trendData && data.trendData.length > 0)
      ? data.trendData.map((d: any) => ({
          name: d.name ? d.name.slice(0, 3) : (d.month ? d.month.slice(0, 3) : ''),
          fullMonth: d.month || d.name,
          achievement: Number(Number(d.achievement || 0).toFixed(1)),
          score: Number(d.score || 0),
          target: Number(d.target || 0),
          date: d.date || '',
        }))
      : [
          { name: 'May', achievement: 0, score: 0, target: 0, fullMonth: 'May', date: '2026-05-01' },
          { name: 'Jun', achievement: 0, score: 0, target: 0, fullMonth: 'June', date: '2026-06-01' },
          { name: 'Jul', achievement: 0, score: 0, target: 0, fullMonth: 'July', date: '2026-07-01' },
          { name: 'Aug', achievement: 0, score: 0, target: 0, fullMonth: 'August', date: '2026-08-01' },
          { name: 'Sep', achievement: Number(data?.kpis?.achievement || 0), score: Number(data?.kpis?.score || 0), target: Number(data?.kpis?.target || 0), fullMonth: 'September', date: '2026-09-01' }
        ]

    // Identify the active month strictly from backend response so graph updates only after backend data arrives
    const backendMonthDate = data?.availableMonths?.[data?.selectedMonthIndex]?.date || ''
    const backendMonthName = data?.availableMonths?.[data?.selectedMonthIndex]?.name || data?.currentMonth || ''
    const activePrefix = (backendMonthName ? formatMMMYY(backendMonthName) : (activeMonthDisplay || '')).trim().slice(0, 3).toLowerCase()

    const targetIdx = rawList.findIndex((item: any) => {
      if (backendMonthDate && item.date) {
        if (item.date === backendMonthDate || item.date.slice(0, 7) === backendMonthDate.slice(0, 7)) {
          return true
        }
      }
      const itemShort = (item.name || '').toLowerCase()
      const itemFull = (item.fullMonth || '').toLowerCase()
      return activePrefix && (itemShort.startsWith(activePrefix) || itemFull.startsWith(activePrefix))
    })

    if (targetIdx !== -1) {
      let sliced = rawList.slice(0, targetIdx + 1)
      if (data?.kpis?.achievement !== undefined && sliced.length > 0) {
        sliced[sliced.length - 1].achievement = Number(Number(data.kpis.achievement || 0).toFixed(1))
      }
      // Maximum 5 months record at a time
      if (sliced.length > 5) {
        sliced = sliced.slice(-5)
      }
      return sliced
    }

    return rawList.slice(-5)
  })()

  const renderTrendXAxisTick = (props: any) => {
    const { x, y, payload } = props
    if (isUpdating) {
      return (
        <foreignObject x={x - 16} y={y + 5} width="32" height="12">
          <div className="w-full h-full kpi-skeleton rounded-[4px]" />
        </foreignObject>
      )
    }
    return (
      <text
        x={x}
        y={y + 12}
        textAnchor="middle"
        fill="#64748B"
        fontSize={11}
        fontFamily="Poppins"
      >
        {payload?.value || ''}
      </text>
    )
  }

  // Milestone statistics referenced against all agents
  const totalAgents = Number(data?.kpis?.totalAgents || 0)
  const targetClearedCount = Number(data?.milestones?.targetCleared ?? 0)
  const justClearedCount = Number(data?.milestones?.justificationCleared ?? 0)
  const justPendingCount = Number(data?.milestones?.justificationPending ?? data?.milestones?.justLeft ?? 0)
  const zeroCount = Number(data?.milestones?.zeroPerformers ?? 0)

  const targetPct = totalAgents > 0 ? Math.round((targetClearedCount / totalAgents) * 100) : 0
  const justClearedPct = totalAgents > 0 ? Math.round((justClearedCount / totalAgents) * 100) : 0
  const justPendingPct = totalAgents > 0 ? Math.round((justPendingCount / totalAgents) * 100) : 0
  const zeroPct = totalAgents > 0 ? Math.round((zeroCount / totalAgents) * 100) : 0

  // Last month comparison values for milestone flip cards
  const lastMonthName = data?.lastMonth?.month || "Last Month"
  const lmTotalAgents = Number(data?.lastMonth?.milestones?.totalAgents || totalAgents)
  const lmTargetCleared = Number(data?.lastMonth?.milestones?.targetCleared ?? 0)
  const lmJustCleared = Number(data?.lastMonth?.milestones?.justificationCleared ?? 0)
  const lmJustPending = Number(data?.lastMonth?.milestones?.justificationPending ?? data?.lastMonth?.milestones?.justLeft ?? 0)
  const lmZeroCount = Number(data?.lastMonth?.milestones?.zeroPerformers ?? 0)

  // Last month percentages and percentage gaps for comparison
  const lmTargetPct = lmTotalAgents > 0 ? Math.round((lmTargetCleared / lmTotalAgents) * 100) : 0
  const lmJustClearedPct = lmTotalAgents > 0 ? Math.round((lmJustCleared / lmTotalAgents) * 100) : 0
  const lmJustPendingPct = lmTotalAgents > 0 ? Math.round((lmJustPending / lmTotalAgents) * 100) : 0
  const lmZeroPct = lmTotalAgents > 0 ? Math.round((lmZeroCount / lmTotalAgents) * 100) : 0

  const targetPctDiff = targetPct - lmTargetPct
  const justClearedPctDiff = justClearedPct - lmJustClearedPct
  const justPendingPctDiff = justPendingPct - lmJustPendingPct
  const zeroPctDiff = zeroPct - lmZeroPct

  // Dynamic NOP Breakdown data
  const multiYearNop = data?.kpis?.multiYearNop !== undefined ? Number(data.kpis.multiYearNop) : 0
  const singleYearNop = data?.kpis?.singleYearNop !== undefined ? Number(data.kpis.singleYearNop) : 0
  const totalNop = multiYearNop + singleYearNop

  // Dynamic Payment Brackets data
  const below50k = data?.kpis?.below50k !== undefined ? Number(data.kpis.below50k) : 0
  const between50k1L = data?.kpis?.between50k1L !== undefined ? Number(data.kpis.between50k1L) : 0
  const above1L = data?.kpis?.above1L !== undefined ? Number(data.kpis.above1L) : 0
  const totalBrackets = below50k + between50k1L + above1L

  // Team Leaders default portrait avatars matching screenshot
  const TL_AVATARS = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
  ]

  // Team Leaders data with fallback matching image
  const teamLeadersList = (data?.teamLeaders && Array.isArray(data.teamLeaders) && data.teamLeaders.length > 0)
    ? data.teamLeaders.slice(0, 5).map((tl: any, i: number) => ({
        ...tl,
        avatar: tl.avatar || TL_AVATARS[i % TL_AVATARS.length],
      }))
    : [
        { name: 'Akash Keshav', percent: 75, avatar: TL_AVATARS[0] },
        { name: 'Ujjwal Kashyap', percent: 34, avatar: TL_AVATARS[1] },
        { name: 'Sayyad Abdul', percent: 32, avatar: TL_AVATARS[2] },
        { name: 'Rajan', percent: 31, avatar: TL_AVATARS[3] },
        { name: 'Sameer', percent: 27, avatar: TL_AVATARS[4] },
      ]

  // All Agents Performance Records data
  const allAgentsList = (data?.allAgents && Array.isArray(data.allAgents) && data.allAgents.length > 0)
    ? data.allAgents
    : []

  // Helper function to format date to DD/MM/YY
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'N/A'
    try {
      const date = new Date(dateString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = String(date.getFullYear()).slice(-2)
      return `${day}/${month}/${year}`
    } catch {
      return 'N/A'
    }
  }

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['Agent', 'Team', 'Target', 'Score', 'NOP', 'Ach%', 'Pay Date', 'Aging', 'Pay Amt', 'Single', 'Multi', 'Disc Amt', 'Disc #']
    const rows = filteredAgentsList.map((agent: any) => [
      agent.name,
      agent.team,
      Number(agent.target || 0),
      Number(agent.score || 0),
      agent.nop || 0,
      Number(agent.percent || 0).toFixed(1) + '%',
      formatDate(agent.lastPaymentDate),
      agent.paymentAging || 0,
      agent.lastPaymentAmount > 0 ? Number(agent.lastPaymentAmount) : 0,
      agent.singleYrCount || 0,
      agent.multiYrCount || 0,
      agent.discountAmount > 0 ? Number(agent.discountAmount) : 0,
      agent.discountCount || 0
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row: (string | number)[]) => row.map((cell: string | number) => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `agent_performance_${activeMonthDisplay}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter agents based on achievement
  const filteredAgentsList = allAgentsList.filter((agent: any) => {
    const ach = Number(agent.percent || 0)
    switch (achievementFilter) {
      case 'zero':
        return ach === 0
      case 'below50':
        return ach > 0 && ach < 50
      case 'above50':
        return ach >= 50
      default:
        return true
    }
  }).sort((a: any, b: any) => Number(b.percent || 0) - Number(a.percent || 0))

  // Last Month card data with fallback matching image
  const lastMonthCardData = {
    month: data?.lastMonth?.month || 'August',
    score: data?.lastMonth?.score !== undefined ? Number(data.lastMonth.score) : 3279000,
    achievement: data?.lastMonth?.achievement !== undefined ? Number(data.lastMonth.achievement) : 79.1,
    discountDelivered: data?.lastMonth?.discountDelivered !== undefined ? Number(data.lastMonth.discountDelivered) : 40000,
    discountCount: data?.lastMonth?.discountCount !== undefined ? Number(data.lastMonth.discountCount) : 14,
    paymentCount: data?.lastMonth?.paymentCount !== undefined ? Number(data.lastMonth.paymentCount) : 120,
    paymentChangePercent: data?.lastMonth?.paymentChangePercent !== undefined ? Number(data.lastMonth.paymentChangePercent) : 12,
    topAgent: {
      name: data?.lastMonth?.topAgent?.name || 'Amardeep',
      percent: data?.lastMonth?.topAgent?.percent !== undefined ? Number(data.lastMonth.topAgent.percent) : 271,
    },
    topTeamLeader: {
      name: data?.lastMonth?.topTeamLeader?.name || 'Ujjwal Kashyap',
      percent: data?.lastMonth?.topTeamLeader?.percent !== undefined ? Number(data.lastMonth.topTeamLeader.percent) : 118,
    },
  }

  return (
    <div className="w-full min-w-0 relative">
      {/* ============ STICKY TOP HEADER (CONTINUOUS PROGRESSIVE ADJUSTMENT) ============ */}
      <header 
        ref={headerRef}
        className="sticky top-0 z-40 w-full border-b header-transition will-change-[background-color,backdrop-filter,border-color]"
        style={{
          backgroundColor: 'rgba(8, 11, 17, 0)',
          borderBottomColor: 'rgba(255, 255, 255, 0)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
        }}
      >
        <div 
          ref={headerInnerRef}
          className="max-w-[1580px] mx-auto px-3 sm:px-7 lg:px-9 flex items-center justify-between gap-2 sm:gap-3 header-transition will-change-[padding]"
          style={{
            paddingTop: '12px',
            paddingBottom: '7px',
          }}
        >
          <div>
            <h1 
              ref={headerTitleRef}
              className="font-poppins tracking-normal leading-none flex items-center gap-1.5 sm:gap-2 origin-left header-title-transition will-change-[font-size]"
              style={{
                fontSize: '21px',
              }}
            >
              <span className="silver-shimmer-text font-normal">Welcome Back,</span>
              <span className="admin-gradient-text font-semibold">Admin</span>
            </h1>
          </div>

          {/* Top-Right Month Filter with Circular Buttons */}
          <div className="relative flex items-center gap-2" ref={dropdownRef}>
            {/* Circular Previous Month Button with Smooth Spring Animation */}
            <button 
              onClick={handlePrevMonth}
              disabled={!data.availableMonths || data.selectedMonthIndex >= data.availableMonths.length - 1}
              className="btn-tactile w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/[0.08] hover:border-white/20 disabled:opacity-20 disabled:hover:text-[#94A3B8] disabled:pointer-events-none transition-all duration-200"
              title="Previous Month"
            >
              <ChevronLeft size={16} className="icon-tactile" />
            </button>

            {/* Middle Month Area with In-Place Scrollable Dropdown between the two buttons */}
            <div className="relative flex items-center justify-center">
              {/* Month Button (Transparent BG & Border with Simultaneous Slide & Scale Transition) */}
              <button
                onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
                className="group relative flex items-center justify-center h-8 sm:h-9 px-1 w-[76px] sm:w-[88px] overflow-hidden bg-transparent border border-transparent hover:text-[#2DD4BF] active:scale-95 transition-all duration-150"
              >
                {transitionState ? (
                  <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                    {/* Outgoing Month: Fades out and scales down */}
                    <span 
                        className={`absolute font-poppins text-[13px] sm:text-[15px] font-regular text-white text-center whitespace-nowrap tracking-wide ${
                        transitionState.direction === 'backward' 
                          ? 'animate-month-exit-backward' 
                          : 'animate-month-exit-forward'
                      }`}
                    >
                      {transitionState.outgoing}
                    </span>
                    {/* Incoming Month: Slides from right to left, scales up and fades in simultaneously */}
                    <span 
                        className={`absolute font-poppins text-[13px] sm:text-[15px] font-regular text-white text-center whitespace-nowrap tracking-wide ${
                        transitionState.direction === 'backward' 
                          ? 'animate-month-enter-backward' 
                          : 'animate-month-enter-forward'
                      }`}
                    >
                      {transitionState.incoming}
                    </span>
                  </div>
                ) : (
                  <span className="font-poppins text-[13px] sm:text-[15px] font-regular text-white text-center whitespace-nowrap tracking-wide">
                    {activeMonthDisplay}
                  </span>
                )}
              </button>

              {/* In-Place Scrollable Month Dropdown: Opens on top of the month, between the two buttons */}
              {monthDropdownOpen && (
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[102px] bg-[#0F1623]/80 backdrop-blur-xl border border-white/[0.10] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="overflow-y-auto max-h-[196px] py-1 px-1 flex flex-col gap-0.5 dropdown-scrollbar">
                    {data.availableMonths?.map((m: any) => {
                      const isSelected = activeMonthDisplay === formatMMMYY(m.name)
                      return (
                        <button
                          key={m.date}
                          onClick={() => handleSelectMonth(m.date, m.name)}
                          className={`w-full py-1.5 text-[14px] font-poppins rounded-xl text-center whitespace-nowrap transition-colors ${
                            isSelected
                              ? 'bg-[#0F766E]/40 text-[#2DD4BF] font-semibold'
                              : 'text-[#94A3B8] hover:bg-white/[0.08] hover:text-white font-normal'
                          }`}
                        >
                          {formatMMMYY(m.name)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Circular Next Month Button - Smooth Transition to Hide on Current Month */}
            <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out flex items-center justify-center ${
                isCurrentMonth 
                  ? 'w-0 max-w-0 opacity-0 scale-75 -ml-2 pointer-events-none' 
                  : 'w-9 max-w-[36px] opacity-100 scale-100 ml-0 pointer-events-auto'
              }`}
            >
              <button 
                onClick={handleNextMonth}
                tabIndex={isCurrentMonth ? -1 : 0}
                className="btn-tactile w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200"
                title="Next Month"
              >
                <ChevronRight size={16} className="icon-tactile" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============ MAIN DASHBOARD CONTENT ============ */}
      <div className="relative px-4 sm:px-7 lg:px-9 pb-7 lg:pb-9 pt-2 space-y-6 max-w-[1580px] mx-auto bg-transparent">

      {/* SVG linear gradients for vibrant radiant KPI icons */}
      <svg className="w-0 h-0 absolute pointer-events-none" aria-hidden="true">
        <defs>
          <linearGradient id="kpiGradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#ddd6fe" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="kpiGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="kpiGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="kpiGradBerry" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fbcfe8" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
          <linearGradient id="kpiGradBlend" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#f5d0fe" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="kpiGradGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>

      {/* ============ TOP ROW: 5 TRANSPARENT KPI CARDS ============ */}
      <section className="pt-0 pb-6 lg:pt-0 lg:pb-8 mb-8 lg:mb-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 xl:gap-4">
        {/* Card 1: Final Premium (#4d1bb5 vibrant) */}
        <div className="relative h-[80px] p-4 pr-5 flex items-center justify-between rounded-br-[24px] overflow-hidden bg-transparent transition-all duration-300 group">
          <CornerBorderBeam color="#a78bfa" glowKey="purple" delay={0} />
          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4d1bb5] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(139,92,246,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full rounded-full glass-icon-circle glass-delay-1 bg-gradient-to-br from-[#8b5cf6]/40 via-[#7c3aed]/35 to-[#4d1bb5]/50 flex items-center justify-center backdrop-blur-md">
              <Award size={22} style={{ stroke: 'url(#kpiGradPurple)' }} strokeWidth={2.2} className="drop-shadow-[0_2px_8px_rgba(167,139,250,0.7)]" />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            {isUpdating ? (
              <div className="h-7 w-24 kpi-skeleton my-0.5" />
            ) : (
              <span className="font-roboto text-[24px] xl:text-[26px] font-bold text-white leading-none kpi-value-fade">
                {formatLakhs(data.kpis.score)}
              </span>
            )}
            <span className="font-poppins text-xs font-medium text-[#a78bfa] mt-1.5">
              Final Premium
            </span>
          </div>
        </div>

        {/* Card 2: Gross Premium (#016130 vibrant) */}
        <div className="relative h-[80px] p-4 pr-5 flex items-center justify-between rounded-br-[24px] overflow-hidden bg-transparent transition-all duration-300 group">
          <CornerBorderBeam color="#34d399" glowKey="green" delay={0.6} />
          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-br from-[#6ee7b7] via-[#10b981] to-[#016130] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(16,185,129,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full rounded-full glass-icon-circle glass-delay-2 bg-gradient-to-br from-[#10b981]/40 via-[#059669]/35 to-[#016130]/50 flex items-center justify-center backdrop-blur-md">
              <IndianRupee size={22} style={{ stroke: 'url(#kpiGradGreen)' }} strokeWidth={2.2} className="drop-shadow-[0_2px_8px_rgba(52,211,153,0.7)]" />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            {isUpdating ? (
              <div className="h-7 w-24 kpi-skeleton my-0.5" />
            ) : (
              <span className="font-roboto text-[24px] xl:text-[26px] font-bold text-white leading-none kpi-value-fade">
                {formatLakhs(data.kpis.gross)}
              </span>
            )}
            <span className="font-poppins text-xs font-medium text-[#34d399] mt-1.5">
              Gross Premium
            </span>
          </div>
        </div>

        {/* Card 3: Target (#0256a5 vibrant) */}
        <div className="relative h-[80px] p-4 pr-5 flex items-center justify-between rounded-br-[24px] overflow-hidden bg-transparent transition-all duration-300 group">
          <CornerBorderBeam color="#38bdf8" glowKey="blue" delay={1.2} />
          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-br from-[#7dd3fc] via-[#38bdf8] to-[#0256a5] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(56,189,248,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full rounded-full glass-icon-circle glass-delay-3 bg-gradient-to-br from-[#38bdf8]/40 via-[#0284c7]/35 to-[#0256a5]/50 flex items-center justify-center backdrop-blur-md">
              <Target size={22} style={{ stroke: 'url(#kpiGradBlue)' }} strokeWidth={2.2} className="drop-shadow-[0_2px_8px_rgba(56,189,248,0.7)]" />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            {isUpdating ? (
              <div className="h-7 w-24 kpi-skeleton my-0.5" />
            ) : (
              <span className="font-roboto text-[24px] xl:text-[26px] font-bold text-white leading-none kpi-value-fade">
                {formatLakhs(data.kpis.target)}
              </span>
            )}
            <span className="font-poppins text-xs font-medium text-[#38bdf8] mt-1.5">
              Target
            </span>
          </div>
        </div>

        {/* Card 4: Achievement (#8f244c vibrant) */}
        <div className="relative h-[80px] p-4 pr-5 flex items-center justify-between rounded-br-[24px] overflow-hidden bg-transparent transition-all duration-300 group">
          <CornerBorderBeam color="#fb7185" glowKey="berry" delay={1.8} />
          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-br from-[#fda4af] via-[#f43f5e] to-[#8f244c] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(244,63,94,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full rounded-full glass-icon-circle glass-delay-4 bg-gradient-to-br from-[#f43f5e]/40 via-[#e11d48]/35 to-[#8f244c]/50 flex items-center justify-center backdrop-blur-md">
              <TrendingUp size={22} style={{ stroke: 'url(#kpiGradBerry)' }} strokeWidth={2.2} className="drop-shadow-[0_2px_8px_rgba(251,113,133,0.7)]" />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            {isUpdating ? (
              <div className="h-7 w-16 kpi-skeleton my-0.5" />
            ) : (
              <span className="font-roboto text-[24px] xl:text-[26px] font-bold text-white leading-none kpi-value-fade">
                {Number(data.kpis.achievement || 0).toFixed(1)}%
              </span>
            )}
            <span className="font-poppins text-xs font-medium text-[#fb7185] mt-1.5">
              Achievement
            </span>
          </div>
        </div>

        {/* Card 5: NOP (Vibrant blend) */}
        <div className="relative h-[80px] p-4 pr-5 flex items-center justify-between rounded-br-[24px] overflow-hidden bg-transparent transition-all duration-300 group">
          <CornerBorderBeam color="#c084fc" glowKey="blend" delay={2.4} />
          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-br from-[#f0abfc] via-[#c084fc] to-[#8f244c] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(192,132,252,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full rounded-full glass-icon-circle glass-delay-5 bg-gradient-to-br from-[#c084fc]/40 via-[#a855f7]/35 to-[#8f244c]/50 flex items-center justify-center backdrop-blur-md">
              <CheckCircle2 size={22} style={{ stroke: 'url(#kpiGradBlend)' }} strokeWidth={2.2} className="drop-shadow-[0_2px_8px_rgba(192,132,252,0.7)]" />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            {isUpdating ? (
              <div className="h-7 w-20 kpi-skeleton my-0.5" />
            ) : (
              <span className="font-roboto text-[24px] xl:text-[26px] font-bold text-white leading-none kpi-value-fade">
                {data.kpis.nop} Nop
              </span>
            )}
            <span className="font-poppins text-xs font-medium text-[#c084fc] mt-1.5">
              No. Of Payments
            </span>
          </div>
        </div>
      </section>

      {/* ============ COMPANY ACHIEVEMENT TREND & LATEST PAYMENT SECTION ============ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Card 1: Company Achievement Trend (8 cols) */}
        <div className="lg:col-span-8 p-4 sm:p-6 relative flex flex-col justify-between min-h-[280px]">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -left-10 w-[260px] h-[190px] rounded-full bg-[#0284c7]/[0.08] blur-[70px] pointer-events-none" />
          <div className="absolute -bottom-10 right-10 w-[220px] h-[150px] rounded-full bg-[#10b981]/[0.05] blur-[60px] pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between -translate-y-2 -translate-x-1 sm:-translate-x-2 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-br from-[#7dd3fc] via-[#38bdf8] to-[#0256a5] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(56,189,248,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
                <div className="w-full h-full rounded-full glass-icon-circle bg-gradient-to-br from-[#38bdf8]/40 via-[#0284c7]/35 to-[#0256a5]/50 flex items-center justify-center backdrop-blur-md">
                  <TrendingUp size={20} style={{ stroke: 'url(#kpiGradBlue)' }} strokeWidth={2.2} className="drop-shadow-[0_2px_8px_rgba(56,189,248,0.7)]" />
                </div>
              </div>
              <h2 className="font-poppins font-medium text-[18px] text-white tracking-wide">
                Company Achievement Trend
              </h2>
            </div>
            {isUpdating ? (
              <div className="h-6 w-20 kpi-skeleton rounded-full" />
            ) : (
              <span className="font-poppins text-xs font-semibold text-[#38bdf8] bg-[#0284c7]/10 px-2.5 py-1 rounded-full border border-[#38bdf8]/20 kpi-value-fade">
                {activeMonthDisplay}
              </span>
            )}
          </div>

          {/* Full-width Smooth Area Chart with Fluid Transition */}
          <div className="relative z-10 w-full h-[210px] mt-3 sm:mt-4 px-1 sm:px-2">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={chartData} 
                  margin={{ top: 10, right: 16, left: 16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="trendLineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.08} />
                      <stop offset="6%" stopColor="#38bdf8" stopOpacity={0.5} />
                      <stop offset="20%" stopColor="#38bdf8" stopOpacity={0.9} />
                      <stop offset="55%" stopColor="#7dd3fc" stopOpacity={1} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    content={<CustomTrendTooltip />} 
                    cursor={false} 
                    wrapperStyle={{ outline: 'none', zIndex: 100 }}
                  />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={renderTrendXAxisTick} 
                    dy={6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="achievement" 
                    stroke="url(#trendLineGlow)" 
                    strokeWidth={1.4} 
                    fill="none" 
                    fillOpacity={0} 
                    isAnimationActive={false}
                    dot={(props: any) => {
                      const { cx, cy, index } = props
                      if (index === chartData.length - 1) {
                        return (
                          <g key={`end-point-dot-${index}`}>
                            <circle cx={cx} cy={cy} r={4} fill="#38bdf8" opacity={0.2} />
                            <circle cx={cx} cy={cy} r={2.2} fill="#ffffff" stroke="#38bdf8" strokeWidth={1.2} />
                          </g>
                        )
                      }
                      return <g key={`dot-${index}`} />
                    }}
                    activeDot={{ r: 3.5, fill: '#ffffff', stroke: '#38bdf8', strokeWidth: 1.5 }}
                  />
                  {/* Moveable Glowing Beam: Outer Soft Cyan Glow Layer */}
                  <Area 
                    type="monotone" 
                    dataKey="achievement" 
                    stroke="#38bdf8" 
                    strokeWidth={1.8} 
                    fill="none" 
                    fillOpacity={0} 
                    isAnimationActive={false}
                    className="graph-beam-outer pointer-events-none"
                  />
                  {/* Moveable Glowing Beam: Inner Radiant White Core Layer */}
                  <Area 
                    type="monotone" 
                    dataKey="achievement" 
                    stroke="#ffffff" 
                    strokeWidth={1.0} 
                    fill="none" 
                    fillOpacity={0} 
                    isAnimationActive={false}
                    className="graph-beam-core pointer-events-none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Card 2: Latest Payment (4 cols) with 3D stacked cards deck carousel - Completely Standalone */}
        <div className="lg:col-span-4 relative min-h-[224px] h-[224px] mt-2 lg:mt-4">
          <LatestPaymentCarousel
            deckCards={deckCards}
            isPaymentTransitioning={isPaymentTransitioning}
            isUpdating={isUpdating}
          />
        </div>
      </section>

      {/* ============ MILESTONES & TOP 5 AGENTS LEADERBOARD SECTION (SAME ROW) ============ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mt-6 pb-4">
        {/* Left Column (8 cols): Milestones & Team Leaders / Last Month */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Milestone Cards Container with Widgets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Card 1: Target Cleared (3D Flip Card) */}
            <div className="flip-card min-h-[158px] w-full cursor-pointer">
              <div className="flip-card-inner">
                {/* FRONT FACE */}
                <div className="flip-card-front rounded-[24px] p-[1.5px] bg-gradient-to-br from-[#6ee7b7] via-[#10b981] to-[#016130] transition-all duration-300 shadow-[0_4px_20px_rgba(16,185,129,0.18),0_1px_3px_rgba(0,0,0,0.3)]">
                  <div className="w-full h-full min-h-[155px] rounded-[22.5px] py-4 px-2 sm:px-2.5 bg-gradient-to-br from-[#10b981]/40 via-[#059669]/35 to-[#016130]/50 backdrop-blur-md flex flex-col justify-between overflow-hidden text-center card-shine card-shine-delay-1">
                    {/* Score vs Total Agents (Top Center, No Percentage Badge) */}
                    <div className="flex items-baseline justify-center gap-1 my-0.5">
                      {isUpdating ? (
                        <div className="h-6 w-16 bg-white/20 animate-pulse rounded my-0.5" />
                      ) : (
                        <>
                          <span className="font-roboto text-[24px] font-bold text-white leading-none kpi-value-fade">
                            {targetClearedCount}
                          </span>
                          <span className="font-poppins text-[12px] text-white/75 font-medium">
                            / {totalAgents}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Widget: Circular Progress Ring (Center) */}
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center my-0.5 mt-1">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r="17" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="4.5" />
                        <circle 
                          cx="22" cy="22" r="17" fill="none" stroke="white" strokeWidth="4.5"
                          strokeDasharray={106.8}
                          strokeDashoffset={106.8 - (106.8 * Math.min(targetPct, 100)) / 100}
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-center">
                        <span className="font-roboto font-extrabold text-[14px] text-white leading-none">
                          {isUpdating ? '...' : `${targetPct}%`}
                        </span>
                      </div>
                    </div>

                    {/* Label (Bottom Center, No Icon) */}
                    <div className="mt-auto pt-1.5 text-center">
                      <span className="font-poppins text-[11.5px] sm:text-[12px] font-semibold text-white truncate block tracking-tight">
                        Target Cleared
                      </span>
                    </div>
                  </div>
                </div>

                {/* BACK FACE (Comparison on Hover) */}
                <div className="flip-card-back rounded-[24px] p-[1.5px] bg-gradient-to-br from-[#6ee7b7] via-[#10b981] to-[#016130] shadow-[0_4px_20px_rgba(16,185,129,0.18),0_1px_3px_rgba(0,0,0,0.3)]">
                  <div className="w-full h-full min-h-[155px] rounded-[22.5px] px-2 sm:px-2.5 pt-2.5 sm:pt-3 pb-0.5 sm:pb-1 bg-gradient-to-br from-[#10b981]/40 via-[#059669]/35 to-[#016130]/50 backdrop-blur-md flex flex-col overflow-hidden text-center card-shine card-shine-delay-1">
                    {/* Label (Top) */}
                    <div className="pt-0.5 text-center">
                      <span className="font-poppins text-[12.5px] sm:text-[13px] font-bold text-white truncate block tracking-wide">
                        Target Cleared
                      </span>
                    </div>

                    {/* Current & Last Month Comparison */}
                    <div className="flex flex-col gap-1.5 mt-1.5 w-full shrink-0">
                      {/* Current Month */}
                      <div className="w-full h-[38px] shrink-0 flex items-center justify-between px-3 sm:px-3.5 rounded-xl bg-white shadow-sm border border-white">
                        <div className="flex flex-col text-left leading-none">
                          <span className="font-poppins text-[8px] text-[#047857]/60 font-semibold uppercase tracking-wider">
                            Current
                          </span>
                          <span className="font-poppins text-[11px] text-[#047857] mt-0.5 font-bold tracking-tight">
                            {activeMonthDisplay}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-roboto text-[17px] font-black text-[#047857] leading-none">
                            {targetClearedCount}
                          </span>
                          <span className="font-poppins text-[10.5px] text-[#059669]/75 font-semibold">
                            / {totalAgents}
                          </span>
                        </div>
                      </div>

                      {/* Last Month */}
                      <div className="w-full h-[38px] shrink-0 flex items-center justify-between px-3 sm:px-3.5 rounded-xl bg-white shadow-sm border border-white">
                        <div className="flex flex-col text-left leading-none">
                          <span className="font-poppins text-[8px] text-[#047857]/60 font-semibold uppercase tracking-wider">
                            Last Month
                          </span>
                          <span className="font-poppins text-[11px] text-[#047857] mt-0.5 font-bold tracking-tight">
                            {lastMonthName}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-roboto text-[17px] font-black text-[#047857] leading-none">
                            {lmTargetCleared}
                          </span>
                          <span className="font-poppins text-[10.5px] text-[#059669]/75 font-semibold">
                            / {lmTotalAgents}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Value only at center at bottom */}
                    <div className="mt-auto pt-2 pb-0.5 text-center">
                      <span className="font-roboto font-extrabold text-[22px] text-emerald-200/25 flex items-center justify-center gap-1.5 tracking-tight leading-none select-none">
                        {targetPctDiff > 0 ? (
                          <>
                            <span className="text-[13px]">▲</span> {targetPctDiff}%
                          </>
                        ) : targetPctDiff < 0 ? (
                          <>
                            <span className="text-[13px]">▼</span> {Math.abs(targetPctDiff)}%
                          </>
                        ) : (
                          <span>0%</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Justification Cleared (3D Flip Card) */}
            <div className="flip-card min-h-[158px] w-full cursor-pointer">
              <div className="flip-card-inner">
                {/* FRONT FACE */}
                <div className="flip-card-front rounded-[24px] p-[1.5px] bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4d1bb5] transition-all duration-300 shadow-[0_4px_20px_rgba(139,92,246,0.18),0_1px_3px_rgba(0,0,0,0.3)]">
                  <div className="w-full h-full min-h-[155px] rounded-[22.5px] p-4 sm:py-4.5 sm:px-5 bg-gradient-to-br from-[#8b5cf6]/40 via-[#7c3aed]/35 to-[#4d1bb5]/50 backdrop-blur-md flex flex-col justify-between overflow-hidden text-center card-shine card-shine-delay-2">
                    {/* Score vs Total Agents (Top Center, No Percentage Badge) */}
                    <div className="flex items-baseline justify-center gap-1 my-0.5">
                      {isUpdating ? (
                        <div className="h-6 w-16 bg-white/20 animate-pulse rounded my-0.5" />
                      ) : (
                        <>
                          <span className="font-roboto text-[24px] font-bold text-white leading-none kpi-value-fade">
                            {justClearedCount}
                          </span>
                          <span className="font-poppins text-[12px] text-white/75 font-medium">
                            / {totalAgents}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Widget: Dot Matrix Grid (Center with Random Distribution - Compact) */}
                    <div className="flex items-center justify-center my-0.5 mt-1 h-16">
                      <div className="grid grid-cols-6 gap-1.5 p-1.5 rounded-lg bg-black/20 border border-white/10">
                        {(() => {
                          const scatterOrder = [11, 4, 19, 1, 15, 8, 22, 6, 13, 0, 17, 21, 5, 23, 10, 2, 14, 18, 7, 20, 3, 16, 9, 12]
                          const litThreshold = Math.round((justClearedPct / 100) * 24)
                          return Array.from({ length: 24 }).map((_, i) => {
                            const rank = scatterOrder.indexOf(i)
                            const isLit = rank < litThreshold
                            return (
                              <div 
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                  isLit
                                    ? 'bg-white scale-105'
                                    : 'bg-white/25'
                                }`}
                              />
                            )
                          })
                        })()}
                      </div>
                    </div>

                    {/* Label (Bottom Center, No Icon) */}
                    <div className="mt-auto pt-1.5 text-center">
                      <span className="font-poppins text-[12.5px] sm:text-[13px] font-semibold text-white truncate block">
                        Just. Cleared
                      </span>
                    </div>
                  </div>
                </div>

                {/* BACK FACE (Comparison on Hover) */}
                <div className="flip-card-back rounded-[24px] p-[1.5px] bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4d1bb5] shadow-[0_4px_20px_rgba(139,92,246,0.18),0_1px_3px_rgba(0,0,0,0.3)]">
                  <div className="w-full h-full min-h-[155px] rounded-[22.5px] px-2 sm:px-2.5 pt-2.5 sm:pt-3 pb-0.5 sm:pb-1 bg-gradient-to-br from-[#8b5cf6]/40 via-[#7c3aed]/35 to-[#4d1bb5]/50 backdrop-blur-md flex flex-col overflow-hidden text-center card-shine card-shine-delay-2">
                    {/* Label (Top) */}
                    <div className="pt-0.5 text-center">
                      <span className="font-poppins text-[12.5px] sm:text-[13px] font-bold text-white truncate block tracking-wide">
                        Just. Cleared
                      </span>
                    </div>

                    {/* Current & Last Month Comparison */}
                    <div className="flex flex-col gap-1.5 mt-1.5 w-full shrink-0">
                      {/* Current Month */}
                      <div className="w-full h-[38px] shrink-0 flex items-center justify-between px-3 sm:px-3.5 rounded-xl bg-white shadow-sm border border-white">
                        <div className="flex flex-col text-left leading-none">
                          <span className="font-poppins text-[8px] text-[#6d28d9]/60 font-semibold uppercase tracking-wider">
                            Current
                          </span>
                          <span className="font-poppins text-[11px] text-[#6d28d9] mt-0.5 font-bold tracking-tight">
                            {activeMonthDisplay}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-roboto text-[17px] font-black text-[#6d28d9] leading-none">
                            {justClearedCount}
                          </span>
                          <span className="font-poppins text-[10.5px] text-[#7c3aed]/75 font-semibold">
                            / {totalAgents}
                          </span>
                        </div>
                      </div>

                      {/* Last Month */}
                      <div className="w-full h-[38px] shrink-0 flex items-center justify-between px-3 sm:px-3.5 rounded-xl bg-white shadow-sm border border-white">
                        <div className="flex flex-col text-left leading-none">
                          <span className="font-poppins text-[8px] text-[#6d28d9]/60 font-semibold uppercase tracking-wider">
                            Last Month
                          </span>
                          <span className="font-poppins text-[11px] text-[#6d28d9] mt-0.5 font-bold tracking-tight">
                            {lastMonthName}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-roboto text-[17px] font-black text-[#6d28d9] leading-none">
                            {lmJustCleared}
                          </span>
                          <span className="font-poppins text-[10.5px] text-[#7c3aed]/75 font-semibold">
                            / {lmTotalAgents}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Value only at center at bottom */}
                    <div className="mt-auto pt-2 pb-0.5 text-center">
                      <span className="font-roboto font-extrabold text-[22px] text-violet-200/25 flex items-center justify-center gap-1.5 tracking-tight leading-none select-none">
                        {justClearedPctDiff > 0 ? (
                          <>
                            <span className="text-[13px]">▲</span> {justClearedPctDiff}%
                          </>
                        ) : justClearedPctDiff < 0 ? (
                          <>
                            <span className="text-[13px]">▼</span> {Math.abs(justClearedPctDiff)}%
                          </>
                        ) : (
                          <span>0%</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Justification Pending (3D Flip Card) */}
            <div className="flip-card min-h-[158px] w-full cursor-pointer">
              <div className="flip-card-inner">
                {/* FRONT FACE */}
                <div className="flip-card-front rounded-[24px] p-[1.5px] bg-gradient-to-br from-[#fed7aa] via-[#f97316] to-[#7c2d12] transition-all duration-300 shadow-[0_4px_20px_rgba(249,115,22,0.18),0_1px_3px_rgba(0,0,0,0.3)]">
                  <div className="w-full h-full min-h-[155px] rounded-[22.5px] p-4 sm:py-4.5 sm:px-5 bg-gradient-to-br from-[#f97316]/40 via-[#ea580c]/35 to-[#7c2d12]/50 backdrop-blur-md flex flex-col justify-between overflow-hidden text-center card-shine card-shine-delay-3">
                    {/* Score vs Total Agents (Top Center, No Percentage Badge) */}
                    <div className="flex items-baseline justify-center gap-1 my-0.5">
                      {isUpdating ? (
                        <div className="h-6 w-16 bg-white/20 animate-pulse rounded my-0.5" />
                      ) : (
                        <>
                          <span className="font-roboto text-[24px] font-bold text-white leading-none kpi-value-fade">
                            {justPendingCount}
                          </span>
                          <span className="font-poppins text-[12px] text-white/75 font-medium">
                            / {totalAgents}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Widget: Equalizer Soundwave Bars (Center - Slightly Smaller, Shifted Down) */}
                    <div className="flex items-end justify-center gap-1.5 h-[50px] py-1 my-0.5 mt-3.5 translate-y-1">
                      {[28, 45, 68, 90, 100, 82, 60, 42, 26].map((h, i) => {
                        const activeThreshold = Math.max(1, Math.round((justPendingPct / 100) * 9))
                        const isActive = i < activeThreshold
                        return (
                          <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className={`w-1.5 rounded-full transition-all duration-500 ${
                              isActive
                                ? 'bg-white'
                                : 'bg-white/25'
                            }`}
                          />
                        )
                      })}
                    </div>

                    {/* Label (Bottom Center, No Icon) */}
                    <div className="mt-auto pt-1.5 text-center">
                      <span className="font-poppins text-[12.5px] sm:text-[13px] font-semibold text-white truncate block">
                        Just. Pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* BACK FACE (Comparison on Hover) */}
                <div className="flip-card-back rounded-[24px] p-[1.5px] bg-gradient-to-br from-[#fed7aa] via-[#f97316] to-[#7c2d12] shadow-[0_4px_20px_rgba(249,115,22,0.18),0_1px_3px_rgba(0,0,0,0.3)]">
                  <div className="w-full h-full min-h-[155px] rounded-[22.5px] px-2 sm:px-2.5 pt-2.5 sm:pt-3 pb-0.5 sm:pb-1 bg-gradient-to-br from-[#f97316]/40 via-[#ea580c]/35 to-[#7c2d12]/50 backdrop-blur-md flex flex-col overflow-hidden text-center card-shine card-shine-delay-3">
                    {/* Label (Top) */}
                    <div className="pt-0.5 text-center">
                      <span className="font-poppins text-[12.5px] sm:text-[13px] font-bold text-white truncate block tracking-wide">
                        Just. Pending
                      </span>
                    </div>

                    {/* Current & Last Month Comparison */}
                    <div className="flex flex-col gap-1.5 mt-1.5 w-full shrink-0">
                      {/* Current Month */}
                      <div className="w-full h-[38px] shrink-0 flex items-center justify-between px-3 sm:px-3.5 rounded-xl bg-white shadow-sm border border-white">
                        <div className="flex flex-col text-left leading-none">
                          <span className="font-poppins text-[8px] text-[#c2410c]/60 font-semibold uppercase tracking-wider">
                            Current
                          </span>
                          <span className="font-poppins text-[11px] text-[#c2410c] mt-0.5 font-bold tracking-tight">
                            {activeMonthDisplay}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-roboto text-[17px] font-black text-[#c2410c] leading-none">
                            {justPendingCount}
                          </span>
                          <span className="font-poppins text-[10.5px] text-[#ea580c]/75 font-semibold">
                            / {totalAgents}
                          </span>
                        </div>
                      </div>

                      {/* Last Month */}
                      <div className="w-full h-[38px] shrink-0 flex items-center justify-between px-3 sm:px-3.5 rounded-xl bg-white shadow-sm border border-white">
                        <div className="flex flex-col text-left leading-none">
                          <span className="font-poppins text-[8px] text-[#c2410c]/60 font-semibold uppercase tracking-wider">
                            Last Month
                          </span>
                          <span className="font-poppins text-[11px] text-[#c2410c] mt-0.5 font-bold tracking-tight">
                            {lastMonthName}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-roboto text-[17px] font-black text-[#c2410c] leading-none">
                            {lmJustPending}
                          </span>
                          <span className="font-poppins text-[10.5px] text-[#ea580c]/75 font-semibold">
                            / {lmTotalAgents}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Value only at center at bottom */}
                    <div className="mt-auto pt-2 pb-0.5 text-center">
                      <span className="font-roboto font-extrabold text-[22px] text-orange-200/25 flex items-center justify-center gap-1.5 tracking-tight leading-none select-none">
                        {justPendingPctDiff > 0 ? (
                          <>
                            <span className="text-[13px]">▲</span> {justPendingPctDiff}%
                          </>
                        ) : justPendingPctDiff < 0 ? (
                          <>
                            <span className="text-[13px]">▼</span> {Math.abs(justPendingPctDiff)}%
                          </>
                        ) : (
                          <span>0%</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Zero Performer (3D Flip Card) */}
            <div className="flip-card min-h-[158px] w-full cursor-pointer">
              <div className="flip-card-inner">
                {/* FRONT FACE */}
                <div className="flip-card-front rounded-[24px] p-[1.5px] bg-gradient-to-br from-[#fecdd3] via-[#fb7185] to-[#881337] transition-all duration-300 shadow-[0_4px_20px_rgba(251,113,133,0.18),0_1px_3px_rgba(0,0,0,0.3)]">
                  <div className="w-full h-full min-h-[155px] rounded-[22.5px] py-4 px-2 sm:px-2.5 bg-gradient-to-br from-[#fb7185]/40 via-[#e11d48]/35 to-[#881337]/50 backdrop-blur-md flex flex-col justify-between items-center overflow-hidden text-center card-shine card-shine-delay-4">
                    {/* Score vs Total Agents (Top Center, No Percentage Badge) */}
                    <div className="w-full flex items-baseline justify-center gap-1 my-0.5">
                      {isUpdating ? (
                        <div className="h-6 w-16 bg-white/20 animate-pulse rounded my-0.5" />
                      ) : (
                        <>
                          <span className="font-roboto text-[24px] font-bold text-white leading-none kpi-value-fade">
                            {zeroCount}
                          </span>
                          <span className="font-poppins text-[12px] text-white/75 font-medium">
                            / {totalAgents}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Widget: Semicircular Radial Gauge with Ticks (Speedometer Dial Style - Perfectly Centered) */}
                    <div className="relative w-[116px] h-16 flex items-end justify-center my-0.5 mt-1 self-center">
                      <svg className="w-full h-full" viewBox="0 0 80 40" fill="none">
                        {Array.from({ length: 35 }).map((_, i) => {
                          const t = i / 34
                          const angle = Math.PI + t * Math.PI
                          const r1 = 25
                          const r2 = 33
                          const x1 = 40 + r1 * Math.cos(angle)
                          const y1 = 35 + r1 * Math.sin(angle)
                          const x2 = 40 + r2 * Math.cos(angle)
                          const y2 = 35 + r2 * Math.sin(angle)
                          
                          const litCount = Math.round((zeroPct / 100) * 35)
                          const isLit = i < litCount

                          return (
                            <line
                              key={i}
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="white"
                              strokeOpacity={isLit ? 1 : 0.22}
                              strokeWidth={isLit ? 1.8 : 1.1}
                              strokeLinecap="round"
                              className="transition-all duration-300"
                            />
                          )
                        })}
                      </svg>
                      <div className="absolute inset-x-0 bottom-1 flex items-center justify-center text-center pointer-events-none">
                        <span className="font-roboto font-extrabold text-[17.5px] text-white leading-none tracking-tight">
                          {isUpdating ? '...' : `${zeroPct}%`}
                        </span>
                      </div>
                    </div>

                    {/* Label (Bottom Center, No Icon) */}
                    <div className="w-full mt-auto pt-1.5 text-center">
                      <span className="font-poppins text-[11.5px] sm:text-[12px] font-semibold text-white truncate block tracking-tight">
                        Zero Performer
                      </span>
                    </div>
                  </div>
                </div>

                {/* BACK FACE (Comparison on Hover) */}
                <div className="flip-card-back rounded-[24px] p-[1.5px] bg-gradient-to-br from-[#fecdd3] via-[#fb7185] to-[#881337] shadow-[0_4px_20px_rgba(251,113,133,0.18),0_1px_3px_rgba(0,0,0,0.3)]">
                  <div className="w-full h-full min-h-[155px] rounded-[22.5px] px-2 sm:px-2.5 pt-2.5 sm:pt-3 pb-0.5 sm:pb-1 bg-gradient-to-br from-[#fb7185]/40 via-[#e11d48]/35 to-[#881337]/50 backdrop-blur-md flex flex-col overflow-hidden text-center card-shine card-shine-delay-4">
                    {/* Label (Top) */}
                    <div className="pt-0.5 text-center">
                      <span className="font-poppins text-[12.5px] sm:text-[13px] font-bold text-white truncate block tracking-wide">
                        Zero Performer
                      </span>
                    </div>

                    {/* Current & Last Month Comparison */}
                    <div className="flex flex-col gap-1.5 mt-1.5 w-full shrink-0">
                      {/* Current Month */}
                      <div className="w-full h-[38px] shrink-0 flex items-center justify-between px-3 sm:px-3.5 rounded-xl bg-white shadow-sm border border-white">
                        <div className="flex flex-col text-left leading-none">
                          <span className="font-poppins text-[8px] text-[#be123c]/60 font-semibold uppercase tracking-wider">
                            Current
                          </span>
                          <span className="font-poppins text-[11px] text-[#be123c] mt-0.5 font-bold tracking-tight">
                            {activeMonthDisplay}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-roboto text-[17px] font-black text-[#be123c] leading-none">
                            {zeroCount}
                          </span>
                          <span className="font-poppins text-[10.5px] text-[#e11d48]/75 font-semibold">
                            / {totalAgents}
                          </span>
                        </div>
                      </div>

                      {/* Last Month */}
                      <div className="w-full h-[38px] shrink-0 flex items-center justify-between px-3 sm:px-3.5 rounded-xl bg-white shadow-sm border border-white">
                        <div className="flex flex-col text-left leading-none">
                          <span className="font-poppins text-[8px] text-[#be123c]/60 font-semibold uppercase tracking-wider">
                            Last Month
                          </span>
                          <span className="font-poppins text-[11px] text-[#be123c] mt-0.5 font-bold tracking-tight">
                            {lastMonthName}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-roboto text-[17px] font-black text-[#be123c] leading-none">
                            {lmZeroCount}
                          </span>
                          <span className="font-poppins text-[10.5px] text-[#e11d48]/75 font-semibold">
                            / {lmTotalAgents}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Value only at center at bottom */}
                    <div className="mt-auto pt-2 pb-0.5 text-center">
                      <span className="font-roboto font-extrabold text-[22px] text-rose-200/25 flex items-center justify-center gap-1.5 tracking-tight leading-none select-none">
                        {zeroPctDiff > 0 ? (
                          <>
                            <span className="text-[13px]">▲</span> {zeroPctDiff}%
                          </>
                        ) : zeroPctDiff < 0 ? (
                          <>
                            <span className="text-[13px]">▼</span> {Math.abs(zeroPctDiff)}%
                          </>
                        ) : (
                          <span>0%</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Cards Row: NOP & Payment Breakdown + Discount Payments */}
          <div className="flex flex-col md:flex-row gap-5 mt-4 sm:mt-8">
            {/* Card 1: NOP & Payment Breakdown */}
            <div className="md:w-[60%] relative rounded-[24px] bg-[#0A0E17]/85 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-5.5 overflow-hidden shadow-xl shadow-black/20 hover:border-white/[0.14] transition-all duration-300">
              {/* Atmospheric gradient glow blobs */}
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-purple-600/15 blur-[55px] pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-emerald-500/12 blur-[50px] pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-400" fill="currentColor">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="font-poppins font-medium text-[16px] sm:text-[17px] text-white tracking-wide">
                    NOP & Payment Breakdown
                  </h3>
                </div>
              </div>

              {/* Content: Dual Ring Donut + Grouped Legends */}
              <div className="relative z-10 flex items-center justify-around sm:justify-evenly w-full py-1">
                {/* Dual Ring Donut Chart */}
                <DualRingDonutChart
                  outerSegments={[
                    { label: "Multi Year Policies", value: multiYearNop, color: "#a855f7" },
                    { label: "Single Year Policies", value: singleYearNop, color: "#00b4d8" },
                  ]}
                  innerSegments={[
                    { label: "Below ₹50,000", value: below50k, color: "#00d68f" },
                    { label: "₹50,000 - ₹1,00,000", value: between50k1L, color: "#f59e0b" },
                    { label: "Above ₹1,00,000", value: above1L, color: "#f43f5e" },
                  ]}
                  totalLabel="Total"
                  size={120}
                  strokeWidth={8}
                  gapBetweenRings={7}
                  isUpdating={isUpdating}
                />

                {/* Legends Container */}
              <div className="flex flex-col justify-center gap-2 w-full max-w-[180px] sm:max-w-[200px] shrink-0">
                {/* Multi Year */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] shrink-0 shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
                    <span className="font-poppins text-[12px] sm:text-[13px] text-white/80 truncate">
                      Multi Year
                    </span>
                  </div>
                  {isUpdating ? (
                    <div className="h-3.5 w-6 kpi-skeleton rounded shrink-0 ml-auto" />
                  ) : (
                    <span className="font-roboto font-bold text-[14px] text-white shrink-0 ml-auto kpi-value-fade">
                      {multiYearNop}
                    </span>
                  )}
                </div>

                {/* Single Year */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00b4d8] shrink-0 shadow-[0_0_6px_rgba(0,180,216,0.6)]" />
                    <span className="font-poppins text-[12px] sm:text-[13px] text-white/80 truncate">
                      Single Year
                    </span>
                  </div>
                  {isUpdating ? (
                    <div className="h-3.5 w-6 kpi-skeleton rounded shrink-0 ml-auto" />
                  ) : (
                    <span className="font-roboto font-bold text-[14px] text-white shrink-0 ml-auto kpi-value-fade">
                      {singleYearNop}
                    </span>
                  )}
                </div>

                {/* Subtle Divider */}
                <div className="w-full h-px bg-white/[0.08] my-1" />

                {/* Below ₹50,000 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00d68f] shrink-0 shadow-[0_0_6px_rgba(0,214,143,0.6)]" />
                    <span className="font-poppins text-[12px] sm:text-[12.5px] text-white/80 truncate">
                      Below ₹50,000
                    </span>
                  </div>
                  {isUpdating ? (
                    <div className="h-3.5 w-6 kpi-skeleton rounded shrink-0 ml-auto" />
                  ) : (
                    <span className="font-roboto font-bold text-[13.5px] text-white shrink-0 ml-auto kpi-value-fade">
                      {below50k}
                    </span>
                  )}
                </div>

                {/* ₹50,000 - ₹1,00,000 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                    <span className="font-poppins text-[12px] sm:text-[12.5px] text-white/80 truncate">
                      ₹50k - ₹1L
                    </span>
                  </div>
                  {isUpdating ? (
                    <div className="h-3.5 w-6 kpi-skeleton rounded shrink-0 ml-auto" />
                  ) : (
                    <span className="font-roboto font-bold text-[13.5px] text-white shrink-0 ml-auto kpi-value-fade">
                      {between50k1L}
                    </span>
                  )}
                </div>

                {/* Above ₹1,00,000 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] shrink-0 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                    <span className="font-poppins text-[12px] sm:text-[12.5px] text-white/80 truncate">
                      Above ₹1L
                    </span>
                  </div>
                  {isUpdating ? (
                    <div className="h-3.5 w-6 kpi-skeleton rounded shrink-0 ml-auto" />
                  ) : (
                    <span className="font-roboto font-bold text-[13.5px] text-white shrink-0 ml-auto kpi-value-fade">
                      {above1L}
                    </span>
                  )}
                </div>
              </div>
              </div>
            </div>

            {/* Card 2: Discount Payments */}
            <div className="md:w-[40%] relative rounded-[24px] backdrop-blur-xl p-5 sm:p-5.5 overflow-hidden shadow-xl shadow-black/20 transition-all duration-300">
              {/* Atmospheric gradient glow blobs */}
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-amber-500/10 blur-[50px] pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-rose-400" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  </div>
                  <h3 className="font-poppins font-medium text-[16px] sm:text-[17px] text-white tracking-wide">
                    Discount Payments
                  </h3>
                </div>
              </div>

              {/* Content: Centered Half Meter */}
              <div className="relative z-10 flex items-start justify-center h-full pt-1">
                {/* Half Circular Progress Meter */}
                <div className="relative w-48 h-28 flex items-end justify-center">
                  <svg className="w-full h-full" viewBox="0 0 192 112" fill="none">
                    {/* Background track (half circle) */}
                    <path
                      d="M 16 96 A 80 80 0 0 1 176 96"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="14"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* Progress arc */}
                    <path
                      d="M 16 96 A 80 80 0 0 1 176 96"
                      stroke="#f59e0b"
                      strokeWidth="14"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={251.33}
                      strokeDashoffset={251.33 - (251.33 * Math.min((data.kpis.discountCount || 0) / 50, 1))}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute top-14 flex flex-col items-center justify-center text-center">
                    {isUpdating ? (
                      <>
                        <div className="h-9 w-16 kpi-skeleton rounded my-0.5" />
                        <span className="font-poppins text-[14px] text-white/60 mt-1">
                          Policies
                        </span>
                        <div className="h-5 w-20 kpi-skeleton rounded mt-2" />
                      </>
                    ) : (
                      <>
                        <span className="font-roboto font-bold text-[36px] text-white leading-none">
                          {String(data.kpis.discountCount || 0).padStart(2, '0')}
                        </span>
                        <span className="font-poppins text-[14px] text-white/60 mt-1">
                          Policies
                        </span>
                        <span className="font-roboto font-bold text-[20px] bg-gradient-to-r from-[#fcd34d] via-[#f59e0b] to-[#d97706] bg-clip-text text-transparent mt-2">
                          ₹{Number(data.kpis.discountDelivered || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

   
        </div>

        {/* Right Column (4 cols): Top 5 Agents Leaderboard & Breakdown Cards */}
        <div className="lg:col-span-4 flex flex-col gap-6 -mt-4">
          {/* Top 5 Agents Leaderboard */}
          <div className="flex flex-col">
            {/* Header - Title on Left, Icon on Right End */}
            <div className="flex items-center justify-between pb-1">
              <h2 className="font-poppins font-medium text-[18px] text-white tracking-wide">
                Top 5 Agents
              </h2>
              <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-br from-[#fde68a] via-[#f59e0b] to-[#b45309] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(245,158,11,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
                <div className="w-full h-full rounded-full glass-icon-circle bg-gradient-to-br from-[#f59e0b]/40 via-[#d97706]/35 to-[#b45309]/50 flex items-center justify-center backdrop-blur-md">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 drop-shadow-[0_2px_8px_rgba(245,158,11,0.7)]" fill="url(#kpiGradGold)">
                    <path d="m12 16a8 8 0 1 1 8-8 8.009 8.009 0 0 1 -8 8zm0 2a9.942 9.942 0 0 1 -6-2.014v5.514a2.5 2.5 0 0 0 4.062 1.952l1.938-1.552 1.938 1.55a2.5 2.5 0 0 0 4.062-1.95v-5.514a9.942 9.942 0 0 1 -6 2.014z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Top 5 Agents List Body - Increased Height for Each Card */}
            <div className="relative z-10 mt-3 flex flex-col gap-2 sm:gap-2.5">
              {topAgentsList.length === 0 && !isUpdating ? (
                <div className="py-8 text-center text-xs text-[#64748B] font-poppins">
                  No agents data available for {activeMonthDisplay}
                </div>
              ) : (
                topAgentsList.map((agent: any, idx: number) => {
                  const isTop1 = idx === 0
                  const isTop2 = idx === 1
                  const isTop3 = idx === 2

                  const initials = agent.name
                    ? agent.name.split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                    : 'AG'

                  return (
                    <div 
                      key={`${agent.name}-${idx}`}
                      className="group/row flex items-center justify-between gap-3 px-4 py-4 sm:py-4.5 min-h-[68px] rounded-2xl bg-white/[0.025] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.14] transition-all duration-200 shadow-sm"
                    >
                      {/* Left: Only Profile Pic / Avatar + Agent Name */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Profile Avatar with Golden / Silver / Bronze Badge */}
                        <div className="relative shrink-0">
                          {isTop1 ? (
                            <div
                              title="Rank 1 - Golden Badge"
                              className="w-9 h-9 rounded-full p-[1.5px] flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.25)] relative"
                            >
                              <div className="absolute inset-0 rounded-full" style={{
                                background: 'conic-gradient(from 0deg, #f59e0b, #fef08a, #b45309, #f59e0b)',
                                animation: 'spin 2s linear infinite'
                              }} />
                              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#78350f] flex items-center justify-center relative z-10">
                                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-[#fef08a] drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" fill="currentColor">
                                  <path d="m12 16a8 8 0 1 1 8-8 8.009 8.009 0 0 1 -8 8zm0 2a9.942 9.942 0 0 1 -6-2.014v5.514a2.5 2.5 0 0 0 4.062 1.952l1.938-1.552 1.938 1.55a2.5 2.5 0 0 0 4.062-1.95v-5.514a9.942 9.942 0 0 1 -6 2.014z" />
                                </svg>
                              </div>
                            </div>
                          ) : isTop2 ? (
                            <div
                              title="Rank 2 - Silver Badge"
                              className="w-9 h-9 rounded-full p-[1.5px] flex items-center justify-center shadow-[0_0_8px_rgba(203,213,225,0.2)] relative"
                            >
                              <div className="absolute inset-0 rounded-full" style={{
                                background: 'conic-gradient(from 0deg, #94a3b8, #ffffff, #64748b, #94a3b8)',
                                animation: 'spin 2s linear infinite'
                              }} />
                              <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-300 via-slate-500 to-slate-700 flex items-center justify-center relative z-10">
                                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" fill="currentColor">
                                  <path d="m12 16a8 8 0 1 1 8-8 8.009 8.009 0 0 1 -8 8zm0 2a9.942 9.942 0 0 1 -6-2.014v5.514a2.5 2.5 0 0 0 4.062 1.952l1.938-1.552 1.938 1.55a2.5 2.5 0 0 0 4.062-1.95v-5.514a9.942 9.942 0 0 1 -6 2.014z" />
                                </svg>
                              </div>
                            </div>
                          ) : isTop3 ? (
                            <div
                              title="Rank 3 - Bronze Badge"
                              className="w-9 h-9 rounded-full p-[1.5px] flex items-center justify-center shadow-[0_0_8px_rgba(234,88,12,0.2)] relative"
                            >
                              <div className="absolute inset-0 rounded-full" style={{
                                background: 'conic-gradient(from 0deg, #fdba74, #ea580c, #7c2d12, #fdba74)',
                                animation: 'spin 2s linear infinite'
                              }} />
                              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#ea580c] via-[#c2410c] to-[#431407] flex items-center justify-center relative z-10">
                                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-amber-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" fill="currentColor">
                                  <path d="m12 16a8 8 0 1 1 8-8 8.009 8.009 0 0 1 -8 8zm0 2a9.942 9.942 0 0 1 -6-2.014v5.514a2.5 2.5 0 0 0 4.062 1.952l1.938-1.552 1.938 1.55a2.5 2.5 0 0 0 4.062-1.95v-5.514a9.942 9.942 0 0 1 -6 2.014z" />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-[12px] font-bold text-white/70 overflow-hidden">
                              {isUpdating ? (
                                <div className="w-full h-full kpi-skeleton" />
                              ) : (
                                initials
                              )}
                            </div>
                          )}

                          {/* Pinned Rank Tag at bottom-right corner */}
                          {isTop1 && (
                            <div 
                              title="1st Place"
                              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-[#f59e0b] via-[#fef08a] to-[#b45309] text-amber-950 text-[9px] font-black grid place-items-center leading-none shadow-md border border-[#080B11]"
                            >
                              <span className="leading-none select-none flex items-center justify-center text-center pt-[2px]">1</span>
                            </div>
                          )}
                          {isTop2 && (
                            <div 
                              title="2nd Place"
                              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-slate-300 via-white to-slate-400 text-slate-950 text-[9px] font-black grid place-items-center leading-none shadow-md border border-[#080B11]"
                            >
                              <span className="leading-none select-none flex items-center justify-center text-center pt-[2px]">2</span>
                            </div>
                          )}
                          {isTop3 && (
                            <div 
                              title="3rd Place"
                              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-[#ea580c] via-[#fed7aa] to-[#7c2d12] text-amber-950 text-[9px] font-black grid place-items-center leading-none shadow-md border border-[#080B11]"
                            >
                              <span className="leading-none select-none flex items-center justify-center text-center pt-[2px]">3</span>
                            </div>
                          )}
                        </div>

                        {/* Agent Name on top, Score + NOP below */}
                        <div className="flex flex-col min-w-0 leading-tight">
                          {isUpdating ? (
                            <div className="h-4 w-28 sm:w-32 kpi-skeleton rounded my-0.5 ml-2" />
                          ) : (
                            <span className="font-poppins mb-1 ml-2 text-[13.5px] sm:text-[16px] font-medium text-white truncate max-w-[130px] sm:max-w-[160px] group-hover/row:text-amber-200 transition-colors">
                              {agent.name}
                            </span>
                          )}
                          {isUpdating ? (
                            <div className="h-3.5 w-24 sm:w-28 kpi-skeleton rounded mt-1 ml-2" />
                          ) : (
                            <div className="flex ml-2 items-center flex-nowrap whitespace-nowrap gap-1.5 mt-1 p-0 m-0">
                              <span className="font-roboto text-[12.5px] font-bold text-white/90 leading-none p-0 m-0">
                                {formatLakhs(agent.score)}
                              </span>
                              <span className="text-white/30 text-[10px] leading-none select-none p-0 m-0">•</span>
                              {agent.nop !== undefined && (
                                <span className="p-0 m-0 font-roboto text-[12.5px] text-white/55 leading-none whitespace-nowrap">
                                  {agent.nop} Payments
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Achievement Percentage (Static Metallic Gradient Colors) */}
                      <div className="flex items-center shrink-0">
                        {isUpdating ? (
                          <div className="h-5 w-14 sm:w-16 kpi-skeleton rounded" />
                        ) : (
                          <span className={`font-roboto text-[15px] sm:text-[18px] font-bold flex items-center leading-none tracking-tight bg-clip-text text-transparent ${
                            isTop1 
                              ? 'bg-gradient-to-r from-[#fef08a] via-[#f59e0b] to-[#d97706]' 
                              : isTop2 
                              ? 'bg-gradient-to-r from-[#ffffff] via-[#e2e8f0] to-[#94a3b8]' 
                              : isTop3 
                              ? 'bg-gradient-to-r from-[#fed7aa] via-[#f97316] to-[#c2410c]' 
                              : 'bg-gradient-to-r from-[#6ee7b7] via-[#10b981] to-[#047857]'
                          }`}>
                            {Number(agent.percent || 0).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Separate Section: Team Leaders & Last Month */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mt-6 pb-3">
        {/* Card 1: Team Leaders */}
        <div className="lg:col-span-8 relative rounded-[24px] bg-[#0A0E17]/85 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-5.5 overflow-hidden shadow-xl shadow-black/20 hover:border-white/[0.14] transition-all duration-300 flex flex-col justify-between min-h-[350px]">
          {/* Subtle ambient glow */}
          <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-amber-500/10 blur-[55px] pointer-events-none" />

          {/* Header with Golden Star */}
          <div className="relative z-10 flex items-center  justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]" />
              <h3 className="font-poppins ml-2 font-medium text-[17px] text-white tracking-wide">
                Team Leaders
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-poppins text-white/40 hover:text-white transition-colors cursor-pointer group select-none">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Table Header */}
          <div className="relative z-10 grid grid-cols-12 gap-2 px-3 py-2 text-[11px] sm:text-[12px] font-poppins font-medium text-white/50 border-b border-white/[0.08]">
            <div className="col-span-3">Team Leaders</div>
            <div className="col-span-2 text-right">Target</div>
            <div className="col-span-2 text-right">Score</div>
            <div className="col-span-1 text-right">NOP</div>
            <div className="col-span-1 text-right">On Zero</div>
            <div className="col-span-2"></div>
            <div className="col-span-1 text-right">Ach.</div>
          </div>

          {/* Table Rows */}
          <div className="relative z-10 flex flex-col flex-1 overflow-y-auto">
            {teamLeadersList.map((tl: any, idx: number) => {
              const isTop1 = idx === 0
              const isTop2 = idx === 1
              const isTop3 = idx === 2

              const barColor = idx === 0 ? 'bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#f59e0b]'
                : idx === 1 ? 'bg-gradient-to-r from-[#94a3b8] via-[#cbd5e1] to-[#94a3b8]'
                : idx === 2 ? 'bg-gradient-to-r from-[#ea580c] via-[#fdba74] to-[#ea580c]'
                : idx === 3 ? 'bg-gradient-to-r from-[#64748b] via-[#94a3b8] to-[#64748b]'
                : 'bg-gradient-to-r from-[#475569] via-[#64748b] to-[#475569]'

              return (
                <div key={`${tl.name}-${idx}`} className="grid grid-cols-12 gap-2 px-3 py-2 hover:bg-white/[0.03] transition-colors items-center">
                  {/* Avatar + Name */}
                  <div className="col-span-3 flex items-center gap-2 min-w-0">
                    {/* Profile Avatar with Golden / Silver / Bronze Badge */}
                    <div className="relative shrink-0">
                      {isTop1 ? (
                        <div
                          title="Rank 1 - Golden Badge"
                          className="w-8 h-8 rounded-full p-[1.5px] flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.25)] relative"
                        >
                          <div className="absolute inset-0 rounded-full" style={{
                            background: 'conic-gradient(from 0deg, #f59e0b, #fef08a, #b45309, #f59e0b)',
                            animation: 'spin 2s linear infinite'
                          }} />
                          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#78350f] flex items-center justify-center relative z-10">
                            <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] text-[#fef08a] drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" fill="currentColor">
                              <path d="m12 16a8 8 0 1 1 8-8 8.009 8.009 0 0 1 -8 8zm0 2a9.942 9.942 0 0 1 -6-2.014v5.514a2.5 2.5 0 0 0 4.062 1.952l1.938-1.552 1.938 1.55a2.5 2.5 0 0 0 4.062-1.95v-5.514a9.942 9.942 0 0 1 -6 2.014z" />
                            </svg>
                          </div>
                        </div>
                      ) : isTop2 ? (
                        <div
                          title="Rank 2 - Silver Badge"
                          className="w-8 h-8 rounded-full p-[1.5px] flex items-center justify-center shadow-[0_0_8px_rgba(203,213,225,0.2)] relative"
                        >
                          <div className="absolute inset-0 rounded-full" style={{
                            background: 'conic-gradient(from 0deg, #94a3b8, #ffffff, #64748b, #94a3b8)',
                            animation: 'spin 2s linear infinite'
                          }} />
                          <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-300 via-slate-500 to-slate-700 flex items-center justify-center relative z-10">
                            <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" fill="currentColor">
                              <path d="m12 16a8 8 0 1 1 8-8 8.009 8.009 0 0 1 -8 8zm0 2a9.942 9.942 0 0 1 -6-2.014v5.514a2.5 2.5 0 0 0 4.062 1.952l1.938-1.552 1.938 1.55a2.5 2.5 0 0 0 4.062-1.95v-5.514a9.942 9.942 0 0 1 -6 2.014z" />
                            </svg>
                          </div>
                        </div>
                      ) : isTop3 ? (
                        <div
                          title="Rank 3 - Bronze Badge"
                          className="w-8 h-8 rounded-full p-[1.5px] flex items-center justify-center shadow-[0_0_8px_rgba(234,88,12,0.2)] relative"
                        >
                          <div className="absolute inset-0 rounded-full" style={{
                            background: 'conic-gradient(from 0deg, #fdba74, #ea580c, #7c2d12, #fdba74)',
                            animation: 'spin 2s linear infinite'
                          }} />
                          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#ea580c] via-[#c2410c] to-[#431407] flex items-center justify-center relative z-10">
                            <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] text-amber-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" fill="currentColor">
                              <path d="m12 16a8 8 0 1 1 8-8 8.009 8.009 0 0 1 -8 8zm0 2a9.942 9.942 0 0 1 -6-2.014v5.514a2.5 2.5 0 0 0 4.062 1.952l1.938-1.552 1.938 1.55a2.5 2.5 0 0 0 4.062-1.95v-5.514a9.942 9.942 0 0 1 -6 2.014z" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-b from-slate-600 to-slate-800 flex items-center justify-center border border-white/10 shadow-md">
                          <span className="text-[11px] font-bold text-white/80">
                            {tl.name ? tl.name.split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : 'TL'}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="font-poppins text-[13px] sm:text-[14px] font-medium text-white truncate">
                      {isUpdating ? (
                        <div className="h-4 w-16 kpi-skeleton rounded" />
                      ) : (
                        tl.name
                      )}
                    </span>
                  </div>

                  {/* Target */}
                  <div className="col-span-2 text-right">
                    {isUpdating ? (
                      <div className="h-4 w-12 kpi-skeleton rounded ml-auto" />
                    ) : (
                      <span className="font-roboto text-[13px] sm:text-[14px] text-white/80">
                        ₹{(Number(tl.target) || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="col-span-2 text-right">
                    {isUpdating ? (
                      <div className="h-4 w-12 kpi-skeleton rounded ml-auto" />
                    ) : (
                      <span className="font-roboto text-[13px] sm:text-[14px] text-white/80">
                        ₹{(Number(tl.score) || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    )}
                  </div>

                  {/* NOP */}
                  <div className="col-span-1 text-right">
                    {isUpdating ? (
                      <div className="h-4 w-6 kpi-skeleton rounded ml-auto" />
                    ) : (
                      <span className="font-roboto text-[13px] sm:text-[14px] text-white/80">
                        {tl.nop || 0}
                      </span>
                    )}
                  </div>

                  {/* Zero Score Agents */}
                  <div className="col-span-1 text-right">
                    {isUpdating ? (
                      <div className="h-4 w-8 kpi-skeleton rounded ml-auto" />
                    ) : (
                      <span className="font-roboto text-[12px] sm:text-[13px] font-bold text-red-400">
                        {tl.zeroScoreAgents || 0}/{tl.totalAgents || 0}
                      </span>
                    )}
                  </div>

                  {/* Bar */}
                  <div className="col-span-2 flex items-center justify-center">
                    {isUpdating ? (
                      <div className="w-16 h-2 kpi-skeleton rounded shrink-0" />
                    ) : (
                      <div className="w-16 h-2 rounded-full bg-[#131b26] overflow-hidden shrink-0">
                        <div
                          className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
                          style={{ width: `${Math.min(100, Math.max(0, Number(tl.percent) || 0))}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Achievement */}
                  <div className="col-span-1 text-right">
                    {isUpdating ? (
                      <div className="h-4 w-8 kpi-skeleton rounded ml-auto" />
                    ) : (
                      <span className="font-roboto text-[13px] sm:text-[14px] font-bold text-white/90">
                        {Number(tl.percent || 0).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Card 2: Last Month - Custom Design */}
        <div className="lg:col-span-4 relative rounded-[24px] bg-[#0A0E17]/85 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-5.5 overflow-hidden shadow-xl shadow-black/20 hover:border-white/[0.14] transition-all duration-300 flex flex-col justify-between min-h-[350px]">
          {/* Ambient glow */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-blue-500/10 blur-[40px] pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-purple-500/10 blur-[40px] pointer-events-none" />

          {/* Title */}
          <div className="relative z-10 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400 drop-shadow-[0_2px_8px_rgba(34,211,238,0.4)] fill-current" viewBox="0 0 24 24">
                <path d="M12,24c-1.65,0-3-1.35-3-3V3c0-1.65,1.35-3,3-3s3,1.35,3,3V21c0,1.65-1.35,3-3,3Zm9,0c-1.65,0-3-1.35-3-3V9c0-1.65,1.35-3,3-3s3,1.35,3,3v12c0,1.65-1.35,3-3,3Zm-18,0c-1.65,0-3-1.35-3-3v-6c0-1.65,1.35-3,3-3s3,1.35,3,3v6c0,1.65-1.35,3-3,3Z"/>
              </svg>
              <h3 className="font-poppins font-medium text-[17px] ml-2 text-white tracking-wide">
                Last Month Stats
              </h3>
            </div>
          </div>

          {/* Score and Percentage */}
          <div className="relative z-10 flex items-center justify-between gap-4 mb-6">
            {/* Left: Score */}
            <div className="flex-1">
              <div className="text-[11px] font-poppins font-medium text-white/60 tracking-wider mb-1">
                Company Score
              </div>
              {isUpdating ? (
                <div className="h-12 w-24 kpi-skeleton rounded" />
              ) : (
                <div className="text-[32px] font-roboto font-bold silver-shimmer-text">
                  {formatLakhs(lastMonthCardData.score)}
                </div>
              )}
            </div>

            {/* Right: Percentage */}
            <div className="flex-1 text-right">
              <div className="text-[11px] font-poppins font-medium text-white/60  tracking-wider mb-1">
                Achievement
              </div>
              {isUpdating ? (
                <div className="h-12 w-20 kpi-skeleton rounded ml-auto" />
              ) : (
                <div className="text-[32px] font-roboto font-bold text-cyan-400">
                  {Math.round(Number(lastMonthCardData.achievement || 0))}%
                </div>
              )}
            </div>
          </div>

          {/* Discount, Top Agent, Top Team Leader, Payments - 2x2 Grid */}
          <div className="relative z-10 grid grid-cols-2 gap-4">
            {/* Discount Section */}
            <div className="flex flex-col m-2 items-center">
              <Tag className="w-5 h-5 text-pink-400 mb-2 fill-current" />
              {isUpdating ? (
                <div className="h-6 w-24 kpi-skeleton rounded mb-1" />
              ) : (
                <div className="text-[16px] font-roboto font-bold text-white mb-1">
                  ₹{(Number(lastMonthCardData.discountDelivered) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
              <div className="text-[12px] font-poppins text-white/50">
                {lastMonthCardData.discountCount} policies
              </div>
            </div>

            {/* Top Agent Section */}
            <div className="flex flex-col m-2 items-center">
              <Crown className="w-5 h-5 text-amber-400 mb-2 fill-current" />
              {isUpdating ? (
                <div className="h-6 w-24 kpi-skeleton rounded mb-1" />
              ) : (
                <div className="text-[16px] font-poppins font-semibold text-white mb-1">
                  {lastMonthCardData.topAgent?.name || 'Amardeep'}
                </div>
              )}
              <div className="text-[12px] font-poppins text-white/50">
                {Math.round(Number(lastMonthCardData.topAgent?.percent || 0))}% Achieved
              </div>
            </div>

            {/* Top Team Leader Section */}
            <div className="flex flex-col m-1 items-center">
              <Users className="w-5 h-5 text-cyan-400 mb-2 fill-current" />
              {isUpdating ? (
                <div className="h-6 w-24 kpi-skeleton rounded mb-1" />
              ) : (
                <div className="text-[16px] font-poppins font-semibold text-white mb-1">
                  {lastMonthCardData.topTeamLeader?.name || 'Ujjwal Kashyap'}
                </div>
              )}
              <div className="text-[12px] font-poppins text-white/50">
                {Math.round(Number(lastMonthCardData.topTeamLeader?.percent || 0))}% Achieved
              </div>
            </div>

            {/* Payments Section */}
            <div className="flex flex-col  m-1 items-center">
              <Coins className="w-5 h-5 text-emerald-400 mb-2 fill-current" />
              {isUpdating ? (
                <div className="h-6 w-24 kpi-skeleton rounded mb-1" />
              ) : (
                <div className="text-[16px] font-roboto font-bold text-white mb-1">
                  {lastMonthCardData.paymentCount || 0} Payments
                </div>
              )}
              <div className="text-[12px] font-poppins text-white/50">
                {Math.round(lastMonthCardData.paymentChangePercent || 0)}% {lastMonthCardData.paymentChangePercent >= 0 ? 'more' : 'less'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Performance Bar Graph Section */}
      <section className="relative mb-5">
        {/* Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
        {/* Ambient glow */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-[40px] pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-cyan-500/10 blur-[40px] pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-br from-[#6ee7b7] via-[#10b981] to-[#016130] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(16,185,129,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
              <div className="w-full h-full rounded-full glass-icon-circle bg-gradient-to-br from-[#10b981]/40 via-[#059669]/35 to-[#016130]/50 flex items-center justify-center backdrop-blur-md">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="20" x2="12" y2="10" />
                  <line x1="18" y1="20" x2="18" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="16" />
                </svg>
              </div>
            </div>
            <h3 className="font-poppins font-medium text-[17px] text-white tracking-wide">
              Agent Performance Overview
            </h3>
          </div>
        </div>

        {/* Bar Graph - Vertical Layout with Axes */}
        <div className="relative z-10 overflow-hidden">
          {isUpdating ? (
            <div className="h-64 kpi-skeleton rounded-lg" />
          ) : filteredAgentsList.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[#64748B] font-poppins text-sm">
              No agent data available
            </div>
          ) : (
            (() => {
              const actualMax = Math.max(...filteredAgentsList.map((a: any) => Number(a.percent || 0)), 100)
              const stageSize = Math.ceil(actualMax / 8)
              const maxPercent = actualMax + (stageSize * 2)
              const yAxisLabels = Array.from({ length: 9 }, (_, i) => Math.round(maxPercent - (maxPercent / 8) * i))
              return (
                <div className="flex items-end gap-2 h-[300px] overflow-x-auto pb-2 px-2">
                  {/* Y-axis labels */}
                  <div className="flex flex-col justify-between h-full text-[10px] font-roboto text-white/40 pr-2 shrink-0">
                    {yAxisLabels.map((label, i) => (
                      <span key={i}>{label}</span>
                    ))}
                  </div>
                  {/* Bars */}
                  <div className="flex items-end gap-2 h-full overflow-x-auto pb-2 scrollbar-hide">
                    {filteredAgentsList.slice(0, 30).map((agent: any, idx: number) => {
                      const ach = Number(agent.percent || 0)
                      const barColor = ach >= 100 ? 'bg-gradient-to-t from-[#10b981] to-[#6ee7b7]' :
                                        ach >= 75 ? 'bg-gradient-to-t from-[#8b5cf6] to-[#c4b5fd]' :
                                        ach >= 50 ? 'bg-gradient-to-t from-[#f97316] to-[#fbbf24]' :
                                        ach > 0 ? 'bg-gradient-to-t from-[#fb7185] to-[#fecdd3]' :
                                        'bg-gradient-to-t from-[#64748b] to-[#94a3b8]'
                      const barHeight = (ach / maxPercent) * 100
                      return (
                        <div key={`${agent.name}-${idx}`} className="flex flex-col items-center gap-1 shrink-0 w-12 h-full">
                          <div className="flex-1 w-6 rounded-full relative overflow-hidden">
                            <div
                              className={`absolute bottom-0 left-0 right-0 ${barColor} transition-all duration-500 ease-out rounded-full`}
                              style={{ height: `${Math.max(barHeight, 2)}%` }}
                            />
                          </div>
                          <div className="text-[9px] font-poppins text-white/60 truncate w-full text-center">
                            {agent.name.split(' ')[0]}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()
          )}
        </div>
      </section>

      {/* Agent Performance Records Section */}
      <section className="relative rounded-[16px] bg-[#0A0E17]/60 backdrop-blur-xl border border-white/[0.08] p-5 overflow-hidden shadow-xl shadow-black/20">
        {/* Ambient glow */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-[40px] pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-cyan-500/10 blur-[40px] pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400 drop-shadow-[0_2px_8px_rgba(52,211,153,0.4)] fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h3 className="font-poppins font-medium text-[17px] text-white tracking-wide">
              Agent Performance Records
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={exportToCSV}
              className="px-3 py-1.5 rounded-lg text-[12px] font-poppins font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50">Avatar</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50">Agent</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-right">Target</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-right">Score</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-right">NOP</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-right">Ach%</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-right">Pay Date</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-right">Aging</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-right">Pay Amt</th>
                <th className="pb-3 text-[13px] font-poppins font-medium text-white/50 text-right">Disc Amt</th>
              </tr>
            </thead>
            <tbody>
              {isUpdating ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td className="py-3.5 pr-4"><div className="h-10 w-10 kpi-skeleton rounded-full" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-32 kpi-skeleton rounded" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-16 kpi-skeleton rounded ml-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-16 kpi-skeleton rounded ml-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-12 kpi-skeleton rounded ml-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-14 kpi-skeleton rounded ml-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-20 kpi-skeleton rounded ml-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-12 kpi-skeleton rounded ml-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-16 kpi-skeleton rounded ml-auto" /></td>
                    <td className="py-3.5"><div className="h-6 w-12 kpi-skeleton rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredAgentsList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-sm text-[#64748B] font-poppins">
                    No agents found for this filter
                  </td>
                </tr>
              ) : (
                filteredAgentsList.slice(0, 10).map((agent: any, idx: number) => {
                  const initials = agent.name
                    ? agent.name.split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                    : 'AG'

                  return (
                    <tr key={`${agent.name}-${idx}`} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-slate-600 to-slate-800 flex items-center justify-center border border-white/10 shrink-0">
                          <span className="text-[13px] font-bold text-white/80">
                            {initials}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="font-poppins text-[15px] text-white truncate block max-w-[150px]">
                          {agent.name}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <span className="font-roboto text-[14px] text-white/80">
                          ₹{Number(agent.target || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <span className="font-roboto text-[14px] text-white/80">
                          ₹{Number(agent.score || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <span className="font-roboto text-[14px] text-white/80">
                          {agent.nop || 0}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <span className={`font-roboto text-[14px] font-bold ${
                          Number(agent.percent || 0) >= 100 ? 'text-emerald-400' :
                          Number(agent.percent || 0) >= 50 ? 'text-yellow-400' :
                          Number(agent.percent || 0) > 0 ? 'text-orange-400' : 'text-red-400'
                        }`}>
                          {Number(agent.percent || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <span className="font-roboto text-[13px] text-white/60">
                          {formatDate(agent.lastPaymentDate)}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <span className={`font-roboto text-[13px] font-bold ${
                          agent.paymentAging <= 30 ? 'text-emerald-400' :
                          agent.paymentAging <= 60 ? 'text-yellow-400' :
                          agent.paymentAging <= 90 ? 'text-orange-400' : 'text-red-400'
                        }`}>
                          {agent.paymentAging || 0}d
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <span className="font-roboto text-[13px] text-white/60">
                          {agent.lastPaymentAmount > 0 ? `₹${Number(agent.lastPaymentAmount).toLocaleString('en-IN')}` : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="font-roboto text-[13px] text-white/60">
                          {agent.discountAmount > 0 ? `₹${Number(agent.discountAmount).toLocaleString('en-IN')}` : '₹0'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
      </div>
    </div>
  )
}
