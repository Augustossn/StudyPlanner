import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Target,
  Plus,
  ArrowRight,
  Activity,
  Layers,
  Calendar
} from 'lucide-react';
import { dashboardAPI, studySessionAPI, goalsAPI, subjectAPI } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';

function Dashboard() {
  const navigate = useNavigate();

  const [user] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [stats, setStats] = useState({ totalHours: 0, weeklyHours: 0, completedSessions: 0, activeGoals: 0 });
  const [recentSessions, setRecentSessions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [goals, setGoals] = useState([]);

  const loadDashboardData = useCallback(async (userId) => {
    try {
      const [statsRes, sessionsRes, goalsRes, subjectsRes] = await Promise.all([
        dashboardAPI.getStats(userId),
        studySessionAPI.getRecentSessions(userId),
        goalsAPI.getUserGoals(userId),
        subjectAPI.getUserSubjects(userId)
      ]);

      setStats(statsRes.data);
      setRecentSessions(sessionsRes.data.slice(0, 5));
      setSubjects(subjectsRes.data || []);
      setGoals(goalsRes.data || []); 

      const sessions = sessionsRes.data;
      const last7Days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' });
        
        const totalMinutes = sessions
          .filter(s => s.date.startsWith(dateStr)) 
          .reduce((sum, s) => sum + s.durationMinutes, 0);
        
        last7Days.push({
          day: dayName,
          hours: Number((totalMinutes / 60).toFixed(1)),
        });
      }
      setChartData(last7Days);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, []);

  useEffect(() => {
    if (user) loadDashboardData(user.userId);
  }, [user, loadDashboardData]);

  const formatDate = (dateString) => {
    if(!dateString) return "--/--";
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* === 1. CABEÇALHO === */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
                <p className="text-gray-400 text-sm">Bem-vindo, {user.name.split(' ')[0]}.</p>
            </div>
            
            <button 
                onClick={() => navigate('/nova-sessao')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 text-sm"
            >
                <Plus className="w-4 h-4" />
                Registrar Novo
            </button>
        </div>

        {/* === 2. CARDS DE ESTATÍSTICAS === */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Horas" value={stats.totalHours} icon={Clock} color="text-blue-500" bg="bg-blue-500/10" />
            <StatCard label="Semana" value={stats.weeklyHours} icon={TrendingUp} color="text-orange-500" bg="bg-orange-500/10" />
            <StatCard label="Sessões" value={stats.completedSessions} icon={BookOpen} color="text-green-500" bg="bg-green-500/10" />
            <StatCard label="Metas" value={stats.activeGoals} icon={Target} color="text-purple-500" bg="bg-purple-500/10" />
        </div>

        {/* === 3. GRÁFICO === */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Ritmo de Estudos (7 dias)
                </h3>
            </div>
            
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="day" stroke="#666" axisLine={false} tickLine={false} dy={10} tick={{fontSize: 12}} />
                        <YAxis stroke="#666" axisLine={false} tickLine={false} dx={-10} tick={{fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="hours" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorHours)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* === 4. RODAPÉ (DIVIDIDO EM 3 COLUNAS) === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUNA 1: METAS ATIVAS (AGORA DINÂMICA) */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Metas Ativas</h3>
                    <button onClick={() => navigate('/nova-meta')} className="p-1 hover:bg-white/5 rounded transition-colors" title="Nova Meta">
                        <Plus className="w-4 h-4 text-gray-500 hover:text-white" />
                    </button>
                </div>
                
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {goals.length > 0 ? (
                        goals.filter(g => g.active).map((goal) => (
                            <div key={goal.id} className="p-4 bg-[#0a0a0a] border border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-white text-sm truncate pr-2">{goal.title}</h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                        goal.goalType === 'Semanal' ? 'bg-blue-500/10 text-blue-500' :
                                        goal.goalType === 'Mensal' ? 'bg-purple-500/10 text-purple-500' :
                                        'bg-orange-500/10 text-orange-500'
                                    }`}>
                                        {goal.goalType}
                                    </span>
                                </div>
                                
                                <div className="flex items-end justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <Target className="w-3 h-3" />
                                        {/* MOSTRANDO HORAS REAIS (ex: 5h / 10h) */}
                                        <span>
                                            <span className="text-white font-bold">{goal.currentHours || 0}h</span>
                                            <span className="mx-1">/</span>
                                            {goal.targetHours}h
                                        </span>
                                    </div>
                                    
                                    {goal.endDate && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(goal.endDate)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* BARRA DE PROGRESSO REAL */}
                                <div className="w-full bg-gray-800 h-2 rounded-full mt-3 overflow-hidden relative">
                                    <div 
                                        className={`h-full transition-all duration-1000 ease-out rounded-full ${
                                            (goal.progressPercentage || 0) >= 100 ? 'bg-green-500' : 'bg-blue-600'
                                        }`}
                                        style={{ width: `${goal.progressPercentage || 0}%` }}
                                    ></div>
                                </div>
                                
                                {/* PORCENTAGEM (Texto abaixo da barra) */}
                                <div className="text-right mt-1">
                                    <span className="text-[10px] text-gray-500">{goal.progressPercentage || 0}% concluído</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-2">
                            <Target className="w-8 h-8 opacity-20" />
                            <p className="text-sm">Nenhuma meta ativa.</p>
                            <button onClick={() => navigate('/nova-meta')} className="text-xs text-blue-500 hover:underline">
                                Definir objetivo
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* COLUNA 2: MATÉRIAS CADASTRADAS */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Matérias</h3>
                    <button onClick={() => navigate('/nova-materia')} className="p-1 hover:bg-white/5 rounded transition-colors" title="Adicionar Matéria">
                        <Plus className="w-4 h-4 text-gray-500 hover:text-white" />
                    </button>
                </div>
                
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {subjects.length > 0 ? (
                        subjects.map((subject) => (
                            <div key={subject.id} className="p-3 bg-[#0a0a0a] border border-gray-800 rounded-xl hover:border-gray-700 transition-colors group">
                                <div className="flex items-center gap-3 mb-2">
                                    <div 
                                        className="w-3 h-3 rounded-full shadow-sm shadow-black/50"
                                        style={{ backgroundColor: subject.color }}
                                    ></div>
                                    <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                                        {subject.name}
                                    </h4>
                                </div>

                                <div className="flex flex-wrap gap-1.5 pl-6">
                                    {subject.subSubjects && subject.subSubjects.length > 0 ? (
                                        subject.subSubjects.map((sub, idx) => (
                                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded border border-gray-700 bg-gray-800 text-gray-400 select-none">
                                                {sub}
                                            </span>
                                        ))
                                    ) : (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-600 italic">
                                            <Layers className="w-3 h-3" />
                                            Sem submatérias
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-2">
                            <BookOpen className="w-8 h-8 opacity-20" />
                            <p className="text-sm">Nenhuma matéria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* COLUNA 3: SESSÕES RECENTES */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Sessões Recentes</h3>
                    <button className="text-xs text-blue-500 hover:text-blue-400">Ver todas</button>
                </div>
                
                <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                    {recentSessions.length > 0 ? (
                    recentSessions.map((session) => (
                        <div key={session.id} className="flex items-start gap-3 py-3 px-2 hover:bg-white/5 rounded-xl transition-colors">
                            <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0 mt-1"
                                style={{ backgroundColor: session.subject?.color || '#333' }}
                            >
                                {session.subject?.name?.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {session.title || session.subject?.name}
                                </p>
                                
                                {session.subSubjects && session.subSubjects.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {session.subSubjects.slice(0, 2).map((sub, idx) => (
                                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded border border-gray-700 bg-gray-800/50 text-gray-400">
                                                {sub}
                                            </span>
                                        ))}
                                        {session.subSubjects.length > 2 && <span className="text-[9px] text-gray-500">...</span>}
                                    </div>
                                )}
                            </div>

                            <div className="text-right shrink-0">
                                <p className="text-sm font-bold text-white">{session.durationMinutes}m</p>
                                <p className="text-[10px] text-gray-500">{formatDate(session.date)}</p>
                            </div>
                        </div>
                    ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 text-sm">
                            Nenhuma sessão.
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </Layout>
  );
}

// === COMPONENTES VISUAIS ===

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-all h-[120px]">
        <div className="flex justify-between items-start">
            <h4 className="text-3xl font-bold text-white tracking-tight">{value}</h4>
            <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
        </div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
    </div>
);

export default Dashboard;