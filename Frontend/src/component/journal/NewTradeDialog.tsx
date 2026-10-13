import { useEffect, useState } from 'react';

type TradeForm = {
  asset: string;
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
};

const emptyTrade: TradeForm = {
  asset: '',
  entryPrice: '',
  stopLoss: '',
  takeProfit: '',
  quantity: '',
};

export default function NewTradeDialog({ assetOptions = [], onAssetSearch }: NewTradeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<TradeForm>(emptyTrade);

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // The journal API is not connected yet; keep the captured form ready for that integration.
    closeDialog();
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
          <form onSubmit={handleSubmit} className="relative w-full max-w-xl rounded-xl border border-[var(--border2)] bg-[var(--surface)] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Trade ticket</p>
                <h2 id="new-trade-title" className="mt-2 text-xl font-semibold text-[var(--text)]">New trade</h2>
                <p className="mt-1 text-sm text-[var(--text3)]">Set the plan before recording the position.</p>
              </div>
              <button type="button" aria-label="Close dialog" onClick={closeDialog} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border2)] text-lg leading-none text-[var(--text3)] transition hover:border-[var(--accent)] hover:text-[var(--text)]">×</button>
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
                Precio de apertura
                <input required type="number" min="0" step="any" value={form.entryPrice} onChange={(event) => updateField('entryPrice', event.target.value)} placeholder="0.00" className="journal-number mt-2" />
              </label>
              <label className="text-xs font-medium text-[var(--text2)]">
                Cantidad
                <input required type="number" min="0" step="any" value={form.quantity} onChange={(event) => updateField('quantity', event.target.value)} placeholder="0.00" className="journal-number mt-2" />
              </label>
              <label className="text-xs font-medium text-[var(--text2)]">
                Stop Loss
                <input type="number" min="0" step="any" value={form.stopLoss} onChange={(event) => updateField('stopLoss', event.target.value)} placeholder="Opcional" className="journal-number mt-2" />
              </label>
              <label className="text-xs font-medium text-[var(--text2)]">
                Take Profit
                <input type="number" min="0" step="any" value={form.takeProfit} onChange={(event) => updateField('takeProfit', event.target.value)} placeholder="Opcional" className="journal-number mt-2" />
              </label>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeDialog} className="rounded-lg border border-[var(--border2)] px-4 py-2.5 text-sm font-medium text-[var(--text2)] hover:text-[var(--text)]">Cancel</button>
              <button type="submit" className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#061016] hover:bg-cyan-300">Save trade</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
