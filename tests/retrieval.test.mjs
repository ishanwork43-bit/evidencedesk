import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { chunks, search } from '../web/retrieval.mjs';
const docs = readdirSync('data').map(source => ({ source, text: readFileSync(`data/${source}`, 'utf8') }));
test('sample questions return the expected top source', () => {
  for (const [question, source] of [
    ['What does ACID stand for?', 'transactions.md'],
    ['Why use chunk overlap in retrieval?', 'retrieval.md'],
    ['How does TTL expire cache entries?', 'caching.md'],
  ]) assert.equal(search(chunks(docs), question)[0].source, source);
});
test('unknown questions and empty corpus return no results', () => {
  assert.deepEqual(search(chunks(docs), 'Who won the football world cup?'), []);
  assert.deepEqual(search([], 'TTL'), []);
});
test('overlap preserves boundaries and duplicate names retain unique ids', () => {
  const result = chunks([{ source: 'a.md', text: 'one two three four five six seven' }], 4, 1);
  assert.deepEqual(result.map(c => c.text), ['one two three four', 'four five six seven']);
  assert.equal(new Set(chunks([docs[0], docs[0]]).map(c => c.id)).size, 2);
});
test('input validation rejects empty and excessive questions', () => {
  assert.throws(() => search([], '  '));
  assert.throws(() => search([], 'x'.repeat(2001)));
  assert.throws(() => chunks([], 4, 4));
});
