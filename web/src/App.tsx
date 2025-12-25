import { CssBaseline, ThemeProvider } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import { Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { createRtlCache, theme } from './theme';
import i18n from './i18n';

import Home from './pages/Home';
import Practice from './pages/Practice';
import Exam from './pages/Exam';
import Progress from './pages/Progress';
import LearningPlan from './pages/LearningPlan';
import QuestionBank from './pages/QuestionBank';
import AuthCallback from './pages/AuthCallback';
import Layout from './components/Layout';

const rtlCache = createRtlCache();

function App() {
  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>
          <CssBaseline />
          <AuthProvider>
            <AudioProvider>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="practice" element={<Practice />} />
                  <Route path="exam" element={<Exam />} />
                  <Route path="progress" element={<Progress />} />
                  <Route path="learning-plan" element={<LearningPlan />} />
                  <Route path="question-bank" element={<QuestionBank />} />
                </Route>
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Routes>
            </AudioProvider>
          </AuthProvider>
        </I18nextProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;

