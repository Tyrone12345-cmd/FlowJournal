import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, DollarSign, Target, Award, AlertCircle } from 'lucide-react';
import { tradesAPI } from '@/lib/api';
import type { TradeStats } from '@/types';

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: 'up' | 'down'; 
  trendValue?: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-primary-50 rounded-lg">
          <Icon className="text-primary-600" size={24} />
        </div>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trendValue}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<TradeStats>({
    queryKey: ['tradeStats'],
    queryFn: tradesAPI.getStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const profitLossColor = stats?.totalProfitLoss ?? 0 >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Überblick über deine Trading Performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Gesamt Trades"
          value={stats?.totalTrades ?? 0}
          icon={Target}
        />
        <StatCard
          title="Win Rate"
          value={`${stats?.winRate ?? 0}%`}
          icon={Award}
          trend={stats && stats.winRate >= 50 ? 'up' : 'down'}
          trendValue={`${stats?.winningTrades ?? 0}/${stats?.closedTrades ?? 0}`}
        />
        <StatCard
          title="Gesamt P&L"
          value={formatCurrency(stats?.totalProfitLoss ?? 0)}
          icon={DollarSign}
          trend={stats && stats.totalProfitLoss >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Offene Trades"
          value={stats?.openTrades ?? 0}
          icon={TrendingUp}
        />
      </div>

      {/* Performance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Übersicht</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gewinnende Trades</span>
              <span className="font-semibold text-green-600">
                {stats?.winningTrades ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verlierende Trades</span>
              <span className="font-semibold text-red-600">
                {stats?.losingTrades ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-gray-600">Durchschnitt Gewinn</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(stats?.avgWin ?? 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Durchschnitt Verlust</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(stats?.avgLoss ?? 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Beste & Schlechteste</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-green-600" />
                <span className="text-sm font-medium text-green-900">Bester Trade</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats?.bestTrade ?? 0)}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={20} className="text-red-600" />
                <span className="text-sm font-medium text-red-900">Schlechtester Trade</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(stats?.worstTrade ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {stats && stats.totalTrades === 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Noch keine Trades vorhanden</h4>
            <p className="text-sm text-blue-700">
              Beginne mit dem Erfassen deiner Trades, um deine Performance zu tracken.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
