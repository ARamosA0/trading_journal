import { api } from './api';

export type AccountState = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type Account = {
  id: string;
  name: string;
  broker: string;
  balance: number;
  netBalance: number;
  currency: string;
  state: AccountState;
  trades: number;
  winRate: number;
};

export type AccountInput = {
  name: string;
  broker: string;
  balance: number;
  currency: string;
  state?: AccountState;
};

export const ACCOUNT_SELECTION_EVENT = 'account:selected';

export function getSelectedAccountId() {
  return window.localStorage.getItem('selected-account-id');
}

export function selectAccount(id: string) {
  window.localStorage.setItem('selected-account-id', id);
  window.dispatchEvent(new Event(ACCOUNT_SELECTION_EVENT));
}

export async function getAccounts() {
  const response = await api.get<Account[]>('/accounts');
  return response.data;
}

export async function createAccount(input: AccountInput) {
  const response = await api.post<Account>('/accounts', input);
  return response.data;
}

export async function updateAccount(id: string, input: AccountInput) {
  const response = await api.put<Account>(`/accounts/${id}`, input);
  return response.data;
}

export async function deleteAccount(id: string) {
  await api.delete(`/accounts/${id}`);
}
