import { useState } from 'react';
import type { SummaryResult, Purpose } from '../types';
import { saveToHistory } from '../utils/storage';

export function useSummarize() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [stage, setStage] = useState<string>('');

  async function summarize(url: string, purpose: Purpose) {
    setError(null);
    setResult(null);
    setLoading(true);
    setStage('Fetching transcript...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setStage('Analyzing content...');

      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, purpose }),
      });

      setStage('Generating summary...');

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate summary.');
      }

      const summaryResult = data as SummaryResult;
      setResult(summaryResult);

      saveToHistory({
        id: `${summaryResult.videoId}-${Date.now()}`,
        videoId: summaryResult.videoId,
        thumbnail: summaryResult.thumbnail,
        title: summaryResult.title,
        channelName: summaryResult.channelName,
        purpose: summaryResult.purpose,
        summary: summaryResult.summary,
        tags: summaryResult.tags,
        createdAt: new Date().toISOString(),
      });

    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Cannot reach the analysis server. Please make sure the backend is running.');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
      setStage('');
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return { loading, error, result, stage, summarize, reset };
}
