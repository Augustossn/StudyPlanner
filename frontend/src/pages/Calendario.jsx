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
import isSameMonth from 'date-fns/isSameMonth';
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
  
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(today);

  // --- ESTADOS DO MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [daySessions, setDaySessions] = useState([]);
  const [viewSession, setViewSession] = useState(null);

  // --- NAVEGAÇÃO ---
  const monthsOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 12; i++) {
        options.push(subMonths(today, i));
    }
    return options;
  }, [today]);

  const maxDate = monthsOptions[0];
  const minDate = monthsOptions[monthsOptions.length - 1];
  const isNextDisabled = isSameMonth(currentDate, maxDate);
  const isPrevDisabled = isSameMonth(currentDate, minDate);

  useEffect(() => {
    // Se não tiver usuário, nem tenta buscar
    if (!user?.userId) return;

    const loadSessions = async () => {
      try {
        console.log("1. Buscando sessões para o usuário:", user.userId);
        
        // Busca TODAS as sessões (não só as recentes)
        const response = await studySessionAPI.getUserSessions(user.userId);
        
        console.log("2. Dados brutos do Backend:", response.data);

        const formattedEvents = response.data.map(session => {
          let startDate;

          // --- CORREÇÃO DE FORMATO DE DATA ---
          // Se o Java mandar uma lista [2026, 1, 25, 14, 30]
          if (Array.isArray(session.date)) {
             const [ano, mes, dia, hora, min] = session.date;
             // Note: No Javascript, Janeiro é 0, mas no Java é 1. Por isso "mes - 1".
             startDate = new Date(ano, mes - 1, dia, hora || 0, min || 0);
          } 
          // Se o Java mandar texto "2026-01-25T14:30:00"
          else {
             startDate = new Date(session.date);
          }

          // Se a data for inválida, ignora essa sessão para não quebrar o calendário
          if (isNaN(startDate.getTime())) {
             console.error("❌ Data inválida ignorada:", session.date);
             return null;
          }

          // Calcula o fim da sessão (Duração ou padrão de 1h)
          let endDate = new Date(startDate.getTime() + (session.durationMinutes || 60) * 60000);

          // Ajuste visual para não "vazar" o dia no calendário
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
        }).filter(Boolean); // Remove os nulos (erros)

        console.log("3. Eventos formatados para o calendário:", formattedEvents);
        setEvents(formattedEvents);

      } catch (error) {
        console.error("Erro fatal ao carregar calendário:", error);
      }
    };

    loadSessions();
  }, [user?.userId]);

  // --- HANDLERS ---
  const handleMonthChange = (e) => setCurrentDate(new Date(e.target.value));
  const goToPreviousMonth = () => !isPrevDisabled && setCurrentDate(prev => subMonths(prev, 1));
  const goToNextMonth = () => !isNextDisabled && setCurrentDate(prev => subMonths(prev, -1));

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
              cursor: 'pointer'
          }
      };
  };

  return (
    <Layout>
        <style>{`
            /* --- LIGHT MODE (Bordas Escurecidas para Contraste) --- */
            
            .rbc-calendar { 
                font-family: inherit; 
                color: #374151; /* Texto mais escuro */
            }
            
            /* Container Principal */
            .rbc-month-view {
                border: 1px solid #9ca3af; /* Gray-400: Borda bem visível */
                background-color: #ffffff;
                border-radius: 0.75rem;
                overflow: hidden;
            }
            
            /* Cabeçalho */
            .rbc-header {
                padding: 12px 0;
                font-weight: 700;
                text-transform: uppercase;
                font-size: 0.75rem;
                color: #4b5563;
                background-color: #f3f4f6; /* Gray-100: Fundo leve */
                border-bottom: 1px solid #9ca3af; /* Borda visível */
            }
            .rbc-header + .rbc-header {
                border-left: 1px solid #9ca3af; /* Divisória vertical visível */
            }
            
            /* Células dos Dias */
            .rbc-day-bg {
                background-color: #ffffff;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .rbc-day-bg + .rbc-day-bg {
                border-left: 1px solid #9ca3af; /* Divisória Vertical Escura */
            }
            .rbc-day-bg:hover {
                background-color: #f3f4f6;
            }
            
            /* Dias fora do mês (Off-range) */
            .rbc-off-range-bg {
                background-color: #f9fafb;
                opacity: 1;
            }
            
            /* Linhas Horizontais */
            .rbc-month-row + .rbc-month-row {
                border-top: 1px solid #9ca3af; /* Divisória Horizontal Escura */
            }

            /* Dia Atual */
            .rbc-today {
                background-color: #eff6ff !important; /* Azul bem claro */
            }

            .rbc-date-cell {
                padding: 4px 8px;
                font-size: 0.875rem;
                font-weight: 600;
                color: #1f2937; /* Quase preto */
            }
            .rbc-off-range .rbc-date-cell {
                color: #9ca3af;
            }

            .rbc-show-more {
                background-color: #e5e7eb;
                color: #374151;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 600;
                margin: 2px;
                display: inline-block;
                cursor: pointer;
            }
            .rbc-show-more:hover {
                background-color: #d1d5db;
                color: #111827;
                text-decoration: none;
            }

            /* --- DARK MODE OVERRIDES (.dark class) --- */
            
            .dark .rbc-calendar { color: #9ca3af; }
            
            .dark .rbc-month-view {
                border-color: #27272a; 
                background-color: #09090b;
            }
            
            .dark .rbc-header {
                background-color: #18181b;
                border-bottom-color: #27272a;
                color: #a1a1aa;
            }
            .dark .rbc-header + .rbc-header { border-left-color: #27272a; }
            
            .dark .rbc-day-bg { background-color: #09090b; }
            .dark .rbc-day-bg + .rbc-day-bg { border-left-color: #27272a; }
            .dark .rbc-day-bg:hover { background-color: #27272a; }
            
            .dark .rbc-off-range-bg { background-color: #18181b; opacity: 0.5; }
            
            .dark .rbc-month-row + .rbc-month-row { border-top-color: #27272a; }
            
            .dark .rbc-today { background-color: rgba(59, 130, 246, 0.15) !important; }
            
            .dark .rbc-date-cell { color: #f3f4f6; }
            .dark .rbc-off-range .rbc-date-cell { color: #52525b; }
            
            .dark .rbc-show-more {
                background-color: #27272a;
                color: #d4d4d8;
            }
            .dark .rbc-show-more:hover {
                background-color: #3f3f46;
                color: #ffffff;
            }
        `}</style>

        <div className="h-[80vh] p-6 bg-surface border border-border rounded-2xl shadow-xl flex flex-col antialiased transition-colors duration-300">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <CalendarIcon className="text-blue-500 w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-text leading-none capitalize">
                            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                        </h1>
                        <p className="text-sm text-text-muted mt-1">Histórico de Sessões</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-background p-1.5 rounded-xl border border-border shadow-inner">
                    <button 
                        onClick={goToPreviousMonth}
                        disabled={isPrevDisabled}
                        className={`p-2 rounded-lg transition-colors ${
                            isPrevDisabled 
                            ? 'text-text-muted/50 cursor-not-allowed' 
                            : 'text-text-muted hover:bg-surface-hover hover:text-text cursor-pointer'
                        }`}
                        title={isPrevDisabled ? "Limite de histórico alcançado" : "Mês anterior"}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="relative">
                        <select 
                            value={currentDate.toISOString()} 
                            onChange={handleMonthChange}
                            className="bg-background text-text text-sm font-medium py-2 pl-4 pr-8 rounded-lg outline-none border border-border focus:border-blue-500 appearance-none cursor-pointer hover:bg-surface-hover transition-colors capitalize"
                        >
                            {monthsOptions.map((date, idx) => (
                                <option key={idx} value={date.toISOString()} className="bg-surface text-text">
                                    {format(date, "MMMM yyyy", { locale: ptBR })}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                           <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                    </div>

                    <button 
                        onClick={goToNextMonth}
                        disabled={isNextDisabled}
                        className={`p-2 rounded-lg transition-colors ${
                            isNextDisabled 
                            ? 'text-text-muted/50 cursor-not-allowed' 
                            : 'text-text-muted hover:bg-surface-hover hover:text-text cursor-pointer'
                        }`}
                        title={isNextDisabled ? "Você está no mês atual" : "Próximo mês"}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
            
            {/* Calendário */}
            <div className="flex-1 min-h-0">
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
                    onSelectEvent={handleSelectEvent}
                    popup={false}
                />
            </div>

            {/* MODAL DE LISTAGEM DO DIA */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="bg-white dark:bg-[#18181b] border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div className="p-5 border-b border-border flex justify-between items-center bg-gray-50 dark:bg-[#27272a]">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                                    {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {daySessions.length} {daySessions.length === 1 ? 'sessão registrada' : 'sessões registradas'}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar bg-white dark:bg-[#18181b]">
                            {daySessions.length > 0 ? (
                                daySessions.map((event, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => setViewSession(event.resource || event)}
                                        className="p-4 bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-[#27272a] rounded-xl flex gap-4 items-start cursor-pointer hover:border-blue-300 dark:hover:border-gray-500 hover:shadow-md transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md shrink-0 text-xl" style={{ backgroundColor: event.resource.subject?.color || '#333' }}>
                                            <BookOpen size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate pr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{event.title}</h4>
                                                <span className="flex items-center gap-1.5 text-xs font-mono bg-white dark:bg-[#27272a] text-gray-500 dark:text-gray-400 px-2 py-1 rounded-md border border-gray-200 dark:border-[#3f3f46] transition-colors">
                                                    <Clock size={12} />
                                                    {event.resource.durationMinutes} min
                                                </span>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{event.resource.subject?.name || 'Geral'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-lg font-medium">Dia livre!</p>
                                    <p className="text-sm">Nenhum estudo registrado nesta data.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-5 border-t border-border bg-gray-50 dark:bg-[#27272a]">
                             <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="w-full py-3 bg-white dark:bg-[#18181b] hover:bg-gray-100 dark:hover:bg-[#3f3f46] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3f3f46] rounded-xl font-bold shadow-sm cursor-pointer transition-colors"
                             >
                                Fechar
                             </button>
                        </div>
                    </div>
                    <div className="fixed inset-0 -z-10" onClick={() => setIsModalOpen(false)}></div>
                </div>
            )}

            <SessionDetailsModal 
                isOpen={!!viewSession} 
                onClose={() => setViewSession(null)} 
                session={viewSession} 
            />
        </div>
    </Layout>
  );
};

export default Calendario;