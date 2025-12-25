import React from 'react';
import { motion } from 'framer-motion';

export type TimeRange = '7' | '30' | '90' | 'all';

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

const TIME_RANGES = [
  { value: '7' as TimeRange, label: '7 ימים' },
  { value: '30' as TimeRange, label: '30 ימים' },
  { value: '90' as TimeRange, label: '90 ימים' },
  { value: 'all' as TimeRange, label: 'הכל' },
];

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ selected, onChange }) => {
  return (
    <div className="flex gap-2 flex-wrap" dir="rtl">
      {TIME_RANGES.map((range) => {
        const isSelected = range.value === selected;
        return (
          <motion.button
            key={range.value}
            onClick={() => onChange(range.value)}
            className={`
              px-4 py-2 rounded-xl font-medium text-sm transition-all
              ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-pressed={isSelected}
          >
            {range.label}
          </motion.button>
        );
      })}
    </div>
  );
};

export default TimeRangeSelector;

