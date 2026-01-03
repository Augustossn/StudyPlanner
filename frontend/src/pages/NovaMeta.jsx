import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Adicionado useLocation
import toast from 'react-hot-toast'; 
import Layout from '../components/Layout';
import { goalsAPI } from '../services/api';
import { getErrorMessage } from '../utils/errorHandler'; 
import { Calendar, Clock, Target, ArrowRight, TrendingUp, Save } from 'lucide-react';
import { getAuthUser } from '../utils/auth';

const NovaMeta = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook para pegar os dados enviados
  const [user] = useState(() => getAuthUser());

  // Verifica se estamos em modo de edição
  const goalToEdit = location.state?.goalToEdit;
  const isEditing = !!goalToEdit;

  // Função auxiliar para formatar data (YYYY-MM-DD) para o input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  // Inicializa os estados: Se for edição, usa os dados existentes; senão, usa padrão
  const [title, setTitle] = useState(goalToEdit?.title || '');
  const [goalType, setGoalType] = useState(goalToEdit?.goalType || 'Semanal');
  const [targetHours, setTargetHours] = useState(goalToEdit?.targetHours || 10);
  
  // Datas precisam de cuidado extra para formatar corretamente no input type="date"
  const [startDate, setStartDate] = useState(
    goalToEdit?.startDate ? formatDateForInput(goalToEdit.startDate) : new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    goalToEdit?.endDate ? formatDateForInput(goalToEdit.endDate) : ''
  );
  
  const [loading, setLoading] = useState(false);

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!user.userId) {
        navigate('/');
    }
  }, [user.userId, navigate]);

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
        active: true, // Mantém ativo ao editar
        user: { id: user.userId }
      };

      if (isEditing) {
        // --- MODO EDIÇÃO (PUT) ---
        await goalsAPI.updateGoal(goalToEdit.id, payload);
        toast.success('Meta atualizada com sucesso! 🎯');
      } else {
        // --- MODO CRIAÇÃO (POST) ---
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
            {isEditing ? 'Ajuste seus objetivos conforme necessário.' : 'Escolha onde você quer chegar. O StudyPlanner te ajuda a monitorar.'}
        </p>
        
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. O Objetivo */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Qual é o seu objetivo?</label>
              <div className="relative">
                <Target className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Dominar Spring Boot até o fim do mês"
                    className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                    required
                    autoFocus={!isEditing}
                />
              </div>
            </div>

            {/* 2. Tipo de Meta (Cards Grandes) */}
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
                            <p className="text-xs text-gray-500 mt-1">
                                {type === 'Semanal' && 'Renova toda segunda-feira.'}
                                {type === 'Mensal' && 'Foco de longo prazo.'}
                                {type === 'Desafio' && 'Data de início e fim fixas.'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Slider de Horas + Datas */}
            <div className="bg-[#0a0a0a] rounded-xl p-6 border border-gray-800">
                
                {/* Cabeçalho do Card */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-white font-medium">Carga Horária</h3>
                        <p className="text-sm text-gray-500">Quanto você vai estudar?</p>
                    </div>
                    {/* Badge de Esforço Diário */}
                    <div className="text-right">
                        <span className="block text-2xl font-bold text-blue-500">{targetHours}h</span>
                        <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-1 rounded">
                             ≈ {dailyEffort() || '...'}
                        </span>
                    </div>
                </div>

                {/* Slider */}
                <input
                    type="range"
                    min="1"
                    max="100"
                    value={targetHours}
                    onChange={(e) => setTargetHours(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-8"
                />

                <div className="h-px bg-gray-800 w-full mb-6"></div>

                {/* Datas */}
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

            {/* Botões de Ação */}
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
                    className="flex-1 py-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
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