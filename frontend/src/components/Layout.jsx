import React from 'react';
import Sidebar from './Sidebar';

// Este componente recebe "children", que será o conteúdo da página (ex: Dashboard)
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* 1. Sidebar fixa na esquerda */}
      <Sidebar />

      {/* 2. Área de Conteúdo Principal */}
      {/* ml-64 empurra o conteúdo para a direita para não ficar atrás da sidebar */}
      <main className="flex-1 ml-64 p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;