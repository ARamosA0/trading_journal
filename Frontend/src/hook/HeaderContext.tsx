import { createContext } from 'react';

export type HeaderType = {
  title: string;
  subtitle: string;
  action?: any;
  action2?: any;
};

export const HeaderContext = createContext<{
  header: HeaderType;
  setHeader: (h: HeaderType) => void;
}>({
  header: { title: '', subtitle: '', action: null, action2: null},
  setHeader: () => {},
});

export default HeaderContext;
