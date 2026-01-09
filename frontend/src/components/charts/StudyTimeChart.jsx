import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const StudyTimeChart = ({ sessions, activeColor, rangeLabel, range }) => {

  const data = useMemo(() => {
    const sessionList = sessions || [];
    const groupedData = {};
    const today = new Date();

    // 1. GERAÇÃO DO ESQUELETO DE DATAS
    if (range === 'year') {
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
            
            groupedData[key] = { 
                name: key.charAt(0).toUpperCase() + key.slice(1), 
                minutes: 0,
                order: d.getTime() 
            };
        }
    } else {
        let daysToGoBack = 7;
        if (range === '30days') daysToGoBack = 30;
        if (range === '90days') daysToGoBack = 90;

        for (let i = daysToGoBack - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            
            groupedData[key] = {
                name: key,
                minutes: 0,
                order: d.getTime()
            };
        }
    }

    // 2. PREENCHIMENTO DOS DADOS
    sessionList.forEach(session => {
        const date = new Date(session.date);
        let key;

        if (range === 'year') {
            key = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
        } else {
            key = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        }

        if (groupedData[key]) {
            groupedData[key].minutes += session.durationMinutes;
        }
    });

    return Object.values(groupedData)
        .sort((a, b) => a.order - b.order)
        .map(item => ({
            name: item.name,
            hours: Number((item.minutes / 60).toFixed(1))
        }));

  }, [sessions, range]);

  // --- LÓGICA DE INTERVALO CORRIGIDA ---
  const getInterval = () => {
      if (range === '7days') return 0;  // Mostra todos os dias
      if (range === 'year') return 0;   // Mostra todos os meses
      
      if (range === '30days') return 2; // Mostra 1, esconde 2 (Exibe a cada 3 dias)
      if (range === '90days') return 6; // Mostra 1, esconde 6 (Exibe a cada semana)
      
      return 'preserveStartEnd';
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm transition-colors">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="font-bold text-text flex items-center gap-2">
                Ritmo de Estudos
                <span className="text-xs font-normal text-text-muted bg-background px-2 py-1 rounded border border-border">
                    {rangeLabel}
                </span>
            </h3>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={activeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }} // Reduzi levemente a fonte para caber melhor
                dy={10}
                interval={getInterval()} // <--- AQUI APLICA A REGRA DE 3 DIAS
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                unit="h"
            />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)',
                    borderRadius: '8px'
                }}
                itemStyle={{ color: activeColor }}
                formatter={(value) => [`${value} horas`, 'Tempo Estudado']}
            />
            <Area 
                type="monotone" 
                dataKey="hours" 
                stroke={activeColor} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorStudy)" 
                animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudyTimeChart;