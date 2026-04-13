import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-all duration-200"
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-yellow-400 animate-scale-in" />
      ) : (
        <Moon className="w-5 h-5 text-dark-500 animate-scale-in" />
      )}
    </button>
  );
}
