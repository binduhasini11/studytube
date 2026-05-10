import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Home from './pages/Home';
import History from './pages/History';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('st-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('st-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }

  return (
    <BrowserRouter>
      {/* Dark mode depth orbs — only visible in dark theme via CSS */}
      <div className="bg-orb bg-orb-1" aria-hidden />
      <div className="bg-orb bg-orb-2" aria-hidden />

      <div className="relative z-10 min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
        <Header theme={theme} onToggleTheme={toggleTheme} />

        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/"        element={<Home />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </AnimatePresence>

        <footer className="mt-auto py-7 text-center" style={{ borderTop: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.07em' }}>
            STUDYTUBE AI &mdash; LEARN SMARTER &mdash; POWERED BY OPEN-SOURCE NLP
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
