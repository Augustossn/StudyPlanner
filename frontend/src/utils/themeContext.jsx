/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Lê do localStorage ou usa 'system' como padrão
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove a classe antiga para garantir
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      // Verifica a preferência do sistema operacional
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      return;
    }

    // Se não for sistema, aplica o tema escolhido
    root.classList.add(theme);
    
    // Salva no storage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);