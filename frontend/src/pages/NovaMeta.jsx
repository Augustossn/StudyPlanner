import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import Layout from '../components/Layout';
// Importamos subjectAPI para buscar as matérias
import { goalsAPI, subjectAPI } from '../services/api';
import { getErrorMessage } from '../utils/errorHandler'; 
import { Calendar, Clock, Target, ArrowRight, TrendingUp, Save, Layers } from 'lucide-react'; // Adicionei Layers
import { getAuthUser } from '../utils/auth';

const NovaMeta = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(() => getAuthUser());

  // Verifica se estamos em modo de edição
  const goalToEdit = location.state?.goalToEdit;
  const isEditing = !!goalToEdit;

  // Função auxiliar para formatar data
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  // --- ESTADOS ---
  const [title, setTitle] = useState(goalToEdit?.title || '');
  
  // NOVO: Estado para a matéria vinculada
  // Se estiver editando, tenta pegar o ID da matéria, senão começa vazio
  const [subjectId, setSubjectId] = useState(goalToEdit?.subject?.id || '');
  const [subjects, setSubjects] = useState([]); // Lista de matérias disponíveis

  const [goalType, setGoalType] = useState(goalToEdit?.goalType || 'Semanal');
  const [targetHours, setTargetHours] = useState(goalToEdit?.targetHours || 10);
  
  const [startDate, setStartDate] = useState(
    goalToEdit?.startDate ? formatDateForInput(goalToEdit.startDate) : new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    goalToEdit?.endDate ? formatDateForInput(goalToEdit.endDate) : ''
  );
  
  const [loading, setLoading] = useState(false);

  // --- EFEITOS ---

  // 1. Redireciona se não logado
  useEffect(() => {
    if (!user.userId) navigate('/');
  }, [user.userId, navigate]);

  // 2. Carrega as matérias do usuário (NOVO)
  useEffect(() => {
    if (user.userId) {
      subjectAPI.getUserSubjects(user.userId)
        .then(res => {
          setSubjects(res.data || []);
        })
        .catch(err => console.error("Erro ao carregar matérias", err));
    }
  }, [user.userId]);

  // Cálculo Inteligente de Esforço
  const dailyEffort = () => {
    if (!targetHours) return null;
    
    if (goalType === 'Semanal') {
        const daily = (targetHours / 7).toFixed(1);
        return `${daily}h / dia`;
    }
    if (goalType === 'Mensal') {
        const daily = (targetHours / 30).toFixed(1);
        return `${daily}h / dia`;
    }
    if (goalType === 'Desafio' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays > 0) {
            const daily = (targetHours / diffDays).toFixed(1);
            return `${daily}h / dia (${diffDays} dias)`;
        }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title,
        goalType,
        targetHours,
        startDate, 
        endDate: endDate || null,
        active: true,
        user: { id: user.userId },
        // NOVO: Envia o objeto Subject se houver um ID selecionado
        subject: subjectId ? { id: Number(subjectId) } : null
      };

      if (isEditing) {
        await goalsAPI.updateGoal(goalToEdit.id, payload);
        toast.success('Meta atualizada com sucesso! 🎯');
      } else {
        await goalsAPI.createGoal(payload);
        toast.success('Meta definida com sucesso! 🚀');
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
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">
            {isEditing ? 'Editar Meta' : 'Definir Nova Meta'}
        </h1>
        <p className="text-gray-400 mb-8">
            {isEditing ? 'Ajuste seus objetivos.' : 'Vincule sua meta a uma matéria para rastreamento automático.'}
        </p>
        
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. O Objetivo (Título) */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Qual é o seu objetivo?</label>
              <div className="relative">
                <Target className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Dominar Spring Boot"
                    className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                    required
                    autoFocus={!isEditing}
                />
              </div>
            </div>

            {/* 1.5. Vincular Matéria (NOVO CAMPO) */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                    Vincular a uma Matéria (Opcional)
                </label>
                <div className="relative">
                    <Layers className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                    <select
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white text-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="">Geral (Sem vínculo específico)</option>
                        {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                    {/* Seta indicativa no canto direito */}
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                        </svg>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-1">
                    Ao selecionar uma matéria, o sistema calculará o progresso somando as sessões registradas nela.
                </p>
            </div>

            {/* 2. Tipo de Meta */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Frequência</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Semanal', 'Mensal', 'Desafio'].map((type) => (
                        <div
                            key={type}
                            onClick={() => setGoalType(type)}
                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                                goalType === type 
                                ? 'bg-blue-900/20 border-blue-500' 
                                : 'bg-[#0a0a0a] border-gray-800 hover:border-gray-600'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                {type === 'Semanal' && <Clock className={`w-6 h-6 ${goalType === type ? 'text-blue-400' : 'text-gray-500'}`} />}
                                {type === 'Mensal' && <Calendar className={`w-6 h-6 ${goalType === type ? 'text-blue-400' : 'text-gray-500'}`} />}
                                {type === 'Desafio' && <TrendingUp className={`w-6 h-6 ${goalType === type ? 'text-blue-400' : 'text-gray-500'}`} />}
                                
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${goalType === type ? 'border-blue-500' : 'border-gray-600'}`}>
                                    {goalType === type && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                </div>
                            </div>
                            <h3 className={`font-bold ${goalType === type ? 'text-white' : 'text-gray-300'}`}>{type}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Slider de Horas + Datas */}
            <div className="bg-[#0a0a0a] rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-white font-medium">Carga Horária Alvo</h3>
                        <p className="text-sm text-gray-500">Quanto você quer estudar?</p>
                    </div>
                    <div className="text-right">
                        <span className="block text-2xl font-bold text-blue-500">{targetHours}h</span>
                        <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-1 rounded">
                             ≈ {dailyEffort() || '...'}
                        </span>
                    </div>
                </div>

                <input
                    type="range"
                    min="1"
                    max="100"
                    value={targetHours}
                    onChange={(e) => setTargetHours(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-8"
                />

                <div className="h-px bg-gray-800 w-full mb-6"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Data de Início</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-[#151515] border border-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>
                    
                    {goalType === 'Desafio' ? (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Data Limite</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-[#151515] border border-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center border border-dashed border-gray-800 rounded-lg bg-[#151515]/50">
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <ArrowRight className="w-4 h-4" />
                                <span>Meta Recorrente</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4 border-t border-gray-800">
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-4 bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800 font-semibold rounded-xl transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    disabled={loading || !title}
                >
                    {isEditing ? <Save className="w-5 h-5" /> : null}
                    {loading ? 'Salvando...' : (isEditing ? 'Atualizar Meta' : 'Definir Meta')}
                </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NovaMeta;