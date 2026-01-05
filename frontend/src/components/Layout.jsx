import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
  // Estado que controla o menu. Começa fechado (false) para priorizar espaço, ou true se preferir.
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#09090b]">
      
      {/* BOTÃO FLUTUANTE DE ABRIR O MENU 
          Só aparece se o menu estiver FECHADO (!isSidebarOpen)
      */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 bg-[#1a1a1a] border border-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
          title="Abrir Menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* O Sidebar recebe o estado e a função para fechar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* ÁREA DE CONTEÚDO PRINCIPAL 
         A margem esquerda (ml) muda dinamicamente:
         - Se menu aberto Desktop: ml-64 (256px)
         - Se menu aberto Mobile: ml-0 (Overlay)
         - Se menu fechado: ml-0
      */}
      <main 
        className={`
            transition-all duration-300 ease-in-out p-4 md:p-8
            ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}
        `}
      >
        {/* Espaço no topo para o botão não ficar em cima do título quando o menu ta fechado */}
        <div className={`${!isSidebarOpen ? 'mt-12 md:mt-0' : 'mt-12 md:mt-0'}`}>
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;