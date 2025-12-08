import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Target,
  LogOut,
  Plus
} from 'lucide-react';
import { dashboardAPI, studySessionAPI, goalsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- IMPORTANDO OS MODAIS ---
import ModalNovaMeta from '../components/modals/ModalNovaMeta';
import ModalNovaMateria from '../components/modals/ModalNovaMateria';
import ModalNovaSessao from '../components/modals/ModalNovaSessao';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // --- ESTADOS DOS MODAIS ---
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  const [stats, setStats] = useState({
    totalHours: 0,
    weeklyHours: 0,
    completedSessions: 0,
    activeGoals: 0,
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Função declarada antes do useEffect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadDashboardData = async (userId) => {
    try {
      // Carregar estatísticas
      const statsResponse = await dashboardAPI.getStats(userId);
      setStats(statsResponse.data);

      // Carregar sessões recentes
      const sessionsResponse = await studySessionAPI.getRecentSessions(userId);
      setRecentSessions(sessionsResponse.data.slice(0, 5));

      // Carregar metas ativas
      const goalsResponse = await goalsAPI.getUserGoals(userId);
      setGoals(goalsResponse.data);

      // Preparar dados do gráfico (últimos 7 dias)
      prepareChartData(sessionsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const prepareChartData = (sessions) => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      
      // Filtra sessões do dia (ajuste simples de data)
      const totalMinutes = sessions
        .filter(s => s.date.startsWith(dateStr)) 
        .reduce((sum, s) => sum + s.durationMinutes, 0);
      
      last7Days.push({
        day: dayName,
        hours: (totalMinutes / 60).toFixed(1),
      });
    }
    
    setChartData(last7Days);
  };

  useEffect(() => {
    const fetchData = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/');
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      await loadDashboardData(parsedUser.userId);
    };

    fetchData();
  }, [loadDashboardData, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Função que os modais chamam quando salvam algo com sucesso
  const handleDataUpdate = () => {
    if (user) {
        loadDashboardData(user.userId);
    }
  };

  const formatDate = (dateString) => {
    if(!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  <span className="text-blue-500">Study Planner</span>{' '}
                  <span className="text-orange-500">Pro</span>
                </h1>
                <p className="text-sm text-gray-400">Olá, {user.name}!</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* ... (Seus cards de estatísticas continuam iguais) ... */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-400 text-sm">Total de Horas</h3>
                    <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold">{stats.totalHours}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-400 text-sm">Esta Semana</h3>
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold">{stats.weeklyHours}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-400 text-sm">Sessões</h3>
                    <BookOpen className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold">{stats.completedSessions}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-400 text-sm">Metas</h3>
                    <Target className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold">{stats.activeGoals}</p>
            </div>
        </div>

        {/* Action Buttons - AGORA COM ONCLICK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => setIsSessionModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Nova Sessão de Estudo
          </button>
          
          <button 
            onClick={() => setIsGoalModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Target className="w-5 h-5" />
            Nova Meta
          </button>
          
          <button 
            onClick={() => setIsSubjectModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Matéria
          </button>
        </div>

        {/* ... (O restante do gráfico e listas continua igual) ... */}
        
        {/* Chart e Listas aqui (mantenha o código original que você já tinha) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
             {/* Chart */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-2">Horas de Estudo</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="day" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                    <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

             {/* Recent Sessions */}
             <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">Sessões Recentes</h2>
                <div className="space-y-4">
                    {recentSessions.length > 0 ? (
                        recentSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg border border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p className="font-medium">{session.subject ? session.subject.name : "Sem Matéria"}</p>
                                    <p className="text-sm text-gray-400">{formatDate(session.date)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{session.durationMinutes}min</span>
                            </div>
                        </div>
                        ))
                    ) : <p className="text-gray-400">Nenhuma sessão.</p>}
                </div>
            </div>
        </div>

        {/* Metas Ativas (Mantenha seu código original) */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Metas Ativas</h2>
            {goals.map(goal => (
                <div key={goal.id} className="p-4 bg-[#0a0a0a] border border-gray-800 rounded-lg mb-2">
                    <h3>{goal.title}</h3>
                    <p className="text-sm text-gray-400">{goal.targetHours}h alvo</p>
                </div>
            ))}
        </div>

      </main>

      {/* --- RENDERIZAÇÃO DOS MODAIS --- */}
      <ModalNovaSessao 
        isOpen={isSessionModalOpen} 
        onClose={() => setIsSessionModalOpen(false)}
        userId={user.userId}
        onSuccess={handleDataUpdate}
      />

      <ModalNovaMeta 
        isOpen={isGoalModalOpen} 
        onClose={() => setIsGoalModalOpen(false)}
        userId={user.userId}
        onSuccess={handleDataUpdate}
      />

      <ModalNovaMateria 
        isOpen={isSubjectModalOpen} 
        onClose={() => setIsSubjectModalOpen(false)}
        userId={user.userId}
        onSuccess={handleDataUpdate}
      />

    </div>
  );
}

export default Dashboard;