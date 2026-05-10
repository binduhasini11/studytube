import { YoutubeTranscript } from 'youtube-transcript';

export async function fetchTranscript(videoId) {
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    if (!segments || segments.length === 0) {
      throw new Error('No transcript available for this video.');
    }
    const fullText = segments.map((s) => s.text).join(' ');
    return {
      text: fullText,
      segments,
      wordCount: fullText.split(/\s+/).length,
    };
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('disabled') || msg.includes('No transcript')) {
      throw new Error('This video does not have captions or transcripts enabled.');
    }
    if (msg.includes('private') || msg.includes('unavailable')) {
      throw new Error('This video is private or unavailable.');
    }
    throw new Error('Could not retrieve transcript. The video may not support captions.');
  }
}
