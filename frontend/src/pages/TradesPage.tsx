import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { tradesAPI } from '@/lib/api';
import type { Trade } from '@/types';
import { safeFormatDate } from '@/utils/dateUtils';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';

const assetTypeIcons: Record<string, string> = {
  stock: '📈',
  crypto: '₿',
  forex: '💱',
  options: '📊',
  futures: '📉',
};

export default function TradesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['trades', statusFilter],
    queryFn: () => tradesAPI.getAll({ 
      status: statusFilter === 'all' ? undefined : statusFilter 
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: tradesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['tradeStats'] });
    },
  });

  const trades = data?.trades ?? [];

  const filteredTrades = trades.filter((trade: Trade) =>
    trade.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      closed: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      cancelled: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    };
    return styles[status as keyof typeof styles] || styles.open;
  };

  const getDirectionBadge = (direction: string) => {
    return direction === 'long' 
      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
  };

  const handleEditTrade = (trade: Trade) => {
    navigate('/app/trades/edit', { state: { trade } });
  };

  const handleDeleteTrade = (id: string) => {
    setTradeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTrade = () => {
    if (tradeToDelete) {
      deleteMutation.mutate(tradeToDelete);
      setIsDetailOpen(false);
      setSelectedTrade(null);
      setTradeToDelete(null);
    }
  };

  const handleRowClick = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsDetailOpen(true);
  };

  const calculateRR = (trade: Trade) => {
    if (!trade.stopLoss || !trade.takeProfit) return null;
    const risk = Math.abs(trade.entryPrice - trade.stopLoss);
    const reward = Math.abs(trade.takeProfit - trade.entryPrice);
    return risk > 0 ? (reward / risk).toFixed(2) : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trades</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Verwalte alle deine Trading Positionen</p>
        </div>
        <button 
          onClick={() => navigate('/app/trades/new')}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Neuer Trade
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Symbol suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input md:w-48"
          >
            <option value="all">Alle Status</option>
            <option value="open">Offen</option>
            <option value="closed">Geschlossen</option>
            <option value="cancelled">Abgebrochen</option>
          </select>
        </div>
      </div>

      {/* Trades Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-600 dark:border-accent-dark-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Lade Trades...</p>
          </div>
        </div>
      ) : filteredTrades.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Keine Trades gefunden</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Richtung
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Entry
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Exit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Datum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTrades.map((trade: Trade) => (
                  <tr 
                    key={trade.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(trade)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{assetTypeIcons[trade.type] || '📊'}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{trade.symbol}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{trade.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${getDirectionBadge(
                          trade.direction
                        )}`}
                      >
                        {trade.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-900 dark:text-gray-100">{formatCurrency(trade.entryPrice)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {trade.exitPrice ? formatCurrency(trade.exitPrice) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {trade.profitLoss !== null && trade.profitLoss !== undefined ? (
                        <span
                          className={`font-semibold ${
                            trade.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {formatCurrency(trade.profitLoss)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusBadge(
                          trade.status
                        )}`}
                      >
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {safeFormatDate(trade.entryDate, 'dd.MM.yyyy')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trade Detail Modal */}
      {selectedTrade && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedTrade(null);
          }}
          title={`Trade Details - ${selectedTrade.symbol}`}
        >
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Symbol</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedTrade.symbol}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                <p className="text-lg capitalize text-gray-900 dark:text-white">{selectedTrade.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Richtung</p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded ${getDirectionBadge(
                    selectedTrade.direction
                  )}`}
                >
                  {selectedTrade.direction.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Entry Preis</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {!isNaN(selectedTrade.entryPrice) && selectedTrade.entryPrice ? formatCurrency(selectedTrade.entryPrice) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Exit Preis</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedTrade.exitPrice && !isNaN(selectedTrade.exitPrice) ? formatCurrency(selectedTrade.exitPrice) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stop Loss</p>
                <p className="text-lg text-gray-900 dark:text-white">
                  {selectedTrade.stopLoss && !isNaN(selectedTrade.stopLoss) ? formatCurrency(selectedTrade.stopLoss) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Take Profit</p>
                <p className="text-lg text-gray-900 dark:text-white">
                  {selectedTrade.takeProfit && !isNaN(selectedTrade.takeProfit) ? formatCurrency(selectedTrade.takeProfit) : 'N/A'}
                </p>
              </div>
            </div>

            {/* P&L & R:R */}
            <div className="grid grid-cols-2 gap-4">
              {selectedTrade.profitLoss !== null && selectedTrade.profitLoss !== undefined && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Profit & Loss</p>
                  <p
                    className={`text-3xl font-bold ${
                      selectedTrade.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatCurrency(selectedTrade.profitLoss)}
                  </p>
                  {selectedTrade.profitLossPercent && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedTrade.profitLossPercent.toFixed(2)}%</p>
                  )}
                </div>
              )}
              {calculateRR(selectedTrade) && (
                <div className="p-4 bg-primary-50 dark:bg-accent-dark-900/20 rounded-lg">
                  <p className="text-sm text-primary-900 dark:text-accent-dark-300 mb-1">Risk/Reward</p>
                  <p className="text-3xl font-bold text-primary-600 dark:text-accent-dark-400">1:{calculateRR(selectedTrade)}</p>
                </div>
              )}
            </div>

            {/* Emotions */}
            {selectedTrade.emotions && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Emotionen</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTrade.emotions.split(',').map((emotion, i) => (
                    <span key={i} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 text-sm rounded-full">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mistakes */}
            {selectedTrade.mistakes && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fehler / Learnings</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTrade.mistakes.split(',').map((mistake, i) => (
                    <span key={i} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm rounded-full">
                      {mistake}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {selectedTrade.tags && selectedTrade.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTrade.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedTrade.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notizen</p>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedTrade.notes}</p>
                </div>
              </div>
            )}

            {/* Screenshots */}
            {selectedTrade.screenshots && selectedTrade.screenshots.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Screenshots</p>
                <div className="grid grid-cols-2 gap-4">
                  {selectedTrade.screenshots.map((img, i) => (
                    <img key={i} src={img} alt={`Screenshot ${i + 1}`} className="rounded-lg w-full" />
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Entry Datum</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {safeFormatDate(selectedTrade.entryDate, 'dd.MM.yyyy HH:mm')}
                </p>
              </div>
              {selectedTrade.exitDate && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Exit Datum</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {safeFormatDate(selectedTrade.exitDate, 'dd.MM.yyyy HH:mm')}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleEditTrade(selectedTrade)}
                className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
              >
                <Edit2 size={18} />
                Bearbeiten
              </button>
              <button
                onClick={() => handleDeleteTrade(selectedTrade.id)}
                className="flex-1 btn bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Löschen
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteTrade}
        title="Trade löschen?"
        message="Möchtest du diesen Trade wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        confirmText="Ja, löschen"
        cancelText="Abbrechen"
        type="danger"
      />
    </motion.div>
  );
}
