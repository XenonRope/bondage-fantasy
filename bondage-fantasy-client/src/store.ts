import { Account } from "bondage-fantasy-common";
import { create } from "zustand";

export interface Store {
  sessionRestoreCompleted: boolean;
  account?: Account;
  completeSessionRestore: () => void;
  setAccount: (account: Account) => void;
}

export const useAppStore = create<Store>()((set) => ({
  sessionRestoreCompleted: false,
  completeSessionRestore: () =>
    set((state) => ({ ...state, sessionRestoreCompleted: true })),
  setAccount: (account) => set((state) => ({ ...state, account })),
}));
