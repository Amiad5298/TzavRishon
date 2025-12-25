import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface BarChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  dataKey?: string;
  title: string;
  horizontal?: boolean;
  formatValue?: (value: number) => string;
  colorScheme?: string[];
}

const DEFAULT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

const BarChart: React.FC<BarChartProps> = ({
  data,
  dataKey = 'value',
  title,
  horizontal = false,
  formatValue = (v) => `${v.toFixed(1)}%`,
  colorScheme = DEFAULT_COLORS,
}) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const Chart = horizontal ? RechartsBarChart : RechartsBarChart;
  const layout = horizontal ? 'horizontal' : 'vertical';

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
      dir="rtl"
    >
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <Chart 
          data={data} 
          layout={layout}
          margin={{ top: 10, right: 10, left: horizontal ? 60 : 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          {horizontal ? (
            <>
              <XAxis 
                type="number"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
                tickFormatter={formatValue}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px', direction: 'rtl' }}
              />
            </>
          ) : (
            <>
              <XAxis 
                dataKey="name"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px', direction: 'rtl' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
                tickFormatter={formatValue}
              />
            </>
          )}
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.95)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              direction: 'rtl'
            }}
            formatter={(value: any) => [formatValue(Number(value)), 'ערך']}
            labelStyle={{ color: '#fff' }}
          />
          <Bar 
            dataKey={dataKey}
            radius={[8, 8, 0, 0]}
            animationDuration={prefersReducedMotion ? 0 : 1000}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || colorScheme[index % colorScheme.length]} 
              />
            ))}
          </Bar>
        </Chart>
      </ResponsiveContainer>
      
      {/* Screen reader text alternative */}
      <div className="sr-only" role="region" aria-label={`${title} data`}>
        {data.map((item, i) => (
          <p key={i}>{item.name}: {formatValue(item.value)}</p>
        ))}
      </div>
    </motion.div>
  );
};

export default BarChart;

