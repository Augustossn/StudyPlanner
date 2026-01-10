import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
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

        const key = d.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        });

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
        key = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        });
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

  // --- LÓGICA DE INTERVALO ---
  const getInterval = () => {
    if (range === '7days') return 0;
    if (range === 'year') return 0;
    if (range === '30days') return 2;
    if (range === '90days') return 6;
    return 'preserveStartEnd';
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-text flex items-center gap-2">
          Ritmo de Estudos
          <span className="text-xs font-normal text-text-muted bg-background px-2 py-1 rounded border border-border">
            {rangeLabel}
          </span>
        </h3>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={activeColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              opacity={0.3}
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              allowDuplicatedCategory={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickMargin={10}
              dy={5}
              interval={getInterval()}
              padding={{ left: 10, right: 20 }} // 🔥 CORREÇÃO DO CORTE
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
              fill="url(#colorStudy)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudyTimeChart;
