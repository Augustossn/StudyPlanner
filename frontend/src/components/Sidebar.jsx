import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, LogOut, Zap, 
  BookMarked, Target, Plus, X 
} from 'lucide-react';
import { logout, getAuthUser } from '../utils/auth';

// Agora o Sidebar recebe 'isOpen' e 'onClose' do pai (Layout)
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const user = getAuthUser() || {};
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookMarked, label: 'Nova Sessão', path: '/nova-sessao' }, 
    { icon: Target, label: 'Nova Meta', path: '/nova-meta' }, 
    { icon: Plus, label: 'Nova Matéria', path: '/nova-materia' },
  ];

  const isSettingsActive = location.pathname === '/settings';

  return (
    <>
      {/* --- OVERLAY (Fundo Escuro - Apenas Mobile) --- */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          fixed top-0 left-0 h-screen w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        
        {/* Cabeçalho */}
        <div className="p-6 flex items-center gap-3 border-b border-gray-800 relative">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center border border-gray-800 shadow-sm">
            <Zap className="w-5 h-5 text-white fill-white" strokeWidth={0} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none tracking-tight">StudyPlanner</h1>
          </div>
          
          {/* Botão Fechar (X) - Aparece sempre que o menu estiver aberto */}
          <button 
            onClick={onClose} 
            className="absolute right-4 text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                // No mobile fecha ao clicar. No desktop, você decide (tirei o onClose aqui para desktop manter aberto se quiser)
                onClick={() => window.innerWidth < 768 && onClose()} 
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

        {/* Rodapé */}
        <div className="p-4 border-t border-gray-800 bg-[#151515]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold border-2 border-[#1a1a1a]">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name || 'Usuário'}</p>
              <p className="text-xs text-gray-500 truncate" title={user.email}>{user.email || 'email'}</p>
            </div>
          </div>

          <Link
              to="/settings"
              onClick={() => window.innerWidth < 768 && onClose()}
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
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;