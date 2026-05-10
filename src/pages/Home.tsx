import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import UrlInput from '../components/UrlInput';
import LoadingState from '../components/LoadingState';
import SummaryCard from '../components/SummaryCard';
import { useSummarize } from '../hooks/useSummarize';
import { getHistory } from '../utils/storage';
import { getYouTubeUrl } from '../utils/youtube';

const FEATURES = [
  {
    icon: Zap,
    label: 'Live Transcripts',
    desc: "Pulled directly from YouTube's closed captions — no guessing, no scraping.",
    color: '#4f6ef7',
    bg:   'rgba(79,110,247,0.10)',
  },
  {
    icon: Brain,
    label: 'NLP Analysis',
    desc: 'TF-IDF ranking and key concept extraction from the actual video content.',
    color: '#10b981',
    bg:   'rgba(16,185,129,0.10)',
  },
  {
    icon: BookOpen,
    label: 'Purpose-Tailored',
    desc: 'Five output modes — learn, research, story, educational, or general.',
    color: '#f59e0b',
    bg:   'rgba(245,158,11,0.10)',
  },
];

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function Home() {
  const { loading, error, result, stage, summarize, reset } = useSummarize();
  const [history, setHistory] = useState(() => getHistory().slice(0, 3));

  function handleReset() {
    reset();
    setHistory(getHistory().slice(0, 3));
  }

  function handleSummarize(url: string, purpose: any) {
    summarize(url, purpose).then(() => setHistory(getHistory().slice(0, 3)));
  }

  const showHero = !result && !loading;

  return (
    <main className="w-full max-w-4xl mx-auto px-6 py-12 flex-1">
      <AnimatePresence mode="wait">

        {/* ── Hero ────────────────────────────────── */}
        {showHero && (
          <motion.div key="hero" variants={stagger} initial="hidden" animate="show"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.22 } }}>

            {/* Eyebrow + headline */}
            <motion.div variants={fadeUp} className="mb-10">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>

                {/* Left — headline */}
                <div>
                  <div className="eyebrow mb-5">
                    <Zap size={12} /> YouTube Summarizer
                  </div>
                  <h1
                    className="font-display"
                    style={{
                      fontSize: 'clamp(38px, 5vw, 54px)',
                      fontWeight: 900,
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                      color: 'var(--text)',
                      marginBottom: 18,
                    }}
                  >
                    Learn faster from<br />
                    <span style={{ color: 'var(--primary)' }}>any YouTube</span><br />
                    video
                  </h1>
                  <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 380 }}>
                    Paste a link, choose how you want to learn, and get an AI-powered
                    summary built from the real transcript — instantly.
                  </p>
                </div>

                {/* Right — stat cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: Zap,      num: '~3 sec',   desc: 'Average summary time',    color: '#4f6ef7', bg: 'rgba(79,110,247,0.10)'  },
                    { icon: Brain,    num: '5 modes',  desc: 'Tailored output styles',   color: '#10b981', bg: 'rgba(16,185,129,0.10)'  },
                    { icon: BookOpen, num: '100% free', desc: 'No API key required',     color: '#f59e0b', bg: 'rgba(245,158,11,0.10)'  },
                  ].map(({ icon: Icon, num, desc, color, bg }) => (
                    <div key={num} className="card flex items-center gap-4" style={{ padding: '14px 18px' }}>
                      <div className="flex items-center justify-center rounded-xl shrink-0"
                        style={{ width: 44, height: 44, background: bg }}>
                        <Icon size={20} style={{ color }} strokeWidth={2} />
                      </div>
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text)', lineHeight: 1 }}>
                          {num}
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>

            {/* Input card */}
            <motion.div variants={fadeUp} className="card mb-4" style={{ padding: 20 }}>
              <UrlInput onSubmit={handleSummarize} loading={loading} />
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-6 flex items-start gap-3 rounded-xl"
                  style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.22)', color: 'var(--red)', padding: '14px 16px', fontSize: 15 }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>⚠</span>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feature grid */}
            <motion.div variants={fadeUp} style={{ marginBottom: 36 }}>
              <div className="divider" style={{ marginBottom: 28 }} />
              <p className="section-label" style={{ marginBottom: 16 }}>How it works</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {FEATURES.map(({ icon: Icon, label, desc, color, bg }) => (
                  <div key={label} className="card" style={{ padding: 20 }}>
                    <div className="flex items-center justify-center rounded-xl mb-4"
                      style={{ width: 44, height: 44, background: bg }}>
                      <Icon size={20} style={{ color }} strokeWidth={2} />
                    </div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent history */}
            {history.length > 0 && (
              <motion.div variants={fadeUp}>
                <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                  <span className="section-label">Recent summaries</span>
                  <Link to="/history"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                    View all →
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {history.map((item) => (
                    <motion.div key={item.id} whileHover={{ x: 3 }}
                      className="card flex items-center gap-3 cursor-pointer"
                      style={{ padding: '12px 16px' }}
                      onClick={() => window.open(getYouTubeUrl(item.videoId), '_blank')}
                    >
                      <img src={item.thumbnail} alt=""
                        style={{ width: 68, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                        onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`; }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.channelName}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Loading ──────────────────────────────── */}
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="card mb-5" style={{ padding: 20 }}>
              <UrlInput onSubmit={handleSummarize} loading={loading} />
            </div>
            <LoadingState stage={stage} />
          </motion.div>
        )}

        {/* ── Result ───────────────────────────────── */}
        {result && !loading && (
          <motion.div key="result"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.38 }}>
            <SummaryCard result={result} onReset={handleReset} />
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
