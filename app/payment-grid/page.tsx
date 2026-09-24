'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CreditCard, RefreshCw, Search } from 'lucide-react'

const COLUMNS = [
  'proposal_no', 'payment_date', 'policy_holder_name', 'insurance_company', 'plan_name',
  'tenure', 'premium', 'net_premium', 'discount_offer', 'updated_premium', 'employee_name',
  'team', 'relationship_manager', 'booking_id', 'number_of_members', 'pincode', 'city',
  'district', 'state', 'country', 'payment_month', 'effective_date', 'next_renewal_date',
  'month', 'policy_type', 'health_checkup', 'extra_bonus', 'discount_offer_type',
  'previous_company', 'business_type', 'assistant_team', 'agent_code', 'grade', 'lead_source',
  'payment_proof', 'created_at', 'sync'
]

const formatDateInput = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getInitialDates = () => {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  return { startDate: formatDateInput(firstDay), endDate: formatDateInput(today) }
}

const formatHeader = (column: string) => column
  .split('_')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ')

const displayValue = (column: string, value: unknown) => {
  if (value === null || value === undefined || value === '') return '-'
  if (column === 'payment_date') {
    const date = new Date(String(value))
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  }
  return String(value)
}

export default function PaymentGridPage() {
  const initialDates = getInitialDates()
  const [startDate, setStartDate] = useState(initialDates.startDate)
  const [endDate, setEndDate] = useState(initialDates.endDate)
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [agentFilter, setAgentFilter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)
  const cacheKey = `tfc-payment-grid:${startDate}:${endDate}`

  const fetchPayments = async () => {
    if (!startDate || !endDate) {
      setError('Please select both payment dates.')
      return
    }
    if (startDate > endDate) {
      setError('Start date cannot be after end date.')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/payment-responses?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`)
      const payload = await response.json()
      if (!response.ok || payload.error) throw new Error(payload.error || 'Unable to load payments.')
      const sortedRows = Array.isArray(payload.data)
        ? [...payload.data].sort((firstRow, secondRow) => {
            const firstTime = new Date(String(firstRow.payment_date || '')).getTime()
            const secondTime = new Date(String(secondRow.payment_date || '')).getTime()
            return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime)
          })
        : []
      setRows(sortedRows)
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          rows: sortedRows,
          savedAt: new Date().toISOString()
        }))
      } catch (storageError) {
        console.warn('Unable to cache Payment Grid data:', storageError)
      }
      setHasLoaded(true)
    } catch (fetchError) {
      setRows([])
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load payments.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    try {
      const cachedData = localStorage.getItem(cacheKey)
      if (!cachedData) {
        setRows([])
        setHasLoaded(false)
        return
      }

      const parsedCache = JSON.parse(cachedData)
      if (Array.isArray(parsedCache.rows)) {
        setRows(parsedCache.rows)
        setHasLoaded(true)
      }
    } catch (storageError) {
      console.warn('Unable to read cached Payment Grid data:', storageError)
      setRows([])
      setHasLoaded(false)
    }
  }, [cacheKey])

  const teamLeaders = useMemo(() => Array.from(new Set(
    rows.map((row) => String(row.team || '')).filter(Boolean)
  )).sort(), [rows])

  const agents = useMemo(() => Array.from(new Set(
    rows.map((row) => String(row.employee_name || '')).filter(Boolean)
  )).sort(), [rows])

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesTeam = !teamFilter || row.team === teamFilter
      const matchesAgent = !agentFilter || row.employee_name === agentFilter
      const matchesSearch = !query || COLUMNS.some((column) => displayValue(column, row[column]).toLowerCase().includes(query))
      return matchesTeam && matchesAgent && matchesSearch
    })
  }, [rows, searchQuery, teamFilter, agentFilter])

  return (
    <div className="p-8 pb-10 max-w-[1800px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 mb-2">
                <h1 className="silver-shimmer-text font-poppins text-[28px] font-normal tracking-normal leading-none">Payment Grid</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-[#94A3B8]">
            <span className="mb-1 flex items-center gap-1"><CalendarDays size={13} /> From</span>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none" />
          </label>
          <label className="text-xs text-[#94A3B8]">
            <span className="mb-1 flex items-center gap-1"><CalendarDays size={13} /> To</span>
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none" />
          </label>
          <button onClick={fetchPayments} disabled={isLoading} className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Loading' : 'Load Data'}
          </button>
        </div>
      </div>

      <section className="">
        <div className="mb-5 mt-10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">{hasLoaded ? `${filteredRows.length} of ${rows.length} records` : 'Choose a date range and load records'}</h2>
              </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search all fields..." className="w-64 rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-white/40 outline-none focus:border-cyan-400/50" />
            </label>
            <select value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none">
              <option value="" className="bg-[#0A0E17]">All Team Leaders</option>
              {teamLeaders.map((team) => <option key={team} value={team} className="bg-[#0A0E17]">{team}</option>)}
            </select>
            <select value={agentFilter} onChange={(event) => setAgentFilter(event.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none">
              <option value="" className="bg-[#0A0E17]">All Agents</option>
              {agents.map((agent) => <option key={agent} value={agent} className="bg-[#0A0E17]">{agent}</option>)}
            </select>
          </div>
        </div>

        {error ? <div className="mb-4 rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">{error}</div> : null}

        <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
          <table className="min-w-[3000px] w-full text-left whitespace-nowrap">
            <thead className="bg-white/[0.04]">
              <tr>
                {COLUMNS.map((column) => <th key={column} className="px-4 py-3 text-[11px] font-semibold text-white/60">{formatHeader(column)}</th>)}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={COLUMNS.length} className="py-12 text-center text-sm text-[#64748B]">Loading payment responses...</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={COLUMNS.length} className="py-12 text-center text-sm text-[#64748B]">{hasLoaded ? 'No payment records found for this range.' : 'No records loaded.'}</td></tr>
              ) : filteredRows.map((row, index) => (
                <tr key={`${displayValue('booking_id', row.booking_id)}-${index}`} className="border-t border-white/[0.05] hover:bg-white/[0.03]">
                  {COLUMNS.map((column) => <td key={column} className="px-4 py-3 text-xs text-white/75">{displayValue(column, row[column])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
