import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../shared/ThemeToggle';
import { getInitials } from '../../utils/helpers';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-dark-800">
      {/* Left: Menu button (mobile) */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 lg:hidden transition-colors"
      >
        <Menu className="w-5 h-5 text-dark-600 dark:text-dark-300" />
      </button>

      <div className="hidden lg:block" />

      {/* Right: Theme toggle + Profile */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-dark-700 dark:text-dark-200">{user?.name}</p>
              <p className="text-xs text-dark-400">{user?.role}</p>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-800 rounded-xl shadow-soft-lg border border-gray-100 dark:border-dark-700 animate-slide-down py-2">
              <button
                onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-dark-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                <User className="w-4 h-4" /> Profile Settings
              </button>
              <hr className="my-1 border-gray-100 dark:border-dark-700" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
