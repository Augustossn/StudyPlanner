import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import Layout from '../components/Layout';
import { goalsAPI, subjectAPI } from '../services/api'; 
import { 
  Calendar, Clock, Target, ArrowRight, TrendingUp, Save, Layers, Tag, ArrowLeft, 
  HelpCircle, Calculator 
} from 'lucide-react';
import { getAuthUser } from '../utils/auth';

const NovaMeta = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(() => getAuthUser());

  // Verifica se estamos em modo de edição
  const goalToEdit = location.state?.goalToEdit;
  const isEditing = !!goalToEdit;

  // Função para pegar a data atual em YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // --- LÓGICA INICIAL DO TIPO DE MÉTRICA ---
  const getInitialMetricType = () => {
      if (!goalToEdit) return 'TIME';
      const hasTime = goalToEdit.targetHours > 0;
      const hasQuestions = goalToEdit.targetQuestions > 0; 
      
      if (hasTime && hasQuestions) return 'BOTH';
      if (hasQuestions) return 'QUESTIONS';
      return 'TIME';
  };

  // --- ESTADOS ---
  const [title, setTitle] = useState(goalToEdit?.title || '');
  const [metricType, setMetricType] = useState(getInitialMetricType); // TIME, QUESTIONS, BOTH
  
  // Matéria Principal
  const [subjectId, setSubjectId] = useState(goalToEdit?.subject?.id || '');
  const [subjects, setSubjects] = useState([]); 
  
  // Submatéria
  const [matters, setMatters] = useState(goalToEdit?.matters || '');
  const [availableMatters, setAvailableMatters] = useState([]); 

  const [goalType, setGoalType] = useState(goalToEdit?.goalType || 'Semanal'); // Frequência
  
  // Metas (Alvos)
  const [targetHours, setTargetHours] = useState(goalToEdit?.targetHours || 10);
  const [targetQuestions, setTargetQuestions] = useState(goalToEdit?.targetQuestions || 50);
  
  // Datas
  const [startDate, setStartDate] = useState(
    goalToEdit?.startDate || getTodayString()
  );
  const [endDate, setEndDate] = useState(
    goalToEdit?.endDate || ''
  );
  
  const [loading, setLoading] = useState(false);

  // --- EFEITOS ---
  useEffect(() => {
    if (!user.userId) navigate('/');
  }, [user.userId, navigate]);

  useEffect(() => {
    if (user.userId) {
      subjectAPI.getUserSubjects(user.userId)
        .then(res => {
          const loadedSubjects = res.data || [];
          setSubjects(loadedSubjects);

          if (goalToEdit?.subject?.id) {
             const selected = loadedSubjects.find(s => s.id === goalToEdit.subject.id);
             if (selected && selected.matters) {
                 setAvailableMatters(selected.matters);
             }
          }
        })
        .catch(err => {
            console.error(err);
            toast.error("Erro ao carregar matérias");
        });
    }
  }, [user.userId, goalToEdit]);

  const handleSubjectChange = (e) => {
      const newId = e.target.value;
      setSubjectId(newId);
      setMatters(''); 
      
      const selected = subjects.find(s => s.id === Number(newId));
      if (selected && selected.matters) {
          setAvailableMatters(selected.matters);
      } else {
          setAvailableMatters([]);
      }
  };

  const dailyEffort = () => {
    let text = [];
    
    // Cálculo Horas
    if (metricType !== 'QUESTIONS' && targetHours > 0) {
        let dailyH = 0;
        if (goalType === 'Semanal') dailyH = targetHours / 7;
        else if (goalType === 'Mensal') dailyH = targetHours / 30;
        else if (goalType === 'Desafio' && startDate && endDate) {
            const diff = Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (86400000));
            if (diff > 0) dailyH = targetHours / diff;
        }
        if (dailyH > 0) text.push(`${dailyH.toFixed(1)}h/dia`);
    }

    // Cálculo Questões
    if (metricType !== 'TIME' && targetQuestions > 0) {
        let dailyQ = 0;
        if (goalType === 'Semanal') dailyQ = targetQuestions / 7;
        else if (goalType === 'Mensal') dailyQ = targetQuestions / 30;
        else if (goalType === 'Desafio' && startDate && endDate) {
            const diff = Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (86400000));
            if (diff > 0) dailyQ = targetQuestions / diff;
        }
        if (dailyQ > 0) text.push(`${Math.ceil(dailyQ)} quest/dia`);
    }

    return text.join(' + ') || '...';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // CORREÇÃO AQUI: Enviamos 0 em vez de null para não quebrar o banco de dados
    const finalHours = (metricType === 'QUESTIONS') ? 0 : Number(targetHours);
    const finalQuestions = (metricType === 'TIME') ? 0 : Number(targetQuestions);

    try {
      const payload = {
        title,
        goalType,
        targetHours: finalHours,
        targetQuestions: finalQuestions,
        startDate, 
        endDate: endDate || null,
        active: true,
        user: { id: user.userId },
        subject: subjectId ? { id: Number(subjectId) } : null,
        matters: matters || null
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
      console.error("Erro ao salvar meta:", err);
      if (err.response && err.response.status === 400 && err.response.data) {
          const data = err.response.data;
          // Se o backend retornar um objeto de erro complexo ou string
          if (typeof data === 'object' && data.error) {
             // Caso seja erro de constraint do banco
             toast.error("Erro nos dados: Verifique se preencheu tudo corretamente.");
          } else if (typeof data === 'object' && !Array.isArray(data)) {
              const firstErrorKey = Object.keys(data)[0];
              toast.error(data[firstErrorKey]);
          } else {
              toast.error(data.message || "Verifique os dados.");
          }
      } else {
          toast.error("Não foi possível salvar a meta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pb-20">
        <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-text-muted hover:text-text mb-6 transition-colors"
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Dashboard
        </button>

        <h1 className="text-3xl font-bold text-text mb-2">
            {isEditing ? 'Editar Meta' : 'Definir Nova Meta'}
        </h1>
        <p className="text-text-muted mb-8">
            Defina seus objetivos de tempo ou quantidade de exercícios.
        </p>
        
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 0. SELEÇÃO DO TIPO DE MÉTRICA */}
            <div>
                <label className="block text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">
                    O que você quer alcançar?
                </label>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => setMetricType('TIME')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                            metricType === 'TIME' 
                            ? 'bg-blue-600/10 border-blue-500 text-blue-500 shadow-sm' 
                            : 'bg-background border-border text-text-muted hover:bg-surface-hover hover:border-text-muted'
                        }`}
                    >
                        <Clock className="w-6 h-6 mb-2" />
                        <span className="text-xs font-bold uppercase">Tempo</span>
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => setMetricType('QUESTIONS')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                            metricType === 'QUESTIONS' 
                            ? 'bg-emerald-600/10 border-emerald-500 text-emerald-500 shadow-sm' 
                            : 'bg-background border-border text-text-muted hover:bg-surface-hover hover:border-text-muted'
                        }`}
                    >
                        <HelpCircle className="w-6 h-6 mb-2" />
                        <span className="text-xs font-bold uppercase">Questões</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMetricType('BOTH')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                            metricType === 'BOTH' 
                            ? 'bg-purple-600/10 border-purple-500 text-purple-500 shadow-sm' 
                            : 'bg-background border-border text-text-muted hover:bg-surface-hover hover:border-text-muted'
                        }`}
                    >
                        <Calculator className="w-6 h-6 mb-2" />
                        <span className="text-xs font-bold uppercase">Ambos</span>
                    </button>
                </div>
            </div>

            {/* 1. Título da Meta */}
            <div>
              <label className="block text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">Nome da Meta</label>
              <div className="relative">
                <Target className="absolute left-4 top-4 w-5 h-5 text-text-muted" />
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={metricType === 'QUESTIONS' ? "Ex: Resolver 100 questões de Java" : "Ex: Dominar Spring Boot"}
                    className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl text-text text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-500"
                    required
                    autoFocus={!isEditing}
                />
              </div>
            </div>

            {/* 2. Vincular Matéria */}
            <div>
                <label className="block text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">
                    Vincular a uma Matéria (Opcional)
                </label>
                <div className="relative">
                    <Layers className="absolute left-4 top-4 w-5 h-5 text-text-muted pointer-events-none" />
                    <select
                        value={subjectId}
                        onChange={handleSubjectChange}
                        className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl text-text text-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-surface text-text">Geral (Sem vínculo específico)</option>
                        {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id} className="bg-surface text-text">
                                {subject.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-text-muted">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                </div>
                
                {/* Submatéria */}
                {availableMatters.length > 0 && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-bold text-text-muted mb-3 uppercase tracking-wider ml-1">
                             Especificar Assunto
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-4 w-5 h-5 text-text-muted pointer-events-none" />
                            <select
                                value={matters}
                                onChange={(e) => setMatters(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl text-text text-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-surface text-text">Qualquer assunto da matéria</option>
                                {availableMatters.map((m, index) => (
                                    <option key={index} value={m} className="bg-surface text-text">{m}</option>
                                ))}
                            </select>
                             <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-text-muted">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Frequência */}
            <div>
                <label className="block text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">Frequência</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Semanal', 'Mensal', 'Desafio'].map((type) => (
                        <div
                            key={type}
                            onClick={() => setGoalType(type)}
                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                                goalType === type 
                                ? 'bg-blue-600/10 border-blue-500' 
                                : 'bg-background border-border hover:border-text-muted'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                {type === 'Semanal' && <Clock className={`w-6 h-6 ${goalType === type ? 'text-blue-500' : 'text-text-muted'}`} />}
                                {type === 'Mensal' && <Calendar className={`w-6 h-6 ${goalType === type ? 'text-blue-500' : 'text-text-muted'}`} />}
                                {type === 'Desafio' && <TrendingUp className={`w-6 h-6 ${goalType === type ? 'text-blue-500' : 'text-text-muted'}`} />}
                                
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${goalType === type ? 'border-blue-500' : 'border-gray-500'}`}>
                                    {goalType === type && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                </div>
                            </div>
                            <h3 className={`font-bold ${goalType === type ? 'text-text' : 'text-text-muted'}`}>{type}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. DEFINIÇÃO DOS ALVOS (Horas / Questões) */}
            <div className="bg-background rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-text font-medium">Metas do Objetivo</h3>
                        <p className="text-sm text-text-muted">Defina seus alvos para este ciclo.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-mono text-text-muted bg-surface px-2 py-1 rounded border border-border">
                             ≈ {dailyEffort()}
                        </span>
                    </div>
                </div>

                {/* SLIDER DE HORAS */}
                {(metricType === 'TIME' || metricType === 'BOTH') && (
                    <div className="mb-8 animate-in fade-in slide-in-from-left-4">
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-blue-500 uppercase">Horas Alvo</label>
                            <span className="text-sm font-bold text-text">{targetHours}h</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={targetHours}
                            onChange={(e) => setTargetHours(Number(e.target.value))}
                            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-blue-500 border border-border"
                        />
                    </div>
                )}

                {/* INPUT DE QUESTÕES */}
                {(metricType === 'QUESTIONS' || metricType === 'BOTH') && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <label className="text-xs font-bold text-emerald-500 uppercase mb-2 block">Questões Alvo</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="1"
                                value={targetQuestions}
                                onChange={(e) => setTargetQuestions(Number(e.target.value))}
                                className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-text font-bold text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-500"
                            />
                            <HelpCircle className="absolute left-4 top-3.5 w-6 h-6 text-emerald-500 pointer-events-none" />
                        </div>
                    </div>
                )}

                <div className="h-px bg-border w-full my-6"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-2">Data de Início</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-surface border border-border text-text rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>
                    
                    {goalType === 'Desafio' ? (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            <label className="block text-xs font-bold text-text-muted uppercase mb-2">Data Limite</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-surface border border-border text-text rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center border border-dashed border-border rounded-lg bg-surface/50">
                            <div className="flex items-center gap-2 text-text-muted text-sm">
                                <ArrowRight className="w-4 h-4" />
                                <span>Meta Recorrente</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4 border-t border-border">
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-4 bg-transparent border border-border text-text-muted hover:bg-background hover:text-text font-semibold rounded-xl transition-all cursor-pointer"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex-1 py-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading || !title}
                >
                    {isEditing ? <Save className="w-5 h-5" /> : null}
                    {loading ? 'Salvando...' : (isEditing ? 'Atualizar meta' : 'Definir meta')}
                </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NovaMeta;