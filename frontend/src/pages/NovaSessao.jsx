import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import Layout from '../components/Layout';
import { studySessionAPI, subjectAPI } from '../services/api'; 
// import { getErrorMessage } from '../utils/errorHandler'; // Opcional, vamos tratar direto aqui
import { CheckCircle2, Circle, Calendar as CalendarIcon, Layers, Tag, Save, ArrowLeft } from 'lucide-react';
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
  const [availableMatters, setAvailableMatters] = useState([]); 
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
                // Backend agora retorna .matters na entidade Subject
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

  // Ao trocar a matéria
  const handleSubjectChange = (e) => {
    const newId = e.target.value;
    setSubjectId(newId);
    setSelectedMatters([]); // Limpa os assuntos ao trocar de matéria
    
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

    try {
      const payload = {
        title,
        durationMinutes: Number(duration),
        date: date.toISOString(), // Backend Java aceita ISO string para LocalDateTime
        description,
        completed,
        user: { id: user.userId },
        subject: subjectId ? { id: Number(subjectId) } : null,
        matters: selectedMatters // Envia lista de strings
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

      // --- TRATAMENTO DE ERRO MELHORADO PARA O GLOBAL EXCEPTION HANDLER ---
      if (err.response && err.response.status === 400 && err.response.data) {
          const data = err.response.data;
          
          // Se for o Map de erros do backend { "title": "erro...", "duration": "erro..." }
          if (typeof data === 'object' && !Array.isArray(data)) {
              // Pega a primeira mensagem de erro para mostrar no Toast
              const firstErrorKey = Object.keys(data)[0];
              const errorMessage = data[firstErrorKey];
              
              // Se tiver mais de um erro, avisa
              const extraErrors = Object.keys(data).length - 1;
              const suffix = extraErrors > 0 ? ` (+${extraErrors} erros)` : '';

              toast.error(`${errorMessage}${suffix}`);
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
      {/* Estilos Globais para o DatePicker dentro do Componente */}
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
            className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Dashboard
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">
            {isEditing ? 'Editar Sessão' : 'Registrar Sessão'}
        </h1>
        <p className="text-gray-400 mb-8">
            {isEditing ? 'Atualize os detalhes da sua sessão de estudo.' : 'Registre o que você estudou para acompanhar seu progresso.'}
        </p>
        
        <div className="bg-[#121212] border border-gray-800 rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Título */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Título da Sessão</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Revisão de Arrays em Java"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                required
              />
            </div>

            {/* Matéria */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Matéria</label>
              <div className="relative">
                  <select
                    value={subjectId}
                    onChange={handleSubjectChange}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
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

            {/* Assuntos (Matters) - Condicional */}
            {availableMatters.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-[#0a0a0a] p-4 rounded-lg border border-gray-800">
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
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                        : 'bg-[#1a1a1a] border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-500'
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duração */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Duração (minutos)</label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[15, 30, 45, 60, 90, 120].map((mins) => (
                      <button
                          key={mins}
                          type="button"
                          onClick={() => setDuration(mins)}
                          className="px-2 py-1 text-xs bg-[#1a1a1a] border border-gray-700 text-gray-400 rounded hover:bg-gray-800 hover:text-white transition-colors"
                      >
                          {mins}m
                      </button>
                  ))}
                </div>
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Data</label>
                <div className="relative group">
                  <CalendarIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 z-10 pointer-events-none transition-colors" />
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
                    placeholder="Anote aqui suas dificuldades ou pontos importantes..."
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-25 resize-none placeholder-gray-600"
                />
            </div>

            {/* Checkbox "Concluída" */}
            <div 
                onClick={() => setCompleted(!completed)}
                className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    completed 
                    ? 'bg-blue-600/10 border-blue-500/50' 
                    : 'bg-[#0a0a0a] border-gray-700 hover:border-gray-600'
                }`}
            >
                {completed ? (
                    <CheckCircle2 className="w-6 h-6 text-blue-500 mr-3 shrink-0" />
                ) : (
                    <Circle className="w-6 h-6 text-gray-500 mr-3 shrink-0" />
                )}
                <div>
                    <p className={`font-medium ${completed ? 'text-blue-400' : 'text-gray-300'}`}>
                        Sessão Concluída
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {completed ? 'Esta sessão será contabilizada nas suas estatísticas.' : 'Salvar apenas como rascunho/planejamento.'}
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
                    className="flex-1 py-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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