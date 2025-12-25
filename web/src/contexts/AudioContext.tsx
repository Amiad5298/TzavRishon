import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AudioContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playCorrect: () => void;
  playIncorrect: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem('soundEnabled') !== 'false'
  );

  const correctAudio = typeof Audio !== 'undefined' ? new Audio('/sfx/correct.mp3') : null;
  const incorrectAudio = typeof Audio !== 'undefined' ? new Audio('/sfx/incorrect.mp3') : null;

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('soundEnabled', String(newValue));
  };

  const playCorrect = () => {
    if (soundEnabled && correctAudio) {
      correctAudio.currentTime = 0;
      correctAudio.play().catch(() => {});
    }
  };

  const playIncorrect = () => {
    if (soundEnabled && incorrectAudio) {
      incorrectAudio.currentTime = 0;
      incorrectAudio.play().catch(() => {});
    }
  };

  return (
    <AudioContext.Provider value={{ soundEnabled, toggleSound, playCorrect, playIncorrect }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

