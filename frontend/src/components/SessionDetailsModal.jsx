import React from 'react';
import {
    X, 
    Clock, 
    Calendar, 
    BookOpen,
    FileText
} from 'lucide-react';

const SessionDetailsModal = ({ isOpen, onClose, session }) => {
    if (!isOpen || !session ) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in"
                onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal feche ele
            >
        {/* Cabeçalho com a cor da matéria */}
        <div 
            className="p-6 text-white relative"
            style={{ backgroundColor: session.subject?.color || '#4F46E5' }}
        >
          
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <BookOpen size={18} />
            <span className="font-medium text-sm uppercase tracking-wider">
              {session.subject?.name || 'Geral'}
            </span>
          </div>
          <h2 className="text-2xl font-bold">{session.title}</h2>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-6">
            
          {/* Info Rápida */}
          <div className="flex gap-6 text-gray-600">
            <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-400" />
                <span>{formatDate(session.date)}</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock size={20} className="text-gray-400" />
                <span>{session.durationMinutes} min</span>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Observações / Descrição */}
          <div>
            <div className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                <FileText size={20} className="text-gray-500" />
                <h3>Observações da Sessão</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {session.description ? session.description : (
                    <span className="italic text-gray-400">Nenhuma observação registrada nesta sessão.</span>
                )}
            </div>
          </div>

          {/* Subtópicos / Matters (Se houver) */}
          {session.matters && (
            <div>
               <h4 className="text-sm font-semibold text-gray-500 mb-2">ASSUNTOS ESTUDADOS</h4>
               <div className="flex flex-wrap gap-2">
                  {/* Se matters for string separada por vírgula ou array, trate aqui. Exemplo genérico: */}
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                    {session.matters}
                  </span>
               </div>
            </div>
          )}

        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium cursor-pointer"
            >
                Fechar
            </button>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsModal;