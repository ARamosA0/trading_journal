import { useEffect, useState } from 'react';
import { closeTrade, type Trade } from '../../api/trades';

type CloseTradeDialogProps = {
  trade: Trade;
  onClosed: () => void | Promise<void>;
  onCancel: () => void;
};

export default function CloseTradeDialog({ trade, onClosed, onCancel }: CloseTradeDialogProps) {
  const [mode, setMode] = useState<'full' | 'partial'>('full');
  const [exitPrice, setExitPrice] = useState(String(trade.entryPrice));
  const [quantity, setQuantity] = useState(String(trade.quantity));
  const [pnl, setPnl] = useState('0');
  const [moveStopLoss, setMoveStopLoss] = useState(false);
  const [stopLoss, setStopLoss] = useState(trade.stopLoss == null ? '' : String(trade.stopLoss));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const handleModeChange = (nextMode: 'full' | 'partial') => {
    setMode(nextMode);
    if (nextMode === 'full') setQuantity(String(trade.quantity));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedExitPrice = Number(exitPrice);
    const parsedQuantity = Number(quantity);
    const parsedPnl = Number(pnl);
    const parsedStopLoss = Number(stopLoss);
    if (!Number.isFinite(parsedExitPrice) || parsedExitPrice < 0 || !Number.isFinite(parsedQuantity)
      || parsedQuantity <= 0 || parsedQuantity > trade.quantity || !Number.isFinite(parsedPnl)
      || (moveStopLoss && (!Number.isFinite(parsedStopLoss) || parsedStopLoss < 0))) {
      setError('Review the close price, quantity, P&L and stop loss values.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await closeTrade({ id: trade.id, exitPrice: parsedExitPrice, quantity: parsedQuantity, pnl: parsedPnl, moveStopLoss, ...(moveStopLoss ? { stopLoss: parsedStopLoss } : {}) });
      await onClosed();
    } catch {
      setError('Could not close the trade.');
    } finally {
      setIsSaving(false);
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="close-trade-title">
    <button type="button" aria-label="Close close trade dialog" onClick={onCancel} className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-[2px]" />
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg rounded-xl border border-[var(--border2)] bg-[var(--surface)] p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--red)]">Close position</p><h2 id="close-trade-title" className="mt-2 text-xl font-semibold text-[var(--text)]">{trade.symbol}</h2><p className="mt-1 text-sm text-[var(--text3)]">Record the execution without editing the trade plan.</p></div><button type="button" aria-label="Close dialog" onClick={onCancel} className="text-xl text-[var(--text3)] hover:text-[var(--text)]">×</button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <fieldset className="sm:col-span-2"><legend className="text-xs font-medium text-[var(--text2)]">Close amount</legend><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" aria-pressed={mode === 'full'} onClick={() => handleModeChange('full')} className={`rounded-lg border px-3 py-2 text-sm ${mode === 'full' ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]' : 'border-[var(--border2)] text-[var(--text2)]'}`}>Complete</button><button type="button" aria-pressed={mode === 'partial'} onClick={() => handleModeChange('partial')} className={`rounded-lg border px-3 py-2 text-sm ${mode === 'partial' ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]' : 'border-[var(--border2)] text-[var(--text2)]'}`}>Partial</button></div></fieldset>
        <label className="text-xs font-medium text-[var(--text2)]">Exit price<input required type="number" min="0" step="any" value={exitPrice} onChange={(event) => setExitPrice(event.target.value)} className="journal-number mt-2" /></label>
        <label className="text-xs font-medium text-[var(--text2)]">Quantity to close<input required type="number" min="0" max={trade.quantity} step="any" value={quantity} onChange={(event) => setQuantity(event.target.value)} disabled={mode === 'full'} className="journal-number mt-2 disabled:opacity-60" /><span className="mt-1 block text-[11px] font-normal text-[var(--text3)]">Remaining: {mode === 'partial' ? Math.max(0, trade.quantity - Number(quantity || 0)) : 0}</span></label>
        <label className="text-xs font-medium text-[var(--text2)] sm:col-span-2">Realized P&amp;L<input required type="number" step="any" value={pnl} onChange={(event) => setPnl(event.target.value)} className="journal-number mt-2" /></label>
        <label className="flex items-center gap-3 text-sm text-[var(--text2)] sm:col-span-2"><input type="checkbox" checked={moveStopLoss} onChange={(event) => setMoveStopLoss(event.target.checked)} className="h-4 w-4 accent-[var(--accent)]" /> Move stop loss after this execution</label>
        {moveStopLoss && <label className="text-xs font-medium text-[var(--text2)] sm:col-span-2">New stop loss<input required type="number" min="0" step="any" value={stopLoss} onChange={(event) => setStopLoss(event.target.value)} className="journal-number mt-2" /></label>}
      </div>
      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">{error && <p role="alert" className="mr-auto self-center text-xs text-[var(--red)]">{error}</p>}<button type="button" onClick={onCancel} className="rounded-lg border border-[var(--border2)] px-4 py-2.5 text-sm text-[var(--text2)]">Cancel</button><button type="submit" disabled={isSaving} className="rounded-lg bg-[var(--red)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{isSaving ? 'Saving…' : mode === 'partial' ? 'Record partial close' : 'Close trade'}</button></div>
    </form>
  </div>;
}
