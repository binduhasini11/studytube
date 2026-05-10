import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ExternalLink, Clock, BookOpen, Tag } from 'lucide-react';
import { getHistory, removeFromHistory, clearHistory } from '../utils/storage';
import { getYouTubeUrl } from '../utils/youtube';
import type { HistoryItem } from '../types';

const PURPOSE_COLORS: Record<string, string> = {
  learn:       '#4f6ef7',
  research:    '#10b981',
  educational: '#f59e0b',
  story:       '#ec4899',
  other:       '#6b7280',
};

const PURPOSE_LABELS: Record<string, string> = {
  learn:       'Learn',
  research:    'Research',
  educational: 'Educational',
  story:       'Story',
  other:       'General',
};

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>(getHistory);

  function remove(id: string) {
    removeFromHistory(id);
    setItems(getHistory());
  }

  function clear() {
    if (confirm('Clear all history? This cannot be undone.')) {
      clearHistory();
      setItems([]);
    }
  }

  if (items.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="card flex items-center justify-center mx-auto mb-6"
            style={{ width: 72, height: 72, borderRadius: 20 }}>
            <BookOpen size={28} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--text)', marginBottom: 10 }}>
            No history yet
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>
            Summaries are saved automatically after each analysis.
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 32, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Summary History
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 4 }}>
            {items.length} saved {items.length === 1 ? 'video' : 'videos'}
          </p>
        </div>
        <button onClick={clear}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: 'var(--red)', background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          <Trash2 size={14} /> Clear all
        </button>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AnimatePresence>
          {items.map((item, i) => {
            const color = PURPOSE_COLORS[item.purpose] ?? '#4f6ef7';
            return (
              <motion.article key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ delay: i * 0.04 }}
                className="card"
                style={{ display: 'flex', overflow: 'hidden' }}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', width: 120, flexShrink: 0 }}>
                  <img src={item.thumbnail} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`; }}
                  />
                  <span style={{ position: 'absolute', top: 8, left: 8, background: color, color: '#fff', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.04em' }}>
                    {PURPOSE_LABELS[item.purpose]}
                  </span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '16px 18px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                      {item.title}
                    </p>
                    {item.channelName && (
                      <p style={{ fontSize: 13, color, marginBottom: 8, fontWeight: 500 }}>{item.channelName}</p>
                    )}
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 10 }}>
                      {item.summary}
                    </p>
                    {item.tags?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                        {item.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="tag-chip" style={{ background: `${color}15`, color, fontSize: 11 }}>
                            <Tag size={9} /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Clock size={12} />
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={getYouTubeUrl(item.videoId)} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', padding: '6px', borderRadius: 8, color: 'var(--primary)', background: 'var(--primary-dim)' }}
                        aria-label="Watch on YouTube">
                        <ExternalLink size={14} />
                      </a>
                      <button onClick={() => remove(item.id)}
                        style={{ display: 'inline-flex', padding: '6px', borderRadius: 8, color: 'var(--red)', background: 'var(--red-dim)', cursor: 'pointer', border: 'none' }}
                        aria-label="Remove">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </main>
  );
}
