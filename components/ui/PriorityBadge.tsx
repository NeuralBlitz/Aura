
import React from 'react';
import { ArrowUp, Minus, ArrowDown } from 'lucide-react';
import { Task } from '../../types';

interface PriorityBadgeProps {
  priority: Task['priority'];
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config = {
    high: { icon: ArrowUp, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    medium: { icon: Minus, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    low: { icon: ArrowDown, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
  };
  const c = config[priority] || config.medium;
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${c.bg} ${c.border} ${c.color}`}>
      <c.icon className="w-3 h-3" />
      <span className="text-[9px] font-black uppercase tracking-widest">{priority}</span>
    </div>
  );
};

export default PriorityBadge;
