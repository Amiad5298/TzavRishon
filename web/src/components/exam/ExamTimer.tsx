import React, { useEffect, useState, useRef } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExamTimerProps {
  startTimestamp: number;
  durationSeconds: number;
  onExpire: () => void;
  paused?: boolean;
}

const ExamTimer: React.FC<ExamTimerProps> = ({ 
  startTimestamp, 
  durationSeconds, 
  onExpire, 
  paused = false 
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [showAlert, setShowAlert] = useState(false);
  const lastAlertRef = useRef<number | null>(null);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    if (paused || hasExpiredRef.current) return;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimestamp) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);
      
      setRemainingSeconds(remaining);

      // Show alerts at thresholds (10m, 5m, 1m)
      if (remaining > 0) {
        const thresholds = [600, 300, 60];
        for (const threshold of thresholds) {
          if (remaining <= threshold && lastAlertRef.current !== threshold) {
            lastAlertRef.current = threshold;
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            break;
          }
        }
      }

      if (remaining === 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpire();
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTimestamp, durationSeconds, paused, onExpire]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    if (remainingSeconds <= 60) return 'text-red-400';
    if (remainingSeconds <= 300) return 'text-orange-400';
    return 'text-slate-200';
  };

  return (
    <div className="relative">
      <div className={`flex items-center gap-2 ${getColorClass()} font-mono font-semibold text-lg transition-colors`}>
        <Clock size={20} />
        <span>{formatTime(remainingSeconds)}</span>
      </div>
      
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute top-full left-0 mt-2 px-3 py-2 bg-amber-600/95 text-white text-sm rounded-lg shadow-lg whitespace-nowrap flex items-center gap-2 backdrop-blur-sm"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle size={16} />
            <span>נשארו {Math.floor(remainingSeconds / 60)} דקות</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamTimer;

