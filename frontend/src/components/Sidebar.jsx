import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Settings, LogOut, Zap,
  BookMarked, Target, Plus, X,
  ChevronUp, ChevronDown, User,
  Calendar, Timer, CheckSquare
} from 'lucide-react';
import { logout, getAuthUser } from '../utils/auth';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const user = getAuthUser() || {};
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookMarked, label: 'Nova Sessao', path: '/nova-sessao' },
    { icon: Target, label: 'Nova Meta', path: '/nova-meta' },
    { icon: Plus, label: 'Nova Materia', path: '/nova-materia' },
    { icon: Calendar, label: 'Calendario', path: '/calendario' },
    { icon: Timer, label: 'Pomodoro', path: '/pomodoro' },
    { icon: CheckSquare, label: 'Rotinas', path: '/rotina' }
  ];

  const isSettingsActive = location.pathname === '/configuracoes';

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-background border-r border-border flex flex-col z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 flex items-center gap-3 mb-2 relative">
          <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-text fill-white" strokeWidth={0} />
          </div>
          <div>
            <h1 className="font-bold text-text text-lg leading-none tracking-tight">StudyPlanner</h1>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 text-text-muted hover:text-text transition-colors md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => window.innerWidth < 768 && onClose()}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium ${
                  isActive
                    ? 'bg-blue-600 text-text shadow-lg shadow-blue-900/20'
                    : 'text-text-muted hover:bg-surface hover:text-text'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-text' : 'group-hover:text-text'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border bg-background relative">
          {showUserMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
              <div className="p-1.5 space-y-1">
                <Link
                  to="/configuracoes"
                  onClick={() => { setShowUserMenu(false); if (window.innerWidth < 768) onClose(); }}
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 w-full ${
                    isSettingsActive
                      ? 'bg-blue-600/10 text-blue-500'
                      : 'text-text-muted hover:bg-gray-800 hover:text-text'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-medium text-sm">Configuracoes</span>
                </Link>

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 p-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-sm font-medium cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sair da Conta
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all border cursor-pointer ${
              showUserMenu
                ? 'bg-surface border-border'
                : 'border-transparent hover:bg-surface hover:border-border'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-text font-bold border border-border shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
            </div>

            <div className="flex-1 overflow-hidden text-left">
              <p className="text-sm font-bold text-text truncate">{user.name || 'Usuario'}</p>
              <p className="text-xs text-text-muted truncate">{user.email || '...'}</p>
            </div>

            <div className="text-text-muted">
              {showUserMenu ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
