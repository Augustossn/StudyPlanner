/* eslint-disable no-unused-vars */
import React from 'react';
import { 
  X, Calendar, Clock, AlignLeft, Tag, 
  CheckCircle2, XCircle, HelpCircle, Trash2, Edit2 
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
        window.location.reload(); // Recarrega para atualizar dados
    } catch (error) {
        toast.error("Erro ao excluir.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Container do Modal */}
      <div className="bg-[#121212] border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho com Cor da Matéria */}
        <div className="relative p-6 pb-4 border-b border-border">
            <div 
                className="absolute top-0 left-0 w-1.5 h-full" 
                style={{ backgroundColor: session.subject?.color || '#333' }}
            />
            
            <div className="flex justify-between items-start pl-3">
                <div>
                    <span 
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-text/80 mb-2 inline-block"
                        style={{ backgroundColor: session.subject?.color ? `${session.subject.color}40` : '#333' }}
                    >
                        {session.subject?.name || 'Sem Matéria'}
                    </span>
                    <h2 className="text-xl font-bold text-text leading-tight">
                        {session.title}
                    </h2>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full text-text-muted hover:text-text transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
            
            {/* 1. Grid de Tempo e Data */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface p-3 rounded-xl border border-border flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold">Data</p>
                        <p className="text-sm font-medium text-gray-200">
                            {format(parseISO(session.date), "dd 'de' MMM", { locale: ptBR })}
                        </p>
                    </div>
                </div>

                <div className="bg-surface p-3 rounded-xl border border-border flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold">Duração</p>
                        <p className="text-sm font-medium text-gray-200">
                            {session.durationMinutes > 0 ? `${session.durationMinutes} min` : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Seção de Questões (Condicional) */}
            {hasQuestions && (
                <div className="bg-surface rounded-xl border border-border overflow-hidden">
                    <div className="p-3 border-b border-border bg-gray-800/20 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-300 uppercase flex items-center gap-2">
                            <HelpCircle className="w-3.5 h-3.5" /> Desempenho
                        </span>
                        <span className={`text-xs font-bold ${percentage >= 70 ? 'text-emerald-400' : 'text-text-muted'}`}>
                            {percentage}% de Acerto
                        </span>
                    </div>
                    
                    <div className="p-4 space-y-4">
                        {/* Barra de Acertos */}
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3"/> Acertos
                                </span>
                                <span className="text-text font-bold">{correct}</span>
                            </div>
                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500 rounded-full" 
                                    style={{ width: `${(correct / session.totalQuestions) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Barra de Erros */}
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-red-400 font-bold flex items-center gap-1">
                                    <XCircle className="w-3 h-3"/> Erros
                                </span>
                                <span className="text-text font-bold">{wrong}</span>
                            </div>
                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-red-500 rounded-full" 
                                    style={{ width: `${(wrong / session.totalQuestions) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="pt-2 text-center">
                             <span className="text-[10px] text-text-muted uppercase tracking-widest">
                                Total de {session.totalQuestions} Questões
                             </span>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Assuntos / Tags */}
            {session.matters && session.matters.length > 0 && (
                <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold mb-2 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Tópicos Estudados
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {session.matters.map((m, i) => (
                            <span key={i} className="px-2 py-1 bg-surface border border-border rounded text-xs text-gray-300">
                                {m}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. Descrição */}
            {session.description && (
                <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold mb-2 flex items-center gap-1">
                        <AlignLeft className="w-3 h-3" /> Observações
                    </p>
                    <div className="bg-surface p-3 rounded-lg border border-border text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {session.description}
                    </div>
                </div>
            )}
        </div>

        {/* Rodapé com Ações */}
        <div className="p-4 border-t border-border bg-surface flex gap-3">
            <button 
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-lg border border-red-900/30 text-red-500 hover:bg-red-900/10 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
                <Trash2 className="w-4 h-4" /> Excluir
            </button>
            <button 
                onClick={handleEdit}
                className="flex-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-text font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
            >
                <Edit2 className="w-4 h-4" /> Editar Sessão
            </button>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsModal;