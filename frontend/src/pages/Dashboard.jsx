import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Target,
  Plus,
  ArrowRight,
  Zap,
  Activity
} from 'lucide-react';
import { dashboardAPI, studySessionAPI, goalsAPI } from '../services/api';
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

  const loadDashboardData = useCallback(async (userId) => {
    try {
      const [statsRes, sessionsRes, goalsRes] = await Promise.all([
        dashboardAPI.getStats(userId),
        studySessionAPI.getRecentSessions(userId),
        goalsAPI.getUserGoals(userId)
      ]);

      setStats(statsRes.data);
      setRecentSessions(sessionsRes.data.slice(0, 5)); 

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
            
            {/* VOLTOU PARA AZUL (Blue) */}
            <button 
                onClick={() => navigate('/nova-sessao')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 text-sm"
            >
                <Plus className="w-4 h-4" />
                Registrar Novo
            </button>
        </div>

        {/* === 2. CARDS DE ESTATÍSTICAS (Cores Originais) === */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Horas: Azul */}
            <StatCard label="Total Horas" value={stats.totalHours} icon={Clock} color="text-blue-500" bg="bg-blue-500/10" />
            {/* Semana: Laranja */}
            <StatCard label="Semana" value={stats.weeklyHours} icon={TrendingUp} color="text-orange-500" bg="bg-orange-500/10" />
            {/* Sessões: Verde */}
            <StatCard label="Sessões" value={stats.completedSessions} icon={BookOpen} color="text-green-500" bg="bg-green-500/10" />
            {/* Metas: Roxo */}
            <StatCard label="Metas" value={stats.activeGoals} icon={Target} color="text-purple-500" bg="bg-purple-500/10" />
        </div>

        {/* === 3. GRÁFICO (Voltou para Azul) === */}
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
                            {/* Gradiente Azul (#3b82f6) */}
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

        {/* === 4. RODAPÉ === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Ações Rápidas */}
            <div className="lg:col-span-1 bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 flex flex-col">
                <h3 className="font-bold text-gray-400 text-xs uppercase mb-4 tracking-wider">Ações</h3>
                <div className="space-y-3 flex-1">
                    <QuickAction 
                        icon={Target} label="Nova Meta" 
                        onClick={() => navigate('/nova-meta')} 
                        color="text-orange-500" bg="bg-orange-500/10"
                    />
                    <QuickAction 
                        icon={BookOpen} label="Criar Matéria" 
                        onClick={() => navigate('/nova-materia')} 
                        color="text-green-500" bg="bg-green-500/10"
                    />
                    <QuickAction 
                        icon={Zap} label="Configurações" 
                        onClick={() => navigate('/settings')} 
                        color="text-purple-500" bg="bg-purple-500/10"
                    />
                </div>
            </div>

            {/* Histórico Recente */}
            <div className="lg:col-span-2 bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-sm">Histórico Recente</h3>
                    <button className="text-xs text-blue-500 hover:text-blue-400">Ver todos</button>
                </div>
                
                <div className="space-y-1">
                    {recentSessions.length > 0 ? (
                    recentSessions.map((session) => (
                        <div key={session.id} className="flex items-start gap-4 py-3 px-3 hover:bg-white/5 rounded-xl transition-colors">
                            
                            {/* Ícone da Matéria */}
                            <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm shrink-0 mt-1"
                                style={{ backgroundColor: session.subject?.color || '#333' }}
                            >
                                {session.subject?.name?.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                {/* Título e Matéria */}
                                <p className="text-sm font-semibold text-white truncate">
                                    {session.title || session.subject?.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate mb-1.5">
                                    {session.subject?.name || "Sem Matéria"}
                                </p>

                                {/* --- AQUI ESTÁ A MELHORIA: Mostrar as Tags --- */}
                                {session.subSubjects && session.subSubjects.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {session.subSubjects.slice(0, 3).map((sub, idx) => (
                                            <span 
                                                key={idx} 
                                                className="text-[10px] px-2 py-0.5 rounded border border-gray-700 bg-gray-800/50 text-gray-300"
                                            >
                                                {sub}
                                            </span>
                                        ))}
                                        {/* Se tiver mais de 3, mostra "+2" */}
                                        {session.subSubjects.length > 3 && (
                                            <span className="text-[10px] px-1.5 py-0.5 text-gray-500">
                                                +{session.subSubjects.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Tempo e Data */}
                            <div className="text-right shrink-0">
                                <p className="text-sm font-bold text-white">{session.durationMinutes}m</p>
                                <p className="text-xs text-gray-500">{formatDate(session.date)}</p>
                            </div>
                        </div>
                    ))
                    ) : (
                        <div className="py-10 text-center text-gray-500 text-sm">
                            Nenhuma sessão registrada.
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

const QuickAction = ({ icon: Icon, label, onClick, color, bg }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-[#0a0a0a] hover:bg-[#151515] hover:border-gray-700 transition-all group"
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${bg} group-hover:bg-opacity-20 transition-all`}>
                <Icon className={`w-4 h-4 ${color}`} />
            </div>
            {/* Voltou o Hover Azul aqui também */}
            <span className="font-medium text-white text-sm group-hover:text-blue-400 transition-colors">{label}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </button>
);

export default Dashboard;