import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Award, AlertCircle, BarChart3, Activity, CheckCircle2, Plus, Calendar, ArrowUpDown } from 'lucide-react';
import { tradesAPI, authAPI } from '@/lib/api';
import type { TradeStats, Trade } from '@/types';
import TradeModal from '@/components/TradeModal';
import { safeFormatDate } from '@/utils/dateUtils';

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: stats, isLoading, error } = useQuery<TradeStats>({
    queryKey: ['tradeStats'],
    queryFn: tradesAPI.getStats,
  });

  const { data: recentTradesData } = useQuery({
    queryKey: ['trades', 'recent'],
    queryFn: () => tradesAPI.getAll({ status: undefined }),
  });

  const createMutation = useMutation({
    mutationFn: tradesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['tradeStats'] });
      setIsModalOpen(false);
    },
  });

  const recentTrades = (recentTradesData?.trades || []).slice(0, 5);

  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatPercent = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: any): string => {
    if (value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value))) return 'N/A';
    return String(value);
  };

  const calculateProfitFactor = () => {
    if (!stats?.avgWin || !stats?.avgLoss || stats.avgLoss === 0) return null;
    const totalWins = stats.avgWin * (stats.winningTrades || 0);
    const totalLosses = Math.abs(stats.avgLoss * (stats.losingTrades || 0));
    return totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : null;
  };

  const handleCreateTrade = (data: any) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 dark:border-accent-dark-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Fehler beim Laden der Daten</p>
        </div>
      </div>
    );
  }

  const hasData = stats && stats.totalTrades && stats.totalTrades > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">Überblick über deine Trading Performance</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus size={20} />
          Neuer Trade
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-500 dark:to-accent-dark-600 rounded-xl flex items-center justify-center mb-4">
            <Target size={24} className="text-white dark:text-gray-900" />
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Gesamt Trades
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats?.totalTrades ?? 0)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
          <div className={`w-12 h-12 bg-gradient-to-br ${stats?.winRate && stats.winRate >= 50 ? 'from-green-600 to-green-700 dark:from-green-500 dark:to-green-600' : 'from-red-600 to-red-700 dark:from-red-500 dark:to-red-600'} rounded-xl flex items-center justify-center mb-4`}>
            <Award size={24} className="text-white" />
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Win Rate
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatPercent(stats?.winRate)}
          </p>
          {hasData && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatNumber(stats?.winningTrades)}/{formatNumber(stats?.closedTrades)}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
          <div className={`w-12 h-12 bg-gradient-to-br ${stats?.totalProfitLoss && stats.totalProfitLoss > 0 ? 'from-green-600 to-green-700 dark:from-green-500 dark:to-green-600' : stats?.totalProfitLoss && stats.totalProfitLoss < 0 ? 'from-red-600 to-red-700 dark:from-red-500 dark:to-red-600' : 'from-primary-600 to-primary-700 dark:from-accent-dark-500 dark:to-accent-dark-600'} rounded-xl flex items-center justify-center mb-4`}>
            <DollarSign size={24} className="text-white dark:text-gray-900" />
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Gesamt P&L
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats?.totalProfitLoss)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <Activity size={24} className="text-white" />
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Offene Trades
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats?.openTrades ?? 0)}
          </p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <ArrowUpDown size={20} className="text-white" />
            </div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 uppercase tracking-wide">
              Profit Factor
            </h3>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {calculateProfitFactor() || 'N/A'}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
            {calculateProfitFactor() && parseFloat(calculateProfitFactor()!) > 1 ? 'Profitabel' : 'Zu verbessern'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 dark:bg-purple-500 rounded-lg flex items-center justify-center">
              <BarChart3 size={20} className="text-white" />
            </div>
            <h3 className="text-sm font-medium text-purple-900 dark:text-purple-300 uppercase tracking-wide">
              Avg. Trade
            </h3>
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats?.closedTrades ? formatCurrency((stats?.totalProfitLoss || 0) / stats.closedTrades) : 'N/A'}
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-400 mt-2">
            Pro geschlossenem Trade
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-2xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-600 dark:bg-orange-500 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <h3 className="text-sm font-medium text-orange-900 dark:text-orange-300 uppercase tracking-wide">
              Diese Woche
            </h3>
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {formatNumber(stats?.openTrades ?? 0)}
          </p>
          <p className="text-xs text-orange-700 dark:text-orange-400 mt-2">
            Aktive Positionen
          </p>
        </div>
      </div>

      {/* Performance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Overview */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-500 dark:to-accent-dark-600 rounded-xl flex items-center justify-center">
              <BarChart3 size={24} className="text-white dark:text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Performance Übersicht
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Gewinnende Trades</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatNumber(stats?.winningTrades ?? 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Verlierende Trades</span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatNumber(stats?.losingTrades ?? 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Durchschnitt Gewinn</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats?.avgWin)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 dark:text-gray-400">Durchschnitt Verlust</span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(stats?.avgLoss)}
              </span>
            </div>
          </div>
        </div>

        {/* Best & Worst Trades */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Beste & Schlechteste
          </h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-900 dark:text-green-300 uppercase tracking-wide">
                  Bester Trade
                </span>
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats?.bestTrade)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={24} className="text-red-600 dark:text-red-400" />
                <span className="text-sm font-semibold text-red-900 dark:text-red-300 uppercase tracking-wide">
                  Schlechtester Trade
                </span>
              </div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(stats?.worstTrade)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      {hasData && recentTrades.length > 0 && (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-500 dark:to-accent-dark-600 rounded-xl flex items-center justify-center">
                <Activity size={24} className="text-white dark:text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Letzte Trades
              </h3>
            </div>
            <button 
              onClick={() => navigate('/app/trades')}
              className="text-primary-600 dark:text-accent-dark-400 hover:text-primary-700 dark:hover:text-accent-dark-300 font-medium text-sm transition-colors"
            >
              Alle anzeigen →
            </button>
          </div>
          <div className="space-y-3">
            {recentTrades.map((trade: Trade) => (
              <div 
                key={trade.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => navigate('/app/trades')}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    trade.direction === 'long' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {trade.direction === 'long' ? (
                      <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
                    ) : (
                      <TrendingDown className="text-red-600 dark:text-red-400" size={24} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{trade.symbol}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {safeFormatDate(trade.entryDate, 'dd.MM.yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Entry</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(trade.entryPrice)}</p>
                  </div>
                  {trade.profitLoss !== null && trade.profitLoss !== undefined && (
                    <div className="text-right min-w-[100px]">
                      <p className="text-sm text-gray-500 dark:text-gray-400">P&L</p>
                      <p className={`font-bold text-lg ${
                        trade.profitLoss >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {trade.profitLoss >= 0 ? '+' : ''}{formatCurrency(trade.profitLoss)}
                      </p>
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    trade.status === 'open' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : trade.status === 'closed'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {trade.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Banner */}
      {!hasData && (
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-accent-dark-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-primary-600 dark:text-accent-dark-500 flex-shrink-0 mt-1" size={28} />
            <div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Noch keine Trades vorhanden
              </h4>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                Beginne mit dem Erfassen deiner Trades, um deine Performance zu tracken und detaillierte Statistiken zu sehen.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle2 size={20} className="text-primary-600 dark:text-accent-dark-500" />
                  <span>Detaillierte Analytics verfügbar</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle2 size={20} className="text-primary-600 dark:text-accent-dark-500" />
                  <span>Alle Metriken werden automatisch berechnet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trade Modal */}
      <TradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTrade}
      />
    </motion.div>
  );
}
