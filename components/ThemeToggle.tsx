import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-yellow-400 shadow-lg border border-gray-100 dark:border-gray-700 hover:scale-110 transition-all duration-300"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'light' ? (
        <Moon size={20} className="fill-current text-indigo-900" />
      ) : (
        <Sun size={20} className="fill-current" />
      )}
    </button>
  );
};
