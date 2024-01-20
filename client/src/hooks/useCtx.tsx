import { Ctx } from 'components/Ctx';
import { useContext } from 'react';

export const useCtx = () => {
  const ctx = useContext(Ctx);
  return ctx;
};
