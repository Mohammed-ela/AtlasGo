import { create } from 'zustand';
import { Appearance } from 'react-native';
import { ThemeState } from '@/types';

interface ThemeStore extends ThemeState {
  // Actions
  toggleTheme: () => void;
  setSystemTheme: (theme: 'light' | 'dark' | 'auto') => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  // État initial
  isDark: false,
  systemTheme: 'auto',

  // Actions
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),

  setSystemTheme: (theme) => {
    set({ systemTheme: theme });
    
    if (theme === 'auto') {
      const colorScheme = Appearance.getColorScheme();
      set({ isDark: colorScheme === 'dark' });
    } else {
      set({ isDark: theme === 'dark' });
    }
  },

  initializeTheme: () => {
    const { systemTheme } = get();
    
    if (systemTheme === 'auto') {
      const colorScheme = Appearance.getColorScheme();
      set({ isDark: colorScheme === 'dark' });
      
      // Écouter les changements de thème système
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        set({ isDark: colorScheme === 'dark' });
      });
      
      return subscription;
    } else {
      set({ isDark: systemTheme === 'dark' });
    }
  },
}));
