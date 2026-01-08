import React from 'react';
import { Clock, Flame, BookOpen, Target } from 'lucide-react';
import StatCard from './StatCard';
import QuestionsStatCard from './QuestionsStatCard';

const StatsGrid = ({ stats, questionsStats, streak }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

      <StatCard 
        label="Streak" 
        value={`${streak || 0} dias`}
        icon={Flame} 
        colorText="text-orange-500"
        colorBg="bg-orange-500/10"
        colorBorder="border-orange-500/20"
        glowColor="bg-orange-600"
      />

      <StatCard 
        label="Total Horas" 
        value={stats.totalHours} 
        icon={Clock} 
        colorText="text-blue-400"
        colorBg="bg-blue-500/10"
        colorBorder="border-blue-500/20"
        glowColor="bg-blue-500"
      />

      <StatCard 
        label="Sessões" 
        value={stats.completedSessions} 
        icon={BookOpen} 
        colorText="text-green-400"
        colorBg="bg-green-500/10"
        colorBorder="border-green-500/20"
        glowColor="bg-green-500"
      />

      <StatCard 
        label="Metas" 
        value={stats.activeGoals} 
        icon={Target} 
        colorText="text-purple-400"
        colorBg="bg-purple-500/10"
        colorBorder="border-purple-500/20"
        glowColor="bg-purple-500"
      />

      <QuestionsStatCard 
        total={questionsStats.total} 
        correct={questionsStats.correct} 
      />
    </div>
  );
};

export default StatsGrid;
