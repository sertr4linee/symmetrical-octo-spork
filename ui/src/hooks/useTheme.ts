import { useEffect } from 'react';
import { useAppStore } from '@/store/app';

export const useTheme = () => {
  const { preferences, updatePreferences } = useAppStore();

  useEffect(() => {
    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
      const root = document.documentElement;
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
        root.style.colorScheme = systemTheme;
        console.log('Applied system theme:', systemTheme);
      } else {
        root.classList.add(theme);
        root.style.colorScheme = theme;
        console.log('Applied theme:', theme);
      }
    };

    // Apply theme immediately
    console.log('Initializing theme:', preferences.theme);
    applyTheme(preferences.theme);

    // Listen for system theme changes if using system theme
    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [preferences.theme]);

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    updatePreferences({ theme });
  };

  return { theme: preferences.theme, setTheme };
};