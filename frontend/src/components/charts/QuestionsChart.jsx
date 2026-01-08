import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, LabelList
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, BarChart3 } from 'lucide-react';

const QuestionsChart = ({ sessions }) => {
  const [viewMode, setViewMode] = useState('DAILY'); // 'DAILY' ou 'OVERALL'

  // --- 1. DADOS PARA VISÃO DIÁRIA ---
  const dailyData = useMemo(() => {
    const grouped = {};

    sessions.forEach(session => {
        if (!session.totalQuestions || session.totalQuestions === 0) return;

        const dateKey = session.date.split('T')[0];
        
        if (!grouped[dateKey]) {
            grouped[dateKey] = { date: dateKey, correct: 0, wrong: 0 };
        }

        const correct = session.correctQuestions || 0;
        const total = session.totalQuestions || 0;
        const wrong = total - correct;

        grouped[dateKey].correct += correct;
        grouped[dateKey].wrong += wrong;
    });

    return Object.values(grouped)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(item => ({
            ...item,
            formattedDate: format(parseISO(item.date), 'dd/MM', { locale: ptBR })
        }));
  }, [sessions]);

  // --- 2. DADOS PARA VISÃO GERAL ---
  const overallData = useMemo(() => {
    let totalCorrect = 0;
    let totalWrong = 0;

    sessions.forEach(session => {
        if (!session.totalQuestions) return;
        const correct = session.correctQuestions || 0;
        const total = session.totalQuestions || 0;
        const wrong = total - correct;

        totalCorrect += correct;
        totalWrong += wrong;
    });

    const grandTotal = totalCorrect + totalWrong;
    
    if (grandTotal === 0) return [];

    const correctPct = Math.round((totalCorrect / grandTotal) * 100);
    const wrongPct = Math.round((totalWrong / grandTotal) * 100);

    return [
        { 
            name: 'Acertos', 
            value: totalCorrect, 
            color: '#10b981', 
            percentage: `${correctPct}%`
        }, 
        { 
            name: 'Erros', 
            value: totalWrong, 
            color: '#ef4444', 
            percentage: `${wrongPct}%`
        } 
    ];
  }, [sessions]);

  if (dailyData.length === 0) {
      return (
          <div className="w-full h-[350px] flex flex-col items-center justify-center text-gray-500 bg-[#1a1a1a] rounded-2xl border border-gray-800 animate-in fade-in duration-500">
              <p className="mb-2">Nenhuma questão resolvida neste período.</p>
              <p className="text-xs text-gray-600">Registre uma sessão do tipo "Questões".</p>
          </div>
      );
  }

  return (
    <div className="w-full h-[350px] bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-sm animate-in fade-in duration-500 flex flex-col">
        
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
                Desempenho em Questões
            </h3>
            
            <div className="flex p-1 bg-[#0a0a0a] rounded-lg border border-gray-800">
                <button
                    onClick={() => setViewMode('DAILY')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        viewMode === 'DAILY' 
                        ? 'bg-gray-800 text-white shadow-sm border border-gray-700' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <Calendar className="w-3 h-3" />
                    Diário
                </button>
                <button
                    onClick={() => setViewMode('OVERALL')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        viewMode === 'OVERALL' 
                        ? 'bg-gray-800 text-white shadow-sm border border-gray-700' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <BarChart3 className="w-3 h-3" />
                    Geral
                </button>
            </div>
        </div>

        <div className="w-full flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                {viewMode === 'DAILY' ? (
                    <BarChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis 
                            dataKey="formattedDate" 
                            stroke="#666" 
                            tick={{ fill: '#888', fontSize: 12 }} 
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                            cursor={{ fill: '#ffffff05' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="correct" name="Acertos" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="wrong" name="Erros" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                ) : (
                    <BarChart data={overallData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            stroke="#666" 
                            tick={{ fill: '#fff', fontSize: 14, fontWeight: 'bold' }} 
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                        
                        {/* --- AQUI ESTÁ A ALTERAÇÃO --- */}
                        <Tooltip 
                            cursor={{ fill: '#ffffff05' }}
                            contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '8px' }}
                            // Força a cor do texto "Questões: X" para branco
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => [value, 'Questões']}
                        />
                        {/* ----------------------------- */}

                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={80}>
                            {overallData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            <LabelList dataKey="percentage" position="top" fill="#fff" fontSize={12} fontWeight="bold" />
                        </Bar>
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default QuestionsChart;