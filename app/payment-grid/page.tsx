'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, CreditCard, RefreshCw, Search } from 'lucide-react'

const COLUMNS = [
  'proposal_no', 'payment_date', 'policy_holder_name', 'employee_name', 'policy_status', 'insurance_company', 'plan_name',
  'tenure', 'premium', 'net_premium', 'discount_offer', 'updated_premium',
  'team', 'proposal_status', 'relationship_manager', 'booking_id', 'number_of_members', 'pincode', 'city',
  'district', 'state', 'country', 'payment_month', 'effective_date', 'next_renewal_date',
  'month', 'policy_type', 'health_checkup', 'extra_bonus', 'discount_offer_type',
  'previous_company', 'business_type', 'assistant_team', 'agent_code', 'grade', 'lead_source',
  'payment_proof', 'created_at', 'sync'
]

const POLICY_STATUS_STYLES: Record<string, { backgroundColor: string; borderColor: string; color: string }> = {
  counter: { backgroundColor: '#80008026', borderColor: '#800080', color: '#800080' },
  declined: { backgroundColor: '#FF000026', borderColor: '#FF0000', color: '#FF0000' },
  issued: { backgroundColor: '#00B05026', borderColor: '#00B050', color: '#00B050' },
  pending: { backgroundColor: '#FFFF0026', borderColor: '#FFFF00', color: '#FFFF00' },
  requirement: { backgroundColor: '#FFA50026', borderColor: '#FFA500', color: '#FFA500' },
  mismatched: { backgroundColor: '#5B9BD526', borderColor: '#5B9BD5', color: '#5B9BD5' }
}
const POLICY_STATUS_FILTERS = Object.keys(POLICY_STATUS_STYLES)

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

const formatHeader = (column: string) => column === 'employee_name' ? 'Agent Name' : column
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
  const [statusFilter, setStatusFilter] = useState('')
  const [proposalStatusFilters, setProposalStatusFilters] = useState<string[]>([])
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

  const proposalStatuses = useMemo(() => Array.from(new Set(
    rows.map((row) => String(row.proposal_status || '').trim()).filter(Boolean)
  )).sort((firstStatus, secondStatus) => firstStatus.localeCompare(secondStatus)), [rows])

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesTeam = !teamFilter || row.team === teamFilter
      const matchesAgent = !agentFilter || row.employee_name === agentFilter
      const matchesStatus = !statusFilter || String(row.policy_status || '').trim().toLowerCase() === statusFilter
      const matchesProposalStatus = proposalStatusFilters.length === 0 || proposalStatusFilters.includes(String(row.proposal_status || '').trim())
      const matchesSearch = !query || COLUMNS.some((column) => displayValue(column, row[column]).toLowerCase().includes(query))
      return matchesTeam && matchesAgent && matchesStatus && matchesProposalStatus && matchesSearch
    })
  }, [rows, searchQuery, teamFilter, agentFilter, statusFilter, proposalStatusFilters])

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-8 max-w-[1800px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 mb-2">
                <h1 className="silver-shimmer-text font-poppins text-[24px] sm:text-[28px] font-normal tracking-normal leading-none">Payment Grid</h1>
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

        <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by policy status">
          <span className="mr-1 text-xs text-white/50">Status</span>
          <button
            type="button"
            aria-pressed={!statusFilter}
            onClick={() => setStatusFilter('')}
            className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${statusFilter ? 'border-white/10 text-white/55 hover:text-white' : 'border-white/35 bg-white/10 text-white'}`}
          >
            All
          </button>
          {POLICY_STATUS_FILTERS.map((status) => {
            const isSelected = statusFilter === status
            const style = POLICY_STATUS_STYLES[status]
            return (
              <button
                key={status}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setStatusFilter(isSelected ? '' : status)}
                className="rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors"
                style={{
                  backgroundColor: isSelected ? style.backgroundColor : 'transparent',
                  borderColor: style.borderColor,
                  borderWidth: isSelected ? 2 : 1,
                  color: style.color,
                  opacity: statusFilter && !isSelected ? 0.65 : 1
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          })}
          <details className="relative ml-auto">
            <summary className="cursor-pointer list-none px-3 py-1.5 text-[11px] font-medium text-white/80 hover:text-white">
              Proposal Status{proposalStatusFilters.length ? ` (${proposalStatusFilters.length})` : ''} <span aria-hidden="true">▾</span>
            </summary>
            <div className="absolute right-0 z-20 mt-2 max-h-64 min-w-60 overflow-y-auto rounded-xl border border-white/10 bg-[#0A0E17] p-2 shadow-xl">
              {proposalStatuses.length ? proposalStatuses.map((status) => (
                <label key={status} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-white/80 hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={proposalStatusFilters.includes(status)}
                    onChange={(event) => setProposalStatusFilters((selected) => (
                      event.target.checked
                        ? [...selected, status]
                        : selected.filter((selectedStatus) => selectedStatus !== status)
                    ))}
                    className="peer sr-only"
                  />
                  <span className="mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border border-white/30 text-[#071018] transition-colors peer-checked:border-cyan-400 peer-checked:bg-cyan-400 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-300/60">
                    {proposalStatusFilters.includes(status) && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span>{status}</span>
                </label>
              )) : <p className="px-2 py-1.5 text-xs text-white/50">No proposal statuses available</p>}
              {proposalStatusFilters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setProposalStatusFilters([])}
                  className="mt-1 w-full border-t border-white/10 px-2 pt-2 text-left text-xs text-cyan-300 hover:text-cyan-200"
                >
                  Clear selection
                </button>
              )}
            </div>
          </details>
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
                  {COLUMNS.map((column) => {
                    const value = displayValue(column, row[column])
                    const statusStyle = column === 'policy_status'
                      ? POLICY_STATUS_STYLES[value.toLowerCase()]
                      : undefined

                    return (
                      <td key={column} className="px-4 py-3 text-xs text-white/75">
                        {statusStyle ? (
                          <span className="inline-flex rounded-md border border-solid px-2 py-1 text-[10px] font-semibold" style={statusStyle}>
                            {value}
                          </span>
                        ) : value}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
