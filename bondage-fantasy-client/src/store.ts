import { Account, Character, ZoneVision } from "bondage-fantasy-common";
import { NavigateFunction, SessionData } from "react-router";
import { create } from "zustand";

let resolveSessionInitializedPromise: (() => void) | undefined = undefined;

export interface Store {
  navigate?: NavigateFunction;
  sessionInitialized: boolean;
  sessionInitializedPromise: Promise<void>;
  account?: Account;
  character?: Character;
  zone?: ZoneVision;
  initialize: (params: { navigate: NavigateFunction }) => void;
  updateSessionData: (sessionData: SessionData) => void;
}

export const useAppStore = create<Store>()((set) => ({
  sessionInitialized: false,
  sessionInitializedPromise: new Promise((resolve) => {
    resolveSessionInitializedPromise = resolve;
  }),
  initialize: ({ navigate }) =>
    set((state) => ({
      ...state,
      navigate,
    })),
  updateSessionData: ({ account, character, zone }) => {
    resolveSessionInitializedPromise?.();
    set((state) => ({
      ...state,
      sessionInitialized: true,
      account,
      character,
      zone,
    }));
  },
}));
