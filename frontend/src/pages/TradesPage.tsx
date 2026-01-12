import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { tradesAPI } from '@/lib/api';
import type { Trade } from '@/types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function TradesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['trades', statusFilter],
    queryFn: () => tradesAPI.getAll({ 
      status: statusFilter === 'all' ? undefined : statusFilter 
    }),
  });

  const trades = data?.trades ?? [];

  const filteredTrades = trades.filter((trade: Trade) =>
    trade.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-100 text-blue-800',
      closed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || styles.open;
  };

  const getDirectionBadge = (direction: string) => {
    return direction === 'long' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trades</h1>
          <p className="text-gray-600 mt-1">Verwalte alle deine Trading Positionen</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
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
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Trades...</p>
          </div>
        </div>
      ) : filteredTrades.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Keine Trades gefunden</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Richtung
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Entry
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Exit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Datum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTrades.map((trade: Trade) => (
                  <tr key={trade.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{trade.symbol}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 capitalize">{trade.type}</span>
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
                      <span className="text-sm text-gray-900">{formatCurrency(trade.entryPrice)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-900">
                        {trade.exitPrice ? formatCurrency(trade.exitPrice) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {trade.profitLoss !== null && trade.profitLoss !== undefined ? (
                        <span
                          className={`font-semibold ${
                            trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(trade.profitLoss)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
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
                      <span className="text-sm text-gray-600">
                        {format(new Date(trade.entryDate), 'dd.MM.yyyy', { locale: de })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
