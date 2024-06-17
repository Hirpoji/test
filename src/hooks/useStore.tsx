import { useContext } from 'react';
import { StoreContext } from '../main';

export default function useStore() {
  return useContext(StoreContext);
}
