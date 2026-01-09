/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Filter, Rocket, BookCheck, Edit2, Trash2, BookOpen, Target, BarChart3 } from 'lucide-react'; 

import { dashboardAPI, studySessionAPI, goalsAPI, subjectAPI } from '../services/api';
import Layout from '../components/Layout';
import { getAuthUser } from '../utils/auth';
import SessionDetailsModal from '../components/SessionDetailsModal';

// Componentes Gráficos e Cards
import StudyTimeChart from '../components/charts/StudyTimeChart';
import QuestionsChart from '../components/charts/QuestionsChart';
import StatsGrid from '../components/cards/StatsGrid'; 

function Dashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => getAuthUser());

  // --- ESTADOS DE DADOS ---
  const [stats, setStats] = useState({ totalHours: 0, weeklyHours: 0, completedSessions: 0, activeGoals: 0 });
  const [recentSessions, setRecentSessions] = useState([]); // Apenas as 5 últimas para a lista
  const [allSessions, setAllSessions] = useState([]);       // TUDO (para os gráficos e cálculos)
  const [subjects, setSubjects] = useState([]);
  const [goals, setGoals] = useState([]);

  // --- ESTADOS DE UI ---
  const [selectedSubjectId, setSelectedSubjectId] = useState('all'); 
  const [chartMode, setChartMode] = useState('TIME'); 
  const [viewSession, setViewSession] = useState(null);
  
  // --- CONFIGURAÇÃO DO GRÁFICO ---
  const [chartRange, setChartRange] = useState('7days'); // Padrão

  // --- CARREGAMENTO DE DADOS ---
  const loadDashboardData = useCallback(async (userId) => {
    try {
      // 1. Lê a preferência de período salva (Configurações)
      const savedApp = localStorage.getItem('app_settings');
      if (savedApp) {
          const parsed = JSON.parse(savedApp);
          if (parsed.chartRange) setChartRange(parsed.chartRange);
      }

      // 2. Busca dados na API
      const [statsRes, sessionsRes, goalsRes, subjectsRes] = await Promise.all([
        dashboardAPI.getStats(userId),
        studySessionAPI.getUserSessions(userId), // <--- USA O MÉTODO QUE JÁ EXISTE (Traz tudo)
        goalsAPI.getUserGoals(userId),
        subjectAPI.getUserSubjects(userId)
      ]);

      // 3. Atualiza Estados
      setStats(statsRes.data);
      
      // Armazena TODAS as sessões para permitir filtragem local (30 dias, ano, etc)
      const fullList = sessionsRes.data || [];
      
      // Ordena por data (mais recente primeiro) caso o back não garanta
      fullList.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setAllSessions(fullList); 
      setRecentSessions(fullList.slice(0, 5)); // Pega só as 5 primeiras para o rodapé
      
      setSubjects(subjectsRes.data || []);
      setGoals(goalsRes.data || []); 

    } catch (error) {
      console.error(error);
      toast.error("Ops! Tivemos um problema ao carregar seus dados.");
    }
  }, []);

  useEffect(() => {
    if (user) loadDashboardData(user.userId);

    // Listener para atualizar o gráfico se o usuário mudar a config em outra aba/tela
    const handleStorageChange = () => {
        const savedApp = localStorage.getItem('app_settings');
        if (savedApp) {
            const parsed = JSON.parse(savedApp);
            if (parsed.chartRange) setChartRange(parsed.chartRange);
        }
    };
    window.addEventListener('storage', handleStorageChange);
    // Dispara evento customizado se a mudança for na mesma aba (navegação SPA)
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [user, loadDashboardData]);

  // --- CÁLCULOS (MEMOIZED) ---
  
  // Totais de Questões (Baseado em tudo)
  const questionsStats = useMemo(() => {
    let total = 0;
    let correct = 0;
    allSessions.forEach(session => {
        if (session.totalQuestions) {
            total += session.totalQuestions;
            correct += (session.correctQuestions || 0);
        }
    });
    return { total, correct };
  }, [allSessions]);

  // Cálculo de Streak (Ofensiva)
  const streak = useMemo(() => {
    if (!allSessions || allSessions.length === 0) return 0;
    
    const dailyMinutes = {};
    allSessions.forEach(session => {
        const dateKey = session.date.split('T')[0];
        dailyMinutes[dateKey] = (dailyMinutes[dateKey] || 0) + session.durationMinutes;
    });

    let currentStreak = 0;
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) { 
        // Ajuste para pegar data local YYYY-MM-DD
        const year = checkDate.getFullYear();
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        const minutesStudied = dailyMinutes[dateString] || 0;

        if (minutesStudied >= 1) { // Considera streak se estudou pelo menos 1 min
            currentStreak++;
        } else {
            // Se hoje (i=0) não estudou, não quebra, pois o dia não acabou. 
            // Se for ontem (i>0) e não estudou, quebra.
            if (i > 0) break;
        }
        checkDate.setDate(checkDate.getDate() - 1);
    }
    return currentStreak;
  }, [allSessions]);

  // --- LÓGICA DE FILTRAGEM DO GRÁFICO ---
  const filteredSessionsForChart = useMemo(() => {
      // 1. Filtra por Matéria (se selecionada)
      let sessions = selectedSubjectId === 'all' 
        ? allSessions 
        : allSessions.filter(s => s.subject?.id === Number(selectedSubjectId));

      // 2. Filtra por Data (baseado na Configuração)
      const now = new Date();
      const cutoffDate = new Date(); // Data de corte

      if (chartRange === '7days') cutoffDate.setDate(now.getDate() - 7);
      else if (chartRange === '30days') cutoffDate.setDate(now.getDate() - 30);
      else if (chartRange === '90days') cutoffDate.setDate(now.getDate() - 90);
      else if (chartRange === 'year') cutoffDate.setFullYear(now.getFullYear() - 1);
      
      // Retorna sessões onde a data é maior ou igual ao corte
      return sessions.filter(s => new Date(s.date) >= cutoffDate);
  }, [allSessions, selectedSubjectId, chartRange]);

  const activeColor = useMemo(() => {
    if (selectedSubjectId === 'all') return '#3b82f6';
    const sub = subjects.find(s => s.id === Number(selectedSubjectId));
    return sub ? sub.color : '#3b82f6';
  }, [selectedSubjectId, subjects]);

  // Texto para exibir no gráfico
  const getChartTitle = () => {
      const titles = {
          '7days': '7 dias',
          '30days': '30 dias',
          '90days': '3 meses',
          'year': '1 ano'
      };
      return titles[chartRange] || '7 dias';
  };

  // --- AÇÕES (EDITAR/EXCLUIR) ---
  const handleEditSubject = (s) => navigate('/nova-materia', { state: { subjectToEdit: s } });
  
  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta matéria?")) return;
    try {
        await subjectAPI.deleteSubject(id);
        setSubjects(prev => prev.filter(sub => sub.id !== id));
        toast.success("Matéria excluída!");
    } catch (error) {
        toast.error("Erro ao excluir matéria.");
    }
  };

  const handleEditGoal = (g) => navigate('/nova-meta', { state: { goalToEdit: g } });
  
  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta meta?")) return;
    try {
        await goalsAPI.deleteGoal(id);
        setGoals(prev => prev.filter(g => g.id !== id));
        toast.success("Meta excluída!");
    } catch (error) {
        toast.error("Erro ao excluir meta.");
    }
  };
  
  const handleEditSession = (s) => navigate('/nova-sessao', { state: { sessionToEdit: s } });
  
  const handleDeleteSession = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta sessão?")) return;
    try {
        await studySessionAPI.deleteSession(id, user.userId); // Passando userId corrigido
        loadDashboardData(user.userId); 
        toast.success("Sessão excluída.");
    } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir sessão.");
    }
  };

  const formatDate = (dateString) => {
    if(!dateString) return "--/--";
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-400 mx-auto space-y-6 animate-in fade-in duration-500">
        
        {/* 1. CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-text">Visão Geral</h1>
                <p className="text-text-muted text-sm">Bem-vindo, {user.name.split(' ')[0]}.</p>
            </div>
            <button 
                onClick={() => navigate('/nova-sessao')}
                className="bg-blue-600 hover:bg-blue-700 text-text px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 text-sm transform hover:-translate-y-0.5"
            >
                <Plus className="w-4 h-4" /> Registrar Novo
            </button>
        </div>

        {/* 2. GRID DE ESTATÍSTICAS COM STREAK */}
        <StatsGrid 
            stats={stats} 
            questionsStats={questionsStats} 
            streak={streak} 
        />

        {/* 3. ÁREA DE GRÁFICOS */}
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface p-2 rounded-xl border border-border shadow-sm transition-colors">
                
                {/* Botões de Alternância (Tempo / Questões) */}
                <div className="flex p-1 bg-background rounded-lg border border-border">
                    <button
                        onClick={() => setChartMode('TIME')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${chartMode === 'TIME' ? 'bg-blue-600 text-text shadow-md' : 'text-text-muted hover:text-text'}`}
                    >
                        Tempo
                    </button>
                    <button
                        onClick={() => setChartMode('QUESTIONS')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${chartMode === 'QUESTIONS' ? 'bg-emerald-600 text-text shadow-md' : 'text-text-muted hover:text-text'}`}
                    >
                        Questões
                    </button>
                </div>

                {/* Info do Período + Filtro de Matéria */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted bg-background px-3 py-1.5 rounded-lg border border-border">
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Período: <strong className="text-text">{getChartTitle()}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 px-2 relative">
                        <Filter className="w-4 h-4 text-text-muted" />
                        <select 
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                            className="bg-background border border-border text-text text-xs rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 cursor-pointer pr-8 appearance-none"
                        >
                            <option value="all">Todas as Matérias</option>
                            {subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                        {/* Ícone seta manual para garantir visual em todos browsers */}
                        <div className="absolute inset-y-0 right-2 flex items-center px-2 pointer-events-none text-text-muted">
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Renderização Condicional dos Gráficos */}
            <div className="animate-in fade-in zoom-in duration-300">
                {chartMode === 'TIME' ? (
                    <StudyTimeChart 
                        sessions={filteredSessionsForChart} 
                        activeColor={activeColor} 
                        rangeLabel={getChartTitle()} 
                        range={chartRange} // <--- ADICIONE ESTA LINHA
                    />
                ) : (
                    <QuestionsChart 
                        sessions={filteredSessionsForChart} 
                        rangeLabel={getChartTitle()} 
                    />
                )}
            </div>
        </div>

        {/* 4. RODAPÉ (Listas: Metas, Matérias, Recentes) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Coluna Metas */}
            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col h-100 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text-muted text-xs uppercase tracking-wider">Metas Ativas</h3>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {goals.length > 0 ? (
                        goals.filter(g => g.active).map((goal) => (
                            <div key={goal.id} className="p-4 bg-background border border-border rounded-xl hover:border-text-muted/30 transition-colors group">
                                <div className="flex justify-between items-start mb-3 gap-3">
                                    <h4 className="font-bold text-text text-sm truncate flex-1" title={goal.title}>{goal.title}</h4>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                            {goal.goalType}
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={(e) => { e.stopPropagation(); handleEditGoal(goal); }} className="p-1 bg-surface border border-border rounded text-text-muted hover:bg-blue-600 hover:text-white transition-colors"><Edit2 className="w-3 h-3" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteGoal(goal.id); }} className="p-1 bg-surface border border-border rounded text-text-muted hover:bg-red-600 hover:text-white transition-colors"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                        <Target className="w-3 h-3" />
                                        <span><span className="text-text font-bold">{goal.currentHours || 0}h</span> / {goal.targetHours}h</span>
                                    </div>
                                </div>
                                <div className="w-full bg-surface-hover border border-border h-2 rounded-full mt-3 overflow-hidden">
                                    <div className={`h-full transition-all duration-1000 rounded-full ${(goal.progressPercentage || 0) >= 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${goal.progressPercentage || 0}%` }}></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState icon={Rocket} text="Nenhuma meta ativa." description="Crie uma meta para começar!" link="/nova-meta" linkText="Criar Meta" />
                    )}
                </div>
            </div>

            {/* Coluna Matérias */}
            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col h-100 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text-muted text-xs uppercase tracking-wider">Matérias</h3>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {subjects.length > 0 ? (
                        subjects.map((subject) => (
                            <div key={subject.id} className="p-3 bg-background border border-border rounded-xl hover:border-text-muted/30 transition-colors relative group">
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                                    <button onClick={(e) => { e.stopPropagation(); handleEditSubject(subject); }} className="p-1.5 bg-surface border border-border rounded-lg text-text-muted hover:bg-blue-600 hover:text-white"><Edit2 className="w-3 h-3" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subject.id); }} className="p-1.5 bg-surface border border-border rounded-lg text-text-muted hover:bg-red-600 hover:text-white"><Trash2 className="w-3 h-3" /></button>
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-3 h-3 rounded-full shadow-sm ring-2 ring-background" style={{ backgroundColor: subject.color }}></div>
                                    <h4 className="font-bold text-text text-sm group-hover:text-blue-500 transition-colors">{subject.name}</h4>
                                </div>
                                <div className="flex flex-wrap gap-1.5 pl-6">
                                    {subject.matters?.slice(0, 3).map((m, i) => (
                                        <span key={i} className="text-[10px] px-2 py-0.5 rounded border border-border bg-surface-hover text-text-muted font-medium">{m}</span>
                                    ))}
                                    {(subject.matters?.length || 0) > 3 && (
                                        <span className="text-[10px] text-text-muted">+{subject.matters.length - 3}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState icon={BookOpen} text="Nenhuma matéria." description="Cadastre matérias para organizar." link="/nova-materia" linkText="Nova Matéria" />
                    )}
                </div>
            </div>

            {/* Coluna Recentes */}
            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col h-100 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text-muted text-xs uppercase tracking-wider">Recentes</h3>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {recentSessions.length > 0 ? (
                        recentSessions.map((session) => (
                            <div key={session.id} onClick={() => setViewSession(session)} className="p-3 bg-background border border-border rounded-xl hover:border-text-muted/30 transition-colors group cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-text text-xs shadow-sm shrink-0" style={{ backgroundColor: session.subject?.color || '#333' }}>
                                            {session.subject?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-text truncate" title={session.title}>{session.title || session.subject?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2">
                                        <button onClick={(e) => { e.stopPropagation(); handleEditSession(session); }} className="p-1.5 bg-surface border border-border rounded-lg text-text-muted hover:bg-blue-600 hover:text-white"><Edit2 className="w-3 h-3" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }} className="p-1.5 bg-surface border border-border rounded-lg text-text-muted hover:bg-red-600 hover:text-white"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end pl-11">
                                    <div className="flex flex-wrap gap-1">
                                        {session.matters?.slice(0, 2).map((m, i) => (
                                            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded border border-border bg-surface-hover text-text-muted font-medium">{m}</span>
                                        ))}
                                    </div>
                                    <div className="text-right shrink-0 leading-tight">
                                        <p className="text-sm font-bold text-text">{session.durationMinutes}m</p>
                                        <p className="text-[10px] text-text-muted">{formatDate(session.date)}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState icon={BookCheck} text="Sem sessões." description="Registre o que estudou hoje!" link="/nova-sessao" linkText="Registrar" />
                    )}
                </div>
            </div>
        </div>

        {/* MODAL DE DETALHES */}
        <SessionDetailsModal 
            isOpen={!!viewSession} 
            onClose={() => setViewSession(null)} 
            session={viewSession} 
        />

      </div>
    </Layout>
  );
}

// Componente Reutilizável de Estado Vazio
const EmptyState = ({ icon: Icon, text, description, link, linkText }) => (
    <div className="h-full flex flex-col items-center justify-center text-center text-text-muted space-y-3 px-4 py-8">
        <div className="p-3 bg-surface border border-border rounded-full mb-1">
            <Icon className="w-6 h-6 text-text-muted" />
        </div>
        <div>
            <p className="text-sm font-semibold text-text-muted">{text}</p>
            {description && <p className="text-xs text-text-muted/70 mt-1">{description}</p>}
        </div>
        {link && (
            <button onClick={() => window.location.href = link} className="text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors cursor-pointer">
                {linkText}
            </button>
        )}
    </div>
);

export default Dashboard;