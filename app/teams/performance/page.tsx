'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Search, Users } from 'lucide-react'

const formatCurrency = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN', {
  maximumFractionDigits: 0
})}`

const formatDate = (dateString: string) => {
  if (!dateString || dateString === 'N/A') return 'N/A'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-IN')
}

export default function TeamPerformancePage() {
  const [teamName, setTeamName] = useState('')
  const [agents, setAgents] = useState<any[]>([])
  const [availableMonths, setAvailableMonths] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setTeamName(new URLSearchParams(window.location.search).get('team') || '')
  }, [])

  useEffect(() => {
    const fetchTeamAgents = async () => {
      setIsLoading(true)
      setError('')
      try {
        const url = selectedMonth
          ? `/api/dashboard?month=${encodeURIComponent(selectedMonth)}`
          : '/api/dashboard'
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to load team performance')

        const data = await response.json()
        const months = Array.isArray(data.availableMonths) ? data.availableMonths : []
        setAvailableMonths(months)
        if (!selectedMonth && months.length > 0) setSelectedMonth(months[0].date)
        setAgents(Array.isArray(data.allAgents) ? data.allAgents : [])
      } catch (fetchError) {
        console.error('Error fetching team performance:', fetchError)
        setAgents([])
        setError('Unable to load team records.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeamAgents()
  }, [selectedMonth])

  const teamAgents = useMemo(() => {
    const normalizedTeam = teamName.trim().toLowerCase()
    const query = searchQuery.trim().toLowerCase()

    return agents
      .filter((agent) => agent.team?.trim().toLowerCase() === normalizedTeam)
      .filter((agent) => !query || agent.name?.toLowerCase().includes(query))
      .sort((first, second) => Number(second.percent || 0) - Number(first.percent || 0))
  }, [agents, searchQuery, teamName])

  const summary = useMemo(() => ({
    total: teamAgents.length,
    score: teamAgents.reduce((sum, agent) => sum + Number(agent.score || 0), 0),
    target: teamAgents.reduce((sum, agent) => sum + Number(agent.target || 0), 0),
    achieved: teamAgents.filter((agent) => Number(agent.percent || 0) >= 100).length
  }), [teamAgents])

  const selectedMonthName = availableMonths.find((month) => month.date === selectedMonth)?.name

  return (
    <div className="p-8 pb-10 max-w-[1500px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <Link href="/teams" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 mb-4">
            <ArrowLeft size={14} /> Back to Teams
          </Link>
          <h1 className="silver-shimmer-text font-poppins text-[28px] font-normal tracking-normal leading-none mb-2">
            {teamName || 'Team'} Performance
          </h1>
        </div>
        <label className="flex items-center gap-2 text-xs font-poppins text-[#94A3B8]">
          <Calendar size={14} className="text-cyan-400" />
          <span>Month</span>
          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
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

      {!teamName ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-sm text-red-300">
          Select a team from the Teams page to view its agents.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-[#94A3B8]">Team Agents</p>
              <p className="mt-2 text-2xl font-bold text-white">{isLoading ? '...' : summary.total}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-[#94A3B8]">Team Score</p>
              <p className="mt-2 text-2xl font-bold text-cyan-300">{isLoading ? '...' : formatCurrency(summary.score)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-[#94A3B8]">Team Target</p>
              <p className="mt-2 text-2xl font-bold text-emerald-300">{isLoading ? '...' : formatCurrency(summary.target)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-[#94A3B8]">Target Cleared</p>
              <p className="mt-2 text-2xl font-bold text-amber-300">{isLoading ? '...' : summary.achieved}</p>
            </div>
          </div>

          <section className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-cyan-400" />
                <div>
                  <h2 className="text-base font-semibold text-white">Agent Records</h2>
                  <p className="text-xs text-[#64748B]">{selectedMonthName || 'Latest month'}</p>
                </div>
              </div>
              <label className="relative block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search agents..."
                  className="w-56 rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-white/40 outline-none focus:border-cyan-400/50"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    {['Agent', 'NOP', 'Score', 'Ach%', 'Pay Date', 'Days', 'Salary', 'Target', 'Justification', 'Just Left', 'Gross'].map((heading) => (
                      <th key={heading} className="pb-3 pr-5 text-center text-[12px] font-medium text-white/50 first:text-left">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={11} className="py-12 text-center text-sm text-[#64748B]">Loading agent records...</td></tr>
                  ) : error ? (
                    <tr><td colSpan={11} className="py-12 text-center text-sm text-red-300">{error}</td></tr>
                  ) : teamAgents.length === 0 ? (
                    <tr><td colSpan={11} className="py-12 text-center text-sm text-[#64748B]">No agents found for this team.</td></tr>
                  ) : teamAgents.map((agent) => (
                    <tr key={agent.name} className="border-b border-white/[0.04] hover:bg-white/[0.03]">
                      <td className="py-3.5 pr-5 text-sm font-medium text-white">{agent.name || 'N/A'}</td>
                      <td className="py-3.5 pr-5 text-center text-sm text-white/70">{agent.nop || 0}</td>
                      <td className="py-3.5 pr-5 text-center text-sm text-white/80">{formatCurrency(agent.score)}</td>
                      <td className={`py-3.5 pr-5 text-center text-sm font-semibold ${Number(agent.percent || 0) >= 100 ? 'text-emerald-400' : 'text-amber-300'}`}>
                        {Number(agent.percent || 0).toFixed(1)}%
                      </td>
                      <td className="py-3.5 pr-5 text-center text-sm text-white/60">{formatDate(agent.lastPaymentDate)}</td>
                      <td className="py-3.5 pr-5 text-center text-sm text-white/60">{agent.paymentAging || 0}d</td>
                      <td className="py-3.5 pr-5 text-center text-sm text-white/60">{formatCurrency(agent.salary)}</td>
                      <td className="py-3.5 pr-5 text-center text-sm text-white/80">{formatCurrency(agent.target)}</td>
                      <td className="py-3.5 pr-5 text-center text-sm text-white/60">{formatCurrency(agent.justification)}</td>
                      <td className="py-3.5 pr-5 text-center text-sm text-white/60">{formatCurrency(agent.justLeft)}</td>
                      <td className="py-3.5 text-center text-sm text-white/60">{formatCurrency(agent.grossScore)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
