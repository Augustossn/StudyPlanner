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

// --- FUNÇÃO DE CORREÇÃO DE DATA ---
// Transforma "2026-01-11" em uma Data Local ao meio-dia (evita cair no dia anterior)
const parseDateSafe = (dateString) => {
  if (!dateString) return new Date();
  
  // Se vier como string (ex: "2026-01-11T10:00:00" ou "2026-01-11")
  if (typeof dateString === 'string') {
      const cleanDate = dateString.split('T')[0]; // Pega só a parte da data
      const [year, month, day] = cleanDate.split('-').map(Number);
      // Cria a data explicitamente no fuso local
      return new Date(year, month - 1, day, 12, 0, 0);
  }
  
  return new Date(dateString);
};

const StudyTimeChart = ({ sessions, activeColor, rangeLabel, range }) => {

  const data = useMemo(() => {
    const sessionList = sessions || [];
    const groupedData = {};
    const today = new Date();

    // 1. GERAÇÃO DO ESQUELETO DE DATAS (Mantive sua lógica, está boa)
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

    // 2. PREENCHIMENTO DOS DADOS (Com a correção aplicada)
    sessionList.forEach(session => {
      // AQUI ESTAVA O ERRO: Usamos a função segura agora
      const date = parseDateSafe(session.date);
      let key;

      if (range === 'year') {
        key = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
      } else {
        key = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        });
      }

      // Normaliza a chave (às vezes o navegador retorna "05/01" e o array tem "5/01")
      // Mas com o seu código de esqueleto acima, deve bater exato.
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
              padding={{ left: 10, right: 20 }}
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
                borderRadius: '8px',
                color: 'var(--text)'
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