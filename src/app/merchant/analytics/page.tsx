'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Business } from '@/types/database'
import { 
  ChevronLeft, 
  Download, 
  Search, 
  RefreshCw, 
  Calendar, 
  Tag, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Sparkles,
  Ticket,
  Stamp
} from 'lucide-react'
import toast from 'react-hot-toast'

type ClaimRow = {
  id: string
  redeemed_at: string
  expires_at: string
  campaign_name: string
  branch_name: string
  customer_phone: string
}

type StampAwardRow = {
  id: string
  redeemed_at: string
  stamp_count: number
  customer_email: string
}

type StampSessionQueryRow = {
  id: string
  stamp_count: number
  redeemed_at: string
  loyalty_cards: { profiles: { phone: string } | null } | null
}

function maskCustomerEmail(email: string) {
  if (!email || email === 'Unknown') return 'Unknown'
  const at = email.indexOf('@')
  if (at <= 1) return email
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  const maskedLocal = local.length <= 2
    ? `${local[0]}*`
    : `${local.slice(0, 2)}***`
  return `${maskedLocal}@${domain}`
}


export default function MerchantAnalytics() {
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)


  // Sync / load database data
  const loadData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth'); return }

      // Fetch business
      const { data: bizData } = await supabase
        .from('businesses').select('*').eq('owner_id', user.id).single()

      if (!bizData) { router.replace('/merchant/onboarding'); return }
      const biz = bizData as Business
      setBusiness(biz)

      // Fetch active customer count (total loyalty cards)
      const { count } = await supabase
        .from('loyalty_cards')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', biz.id)
      
      setActiveCustomersCount(count || 0)

      // Fetch outstanding stamps & total redeemed counts
      const { data: cardsData } = await supabase
        .from('loyalty_cards')
        .select('current_stamps, total_redeemed')
        .eq('business_id', biz.id)

      if (cardsData) {
        const total = (cardsData as any[]).reduce((sum, card) => {
          return sum + card.current_stamps + (card.total_redeemed * biz.max_stamps)
        }, 0)
        setTotalStampsCount(total)
      }

      // Fetch real claims history
      const { data: claimsData, error: claimsError } = await supabase
        .from('voucher_redemptions')
        .select(`
          id,
          redeemed_at,
          expires_at,
          campaign_name,
          branch_name,
          loyalty_cards!inner (
            user_id,
            profiles (
              phone
            )
          )
        `)
        .eq('loyalty_cards.business_id', biz.id)
        .order('redeemed_at', { ascending: false })

      if (claimsError) throw claimsError

      // Map profiles and match formatting
      const formatted = (claimsData || []).map((c: any) => ({
        id: c.id,
        redeemed_at: c.redeemed_at,
        expires_at: c.expires_at,
        campaign_name: c.campaign_name || 'Free item',
        branch_name: c.branch_name || 'Main Store',
        customer_phone: c.loyalty_cards?.profiles?.phone || 'Unknown'
      }))

      setRealClaims(formatted)

      const { data: stampData, error: stampError } = await supabase
        .from('stamp_sessions')
        .select(`
          id,
          stamp_count,
          redeemed_at,
          loyalty_cards (
            profiles (
              phone
            )
          )
        `)
        .eq('business_id', biz.id)
        .eq('status', 'completed')
        .not('redeemed_at', 'is', null)
        .order('redeemed_at', { ascending: false }) as {
          data: StampSessionQueryRow[] | null
          error: unknown
        }

      if (stampError) throw stampError

      const formattedStamps: StampAwardRow[] = (stampData ?? []).map((row) => ({
        id: row.id,
        redeemed_at: row.redeemed_at,
        stamp_count: row.stamp_count,
        customer_email: row.loyalty_cards?.profiles?.phone || 'Unknown',
      }))

      setStampAwards(formattedStamps)
      if (showToast) toast.success('Data refreshed!')
    } catch (err: any) {
      console.error(err)
      toast.error('Error fetching analytics data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()

    // 15-second background polling
    const timer = setInterval(() => {
      loadData(false)
    }, 15000)

    return () => clearInterval(timer)
  }, [])

  // Real data state
  const [realClaims, setRealClaims] = useState<ClaimRow[]>([])
  const [stampAwards, setStampAwards] = useState<StampAwardRow[]>([])
  const [activeCustomersCount, setActiveCustomersCount] = useState(0)
  const [totalStampsCount, setTotalStampsCount] = useState(0)

  // Filter state
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all')
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stampSearchQuery, setStampSearchQuery] = useState('')
  const [chartView, setChartView] = useState<'day' | 'week' | 'month'>('day')
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  // Dynamic claims list based on Demo vs Real
  const activeClaims = realClaims

  // Filter lists: unique campaigns and branches
  const campaignsList = useMemo(() => {
    const set = new Set<string>()
    activeClaims.forEach(c => c.campaign_name && set.add(c.campaign_name))
    return Array.from(set)
  }, [activeClaims])

  const branchesList = useMemo(() => {
    const set = new Set<string>()
    activeClaims.forEach(c => c.branch_name && set.add(c.branch_name))
    return Array.from(set)
  }, [activeClaims])

  // Current Date Filters
  const dateLimit = useMemo(() => {
    const now = new Date()
    if (dateRange === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    if (dateRange === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  }, [dateRange])

  const prevDateLimit = useMemo(() => {
    const rangeMs = new Date().getTime() - dateLimit.getTime()
    return new Date(dateLimit.getTime() - rangeMs)
  }, [dateLimit])

  // Filter claims
  const filteredClaims = useMemo(() => {
    return activeClaims.filter(c => {
      const cDate = new Date(c.redeemed_at)
      if (cDate < dateLimit) return false

      if (selectedCampaign !== 'all' && c.campaign_name !== selectedCampaign) return false
      if (selectedBranch !== 'all' && c.branch_name !== selectedBranch) return false

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase()
        const matchPhone = c.customer_phone?.toLowerCase().includes(query)
        const matchCampaign = c.campaign_name?.toLowerCase().includes(query)
        const matchBranch = c.branch_name?.toLowerCase().includes(query)
        if (!matchPhone && !matchCampaign && !matchBranch) return false
      }
      return true
    })
  }, [activeClaims, dateLimit, selectedCampaign, selectedBranch, searchQuery])

  const filteredStampAwards = useMemo(() => {
    return stampAwards.filter(row => {
      const rowDate = new Date(row.redeemed_at)
      if (rowDate < dateLimit) return false

      if (stampSearchQuery.trim() !== '') {
        const query = stampSearchQuery.toLowerCase()
        const matchEmail = row.customer_email.toLowerCase().includes(query)
        if (!matchEmail) return false
      }
      return true
    })
  }, [stampAwards, dateLimit, stampSearchQuery])

  const stampStats = useMemo(() => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const startOfWeek = new Date()
    const currentDay = startOfWeek.getDay()
    const distance = currentDay === 0 ? 6 : currentDay - 1
    startOfWeek.setDate(startOfWeek.getDate() - distance)
    startOfWeek.setHours(0, 0, 0, 0)

    const sumStamps = (rows: StampAwardRow[]) =>
      rows.reduce((sum, row) => sum + row.stamp_count, 0)

    const todayRows = stampAwards.filter(row => new Date(row.redeemed_at) >= startOfToday)
    const weekRows = stampAwards.filter(row => new Date(row.redeemed_at) >= startOfWeek)
    const periodRows = stampAwards.filter(row => new Date(row.redeemed_at) >= dateLimit)

    return {
      today: sumStamps(todayRows),
      week: sumStamps(weekRows),
      period: sumStamps(periodRows),
      todayEvents: todayRows.length,
    }
  }, [stampAwards, dateLimit])

  // Period Comparison Math
  const comparisonStats = useMemo(() => {
    const currentCount = activeClaims.filter(c => {
      const cDate = new Date(c.redeemed_at)
      return cDate >= dateLimit
    }).length

    const prevCount = activeClaims.filter(c => {
      const cDate = new Date(c.redeemed_at)
      return cDate >= prevDateLimit && cDate < dateLimit
    }).length

    let pctChange = 0
    if (prevCount > 0) {
      pctChange = parseFloat((((currentCount - prevCount) / prevCount) * 100).toFixed(1))
    } else if (currentCount > 0) {
      pctChange = 100 // Skews as positive 100% if no baseline
    }

    // Today / Week counts
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const todayCount = activeClaims.filter(c => new Date(c.redeemed_at) >= startOfToday).length

    const startOfWeek = new Date()
    const currentDay = startOfWeek.getDay()
    const distance = currentDay === 0 ? 6 : currentDay - 1 // Start week on Monday
    startOfWeek.setDate(startOfWeek.getDate() - distance)
    startOfWeek.setHours(0, 0, 0, 0)
    const weekCount = activeClaims.filter(c => new Date(c.redeemed_at) >= startOfWeek).length

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const monthCount = activeClaims.filter(c => new Date(c.redeemed_at) >= startOfMonth).length

    // Unique customers claiming
    const uniqueCust = new Set<string>()
    activeClaims.filter(c => new Date(c.redeemed_at) >= dateLimit).forEach(c => uniqueCust.add(c.customer_phone))

    return {
      currentCount,
      prevCount,
      pctChange,
      todayCount,
      weekCount,
      monthCount,
      uniqueCustCount: uniqueCust.size
    }
  }, [activeClaims, dateLimit, prevDateLimit])

  // SVG Chart Calculations
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {}
    const now = new Date()

    // Determine scale structure
    if (chartView === 'day') {
      // Group by past N days
      const daysCount = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        grouped[label] = 0
      }
      filteredClaims.forEach(c => {
        const label = new Date(c.redeemed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        if (grouped[label] !== undefined) grouped[label]++
      })
    } else if (chartView === 'week') {
      // Group by weeks
      const weeksCount = dateRange === '90d' ? 12 : 5
      for (let i = weeksCount - 1; i >= 0; i--) {
        const wStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
        const label = `Wk ${wStart.getDate()} ${wStart.toLocaleDateString(undefined, { month: 'short' })}`
        grouped[label] = 0
      }
      filteredClaims.forEach(c => {
        const cDate = new Date(c.redeemed_at)
        // Find closest week bucket
        let matchedLabel = Object.keys(grouped)[0]
        let minDiff = Infinity
        Object.keys(grouped).forEach(label => {
          // Extract day/month and calculate diff
          const parts = label.replace('Wk ', '').split(' ')
          const day = parseInt(parts[0])
          const dTest = new Date(now.getFullYear(), now.getMonth(), day)
          const diff = Math.abs(cDate.getTime() - dTest.getTime())
          if (diff < minDiff) {
            minDiff = diff
            matchedLabel = label
          }
        })
        if (grouped[matchedLabel] !== undefined) grouped[matchedLabel]++
      })
    } else {
      // Group by months
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const label = d.toLocaleDateString(undefined, { month: 'long' })
        grouped[label] = 0
      }
      filteredClaims.forEach(c => {
        const label = new Date(c.redeemed_at).toLocaleDateString(undefined, { month: 'long' })
        if (grouped[label] !== undefined) grouped[label]++
      })
    }

    return Object.keys(grouped).map(key => ({ label: key, value: grouped[key] }))
  }, [filteredClaims, chartView, dateRange])

  // Find max value in chart data for drawing height percentages
  const maxChartVal = useMemo(() => {
    const vals = chartData.map(d => d.value)
    const peak = Math.max(...vals, 0)
    return Math.max(peak, 1)
  }, [chartData])

  // Dimension statistics (Campaign & Branch share)
  const campaignStats = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredClaims.forEach(c => {
      counts[c.campaign_name] = (counts[c.campaign_name] || 0) + 1
    })
    return Object.keys(counts)
      .map(key => ({ name: key, count: counts[key] }))
      .sort((a, b) => b.count - a.count)
  }, [filteredClaims])

  const branchStats = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredClaims.forEach(c => {
      counts[c.branch_name] = (counts[c.branch_name] || 0) + 1
    })
    return Object.keys(counts)
      .map(key => ({ name: key, count: counts[key] }))
      .sort((a, b) => b.count - a.count)
  }, [filteredClaims])

  // Exporter for CSV format
  const handleExportCSV = () => {
    if (filteredClaims.length === 0) {
      toast.error('No claims to export')
      return
    }

    const headers = ['Claim ID', 'Redeemed At', 'Voucher Type / Campaign', 'Location / Branch', 'Customer Phone']
    const csvRows = [headers.join(',')]

    filteredClaims.forEach(c => {
      const values = [
        c.id,
        `"${new Date(c.redeemed_at).toLocaleString()}"`,
        `"${c.campaign_name.replace(/"/g, '""')}"`,
        `"${c.branch_name.replace(/"/g, '""')}"`,
        `"${c.customer_phone}"`
      ]
      csvRows.push(values.join(','))
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${business?.name?.replace(/\s+/g, '_') || 'Merchant'}_Claims_Export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV Exported!')
  }

  if (loading) return (
    <div style={{
      display: 'flex', height: '100dvh', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-base)',
    }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--text-primary)',
    }}>
      {/* Top Header bar */}
      <div style={{
        padding: '52px 28px 20px',
        borderBottom: '1px solid var(--border-soft)',
        background: 'var(--bg-base)',
        zIndex: 10,
        position: 'sticky',
        top: 0,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <button
              onClick={() => router.push('/merchant')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: 8,
                color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, marginBottom: 12,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <ChevronLeft size={18} /> Dashboard
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ height: 4, background: 'var(--accent)', width: 40, borderRadius: 2 }} />
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>
                {business?.name} Analytics
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

            {/* Manual Refresh Button */}
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40, background: 'var(--bg-surface)',
                border: '1.5px solid var(--border-soft)', borderRadius: 14,
                cursor: 'pointer', color: 'var(--text-secondary)',
              }}
              title="Refresh Data"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} style={{ animationDuration: '0.8s' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Main dashboard content area */}
      <div style={{ flex: 1, padding: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Segmented Controls / Main Filter Section */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-soft)',
            borderRadius: 20,
            padding: '16px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Left side: Predefined Ranges */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { label: 'Past 7 Days', val: '7d' },
                { label: 'Past 30 Days', val: '30d' },
                { label: 'Past 90 Days', val: '90d' },
              ].map(opt => {
                const active = dateRange === opt.val
                return (
                  <button
                    key={opt.val}
                    onClick={() => setDateRange(opt.val as any)}
                    style={{
                      background: active ? 'var(--accent)' : 'transparent',
                      border: 'none',
                      borderRadius: 10,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {/* Right side: Dropdown Filters */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: '1', justifyContent: 'flex-end' }}>
              {/* Campaign Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-base)', border: '1.5px solid var(--border-soft)', borderRadius: 12, padding: '6px 12px' }}>
                <Tag size={13} style={{ color: 'var(--text-muted)' }} />
                <select 
                  value={selectedCampaign} 
                  onChange={e => setSelectedCampaign(e.target.value)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  <option value="all">All Campaigns</option>
                  {campaignsList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Branch Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-base)', border: '1.5px solid var(--border-soft)', borderRadius: 12, padding: '6px 12px' }}>
                <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                <select 
                  value={selectedBranch} 
                  onChange={e => setSelectedBranch(e.target.value)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  <option value="all">All Branches</option>
                  {branchesList.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Top Summary Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20
          }}>
            {/* Total Claims Card */}
            <SummaryCard
              title="Vouchers Claimed"
              value={comparisonStats.currentCount}
              comparison={comparisonStats.pctChange}
              comparisonLabel="vs. previous period"
              icon={Ticket}
              color="var(--accent)"
            />

            {/* Stamps given today */}
            <SummaryCard
              title="Stamps Given Today"
              value={stampStats.today}
              subtitle={`${stampStats.week} stamps this week · ${stampStats.todayEvents} award${stampStats.todayEvents !== 1 ? 's' : ''} today`}
              icon={Stamp}
              color="oklch(0.68 0.15 210)"
            />

            {/* Claims Today */}
            <SummaryCard
              title="Claims Today"
              value={comparisonStats.todayCount}
              subtitle={`${comparisonStats.weekCount} this week`}
              icon={Clock}
              color="oklch(0.66 0.16 155)"
            />

            {/* Active Customers */}
            <SummaryCard
              title="Unique Customers"
              value={comparisonStats.uniqueCustCount}
              subtitle={`Out of ${activeCustomersCount} total loyalty card members`}
              icon={Users}
              color="oklch(0.68 0.15 210)"
            />

            {/* Total Stamps Issued */}
            <SummaryCard
              title="Total Stamps Issued"
              value={totalStampsCount}
              subtitle={`${stampStats.period} stamps in selected period`}
              icon={Sparkles}
              color="var(--accent)"
            />
          </div>

          {/* Stamp award log */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-soft)',
            borderRadius: 24,
            padding: '28px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: '-0.2px' }}>Stamp Award Log</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Every time a customer scans your stamp QR — time, Google account, and quantity
                </p>
              </div>
            </div>

            <div style={{ position: 'relative', marginBottom: 20 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by customer Google account..."
                value={stampSearchQuery}
                onChange={e => setStampSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  borderRadius: 14,
                  fontSize: 14,
                  background: 'var(--bg-base)',
                  border: '1.5px solid var(--border-soft)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              {filteredStampAwards.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '48px 20px', textAlign: 'center', gap: 12,
                }}>
                  <div style={{ fontSize: 32 }}>✨</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>No stamp awards yet</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, maxWidth: 360 }}>
                    When customers scan your live stamp QR, each award will appear here with the time and their Google account.
                  </p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 520 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stamps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStampAwards.map((row, idx) => {
                      const rowDate = new Date(row.redeemed_at)
                      return (
                        <tr
                          key={row.id}
                          style={{
                            borderBottom: '1px solid var(--border-soft)',
                            background: idx % 2 === 0 ? 'transparent' : 'color-mix(in srgb, var(--border-soft) 8%, transparent)',
                          }}
                          className="table-row-hover"
                        >
                          <td style={{ padding: '16px', fontSize: 13, fontWeight: 500 }}>
                            {rowDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td style={{ padding: '16px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {maskCustomerEmail(row.customer_email)}
                          </td>
                          <td style={{ padding: '16px', fontSize: 13, fontWeight: 800, color: 'var(--accent)' }}>
                            +{row.stamp_count}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Time-Based Charts Section */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-soft)',
            borderRadius: 24,
            padding: '28px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: '-0.2px' }}>Voucher Claims Over Time</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>Showing redemption counts matched to selected date filter</p>
              </div>

              {/* Day / Week / Month Scale Switcher */}
              <div style={{ display: 'flex', background: 'var(--bg-base)', padding: 4, borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                {[
                  { label: 'Day', val: 'day' },
                  { label: 'Week', val: 'week' },
                  { label: 'Month', val: 'month' },
                ].map(scale => (
                  <button
                    key={scale.val}
                    onClick={() => setChartView(scale.val as any)}
                    style={{
                      background: chartView === scale.val ? 'var(--bg-surface)' : 'transparent',
                      border: 'none',
                      borderRadius: 7,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      color: chartView === scale.val ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      boxShadow: chartView === scale.val ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {scale.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div style={{ position: 'relative', width: '100%', height: 260, marginTop: 12 }}>
              {chartData.length === 0 ? (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  No claims data for this view scale.
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {hoveredBar !== null && chartData[hoveredBar] && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${4 + hoveredBar * (92 / chartData.length) + (92 / chartData.length) / 2}%`,
                        top: 0,
                        transform: 'translate(-50%, 0)',
                        zIndex: 2,
                        pointerEvents: 'none',
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 4px 16px var(--shadow-mid)',
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        {chartData[hoveredBar].label}
                      </span>
                      {' · '}
                      {chartData[hoveredBar].value} claim{chartData[hoveredBar].value !== 1 ? 's' : ''}
                    </div>
                  )}

                  {/* SVG Bars Grid */}
                  <svg width="100%" height="220" style={{ overflow: 'visible' }}>
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
                      <line
                        key={idx}
                        x1="4%"
                        y1={20 + p * 160}
                        x2="98%"
                        y2={20 + p * 160}
                        stroke="var(--border-soft)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                    ))}

                    {/* Left Axis Labels */}
                    {[1, 0.75, 0.5, 0.25, 0].map((p, idx) => (
                      <text
                        key={idx}
                        x="1.5%"
                        y={20 + (1 - p) * 160}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="var(--text-muted)"
                        fontSize="10"
                        fontWeight="700"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {Math.round(maxChartVal * p)}
                      </text>
                    ))}

                    {/* Chart Bars */}
                    {chartData.map((d, idx) => {
                      const barWidth = 92 / chartData.length
                      const xPos = 4 + idx * barWidth + (barWidth * 0.15)
                      const barW = barWidth * 0.7
                      
                      const barHeight = (d.value / maxChartVal) * 160
                      const yPos = 180 - barHeight
                      
                      const isHovered = hoveredBar === idx
                      
                      return (
                        <g 
                          key={idx}
                          onMouseEnter={() => setHoveredBar(idx)}
                          onMouseLeave={() => setHoveredBar(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Background Hover Zone (invisible but wide) */}
                          <rect
                            x={`${4 + idx * barWidth}%`}
                            y="10"
                            width={`${barWidth}%`}
                            height="180"
                            fill="transparent"
                          />

                          {/* Render Bar — skip sliver for zero days */}
                          {d.value > 0 && (
                            <rect
                              x={`${xPos}%`}
                              y={yPos}
                              width={`${barW}%`}
                              height={barHeight}
                              rx={4}
                              fill={isHovered ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 70%, transparent)'}
                              style={{ transition: 'fill 0.15s, y 0.3s ease, height 0.3s ease' }}
                            />
                          )}

                          {/* Zero-day hover indicator */}
                          {d.value === 0 && isHovered && (
                            <circle
                              cx={`${xPos + barW / 2}%`}
                              cy={178}
                              r={4}
                              fill="var(--accent)"
                            />
                          )}
                        </g>
                      )
                    })}
                  </svg>

                  {/* X Axis Labels */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingLeft: '4%',
                    paddingRight: '2%',
                    marginTop: 8,
                  }}>
                    {chartData.map((d, idx) => {
                      // Skip rendering some labels to avoid crowding on long series
                      const showLabel = 
                        chartData.length <= 10 || 
                        (chartData.length <= 30 && idx % 3 === 0) || 
                        (idx % 8 === 0) || 
                        idx === chartData.length - 1
                      
                      return (
                        <span 
                          key={idx} 
                          style={{ 
                            fontSize: 10, 
                            fontWeight: 700, 
                            color: hoveredBar === idx ? 'var(--text-primary)' : 'var(--text-muted)',
                            width: `${92 / chartData.length}%`,
                            textAlign: 'center',
                            opacity: showLabel ? 1 : 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {d.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown cards grid (Campaign & Location splits) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 28,
          }}>
            {/* Campaign Traction Card */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-soft)',
              borderRadius: 24,
              padding: '28px',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 20px', letterSpacing: '-0.2px' }}>
                Claims by Campaign
              </h3>
              {campaignStats.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>
                  No campaigns active in this window.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {campaignStats.map(stat => {
                    const totalClaims = filteredClaims.length
                    const pct = totalClaims > 0 ? (stat.count / totalClaims) * 100 : 0
                    return (
                      <div key={stat.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{stat.name}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{stat.count} claims ({pct.toFixed(0)}%)</span>
                        </div>
                        {/* Progress Bar track */}
                        <div style={{ height: 8, background: 'var(--bg-base)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 'inherit' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Location Split Card */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-soft)',
              borderRadius: 24,
              padding: '28px',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 20px', letterSpacing: '-0.2px' }}>
                Claims by Branch Location
              </h3>
              {branchStats.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>
                  No branch activity in this window.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {branchStats.map((stat, idx) => {
                    const totalClaims = filteredClaims.length
                    const pct = totalClaims > 0 ? (stat.count / totalClaims) * 100 : 0
                    // Curved friendly colors for locations
                    const colors = ['oklch(0.68 0.15 210)', 'oklch(0.66 0.16 155)', 'oklch(0.50 0.16 28)']
                    const barColor = colors[idx % colors.length]
                    
                    return (
                      <div key={stat.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-primary)' }}>{stat.name}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{stat.count} ({pct.toFixed(0)}%)</span>
                        </div>
                        {/* Progress Bar track */}
                        <div style={{ height: 8, background: 'var(--bg-base)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 'inherit' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Claims Table Section */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-soft)',
            borderRadius: 24,
            padding: '28px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: '-0.2px' }}>Voucher Claim Log</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>Shows the complete history of redeems in current view</p>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportCSV}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg-base)', border: '1.5px solid var(--border-soft)',
                  borderRadius: 12, padding: '10px 16px', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'var(--bg-surface)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-soft)'
                  e.currentTarget.style.background = 'var(--bg-base)'
                }}
              >
                <Download size={14} /> Export CSV
              </button>
            </div>

            {/* Table Search & Pre-Filter Actions */}
            <div style={{
              display: 'flex',
              gap: 16,
              marginBottom: 20,
              flexWrap: 'wrap',
            }}>
              {/* Search input widget */}
              <div style={{
                position: 'relative',
                flex: 1,
                minWidth: 260,
              }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by customer phone, campaign, or branch..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    borderRadius: 14,
                    fontSize: 14,
                    background: 'var(--bg-base)',
                    border: '1.5px solid var(--border-soft)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontFamily: 'var(--font-sans)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Table Content */}
            <div style={{ overflowX: 'auto' }}>
              {filteredClaims.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '60px 20px', textAlign: 'center', gap: 12,
                }}>
                  <div style={{ fontSize: 32 }}>🎫</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>No claims found</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, maxWidth: 320 }}>
                    {searchQuery || selectedCampaign !== 'all' || selectedBranch !== 'all'
                      ? 'No matches found with current filters. Try relaxing your parameters.'
                      : 'When customers slide to redeem full stamp cards, their claims will appear live on this list.'
                    }
                  </p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timestamp</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer ID</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Voucher Campaign</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Location</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.map((claim, idx) => {
                      const cDate = new Date(claim.redeemed_at)
                      const isExpired = new Date() > new Date(claim.expires_at)
                      
                      // Mask phone number for customer privacy: show last 4 digits clearly
                      let maskedPhone = claim.customer_phone
                      if (claim.customer_phone && claim.customer_phone !== 'Unknown') {
                        const parts = claim.customer_phone.split('-')
                        if (parts.length > 1) {
                          maskedPhone = `${parts[0]}-****${parts[1].substring(4)}`
                        } else {
                          const len = claim.customer_phone.length
                          maskedPhone = `+${claim.customer_phone.substring(1, 4)} *** ${claim.customer_phone.substring(len - 4)}`
                        }
                      }

                      return (
                        <tr 
                          key={claim.id} 
                          style={{ 
                            borderBottom: '1px solid var(--border-soft)',
                            background: idx % 2 === 0 ? 'transparent' : 'color-mix(in srgb, var(--border-soft) 8%, transparent)',
                            transition: 'background 0.15s',
                          }}
                          className="table-row-hover"
                        >
                          <td style={{ padding: '16px', fontSize: 13, fontWeight: 500 }}>
                            {cDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '16px', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                            {maskedPhone}
                          </td>
                          <td style={{ padding: '16px', fontSize: 13, fontWeight: 700 }}>
                            {claim.campaign_name}
                          </td>
                          <td style={{ padding: '16px', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {claim.branch_name}
                          </td>
                          <td style={{ padding: '16px' }}>
                            {isExpired ? (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '4px 10px', borderRadius: 20,
                                background: 'var(--border-soft)',
                                fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)'
                              }}>
                                Redeemed
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '4px 10px', borderRadius: 20,
                                background: 'oklch(0.66 0.16 155 / 0.15)',
                                border: '1px solid oklch(0.66 0.16 155 / 0.3)',
                                fontSize: 11, fontWeight: 700, color: 'oklch(0.66 0.16 155)',
                                position: 'relative'
                              }}>
                                <span style={{
                                  width: 6, height: 6, borderRadius: '50%',
                                  background: 'oklch(0.66 0.16 155)',
                                  animation: 'pulse 1.2s infinite'
                                }} />
                                Active
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Embedded CSS keyframe animations */}
      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        .animate-spin { 
          animation: spin 1s linear infinite; 
        }
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.9; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.9; }
        }
        .table-row-hover:hover {
          background: color-mix(in srgb, var(--accent) 4%, var(--bg-surface)) !important;
        }
      `}</style>
    </div>
  )
}

// Summary Card Sub-component
function SummaryCard({ 
  title, 
  value, 
  comparison, 
  comparisonLabel, 
  subtitle, 
  icon: Icon, 
  color 
}: {
  title: string
  value: number
  comparison?: number
  comparisonLabel?: string
  subtitle?: string
  icon: any
  color: string
}) {
  const isPositive = comparison && comparison >= 0
  
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-soft)',
      borderRadius: 22,
      padding: '22px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
      minHeight: 120,
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: -15, right: -15, width: 70, height: 70,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{title}</span>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: `color-mix(in srgb, ${color} 10%, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color,
          }}>
            <Icon size={16} />
          </div>
        </div>

        <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {comparison !== undefined ? (
          <>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 11, fontWeight: 800,
              color: isPositive ? 'oklch(0.66 0.16 155)' : 'oklch(0.62 0.20 20)',
            }}>
              {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {isPositive ? `+${comparison}%` : `${comparison}%`}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{comparisonLabel}</span>
          </>
        ) : subtitle ? (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{subtitle}</span>
        ) : null}
      </div>
    </div>
  )
}
