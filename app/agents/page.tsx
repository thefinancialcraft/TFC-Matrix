'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { Users, Target, TrendingUp, AlertCircle, Trophy, Calendar, User, Settings } from 'lucide-react'

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

export default function AgentsPage() {
  const [agentsList, setAgentsList] = useState<any[]>([])
  const [isUpdating, setIsUpdating] = useState(true)
  const [viewMode, setViewMode] = useState<'records' | 'matrix'>('records')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string[]>([])
  const [selectedParameter, setSelectedParameter] = useState<string[]>([])
  const [availableMonths, setAvailableMonths] = useState<any[]>([])
  const [monthlyAgentsData, setMonthlyAgentsData] = useState<any>({})
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showParameterDropdown, setShowParameterDropdown] = useState(false)
  const [recordMonth, setRecordMonth] = useState<string>('')
  const [selectedTeamLeader, setSelectedTeamLeader] = useState<string>('')
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  const monthDropdownRef = useRef<HTMLDivElement>(null)
  const parameterDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setShowMonthDropdown(false)
      }
      if (parameterDropdownRef.current && !parameterDropdownRef.current.contains(event.target as Node)) {
        setShowParameterDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    const totalMembers = agentsList.length
    const targetCompleted = agentsList.filter(a => Number(a.percent || 0) >= 100).length
    const onZero = agentsList.filter(a => Number(a.percent || 0) === 0).length
    const justificationCleared = agentsList.filter(a => Number(a.percent || 0) >= 50).length
    // Performers: agents with target completed for last 3 months (simulated based on current data)
    const performers = agentsList.filter(a => Number(a.percent || 0) >= 100).length

    return {
      totalMembers,
      targetCompleted,
      onZero,
      justificationCleared,
      performers
    }
  }, [agentsList])

  // Filter agents based on search query
  const filteredAgentsList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return agentsList.filter(agent => {
      const matchesSearch = !query || (agent.name && agent.name.toLowerCase().includes(query))
      const matchesTeamLeader = !selectedTeamLeader || agent.team === selectedTeamLeader
      return matchesSearch && matchesTeamLeader
    })
  }, [agentsList, searchQuery, selectedTeamLeader])

  const availableTeamLeaders = useMemo(() => {
    return Array.from(new Set(agentsList.map(agent => agent.team).filter(Boolean))).sort()
  }, [agentsList])

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        console.log('Fetching agents data...')
        const response = await fetch(recordMonth ? `/api/dashboard?month=${encodeURIComponent(recordMonth)}` : '/api/dashboard')
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Received data:', data)
        
        if (data.allAgents && Array.isArray(data.allAgents)) {
          const sortedAgents = [...data.allAgents].sort((a, b) => Number(b.percent || 0) - Number(a.percent || 0))
          setAgentsList(sortedAgents)
        } else {
          console.error('Invalid data format:', data)
          setAgentsList([])
        }

        if (data.availableMonths && Array.isArray(data.availableMonths)) {
          // Deduplicate months based on date and filter out invalid dates (year 00, 99, etc.)
          const uniqueMonths = data.availableMonths
            .filter((month: any) => {
              // Filter out invalid dates like year 00, 99, etc.
              if (!month.date) return false
              
              // Try to parse the date and check if it's valid
              const date = new Date(month.date)
              const year = date.getFullYear()
              
              // Only allow years between 2000 and 2030
              return !isNaN(date.getTime()) && year >= 2000 && year <= 2030
            })
            .filter((month: any, index: number, self: any[]) =>
              index === self.findIndex((m: any) => m.date === month.date)
            )
          setAvailableMonths(uniqueMonths)
          if (!recordMonth && uniqueMonths.length > 0) {
            setRecordMonth(uniqueMonths[0].date)
          }
          if (uniqueMonths.length > 0) {
            // Select 6 months by default (6M)
            const monthsToSelect = Math.min(6, uniqueMonths.length)
            setSelectedMonth(uniqueMonths.slice(0, monthsToSelect).map((m: any) => m.date))
          }
        }

        if (data.monthlyAgentsData) {
          setMonthlyAgentsData(data.monthlyAgentsData)
        }
      } catch (error) {
        console.error('Error fetching agents:', error)
        setAgentsList([])
      } finally {
        setIsUpdating(false)
      }
    }

    fetchAgents()
  }, [recordMonth])

  const exportToCSV = () => {
    if (viewMode === 'matrix') {
      // Export matrix data
      const headers = ['Agent', 'Parameter', ...selectedMonth.map(date => {
        const month = availableMonths.find(m => m.date === date)
        return month?.name || date
      })]
      
      const rows: (string | number)[][] = []
      filteredAgentsList.forEach((agent: any) => {
        selectedParameter.forEach((param) => {
          const row = [agent.name, param]
          selectedMonth.forEach((monthDate) => {
            const agentMonthData = monthlyAgentsData[monthDate]?.find((a: any) => a.name === agent.name)
            const paramMapping: { [key: string]: string } = {
              'Ach%': 'percent',
              'Score': 'score',
              'NOP': 'nop',
              'Pay Date': 'payDate',
              'Days': 'days',
              'Salary': 'salary',
              'Team': 'team',
              'Target': 'target',
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
              'Pay Amt': 'payAmt'
            }
            const field = paramMapping[param] || param
            const value = agentMonthData?.[field] !== undefined ? agentMonthData[field] : '-'
            
            // Format value based on parameter type
            let formattedValue = value
            if (value === '-' || value === undefined || value === null) {
              formattedValue = '-'
            } else {
              switch (param) {
                case 'Ach%':
                  formattedValue = `${Number(value).toFixed(1)}%`
                  break
                case 'Score':
                case 'Salary':
                case 'Target':
                case 'Justification':
                case 'Just Left':
                case 'Gross':
                case 'Disc Del':
                case 'Pay Amt':
                  formattedValue = `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                  break
                case 'Pay Date':
                  formattedValue = formatDate(value)
                  break
                case 'Days':
                  formattedValue = `${value}d`
                  break
                default:
                  formattedValue = value
              }
            }
            row.push(formattedValue)
          })
          rows.push(row)
        })
      })

      const csvContent = [
        headers.join(','),
        ...rows.map((row: (string | number)[]) => row.map((cell: string | number) => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'agents_matrix.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Export records data
      const headers = ['Name', 'NOP', 'Score', 'Ach%', 'Pay Date', 'Days', 'Salary', 'Team', 'Target', 'Justification', 'Just Left', 'Gross', '50 Below', '50k+', '1L+', '1Yr NOP', 'Multi NOP', 'Disc Del', 'Disc #', 'Pay Amt']
      const rows = filteredAgentsList.map((agent: any) => [
        agent.name,
        agent.nop || 0,
        Number(agent.score || 0),
        Number(agent.percent || 0).toFixed(1) + '%',
        formatDate(agent.lastPaymentDate),
        agent.paymentAging || 0,
        agent.salary ? `₹${Number(agent.salary).toLocaleString('en-IN')}` : 'N/A',
        agent.team || 'N/A',
        Number(agent.target || 0),
        agent.justification ? `₹${Number(agent.justification).toLocaleString('en-IN')}` : 'N/A',
        agent.justLeft ? `₹${Number(agent.justLeft).toLocaleString('en-IN')}` : 'N/A',
        Number(agent.grossScore || 0),
        agent.fiftyBelowAbove || 0,
        agent.fiftykAbove || 0,
        agent.oneLacAbove || 0,
        agent.singleYrCount || 0,
        agent.multiYrCount || 0,
        agent.discountDelivered ? `₹${Number(agent.discountDelivered).toLocaleString('en-IN')}` : 'N/A',
        agent.discountCount || 0,
        agent.lastPaymentAmount > 0 ? Number(agent.lastPaymentAmount) : 0
      ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row: (string | number)[]) => row.map((cell: string | number) => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'agents_records.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
        <div>
          <h1 className="silver-shimmer-text font-poppins text-[24px] sm:text-[28px] font-normal tracking-normal leading-none mb-2">Agents Dashboard</h1>
        </div>
        <label className="flex items-center gap-2 text-xs font-poppins text-[#94A3B8]">
          <Calendar size={14} className="text-cyan-400" />
          <span>Month</span>
          <select
            value={recordMonth}
            onChange={(event) => setRecordMonth(event.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
          >
            {availableMonths.map((month) => (
              <option key={month.date} value={month.date} className="bg-[#0A0E17] text-white">
                {month.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Members */}
        <div className="relative h-[80px] p-4 pr-5 flex items-center justify-between rounded-br-[24px] overflow-hidden bg-transparent transition-all duration-300 group">
          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-br from-[#94a3b8] via-[#64748b] to-[#334155] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(100,116,139,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#64748b]/40 via-[#475569]/35 to-[#334155]/50 flex items-center justify-center backdrop-blur-md">
              <Users size={22} className="text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.5)]" strokeWidth={2.2} />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="font-roboto text-[24px] font-bold text-white leading-none">
              {isUpdating ? '...' : kpiMetrics.totalMembers}
            </span>
            <span className="font-poppins text-xs font-medium text-[#94a3b8] mt-1.5">
              Total Members
            </span>
          </div>
        </div>

        {/* Justification Cleared */}
        <div className="relative h-[80px] p-4 pr-5 flex items-center justify-between rounded-br-[24px] overflow-hidden bg-transparent transition-all duration-300 group">
          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4d1bb5] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(139,92,246,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8b5cf6]/40 via-[#7c3aed]/35 to-[#4d1bb5]/50 flex items-center justify-center backdrop-blur-md">
              <TrendingUp size={22} className="text-white drop-shadow-[0_2px_8px_rgba(167,139,250,0.7)]" strokeWidth={2.2} />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="font-roboto text-[24px] font-bold text-white leading-none">
              {isUpdating ? '...' : kpiMetrics.justificationCleared}
            </span>
            <span className="font-poppins text-xs font-medium text-[#a78bfa] mt-1.5">
              Just. Cleared
            </span>
          </div>
        </div>

        {/* Target Completed */}
        <div className="relative h-[80px] p-4 pr-5 flex items-center justify-between rounded-br-[24px] overflow-hidden bg-transparent transition-all duration-300 group">
          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-br from-[#6ee7b7] via-[#10b981] to-[#016130] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(16,185,129,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#10b981]/40 via-[#059669]/35 to-[#016130]/50 flex items-center justify-center backdrop-blur-md">
              <Target size={22} className="text-white drop-shadow-[0_2px_8px_rgba(52,211,153,0.7)]" strokeWidth={2.2} />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="font-roboto text-[24px] font-bold text-white leading-none">
              {isUpdating ? '...' : kpiMetrics.targetCompleted}
            </span>
            <span className="font-poppins text-xs font-medium text-[#34d399] mt-1.5">
              Target Cleared
            </span>
          </div>
        </div>

        {/* On Zero */}
        <div className="relative h-[80px] p-4 pr-5 flex items-center justify-between rounded-br-[24px] overflow-hidden bg-transparent transition-all duration-300 group">
          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-br from-[#fda4af] via-[#f43f5e] to-[#8f244c] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(244,63,94,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f43f5e]/40 via-[#e11d48]/35 to-[#8f244c]/50 flex items-center justify-center backdrop-blur-md">
              <AlertCircle size={22} className="text-white drop-shadow-[0_2px_8px_rgba(251,113,133,0.7)]" strokeWidth={2.2} />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="font-roboto text-[24px] font-bold text-white leading-none">
              {isUpdating ? '...' : kpiMetrics.onZero}
            </span>
            <span className="font-poppins text-xs font-medium text-[#fb7185] mt-1.5">
              On Zero
            </span>
          </div>
        </div>

        {/* Performers */}
        <div className="relative h-[80px] p-4 pr-5 flex items-center justify-between rounded-br-[24px] overflow-hidden bg-transparent transition-all duration-300 group">
          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-br from-[#fcd34d] via-[#f59e0b] to-[#92400e] shrink-0 flex items-center justify-center shadow-[0_4px_16px_rgba(245,158,11,0.35),0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f59e0b]/40 via-[#d97706]/35 to-[#92400e]/50 flex items-center justify-center backdrop-blur-md">
              <Trophy size={22} className="text-white drop-shadow-[0_2px_8px_rgba(245,158,11,0.7)]" strokeWidth={2.2} />
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="font-roboto text-[24px] font-bold text-white leading-none">
              {isUpdating ? '...' : kpiMetrics.performers}
            </span>
            <span className="font-poppins text-xs font-medium text-[#fbbf24] mt-1.5">
              Performers
            </span>
          </div>
        </div>
      </div>

      {/* Agent Performance Records Section */}
      <section className="relative p-5">
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
              Agent Performance Records
            </h3>
          </div>
          <div className="flex items-center  gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-[12px] font-poppins placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            {/* View Mode Toggle */}
            <div className="relative">
              <div className="flex items-center gap-2 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('records')}
                  className={`px-4 py-1.5 rounded-md text-[12px] font-poppins font-medium transition-all duration-300 ease-in-out ${
                    viewMode === 'records'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-white/60 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  Records
                </button>
                <button
                  onClick={() => {
                    setSelectedTimeRange('6M')
                    setSelectedParameter(['Ach%'])
                    const monthsToSelect = Math.min(6, availableMonths.length)
                    setSelectedMonth(availableMonths.slice(0, monthsToSelect).map((m: any) => m.date))
                    setShowFilterModal(true)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-poppins font-medium transition-all ${
                    viewMode === 'matrix'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-white/60 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  Matrix
                </button>
              </div>

              {/* Filter Widget */}
              {showFilterModal && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 bg-black/20 z-[9998] pointer-events-none" />
                  {/* Modal */}
                  <div className="absolute top-full left-0 mt-2 z-[9999] bg-white rounded-xl shadow-2xl w-[240px]">
                    {/* Header */}
                    <div className="px-3 py-3 ">
                      <h3 className="font-poppins font-semibold text-[14px] pl-2 text-gray-800">Select Filter</h3>
                    </div>

                    {/* Body */}
                    <div className=" pl-3 pr-3 flex flex-col gap-3">
                    {/* Months Dropdown */}
                    <div className="relative" ref={monthDropdownRef}>
                      <label className="block font-poppins font-medium text-[12px] text-gray-700 mb-1  flex items-center gap-1.5">
                        <Calendar size={12} className="text-gray-500" />
                        Months
                      </label>
                      <button
                        onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                        className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 text-gray-700 text-[11px] font-poppins font-medium flex items-center justify-between transition-all"
                      >
                        <span>
                          {selectedTimeRange
                            ? selectedTimeRange
                            : selectedMonth.length > 0
                              ? selectedMonth.length === 1
                                ? availableMonths.find(m => m.date === selectedMonth[0])?.name || 'Select month'
                                : `${selectedMonth.length} months selected`
                              : 'Select month'}
                        </span>
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showMonthDropdown && (
                        <div className="absolute z-[1000] w-full mt-1 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-32 overflow-y-auto scrollbar-hide">
                          {availableMonths.map((month) => (
                            <button
                              key={month.date}
                              onClick={() => {
                                if (selectedMonth.includes(month.date)) {
                                  setSelectedMonth(selectedMonth.filter(m => m !== month.date))
                                } else {
                                  setSelectedMonth([...selectedMonth, month.date])
                                }
                              }}
                              className={`w-full px-3 py-2 text-left text-[11px] font-poppins font-medium transition-colors flex items-center gap-2 ${
                                selectedMonth.includes(month.date) ? 'bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700' : 'text-gray-700'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedMonth.includes(month.date) ? 'border-cyan-500 bg-cyan-500' : 'border-gray-300'
                              }`}>
                                {selectedMonth.includes(month.date) && (
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
                      
                      {/* Time Range Badges */}
                      <div className="flex gap-2 mt-2">
                        {['3M', '5M', '6M'].map((range) => (
                          <button
                            key={range}
                            onClick={() => {
                              setSelectedTimeRange(range)
                              const monthsToSelect = parseInt(range)
                              // Get the most recent months from availableMonths
                              const recentMonths = availableMonths.slice(0, monthsToSelect)
                              setSelectedMonth(recentMonths.map(m => m.date))
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-poppins font-medium transition-colors ${
                              selectedTimeRange === range
                                ? 'bg-cyan-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Parameter Dropdown */}
                    <div className="relative" ref={parameterDropdownRef}>
                      <label className="block font-poppins font-medium text-[12px] text-gray-700 mb-1 flex items-center gap-1.5">
                        <Settings size={12} className="text-gray-500" />
                        Parameter
                      </label>
                      <button
                        onClick={() => setShowParameterDropdown(!showParameterDropdown)}
                        className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 text-gray-700 text-[11px] font-poppins font-medium flex items-center justify-between transition-all"
                      >
                        <span>
                          {selectedParameter.length > 0 ? `${selectedParameter.length} selected` : 'Select parameter'}
                        </span>
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showParameterDropdown && (
                        <div className="absolute z-[1000] w-full mt-1 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-32 overflow-y-auto scrollbar-hide">
                          {[
                            'NOP', 'Score', 'Ach%', 'Pay Date', 'Days', 'Salary', 'Team', 'Target',
                            'Justification', 'Just Left', 'Gross', '50 Below', '50k+', '1L+', '1Yr NOP', 'Multi NOP', 'Disc Del', 'Disc #', 'Pay Amt'
                          ].map((param) => (
                            <button
                              key={param}
                              onClick={() => {
                                if (selectedParameter.includes(param)) {
                                  setSelectedParameter(selectedParameter.filter(p => p !== param))
                                } else if (selectedParameter.length < 3) {
                                  setSelectedParameter([...selectedParameter, param])
                                }
                              }}
                              className={`w-full px-3 py-2 text-left text-[11px] font-poppins font-medium transition-colors flex items-center gap-2 ${
                                selectedParameter.includes(param) ? 'bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700' : 'text-gray-700'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedParameter.includes(param) ? 'border-cyan-500 bg-cyan-500' : 'border-gray-300'
                              }`}>
                                {selectedParameter.includes(param) && (
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
                      
                      {/* Quick Parameter Buttons */}
                      <div className="flex gap-2 mt-2">
                        {['Ach%', 'Score', 'NOP'].map((param) => (
                          <button
                            key={param}
                            onClick={() => {
                              setSelectedParameter([param])
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-poppins font-medium transition-colors ${
                              selectedParameter.length === 1 && selectedParameter[0] === param
                                ? 'bg-cyan-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {param}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Team Leader Dropdown */}
                    <div className="relative">
                      <label className="block font-poppins font-medium text-[12px] text-gray-700 mb-1 flex items-center gap-1.5">
                        <Users size={12} className="text-gray-500" />
                        Team Leader
                      </label>
                      <select
                        value={selectedTeamLeader}
                        onChange={(event) => setSelectedTeamLeader(event.target.value)}
                        className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 text-gray-700 text-[11px] font-poppins font-medium outline-none"
                      >
                        <option value="">All Team Leaders</option>
                        {availableTeamLeaders.map((teamLeader) => (
                          <option key={teamLeader} value={teamLeader}>{teamLeader}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-3 py-3 mt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedMonth([])
                        setSelectedParameter([])
                        setSelectedTeamLeader('')
                        setSelectedTimeRange('')
                      }}
                      className="flex-1 px-2.5 py-2 rounded-lg text-[11px] font-poppins font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('matrix')
                        setShowFilterModal(false)
                      }}
                      className="flex-1 px-2.5 py-2 rounded-lg text-[11px] font-poppins font-medium text-white bg-cyan-500 hover:bg-cyan-600 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
                </>
              )}
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
        </div>

        {/* Table */}
        {viewMode === 'records' ? (
          <div className="relative  overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50">Avatar</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Name</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">NOP</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Score</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Ach%</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Pay Date</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Days</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Salary</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Team</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Target</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Justification</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Just Left</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Gross</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">50 Below</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">50k+</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">1L+</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">1Yr NOP</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Multi NOP</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Disc Del</th>
                <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Disc #</th>
                <th className="pb-3 text-[13px] font-poppins font-medium text-white/50 text-center">Pay Amt</th>
              </tr>
            </thead>
            <tbody>
              {isUpdating ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td className="py-3.5 pr-4"><div className="h-10 w-10 kpi-skeleton rounded-full mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-32 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-12 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-16 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-14 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-20 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-12 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-16 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-16 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-16 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-14 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-12 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-12 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-12 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-12 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-12 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-16 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-14 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-14 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5 pr-4"><div className="h-6 w-16 kpi-skeleton rounded mx-auto" /></td>
                    <td className="py-3.5"><div className="h-6 w-16 kpi-skeleton rounded mx-auto" /></td>
                  </tr>
                ))
              ) : filteredAgentsList.length === 0 ? (
                <tr>
                  <td colSpan={21} className="py-10 text-center text-sm text-[#64748B] font-poppins">
                    No agents found
                  </td>
                </tr>
              ) : (
                filteredAgentsList.map((agent: any, idx: number) => {
                  const initials = agent.name
                    ? agent.name.split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                    : 'AG'

                  return (
                    <tr key={`${agent.name}-${idx}`} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-slate-600 to-slate-800 flex items-center justify-center border border-white/10 shrink-0 mx-auto">
                          <span className="text-[13px] font-bold text-white/80">{initials}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-poppins text-[13px] text-white block">{agent.name}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/80">{agent.nop || 0}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/80">₹{Number(agent.score || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className={`font-roboto text-[13px] font-bold ${
                          Number(agent.percent || 0) >= 100 ? 'text-emerald-400' :
                          Number(agent.percent || 0) >= 50 ? 'text-yellow-400' :
                          Number(agent.percent || 0) > 0 ? 'text-orange-400' : 'text-red-400'
                        }`}>
                          {Number(agent.percent || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/60">{formatDate(agent.lastPaymentDate)}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className={`font-roboto text-[13px] font-bold ${
                          agent.paymentAging <= 30 ? 'text-emerald-400' :
                          agent.paymentAging <= 60 ? 'text-yellow-400' :
                          agent.paymentAging <= 90 ? 'text-orange-400' : 'text-red-400'
                        }`}>
                          {agent.paymentAging || 0}d
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/60">{agent.salary ? `₹${Number(agent.salary).toLocaleString('en-IN')}` : 'N/A'}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/60">{agent.team || 'N/A'}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/80">₹{Number(agent.target || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/60">{agent.justification ? `₹${Number(agent.justification).toLocaleString('en-IN')}` : 'N/A'}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/60">{agent.justLeft ? `₹${Number(agent.justLeft).toLocaleString('en-IN')}` : 'N/A'}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/60">₹{Number(agent.grossScore || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/60">{agent.fiftyBelowAbove || 0}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/60">{agent.fiftykAbove || 0}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/60">{agent.oneLacAbove || 0}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/80">{agent.singleYrCount || 0}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/80">{agent.multiYrCount || 0}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/60">{agent.discountDelivered ? `₹${Number(agent.discountDelivered).toLocaleString('en-IN')}` : 'N/A'}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="font-roboto text-[13px] text-white/80">{agent.discountCount || 0}</span>
                      </td>
                      <td className="py-3.5 text-center">
                        <span className="font-roboto text-[13px] text-white/60">{agent.lastPaymentAmount > 0 ? `₹${Number(agent.lastPaymentAmount).toLocaleString('en-IN')}` : 'N/A'}</span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        ) : (
          /* Matrix View */
          <div className="relative overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50">Avatar</th>
                  <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50">Agent</th>
                  <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50">Parameter</th>
                  {selectedMonth.length > 0 ? [...selectedMonth].reverse().map((monthDate) => {
                    const month = availableMonths.find(m => m.date === monthDate)
                    return (
                      <th key={monthDate} className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">
                        {month?.name || 'Month'}
                      </th>
                    )
                  }) : (
                    <th className="pb-3 pr-4 text-[13px] font-poppins font-medium text-white/50 text-center">Select Months</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {isUpdating ? (
                  <tr>
                    <td colSpan={selectedMonth.length + 2} className="py-10 text-center text-sm text-[#64748B] font-poppins">
                      Loading...
                    </td>
                  </tr>
                ) : filteredAgentsList.length === 0 ? (
                  <tr>
                    <td colSpan={selectedMonth.length + 2} className="py-10 text-center text-sm text-[#64748B] font-poppins">
                      No agents found
                    </td>
                  </tr>
                ) : (
                  filteredAgentsList.map((agent: any, idx: number) => {
                    const initials = agent.name
                      ? agent.name.split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                      : 'AG'

                    return (
                      selectedParameter.map((param, paramIdx) => (
                        <tr key={`${agent.name}-${param}`} className={`${paramIdx === selectedParameter.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.03] transition-colors`}>
                          {paramIdx === 0 ? (
                            <>
                              <td rowSpan={selectedParameter.length} className="py-3  align-top">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-slate-600 to-slate-800 flex items-center justify-center border border-white/10 shrink-0">
                                  <span className="text-[11px] font-bold text-white/80">{initials}</span>
                                </div>
                              </td>
                              <td rowSpan={selectedParameter.length} className="py-4 pr-4 align-top">
                                <span className="font-poppins text-[13px] text-white block">{agent.name}</span>
                              </td>
                            </>
                          ) : null}
                          <td className="py-2 pr-4">
                            <span className="font-roboto text-[11px] text-white/40 block">{param}</span>
                          </td>
                        {selectedMonth.length > 0 ? [...selectedMonth].reverse().map((monthDate) => {
                          const monthData = monthlyAgentsData[monthDate] || []
                          const agentMonthData = monthData.find((m: any) => m.name === agent.name) || {}
                          
                          // Map parameter names to backend field names
                          const paramMapping: { [key: string]: string } = {
                            'Ach%': 'percent',
                            'Score': 'score',
                            'NOP': 'nop',
                            'Pay Date': 'payDate',
                            'Days': 'days',
                            'Salary': 'salary',
                            'Team': 'team',
                            'Target': 'target',
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
                            'Pay Amt': 'payAmt'
                          }
                          
                          const field = paramMapping[param] || param
                          const value = agentMonthData[field] !== undefined ? agentMonthData[field] : '-'
                          
                          // Format value based on parameter type
                          const formatValue = (val: any, paramName: string) => {
                            if (val === '-' || val === undefined || val === null) return '-'
                            
                            switch (paramName) {
                              case 'Ach%':
                                return `${Number(val).toFixed(1)}%`
                              case 'Score':
                              case 'Salary':
                              case 'Target':
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
                              case 'Team':
                                return val
                              default:
                                return val
                            }
                          }
                          
                          const formattedValue = formatValue(value, param)
                          
                          // Determine color based on parameter type and value
                          const getColorClass = (paramName: string, val: any) => {
                            if (val === '-' || val === undefined || val === null) return 'text-white/60'
                            
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
                          
                          return (
                            <td key={monthDate} className="py-2 pr-4 text-center">
                              <span className={`font-roboto text-[13px] ${getColorClass(param, value)}`}>
                                {formattedValue}
                              </span>
                            </td>
                          )
                        }) : (
                          <td className="py-2 pr-4 text-center">
                            <span className="font-roboto text-[13px] text-white/60">-</span>
                          </td>
                        )}
                      </tr>
                    )))
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
