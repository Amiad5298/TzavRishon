import React from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExportButton: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleExport = (format: 'pdf' | 'csv') => {
    // Stub implementation
    console.log(`Exporting data as ${format.toUpperCase()}...`);
    alert(`ייצוא ${format.toUpperCase()} יתווסף בקרוב!`);
    setIsOpen(false);
  };

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
        <Download size={16} />
        <span>ייצוא</span>
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
                absolute left-0 mt-2 w-48 z-50
                bg-slate-800 rounded-xl border border-white/10
                shadow-2xl overflow-hidden
              "
            >
              <button
                onClick={() => handleExport('pdf')}
                className="
                  w-full px-4 py-3 text-right transition-colors
                  text-white/70 hover:bg-white/10 hover:text-white
                  flex items-center gap-3
                "
              >
                <FileText size={18} />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="
                  w-full px-4 py-3 text-right transition-colors
                  text-white/70 hover:bg-white/10 hover:text-white
                  flex items-center gap-3
                "
              >
                <FileSpreadsheet size={18} />
                <span>CSV</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportButton;

