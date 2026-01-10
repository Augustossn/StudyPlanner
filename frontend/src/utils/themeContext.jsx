/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 1. Tenta pegar do LocalStorage. Se não tiver, assume 'system'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove classes antigas para evitar conflito
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      // Verifica a preferência atual do sistema
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const applySystemTheme = () => {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        // Remove a oposta e adiciona a correta
        root.classList.remove('light', 'dark');
        root.classList.add(systemTheme);
      };

      // Aplica imediatamente
      applySystemTheme();

      // Adiciona um "ouvinte": Se o usuário mudar o tema do Windows/Mac com o site aberto, o site muda junto
      mediaQuery.addEventListener('change', applySystemTheme);

      // Limpeza ao desmontar
      return () => mediaQuery.removeEventListener('change', applySystemTheme);
    } else {
      // Se não for 'system', aplica o tema escolhido (light ou dark)
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);