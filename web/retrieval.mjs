const STOP = new Set('a an the is are was were of to in on for and or what how does do it with'.split(' '));
export function tokens(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(t => !STOP.has(t));
}
export function chunks(documents, size = 120, overlap = 25) {
  if (size < 1 || overlap < 0 || overlap >= size) throw new Error('Invalid chunk settings');
  return documents.flatMap((doc, documentIndex) => {
    const words = doc.text.trim().split(/\s+/).filter(Boolean);
    const result = [];
    for (let start = 0; start < words.length; start += size - overlap) {
      result.push({ id: `${documentIndex}:${start}`, source: doc.source, text: words.slice(start, start + size).join(' ') });
      if (start + size >= words.length) break;
    }
    return result;
  });
}
export function search(passages, question, k = 3, threshold = 0.12) {
  if (!question.trim() || question.length > 2000) throw new Error('Enter a question with 1–2000 characters.');
  const counts = text => {
    const result = new Map();
    for (const token of tokens(text)) result.set(token, (result.get(token) || 0) + 1);
    return result;
  };
  const corpus = passages.map(p => counts(p.text));
  const frequency = new Map();
  for (const doc of corpus) for (const token of doc.keys()) frequency.set(token, (frequency.get(token) || 0) + 1);
  const vector = count => {
    const raw = new Map([...count].filter(([t]) => frequency.has(t)).map(([t, n]) => [t, n * (Math.log((1 + passages.length) / (1 + frequency.get(t))) + 1)]));
    const norm = Math.sqrt([...raw.values()].reduce((total, n) => total + n * n, 0)) || 1;
    return new Map([...raw].map(([t, n]) => [t, n / norm]));
  };
  const query = vector(counts(question));
  return passages.map((passage, i) => {
    const doc = vector(corpus[i]);
    const score = [...query].reduce((total, [t, n]) => total + n * (doc.get(t) || 0), 0);
    return { ...passage, score };
  }).filter(hit => hit.score > 0 && hit.score >= threshold).sort((a, b) => b.score - a.score).slice(0, k);
}
