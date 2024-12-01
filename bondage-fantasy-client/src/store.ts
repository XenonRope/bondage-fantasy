import { Account, Character } from "bondage-fantasy-common";
import { create } from "zustand";

export interface Store {
  sessionRestoreCompleted: boolean;
  account?: Account;
  character?: Character;
  completeSessionRestore: () => void;
  setAccount: (account?: Account) => void;
  setCharacter: (character?: Character) => void;
}

export const useAppStore = create<Store>()((set) => ({
  sessionRestoreCompleted: false,
  completeSessionRestore: () =>
    set((state) => ({ ...state, sessionRestoreCompleted: true })),
  setAccount: (account) => set((state) => ({ ...state, account })),
  setCharacter: (character) => set((state) => ({ ...state, character })),
}));
