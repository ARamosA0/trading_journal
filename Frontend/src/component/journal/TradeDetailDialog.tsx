import { useEffect, useState } from 'react';
import { deleteTrade, updateTrade, type Trade } from '../../api/trades';

type TradeDetailDialogProps = {
  trade: Trade;
  onUpdated: () => void | Promise<void>;
  onDeleted: () => void | Promise<void>;
  onCancel: () => void;
};

const priceStep = '0.00001';

function priceValue(value: number | null) {
  return value == null ? '' : value.toFixed(5);
}

function normalizePrice(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(5) : value;
}

export default function TradeDetailDialog({ trade, onUpdated, onDeleted, onCancel }: TradeDetailDialogProps) {
  const [symbol, setSymbol] = useState(trade.symbol);
  const [direction, setDirection] = useState(trade.direction);
  const [entryPrice, setEntryPrice] = useState(priceValue(trade.entryPrice));
  const [quantity, setQuantity] = useState(String(trade.quantity));
  const [stopLoss, setStopLoss] = useState(priceValue(trade.stopLoss));
  const [takeProfit, setTakeProfit] = useState(priceValue(trade.takeProfit));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedEntry = Number(entryPrice);
    const parsedQuantity = Number(quantity);
    if (!symbol.trim() || !Number.isFinite(parsedEntry) || parsedEntry < 0 || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError('Symbol, entry price and quantity are required.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await updateTrade(trade.id, { symbol: symbol.trim(), direction, entryPrice: Number(normalizePrice(entryPrice)), quantity: parsedQuantity, ...(stopLoss ? { stopLoss: Number(normalizePrice(stopLoss)) } : {}), ...(takeProfit ? { takeProfit: Number(normalizePrice(takeProfit)) } : {}) });
      await onUpdated();
    } catch {
      setError('Could not update the trade.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await deleteTrade(trade.id);
      await onDeleted();
    } catch {
      setError('Could not delete the trade.');
      setIsDeleting(false);
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="trade-detail-title">
    <button type="button" aria-label="Close trade detail dialog" onClick={onCancel} className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-[2px]" />
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl rounded-xl border border-[var(--border2)] bg-[var(--surface)] p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Trade details</p><h2 id="trade-detail-title" className="mt-2 text-xl font-semibold text-[var(--text)]">{trade.symbol}</h2><p className="mt-1 text-sm text-[var(--text3)]">Edit the trade plan independently from closing it.</p></div><button type="button" aria-label="Close dialog" onClick={onCancel} className="text-xl text-[var(--text3)] hover:text-[var(--text)]">×</button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium text-[var(--text2)] sm:col-span-2">Symbol<input required value={symbol} onChange={(event) => setSymbol(event.target.value)} className="mt-2" /></label><label className="text-xs font-medium text-[var(--text2)]">Direction<select value={direction} onChange={(event) => setDirection(event.target.value as Trade['direction'])} className="mt-2"><option value="LONG">Long</option><option value="SHORT">Short</option></select></label><label className="text-xs font-medium text-[var(--text2)]">Entry price<input required type="number" min="0" step={priceStep} value={entryPrice} onChange={(event) => setEntryPrice(event.target.value)} onBlur={() => setEntryPrice(normalizePrice(entryPrice))} className="journal-number mt-2" /></label><label className="text-xs font-medium text-[var(--text2)]">Quantity<input required type="number" min="0" step={priceStep} value={quantity} onChange={(event) => setQuantity(event.target.value)} className="journal-number mt-2" /></label><label className="text-xs font-medium text-[var(--text2)]">Stop loss<input type="number" min="0" step={priceStep} value={stopLoss} onChange={(event) => setStopLoss(event.target.value)} onBlur={() => setStopLoss(normalizePrice(stopLoss))} className="journal-number mt-2" /></label><label className="text-xs font-medium text-[var(--text2)]">Take profit<input type="number" min="0" step={priceStep} value={takeProfit} onChange={(event) => setTakeProfit(event.target.value)} onBlur={() => setTakeProfit(normalizePrice(takeProfit))} className="journal-number mt-2" /></label></div>
      <div className="mt-7 flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center">{confirmDelete ? <><p className="text-xs text-[var(--red)] sm:mr-auto">Delete this trade permanently from your journal view?</p><button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg border border-[var(--border2)] px-4 py-2.5 text-sm text-[var(--text2)]">Cancel</button><button type="button" disabled={isDeleting} onClick={() => void handleDelete()} className="rounded-lg bg-[var(--red)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{isDeleting ? 'Deleting…' : 'Confirm delete'}</button></> : <><button type="button" onClick={() => setConfirmDelete(true)} className="mr-auto rounded-lg border border-[var(--red)] px-4 py-2.5 text-sm text-[var(--red)]">Delete</button><button type="button" onClick={onCancel} className="rounded-lg border border-[var(--border2)] px-4 py-2.5 text-sm text-[var(--text2)]">Cancel</button><button type="submit" disabled={isSaving} className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#061016] disabled:opacity-60">{isSaving ? 'Saving…' : 'Save changes'}</button></>}{error && <p role="alert" className="text-xs text-[var(--red)]">{error}</p>}</div>
    </form>
  </div>;
}
