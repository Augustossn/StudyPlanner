/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Target,
  Plus,
  Activity,
  Layers,
  Calendar,
  Edit2,
  Trash2, 
  Filter, 
  Rocket,
  BookCheck,
  Search
} from 'lucide-react';
import { dashboardAPI, studySessionAPI, goalsAPI, subjectAPI } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import { getAuthUser } from '../utils/auth';
import SessionDetailsModal from '../components/SessionDetailsModal';

function Dashboard() {
  const navigate = useNavigate();

  const [user] = useState(() => getAuthUser());

  const [stats, setStats] = useState({ totalHours: 0, weeklyHours: 0, completedSessions: 0, activeGoals: 0 });
  
  const [recentSessions, setRecentSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [goals, setGoals] = useState([]);
  
  const [allWeekSessions, setAllWeekSessions] = useState([]); 
  const [selectedSubjectId, setSelectedSubjectId] = useState('all'); 

  const [searchTerm, setSearchTerm] = useState('');

  const [viewSession, setViewSession] = useState(null);

  const loadDashboardData = useCallback(async (userId) => {
    try {
      const [statsRes, sessionsRes, goalsRes, subjectsRes] = await Promise.all([
        dashboardAPI.getStats(userId),
        studySessionAPI.getRecentSessions(userId),
        goalsAPI.getUserGoals(userId),
        subjectAPI.getUserSubjects(userId)
      ]);

      setStats(statsRes.data);

      setAllWeekSessions(sessionsRes.data); 
      
      setRecentSessions(sessionsRes.data.slice(0, 5));
      
      setSubjects(subjectsRes.data || []);
      setGoals(goalsRes.data || []); 

    } catch (error) {
      toast.error("Ops! Tivemos um problema ao carregar seus dados. Tente atualizar a página.");
    }
  }, []);

    useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
        try {
        const [statsRes, sessionsRes, goalsRes, subjectsRes] = await Promise.all([
            dashboardAPI.getStats(user.userId),
            studySessionAPI.getRecentSessions(user.userId),
            goalsAPI.getUserGoals(user.userId),
            subjectAPI.getUserSubjects(user.userId)
        ]);

        setStats(statsRes.data);
        setAllWeekSessions(sessionsRes.data);
        setRecentSessions(sessionsRes.data.slice(0, 5));
        setSubjects(subjectsRes.data || []);
        setGoals(goalsRes.data || []);
        } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar dashboard.");
        }
    };

    loadDashboardData();
    }, [user]);

    const filteredSubjects = subjects.filter(sub => 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSessions = recentSessions.filter(session => 
      session.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      session.subject?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGoals = goals.filter(goal => 
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (goal.subject && goal.subject.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const chartData = useMemo(() => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' });
      
      const totalMinutes = allWeekSessions
        .filter(s => {
            const matchDate = s.date.startsWith(dateStr);
            const matchSubject = selectedSubjectId === 'all' || s.subject?.id === Number(selectedSubjectId);
            return matchDate && matchSubject;
        })
        .reduce((sum, s) => sum + s.durationMinutes, 0);
      
      last7Days.push({
        day: dayName,
        hours: Number((totalMinutes / 60).toFixed(1)),
      });
    }
    return last7Days;
  }, [allWeekSessions, selectedSubjectId]);

  const activeColor = useMemo(() => {
    if (selectedSubjectId === 'all') return '#3b82f6'; // Azul padrão
    const sub = subjects.find(s => s.id === Number(selectedSubjectId));
    return sub ? sub.color : '#3b82f6';
  }, [selectedSubjectId, subjects]);

  // --- FUNÇÕES AUXILIARES ---
  const formatDate = (dateString) => {
    if(!dateString) return "--/--";
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // --- HANDLERS (AÇÕES) ---

  const handleEditSubject = (subject) => {
    navigate('/nova-materia', { state: { subjectToEdit: subject } });
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta matéria?")) return;

    try {
        await subjectAPI.deleteSubject(id);
        setSubjects(prev => prev.filter(sub => sub.id !== id)); // Remove da tela
        toast.success("Matéria excluída com sucesso!");
    } catch (error) {
        console.error(error);
        toast.error("Não foi possível excluir. Verifique se esta matéria tem sessões ou metas vinculadas.");
    }
  };

  const handleEditGoal = (goal) => {
    navigate('/nova-meta', { state: { goalToEdit: goal } });
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta meta?")) return;

    try {
        await goalsAPI.deleteGoal(id);
        setGoals(prev => prev.filter(goal => goal.id !== id)); 
        toast.success("Meta excluída com sucesso!");
    } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir meta.");
    }
  };
  
  const handleEditSession = (session) => {
    navigate('/nova-sessao', { state: { sessionToEdit: session } });
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta sessão?")) return;
    try {
        await studySessionAPI.deleteSession(id);
        setRecentSessions(prev => prev.filter(s => s.id !== id));
        loadDashboardData(user.userId); 
        toast.success("Sessão excluída.");
    } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir sessão.");
    }
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

        {/* === 3. GRÁFICO DE DESEMPENHO === */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4" style={{ color: activeColor }} />
                    Ritmo de Estudos (7 dias)
                </h3>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select 
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="bg-[#0a0a0a] border border-gray-700 text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 cursor-pointer hover:border-gray-500 transition-colors"
                    >
                        <option value="all">Todas as Matérias</option>
                        {subjects.map(sub => (
                            <option key={sub.id} value={sub.id}>
                                {sub.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={activeColor} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={activeColor} stopOpacity={0}/>
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
                            stroke={activeColor} 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorHours)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* === 4. RODAPÉ (3 COLUNAS) === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUNA 1: METAS ATIVAS */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Metas Ativas</h3>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {goals.length > 0 ? (
                    goals.filter(g => g.active).map((goal) => (
                        <div key={goal.id} className="p-4 bg-[#0a0a0a] border border-gray-800 rounded-xl hover:border-gray-700 transition-colors group">
                            
                            <div className="flex justify-between items-start mb-3 gap-3">
                                
                                <h4 className="font-bold text-white text-sm truncate flex-1" title={goal.title}>
                                    {goal.title}
                                </h4>

                                <div className="flex items-center gap-2 shrink-0">
                                    
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                        goal.goalType === 'Semanal' ? 'bg-blue-500/10 text-blue-500' :
                                        goal.goalType === 'Mensal' ? 'bg-purple-500/10 text-purple-500' :
                                        'bg-orange-500/10 text-orange-500'
                                    }`}>
                                        {goal.goalType}
                                    </span>

                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleEditGoal(goal); }}
                                            className="p-1 bg-gray-800 rounded text-gray-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteGoal(goal.id); }}
                                            className="p-1 bg-gray-800 rounded text-gray-400 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-end justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Target className="w-3 h-3" />
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

                            <div className="w-full bg-gray-800 h-2 rounded-full mt-3 overflow-hidden relative">
                                <div 
                                    className={`h-full transition-all duration-1000 ease-out rounded-full ${
                                        (goal.progressPercentage || 0) >= 100 ? 'bg-green-500' : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${goal.progressPercentage || 0}%` }}
                                ></div>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                {goal.subject ? (
                                    <div className="flex items-center gap-1.5 text-[10px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                        <Layers className="w-3 h-3" />
                                        <span className="font-medium truncate max-w-[120px]" title={goal.subject.name}>
                                            {goal.subject.name}
                                        </span>
                                    </div>
                                ) : (
                                    <div></div>
                                )}

                                <span className="text-[10px] text-gray-500 font-medium">
                                    {goal.progressPercentage || 0}% concluído
                                </span>
                            </div>

                        </div>
                    ))
                ) : (
                    <EmptyState 
                        icon={Rocket} 
                        text={searchTerm ? "Nenhuma meta encontrada." : "Você está sem meta alguma?"} 
                        description={searchTerm ? "Tente outro termo de busca." : "Defina um objetivo para ir mais longe!"}
                        link={searchTerm ? null : "/nova-meta"} 
                        linkText="Criar Meta" 
                    />
                )}
            </div>
        </div>

            {/* COLUNA 2: MATÉRIAS */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Matérias</h3>
                </div>
                
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {subjects.length > 0 ? (
                        subjects.map((subject) => (
                            <div key={subject.id} className="p-3 bg-[#0a0a0a] border border-gray-800 rounded-xl hover:border-gray-700 transition-colors relative group">
                                
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleEditSubject(subject); }}
                                        className="p-1.5 bg-gray-800 rounded-lg text-gray-400 hover:bg-blue-600 hover:text-white transition-colors shadow-lg cursor-pointer"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subject.id); }}
                                        className="p-1.5 bg-gray-800 rounded-lg text-gray-400 hover:bg-red-600 hover:text-white transition-colors shadow-lg cursor-pointer"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>

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
                                    {subject.matters && subject.matters.length > 0 ? (
                                        subject.matters.map((matter, idx) => (
                                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded border border-gray-700 bg-gray-800 text-gray-400 select-none">
                                                {matter}
                                            </span>
                                        ))
                                    ) : (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-600 italic">
                                            <Layers className="w-3 h-3" />
                                            Sem assuntos
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState 
                            icon={BookOpen} 
                            text={searchTerm ? "Nenhuma matéria encontrada." : "Nada por aqui ainda."} 
                            description={searchTerm ? "Tente outro termo de busca." : "Cadastre sua primeira matéria para organizar os estudos."}
                            link={searchTerm ? null : "/nova-materia"}
                            linkText="Nova Matéria"
                        />
                    )}
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Sessões Recentes</h3>
                </div>
                
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {recentSessions.length > 0 ? (
                        recentSessions.map((session) => (
                            <div 
                            key={session.id} 
                            onClick={() => setViewSession(session)}
                            className="p-3 bg-[#0a0a0a] border border-gray-800 rounded-xl hover:border-gray-700 transition-colors group cursor-pointer"
                            >
                            
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3 overflow-hidden">
                                <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0"
                                    style={{ backgroundColor: session.subject?.color || '#333' }}
                                >
                                    {session.subject?.name?.charAt(0).toUpperCase()}
                                </div>
                                
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate" title={session.title}>
                                    {session.title || session.subject?.name}
                                    </p>
                                </div>
                                </div>

                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleEditSession(session); }}
                                    className="p-1.5 bg-gray-800 rounded-lg text-gray-400 hover:bg-blue-600 hover:text-white transition-colors shadow-lg cursor-pointer"
                                    title="Editar"
                                >
                                    <Edit2 className="w-3 h-3" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                                    className="p-1.5 bg-gray-800 rounded-lg text-gray-400 hover:bg-red-600 hover:text-white transition-colors shadow-lg cursor-pointer"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                                </div>
                            </div>

                            {/* --- LINHA INFERIOR: Tags + Tempo/Data --- */}
                            <div className="flex justify-between items-end pl-11">
                                
                                {/* Tags */}
                                <div className="flex flex-wrap gap-1">
                                {session.matters && session.matters.length > 0 ? (
                                    <>
                                    {session.matters.slice(0, 2).map((matter, idx) => (
                                        <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded border border-gray-700 bg-gray-800/50 text-gray-400">
                                        {matter}
                                        </span>
                                    ))}
                                    {session.matters.length > 2 && <span className="text-[9px] text-gray-500">...</span>}
                                    </>
                                ) : (
                                    <span className="text-[10px] text-gray-600 italic">Sem tags</span>
                                )}
                                </div>

                                {/* Tempo e Data */}
                                <div className="text-right shrink-0 leading-tight">
                                <p className="text-sm font-bold text-white">{session.durationMinutes}m</p>
                                <p className="text-[10px] text-gray-500">{formatDate(session.date)}</p>
                                </div>
                            </div>

                            </div>
                        ))
                        ) : (
                        <EmptyState 
                            icon={BookCheck}
                            text={searchTerm ? "Nenhuma sessão encontrada." : "Sem sessão ainda?"} 
                            description={searchTerm ? "Tente outro termo de busca." : "Cadastre uma matéria para conseguir cumprir suas metas!"}
                            link={searchTerm ? null : "/nova-sessao"}
                            linkText="Criar uma nova sessão"
                        />
                        )}
                    </div>
                </div>
                <SessionDetailsModal 
                    isOpen={!!viewSession} 
                    onClose={() => setViewSession(null)} 
                    session={viewSession} 
                />
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

const EmptyState = ({ icon: Icon, text, description, link, linkText }) => (
    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-3 px-4">
        <div className="p-3 bg-gray-800/30 rounded-full mb-1">
            <Icon className="w-6 h-6 text-gray-600" />
        </div>
        <div>
            <p className="text-sm font-semibold text-gray-400">{text}</p>
            {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
        </div>
        {link && (
            <button onClick={() => window.location.href = link} className="text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors cursor-pointer">
                {linkText}
            </button>
        )}
    </div>
);

export default Dashboard;