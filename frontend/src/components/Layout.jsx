import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
  // Começa aberto em telas grandes, fechado em telas pequenas
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  // Fecha o menu automaticamente se a tela for redimensionada para mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      
      {/* BOTÃO FLUTUANTE (Hamburguer)
          Aparece quando o menu está fechado OU em mobile
      */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-2.5 bg-surface border border-border text-text rounded-xl shadow-lg hover:bg-gray-800 hover:scale-105 transition-all"
          title="Abrir Menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar Controlada */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* ÁREA DE CONTEÚDO PRINCIPAL 
         - Mobile (ml-0): O conteúdo ocupa tudo, o menu passa por cima.
         - Desktop (md:ml-64): O conteúdo é empurrado para o lado.
      */}
      <main 
        className={`
            transition-all duration-300 ease-in-out p-4 md:p-8 pb-20
            ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}
        `}
      >
        {/* Container para limitar a largura em telas ultra-wide */}
        <div className="max-w-400 mx-auto mt-14 md:mt-0">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;