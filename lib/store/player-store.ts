import { create } from 'zustand';

interface PlayerState {
  isWideScreen: boolean;
  isWebFullscreen: boolean;
  setIsWideScreen: (value: boolean) => void;
  setIsWebFullscreen: (value: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isWideScreen: false,
  isWebFullscreen: false,
  setIsWideScreen: (value) => set({ isWideScreen: value }),
  setIsWebFullscreen: (value) => set({ isWebFullscreen: value }),
}));
