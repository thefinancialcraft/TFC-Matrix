import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials in environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function cleanCurrency(s: any): number {
  if (s === null || s === undefined || String(s).trim() === '' || String(s).trim() === 'Zero Payment' || String(s).trim() === 'nan' || String(s).trim() === 'null') return 0.0
  try {
    return parseFloat(String(s).replace('₹', '').replace(',', '').replace('%', '').trim())
  } catch {
    return 0.0
  }
}

function cleanPct(s: any): number {
  if (s === null || s === undefined || String(s).trim() === '' || String(s).trim() === 'nan' || String(s).trim() === 'null') return 0.0
  try {
    const val = parseFloat(String(s).replace('%', '').trim())
    return val > 5 ? val / 100 : val
  } catch {
    return 0.0
  }
}

function cleanInt(s: any): number {
  if (s === null || s === undefined || String(s).trim() === '' || String(s).trim() === 'nan' || String(s).trim() === 'null') return 0
  try {
    return parseInt(parseFloat(String(s).trim()).toString())
  } catch {
    return 0
  }
}

function cleanData(data: any[]) {
  return data.map((row: any) => {
    const cleaned: any = { ...row }
    
    if (cleaned.salary !== undefined) cleaned.salary = cleanCurrency(cleaned.salary)
    if (cleaned.target !== undefined) cleaned.target = cleanCurrency(cleaned.target)
    if (cleaned.justification !== undefined) cleaned.justification = cleanCurrency(cleaned.justification)
    if (cleaned.gross_score !== undefined) cleaned.gross_score = cleanCurrency(cleaned.gross_score)
    if (cleaned.score !== undefined) cleaned.score = cleanCurrency(cleaned.score)
    if (cleaned.just_left !== undefined) cleaned.just_left = cleanCurrency(cleaned.just_left)
    if (cleaned.discount_deliverd !== undefined) cleaned.discount_deliverd = cleanCurrency(cleaned.discount_deliverd)
    if (cleaned.last_payment_amount !== undefined) cleaned.last_payment_amount = cleanCurrency(cleaned.last_payment_amount)
    
    if (cleaned.achievement !== undefined) cleaned.achievement = cleanPct(cleaned.achievement)
    
    if (cleaned.fifty_below_above !== undefined) cleaned.fifty_below_above = cleanInt(cleaned.fifty_below_above)
    if (cleaned.fifty_k_above !== undefined) cleaned.fifty_k_above = cleanInt(cleaned.fifty_k_above)
    if (cleaned.one_lac_above !== undefined) cleaned.one_lac_above = cleanInt(cleaned.one_lac_above)
    if (cleaned.multi_yr_nop !== undefined) cleaned.multi_yr_nop = cleanInt(cleaned.multi_yr_nop)
    if (cleaned.single_yr_nop !== undefined) cleaned.single_yr_nop = cleanInt(cleaned.single_yr_nop)
    if (cleaned.nop !== undefined) cleaned.nop = cleanInt(cleaned.nop)
    if (cleaned.discount_count !== undefined) cleaned.discount_count = cleanInt(cleaned.discount_count)
    if (cleaned.last_pay_days !== undefined) cleaned.last_pay_days = cleanInt(cleaned.last_pay_days)

    ;['issued', 'pending', 'requirement', 'counter', 'declined', 'mismatched'].forEach((column) => {
      if (cleaned[column] !== undefined) cleaned[column] = cleanCurrency(cleaned[column])
      const nopColumn = `${column}_nop`
      if (cleaned[nopColumn] !== undefined) cleaned[nopColumn] = cleanInt(cleaned[nopColumn])
    })
    
    return cleaned
  })
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const requestedMonth = month?.trim() || ''
    
    console.log('Fetching raw data from Supabase...')
    const { data: rawData, error } = await supabase
      .from('monthly_track_aps')
      .select('*')
      .limit(10000)
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }
    
    if (!rawData || rawData.length === 0) {
      return NextResponse.json({ error: 'No data available' }, { status: 404 })
    }
    
    const df = cleanData(rawData)
    
    // Rename columns to match backend logic
    const renameMap: { [key: string]: string } = {
      'ref_id': 'Ref_id',
      'month_start': 'Month Start',
      'end_date': 'End Date',
      'month': 'Month',
      'year': 'Year',
      'employee_name': 'Employee Name',
      'joined_date': 'Joined Date',
      'salary': 'Salary',
      'team': 'Team',
      'target': 'Target',
      'justification': 'Justification',
      'fifty_below_above': '50 Below Above',
      'fifty_k_above': '50k Above',
      'one_lac_above': '1lac Above',
      'multi_yr_nop': 'Multi Yr Nop',
      'single_yr_nop': 'Single Yr Nop',
      'nop': 'N.o.p',
      'gross_score': 'Gross score',
      'score': 'Score',
      'just_left': 'Just left',
      'issued': 'Issued',
      'issued_nop': 'Issued Nop',
      'pending': 'Pending',
      'pending_nop': 'Pen. Nop',
      'requirement': 'Requirement',
      'requirement_nop': 'Req. Nop',
      'counter': 'Counter',
      'counter_nop': 'Cou. Nop',
      'declined': 'Declined',
      'declined_nop': 'Dec. Nop',
      'mismatched': 'Mismatched',
      'mismatched_nop': 'Mismatched Nop',
      'achievement': 'Achievement',
      'discount_deliverd': 'Discount Deliverd',
      'discount_count': 'Discount Count',
      'last_payment': 'Last Payment',
      'last_payment_amount': 'Last Payment Amount',
      'last_pay_days': 'Last Pay Days'
    }
    
    const renamedDf = df.map((row: any) => {
      const renamed: any = {}
      Object.keys(row).forEach(key => {
        const newKey = renameMap[key] || key
        renamed[newKey] = row[key]
      })
      return renamed
    })
    
    // Parse dates and get unique months
    const availableMonths: any[] = []
    const monthSet = new Set<string>()
    
    renamedDf.forEach((row: any) => {
      if (row['Month Start'] && !monthSet.has(row['Month Start'])) {
        const date = new Date(row['Month Start'])
        if (!isNaN(date.getTime()) && date.getFullYear() >= 2020 && date.getFullYear() <= 2030) {
          monthSet.add(row['Month Start'])
          availableMonths.push({
            date: row['Month Start'],
            name: date.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
            full: row['Month']
          })
        }
      }
    })
    
    // Sort months by date (newest first)
    availableMonths.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // Build monthly company data
    const monthlyCompanyData: { [key: string]: any } = {}
    
    availableMonths.forEach((month) => {
      const monthData = renamedDf.filter((row: any) => row['Month Start'] === month.date)
      
      if (monthData.length > 0) {
        const target = monthData.reduce((sum: number, row: any) => sum + (row['Target'] || 0), 0)
        const score = monthData.reduce((sum: number, row: any) => sum + (row['Score'] || 0), 0)
        const nop = monthData.reduce((sum: number, row: any) => sum + (row['N.o.p'] || 0), 0)
        const percent = target > 0 ? (score / target) * 100 : 0
        const salary = monthData.reduce((sum: number, row: any) => sum + (row['Salary'] || 0), 0)
        const justification = monthData.reduce((sum: number, row: any) => sum + (row['Justification'] || 0), 0)
        const justLeft = monthData.reduce((sum: number, row: any) => sum + (row['Just left'] || 0), 0)
        const gross = monthData.reduce((sum: number, row: any) => sum + (row['Gross score'] || 0), 0)
        const fiftyBelow = monthData.reduce((sum: number, row: any) => sum + (row['50 Below Above'] || 0), 0)
        const fiftykAbove = monthData.reduce((sum: number, row: any) => sum + (row['50k Above'] || 0), 0)
        const oneLacAbove = monthData.reduce((sum: number, row: any) => sum + (row['1lac Above'] || 0), 0)
        const singleYrNop = monthData.reduce((sum: number, row: any) => sum + (row['Single Yr Nop'] || 0), 0)
        const multiYrNop = monthData.reduce((sum: number, row: any) => sum + (row['Multi Yr Nop'] || 0), 0)
        const discountDelivered = monthData.reduce((sum: number, row: any) => sum + (row['Discount Deliverd'] || 0), 0)
        const discountCount = monthData.reduce((sum: number, row: any) => sum + (row['Discount Count'] || 0), 0)
        const payAmt = monthData.reduce((sum: number, row: any) => sum + (row['Last Payment Amount'] || 0), 0)
        const totalAgents = monthData.length
        const zeroScoreAgents = monthData.filter((row: any) => row['Score'] === 0).length
        const targetCompletedAgents = monthData.filter((row: any) => row['Score'] >= row['Target'] && row['Target'] > 0).length
        const justificationClearedAgents = monthData.filter((row: any) => row['Score'] >= row['Justification'] && row['Justification'] > 0).length
        
        monthlyCompanyData[month.date] = {
          date: month.date,
          name: monthData[0]['Month'] || 'Unknown',
          target,
          score,
          nop,
          percent,
          salary,
          justification,
          justLeft,
          gross,
          fiftyBelow,
          fiftykAbove,
          oneLacAbove,
          singleYrNop,
          multiYrNop,
          discountDelivered,
          discountCount,
          payAmt,
          totalAgents,
          zeroScoreAgents,
          targetCompletedAgents,
          justificationClearedAgents
        }
      }
    })
    
    const selectedMonthIndex = requestedMonth
      ? Math.max(0, availableMonths.findIndex((monthOption: any) => monthOption.date === requestedMonth))
      : 0

    // Get current month data
    const currentMonthDate = availableMonths[selectedMonthIndex]?.date || availableMonths[0]?.date
    const currentMonthData = renamedDf.filter((row: any) => row['Month Start'] === currentMonthDate)
    
    // Calculate KPIs for current month
    const totalTarget = currentMonthData.reduce((sum: number, row: any) => sum + (row['Target'] || 0), 0)
    const totalScore = currentMonthData.reduce((sum: number, row: any) => sum + (row['Score'] || 0), 0)
    const totalGross = currentMonthData.reduce((sum: number, row: any) => sum + (row['Gross score'] || 0), 0)
    const totalNop = currentMonthData.reduce((sum: number, row: any) => sum + (row['N.o.p'] || 0), 0)
    const avgAch = totalTarget > 0 ? (totalScore / totalTarget) * 100 : 0
    const sumStatusColumn = (column: string) => currentMonthData.reduce((sum: number, row: any) => sum + (row[column] || 0), 0)
    const statusBreakdown = {
      issued: { amount: sumStatusColumn('Issued'), nop: sumStatusColumn('Issued Nop') },
      pending: { amount: sumStatusColumn('Pending'), nop: sumStatusColumn('Pen. Nop') },
      requirement: { amount: sumStatusColumn('Requirement'), nop: sumStatusColumn('Req. Nop') },
      counter: { amount: sumStatusColumn('Counter'), nop: sumStatusColumn('Cou. Nop') },
      declined: { amount: sumStatusColumn('Declined'), nop: sumStatusColumn('Dec. Nop') },
      mismatched: { amount: sumStatusColumn('Mismatched'), nop: sumStatusColumn('Mismatched Nop') }
    }
    
    // Calculate milestones
    const targetCleared = currentMonthData.filter((row: any) => row['Score'] >= row['Target'] && row['Target'] > 0).length
    const justificationCleared = currentMonthData.filter((row: any) => row['Score'] >= row['Justification'] && row['Justification'] > 0).length
    const justificationPending = currentMonthData.filter((row: any) => row['Score'] < row['Justification'] && row['Justification'] > 0).length
    const zeroPerformers = currentMonthData.filter((row: any) => row['Score'] === 0).length
    const justLeftCount = currentMonthData.filter((row: any) => row['Just left'] > 0).length
    
    // Payment info
    const paymentInfo = {
      companyZeroDays: 0,
      amount: 0,
      agent: 'N/A',
      date: 'N/A'
    }
    
    const recentPayments = currentMonthData
      .filter((row: any) => row['Last Payment Amount'] > 0)
      .sort((a, b) => new Date(b['Last Payment']).getTime() - new Date(a['Last Payment']).getTime())
      .slice(0, 3)
      .map((row: any) => ({
        companyZeroDays: row['Last Pay Days'] || 0,
        amount: row['Last Payment Amount'] || 0,
        agent: row['Employee Name'] || 'Unknown',
        date: row['Last Payment'] || 'N/A'
      }))
    
    if (recentPayments.length > 0) {
      paymentInfo.companyZeroDays = recentPayments[0].companyZeroDays
      paymentInfo.amount = recentPayments[0].amount
      paymentInfo.agent = recentPayments[0].agent
      paymentInfo.date = recentPayments[0].date
    }
    
    // Top agents
    const topAgents = currentMonthData
      .filter((row: any) => row['Target'] > 0)
      .map((row: any) => ({
        name: row['Employee Name'],
        score: row['Score'],
        nop: row['N.o.p'],
        percent: row['Target'] > 0 ? (row['Score'] / row['Target']) * 100 : 0
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 10)
    
    // All agents records
    const allAgentsRecords = currentMonthData.map((row: any) => ({
      name: row['Employee Name'],
      salary: row['Salary'] || 0,
      team: row['Team'] || 'N/A',
      target: row['Target'] || 0,
      justification: row['Justification'] || 0,
      fiftyBelowAbove: row['50 Below Above'] || 0,
      fiftykAbove: row['50k Above'] || 0,
      oneLacAbove: row['1lac Above'] || 0,
      singleYrCount: row['Single Yr Nop'] || 0,
      multiYrCount: row['Multi Yr Nop'] || 0,
      nop: row['N.o.p'] || 0,
      grossScore: row['Gross score'] || 0,
      score: row['Score'] || 0,
      justLeft: row['Just left'] || 0,
      issued: row['Issued'] || 0,
      issuedNop: row['Issued Nop'] || 0,
      pending: row['Pending'] || 0,
      pendingNop: row['Pen. Nop'] || 0,
      requirement: row['Requirement'] || 0,
      requirementNop: row['Req. Nop'] || 0,
      counter: row['Counter'] || 0,
      counterNop: row['Cou. Nop'] || 0,
      declined: row['Declined'] || 0,
      declinedNop: row['Dec. Nop'] || 0,
      mismatched: row['Mismatched'] || 0,
      mismatchedNop: row['Mismatched Nop'] || 0,
      percent: row['Target'] > 0 ? (row['Score'] / row['Target']) * 100 : 0,
      discountDelivered: row['Discount Deliverd'] || 0,
      discountCount: row['Discount Count'] || 0,
      lastPaymentDate: row['Last Payment'] || 'N/A',
      lastPaymentAmount: row['Last Payment Amount'] || 0,
      paymentAging: row['Last Pay Days'] || 0
    }))
    
    // Team leaders
    const teamMap = new Map<string, any>()
    currentMonthData.forEach((row: any) => {
      const team = row['Team'] || 'Unknown'
      if (!teamMap.has(team)) {
        teamMap.set(team, {
          name: team,
          target: 0,
          score: 0,
          nop: 0,
          salary: 0,
          justification: 0,
          justLeft: 0,
          gross: 0,
          fiftyBelow: 0,
          fiftykAbove: 0,
          oneLacAbove: 0,
          singleYrNop: 0,
          multiYrNop: 0,
          discountDelivered: 0,
          discountCount: 0,
          issued: 0,
          issuedNop: 0,
          pending: 0,
          pendingNop: 0,
          requirement: 0,
          requirementNop: 0,
          counter: 0,
          counterNop: 0,
          declined: 0,
          declinedNop: 0,
          mismatched: 0,
          mismatchedNop: 0,
          payAmt: 0,
          agents: 0,
          zeroScoreAgents: 0,
          targetCompletedAgents: 0,
          justificationClearedAgents: 0,
          paymentDates: []
        })
      }
      
      const teamData = teamMap.get(team)
      teamData.target += row['Target'] || 0
      teamData.score += row['Score'] || 0
      teamData.nop += row['N.o.p'] || 0
      teamData.salary += row['Salary'] || 0
      teamData.justification += row['Justification'] || 0
      teamData.justLeft += row['Just left'] || 0
      teamData.gross += row['Gross score'] || 0
      teamData.fiftyBelow += row['50 Below Above'] || 0
      teamData.fiftykAbove += row['50k Above'] || 0
      teamData.oneLacAbove += row['1lac Above'] || 0
      teamData.singleYrNop += row['Single Yr Nop'] || 0
      teamData.multiYrNop += row['Multi Yr Nop'] || 0
      teamData.discountDelivered += row['Discount Deliverd'] || 0
      teamData.discountCount += row['Discount Count'] || 0
      teamData.issued += row['Issued'] || 0
      teamData.issuedNop += row['Issued Nop'] || 0
      teamData.pending += row['Pending'] || 0
      teamData.pendingNop += row['Pen. Nop'] || 0
      teamData.requirement += row['Requirement'] || 0
      teamData.requirementNop += row['Req. Nop'] || 0
      teamData.counter += row['Counter'] || 0
      teamData.counterNop += row['Cou. Nop'] || 0
      teamData.declined += row['Declined'] || 0
      teamData.declinedNop += row['Dec. Nop'] || 0
      teamData.mismatched += row['Mismatched'] || 0
      teamData.mismatchedNop += row['Mismatched Nop'] || 0
      teamData.payAmt += row['Last Payment Amount'] || 0
      teamData.agents += 1
      if (row['Score'] === 0) teamData.zeroScoreAgents += 1
      if (row['Score'] >= row['Target'] && row['Target'] > 0) teamData.targetCompletedAgents += 1
      if (row['Score'] >= row['Justification'] && row['Justification'] > 0) teamData.justificationClearedAgents += 1
      if (row['Last Payment']) teamData.paymentDates.push(row['Last Payment'])
    })
    
    const teamLeaders = Array.from(teamMap.values())
      .map((team: any) => ({
        ...team,
        percent: team.target > 0 ? (team.score / team.target) * 100 : 0,
        payDate: team.paymentDates.length > 0 ? new Date(Math.max(...team.paymentDates.map((d: any) => new Date(d).getTime()))).toISOString().split('T')[0] : 'N/A',
        days: team.paymentDates.length > 0 ? Math.floor((Date.now() - new Date(Math.max(...team.paymentDates.map((d: any) => new Date(d).getTime()))).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${team.name.replace(' ', '')}&backgroundColor=0A0E17&textColor=ffffff`
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 5)
    
    // Last month data relative to selected month
    const lastMonthDate = availableMonths[selectedMonthIndex + 1]?.date || availableMonths[selectedMonthIndex]?.date
    const lastMonthData = renamedDf.filter((row: any) => row['Month Start'] === lastMonthDate)
    
    const lastMonthScore = lastMonthData.reduce((sum: number, row: any) => sum + (row['Score'] || 0), 0)
    const lastMonthTarget = lastMonthData.reduce((sum: number, row: any) => sum + (row['Target'] || 0), 0)
    const lastMonthAch = lastMonthTarget > 0 ? (lastMonthScore / lastMonthTarget) * 100 : 0
    
    // Last month top agent
    const lastMonthTopAgent = lastMonthData
      .filter((row: any) => row['Target'] > 0)
      .map((row: any) => ({
        name: row['Employee Name'],
        percent: row['Target'] > 0 ? (row['Score'] / row['Target']) * 100 : 0
      }))
      .sort((a, b) => b.percent - a.percent)[0]
    
    // Last month top team
    const lastMonthTeamMap = new Map<string, any>()
    lastMonthData.forEach((row: any) => {
      const team = row['Team'] || 'Unknown'
      if (!lastMonthTeamMap.has(team)) {
        lastMonthTeamMap.set(team, { name: team, target: 0, score: 0 })
      }
      const teamData = lastMonthTeamMap.get(team)
      teamData.target += row['Target'] || 0
      teamData.score += row['Score'] || 0
    })
    
    const lastMonthTopTeam = Array.from(lastMonthTeamMap.values())
      .map((team: any) => ({
        name: team.name,
        percent: team.target > 0 ? (team.score / team.target) * 100 : 0
      }))
      .sort((a, b) => b.percent - a.percent)[0]
    
    // Trend data
    const trendData = availableMonths.map((month) => {
      const monthData = renamedDf.filter((row: any) => row['Month Start'] === month.date)
      const score = monthData.reduce((sum: number, row: any) => sum + (row['Score'] || 0), 0)
      const target = monthData.reduce((sum: number, row: any) => sum + (row['Target'] || 0), 0)
      const achievement = target > 0 ? (score / target) * 100 : 0
      
      return {
        date: month.date,
        month: new Date(month.date).toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        name: month.full,
        achievement: Math.round(achievement * 10) / 10,
        score,
        target
      }
    }).reverse()
    
    // Build monthly agents data
    const monthlyAgentsData: { [key: string]: any } = {}
    availableMonths.forEach((month) => {
      const monthData = renamedDf.filter((row: any) => row['Month Start'] === month.date)
      monthlyAgentsData[month.date] = monthData.map((row: any) => ({
        name: row['Employee Name'],
        salary: row['Salary'] || 0,
        team: row['Team'] || 'N/A',
        target: row['Target'] || 0,
        justification: row['Justification'] || 0,
        fiftyBelowAbove: row['50 Below Above'] || 0,
        fiftykAbove: row['50k Above'] || 0,
        oneLacAbove: row['1lac Above'] || 0,
        singleYrCount: row['Single Yr Nop'] || 0,
        multiYrCount: row['Multi Yr Nop'] || 0,
        nop: row['N.o.p'] || 0,
        grossScore: row['Gross score'] || 0,
        score: row['Score'] || 0,
        justLeft: row['Just left'] || 0,
        percent: row['Target'] > 0 ? (row['Score'] / row['Target']) * 100 : 0,
        discountDelivered: row['Discount Deliverd'] || 0,
        discountCount: row['Discount Count'] || 0,
        lastPaymentDate: row['Last Payment'] || 'N/A',
        lastPaymentAmount: row['Last Payment Amount'] || 0,
        paymentAging: row['Last Pay Days'] || 0
      }))
    })
    
    // Build monthly team data
    const monthlyTeamData: { [key: string]: any } = {}
    availableMonths.forEach((month) => {
      const monthData = renamedDf.filter((row: any) => row['Month Start'] === month.date)
      const teamMap = new Map<string, any>()
      
      monthData.forEach((row: any) => {
        const team = row['Team'] || 'Unknown'
        if (!teamMap.has(team)) {
          teamMap.set(team, {
            name: team,
            target: 0,
            score: 0,
            nop: 0,
            salary: 0,
            justification: 0,
            justLeft: 0,
            gross: 0,
            fiftyBelow: 0,
            fiftykAbove: 0,
            oneLacAbove: 0,
            singleYrNop: 0,
            multiYrNop: 0,
            discountDelivered: 0,
            discountCount: 0,
            payAmt: 0,
            agents: 0,
            zeroScoreAgents: 0,
            targetCompletedAgents: 0,
            justificationClearedAgents: 0,
            paymentDates: []
          })
        }
        
        const teamData = teamMap.get(team)
        teamData.target += row['Target'] || 0
        teamData.score += row['Score'] || 0
        teamData.nop += row['N.o.p'] || 0
        teamData.salary += row['Salary'] || 0
        teamData.justification += row['Justification'] || 0
        teamData.justLeft += row['Just left'] || 0
        teamData.gross += row['Gross score'] || 0
        teamData.fiftyBelow += row['50 Below Above'] || 0
        teamData.fiftykAbove += row['50k Above'] || 0
        teamData.oneLacAbove += row['1lac Above'] || 0
        teamData.singleYrNop += row['Single Yr Nop'] || 0
        teamData.multiYrNop += row['Multi Yr Nop'] || 0
        teamData.discountDelivered += row['Discount Deliverd'] || 0
        teamData.discountCount += row['Discount Count'] || 0
        teamData.payAmt += row['Last Payment Amount'] || 0
        teamData.agents += 1
        if (row['Score'] === 0) teamData.zeroScoreAgents += 1
        if (row['Score'] >= row['Target'] && row['Target'] > 0) teamData.targetCompletedAgents += 1
        if (row['Score'] >= row['Justification'] && row['Justification'] > 0) teamData.justificationClearedAgents += 1
        if (row['Last Payment']) teamData.paymentDates.push(row['Last Payment'])
      })
      
      monthlyTeamData[month.date] = Array.from(teamMap.values())
        .map((team: any) => ({
          ...team,
          percent: team.target > 0 ? (team.score / team.target) * 100 : 0,
          payDate: team.paymentDates.length > 0 ? new Date(Math.max(...team.paymentDates.map((d: any) => new Date(d).getTime()))).toISOString().split('T')[0] : 'N/A',
          days: team.paymentDates.length > 0 ? Math.floor((Date.now() - new Date(Math.max(...team.paymentDates.map((d: any) => new Date(d).getTime()))).getTime()) / (1000 * 60 * 60 * 24)) : 0
        }))
        .sort((a, b) => b.percent - a.percent)
    })
    
    return NextResponse.json({
      currentMonth: currentMonthDate ? new Date(currentMonthDate).toLocaleString('en-US', { month: 'short', year: '2-digit' }) : (availableMonths[0]?.name || 'Unknown'),
      availableMonths,
      selectedMonthIndex,
      paymentInfo,
      recentPayments,
      trendData,
      kpis: {
        target: totalTarget,
        score: totalScore,
        gross: totalGross,
        nop: totalNop,
        achievement: avgAch,
        discountDelivered: currentMonthData.reduce((sum: number, row: any) => sum + (row['Discount Deliverd'] || 0), 0),
        discountCount: currentMonthData.reduce((sum: number, row: any) => sum + (row['Discount Count'] || 0), 0),
        multiYearNop: currentMonthData.reduce((sum: number, row: any) => sum + (row['Multi Yr Nop'] || 0), 0),
        singleYearNop: currentMonthData.reduce((sum: number, row: any) => sum + (row['Single Yr Nop'] || 0), 0),
        below50k: currentMonthData.reduce((sum: number, row: any) => sum + (row['50 Below Above'] || 0), 0),
        between50k1L: currentMonthData.reduce((sum: number, row: any) => sum + (row['50k Above'] || 0), 0),
        above1L: currentMonthData.reduce((sum: number, row: any) => sum + (row['1lac Above'] || 0), 0),
        statusBreakdown,
        totalAgents: currentMonthData.length
      },
      milestones: {
        targetCleared,
        justificationCleared,
        justificationPending,
        zeroPerformers,
        justLeft: justLeftCount
      },
      topAgents,
      allAgents: allAgentsRecords,
      monthlyAgentsData,
      monthlyTeamData,
      monthlyCompanyData,
      teamLeaders,
      lastMonth: {
        month: availableMonths[1]?.name || 'Previous Month',
        score: lastMonthScore,
        achievement: lastMonthAch,
        topAgent: lastMonthTopAgent,
        topTeamLeader: lastMonthTopTeam,
        discountDelivered: lastMonthData.reduce((sum: number, row: any) => sum + (row['Discount Deliverd'] || 0), 0),
        discountCount: lastMonthData.reduce((sum: number, row: any) => sum + (row['Discount Count'] || 0), 0),
        paymentCount: lastMonthData.filter((row: any) => row['Last Payment Amount'] > 0).reduce((sum: number, row: any) => sum + (row['N.o.p'] || 0), 0),
        paymentChangePercent: 0,
        milestones: {
          targetCleared: lastMonthData.filter((row: any) => row['Score'] >= row['Target'] && row['Target'] > 0).length,
          justificationCleared: lastMonthData.filter((row: any) => row['Score'] >= row['Justification'] && row['Justification'] > 0).length,
          zeroPerformers: lastMonthData.filter((row: any) => row['Score'] === 0).length,
          justLeft: lastMonthData.filter((row: any) => row['Just left'] > 0).length,
          totalAgents: lastMonthData.length
        }
      }
    })
    
  } catch (error) {
    console.error('Error in dashboard API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}