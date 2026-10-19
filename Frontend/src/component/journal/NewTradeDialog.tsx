import { useEffect, useState } from 'react';
import { createTrade } from '../../api/trades';
import { getSelectedAccountId } from '../../api/accounts';

type TradeForm = {
  asset: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  quantity: string;
};

export type AssetOption = {
  symbol: string;
  name?: string;
  price?: string;
};

type NewTradeDialogProps = {
  assetOptions?: AssetOption[];
  onAssetSearch?: (query: string) => void;
  onCreated?: () => void | Promise<void>;
};

const priceStep = '0.00001';

function normalizePrice(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(5) : value;
}

const emptyTrade: TradeForm = {
  asset: '',
  direction: 'LONG',
  entryPrice: '',
  stopLoss: '',
  takeProfit: '',
  quantity: '',
};

export default function NewTradeDialog({ assetOptions = [], onAssetSearch, onCreated }: NewTradeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<TradeForm>(emptyTrade);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setForm(emptyTrade);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const updateField = (field: keyof TradeForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const closeDialog = () => {
    setIsOpen(false);
    setForm(emptyTrade);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      await createTrade({
        accountId: getSelectedAccountId() ?? undefined,
        symbol: form.asset,
        direction: form.direction,
        entryPrice: Number(form.entryPrice),
        quantity: Number(form.quantity),
        ...(form.stopLoss ? { stopLoss: Number(form.stopLoss) } : {}),
        ...(form.takeProfit ? { takeProfit: Number(form.takeProfit) } : {}),
      });
      await onCreated?.();
      closeDialog();
    } catch {
      setError('Could not save the trade. Check the values and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssetChange = (value: string) => {
    const selectedAsset = assetOptions.find((asset) => asset.symbol === value);
    setForm((current) => ({
      ...current,
      asset: value,
      entryPrice: selectedAsset?.price ?? current.entryPrice,
    }));
    onAssetSearch?.(value);
  };

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>New trade</button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="new-trade-title">
          <button type="button" aria-label="Close new trade dialog" onClick={closeDialog} className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-[2px]" />
          <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-xl rounded-xl border border-[var(--border2)] bg-[var(--surface)] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Trade ticket</p>
                <h2 id="new-trade-title" className="mt-2 text-xl font-semibold text-[var(--text)]">New trade</h2>
                <p className="mt-1 text-sm text-[var(--text3)]">Set the plan before recording the position.</p>
              </div>
              <button type="button" aria-label="Close dialog" onClick={closeDialog} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border2)] bg-[var(--bg3)] text-xl leading-none text-[var(--text2)] outline-none transition hover:border-[var(--accent)] hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]">×</button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-medium text-[var(--text2)] sm:col-span-2">
                Activo
                <input
                  autoFocus
                  required
                  list="new-trade-assets"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-controls="new-trade-assets"
                  value={form.asset}
                  onChange={(event) => handleAssetChange(event.target.value)}
                  placeholder="Search BTC/USDT, EUR/USD..."
                  className="mt-2"
                />
                <datalist id="new-trade-assets">
                  {assetOptions.map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.name}</option>)}
                </datalist>
                <span className="mt-2 block text-[11px] font-normal text-[var(--text3)]">Search suggestions and live pricing will be connected here.</span>
              </label>
              <label className="text-xs font-medium text-[var(--text2)]">
                Dirección
                <select value={form.direction} onChange={(event) => updateField('direction', event.target.value as TradeForm['direction'])} className="mt-2">
                  <option value="LONG">Long</option>
                  <option value="SHORT">Short</option>
                </select>
              </label>
              <label className="text-xs font-medium text-[var(--text2)]">
                Precio de apertura
                <input required type="number" min="0" step={priceStep} value={form.entryPrice} onChange={(event) => updateField('entryPrice', event.target.value)} onBlur={() => updateField('entryPrice', normalizePrice(form.entryPrice))} placeholder="0.00000" className="journal-number mt-2" />
              </label>
              <label className="text-xs font-medium text-[var(--text2)]">
                Cantidad
                <input required type="number" min="0" step="any" value={form.quantity} onChange={(event) => updateField('quantity', event.target.value)} placeholder="0.00" className="journal-number mt-2" />
              </label>
              <label className="text-xs font-medium text-[var(--text2)]">
                Stop Loss
                <input type="number" min="0" step={priceStep} value={form.stopLoss} onChange={(event) => updateField('stopLoss', event.target.value)} onBlur={() => updateField('stopLoss', normalizePrice(form.stopLoss))} placeholder="Opcional" className="journal-number mt-2" />
              </label>
              <label className="text-xs font-medium text-[var(--text2)]">
                Take Profit
                <input type="number" min="0" step={priceStep} value={form.takeProfit} onChange={(event) => updateField('takeProfit', event.target.value)} onBlur={() => updateField('takeProfit', normalizePrice(form.takeProfit))} placeholder="Opcional" className="journal-number mt-2" />
              </label>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
              {error && <p className="mr-auto self-center text-xs text-[var(--red)]" role="alert">{error}</p>}
              <button type="button" onClick={closeDialog} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border2)] !bg-[var(--bg3)] px-5 py-2.5 text-sm font-semibold text-[var(--text2)] outline-none transition hover:border-[var(--text3)] hover:!bg-[var(--surface2)] hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]">Cancel</button>
              <button type="submit" disabled={isSaving} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--accent)] !bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[#061016] outline-none transition hover:border-cyan-300 hover:!bg-cyan-300 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:cursor-wait disabled:border-[var(--border2)] disabled:!bg-[var(--border2)] disabled:text-[var(--text3)]">{isSaving ? 'Saving…' : 'Save trade'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
