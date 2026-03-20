import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  CreditCard,
  Activity,
  HeartPulse,
  TrendingUp,
  Ticket,
  RefreshCw,
  AlertCircle,
  Bot,
} from 'lucide-react'
import client from '../api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { InfoTooltip } from '@/components/InfoTooltip'
import { cn } from '@/lib/utils'

interface OverviewData {
  users?: { total?: number; active?: number; blocked?: number; balance_rubles?: number }
  subscriptions?: { active?: number; expired?: number }
  support?: { open_tickets?: number }
  payments?: { today_rubles?: number; today_kopeks?: number }
}

interface HealthData {
  status?: string
  api_version?: string
  bot_version?: string
  features?: {
    monitoring?: boolean
    maintenance?: boolean
    reporting?: boolean
    webhooks?: boolean
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'text-primary-400',
}: {
  icon: typeof Users
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <Card className="glass-card">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-dark-300 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {sub && <p className="text-xs text-dark-300">{sub}</p>}
          </div>
          <div className={cn('p-2 rounded-lg bg-[var(--glass-bg)]', color)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Bedolaga() {
  const { t } = useTranslation()

  const { data: statusData } = useQuery({
    queryKey: ['bedolaga-status'],
    queryFn: () => client.get('/bedolaga/status').then((r) => r.data),
    staleTime: 60_000,
  })

  const isConfigured = statusData?.configured

  const {
    data: overview,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = useQuery<OverviewData>({
    queryKey: ['bedolaga-overview'],
    queryFn: () => client.get('/bedolaga/overview').then((r) => r.data),
    enabled: isConfigured === true,
    staleTime: 60_000,
    retry: 1,
  })

  const {
    data: health,
    isLoading: healthLoading,
    refetch: refetchHealth,
  } = useQuery<HealthData>({
    queryKey: ['bedolaga-health'],
    queryFn: () => client.get('/bedolaga/health').then((r) => r.data),
    enabled: isConfigured === true,
    staleTime: 60_000,
    retry: 1,
  })

  const isLoading = overviewLoading || healthLoading

  // Not configured state
  if (isConfigured === false) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-header-title">{t('bedolaga.title')}</h1>
          </div>
        </div>
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">{t('bedolaga.notConfigured')}</h2>
            <p className="text-dark-300 text-sm max-w-md mx-auto">
              {t('bedolaga.notConfiguredDesc')}
            </p>
            <code className="block mt-4 text-xs text-dark-300 bg-[var(--glass-bg)] p-3 rounded-lg">
              BEDOLAGA_API_URL=http://...:8000<br />
              BEDOLAGA_API_TOKEN=your_token
            </code>
          </CardContent>
        </Card>
      </div>
    )
  }

  const users = overview?.users
  const subs = overview?.subscriptions
  const payments = overview?.payments
  const support = overview?.support

  const healthOk = health?.status === 'ok'
  const inMaintenance = health?.features?.maintenance

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-header-title">{t('bedolaga.title')}</h1>
            <InfoTooltip text={t('bedolaga.tooltip')} side="right" />
            {health && (
              <Badge
                variant={healthOk && !inMaintenance ? 'default' : 'destructive'}
                className={cn(
                  'ml-2 text-[10px]',
                  healthOk && !inMaintenance
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                )}
              >
                {inMaintenance ? t('bedolaga.maintenance') : healthOk ? t('bedolaga.online') : t('bedolaga.offline')}
              </Badge>
            )}
          </div>
          <p className="text-dark-200 mt-1 text-sm">
            {t('bedolaga.subtitle')}
            {health?.bot_version && (
              <span className="text-dark-300 ml-1">v{health.bot_version}</span>
            )}
          </p>
        </div>
        <div className="page-header-actions">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => {
              refetchOverview()
              refetchHealth()
            }}
            disabled={isLoading}
          >
            <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4 md:p-5">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={Users}
            label={t('bedolaga.stats.totalUsers')}
            value={users?.total?.toLocaleString() ?? '—'}
            sub={`${t('bedolaga.stats.active')}: ${users?.active?.toLocaleString() ?? '—'}`}
            color="text-blue-400"
          />
          <StatCard
            icon={Activity}
            label={t('bedolaga.stats.activeSubs')}
            value={subs?.active?.toLocaleString() ?? '—'}
            sub={`${t('bedolaga.stats.expired')}: ${subs?.expired?.toLocaleString() ?? '—'}`}
            color="text-emerald-400"
          />
          <StatCard
            icon={CreditCard}
            label={t('bedolaga.stats.depositsToday')}
            value={payments?.today_rubles != null ? `${payments.today_rubles.toLocaleString()} ₽` : '—'}
            color="text-amber-400"
          />
          <StatCard
            icon={TrendingUp}
            label={t('bedolaga.stats.totalBalance')}
            value={users?.balance_rubles != null ? `${users.balance_rubles.toLocaleString()} ₽` : '—'}
            color="text-violet-400"
          />
          <StatCard
            icon={Ticket}
            label={t('bedolaga.stats.openTickets')}
            value={support?.open_tickets ?? '—'}
            color="text-rose-400"
          />
          <StatCard
            icon={Users}
            label={t('bedolaga.stats.blockedUsers')}
            value={users?.blocked?.toLocaleString() ?? '—'}
            color="text-red-400"
          />
          <StatCard
            icon={HeartPulse}
            label={t('bedolaga.stats.botStatus')}
            value={healthOk ? t('bedolaga.online') : t('bedolaga.offline')}
            sub={health?.api_version ? `API ${health.api_version}` : undefined}
            color={healthOk ? 'text-emerald-400' : 'text-red-400'}
          />
          <StatCard
            icon={Bot}
            label={t('bedolaga.stats.services')}
            value={
              [health?.features?.monitoring && 'Mon', health?.features?.webhooks && 'WH', health?.features?.reporting && 'Rep']
                .filter(Boolean)
                .join(' / ') || '—'
            }
            sub={inMaintenance ? t('bedolaga.maintenance') : undefined}
            color="text-cyan-400"
          />
        </div>
      )}
    </div>
  )
}
