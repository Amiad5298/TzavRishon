import React from 'react';
import { Box, Card, CardContent, CardActions, Typography, Button, Stack, CircularProgress } from '@mui/material';
import { BarChart3, FileText, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

interface PracticeSummaryGuestProps {
  accuracy: number;
  correctAnswers: number;
  totalQuestions: number;
  totalTimeMs: number;
  onBackToTypes: () => void;
}

export const PracticeSummaryGuest: React.FC<PracticeSummaryGuestProps> = ({
  accuracy,
  correctAnswers,
  totalQuestions,
  totalTimeMs,
  onBackToTypes,
}) => {
  const { t } = useTranslation();
  const { login } = useAuth();

  const totalSeconds = Math.max(0, Math.round((totalTimeMs || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const formattedTime = minutes > 0
    ? t('practice.summary_time_format', { minutes, seconds })
    : t('practice.summary_time_seconds_only', { seconds });

  const clampedAccuracy = Math.max(0, Math.min(100, accuracy));

  return (
    <Box
      sx={{
        mt: 4,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Card
        sx={{
          width: '100%',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.4)',
          position: 'relative',
          background: 'radial-gradient(circle at top, rgba(59,130,246,0.12), transparent 55%), #0f172a',
        }}
      >
        {/* Subtle gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom left, rgba(96,165,250,0.18), rgba(129,140,248,0.06) 40%, transparent)',
            pointerEvents: 'none',
          }}
        />

        <CardContent sx={{ position: 'relative', zIndex: 1 }} dir="rtl">
          {/* Title and subtitle */}
          <Stack spacing={1} alignItems="center" textAlign="center" sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: '.04em',
                color: '#e5e7eb',
              }}
            >
              {t('practice.guest_summary_title')}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'rgba(209,213,219,0.85)',
                maxWidth: 360,
              }}
            >
              {t('practice.guest_summary_subtitle')}
            </Typography>
          </Stack>

          {/* Center block: progress + stats */}
          <Stack
            direction="row"
            spacing={3}
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mb: 4,
              flexWrap: 'wrap',
              gap: 3,
            }}
          >
            {/* Circular accuracy indicator */}
            <Box
              sx={{
                position: 'relative',
                width: 140,
                height: 140,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.25), transparent 70%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress
                variant="determinate"
                value={clampedAccuracy}
                size={120}
                thickness={4}
                sx={{
                  color: 'primary.main',
                  opacity: 0.9,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 20,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 30% 20%, rgba(248,250,252,0.15), rgba(15,23,42,0.9))',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: '#f9fafb',
                  }}
                >
                  {clampedAccuracy.toFixed(0)}%
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(209,213,219,0.8)',
                  }}
                >
                  {t('practice.summary_accuracy_short')}
                </Typography>
              </Box>
            </Box>

            {/* Stats and benefits */}
            <Stack spacing={2} sx={{ flex: 1, minWidth: 220 }} alignItems="flex-start">
              <Stack spacing={0.5} alignItems="flex-end" sx={{ width: '100%' }}>
                <Typography
                  variant="body1"
                  sx={{ color: '#e5e7eb', fontWeight: 500 }}
                >
                  {t('practice.summary_correct', { correct: correctAnswers, total: totalQuestions })}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(209,213,219,0.85)' }}
                >
                  {formattedTime}
                </Typography>
              </Stack>

              <Stack spacing={1.2} sx={{ mt: 1 }}>
                {[{
                  icon: BarChart3,
                  label: t('practice.guest_benefit_unlimited'),
                }, {
                  icon: FileText,
                  label: t('practice.guest_benefit_tracking'),
                }, {
                  icon: Clock,
                  label: t('practice.guest_benefit_exams'),
                }].map(({ icon: Icon, label }) => (
                  <Stack
                    key={label}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '999px',
                        background:
                          'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(129,140,248,0.4))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={18} style={{ color: '#e5edff' }} />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(229,231,235,0.95)',
                        fontWeight: 400,
                      }}
                    >
                      {label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Stack>

          <Stack spacing={1} alignItems="flex-end" sx={{ mb: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(209,213,219,0.9)' }}
            >
              {t('practice.guest_benefit_progress')}
            </Typography>
          </Stack>
        </CardContent>

        <CardActions
          sx={{
            position: 'relative',
            zIndex: 1,
            flexDirection: 'column',
            alignItems: 'stretch',
            p: 2.5,
            pt: 0,
            gap: 1.5,
          }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={login}
            sx={{
              py: 1.2,
              borderRadius: 999,
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'none',
              backgroundImage:
                'linear-gradient(135deg, #3b82f6, #6366f1)',
              boxShadow:
                '0 15px 40px rgba(37,99,235,0.55)',
              '&:hover': {
                backgroundImage:
                  'linear-gradient(135deg, #2563eb, #4f46e5)',
                boxShadow:
                  '0 20px 55px rgba(37,99,235,0.75)',
              },
            }}
          >
            {t('practice.guest_cta_register')}
          </Button>
          <Button
            variant="text"
            color="inherit"
            fullWidth
            onClick={onBackToTypes}
            sx={{
              color: 'rgba(209,213,219,0.9)',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            {t('practice.back_to_types')}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default PracticeSummaryGuest;
