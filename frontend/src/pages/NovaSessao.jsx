import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import Layout from '../components/Layout';
import { studySessionAPI, subjectAPI } from '../services/api'; 
import { 
  CheckCircle2, Circle, Calendar as CalendarIcon, Layers, Tag, Save, ArrowLeft, 
  Clock, HelpCircle, Calculator, X 
} from 'lucide-react';
import { getAuthUser } from '../utils/auth';

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";

registerLocale('pt-BR', ptBR);

const NovaSessao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(() => getAuthUser());

  // Verifica se é edição
  const sessionToEdit = location.state?.sessionToEdit;
  const isEditing = !!sessionToEdit;

  // --- ESTADOS ---
  const [title, setTitle] = useState(sessionToEdit?.title || '');
  const [subjectId, setSubjectId] = useState(sessionToEdit?.subject?.id || '');
  const [description, setDescription] = useState(sessionToEdit?.description || '');
  const [completed, setCompleted] = useState(sessionToEdit?.completed ?? true);
  
  // Data
  const [date, setDate] = useState(
    sessionToEdit?.date ? new Date(sessionToEdit.date) : new Date()
  );

  // --- NOVO: TIPO DE REGISTRO ---
  // Se for edição, tentamos adivinhar o tipo com base nos dados que vieram
  const getInitialType = () => {
      if (!sessionToEdit) return 'TIME'; // Padrão
      const hasTime = sessionToEdit.durationMinutes > 0;
      const hasQuestions = sessionToEdit.totalQuestions > 0;
      
      if (hasTime && hasQuestions) return 'BOTH';
      if (hasQuestions) return 'QUESTIONS';
      return 'TIME';
  };
  const [sessionType, setSessionType] = useState(getInitialType);

  // Estados de Tempo e Questões
  const [duration, setDuration] = useState(sessionToEdit?.durationMinutes || 60);
  const [correctCount, setCorrectCount] = useState(sessionToEdit?.correctQuestions || 0);
  const [wrongCount, setWrongCount] = useState(
    (sessionToEdit?.totalQuestions || 0) - (sessionToEdit?.correctQuestions || 0)
  );
  
  const [subjects, setSubjects] = useState([]); 
  const [availableMatters, setAvailableMatters] = useState([]); 
  const [selectedMatters, setSelectedMatters] = useState(sessionToEdit?.matters || []); 
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user.userId) {
      subjectAPI.getUserSubjects(user.userId)
        .then(res => {
            const loadedSubjects = res.data || [];
            setSubjects(loadedSubjects);

            if (isEditing && sessionToEdit?.subject?.id) {
                const currentSub = loadedSubjects.find(s => s.id === sessionToEdit.subject.id);
                if (currentSub) setAvailableMatters(currentSub.matters || []);
            }
        })
        .catch(() => {
            toast.error("Erro ao carregar matérias.");
            setSubjects([]);
        });
    } else {
        navigate('/');
    }
  }, [user.userId, navigate, isEditing, sessionToEdit]);

  const handleSubjectChange = (e) => {
    const newId = e.target.value;
    setSubjectId(newId);
    setSelectedMatters([]); 
    
    const selectedSubject = subjects.find(s => s.id === Number(newId));
    
    if (selectedSubject && selectedSubject.matters) {
        setAvailableMatters(selectedSubject.matters);
    } else {
        setAvailableMatters([]);
    }
  };

  const toggleMatter = (matterName) => {
    if (selectedMatters.includes(matterName)) {
        setSelectedMatters(prev => prev.filter(item => item !== matterName));
    } else {
        setSelectedMatters(prev => [...prev, matterName]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Lógica para definir os valores finais baseados no tipo
    let finalDuration = 0;
    let finalTotalQuestions = null;
    let finalCorrectQuestions = null;

    if (sessionType === 'TIME' || sessionType === 'BOTH') {
        finalDuration = Number(duration);
    }
    
    if (sessionType === 'QUESTIONS' || sessionType === 'BOTH') {
        finalTotalQuestions = Number(correctCount) + Number(wrongCount);
        finalCorrectQuestions = Number(correctCount);
    }

    try {
      const payload = {
        title,
        date: date.toISOString(),
        description,
        completed,
        user: { id: user.userId },
        subject: subjectId ? { id: Number(subjectId) } : null,
        matters: selectedMatters,

        // Campos novos
        durationMinutes: finalDuration,
        totalQuestions: finalTotalQuestions,
        correctQuestions: finalCorrectQuestions
      };

      if (isEditing) {
        await studySessionAPI.updateSession(sessionToEdit.id, payload);
        toast.success('Sessão atualizada com sucesso!');
      } else {
        await studySessionAPI.createSession(payload);
        toast.success('Sessão registrada com sucesso!');
      }

      navigate('/dashboard');

    } catch (err) {
      console.error("Erro no submit:", err);
      if (err.response && err.response.status === 400 && err.response.data) {
          const data = err.response.data;
          if (typeof data === 'object' && !Array.isArray(data)) {
              const firstErrorKey = Object.keys(data)[0];
              toast.error(data[firstErrorKey]);
          } else {
              toast.error(data.message || "Verifique os dados informados.");
          }
      } else {
          toast.error("Erro ao salvar sessão. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <style>{`
        .react-datepicker { background-color: #1a1a1a !important; border-color: #333 !important; font-family: inherit !important; }
        .react-datepicker__header { background-color: #0a0a0a !important; border-bottom-color: #333 !important; }
        .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker__day { color: #fff !important; }
        .react-datepicker__day:hover { background-color: #3b82f6 !important; color: white !important; }
        .react-datepicker__day--selected { background-color: #2563eb !important; color: white !important; }
        .react-datepicker__day--keyboard-selected { background-color: #1d4ed8 !important; }
        .custom-datepicker-input { width: 100%; background-color: #0a0a0a; color: white; padding: 0.75rem 1rem; padding-left: 2.5rem; border-radius: 0.5rem; border: 1px solid #374151; outline: none; }
        .custom-datepicker-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
        .react-datepicker__day--disabled { visibility: hidden !important; pointer-events: none !important; }
      `}</style>

      <div className="max-w-3xl mx-auto">
        <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-text-muted hover:text-text mb-6 transition-colors"
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Dashboard
        </button>

        <h1 className="text-3xl font-bold text-text mb-2">
            {isEditing ? 'Editar Sessão' : 'Registrar Sessão'}
        </h1>
        <p className="text-text-muted mb-8">
            {isEditing ? 'Atualize os detalhes da sua sessão.' : 'Registre o que você estudou para acompanhar seu progresso.'}
        </p>
        
        <div className="bg-[#121212] border border-border rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* --- SELEÇÃO DO TIPO DE REGISTRO --- */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                    O que você quer registrar?
                </label>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => setSessionType('TIME')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                            sessionType === 'TIME' 
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                            : 'bg-background border-border text-text-muted hover:bg-[#151515] hover:border-gray-600'
                        }`}
                    >
                        <Clock className="w-6 h-6 mb-2" />
                        <span className="text-xs font-bold uppercase">Tempo</span>
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => setSessionType('QUESTIONS')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                            sessionType === 'QUESTIONS' 
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                            : 'bg-background border-border text-text-muted hover:bg-[#151515] hover:border-gray-600'
                        }`}
                    >
                        <HelpCircle className="w-6 h-6 mb-2" />
                        <span className="text-xs font-bold uppercase">Questões</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSessionType('BOTH')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                            sessionType === 'BOTH' 
                            ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                            : 'bg-background border-border text-text-muted hover:bg-[#151515] hover:border-gray-600'
                        }`}
                    >
                        <Calculator className="w-6 h-6 mb-2" />
                        <span className="text-xs font-bold uppercase">Ambos</span>
                    </button>
                </div>
            </div>

            {/* Inputs Principais (Título e Matéria) */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Título da Sessão</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Resolução de Lista de Exercícios"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Matéria</label>
                    <div className="relative">
                        <select
                            value={subjectId}
                            onChange={handleSubjectChange}
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                            required
                        >
                            <option value="">Selecione uma matéria...</option>
                            {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                            ))}
                        </select>
                        <Layers className="absolute right-4 top-3.5 w-5 h-5 text-text-muted pointer-events-none" />
                    </div>
                </div>

                {/* Assuntos (Condicional) */}
                {availableMatters.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-background p-4 rounded-lg border border-border">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                            <Tag className="w-4 h-4" /> Tópicos Estudados
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {availableMatters.map((matter, index) => {
                                const isSelected = selectedMatters.includes(matter);
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => toggleMatter(matter)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all duration-200 ${
                                            isSelected 
                                            ? 'bg-blue-600 border-blue-500 text-text shadow-lg shadow-blue-500/20' 
                                            : 'bg-surface border-border text-text-muted hover:bg-gray-800 hover:border-gray-500'
                                        }`}
                                    >
                                        {matter}
                                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="h-px bg-gray-800 w-full" />

            {/* --- ÁREA DINÂMICA: TEMPO / QUESTÕES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 1. INPUT DE TEMPO */}
                {(sessionType === 'TIME' || sessionType === 'BOTH') && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                        <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider items-center gap-2">
                            Duração (minutos)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="1440"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
                            required={sessionType !== 'QUESTIONS'}
                        />
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {[30, 45, 60, 90, 120].map((mins) => (
                                <button
                                    key={mins}
                                    type="button"
                                    onClick={() => setDuration(mins)}
                                    className="px-2 py-1 text-xs bg-surface border border-border text-text-muted rounded hover:bg-gray-800 hover:text-text transition-colors"
                                >
                                    {mins}m
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. INPUT DE QUESTÕES */}
                {(sessionType === 'QUESTIONS' || sessionType === 'BOTH') && (
                    <div className={`md:col-span-${sessionType === 'QUESTIONS' ? '2' : '1'} animate-in fade-in slide-in-from-right-4 duration-300`}>
                         <div className="grid grid-cols-2 gap-4 bg-background p-4 rounded-xl border border-border h-full">
                            <div>
                                <label className="block text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5"/> Acertos
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={correctCount}
                                    onChange={(e) => setCorrectCount(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-[#151515] border border-emerald-900/50 rounded-lg text-text focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-lg text-center"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-red-400 mb-2 uppercase tracking-wider items-center gap-2">
                                    <X className="w-3.5 h-3.5"/> Erros
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={wrongCount}
                                    onChange={(e) => setWrongCount(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-[#151515] border border-red-900/50 rounded-lg text-text focus:ring-2 focus:ring-red-500 outline-none font-mono text-lg text-center"
                                />
                            </div>
                            <div className="col-span-2 text-center border-t border-border pt-3 mt-1">
                                <p className="text-text-muted text-xs uppercase tracking-widest mb-1">Total Resolvido</p>
                                <p className="text-text font-bold text-2xl">{Number(correctCount) + Number(wrongCount)}</p>
                            </div>
                         </div>
                    </div>
                )}

                {/* 3. DATA (Sempre aparece) */}
                <div className={`${sessionType === 'QUESTIONS' ? 'md:col-span-2' : ''}`}>
                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Data</label>
                    <div className="relative group">
                        <CalendarIcon className="absolute left-3 top-3.5 w-5 h-5 text-text-muted group-focus-within:text-blue-500 z-10 pointer-events-none transition-colors" />
                        <DatePicker 
                            selected={date} 
                            onChange={(date) => setDate(date)} 
                            dateFormat="dd/MM/yyyy"
                            locale="pt-BR"
                            className="custom-datepicker-input cursor-pointer"
                            calendarClassName="shadow-xl"
                            wrapperClassName="w-full"
                            showPopperArrow={false}
                            maxDate={new Date()} 
                            placeholderText="Selecione uma data"
                        />
                    </div>
                </div>
            </div>

            {/* Descrição e Checkbox */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Observações (Opcional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Anote aqui suas dificuldades..."
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-25 resize-none placeholder-gray-600"
                    />
                </div>

                <div 
                    onClick={() => setCompleted(!completed)}
                    className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                        completed 
                        ? 'bg-blue-600/10 border-blue-500/50' 
                        : 'bg-background border-border hover:border-gray-600'
                    }`}
                >
                    {completed ? (
                        <CheckCircle2 className="w-6 h-6 text-blue-500 mr-3 shrink-0" />
                    ) : (
                        <Circle className="w-6 h-6 text-text-muted mr-3 shrink-0" />
                    )}
                    <div>
                        <p className={`font-medium ${completed ? 'text-blue-400' : 'text-gray-300'}`}>
                            Sessão Concluída
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                            {completed ? 'Esta sessão será contabilizada nas estatísticas.' : 'Salvar como planejamento.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4 border-t border-border">
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-4 bg-transparent border border-border text-gray-300 hover:bg-gray-800 font-semibold rounded-xl transition-all cursor-pointer"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-text font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        'Salvando...'
                    ) : (
                        <>
                            {isEditing ? <Save className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
                            {isEditing ? 'Salvar Alterações' : 'Registrar Sessão'}
                        </>
                    )}
                </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NovaSessao;