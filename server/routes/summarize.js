import { Router } from 'express';
import { extractVideoId, getThumbnailUrl } from '../utils/youtube.js';
import { fetchTranscript } from '../services/transcript.js';
import { summarizeByPurpose } from '../services/nlp.js';

const router = Router();

async function fetchVideoMeta(videoId) {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { title: null, channelName: null };
    const data = await res.json();
    return {
      title: data.title || null,
      channelName: data.author_name || null,
    };
  } catch {
    return { title: null, channelName: null };
  }
}

router.post('/summarize', async (req, res) => {
  const { url, purpose = 'other' } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid YouTube URL.' });
  }

  const videoId = extractVideoId(url.trim());
  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL. Please check the link and try again.' });
  }

  const validPurposes = ['learn', 'research', 'educational', 'story', 'other'];
  const normalizedPurpose = validPurposes.includes(purpose) ? purpose : 'other';

  try {
    const [transcript, meta] = await Promise.all([
      fetchTranscript(videoId),
      fetchVideoMeta(videoId),
    ]);

    const analysis = summarizeByPurpose(transcript.text, normalizedPurpose);

    return res.json({
      videoId,
      thumbnail: getThumbnailUrl(videoId),
      title: meta.title || `YouTube Video (${videoId})`,
      channelName: meta.channelName || 'Unknown Channel',
      wordCount: transcript.wordCount,
      ...analysis,
    });
  } catch (err) {
    const msg = err.message || 'An error occurred while processing the video.';
    const statusMap = {
      'private': 403,
      'captions': 422,
      'transcript': 422,
      'Invalid': 400,
    };
    const status = Object.entries(statusMap).find(([k]) => msg.includes(k))?.[1] ?? 500;
    return res.status(status).json({ error: msg });
  }
});

export default router;
