import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  GraduationCap,
  BookMarked,
  Target,
  Plus
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Tenta recuperar o usuário salvo no localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Aqui você define os itens do menu
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    // Deixei o link de configurações pronto para quando criarmos a página
    { icon: BookMarked, label: 'Nova Sessão', path: ''},
    { icon: Target, label: 'Nova Meta', path: ''},
    { icon: Plus, label: 'Nova Matéria', path: ''},
    
  ];

  const isSettingsActive = location.pathname === '/settings';

  return (
    <aside className="w-64 h-screen bg-[#1a1a1a] border-r border-gray-800 flex flex-col fixed left-0 top-0 z-50">
      
      {/* Logo e Marca */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-800">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-none">StudyPlanner</h1>
          <span className="text-xs text-orange-500 font-medium">Pro</span>
        </div>
      </div>

      {/* Menu de Navegação Principal */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Área do Usuário e Rodapé */}
      <div className="p-4 border-t border-gray-800 bg-[#151515]">
        <div className="flex items-center gap-3 mb-6"> {/* Aumentei a margem inferior aqui (mb-6) */}
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold border-2 border-[#1a1a1a]">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user.name || 'Usuário'}</p>
            <p className="text-xs text-gray-500 truncate" title={user.email}>{user.email || 'email@exemplo.com'}</p>
          </div>
        </div>

        {/* 2. ADICIONADO "Configurações" AQUI */}
        <Link
            to="/settings"
            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 mb-2 ${
            isSettingsActive 
                ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
        >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;