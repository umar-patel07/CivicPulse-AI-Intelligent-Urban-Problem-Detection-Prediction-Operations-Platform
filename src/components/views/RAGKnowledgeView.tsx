import React from 'react';
import { RAGDocument, RAGSearchResult } from '../../types';
import {
  BookOpen,
  Search,
  FileText,
  Bookmark,
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';

export const RAGKnowledgeView: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<RAGSearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedDoc, setSelectedDoc] = React.useState<RAGDocument | null>(null);

  const searchKnowledge = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/rag/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      if (data.length > 0 && !selectedDoc) {
        setSelectedDoc(data[0].document);
      }
    } catch (err) {
      console.error('RAG search err:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    searchKnowledge('');
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white lg:text-lg">
            Urban Standard Operating Procedures (SOP) Knowledge Base
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Municipal infrastructure engineering specifications, emergency response protocols, and legal ordinances
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search municipal guidelines (e.g., 'asphalt compaction', 'chlorine flush', 'noise decibel')..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchKnowledge(e.target.value);
          }}
          className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      {/* Main Split: Results List vs Document Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Search Results List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Matching Documents ({results.length})
          </h3>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {results.map((r) => {
              const isSelected = selectedDoc?.id === r.document.id;
              return (
                <div
                  key={r.document.id}
                  onClick={() => setSelectedDoc(r.document)}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-md shadow-cyan-500/10'
                      : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                      {r.document.category}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {r.document.source}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 mt-1.5 leading-snug">
                    {r.document.title}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {r.matchedSnippet}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Full Document Reader (7 cols) */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-mono mb-1">
                    <span>{selectedDoc.source}</span>
                    <span>•</span>
                    <span>Updated: {selectedDoc.lastUpdated}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    {selectedDoc.title}
                  </h3>
                </div>
                <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
                  {selectedDoc.category}
                </span>
              </div>

              {/* Document Text Content */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-xs text-slate-300 leading-relaxed space-y-3 max-h-[500px] overflow-y-auto">
                <div className="whitespace-pre-wrap font-sans">
                  {selectedDoc.content}
                </div>
              </div>

              {/* Document Tags */}
              <div className="flex items-center gap-2 flex-wrap pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Keywords:</span>
                {selectedDoc.keywords.map((kw: string) => (
                  <span
                    key={kw}
                    className="rounded-md border border-slate-800 bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-xs text-slate-500 italic">
              Select a municipal standard document from the left list to read full technical specifications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
