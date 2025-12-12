import { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Target,
  Plus
} from 'lucide-react';
import { dashboardAPI, studySessionAPI, goalsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout'; // <--- O NOVO ENVELOPE

// Modais
import ModalNovaMeta from '../components/modals/ModalNovaMeta';
import ModalNovaMateria from '../components/modals/ModalNovaMateria';
import ModalNovaSessao from '../components/modals/ModalNovaSessao';

function Dashboard() {
  const [user, setUser] = useState(null);
  
  // Estados dos Modais
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Estados de Dados
  const [stats, setStats] = useState({
    totalHours: 0,
    weeklyHours: 0,
    completedSessions: 0,
    activeGoals: 0,
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Função de carregar dados (com useCallback para evitar loop)
  const loadDashboardData = useCallback(async (userId) => {
    try {
      const statsResponse = await dashboardAPI.getStats(userId);
      setStats(statsResponse.data);

      const sessionsResponse = await studySessionAPI.getRecentSessions(userId);
      setRecentSessions(sessionsResponse.data.slice(0, 5));

      const goalsResponse = await goalsAPI.getUserGoals(userId);
      setGoals(goalsResponse.data);

      // Preparar Gráfico
      const sessions = sessionsResponse.data;
      const last7Days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Pega dia da semana em UTC
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' });
        
        const totalMinutes = sessions
          .filter(s => s.date.startsWith(dateStr)) 
          .reduce((sum, s) => sum + s.durationMinutes, 0);
        
        last7Days.push({
          day: dayName,
          hours: (totalMinutes / 60).toFixed(1),
        });
      }
      setChartData(last7Days);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(parsedUser);
      loadDashboardData(parsedUser.userId);
    }
  }, [loadDashboardData]);

  const handleDataUpdate = () => {
    if (user) loadDashboardData(user.userId);
  };

  const formatDate = (dateString) => {
    if(!dateString) return "Data inválida";
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  if (!user) return null;

  return (
    <Layout> {/* <--- AQUI ENTRA O LAYOUT ENVOLVENDO TUDO */}
      
      {/* Título da Página (Agora fica no conteúdo, já que o header sumiu) */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Visão geral do seu progresso, {user.name}.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm">Total de Horas</h3>
                  <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalHours}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm">Esta Semana</h3>
                  <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.weeklyHours}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm">Sessões</h3>
                  <BookOpen className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.completedSessions}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm">Metas</h3>
                  <Target className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.activeGoals}</p>
          </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button 
          onClick={() => setIsSessionModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
        >
          <BookOpen className="w-5 h-5" />
          Nova Sessão
        </button>
        
        <button 
          onClick={() => setIsGoalModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
        >
          <Target className="w-5 h-5" />
          Nova Meta
        </button>
        
        <button 
          onClick={() => setIsSubjectModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
        >
          <Plus className="w-5 h-5" />
          Nova Matéria
        </button>
      </div>
      
      {/* Gráfico e Lista */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-white">Horas de Estudo</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                    dataKey="day" 
                    stroke="#666" 
                    type="category" 
                    tickFormatter={(value) => value}
                />
                <YAxis stroke="#666" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
      </div>

      {/* 2. SEÇÃO DIVIDIDA (Sessões Recentes + Metas Ativas lado a lado) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Coluna Esquerda: Sessões Recentes */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 h-full"> {/* Adicionei h-full para alinhar alturas */}
              <h2 className="text-xl font-bold mb-6 text-white">Sessões Recentes</h2>
              <div className="space-y-3">
                  {recentSessions?.length > 0 ? (
                      recentSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                          <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full shadow-sm"
                                style={{ backgroundColor: session.subject?.color || '#3b82f6' }}
                                title={session.subject?.name}
                              ></div>
                              <div>
                                  <p className="font-medium text-white">{session.subject ? session.subject.name : "Sem Matéria"}</p>
                                  <p className="text-sm text-gray-400">{formatDate(session.date)}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">{session.durationMinutes}min</span>
                          </div>
                      </div>
                      ))
                  ) : <p className="text-gray-500 text-center py-4">Nenhuma sessão registrada.</p>}
              </div>
          </div>

          {/* Coluna Direita: Metas Ativas */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 h-full">
              <h2 className="text-xl font-bold mb-6 text-white">Metas Ativas</h2>
              {/* Mudei o grid interno para 1 coluna para ficar melhor em espaço menor, ou mantenha 2 se preferir */}
              <div className="grid grid-cols-1 gap-4"> 
                {goals.map(goal => (
                    <div key={goal.id} className="p-4 bg-[#0a0a0a] border border-gray-800 rounded-lg flex justify-between items-center hover:border-gray-700 transition-colors">
                        <div>
                          <h3 className="font-medium text-white">{goal.title}</h3>
                          <p className="text-sm text-gray-500 capitalize">{goal.goalType}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-white">{goal.targetHours}h</span>
                          <p className="text-xs text-gray-500">alvo</p>
                        </div>
                    </div>
                ))}
                {goals.length === 0 && <p className="text-gray-500 text-center py-4">Nenhuma meta ativa.</p>}
              </div>
          </div>

      </div>

      {/* Modais */}
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

    </Layout>
  );
}

export default Dashboard;