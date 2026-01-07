import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import isSameDay from 'date-fns/isSameDay';
import endOfDay from 'date-fns/endOfDay';
import subMonths from 'date-fns/subMonths';
import isSameMonth from 'date-fns/isSameMonth'; // Importante para a comparação
import 'react-big-calendar/lib/css/react-big-calendar.css';

import Layout from '../components/Layout';
import { studySessionAPI } from '../services/api';
import { getAuthUser } from '../utils/auth';
import { Clock, BookOpen, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import SessionDetailsModal from '../components/SessionDetailsModal';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendario = () => {
  const [user] = useState(() => getAuthUser());
  const [events, setEvents] = useState([]);
  
  // Data atual (hoje) para servir de referência máxima
  const today = useMemo(() => new Date(), []);

  // --- ESTADO DA DATA ATUAL DO CALENDÁRIO ---
  const [currentDate, setCurrentDate] = useState(today);

  // --- ESTADOS DO MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [daySessions, setDaySessions] = useState([]);

  const [viewSession, setViewSession] = useState(null);

  // --- GERA OS ÚLTIMOS 12 MESES PARA O SELECT ---
  const monthsOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 12; i++) {
        options.push(subMonths(today, i));
    }
    return options; // [Hoje, Mês Passado, ... , 11 meses atrás]
  }, [today]);

  // Limites para navegação
  const maxDate = monthsOptions[0]; // Mês atual
  const minDate = monthsOptions[monthsOptions.length - 1]; // 1 ano atrás

  // Verifica se deve bloquear os botões
  const isNextDisabled = isSameMonth(currentDate, maxDate);
  const isPrevDisabled = isSameMonth(currentDate, minDate);

  useEffect(() => {
    if (!user?.userId) return;

    const loadSessions = async () => {
      try {
        const response = await studySessionAPI.getRecentSessions(user.userId);

        const formattedEvents = response.data.map(session => {
          const startDate = new Date(session.date);
          let endDate = new Date(startDate.getTime() + session.durationMinutes * 60000);

          if (!isSameDay(startDate, endDate)) {
             endDate = endOfDay(startDate);
          }

          return {
            id: session.id,
            title: session.title || 'Estudo',
            start: startDate,
            end: endDate,
            resource: session,
          };
        });

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Erro ao carregar calendário", error);
      }
    };

    loadSessions();
  }, [user?.userId]);

  // --- HANDLERS DE NAVEGAÇÃO ---
  const handleMonthChange = (e) => {
      const newDate = new Date(e.target.value);
      setCurrentDate(newDate);
  };

  const goToPreviousMonth = () => {
      if (!isPrevDisabled) {
          setCurrentDate(prev => subMonths(prev, 1));
      }
  };
  
  const goToNextMonth = () => {
      if (!isNextDisabled) {
          setCurrentDate(prev => subMonths(prev, -1)); 
      }
  };

  // --- HANDLERS DO CALENDÁRIO ---
  const handleShowMore = (events, date) => {
      setSelectedDate(date);
      setDaySessions(events);
      setIsModalOpen(true);
  };

  const handleSelectSlot = (slotInfo) => {
      const eventsOnDay = events.filter(event => isSameDay(event.start, slotInfo.start));
      setSelectedDate(slotInfo.start);
      setDaySessions(eventsOnDay);
      setIsModalOpen(true);
  };

  const handleSelectEvent = (event) => {
      const eventsOnDay = events.filter(e => isSameDay(e.start, event.start));
      setSelectedDate(event.start);
      setDaySessions(eventsOnDay);
      setIsModalOpen(true);
  };

  const eventStyleGetter = (event) => {
      const backgroundColor = event.resource.subject?.color || '#3b82f6';
      return {
          style: {
              backgroundColor: backgroundColor,
              borderRadius: '4px',
              opacity: 0.9,
              color: 'white',
              border: '0px',
              fontSize: '0.85rem',
              fontWeight: '500',
              cursor: 'pointer' // Adicionado cursor pointer nos eventos
          }
      };
  };

  return (
    <Layout>
        <style>{`
            .rbc-calendar { color: #9ca3af; font-family: inherit; }
            .rbc-month-view { border-color: #374151; background-color: #0f0f0f; }
            .rbc-header { border-bottom-color: #374151; padding: 12px 0; font-weight: 700; text-transform: uppercase; font-size: 0.8rem; color: #6b7280; }
            .rbc-day-bg + .rbc-day-bg { border-left-color: #374151; }
            .rbc-off-range-bg { background-color: #050505; opacity: 1; }
            .rbc-today { background-color: #1e3a8a20; }
            .rbc-event { box-shadow: 0 1px 3px rgba(0,0,0,0.5); }
            /* Link "+ ver mais" com cursor pointer */
            .rbc-show-more { background-color: #1f2937; color: #93c5fd; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; margin-top: 2px; cursor: pointer; }
            .rbc-show-more:hover { text-decoration: none; background-color: #374151; color: white; }
            /* Cursor pointer nos dias */
            .rbc-day-bg { cursor: pointer; } 
            .rbc-day-bg:hover { background-color: #1f1f1f; transition: background-color 0.2s; }
        `}</style>

        <div className="h-[80vh] p-6 bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl flex flex-col antialiased">
            
            {/* --- HEADER CUSTOMIZADO --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <CalendarIcon className="text-blue-500 w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white leading-none">
                            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Histórico de Sessões</p>
                    </div>
                </div>

                {/* Controles de Navegação */}
                <div className="flex items-center gap-3 bg-[#0f0f0f] p-1.5 rounded-xl border border-gray-800">
                    
                    {/* Botão Anterior */}
                    <button 
                        onClick={goToPreviousMonth}
                        disabled={isPrevDisabled}
                        className={`p-2 rounded-lg transition-colors ${
                            isPrevDisabled 
                            ? 'text-gray-600 cursor-not-allowed opacity-50' // Estilo Bloqueado
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer' // Estilo Ativo
                        }`}
                        title={isPrevDisabled ? "Limite de histórico alcançado" : "Mês anterior"}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {/* Select de Meses */}
                    <div className="relative">
                        <select 
                            value={currentDate.toISOString()} 
                            onChange={handleMonthChange}
                            className="bg-gray-800 text-white text-sm font-medium py-2 pl-4 pr-8 rounded-lg outline-none border border-gray-700 focus:border-blue-500 appearance-none cursor-pointer hover:bg-gray-700 transition-colors capitalize"
                        >
                            {monthsOptions.map((date, idx) => (
                                <option key={idx} value={date.toISOString()}>
                                    {format(date, "MMMM yyyy", { locale: ptBR })}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                           <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                    </div>

                    {/* Botão Próximo */}
                    <button 
                        onClick={goToNextMonth}
                        disabled={isNextDisabled}
                        className={`p-2 rounded-lg transition-colors ${
                            isNextDisabled 
                            ? 'text-gray-600 cursor-not-allowed opacity-50' // Estilo Bloqueado
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer' // Estilo Ativo
                        }`}
                        title={isNextDisabled ? "Você está no mês atual" : "Próximo mês"}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
            
            {/* --- CALENDÁRIO --- */}
            <Calendar
                    localizer={localizer}
                    events={events}
                    date={currentDate}
                    onNavigate={(date) => setCurrentDate(date)}
                    toolbar={false}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    culture='pt-BR'
                    view='month'
                    messages={{ showMore: total => `+${total} ver mais` }}
                    eventPropGetter={eventStyleGetter}
                    selectable={true}
                    onSelectSlot={handleSelectSlot}
                    onShowMore={handleShowMore}
                    
                    // 3. AJUSTE: Conecta o clique do calendário ao modal de detalhes
                    onSelectEvent={handleSelectEvent}
                    
                    popup={false}
                />
            </div>

            {/* MODAL DE LISTAGEM DO DIA */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 antialiased animate-in fade-in duration-200">
                    {/* Adicionado stopPropagation no container para fechar ao clicar fora */}
                    <div 
                        className="bg-black border border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#151515]">
                            <div>
                                <h2 className="text-xl font-bold text-white capitalize">
                                    {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    {daySessions.length} sessões registradas
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white cursor-pointer">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">
                            {daySessions.length > 0 ? (
                                daySessions.map((event, idx) => (
                                    <div 
                                        key={idx} 
                                        // 4. AJUSTE: Clique na lista abre o modal de detalhes
                                        onClick={() => setViewSession(event.resource || event)}
                                        // Adicionado cursor-pointer e hover
                                        className="p-4 bg-[#0a0a0a] border border-gray-800 rounded-xl flex gap-4 items-start cursor-pointer hover:border-gray-600 transition-colors group"
                                    >
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md shrink-0 text-xl" style={{ backgroundColor: event.resource.subject?.color || '#333' }}>
                                            <BookOpen size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-lg font-bold text-white truncate pr-2 group-hover:text-blue-400 transition-colors">{event.title}</h4>
                                                <span className="flex items-center gap-1.5 text-xs font-mono bg-gray-800 text-gray-300 px-2 py-1 rounded-md border border-gray-700">
                                                    <Clock size={12} />
                                                    {event.resource.durationMinutes} min
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm mt-0.5">{event.resource.subject?.name || 'Geral'}</p>
                                            {event.resource.matters?.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {event.resource.matters.map((matter, mIdx) => (
                                                        <span key={mIdx} className="text-xs font-medium px-2.5 py-1 bg-gray-800/50 text-blue-200 rounded-md border border-blue-500/20">{matter}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-lg">Dia livre!</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-5 border-t border-gray-800 bg-[#151515]">
                             <button onClick={() => setIsModalOpen(false)} className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold shadow-lg cursor-pointer transition-colors">Fechar</button>
                        </div>
                    </div>
                    {/* Fecha o modal ao clicar no fundo escuro */}
                    <div className="fixed inset-0 -z-10" onClick={() => setIsModalOpen(false)}></div>
                </div>
            )}

            {/* 5. NOVO: Renderiza o Modal de Detalhes */}
            <SessionDetailsModal 
                isOpen={!!viewSession} 
                onClose={() => setViewSession(null)} 
                session={viewSession} 
            />
        </Layout>
    );
};

export default Calendario;