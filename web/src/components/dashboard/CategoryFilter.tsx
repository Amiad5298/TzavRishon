import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type QuestionTypeFilter = 'all' | 'VERBAL_ANALOGY' | 'SHAPE_ANALOGY' | 'INSTRUCTIONS_DIRECTIONS' | 'QUANTITATIVE';

interface CategoryFilterProps {
  selected: QuestionTypeFilter;
  onChange: (type: QuestionTypeFilter) => void;
}

const CATEGORIES = [
  { value: 'all' as QuestionTypeFilter, label: 'כל הסוגים' },
  { value: 'VERBAL_ANALOGY' as QuestionTypeFilter, label: 'אנלוגיה מילולית' },
  { value: 'SHAPE_ANALOGY' as QuestionTypeFilter, label: 'אנלוגיה צורנית' },
  { value: 'QUANTITATIVE' as QuestionTypeFilter, label: 'חשיבה כמותית' },
  { value: 'INSTRUCTIONS_DIRECTIONS' as QuestionTypeFilter, label: 'הוראות וכיוונים' },
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selected, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const selectedLabel = CATEGORIES.find((c) => c.value === selected)?.label || 'כל הסוגים';

  return (
    <div className="relative" dir="rtl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-4 py-2 rounded-xl
          bg-white/10 hover:bg-white/20 text-white
          transition-all font-medium text-sm
        "
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{selectedLabel}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="
                absolute left-0 mt-2 w-64 z-50
                bg-slate-800 rounded-xl border border-white/10
                shadow-2xl overflow-hidden
              "
            >
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    onChange(category.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-3 text-right transition-colors
                    ${
                      category.value === selected
                        ? 'bg-blue-600/30 text-white font-semibold'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  {category.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryFilter;

