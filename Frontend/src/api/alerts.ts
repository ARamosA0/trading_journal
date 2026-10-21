import { api, getAccessToken } from './api';

export type AlertDirection = 'ABOVE' | 'BELOW';
export type AlertStatus = 'ACTIVE' | 'PAUSED' | 'TRIGGERED';

export type PriceAlert = {
  id: string;
  instrument: string;
  direction: AlertDirection;
  target: number;
  currentPrice: number | null;
  status: AlertStatus;
  triggeredAt: string | null;
};

export type PriceAlertInput = Pick<PriceAlert, 'instrument' | 'direction' | 'target'>;

export async function getAlerts() {
  const response = await api.get<PriceAlert[]>('/alerts');
  return response.data;
}

export async function createAlert(input: PriceAlertInput) {
  const response = await api.post<PriceAlert>('/alerts', input);
  return response.data;
}

export async function updateAlert(id: string, input: PriceAlertInput) {
  const response = await api.put<PriceAlert>(`/alerts/${id}`, input);
  return response.data;
}

export async function deleteAlert(id: string) {
  await api.delete(`/alerts/${id}`);
}

export async function streamAlerts(onAlert: (alert: PriceAlert) => void, signal: AbortSignal) {
  const token = getAccessToken();
  if (!token) return;

  const response = await fetch(`${import.meta.env.VITE_API_URL}/alerts/stream`, {
    headers: { Accept: 'text/event-stream', Authorization: `Bearer ${token}` },
    signal,
    credentials: 'include',
  });
  if (!response.ok || !response.body) throw new Error('Could not connect to alert stream');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (!signal.aborted) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';
    events.forEach((event) => {
      const eventName = event.match(/^event:\s*(.+)$/m)?.[1];
      const data = event.match(/^data:\s*(.+)$/m)?.[1];
      if (eventName === 'price-alert-triggered' && data) onAlert(JSON.parse(data) as PriceAlert);
    });
  }
}
