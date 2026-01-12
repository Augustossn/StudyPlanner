/* eslint-disable no-unused-vars */
import React from 'react';
import { 
  X, Calendar, Clock, AlignLeft, Tag, 
  CheckCircle2, XCircle, HelpCircle, Trash2, Edit2, BookOpen 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { studySessionAPI } from '../services/api'; 
import toast from 'react-hot-toast';

const SessionDetailsModal = ({ isOpen, onClose, session }) => {
  const navigate = useNavigate();

  if (!isOpen || !session) return null;

  // Cálculos para Questões
  const hasQuestions = session.totalQuestions > 0;
  const correct = session.correctQuestions || 0;
  const wrong = (session.totalQuestions || 0) - correct;
  const percentage = hasQuestions ? Math.round((correct / session.totalQuestions) * 100) : 0;
  
  const subjectColor = session.subject?.color || '#3b82f6';

  // Handlers
  const handleEdit = () => {
    navigate('/nova-sessao', { state: { sessionToEdit: session } });
    onClose();
  };

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir esta sessão?")) return;
    try {
        await studySessionAPI.deleteSession(session.id);
        toast.success("Sessão excluída.");
        window.location.reload(); 
    } catch (error) {
        toast.error("Erro ao excluir.");
    }
  };

  return (
    <div 
        className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
    >
      
      {/* Container do Modal */}
      <div 
        className="relative bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Cabeçalho Visual (Sem overflow-hidden para não cortar o ícone) */}
        <div className="relative h-24 shrink-0 rounded-t-2xl">
            {/* Fundo colorido (Aplicamos o arredondamento aqui para garantir o visual) */}
            <div 
                className="absolute inset-0 opacity-20 rounded-t-2xl" 
                style={{ backgroundColor: subjectColor }}
            ></div>
            
            {/* Ícone da Matéria Flutuante (Posicionado para fora do header) */}
            <div className="absolute -bottom-6 left-6 z-10">
                <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-white text-2xl font-bold border-4 border-white dark:border-[#18181b]"
                    style={{ backgroundColor: subjectColor }}
                >
                    <BookOpen size={28} />
                </div>
            </div>

            {/* Botão Fechar */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-white rounded-full transition-colors cursor-pointer z-20"
            >
                <X size={20} />
            </button>
        </div>

        {/* Conteúdo Principal (Com overflow-y-auto para scroll se necessário) */}
        <div className="pt-10 px-6 pb-6 overflow-y-auto custom-scrollbar bg-white dark:bg-[#18181b]">
            
            {/* Título e Matéria */}
            <div className="mb-6 mt-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">
                    {session.title || 'Sessão de Estudo'}
                </h2>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: subjectColor }}></span>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                        {session.subject?.name || 'Geral'}
                    </p>
                </div>
            </div>

            {/* Grid: Duração e Data */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-[#27272a] p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-lg shrink-0">
                        <Clock size={20} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Duração</p>
                        <p className="text-gray-900 dark:text-white font-bold truncate">{session.durationMinutes} min</p>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-[#27272a] p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-500 rounded-lg shrink-0">
                        <Calendar size={20} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Data</p>
                        <p className="text-gray-900 dark:text-white font-bold text-sm capitalize truncate">
                            {format(parseISO(session.date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Seção de Desempenho (Se houver questões) */}
            {hasQuestions && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-[#27272a] rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2 tracking-wider">
                            <HelpCircle size={14} /> Desempenho
                        </span>
                        <span className={`text-xs font-bold ${percentage >= 70 ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-500'}`}>
                            {percentage}% de Acerto
                        </span>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex mb-3">
                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(correct / session.totalQuestions) * 100}%` }} title="Acertos" />
                        <div className="h-full bg-red-500 transition-all" style={{ width: `${(wrong / session.totalQuestions) * 100}%` }} title="Erros" />
                    </div>

                    {/* Legenda */}
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 size={12} /> {correct} Acertos
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                            Total: {session.totalQuestions}
                        </span>
                        <span className="text-red-600 dark:text-red-500 flex items-center gap-1">
                            <XCircle size={12} /> {wrong} Erros
                        </span>
                    </div>
                </div>
            )}

            {/* Tópicos / Tags */}
            {session.matters && session.matters.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2 tracking-wider">
                        <Tag size={14} /> Tópicos Estudados
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {session.matters.map((matter, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-gray-100 dark:bg-[#27272a] border border-gray-200 dark:border-[#3f3f46] rounded-lg text-xs text-gray-700 dark:text-gray-200 font-medium">
                                {matter}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Descrição / Observações */}
            {session.description && (
                <div className="pt-4 border-t border-gray-200 dark:border-[#27272a]">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2 tracking-wider">
                        <AlignLeft size={14} /> Observações
                    </h3>
                    <div className="bg-gray-50 dark:bg-[#09090b] p-3 rounded-xl border border-gray-200 dark:border-[#27272a] text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap italic">
                        "{session.description}"
                    </div>
                </div>
            )}
        </div>

        {/* Rodapé com Ações */}
        <div className="p-5 border-t border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#18181b] rounded-b-2xl flex gap-3 mt-auto shrink-0">
            <button 
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
                <Trash2 size={18} /> Excluir
            </button>
            <button 
                onClick={handleEdit}
                className="flex-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20 cursor-pointer"
            >
                <Edit2 size={18} /> Editar Sessão
            </button>
        </div>

      </div>
    </div>
  );
};

export default SessionDetailsModal;