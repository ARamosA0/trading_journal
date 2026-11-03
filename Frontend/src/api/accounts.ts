import { api } from './api';

export type AccountState = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type AccountProvider = 'SIMPLEFX' | 'BITGET';

export type Account = {
  id: string;
  name: string;
  broker: string | null;
  provider: AccountProvider | null;
  balance: number;
  netBalance: number;
  currency: string;
  state: AccountState;
  trades: number;
  winRate: number;
};

type AccountFields = {
  name: string;
  broker?: string;
  balance: number;
  currency: string;
  state?: AccountState;
};

export type CreateAccountInput = AccountFields & { provider: AccountProvider };
export type UpdateAccountInput = AccountFields & { provider?: AccountProvider };

export const ACCOUNT_SELECTION_EVENT = 'account:selected';

export function getSelectedAccountId() {
  return window.localStorage.getItem('selected-account-id');
}

export function selectAccount(id: string) {
  window.localStorage.setItem('selected-account-id', id);
  window.dispatchEvent(new Event(ACCOUNT_SELECTION_EVENT));
}

export function resolveSelectedAccountId(accounts: Account[]) {
  const selectedId = getSelectedAccountId();
  if (accounts.some((account) => account.id === selectedId)) return selectedId;

  const fallbackId = accounts[0]?.id ?? null;
  if (fallbackId) selectAccount(fallbackId);
  else window.localStorage.removeItem('selected-account-id');
  return fallbackId;
}

export async function getAccounts() {
  const response = await api.get<Account[]>('/accounts');
  return response.data;
}

export async function createAccount(input: CreateAccountInput) {
  const response = await api.post<Account>('/accounts', input);
  return response.data;
}

export async function updateAccount(id: string, input: UpdateAccountInput) {
  const response = await api.put<Account>(`/accounts/${id}`, input);
  return response.data;
}

export async function deleteAccount(id: string) {
  await api.delete(`/accounts/${id}`);
}
