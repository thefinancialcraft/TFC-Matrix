'use client'

import { useEffect, useState, useMemo } from 'react'
import { Calendar, Settings, TrendingUp, Target, Users, AlertCircle, Award, Download } from 'lucide-react'

const formatLakhs = (val: number) => `₹${((val || 0) / 100000).toFixed(2)}L`

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

export default function MonthlyOverviewPage() {
  const parameterOptions = [
    'Target', 'Score', 'NOP', 'Ach%', 'Salary', 'Justification', 'Just Left', 'Gross',
    '50 Below', '50k+', '1L+', '1Yr NOP', 'Multi NOP', 'Disc Del', 'Disc #', 'Pay Amt',
    'Total Agents', 'Zero Score', 'Target Cleared', 'Just Cleared'
  ]

  const [monthlyCompanyData, setMonthlyCompanyData] = useState<any>({})
  const [availableMonths, setAvailableMonths] = useState<any[]>([])
  const [selectedParameters, setSelectedParameters] = useState<string[]>(parameterOptions)
  const [selectedMonths, setSelectedMonths] = useState<any[]>([])
  const [showParameterDropdown, setShowParameterDropdown] = useState(false)
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [isUpdating, setIsUpdating] = useState(true)

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        
        const data = await response.json()
        
        if (data.availableMonths && Array.isArray(data.availableMonths)) {
          const uniqueMonths = data.availableMonths
            .filter((month: any) => {
              if (!month.date) return false
              const date = new Date(month.date)
              const year = date.getFullYear()
              return !isNaN(date.getTime()) && year >= 2000 && year <= 2030
            })
            .filter((month: any, index: number, self: any[]) =>
              index === self.findIndex((m: any) => m.date === month.date)
            )
          setAvailableMonths(uniqueMonths)
          // Select only the latest 6 months by default
          setSelectedMonths(uniqueMonths.slice(0, 6))
        }

        if (data.monthlyCompanyData) {
          setMonthlyCompanyData(data.monthlyCompanyData)
        }
      } catch (error) {
        console.error('Error fetching monthly data:', error)
      } finally {
        setIsUpdating(false)
      }
    }

    fetchMonthlyData()
  }, [])

  const formatValue = (val: any, paramName: string) => {
    if (val === undefined || val === null || val === '') return '-'
    
    switch (paramName) {
      case 'Ach%':
        return `${Number(val).toFixed(1)}%`
      case 'Target':
      case 'Score':
      case 'Salary':
      case 'Justification':
      case 'Just Left':
      case 'Gross':
      case 'Disc Del':
      case 'Pay Amt':
        return `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      case 'Pay Date':
        return formatDate(val)
      case 'Days':
        return `${val}d`
      default:
        return val
    }
  }

  const getColorClass = (paramName: string, val: any) => {
    if (val === undefined || val === null || val === '' || val === '-') return 'text-white/60'
    
    switch (paramName) {
      case 'Ach%':
        const percent = Number(val)
        return percent >= 100 ? 'text-emerald-400' :
               percent >= 50 ? 'text-yellow-400' :
               percent > 0 ? 'text-orange-400' : 'text-red-400'
      case 'Days':
        const days = Number(val)
        return days <= 30 ? 'text-emerald-400' :
               days <= 60 ? 'text-yellow-400' :
               days <= 90 ? 'text-orange-400' : 'text-red-400'
      default:
        return 'text-white/80'
    }
  }

  const exportToCSV = () => {
    const headers = ['Month', ...selectedParameters]
    const rows = [...selectedMonths].reverse().map((month: any) => {
      const monthData = monthlyCompanyData[month.date] || {}
      return [
        month.name,
        ...selectedParameters.map(param => {
          const paramMapping: { [key: string]: string } = {
            'Target': 'target',
            'Score': 'score',
            'NOP': 'nop',
            'Ach%': 'percent',
            'Salary': 'salary',
            'Justification': 'justification',
            'Just Left': 'justLeft',
            'Gross': 'gross',
            '50 Below': 'fiftyBelow',
            '50k+': 'fiftykAbove',
            '1L+': 'oneLacAbove',
            '1Yr NOP': 'singleYrNop',
            'Multi NOP': 'multiYrNop',
            'Disc Del': 'discountDelivered',
            'Disc #': 'discountCount',
            'Pay Amt': 'payAmt',
            'Total Agents': 'totalAgents',
            'Zero Score': 'zeroScoreAgents',
            'Target Cleared': 'targetCompletedAgents',
            'Just Cleared': 'justificationClearedAgents'
          }
          const field = paramMapping[param] || param
          return monthData[field] !== undefined ? monthData[field] : '-'
        })
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row: (string | number)[]) => row.map((cell: string | number) => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'monthly_company_overview.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-8 pb-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-none mb-2">Monthly Overview</h1>
          <p className="text-sm text-[#8B949E]">Company performance aggregated by month</p>
        </div>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative h-[80px] p-4 pr-5 flex items-center justify-between rounded-br-[24px] overflow-hidden bg-transparent transition-all duration-300 group">
          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-br from-[#6ee7b7] via-[#10b981] to-[#016130] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(16,185,129,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#10b981]/40 via-[#059669]/35 to-[#016130]/50 flex items-center justify-center backdrop-blur-md">
              <Target size={22} className="text-white drop-shadow-[0_2px_8px_rgba(52,211,153,0.7)]" strokeWidth={2.2} />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="font-roboto text-[24px] font-bold text-white leading-none">
              {isUpdating ? '...' : selectedMonths.length}
            </span>
            <span className="font-poppins text-xs font-medium text-[#34d399] mt-1.5">
              Selected Months
            </span>
          </div>
        </div>

        <div className="relative h-[80px] p-4 pr-5 flex items-center justify-between rounded-br-[24px] overflow-hidden bg-transparent transition-all duration-300 group">
          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-br from-[#fcd34d] via-[#f59e0b] to-[#92400e] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(245,158,11,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f59e0b]/40 via-[#d97706]/35 to-[#92400e]/50 flex items-center justify-center backdrop-blur-md">
              <TrendingUp size={22} className="text-white drop-shadow-[0_2px_8px_rgba(245,158,11,0.7)]" strokeWidth={2.2} />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="font-roboto text-[24px] font-bold text-white leading-none">
              {isUpdating ? '...' : selectedMonths.reduce((sum: number, month: any) => sum + (monthlyCompanyData[month.date]?.score || 0), 0).toLocaleString('en-IN')}
            </span>
            <span className="font-poppins text-xs font-medium text-[#fbbf24] mt-1.5">
              Total Score
            </span>
          </div>
        </div>

        <div className="relative h-[80px] p-4 pr-5 flex items-center justify-between rounded-br-[24px] overflow-hidden bg-transparent transition-all duration-300 group">
          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4d1bb5] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(139,92,246,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8b5cf6]/40 via-[#7c3aed]/35 to-[#4d1bb5]/50 flex items-center justify-center backdrop-blur-md">
              <Users size={22} className="text-white drop-shadow-[0_2px_8px_rgba(167,139,250,0.7)]" strokeWidth={2.2} />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="font-roboto text-[24px] font-bold text-white leading-none">
              {isUpdating ? '...' : selectedMonths.reduce((sum: number, month: any) => sum + (monthlyCompanyData[month.date]?.nop || 0), 0).toLocaleString('en-IN')}
            </span>
            <span className="font-poppins text-xs font-medium text-[#a78bfa] mt-1.5">
              Total NOP
            </span>
          </div>
        </div>

        <div className="relative h-[80px] p-4 pr-5 flex items-center justify-between rounded-br-[24px] overflow-hidden bg-transparent transition-all duration-300 group">
          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-br from-[#fda4af] via-[#f43f5e] to-[#8f244c] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(244,63,94,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f43f5e]/40 via-[#e11d48]/35 to-[#8f244c]/50 flex items-center justify-center backdrop-blur-md">
              <AlertCircle size={22} className="text-white drop-shadow-[0_2px_8px_rgba(251,113,133,0.7)]" strokeWidth={2.2} />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="font-roboto text-[24px] font-bold text-white leading-none">
              {isUpdating ? '...' : selectedMonths.reduce((sum: number, month: any) => sum + (monthlyCompanyData[month.date]?.zeroScoreAgents || 0), 0).toLocaleString('en-IN')}
            </span>
            <span className="font-poppins text-xs font-medium text-[#fb7185] mt-1.5">
              Zero Score
            </span>
          </div>
        </div>
      </div>

      {/* Matrix Section */}
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
            <h3 className="font-poppins ml-2 font-medium text-[17px] text-white tracking-wide">
              Company Monthly Matrix
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="px-3 py-1.5 rounded-lg text-[12px] font-poppins font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
            >
              <Download size={16} />
              Export CSV
            </button>
            {/* Filter Card */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-gray-700">
              {/* Month Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                  className="text-[11px] font-poppins font-medium text-white/80 flex items-center gap-2 transition-all"
                >
                  <span>{selectedMonths.length} months</span>
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showMonthDropdown && (
                  <div className="absolute right-0 mt-2 z-[1000] w-48 bg-gray-900 border-2 border-gray-700 rounded-2xl shadow-2xl max-h-64 overflow-y-auto scrollbar-hide">
                    {availableMonths.map((month) => (
                      <button
                        key={month.date}
                        onClick={() => {
                          if (selectedMonths.find(m => m.date === month.date)) {
                            setSelectedMonths(selectedMonths.filter(m => m.date !== month.date))
                          } else {
                            setSelectedMonths([...selectedMonths, month])
                          }
                        }}
                        className={`w-full px-3 py-2 text-left text-[11px] font-poppins font-medium transition-colors flex items-center gap-2 ${
                        selectedMonths.find(m => m.date === month.date) ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 text-blue-400' : 'text-white/70'
                      }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedMonths.find(m => m.date === month.date) ? 'border-blue-500 bg-blue-500' : 'border-gray-600'
                        }`}>
                          {selectedMonths.find(m => m.date === month.date) && (
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        {month.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              {/* Parameter Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowParameterDropdown(!showParameterDropdown)}
                  className="text-[11px] font-poppins font-medium text-white/80 flex items-center gap-2 transition-all"
                >
                  <span>{selectedParameters.length} parameters</span>
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showParameterDropdown && (
                  <div className="absolute right-0 mt-2 z-[1000] w-64 bg-gray-900 border-2 border-gray-700 rounded-2xl shadow-2xl max-h-64 overflow-y-auto scrollbar-hide">
                    {parameterOptions.map((param) => (
                      <button
                        key={param}
                        onClick={() => {
                          if (selectedParameters.includes(param)) {
                            setSelectedParameters(selectedParameters.filter(p => p !== param))
                          } else {
                            setSelectedParameters([...selectedParameters, param])
                          }
                        }}
                        className={`w-full px-3 py-2 text-left text-[11px] font-poppins font-medium transition-colors flex items-center gap-2 ${
                        selectedParameters.includes(param) ? 'bg-gradient-to-r from-cyan-900/50 to-cyan-800/50 text-cyan-400' : 'text-white/70'
                      }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedParameters.includes(param) ? 'border-cyan-500 bg-cyan-500' : 'border-gray-600'
                        }`}>
                          {selectedParameters.includes(param) && (
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        {param}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="relative overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50">Parameter</th>
                {selectedMonths.length > 0 ? [...selectedMonths].reverse().map((month) => (
                  <th key={month.date} className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">
                    {month.name}
                  </th>
                )) : (
                  <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">No Data</th>
                )}
              </tr>
            </thead>
            <tbody>
              {isUpdating ? (
                <tr>
                  <td colSpan={availableMonths.length + 1} className="py-10 text-center text-sm text-[#64748B] font-poppins">
                    Loading...
                  </td>
                </tr>
              ) : availableMonths.length === 0 ? (
                <tr>
                  <td colSpan={availableMonths.length + 1} className="py-10 text-center text-sm text-[#64748B] font-poppins">
                    No monthly data available
                  </td>
                </tr>
              ) : (
                selectedParameters.map((param) => (
                  <tr key={param} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                    <td className="py-2 pr-4">
                      <span className="font-roboto text-[11px] text-white/40 block">{param}</span>
                    </td>
                    {[...selectedMonths].reverse().map((month) => {
                      const monthData = monthlyCompanyData[month.date] || {}
                      const paramMapping: { [key: string]: string } = {
                        'Target': 'target',
                        'Score': 'score',
                        'NOP': 'nop',
                        'Ach%': 'percent',
                        'Salary': 'salary',
                        'Justification': 'justification',
                        'Just Left': 'justLeft',
                        'Gross': 'gross',
                        '50 Below': 'fiftyBelow',
                        '50k+': 'fiftykAbove',
                        '1L+': 'oneLacAbove',
                        '1Yr NOP': 'singleYrNop',
                        'Multi NOP': 'multiYrNop',
                        'Disc Del': 'discountDelivered',
                        'Disc #': 'discountCount',
                        'Pay Amt': 'payAmt',
                        'Total Agents': 'totalAgents',
                        'Zero Score': 'zeroScoreAgents',
                        'Target Cleared': 'targetCompletedAgents',
                        'Just Cleared': 'justificationClearedAgents'
                      }
                      const field = paramMapping[param] || param
                      const value = monthData[field] !== undefined ? monthData[field] : '-'
                      
                      return (
                        <td key={month.date} className="py-2 pr-4 text-center">
                          <span className={`font-roboto text-[13px] ${getColorClass(param, value)}`}>
                            {formatValue(value, param)}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
