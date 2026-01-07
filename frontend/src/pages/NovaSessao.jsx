import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import Layout from '../components/Layout';
import { studySessionAPI, subjectAPI } from '../services/api'; 
import { getErrorMessage } from '../utils/errorHandler'; 
import { CheckCircle2, Circle, Calendar as CalendarIcon, Layers, Tag, Save } from 'lucide-react';
import { getAuthUser } from '../utils/auth';

// Imports do DatePicker
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
  const [duration, setDuration] = useState(sessionToEdit?.durationMinutes || 60);
  
  // Data
  const [date, setDate] = useState(
    sessionToEdit?.date ? new Date(sessionToEdit.date) : new Date()
  );
  
  const [completed, setCompleted] = useState(
    sessionToEdit !== undefined ? sessionToEdit.completed : true
  ); 
  
  const [subjects, setSubjects] = useState([]); 
  
  // LÓGICA DE ASSUNTOS (MATTERS)
  const [availableMatters, setAvailableMatters] = useState([]); // Opções vindas da Matéria
  
  // Aqui usamos 'matters' para alinhar com o Backend
  const [selectedMatters, setSelectedMatters] = useState(sessionToEdit?.matters || []); 
  
  const [loading, setLoading] = useState(false);
  
  // Carrega matérias e ajusta os assuntos na edição
  useEffect(() => {
    if (user.userId) {
      subjectAPI.getUserSubjects(user.userId)
        .then(res => {
            const loadedSubjects = res.data || [];
            setSubjects(loadedSubjects);

            // Se for edição, carrega as opções da matéria já salva
            if (isEditing && sessionToEdit?.subject?.id) {
                const currentSub = loadedSubjects.find(s => s.id === sessionToEdit.subject.id);
                
                // --- CORREÇÃO AQUI: Troquei .matter por .matters ---
                if (currentSub) setAvailableMatters(currentSub.matters || []);
            }
        })
        .catch(() => setSubjects([]));
    } else {
        navigate('/');
    }
  }, [user.userId, navigate, isEditing, sessionToEdit]);

  // Ao trocar a matéria
  const handleSubjectChange = (e) => {
    const newId = e.target.value;
    setSubjectId(newId);
    setSelectedMatters([]); // Limpa os assuntos selecionados
    
    const selectedSubject = subjects.find(s => s.id === Number(newId));
    
    // --- CORREÇÃO AQUI: Troquei .matter por .matters ---
    if (selectedSubject && selectedSubject.matters) {
        setAvailableMatters(selectedSubject.matters);
    } else {
        setAvailableMatters([]);
    }
  };

  // Função para marcar/desmarcar assuntos (Multiseleção)
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

    try {
      const payload = {
        title,
        durationMinutes: Number(duration),
        date: date.toISOString(),
        description,
        completed,
        user: { id: user.userId },
        subject: subjectId ? { id: Number(subjectId) } : null,
        
        // Envia como 'matters' para o Backend
        matters: selectedMatters 
      };

      if (isEditing) {
        await studySessionAPI.updateSession(sessionToEdit.id, payload);
        toast.success('Sessão atualizada com sucesso!');
      } else {
        await studySessionAPI.createSession(payload);
        toast.success('Sessão registrada!');
      }

      navigate('/dashboard');
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
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
        <h1 className="text-3xl font-bold text-white mb-2">
            {isEditing ? 'Editar Sessão' : 'Registrar uma nova sessão'}
        </h1>
        <p className="text-gray-400 mb-8">
            {isEditing ? 'Corrija ou atualize os dados da sua sessão.' : 'Nos fale o que você estudou.'}
        </p>
        
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Título */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Revisão de Java"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>

            {/* Matéria */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider uppercase tracking-wider">Matéria</label>
              <div className="relative">
                  <select
                    value={subjectId}
                    onChange={handleSubjectChange}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none "
                    required
                  >
                    <option value="">Selecione uma matéria...</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                  <Layers className="absolute right-4 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Assuntos (Matters) */}
            {availableMatters.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-bold text-white-300 mb-2 uppercase tracking-wide">
                        Quais assuntos você estudou?
                    </label>
                    <div className="flex flex-wrap gap-2 p-4 bg-[#0a0a0a] border border-gray-700 rounded-lg">
                        {availableMatters.map((matter, index) => {
                            const isSelected = selectedMatters.includes(matter);
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => toggleMatter(matter)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all ${
                                        isSelected 
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    <Tag className="w-3 h-3" />
                                    {matter}
                                    {isSelected && <CheckCircle2 className="w-3 h-3 ml-1" />}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-1">
                        Selecione um ou mais tópicos para atualizar as metas específicas.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duração */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Duração (minutos)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <div className="flex gap-2 mt-2">
                    {[30, 45, 60, 90, 120].map((mins) => (
                        <button
                            key={mins}
                            type="button"
                            onClick={() => setDuration(mins)}
                            className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-white transition-colors"
                        >
                            {mins}m
                        </button>
                    ))}
                </div>
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Data</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
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

            {/* Descrição */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Observações (Opcional)</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes adicionais..."
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-25"
                />
            </div>

            {/* Checkbox */}
            <div 
                onClick={() => setCompleted(!completed)}
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    completed 
                    ? 'bg-blue-600/10 border-blue-500/50' 
                    : 'bg-[#0a0a0a] border-gray-700 hover:border-gray-600'
                }`}
            >
                {completed ? (
                    <CheckCircle2 className="w-6 h-6 text-blue-500 mr-3" />
                ) : (
                    <Circle className="w-6 h-6 text-gray-500 mr-3" />
                )}
                <div>
                    <p className={`font-medium ${completed ? 'text-blue-400' : 'text-gray-300'}`}>
                        Sessão Concluída
                    </p>
                    <p className="text-xs text-gray-500">
                        {completed ? 'Contará para suas estatísticas.' : 'Salvar como planejamento.'}
                    </p>
                </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-4 bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800 font-semibold rounded-xl transition-all cursor-pointer"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                    {isEditing ? <Save className="w-4 h-4"/> : null}
                    {loading ? 'Salvando...' : (isEditing ? 'Atualizar Sessão' : 'Registrar Sessão')}
                </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NovaSessao;