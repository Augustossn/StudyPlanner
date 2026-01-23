/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, Save, Brain, Coffee, BatteryCharging, ChevronRight, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const Pomodoro = () => {
  const navigate = useNavigate();

  // 1. LER CONFIGURAÇÕES DO LOCALSTORAGE
  const getSavedTimes = () => {
    const saved = localStorage.getItem('pomodoro_settings');
    if (saved) {
        const parsed = JSON.parse(saved);
        return {
            pomodoro: parsed.pomodoro * 60,
            shortBreak: parsed.shortBreak * 60,
            longBreak: parsed.longBreak * 60
        };
    }
    return { pomodoro: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
  };

  const [times, setTimes] = useState(getSavedTimes());

  const MODES = {
    pomodoro: {
      id: 'pomodoro',
      label: 'Foco Total',
      time: times.pomodoro,
      icon: Brain,
      color: 'text-blue-500',
      stroke: '#3b82f6', 
      glow: 'shadow-blue-500/20',
      gradient: 'from-blue-500 to-indigo-600'
    },
    shortBreak: {
      id: 'shortBreak',
      label: 'Pausa Curta',
      time: times.shortBreak,
      icon: Coffee,
      color: 'text-emerald-500',
      stroke: '#10b981', 
      glow: 'shadow-emerald-500/20',
      gradient: 'from-emerald-500 to-teal-400'
    },
    longBreak: {
      id: 'longBreak',
      label: 'Recarregar',
      time: times.longBreak,
      icon: BatteryCharging,
      color: 'text-orange-500',
      stroke: '#f97316',
      glow: 'shadow-orange-500/20',
      gradient: 'from-orange-500 to-amber-500'
    },
  };

  const [currentMode, setCurrentMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.time);
  const [isActive, setIsActive] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [initialTime, setInitialTime] = useState(MODES.pomodoro.time);
  
  // --- ESTADO PARA ACUMULAR O TEMPO ---
  const [accumulatedTime, setAccumulatedTime] = useState(0);

  const audioRef = useRef(new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'));

  // --- LÓGICA DO TIMER ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      audioRef.current.play().catch(() => {});
      toast.success("Ciclo finalizado!", { icon: '🔔' });

      // Se acabou o tempo de foco, acumula automaticamente o tempo total desse ciclo
      if (currentMode === 'pomodoro') {
          setAccumulatedTime(prev => prev + initialTime);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentMode, initialTime]);

  // Título da aba
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    document.title = `${mins}:${secs} - ${isActive ? 'Focando' : 'Pausado'} | StudyPlanner`;
  }, [timeLeft, isActive]);

  // --- CORREÇÃO 1: CAPTURAR TEMPO PARCIAL ---
  const capturePartialTime = () => {
      if (currentMode === 'pomodoro') {
          // Só captura se o tempo NÃO acabou (timeLeft > 0).
          // Se for 0, o useEffect lá em cima já salvou.
          if (timeLeft > 0 && timeLeft < initialTime) {
              const timeSpent = initialTime - timeLeft;
              setAccumulatedTime(prev => prev + timeSpent);
          }
      }
  };

  const switchMode = (modeKey) => {
    capturePartialTime(); 
    setIsActive(false);
    setCurrentMode(modeKey);
    setTimeLeft(MODES[modeKey].time);
    setInitialTime(MODES[modeKey].time);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  const clearAccumulated = () => {
      setAccumulatedTime(0);
      resetTimer();
      toast.success("Histórico limpo.");
  };

  // --- CORREÇÃO 2: CÁLCULO DO TOTAL PARA SALVAR ---
  const getTotalSeconds = () => {
      let currentSessionSeconds = 0;
      
      // Só considera o tempo da sessão atual se o timer ainda estiver rodando ou pausado.
      // Se timeLeft for 0, significa que o tempo já foi para 'accumulatedTime' via useEffect.
      if (currentMode === 'pomodoro' && timeLeft > 0) {
          currentSessionSeconds = initialTime - timeLeft;
      }
      
      return accumulatedTime + currentSessionSeconds;
  };

  const handleSaveSession = () => {
    const totalSeconds = getTotalSeconds();
    // Arredonda para garantir precisão
    let minutesStudied = Math.round(totalSeconds / 60);
    
    // Se estudou mais de 30 segundos, conta como 1 minuto
    if (totalSeconds > 30 && minutesStudied === 0) minutesStudied = 1;

    console.log("Tempo calculado:", minutesStudied, "minutos");

    if (minutesStudied === 0) {
      toast.error("Estude pelo menos 1 minuto para salvar.");
      return;
    }

    navigate('/nova-sessao', { 
      state: { 
        automaticDuration: minutesStudied,
        title: sessionTitle || 'Sessão de Foco'
      } 
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return { mins, secs };
  };

  // --- CONFIGURAÇÕES VISUAIS ---
  const activeTheme = MODES[currentMode];
  const progress = ((initialTime - timeLeft) / initialTime) * 100;
  
  const radius = 180; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const totalMinutesDisplay = Math.floor(getTotalSeconds() / 60);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 animate-in fade-in duration-500">
        
        {/* INPUT DE TÍTULO */}
        <div className="w-full max-w-md text-center space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Objetivo Atual</label>
            <input 
                type="text" 
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Ex: Estudar React Hooks..."
                className="w-full bg-transparent text-center text-xl md:text-2xl font-bold text-text placeholder-gray-700 border-b border-border focus:border-blue-500 focus:outline-none py-2 transition-colors"
            />
        </div>

        {/* TIMER CIRCULAR */}
        <div className="relative group">
            <div className="relative w-95 h-95 md:w-125 md:h-125 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                    <circle cx="50%" cy="50%" r={radius} stroke="var(--surface)" strokeWidth="8" fill="transparent" />
                    <circle
                        cx="50%" cy="50%" r={radius}
                        stroke={activeTheme.stroke}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-6xl md:text-7xl font-bold font-mono tracking-tighter text-text tabular-nums`}>
                        {formatTime(timeLeft).mins}:{formatTime(timeLeft).secs}
                    </div>
                    
                    <div className={`mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border ${activeTheme.color} transition-colors duration-300`}>
                        <activeTheme.icon size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">{activeTheme.label}</span>
                    </div>
                </div>
            </div>
            <div className={`absolute inset-0 ${activeTheme.gradient} opacity-15 blur-[120px] rounded-full -z-10 transition-all duration-700`}></div>
        </div>

        {/* CONTROLES */}
        <div className="flex flex-col items-center gap-8 w-full max-w-lg">
            <div className="flex items-center gap-4">
                {isActive ? (
                     <button onClick={toggleTimer} className="w-16 h-16 rounded-full bg-surface border border-border text-text flex items-center justify-center hover:bg-surface-hover hover:scale-105 transition-all shadow-lg">
                        <Pause size={24} fill="currentColor" />
                     </button>
                ) : (
                    <button onClick={toggleTimer} className={`w-20 h-20 rounded-full bg-linear-to-br ${activeTheme.gradient} text-white flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all shadow-lg`}>
                        <Play size={32} fill="currentColor" className="ml-1" />
                    </button>
                )}
                
                {timeLeft !== initialTime && (
                    <button onClick={resetTimer} className="w-12 h-12 rounded-full bg-surface text-text-muted hover:text-text flex items-center justify-center hover:bg-surface-hover transition-all" title="Reiniciar">
                        <RotateCcw size={18} />
                    </button>
                )}
            </div>

            <div className="flex p-1 bg-surface border border-border rounded-xl shadow-xs">
                {Object.values(MODES).map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => switchMode(mode.id)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                            currentMode === mode.id 
                            ? 'bg-background text-text shadow-sm border border-border/50' 
                            : 'text-text-muted hover:text-text hover:bg-background/50'
                        }`}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>
        </div>

        {/* BARRA INFERIOR */}
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 transition-all duration-500 ${(totalMinutesDisplay > 0 || (currentMode === 'pomodoro' && timeLeft !== initialTime)) ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
             <div className="bg-surface/90 backdrop-blur-md border border-border p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-text-muted">Tempo Total</span>
                    <span className="text-xl font-bold text-text">
                        {totalMinutesDisplay} <span className="text-sm font-normal text-text-muted">min</span>
                    </span>
                </div>
                
                <div className="flex gap-2">
                    {accumulatedTime > 0 && (
                        <button 
                            onClick={clearAccumulated}
                            className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            title="Descartar tempo acumulado"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}

                    <button 
                        onClick={handleSaveSession}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
                    >
                        <Save size={18} />
                        <span>Salvar Tudo</span>
                        <ChevronRight size={16} className="opacity-50" />
                    </button>
                </div>
             </div>
        </div>

      </div>
    </Layout>
  );
};

export default Pomodoro;