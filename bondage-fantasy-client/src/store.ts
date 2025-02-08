import {
  Account,
  AppConfig,
  Character,
  Scene,
  ZoneVision,
} from "bondage-fantasy-common";
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
  scene?: Scene;
  config?: AppConfig;
  invalidImageKeys: string[];
  initialize: (params: {
    navigate: NavigateFunction;
    config?: AppConfig;
  }) => void;
  updateSessionData: (sessionData: SessionData) => void;
  addInvalidImageKey: (imageKey: string) => void;
}

export const useAppStore = create<Store>()((set) => ({
  sessionInitialized: false,
  sessionInitializedPromise: new Promise((resolve) => {
    resolveSessionInitializedPromise = resolve;
  }),
  invalidImageKeys: [],
  initialize: ({ navigate, config }) =>
    set((state) => ({
      ...state,
      navigate,
      config,
    })),
  updateSessionData: ({ account, character, zone, scene }) => {
    resolveSessionInitializedPromise?.();
    set((state) => ({
      ...state,
      sessionInitialized: true,
      account,
      character,
      zone,
      scene,
    }));
  },
  addInvalidImageKey: (imageKey: string) => {
    set((state) => ({
      ...state,
      invalidImageKeys: [...state.invalidImageKeys, imageKey],
    }));
  },
}));
