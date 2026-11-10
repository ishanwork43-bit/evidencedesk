import { mkdir, rm, cp, readdir, readFile, writeFile } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('web', 'dist', { recursive: true });
const files = (await readdir('data')).filter(name => /\.(txt|md)$/i.test(name)).sort();
const documents = await Promise.all(files.map(async source => ({ source, text: await readFile(`data/${source}`, 'utf8') })));
await writeFile('dist/documents.json', JSON.stringify(documents));
console.log(`Built web app with ${documents.length} sample documents.`);
