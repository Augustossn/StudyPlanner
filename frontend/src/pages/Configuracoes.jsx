/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  User, Lock, Bell, Monitor, Clock, Save, 
  Type, Volume2, Trash2, ShieldAlert,
  Sun, Moon, Laptop, BarChart3 // <--- Adicionei BarChart3
} from 'lucide-react';

import Layout from '../components/Layout';
import { authAPI } from '../services/api';
import { getAuthUser, logout } from '../utils/auth';
import { useTheme } from '../utils/themeContext';

const Configuracoes = () => {
  const [user] = useState(() => getAuthUser());
  const [loading, setLoading] = useState(false);
  
  const { theme, setTheme } = useTheme();

  // --- ESTADOS DE SENHA ---
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

  // --- ESTADOS DE PREFERÊNCIAS ---
  const [pomodoroSettings, setPomodoroSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
  });

  const [appearance, setAppearance] = useState({
    fontSize: 'normal', 
    soundEnabled: true,
    chartRange: '7days' // <--- Padrão inicial
  });

  // --- CARREGAR PREFERÊNCIAS AO INICIAR ---
  useEffect(() => {
    const savedPomo = localStorage.getItem('pomodoro_settings');
    if (savedPomo) setPomodoroSettings(JSON.parse(savedPomo));

    const savedApp = localStorage.getItem('app_settings');
    if (savedApp) {
        // Combina o salvo com o estado atual para garantir que chartRange exista
        setAppearance(prev => ({ ...prev, ...JSON.parse(savedApp) }));
    }
  }, []);

  // --- HANDLERS ---

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      toast.error("As novas senhas não coincidem.");
      return;
    }
    if (passData.new.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword(user.userId, passData.current, passData.new);
      toast.success("Senha alterada com sucesso!");
      setPassData({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error(error);
      const msg = error.response?.data || "Erro ao trocar senha.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePomodoro = () => {
    localStorage.setItem('pomodoro_settings', JSON.stringify(pomodoroSettings));
    toast.success("Tempos do Pomodoro atualizados!");
  };

  const handleSaveAppearance = (newSettings) => {
    const updated = { ...appearance, ...newSettings };
    setAppearance(updated);
    
    // Salva no LocalStorage
    localStorage.setItem('app_settings', JSON.stringify(updated));
    
    // Aplica fonte se mudou
    if (newSettings.fontSize) {
        document.documentElement.setAttribute('data-font-size', updated.fontSize);
    }
    
    toast.success("Preferências salvas.");
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        
        {/* Cabeçalho */}
        <div>
          <h1 className="text-2xl font-bold text-text">Configurações</h1>
          <p className="text-text-muted text-sm">Gerencie sua conta e preferências.</p>
        </div>

        {/* --- SEÇÃO 1: POMODORO --- */}
        <section className="bg-surface border border-border rounded-2xl p-6 md:p-8 transition-colors">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                    <Clock size={20} />
                </div>
                <h2 className="text-lg font-bold text-text">Timer Pomodoro</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">Foco (min)</label>
                    <input 
                        type="number" 
                        value={pomodoroSettings.pomodoro}
                        onChange={(e) => setPomodoroSettings({...pomodoroSettings, pomodoro: Number(e.target.value)})}
                        className="w-full bg-background border border-border rounded-xl p-3 text-text focus:border-orange-500 focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">Pausa Curta (min)</label>
                    <input 
                        type="number" 
                        value={pomodoroSettings.shortBreak}
                        onChange={(e) => setPomodoroSettings({...pomodoroSettings, shortBreak: Number(e.target.value)})}
                        className="w-full bg-background border border-border rounded-xl p-3 text-text focus:border-green-500 focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">Pausa Longa (min)</label>
                    <input 
                        type="number" 
                        value={pomodoroSettings.longBreak}
                        onChange={(e) => setPomodoroSettings({...pomodoroSettings, longBreak: Number(e.target.value)})}
                        className="w-full bg-background border border-border rounded-xl p-3 text-text focus:border-blue-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>
            
            <div className="mt-6 flex justify-end">
                <button 
                    onClick={handleSavePomodoro}
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-text rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
                >
                    <Save size={16} /> Salvar Timer
                </button>
            </div>
        </section>

        {/* --- SEÇÃO 2: APARÊNCIA E SISTEMA --- */}
        <section className="bg-surface border border-border rounded-2xl p-6 md:p-8 transition-colors">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                    <Monitor size={20} />
                </div>
                <h2 className="text-lg font-bold text-text">Aparência & Preferências</h2>
            </div>

            <div className="space-y-6">
                
                {/* 1. Seletor de Tema */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-background rounded-xl border border-border transition-colors">
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? <Moon size={20} className="text-purple-500" /> : <Sun size={20} className="text-orange-500" />}
                        <div>
                            <p className="text-text font-medium">Tema da Interface</p>
                            <p className="text-xs text-text-muted">Escolha entre claro, escuro ou automático.</p>
                        </div>
                    </div>
                    <div className="flex bg-surface p-1 rounded-lg border border-border">
                        <button onClick={() => setTheme('light')} className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-background text-orange-500 shadow-sm' : 'text-text-muted hover:text-text'}`} title="Claro"><Sun size={18} /></button>
                        <button onClick={() => setTheme('dark')} className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-background text-purple-500 shadow-sm' : 'text-text-muted hover:text-text'}`} title="Escuro"><Moon size={18} /></button>
                        <button onClick={() => setTheme('system')} className={`p-2 rounded-md transition-all ${theme === 'system' ? 'bg-background text-blue-500 shadow-sm' : 'text-text-muted hover:text-text'}`} title="Sistema"><Laptop size={18} /></button>
                    </div>
                </div>

                {/* 2. Tamanho da Fonte */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-background rounded-xl border border-border transition-colors">
                    <div className="flex items-center gap-3">
                        <Type className="text-text-muted" size={20} />
                        <div>
                            <p className="text-text font-medium">Tamanho da Fonte</p>
                            <p className="text-xs text-text-muted">Ajuste o tamanho do texto da aplicação.</p>
                        </div>
                    </div>
                    <div className="flex bg-surface p-1 rounded-lg border border-border">
                        {['small', 'normal', 'large'].map((size) => (
                            <button
                                key={size}
                                onClick={() => handleSaveAppearance({ fontSize: size })}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${
                                    appearance.fontSize === size 
                                    ? 'bg-purple-600 text-text shadow' 
                                    : 'text-text-muted hover:text-text'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Período do Gráfico (NOVO) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-background rounded-xl border border-border transition-colors">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="text-text-muted" size={20} />
                        <div>
                            <p className="text-text font-medium">Período do Gráfico</p>
                            <p className="text-xs text-text-muted">Intervalo padrão exibido no Dashboard.</p>
                        </div>
                    </div>
                    <div className="relative">
                        <select 
                            value={appearance.chartRange}
                            onChange={(e) => handleSaveAppearance({ chartRange: e.target.value })}
                            className="bg-surface text-text border border-border rounded-lg p-2 pr-8 text-sm focus:border-purple-500 outline-none appearance-none cursor-pointer min-w-37.5"
                        >
                            <option value="7days">Última Semana</option>
                            <option value="30days">Último Mês</option>
                            <option value="90days">Últimos 3 Meses</option>
                            <option value="year">Último Ano</option>
                        </select>
                         <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-text-muted">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                        </div>
                    </div>
                </div>

                {/* 4. Sons */}
                <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border transition-colors">
                    <div className="flex items-center gap-3">
                        <Volume2 className="text-text-muted" size={20} />
                        <div>
                            <p className="text-text font-medium">Efeitos Sonoros</p>
                            <p className="text-xs text-text-muted">Sons ao completar timer ou metas.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={appearance.soundEnabled}
                            onChange={(e) => handleSaveAppearance({ soundEnabled: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>
            </div>
        </section>

        {/* --- SEÇÃO 3: SEGURANÇA --- */}
        <section className="bg-surface border border-border rounded-2xl p-6 md:p-8 transition-colors">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <Lock size={20} />
                </div>
                <h2 className="text-lg font-bold text-text">Segurança</h2>
            </div>
            {/* ... restante do formulário de senha igual ... */}
            <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">Senha Atual</label>
                    <input type="password" value={passData.current} onChange={(e) => setPassData({...passData, current: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 text-text focus:border-blue-500 focus:outline-none transition-colors" placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-2">Nova Senha</label>
                        <input type="password" value={passData.new} onChange={(e) => setPassData({...passData, new: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 text-text focus:border-blue-500 focus:outline-none transition-colors" placeholder="••••••••" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-2">Confirmar</label>
                        <input type="password" value={passData.confirm} onChange={(e) => setPassData({...passData, confirm: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 text-text focus:border-blue-500 focus:outline-none transition-colors" placeholder="••••••••" />
                    </div>
                </div>
                <div className="pt-2">
                    <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-text rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50">
                        {loading ? 'Salvando...' : <><Save size={16} /> Atualizar Senha</>}
                    </button>
                </div>
            </form>
        </section>

        {/* --- SEÇÃO 4: ZONA DE PERIGO --- */}
        <section className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6 md:p-8 transition-colors">
             {/* ... igual ao anterior ... */}
             <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="text-red-500" size={24} />
                <h2 className="text-lg font-bold text-red-500">Zona de Perigo</h2>
            </div>
            <p className="text-text-muted text-sm mb-6">Ações aqui são irreversíveis. Tenha cuidado.</p>
            <div className="flex gap-4">
                 <button onClick={logout} className="px-5 py-2 border border-border hover:border-text-muted text-text-muted hover:text-text rounded-xl font-bold text-sm transition-all">Sair da Conta</button>
                 <button onClick={() => toast.error("Funcionalidade indisponível no momento.")} className="px-5 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-text border border-red-500/20 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"><Trash2 size={16} /> Excluir Conta</button>
            </div>
        </section>

      </div>
    </Layout>
  );
};

export default Configuracoes;