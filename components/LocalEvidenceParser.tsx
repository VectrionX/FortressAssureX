import React, { useState } from 'react';
import { parseLocalEvidence, type LocalEvidenceParseResult } from '../services/assessmentModel';

interface Props { onUseExcerpt: (reference: string, excerpt: string) => void; }

export const LocalEvidenceParser: React.FC<Props> = ({ onUseExcerpt }) => {
  const [filename, setFilename] = useState('evidence.txt');
  const [content, setContent] = useState('');
  const [result, setResult] = useState<LocalEvidenceParseResult | null>(null);
  const readFile = (file: File) => { setFilename(file.name); const reader = new FileReader(); reader.onload = () => setContent(String(reader.result ?? '')); reader.onerror = () => setResult({ format: 'unknown', excerpts: [], error: 'The local file could not be read.' }); reader.readAsText(file); };
  const parse = () => setResult(parseLocalEvidence(content, filename));
  return <section className="mt-8 rounded-2xl border border-cyan-200 bg-cyan-50 p-5" aria-label="Local evidence parser">
    <h3 className="font-bold text-cyan-950">Local evidence helper</h3>
    <p className="mt-1 text-xs leading-5 text-cyan-900">Optional, local-only text extraction (1 MB / 2,000 lines). Nothing is uploaded or transmitted. It produces excerpts only; you must verify and record any finding yourself.</p>
    <div className="mt-3 flex flex-wrap gap-3"><input type="file" accept=".txt,.text,.md,.csv,.json,.yaml,.yml,.ini,.conf,.cfg,.xml,.log,.report,.html" onChange={event => { const file = event.target.files?.[0]; if (file) readFile(file); }} className="text-xs" /><input value={filename} onChange={event => setFilename(event.target.value)} className="rounded-lg border border-cyan-300 px-2 py-1 text-xs" aria-label="Evidence filename" /><button type="button" onClick={parse} className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-bold text-white">Parse locally</button></div>
    <textarea value={content} onChange={event => setContent(event.target.value)} rows={3} className="mt-3 w-full rounded-lg border border-cyan-300 bg-white p-2 font-mono text-xs" placeholder="Or paste authorized text here; parsing remains in this browser." />
    {result?.error && <p className="mt-3 text-sm font-semibold text-rose-800">{result.error}</p>}
    {result && !result.error && <div className="mt-3 space-y-2"><p className="text-xs font-semibold text-cyan-950">Detected {result.format}; {result.excerpts.length} excerpt{result.excerpts.length === 1 ? '' : 's'}. {result.warnings?.[0]}</p>{result.excerpts.slice(0, 20).map(excerpt => <button type="button" key={excerpt.lineStart} onClick={() => onUseExcerpt(filename, `Lines ${excerpt.lineStart}-${excerpt.lineEnd}: ${excerpt.text}`)} className="block w-full rounded-lg border border-cyan-200 bg-white p-2 text-left font-mono text-xs hover:border-cyan-600">Use lines {excerpt.lineStart}-{excerpt.lineEnd}: {excerpt.text}</button>)}</div>}
  </section>;
};
