import { useContext, useEffect, useState } from 'react';
import { HeaderContext } from '../../hook/HeaderContext';
import { createAlert, deleteAlert, getAlerts, streamAlerts, updateAlert, type AlertDirection, type PriceAlert } from '../../api/alerts';

const tools = [
  { code: '01', title: 'Price alerts', description: 'Watch key levels and get notified when price crosses them.' },
  { code: '02', title: 'Position calculator', description: 'Calculate stop loss, take profit and liquidation prices.' },
  { code: '03', title: 'Strategy backtester', description: 'Validate an edge against historical data before going live.' },
];

function formatPrice(value: number | null) {
  return value == null ? '—' : value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 });
}

function formatMoney(value: number | null) {
  return value == null ? '—' : `${value >= 0 ? '+' : '-'}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Tools() {
  const { setHeader } = useContext(HeaderContext);
  const [activeTool, setActiveTool] = useState('01');
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [alertForm, setAlertForm] = useState({ instrument: '', direction: 'ABOVE' as AlertDirection, target: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailAlert, setDetailAlert] = useState<PriceAlert | null>(null);
  const [isAlertFormOpen, setIsAlertFormOpen] = useState(false);
  const [error, setError] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [stopPrice, setStopPrice] = useState('');
  const [riskReward, setRiskReward] = useState('1.7');
  const [riskAmount, setRiskAmount] = useState('100');
  const [leverage, setLeverage] = useState('10');

  useEffect(() => { setHeader({ title: 'Tools', subtitle: 'Small utilities for better decisions, not more noise.' }); }, [setHeader]);

  useEffect(() => {
    let active = true;
    getAlerts().then((data) => { if (active) setAlerts(data); }).catch(() => { if (active) setError('Could not load price alerts.'); });
    const controller = new AbortController();
    streamAlerts((alert) => setAlerts((current) => current.map((item) => item.id === alert.id ? alert : item)), controller.signal)
      .catch(() => { if (active && !controller.signal.aborted) setError('Price alert stream disconnected.'); });
    return () => { active = false; controller.abort(); };
  }, []);

  function openCreate() {
    setEditingId(null);
    setAlertForm({ instrument: '', direction: 'ABOVE', target: '' });
    setIsAlertFormOpen(true);
  }

  function openEdit(alert: PriceAlert) {
    setEditingId(alert.id);
    setAlertForm({ instrument: alert.instrument, direction: alert.direction, target: String(alert.target) });
    setIsAlertFormOpen(true);
  }

  async function saveAlert(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      const input = { instrument: alertForm.instrument.trim().toUpperCase(), direction: alertForm.direction, target: Number(alertForm.target) };
      const saved = editingId ? await updateAlert(editingId, input) : await createAlert(input);
      setAlerts((current) => editingId ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
      setIsAlertFormOpen(false);
    } catch { setError('Could not save the price alert.'); }
  }

  async function removeAlert(id: string) {
    try { await deleteAlert(id); setAlerts((current) => current.filter((alert) => alert.id !== id)); } catch { setError('Could not delete the price alert.'); }
  }

  const entry = Number(entryPrice);
  const stop = Number(stopPrice);
  const ratio = Number(riskReward);
  const risk = Number(riskAmount);
  const selectedLeverage = Number(leverage);
  const stopDistance = Math.abs(entry - stop);
  const validStopSide = direction === 'LONG' ? stop < entry : stop > entry;
  const canCalculate = entry > 0 && stop > 0 && stopDistance > 0 && validStopSide && ratio > 0 && risk > 0 && selectedLeverage > 0;
  const stopLoss = canCalculate ? stop : null;
  const takeProfit = canCalculate ? direction === 'LONG' ? entry + (stopDistance * ratio) : entry - (stopDistance * ratio) : null;
  const liquidation = canCalculate ? direction === 'LONG' ? entry * (1 - (1 / selectedLeverage)) : entry * (1 + (1 / selectedLeverage)) : null;
  const quantity = canCalculate ? risk / stopDistance : null;
  const liquidationLoss = canCalculate && liquidation != null && quantity != null
    ? -Math.abs(entry - liquidation) * quantity
    : null;

  return <section className="space-y-8">
    {error && <p role="alert" className="rounded-lg border border-[var(--red)] bg-[var(--red-dim)] px-4 py-3 text-sm text-[var(--red)]">{error}</p>}
    <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-3" role="tablist" aria-label="Trading tools">{tools.map((tool) => <button key={tool.code} type="button" role="tab" aria-selected={activeTool === tool.code} onClick={() => setActiveTool(tool.code)} className={`group bg-[var(--surface)] p-5 text-left transition hover:bg-[var(--bg3)] ${activeTool === tool.code ? 'bg-[var(--bg3)] ring-1 ring-inset ring-[var(--accent)]' : ''}`}><span className="journal-number text-xs text-[var(--accent)]">{tool.code}</span><h2 className="mt-8 text-base font-semibold text-[var(--text)]">{tool.title}<span className="ml-2 text-[var(--text3)]">→</span></h2><p className="mt-2 text-sm leading-6 text-[var(--text3)]">{tool.description}</p></button>)}</div>

    {activeTool === '01' && <div><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-base font-semibold text-[var(--text)]">Price alerts</h2><p className="mt-1 text-xs text-[var(--text3)]">Updates arrive asynchronously when a quote reaches the target.</p></div><button type="button" onClick={openCreate} className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#061016]">Create alert</button></div><div className="journal-panel overflow-x-auto"><table className="journal-table min-w-[760px] w-full border-separate border-spacing-0 text-left text-sm"><caption className="sr-only">Price alerts</caption><thead className="bg-[var(--bg3)]"><tr><th>Instrument</th><th>Condition</th><th>Target</th><th>Current</th><th>Status</th><th>Actions</th></tr></thead><tbody>{alerts.length === 0 ? <tr><td colSpan={6} className="px-5 py-8 text-center text-[var(--text3)]">No price alerts yet.</td></tr> : alerts.map((alert) => <tr key={alert.id}><td className="font-semibold text-[var(--text)]">{alert.instrument}</td><td><span className={`rounded-md px-2 py-1 text-xs font-semibold ${alert.direction === 'ABOVE' ? 'bg-[var(--green-dim)] text-[var(--green)]' : 'bg-[var(--red-dim)] text-[var(--red)]'}`}>{alert.direction === 'ABOVE' ? 'Above' : 'Below'}</span></td><td className="journal-number">{formatPrice(alert.target)}</td><td className="journal-number">{formatPrice(alert.currentPrice)}</td><td><span className={`rounded-md px-2 py-1 text-xs font-semibold ${alert.status === 'TRIGGERED' ? 'bg-[var(--gold-dim)] text-[var(--gold)]' : 'bg-[var(--accent-dim)] text-[var(--accent)]'}`}>{alert.status}</span></td><td><div className="flex gap-2"><button type="button" onClick={() => setDetailAlert(alert)} className="rounded-md border border-[var(--border2)] px-2 py-1 text-xs text-[var(--text2)]">Details</button><button type="button" onClick={() => openEdit(alert)} className="rounded-md border border-[var(--accent)] px-2 py-1 text-xs text-[var(--accent)]">Edit</button><button type="button" onClick={() => void removeAlert(alert.id)} className="rounded-md border border-[var(--red)] px-2 py-1 text-xs text-[var(--red)]">Delete</button></div></td></tr>)}</tbody></table></div></div>}

    {activeTool === '02' && <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.8fr)]"><section className="journal-panel p-5 sm:p-6"><h2 className="text-base font-semibold text-[var(--text)]">Position calculator</h2><p className="mt-1 text-xs text-[var(--text3)]">Set an exact SL price and calculate TP using an R:R ratio.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs text-[var(--text2)]">Entry price<input type="number" min="0" step="0.00001" value={entryPrice} onChange={(event) => setEntryPrice(event.target.value)} className="journal-number mt-2" /></label><label className="text-xs text-[var(--text2)]">Direction<select value={direction} onChange={(event) => setDirection(event.target.value as 'LONG' | 'SHORT')} className="mt-2"><option value="LONG">Long</option><option value="SHORT">Short</option></select></label><label className="text-xs text-[var(--text2)]">Stop loss price<input type="number" min="0" step="0.00001" value={stopPrice} onChange={(event) => setStopPrice(event.target.value)} placeholder="Exact SL price" className="journal-number mt-2" /></label><label className="text-xs text-[var(--text2)]">Risk : reward<input type="number" min="0" step="0.1" value={riskReward} onChange={(event) => setRiskReward(event.target.value)} placeholder="1.7" className="journal-number mt-2" /></label><label className="text-xs text-[var(--text2)]">Amount at risk<input type="number" min="0" step="0.01" value={riskAmount} onChange={(event) => setRiskAmount(event.target.value)} placeholder="100.00" className="journal-number mt-2" /></label><label className="text-xs text-[var(--text2)]">Leverage<input type="number" min="1" step="1" value={leverage} onChange={(event) => setLeverage(event.target.value)} className="journal-number mt-2" /></label></div><p className="mt-5 text-xs text-[var(--text3)]">Quantity is estimated as risk amount ÷ entry-to-SL distance.</p></section><section className="journal-panel p-5 sm:p-6"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Calculated levels</p><div className="mt-6 space-y-4"><div className="flex justify-between border-b border-[var(--border)] pb-4"><span className="text-sm text-[var(--text2)]">Stop loss</span><div className="text-right"><strong className="journal-number block text-[var(--red)]">{formatPrice(stopLoss)}</strong><span className="journal-number text-xs text-[var(--red)]">{formatMoney(canCalculate ? -risk : null)}</span></div></div><div className="flex justify-between border-b border-[var(--border)] pb-4"><span className="text-sm text-[var(--text2)]">Take profit <span className="text-xs text-[var(--text3)]">(1:{ratio || '—'})</span></span><div className="text-right"><strong className="journal-number block text-[var(--green)]">{formatPrice(takeProfit)}</strong><span className="journal-number text-xs text-[var(--green)]">{formatMoney(canCalculate ? risk * ratio : null)}</span></div></div><div className="flex justify-between border-b border-[var(--border)] pb-4"><span className="text-sm text-[var(--text2)]">Liquidation</span><div className="text-right"><strong className="journal-number block text-[var(--gold)]">{formatPrice(liquidation)}</strong><span className="journal-number text-xs text-[var(--gold)]">{formatMoney(liquidationLoss)}</span></div></div><div className="flex justify-between"><span className="text-sm text-[var(--text2)]">Position quantity</span><strong className="journal-number text-[var(--text)]">{quantity == null ? '—' : quantity.toFixed(5)}</strong></div></div><p className="mt-8 text-xs leading-5 text-[var(--text3)]">Liquidation is an estimate based on entry and leverage. Fees, maintenance margin and exchange rules are not included.</p></section></div>}

    {activeTool === '03' && <div className="journal-panel p-6"><h2 className="text-base font-semibold text-[var(--text)]">Strategy backtester</h2><p className="mt-2 text-sm text-[var(--text3)]">This tool will be connected when historical market data is available.</p></div>}

    {isAlertFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="alert-dialog-title"><button type="button" aria-label="Close alert dialog" onClick={() => setIsAlertFormOpen(false)} className="absolute inset-0 bg-black/80" /><form onSubmit={saveAlert} className="relative z-10 w-full max-w-lg rounded-xl border border-[var(--border2)] bg-[var(--surface)] p-6 shadow-2xl"><div className="flex items-start justify-between border-b border-[var(--border)] pb-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Price alert</p><h2 id="alert-dialog-title" className="mt-2 text-xl font-semibold text-[var(--text)]">{editingId ? 'Edit alert' : 'Create alert'}</h2></div><button type="button" onClick={() => setIsAlertFormOpen(false)} className="text-xl text-[var(--text3)]">×</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs text-[var(--text2)] sm:col-span-2">Asset<input required value={alertForm.instrument} onChange={(event) => setAlertForm((current) => ({ ...current, instrument: event.target.value }))} placeholder="BTC/USDT" className="mt-2" /></label><label className="text-xs text-[var(--text2)]">Direction<select value={alertForm.direction} onChange={(event) => setAlertForm((current) => ({ ...current, direction: event.target.value as AlertDirection }))} className="mt-2"><option value="ABOVE">Above</option><option value="BELOW">Below</option></select></label><label className="text-xs text-[var(--text2)]">Target price<input required type="number" min="0" step="0.00001" value={alertForm.target} onChange={(event) => setAlertForm((current) => ({ ...current, target: event.target.value }))} className="journal-number mt-2" /></label></div><div className="mt-7 flex justify-end gap-3 border-t border-[var(--border)] pt-5"><button type="button" onClick={() => setIsAlertFormOpen(false)} className="rounded-lg border border-[var(--border2)] bg-[var(--bg3)] px-4 py-2.5 text-sm text-[var(--text2)]">Cancel</button><button type="submit" className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#061016]">{editingId ? 'Save changes' : 'Create alert'}</button></div></form></div>}

    {detailAlert && <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="alert-detail-title"><button type="button" aria-label="Close alert details" onClick={() => setDetailAlert(null)} className="absolute inset-0 bg-black/80" /><div className="relative z-10 w-full max-w-md rounded-xl border border-[var(--border2)] bg-[var(--surface)] p-6 shadow-2xl"><div className="flex justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Alert details</p><h2 id="alert-detail-title" className="mt-2 text-xl font-semibold text-[var(--text)]">{detailAlert.instrument}</h2></div><button type="button" onClick={() => setDetailAlert(null)} className="text-xl text-[var(--text3)]">×</button></div><dl className="mt-6 divide-y divide-[var(--border)] text-sm"><div className="flex justify-between py-3"><dt className="text-[var(--text3)]">Condition</dt><dd>{detailAlert.direction === 'ABOVE' ? 'Above' : 'Below'}</dd></div><div className="flex justify-between py-3"><dt className="text-[var(--text3)]">Target</dt><dd className="journal-number">{formatPrice(detailAlert.target)}</dd></div><div className="flex justify-between py-3"><dt className="text-[var(--text3)]">Current</dt><dd className="journal-number">{formatPrice(detailAlert.currentPrice)}</dd></div><div className="flex justify-between py-3"><dt className="text-[var(--text3)]">Status</dt><dd className="text-[var(--accent)]">{detailAlert.status}</dd></div></dl><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => { setDetailAlert(null); openEdit(detailAlert); }} className="rounded-lg border border-[var(--accent)] px-4 py-2.5 text-sm text-[var(--accent)]">Edit alert</button><button type="button" onClick={() => setDetailAlert(null)} className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#061016]">Close</button></div></div></div>}
  </section>;
}

export default Tools;
