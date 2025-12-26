'use client';

export const dynamic = 'force-dynamic';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box, Typography } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      await refreshUser();
      setTimeout(() => router.push('/'), 1000);
    };
    handleCallback();
  }, [router, refreshUser]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography>מתחבר...</Typography>
    </Box>
  );
};

export default AuthCallback;

