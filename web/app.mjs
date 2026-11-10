import { chunks, search } from './retrieval.mjs';
const $ = id => document.getElementById(id);
let documents = [];
let sampleDocuments = [];
function setStatus(message) { $('status').textContent = message; }
function renderLibrary() {
  $('document-count').textContent = documents.length;
  $('documents').replaceChildren(...documents.map(doc => {
    const li = document.createElement('li');
    const icon = document.createElement('span'); icon.className = 'doc-icon'; icon.textContent = '▤'; icon.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span'); name.className = 'doc-name'; name.textContent = doc.source;
    const type = document.createElement('span'); type.className = 'doc-type'; type.textContent = `${doc.text.trim().split(/\s+/).filter(Boolean).length} words · Ready to search`;
    name.append(type); li.append(icon, name); return li;
  }));
}
function clearResults() {
  $('results').hidden = true;
  $('empty-state').hidden = false;
  $('passages').replaceChildren();
}
$('question-form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    const hits = search(chunks(documents), $('question').value);
    $('empty-state').hidden = true;
    $('results').hidden = hits.length === 0;
    $('passages').replaceChildren(...hits.map((hit, i) => {
      const article = document.createElement('article'); article.className = 'passage';
      const title = document.createElement('h3'); title.textContent = `[${i + 1}] ${hit.source}`;
      const text = document.createElement('p'); text.textContent = hit.text;
      article.append(title, text); return article;
    }));
    setStatus(hits.length ? `${hits.length} matching source passage${hits.length === 1 ? '' : 's'} found.` : 'Insufficient evidence in the indexed documents. Try a different question or add a relevant document.');
  } catch (error) { clearResults(); setStatus(error.message); }
});
for (const button of document.querySelectorAll('.example')) button.addEventListener('click', () => {
  $('question').value = button.textContent; $('question-form').requestSubmit();
});
$('upload').addEventListener('click', () => $('files').click());
$('files').addEventListener('change', async event => {
  const errors = []; let added = 0;
  try {
    // Bound total work as retrieval runs in the browser's main thread.
    for (const file of event.target.files) {
      if (documents.length >= 30) { errors.push('The workspace limit is 30 documents.'); break; }
      if (!/\.(md|txt)$/i.test(file.name)) { errors.push(`${file.name}: use .md or .txt files.`); continue; }
      if (file.size > 2_000_000) { errors.push(`${file.name}: exceeds the 2 MB limit.`); continue; }
      const text = await file.text();
      if (!text.trim()) { errors.push(`${file.name}: file is empty.`); continue; }
      if (documents.reduce((n, doc) => n + doc.text.length, 0) + text.length > 4_000_000) { errors.push('The workspace text limit is 4 million characters.'); break; }
      documents.push({ source: file.name, text }); added++;
    }
    renderLibrary(); clearResults();
    setStatus([added ? `Added ${added} document${added === 1 ? '' : 's'}. Ask a question to search all sources.` : '', ...errors].filter(Boolean).join(' '));
  } catch { setStatus('Could not read the file. Please try a different text file.'); }
  finally { $('files').value = ''; }
});
$('reset').addEventListener('click', () => {
  documents = [...sampleDocuments]; renderLibrary(); clearResults(); setStatus('Sample documents restored.');
});
try {
  const response = await fetch('documents.json');
  if (!response.ok) throw new Error('Sample documents unavailable');
  sampleDocuments = await response.json(); documents = [...sampleDocuments]; renderLibrary();
  for (const element of [$('upload'), $('reset'), $('ask'), $('question'), ...document.querySelectorAll('.example')]) element.disabled = false;
  setStatus('Ready. Ask a question or add your own documents.');
} catch { setStatus('Unable to load the document library. Refresh the page to try again.'); }
