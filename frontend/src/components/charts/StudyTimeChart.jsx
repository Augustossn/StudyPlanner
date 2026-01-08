import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

const StudyTimeChart = ({ sessions, activeColor }) => {

  // Processamento dos dados (Últimos 7 dias)
  const chartData = useMemo(() => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Ajuste de fuso horário simples para garantir o dia correto
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      
      // Soma os minutos das sessões que batem com a data (sessions já vem filtrado do pai)
      const totalMinutes = sessions
        .filter(s => s.date.startsWith(dateStr))
        .reduce((sum, s) => sum + s.durationMinutes, 0);
      
      last7Days.push({
        day: dayName,
        hours: Number((totalMinutes / 60).toFixed(1)),
      });
    }
    return last7Days;
  }, [sessions]);

  return (
    <div className="w-full h-[350px] bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-sm animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" style={{ color: activeColor }} />
                Ritmo de Estudos (7 dias)
            </h3>
        </div>
        
        <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={activeColor} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={activeColor} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis 
                        dataKey="day" 
                        stroke="#666" 
                        axisLine={false} 
                        tickLine={false} 
                        dy={10} 
                        tick={{fontSize: 12}} 
                    />
                    <YAxis 
                        stroke="#666" 
                        axisLine={false} 
                        tickLine={false} 
                        dx={-10} 
                        tick={{fontSize: 12}} 
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value) => [`${value}h`, 'Tempo']}
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
  );
};

export default StudyTimeChart;