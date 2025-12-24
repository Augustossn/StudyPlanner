import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import Layout from '../components/Layout';
import { studySessionAPI, subjectAPI } from '../services/api'; 
import { getErrorMessage } from '../utils/errorHandler'; 
import { CheckCircle2, Circle, Calendar as CalendarIcon, Layers, Tag } from 'lucide-react'; // Novos ícones

// Imports do DatePicker
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ptBR from 'date-fns/locale/pt-BR';

registerLocale('pt-BR', ptBR);

const NovaSessao = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [date, setDate] = useState(new Date()); 
  const [completed, setCompleted] = useState(true); 
  
  const [subjects, setSubjects] = useState([]); 
  
  // --- NOVOS ESTADOS PARA SUBMATÉRIAS ---
  const [availableSubSubjects, setAvailableSubSubjects] = useState([]); // Opções disponíveis da matéria escolhida
  const [selectedSubSubjects, setSelectedSubSubjects] = useState([]);   // O que o usuário selecionou
  
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user.userId) {
      subjectAPI.getUserSubjects(user.userId)
        .then(res => setSubjects(res.data || []))
        .catch(() => setSubjects([]));
    } else {
        navigate('/');
    }
  }, [user.userId, navigate]);

  // Quando o usuário troca a Matéria
  const handleSubjectChange = (e) => {
    const newId = e.target.value;
    setSubjectId(newId);
    
    // Limpa as seleções anteriores
    setSelectedSubSubjects([]); 
    
    // Encontra a matéria completa para pegar a lista de subSubjects dela
    const selectedSubject = subjects.find(s => s.id === Number(newId));
    
    if (selectedSubject && selectedSubject.subSubjects) {
        setAvailableSubSubjects(selectedSubject.subSubjects);
    } else {
        setAvailableSubSubjects([]);
    }
  };

  // Lógica de Selecionar/Deselecionar Tags
  const toggleSubSubject = (sub) => {
    if (selectedSubSubjects.includes(sub)) {
        setSelectedSubSubjects(prev => prev.filter(item => item !== sub));
    } else {
        setSelectedSubSubjects(prev => [...prev, sub]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await studySessionAPI.createSession({
        title,
        durationMinutes: Number(duration),
        date: date.toISOString(),
        description,
        completed,
        user: { id: user.userId },
        subject: subjectId ? { id: Number(subjectId) } : null,
        subSubjects: selectedSubSubjects // <--- ENVIANDO A LISTA
      });

      toast.success('Sessão registrada!');
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
      `}</style>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Nova Sessão</h1>
        
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Matéria</label>
              <div className="relative">
                  <select
                    value={subjectId}
                    onChange={handleSubjectChange} // Alterado para nossa função customizada
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
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

            {/* --- SEÇÃO DE SUBMATÉRIAS (Só aparece se tiver opções) --- */}
            {availableSubSubjects.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        O que você estudou especificamente?
                    </label>
                    <div className="flex flex-wrap gap-2 p-4 bg-[#0a0a0a] border border-gray-700 rounded-lg">
                        {availableSubSubjects.map((sub, index) => {
                            const isSelected = selectedSubSubjects.includes(sub);
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => toggleSubSubject(sub)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all ${
                                        isSelected 
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    <Tag className="w-3 h-3" />
                                    {sub}
                                    {isSelected && <CheckCircle2 className="w-3 h-3 ml-1" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duração */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duração (minutos)</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Data</label>
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
                    />
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Observações (Opcional)</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes adicionais..."
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
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
                    className="w-full py-3 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 font-semibold rounded-lg transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/20"
                >
                    {loading ? 'Salvando...' : 'Registrar Sessão'}
                </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NovaSessao;