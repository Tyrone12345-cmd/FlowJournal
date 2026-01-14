import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X } from 'lucide-react';
import Modal from './Modal';
import { TradeType, TradeDirection, TradeStatus } from '@/types';

const tradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol erforderlich'),
  type: z.nativeEnum(TradeType),
  direction: z.nativeEnum(TradeDirection),
  entryPrice: z.number().positive('Entry-Preis muss positiv sein'),
  exitPrice: z.number().positive().optional(),
  quantity: z.number().positive('Menge muss positiv sein'),
  entryDate: z.string(),
  exitDate: z.string().optional(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  fees: z.number().min(0).default(0),
  strategyId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  emotions: z.string().optional(),
  mistakes: z.string().optional(),
  status: z.nativeEnum(TradeStatus),
});

type TradeFormData = z.infer<typeof tradeSchema>;

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const emotionTags = ['Diszipliniert', 'Gierig', 'Ängstlich', 'FOMO', 'Revanche', 'Ruhig', 'Überfordert'];
const mistakeTags = ['Zu früh raus', 'Zu spät raus', 'Stop Loss nicht gesetzt', 'Overtrading', 'Gegen Plan', 'Position zu groß'];

export default function TradeModal({ isOpen, onClose, onSubmit, initialData }: TradeModalProps) {
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

  const entryPrice = watch('entryPrice');
  const exitPrice = watch('exitPrice');
  const stopLoss = watch('stopLoss');
  const takeProfit = watch('takeProfit');
  const quantity = watch('quantity');
  const fees = watch('fees') || 0;
  const direction = watch('direction');

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setScreenshots((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
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
    const submitData = {
      ...data,
      tags: data.tags?.split(',').map((t) => t.trim()).filter(Boolean),
      emotions: selectedEmotions.join(','),
      mistakes: selectedMistakes.join(','),
      screenshots,
    };
    onSubmit(submitData);
    onClose();
  };

  const rrRatio = calculateRR();
  const estimatedPL = calculatePL();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Trade bearbeiten' : 'Neuer Trade'} size="xl">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Symbol *</label>
            <input {...register('symbol')} className="input" placeholder="AAPL" />
            {errors.symbol && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.symbol.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
            <select {...register('type')} className="input">
              <option value="stock">Stock</option>
              <option value="forex">Forex</option>
              <option value="crypto">Crypto</option>
              <option value="options">Options</option>
              <option value="futures">Futures</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Richtung *</label>
            <select {...register('direction')} className="input">
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
            <select {...register('status')} className="input">
              <option value="open">Offen</option>
              <option value="closed">Geschlossen</option>
              <option value="cancelled">Abgebrochen</option>
            </select>
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entry Preis * (€)</label>
            <input
              {...register('entryPrice', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="input"
              placeholder="100.00"
            />
            {errors.entryPrice && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.entryPrice.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exit Preis (€)</label>
            <input
              {...register('exitPrice', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="input"
              placeholder="110.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stop Loss (€)</label>
            <input
              {...register('stopLoss', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="input"
              placeholder="95.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Take Profit (€)</label>
            <input
              {...register('takeProfit', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="input"
              placeholder="120.00"
            />
          </div>
        </div>

        {/* Quantity & Fees */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Menge *</label>
            <input
              {...register('quantity', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="input"
              placeholder="10"
            />
            {errors.quantity && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.quantity.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gebühren (€)</label>
            <input
              {...register('fees', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="input"
              placeholder="2.50"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entry Datum *</label>
            <input
              {...register('entryDate')}
              type="datetime-local"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exit Datum</label>
            <input
              {...register('exitDate')}
              type="datetime-local"
              className="input"
            />
          </div>
        </div>

        {/* Calculations */}
        {(rrRatio || estimatedPL) && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg grid grid-cols-2 gap-4">
            {rrRatio && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Risk/Reward Ratio</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-accent-dark-400">1:{rrRatio}</p>
              </div>
            )}
            {estimatedPL && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Geschätzter P&L</p>
                <p className={`text-2xl font-bold ${parseFloat(estimatedPL) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {parseFloat(estimatedPL) >= 0 ? '+' : ''}{estimatedPL}€
                </p>
              </div>
            )}
          </div>
        )}

        {/* Emotions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Emotionen</label>
          <div className="flex flex-wrap gap-2">
            {emotionTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag, selectedEmotions, setSelectedEmotions)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedEmotions.includes(tag)
                    ? 'bg-primary-600 dark:bg-accent-dark-500 text-white dark:text-gray-900'
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fehler / Learnings</label>
          <div className="flex flex-wrap gap-2">
            {mistakeTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag, selectedMistakes, setSelectedMistakes)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedMistakes.includes(tag)
                    ? 'bg-red-600 dark:bg-red-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notizen</label>
          <textarea
            {...register('notes')}
            className="input min-h-[100px]"
            placeholder="Setup, Marktbedingungen, Gedanken vor/während/nach dem Trade..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (kommagetrennt)</label>
          <input
            {...register('tags')}
            className="input"
            placeholder="breakout, earnings, technisch"
          />
        </div>

        {/* Screenshots */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Screenshots</label>
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
              <span className="text-sm text-gray-500 dark:text-gray-400">{screenshots.length} Bild(er)</span>
            </div>

            {screenshots.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {screenshots.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
            Abbrechen
          </button>
          <button type="submit" className="btn btn-primary flex-1">
            {initialData ? 'Aktualisieren' : 'Erstellen'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
