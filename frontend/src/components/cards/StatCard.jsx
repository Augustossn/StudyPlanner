import React from 'react';

const StatCard = ({
  label,
  value,
  icon: Icon,
  colorText,
  colorBg,
  colorBorder,
  glowColor
}) => {
  return (
    <div className="relative overflow-hidden bg-surface border border-border rounded-2xl p-6 hover:border-gray-600 transition-all duration-300 group h-32.5 flex flex-col justify-between">

      {/* Glow */}
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${glowColor} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity pointer-events-none`}
      />

      {/* Header */}
      <div className="flex justify-between items-start relative z-10">
        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mt-1 truncate pr-2">
          {label}
        </p>

        {/* Ícone */}
        <div
          className={`flex items-center justify-center p-2.5 rounded-xl ${colorBg} ${colorText} border ${colorBorder} shadow-sm shrink-0 backdrop-blur-sm`}
        >
          {Icon && <Icon className="w-6 h-6" strokeWidth={2.5} />}
        </div>
      </div>

      {/* Valor */}
      <div className="relative z-10 mt-2">
        <h4 className="text-3xl font-bold text-text tracking-tight truncate">
          {value}
        </h4>
      </div>
    </div>
  );
};

export default StatCard;
