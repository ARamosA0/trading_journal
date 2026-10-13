import { createContext } from 'react';
import type { ReactNode } from 'react';

export type HeaderType = {
  title: string;
  subtitle: string;
  action?: ReactNode;
  action2?: ReactNode;
};

// This file intentionally exports the context used by the journal shell.
// eslint-disable-next-line react-refresh/only-export-components
export const HeaderContext = createContext<{
  header: HeaderType;
  setHeader: (h: HeaderType) => void;
}>({
  header: { title: '', subtitle: '', action: null, action2: null},
  setHeader: () => {},
});

export default HeaderContext;
