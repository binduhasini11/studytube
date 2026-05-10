import natural from 'natural';
import nlp from 'compromise';

const tokenizer = new natural.SentenceTokenizer();
const wordTokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','was','are','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'shall','can','need','this','that','these','those','i','we','you','he',
  'she','it','they','what','which','who','when','where','why','how','all',
  'each','every','both','few','more','most','other','some','such','no',
  'not','only','same','so','than','too','very','just','also','like',
  'as','if','then','into','through','during','before','after','above',
  'below','up','down','out','off','over','under','again','further',
  'here','there','about','because','while','although','though',
]);

function tokenizeSentences(text) {
  const cleaned = text.replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();
  const sentences = tokenizer.tokenize(cleaned);
  return sentences
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.split(/\s+/).length >= 5);
}

function computeTfIdf(sentences) {
  const tfidf = new TfIdf();
  sentences.forEach((s) => tfidf.addDocument(s));

  return sentences.map((sentence, i) => {
    let score = 0;
    tfidf.listTerms(i).forEach((term) => {
      if (!STOP_WORDS.has(term.term.toLowerCase())) {
        score += term.tfidf;
      }
    });
    return { sentence, score, index: i };
  });
}

function extractKeyTerms(text, topN = 10) {
  const tfidf = new TfIdf();
  tfidf.addDocument(text);
  const terms = [];
  tfidf.listTerms(0).forEach((t) => {
    if (!STOP_WORDS.has(t.term.toLowerCase()) && t.term.length > 3) {
      terms.push(t.term);
    }
  });
  return terms.slice(0, topN);
}

function extractTopics(text) {
  const doc = nlp(text.substring(0, 5000));
  const nouns = doc.nouns().out('array').slice(0, 30);
  const topics = [...new Set(
    nouns
      .map((n) => n.trim())
      .filter((n) => n.length > 3 && !STOP_WORDS.has(n.toLowerCase()))
  )].slice(0, 8);
  return topics;
}

function extractEntities(text) {
  const doc = nlp(text.substring(0, 5000));
  const people = doc.people().out('array').slice(0, 5);
  const places = doc.places().out('array').slice(0, 5);
  const orgs = doc.organizations().out('array').slice(0, 5);
  return { people, places, orgs };
}

function selectTopSentences(scored, count) {
  return scored
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence);
}

function estimateReadTime(text, wpm = 200) {
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wpm);
  return minutes < 1 ? '< 1 min' : `${minutes} min`;
}

function chunkText(text, maxChars = 8000) {
  if (text.length <= maxChars) return [text];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxChars;
    const lastPeriod = text.lastIndexOf('.', end);
    if (lastPeriod > start + maxChars * 0.5) end = lastPeriod + 1;
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

export function summarizeByPurpose(transcriptText, purpose) {
  const sentences = tokenizeSentences(transcriptText);

  if (sentences.length === 0) {
    throw new Error('Could not parse transcript content. The video may lack sufficient captions.');
  }

  const scored = computeTfIdf(sentences);
  const keyTerms = extractKeyTerms(transcriptText, 15);
  const topics = extractTopics(transcriptText);
  const entities = extractEntities(transcriptText);
  const readTime = estimateReadTime(transcriptText);

  const totalSentences = sentences.length;
  const summaryCount = Math.max(5, Math.min(12, Math.ceil(totalSentences * 0.18)));

  const topSentences = selectTopSentences(scored, summaryCount);
  const coreSummary = topSentences.join(' ');

  let output;

  switch (purpose) {
    case 'learn':
      output = buildLearnOutput(coreSummary, scored, keyTerms, topics, readTime, entities);
      break;
    case 'research':
      output = buildResearchOutput(coreSummary, scored, keyTerms, topics, readTime, entities);
      break;
    case 'educational':
      output = buildEducationalOutput(coreSummary, scored, keyTerms, topics, readTime, entities, sentences);
      break;
    case 'story':
      output = buildStoryOutput(coreSummary, scored, keyTerms, topics, readTime, entities);
      break;
    default:
      output = buildGeneralOutput(coreSummary, scored, keyTerms, topics, readTime, entities);
  }

  return output;
}

function buildLearnOutput(summary, scored, keyTerms, topics, readTime, entities) {
  const keyPoints = selectTopSentences(scored, 5).map(simplify);
  const studyNotes = selectTopSentences(scored.filter((_, i) => i % 3 === 0), 4);
  return {
    purpose: 'learn',
    summary,
    keyTakeaways: keyPoints,
    sections: [
      {
        title: 'Revision Notes',
        items: studyNotes,
      },
      {
        title: 'Study Tips',
        items: [
          'Re-read the summary and highlight concepts you find unfamiliar.',
          'Try to explain the main idea in your own words (Feynman Technique).',
          `Focus on these key terms: ${keyTerms.slice(0, 5).join(', ')}.`,
          'Create flashcards for each key takeaway to reinforce retention.',
          'Connect new concepts to things you already know.',
        ],
      },
    ],
    relatedTopics: topics,
    tags: keyTerms.slice(0, 8),
    readTime,
    quote: getMotivationalQuote('learn'),
  };
}

function buildResearchOutput(summary, scored, keyTerms, topics, readTime, entities) {
  const insights = selectTopSentences(scored, 6);
  const directions = topics.slice(0, 5).map((t) => `Explore further research on: ${t}`);
  return {
    purpose: 'research',
    summary,
    keyTakeaways: insights,
    sections: [
      {
        title: 'Key Insights',
        items: selectTopSentences(scored, 5),
      },
      {
        title: 'Research Directions',
        items: directions,
      },
      {
        title: 'Notable Concepts',
        items: keyTerms.slice(0, 6).map((t) => `Analyze the role of "${t}" in this context.`),
      },
    ],
    relatedTopics: topics,
    tags: keyTerms.slice(0, 8),
    readTime,
    quote: getMotivationalQuote('research'),
  };
}

function buildEducationalOutput(summary, scored, keyTerms, topics, readTime, entities, sentences) {
  const definitions = keyTerms.slice(0, 4).map((t) => `${t}: a key concept discussed in this video.`);
  const examples = selectTopSentences(scored.filter((s) => /example|instance|such as|like|for example/i.test(s.sentence)), 3);
  const faqs = keyTerms.slice(0, 3).map((t) => `What is the significance of "${t}"?`);
  return {
    purpose: 'educational',
    summary,
    keyTakeaways: selectTopSentences(scored, 5),
    sections: [
      {
        title: 'Key Definitions',
        items: definitions,
      },
      {
        title: 'Examples',
        items: examples.length > 0 ? examples : selectTopSentences(scored, 3),
      },
      {
        title: 'Frequently Asked Questions',
        items: faqs,
      },
    ],
    relatedTopics: topics,
    tags: keyTerms.slice(0, 8),
    readTime,
    quote: getMotivationalQuote('educational'),
  };
}

function buildStoryOutput(summary, scored, keyTerms, topics, readTime, entities) {
  const narrative = selectTopSentences(scored, 6).join(' ');
  const themes = topics.slice(0, 5);
  return {
    purpose: 'story',
    summary,
    keyTakeaways: selectTopSentences(scored, 5),
    sections: [
      {
        title: 'Narrative Overview',
        items: [narrative],
      },
      {
        title: 'Themes',
        items: themes.length > 0 ? themes : ['Identity', 'Conflict', 'Resolution', 'Growth'],
      },
      {
        title: 'Characters & Entities',
        items: entities.people.length > 0
          ? entities.people
          : ['Key figures are referenced throughout the narrative.'],
      },
      {
        title: 'Emotional Tone',
        items: detectTone(summary),
      },
    ],
    relatedTopics: topics,
    tags: keyTerms.slice(0, 8),
    readTime,
    quote: getMotivationalQuote('story'),
  };
}

function buildGeneralOutput(summary, scored, keyTerms, topics, readTime, entities) {
  return {
    purpose: 'other',
    summary,
    keyTakeaways: selectTopSentences(scored, 6),
    sections: [
      {
        title: 'Important Points',
        items: selectTopSentences(scored, 5),
      },
    ],
    relatedTopics: topics,
    tags: keyTerms.slice(0, 8),
    readTime,
    quote: getMotivationalQuote('other'),
  };
}

function simplify(sentence) {
  return sentence.replace(/\b(additionally|furthermore|moreover|consequently|nevertheless)\b/gi, '').trim();
}

function detectTone(text) {
  const lower = text.toLowerCase();
  const tones = [];
  if (/inspir|hope|achiev|success|triumph/.test(lower)) tones.push('Inspirational');
  if (/sad|loss|grief|mourn|tragic/.test(lower)) tones.push('Melancholic');
  if (/tension|conflict|struggle|challenge|fight/.test(lower)) tones.push('Tense');
  if (/joy|celebrat|happy|excited|wonder/.test(lower)) tones.push('Joyful');
  if (/learn|grow|change|transform|discover/.test(lower)) tones.push('Transformative');
  return tones.length > 0 ? tones : ['Reflective', 'Informative'];
}

function getMotivationalQuote(purpose) {
  const quotes = {
    learn: [
      '"The more that you read, the more things you will know." — Dr. Seuss',
      '"Live as if you were to die tomorrow. Learn as if you were to live forever." — Gandhi',
      '"An investment in knowledge pays the best interest." — Benjamin Franklin',
      '"Education is the passport to the future." — Malcolm X',
    ],
    research: [
      '"Research is to see what everybody else has seen, and to think what nobody else has thought." — Albert Szent-Györgyi',
      '"The important thing is to never stop questioning." — Albert Einstein',
      '"No great discovery was ever made without a bold guess." — Isaac Newton',
    ],
    educational: [
      '"Tell me and I forget. Teach me and I remember. Involve me and I learn." — Benjamin Franklin',
      '"Education is not the filling of a pail, but the lighting of a fire." — W.B. Yeats',
      '"The beautiful thing about learning is that no one can take it away from you." — B.B. King',
    ],
    story: [
      '"A reader lives a thousand lives before he dies." — George R.R. Martin',
      '"Stories are a communal currency of humanity." — Tahir Shah',
      '"We are all stories in the end." — Doctor Who',
    ],
    other: [
      '"Knowledge is power." — Francis Bacon',
      '"The mind is not a vessel to be filled, but a fire to be kindled." — Plutarch',
      '"Curiosity is the engine of achievement." — Ken Robinson',
    ],
  };
  const list = quotes[purpose] || quotes.other;
  return list[Math.floor(Math.random() * list.length)];
}
