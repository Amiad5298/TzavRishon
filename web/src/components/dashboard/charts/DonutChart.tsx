import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface DonutChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title: string;
  centerText?: string;
  formatValue?: (value: number) => string;
  colorScheme?: string[];
}

const DEFAULT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  centerText,
  formatValue = (v) => `${v.toFixed(0)}%`,
  colorScheme = DEFAULT_COLORS,
}) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
      dir="rtl"
    >
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              animationDuration={prefersReducedMotion ? 0 : 1000}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || colorScheme[index % colorScheme.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                direction: 'rtl'
              }}
              formatter={(value: any) => [formatValue(Number(value)), '']}
              labelStyle={{ color: '#fff' }}
            />
            <Legend 
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ color: '#fff', direction: 'rtl' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{centerText}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Screen reader text alternative */}
      <div className="sr-only" role="region" aria-label={`${title} data`}>
        {data.map((item, i) => (
          <p key={i}>{item.name}: {formatValue(item.value)}</p>
        ))}
      </div>
    </motion.div>
  );
};

export default DonutChart;

