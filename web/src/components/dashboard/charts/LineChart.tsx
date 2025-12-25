import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface LineChartProps {
  data: Array<{ date: string; value: number; label?: string }>;
  dataKey?: string;
  color?: string;
  title: string;
  yAxisLabel?: string;
  formatValue?: (value: number) => string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  dataKey = 'value',
  color = '#3b82f6',
  title,
  yAxisLabel,
  formatValue = (v) => `${v.toFixed(1)}%`,
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
      {yAxisLabel && (
        <p className="text-sm text-white/60 mb-2">{yAxisLabel}</p>
      )}
      
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px', direction: 'ltr' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
            tickFormatter={formatValue}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.95)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              direction: 'rtl'
            }}
            formatter={(value: any) => [formatValue(Number(value)), 'ציון']}
            labelStyle={{ color: '#fff' }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={prefersReducedMotion ? 0 : 1000}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
      
      {/* Screen reader text alternative */}
      <div className="sr-only" role="region" aria-label={`${title} data`}>
        {data.map((point, i) => (
          <p key={i}>{point.date}: {formatValue(point.value)}</p>
        ))}
      </div>
    </motion.div>
  );
};

export default LineChart;

