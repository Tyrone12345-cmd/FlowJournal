import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, ArrowLeft, TrendingUp, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { TradeType, TradeDirection, TradeStatus } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tradesAPI, uploadAPI } from '@/lib/api';

const tradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol erforderlich'),
  type: z.nativeEnum(TradeType),
  direction: z.nativeEnum(TradeDirection),
  entryPrice: z.coerce.number().positive('Entry-Preis muss positiv sein'),
  exitPrice: z.union([z.coerce.number().positive(), z.literal(''), z.nan()]).optional(),
  quantity: z.coerce.number().positive('Menge muss positiv sein'),
  entryDate: z.string().min(1, 'Entry Datum erforderlich'),
  exitDate: z.string().optional(),
  stopLoss: z.union([z.coerce.number(), z.literal(''), z.nan()]).optional(),
  takeProfit: z.union([z.coerce.number(), z.literal(''), z.nan()]).optional(),
  fees: z.coerce.number().min(0).default(0),
  strategyId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  emotions: z.string().optional(),
  mistakes: z.string().optional(),
  status: z.nativeEnum(TradeStatus),
});

type TradeFormData = z.infer<typeof tradeSchema>;

const emotionTags = ['Diszipliniert', 'Gierig', 'Ängstlich', 'FOMO', 'Revanche', 'Ruhig', 'Überfordert'];
const mistakeTags = ['Zu früh raus', 'Zu spät raus', 'Stop Loss nicht gesetzt', 'Overtrading', 'Gegen Plan', 'Position zu groß'];

const assetTypes = [
  { id: 'stock', label: 'Aktien', emoji: '📈' },
  { id: 'crypto', label: 'Crypto', emoji: '₿' },
  { id: 'forex', label: 'Forex', emoji: '💱' },
  { id: 'options', label: 'Optionen', emoji: '📊' },
  { id: 'futures', label: 'Futures', emoji: '📉' },
];

export default function TradeFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // Check if we're editing an existing trade
  const initialData = location.state?.trade;
  const isEditing = !!initialData;

  const [screenshots, setScreenshots] = useState<string[]>(initialData?.screenshots || []);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(
    initialData?.emotions ? initialData.emotions.split(',') : []
  );
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>(
    initialData?.mistakes ? initialData.mistakes.split(',') : []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: initialData || {
      type: TradeType.STOCK,
      direction: TradeDirection.LONG,
      status: TradeStatus.OPEN,
      fees: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: tradesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['tradeStats'] });
      navigate('/app/trades');
    },
    onError: (error: any) => {
      console.error('Error creating trade:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Fehler beim Erstellen des Trades';
      console.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => tradesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['tradeStats'] });
      navigate('/app/trades');
    },
    onError: (error: any) => {
      console.error('Error updating trade:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Fehler beim Aktualisieren des Trades';
      console.error(errorMessage);
    },
  });

  const entryPrice = watch('entryPrice');
  const exitPrice = watch('exitPrice');
  const stopLoss = watch('stopLoss');
  const takeProfit = watch('takeProfit');
  const quantity = watch('quantity');
  const fees = watch('fees') || 0;
  const direction = watch('direction');
  const tradeType = watch('type') || TradeType.CRYPTO;

  // Symbol suggestions based on trade type
  const getSymbolSuggestions = () => {
    const assetIcon = assetTypes.find(a => a.id === tradeType)?.emoji || '📊';
    
    switch(tradeType) {
      case 'crypto':
        return [
          { symbol: 'BTC/USD', label: `${assetIcon} BTC`, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50' },
          { symbol: 'ETH/USD', label: `${assetIcon} ETH`, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50' },
          { symbol: 'SOL/USD', label: `${assetIcon} SOL`, color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900/50' },
          { symbol: 'XRP/USD', label: `${assetIcon} XRP`, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50' },
          { symbol: 'ADA/USD', label: `${assetIcon} ADA`, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50' },
          { symbol: 'DOGE/USD', label: `${assetIcon} DOGE`, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50' },
        ];
      case 'stock':
        return [
          { symbol: 'AAPL', label: `${assetIcon} AAPL`, color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' },
          { symbol: 'TSLA', label: `${assetIcon} TSLA`, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50' },
          { symbol: 'NVDA', label: `${assetIcon} NVDA`, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50' },
          { symbol: 'MSFT', label: `${assetIcon} MSFT`, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50' },
          { symbol: 'GOOGL', label: `${assetIcon} GOOGL`, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50' },
          { symbol: 'AMZN', label: `${assetIcon} AMZN`, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50' },
        ];
      case 'forex':
        return [
          { symbol: 'EUR/USD', label: `${assetIcon} EUR/USD`, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50' },
          { symbol: 'GBP/USD', label: `${assetIcon} GBP/USD`, color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50' },
          { symbol: 'USD/JPY', label: `${assetIcon} USD/JPY`, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50' },
          { symbol: 'USD/CHF', label: `${assetIcon} USD/CHF`, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50' },
          { symbol: 'AUD/USD', label: `${assetIcon} AUD/USD`, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50' },
          { symbol: 'USD/CAD', label: `${assetIcon} USD/CAD`, color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900/50' },
        ];
      case 'options':
        return [
          { symbol: 'SPY', label: `${assetIcon} SPY`, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50' },
          { symbol: 'QQQ', label: `${assetIcon} QQQ`, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50' },
          { symbol: 'AAPL', label: `${assetIcon} AAPL`, color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' },
          { symbol: 'TSLA', label: `${assetIcon} TSLA`, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50' },
          { symbol: 'NVDA', label: `${assetIcon} NVDA`, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50' },
          { symbol: 'IWM', label: `${assetIcon} IWM`, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50' },
        ];
      case 'futures':
        return [
          { symbol: 'ES', label: `${assetIcon} E-Mini S&P`, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50' },
          { symbol: 'NQ', label: `${assetIcon} E-Mini Nasdaq`, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50' },
          { symbol: 'GC', label: `${assetIcon} Gold`, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50' },
          { symbol: 'CL', label: `${assetIcon} Crude Oil`, color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' },
          { symbol: 'ZB', label: `${assetIcon} T-Bonds`, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50' },
          { symbol: 'YM', label: `${assetIcon} E-Mini Dow`, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50' },
        ];
      default:
        return [];
    }
  };

  // Risk/Reward Berechnung
  const calculateRR = () => {
    if (!entryPrice || !stopLoss || !takeProfit) return null;
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);
    return risk > 0 ? (reward / risk).toFixed(2) : null;
  };

  // P&L Berechnung
  const calculatePL = () => {
    if (!entryPrice || !exitPrice || !quantity) return null;
    const priceDiff = direction === TradeDirection.LONG 
      ? exitPrice - entryPrice
      : entryPrice - exitPrice;
    return (priceDiff * quantity - fees).toFixed(2);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    console.log('📸 Starting upload for', fileArray.length, 'file(s)');
    
    try {
      const urls = await Promise.all(
        fileArray.map(async (file) => {
          console.log('📤 Uploading file:', file.name, 'Size:', file.size, 'bytes');
          const result = await uploadAPI.uploadScreenshot(file);
          console.log('✅ Upload result:', result);
          return result.url;
        })
      );
      
      console.log('🎉 All uploads complete, URLs:', urls);
      setScreenshots((prev) => {
        const newScreenshots = [...prev, ...urls];
        console.log('📷 Updated screenshots state:', newScreenshots);
        return newScreenshots;
      });
    } catch (error) {
      console.error('❌ Error uploading screenshots:', error);
    }
    
    // Reset file input
    e.target.value = '';
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(tag)) {
      setList(list.filter((t) => t !== tag));
    } else {
      setList([...list, tag]);
    }
  };

  const onFormSubmit = (data: TradeFormData) => {
    // Convert datetime-local to ISO format
    const entryDate = data.entryDate ? new Date(data.entryDate).toISOString() : new Date().toISOString();
    const exitDate = data.exitDate && data.exitDate.trim() !== '' ? new Date(data.exitDate).toISOString() : undefined;

    // Helper function to parse number or return undefined
    const parseNumber = (val: any): number | undefined => {
      if (val === '' || val === null || val === undefined) {
        return undefined;
      }
      const num = Number(val);
      if (isNaN(num)) {
        return undefined;
      }
      return num;
    };

    const entryPrice = parseNumber(data.entryPrice);
    const quantity = parseNumber(data.quantity);

    if (!entryPrice || entryPrice <= 0) {
      console.error('Invalid entry price:', data.entryPrice);
      return;
    }

    if (!quantity || quantity <= 0) {
      console.error('Invalid quantity:', data.quantity);
      return;
    }

    const submitData = {
      symbol: data.symbol,
      type: data.type,
      direction: data.direction,
      entryPrice,
      exitPrice: parseNumber(data.exitPrice),
      quantity,
      entryDate,
      exitDate,
      stopLoss: parseNumber(data.stopLoss),
      takeProfit: parseNumber(data.takeProfit),
      fees: parseNumber(data.fees) || 0,
      status: data.status,
      notes: data.notes || '',
      tags: data.tags?.split(',').map((t) => t.trim()).filter(Boolean) || [],
      emotions: selectedEmotions.join(','),
      mistakes: selectedMistakes.join(','),
      screenshots,
    };

    console.log('Submitting trade data:', submitData);

    if (isEditing) {
      updateMutation.mutate({ id: initialData.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const rrRatio = calculateRR();
  const estimatedPL = calculatePL();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/app/trades')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft size={20} />
            Zurück zu Trades
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Trade bearbeiten' : 'Neuer Trade'}
          </h1>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit(onFormSubmit)}
          className="space-y-8"
        >
          {/* Main Info Card */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp size={24} />
              Grundlegende Informationen
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Symbol *
                </label>
                <input {...register('symbol')} className="input" placeholder="Symbol eingeben oder unten auswählen..." />
                {errors.symbol && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.symbol.message}</p>}
                
                {/* Dynamic Symbol Suggestions based on Trade Type */}
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Beliebte {tradeType === 'crypto' ? 'Kryptowährungen' : tradeType === 'stock' ? 'Aktien' : tradeType === 'forex' ? 'Währungspaare' : tradeType === 'options' ? 'Optionen' : 'Futures'}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getSymbolSuggestions().map((item) => (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => setValue('symbol', item.symbol)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${item.color}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {assetTypes.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setValue('type', asset.id as TradeType)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        tradeType === asset.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">{asset.emoji}</div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{asset.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Richtung *
                </label>
                <select {...register('direction')} className="input">
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status *
                </label>
                <select {...register('status')} className="input">
                  <option value="open">Offen</option>
                  <option value="closed">Geschlossen</option>
                  <option value="cancelled">Abgebrochen</option>
                </select>
              </div>
            </div>
          </div>

          {/* Prices Card */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Calculator size={24} />
              Preise & Risikomanagement
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entry Preis * (€)
                </label>
                <input
                  {...register('entryPrice')}
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="100.00"
                />
                {errors.entryPrice && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.entryPrice.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exit Preis (€)
                </label>
                <input
                  {...register('exitPrice')}
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="110.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stop Loss (€)
                </label>
                <input
                  {...register('stopLoss')}
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="95.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Take Profit (€)
                </label>
                <input
                  {...register('takeProfit')}
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="120.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Menge *
                </label>
                <input
                  {...register('quantity')}
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="10"
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.quantity.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gebühren (€)
                </label>
                <input
                  {...register('fees')}
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Calculations */}
            {(rrRatio || estimatedPL) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-800 rounded-lg grid grid-cols-2 gap-4"
              >
                {rrRatio && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk/Reward Ratio</p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-accent-dark-400">1:{rrRatio}</p>
                  </div>
                )}
                {estimatedPL && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Geschätzter P&L</p>
                    <p className={`text-3xl font-bold ${parseFloat(estimatedPL) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {parseFloat(estimatedPL) >= 0 ? '+' : ''}{estimatedPL}€
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Dates Card */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Zeitraum</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entry Datum *
                </label>
                <input
                  {...register('entryDate')}
                  type="datetime-local"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exit Datum
                </label>
                <input
                  {...register('exitDate')}
                  type="datetime-local"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Psychology Card */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Psychologie & Learnings</h2>
            
            {/* Emotions */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Emotionen während des Trades
              </label>
              <div className="flex flex-wrap gap-2">
                {emotionTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag, selectedEmotions, setSelectedEmotions)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      selectedEmotions.includes(tag)
                        ? 'bg-primary-600 dark:bg-accent-dark-500 text-white dark:text-gray-900 shadow-md scale-105'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Mistakes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Fehler & Learnings
              </label>
              <div className="flex flex-wrap gap-2">
                {mistakeTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag, selectedMistakes, setSelectedMistakes)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      selectedMistakes.includes(tag)
                        ? 'bg-red-600 dark:bg-red-500 text-white shadow-md scale-105'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes & Tags Card */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notizen & Tags</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notizen
                </label>
                <textarea
                  {...register('notes')}
                  className="input min-h-[150px]"
                  placeholder="Setup, Marktbedingungen, Gedanken vor/während/nach dem Trade..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (kommagetrennt)
                </label>
                <input
                  {...register('tags')}
                  className="input"
                  placeholder="breakout, earnings, technisch"
                />
              </div>
            </div>
          </div>

          {/* Screenshots Card */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Screenshots</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="btn btn-secondary cursor-pointer flex items-center gap-2">
                  <Upload size={20} />
                  Bilder hochladen
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {screenshots.length} Bild(er) ausgewählt
                </span>
              </div>

              {screenshots.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {screenshots.map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <img
                        src={img}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          console.error('Failed to load image:', img);
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="128" viewBox="0 0 200 128"%3E%3Crect fill="%23374151" width="200" height="128"/%3E%3Ctext x="50%25" y="50%25" fill="%239CA3AF" font-family="sans-serif" font-size="14" text-anchor="middle" dominant-baseline="middle"%3EBild nicht verfügbar%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 sticky bottom-0 bg-gray-50 dark:bg-gray-900 py-4 -mx-4 px-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/app/trades')}
              className="btn btn-secondary flex-1"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn btn-primary flex-1"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Wird gespeichert...'
                : isEditing
                ? 'Aktualisieren'
                : 'Trade erstellen'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
