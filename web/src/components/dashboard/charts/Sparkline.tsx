import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { motion } from 'framer-motion';

interface SparklineProps {
  data: Array<{ value: number }>;
  color?: string;
  title: string;
  count?: number;
  trend?: 'up' | 'down' | 'neutral';
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#3b82f6',
  title,
  count,
  trend,
}) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-white/60';
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4"
      dir="rtl"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-white/70">{title}</h4>
        {trend && (
          <span className={`text-xl ${getTrendColor()}`}>
            {getTrendIcon()}
          </span>
        )}
      </div>
      
      {count !== undefined && (
        <p className="text-2xl font-bold text-white mb-2">{count}</p>
      )}
      
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart data={data}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            fill={color}
            fillOpacity={0.3}
            strokeWidth={2}
            animationDuration={prefersReducedMotion ? 0 : 800}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Screen reader text */}
      <p className="sr-only">
        {title}: {count} {trend && `(${trend})`}
      </p>
    </motion.div>
  );
};

export default Sparkline;

