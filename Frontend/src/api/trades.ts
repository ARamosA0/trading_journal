import { api } from './api';

export type TradeDirection = 'LONG' | 'SHORT';
export type TradeStatus = 'OPEN' | 'CLOSE' | 'BREAKE_EVEN' | 'STOP_PROFIT';
export type TradeImportResponse = {
  accountId: string;
  provider: 'SIMPLEFX' | 'BITGET';
  importedCount: number;
  skipped: boolean;
  importedAt: string;
};

export type Trade = {
  id: string;
  accountId: string;
  accountName: string;
  symbol: string;
  market: string;
  direction: TradeDirection;
  entryPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  exitPrice: number | null;
  quantity: number;
  pnl: number;
  commission: number | null;
  swap: number | null;
  openAt: string;
  closeAt: string | null;
  status: TradeStatus;
  notes: string;
};

export type CreateTradeInput = {
  accountId?: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
};

export type UpdateTradeInput = Pick<CreateTradeInput, 'symbol' | 'direction' | 'entryPrice' | 'quantity'> & {
  stopLoss?: number;
  takeProfit?: number;
};

export async function getTrades(accountId: string) {
  const response = await api.get<Trade[]>('/trades', { params: { accountId } });
  return response.data;
}

export async function getOpenTrades(accountId: string) {
  const response = await api.get<Trade[]>('/trades/open', { params: { accountId } });
  return response.data;
}

export async function importTrades(accountId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<TradeImportResponse>(
    `/accounts/${accountId}/trade-imports`,
    formData,
  );
  return response.data;
}

export async function createTrade(input: CreateTradeInput) {
  const response = await api.post<Trade>('/trades', input);
  return response.data;
}

export async function updateTrade(id: string, input: UpdateTradeInput) {
  const response = await api.put<Trade>(`/trades/${id}`, input);
  return response.data;
}

export async function closeTrade(input: { id: string; exitPrice: number; quantity: number; pnl: number; moveStopLoss: boolean; stopLoss?: number }) {
  const { id, ...payload } = input;
  const response = await api.patch<Trade>(`/trades/${id}/close`, payload);
  return response.data;
}

export async function deleteTrade(id: string) {
  await api.delete(`/trades/${id}`);
}
