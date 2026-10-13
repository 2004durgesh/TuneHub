import { create } from 'zustand';

export type OtaStatus = 'idle' | 'downloading' | 'ready';

type OtaStore = {
  status: OtaStatus;
  percent: number | null;
  setDownloading: () => void;
  setPercent: (percent: number) => void;
  setReady: () => void;
  reset: () => void;
};

export const useOtaStore = create<OtaStore>((set) => ({
  status: 'idle',
  percent: null,
  setDownloading: () => set({ status: 'downloading', percent: null }),
  setPercent: (percent) => set({ percent }),
  setReady: () => set({ status: 'ready', percent: 100 }),
  reset: () => set({ status: 'idle', percent: null }),
}));
