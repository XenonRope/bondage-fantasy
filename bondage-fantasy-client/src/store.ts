import { Account, Character, ZoneVision } from "bondage-fantasy-common";
import { SessionData } from "react-router";
import { create } from "zustand";

let resolveSessionInitializedPromise: (() => void) | undefined = undefined;

export interface Store {
  sessionInitialized: boolean;
  sessionInitializedPromise: Promise<void>;
  account?: Account;
  character?: Character;
  zone?: ZoneVision;
  updateSessionData: (sessionData: SessionData) => void;
  selectCharacters: (params: {
    character: Character;
    zone?: ZoneVision;
  }) => void;
  setZone: (zone?: ZoneVision) => void;
}

export const useAppStore = create<Store>()((set) => ({
  sessionInitialized: false,
  sessionInitializedPromise: new Promise((resolve) => {
    resolveSessionInitializedPromise = resolve;
  }),
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
  selectCharacters: ({ character, zone }) =>
    set((state) => ({
      ...state,
      character,
      zone,
    })),
  setZone: (zone) => set((state) => ({ ...state, zone })),
}));
