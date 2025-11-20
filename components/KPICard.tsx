import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change?: number; // percentage change
  icon: React.ReactNode;
  trendLabel?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon, trendLabel = "vs last month" }) => {
  const isPositive = change && change > 0;
  const isNeutral = change === 0;
  const isNegative = change && change < 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm font-medium ${
            isPositive ? 'text-red-500' : isNegative ? 'text-green-500' : 'text-slate-500'
          } px-2 py-1 rounded-full bg-opacity-10 ${
             isPositive ? 'bg-red-50' : isNegative ? 'bg-green-50' : 'bg-slate-50'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : 
             isNegative ? <ArrowDownRight className="w-3 h-3 mr-1" /> : 
             <Minus className="w-3 h-3 mr-1" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-400 mt-1">{trendLabel}</p>
      </div>
    </div>
  );
};
