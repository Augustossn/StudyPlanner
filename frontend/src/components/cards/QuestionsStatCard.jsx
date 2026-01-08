import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { HelpCircle } from 'lucide-react';

const QuestionsStatCard = ({ total, correct }) => {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const wrong = total - correct;

  let data = [
    { name: 'Acertos', value: correct, color: '#10b981' },
    { name: 'Erros', value: wrong, color: '#ef4444' }
  ];

  if (total === 0) {
    data = [{ name: 'Sem dados', value: 1, color: '#333' }];
  }

  return (
    <div className="relative overflow-hidden bg-surface border border-border rounded-2xl p-6 hover:border-gray-600 transition-all duration-300 group h-32.5 flex flex-col justify-between">

      {/* Glow */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

      <div className="flex justify-between items-start relative z-10 h-full">

        {/* Texto */}
        <div className="flex flex-col h-full justify-between pr-2 max-w-[50%]">
          <div>
            <p className="text-text-muted text-xs font-bold uppercase tracking-wider mt-1">
              Taxa de Acerto
            </p>

            <div className="flex items-center gap-1 text-[10px] text-text-muted font-medium mt-1">
              <HelpCircle className="w-3 h-3 shrink-0" />
              <span>
                {correct}/{total} Questões
              </span>
            </div>
          </div>

          <h4
            className={`text-3xl font-bold tracking-tight ${
              percentage >= 70 ? 'text-emerald-400' : 'text-text'
            }`}
          >
            {percentage}%
          </h4>
        </div>

        {/* Gráfico */}
        <div className="w-25 h-25 relative -mt-4 -mr-4 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={33}
                outerRadius={45}
                paddingAngle={total > 0 ? 3 : 0}
                dataKey="value"
                stroke="none"
                startAngle={90}
                endAngle={-270}
                cornerRadius={4}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>

              {/* TOTAL NO CENTRO */}
              <text
                x="50%"
                y="52%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-(--text) text-xl font-bold"
              >
                {total}
              </text>

              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: '#0a0a0a',
                  borderColor: '#333',
                  borderRadius: '8px',
                  padding: '6px'
                }}
                itemStyle={{
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default QuestionsStatCard;
