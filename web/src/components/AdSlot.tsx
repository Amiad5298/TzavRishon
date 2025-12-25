import React from 'react';

interface AdSlotProps {
  slot?: string;
  format?: string;
  responsive?: boolean;
}

const AdSlot: React.FC<AdSlotProps> = () => {
  const adsenseEnabled = (import.meta as any).env.VITE_ADSENSE_ENABLED === 'true';
  const adsenseClient = (import.meta as any).env.VITE_ADSENSE_CLIENT;

  if (!adsenseEnabled || !adsenseClient) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100px',
        background: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '1rem 0',
        border: '1px dashed #ccc',
      }}
    >
      <span style={{ color: '#999' }}>פרסומת</span>
      {/* In production, real AdSense code would go here */}
    </div>
  );
};

export default AdSlot;

