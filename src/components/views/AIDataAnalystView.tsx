import React from 'react';
import {
  MessageSquareCode,
  Sparkles,
  Send,
  Database,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Terminal,
  FileSearch,
  Code
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  toolsUsed?: string[];
  evidence?: any[];
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  'Which municipal zones have the highest risk index and SLA breach rates?',
  'What is the 14-day projected complaint trajectory and model accuracy metrics?',
  'List all current statistical anomaly surges and identify emergency safety concerns.',
  'Search municipal SOP standards for asphalt pothole patching procedures.',
  'Compare complaint backlog volume between Downtown North and Industrial Heights.',
];

export const AIDataAnalystView: React.FC = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am **CivicPulse AI's Senior Urban Data Analyst**. 

I am equipped with real-time tool calling that executes calculations directly against the live municipal complaint repository, time-series forecasting models, and standard operating procedure documentation.

Ask me any operational, geospatial, or predictive question about city infrastructure, or select one of the suggested prompts below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const sendMessage = async (promptText: string) => {
    if (!promptText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || 'No response generated.',
        toolsUsed: data.toolsUsed,
        evidence: data.evidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `An error occurred while communicating with the analytics engine: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[850px] rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 p-4 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/20">
            <MessageSquareCode className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Natural Language Urban Data Analyst
              </h3>
              <span className="flex items-center gap-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 text-[9px] font-bold">
                <Sparkles className="h-2.5 w-2.5" />
                Gemini 3.8 Flash + Tool Calling
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Direct execution against active records, ML models, and municipal SOP documentation
            </p>
          </div>
        </div>

        <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Grounded Database Tools Active</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-200">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 shadow-sm ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              {/* Tool Execution Badge if AI used tools */}
              {m.toolsUsed && m.toolsUsed.length > 0 && (
                <div className="mb-3 flex items-center gap-1.5 flex-wrap rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-1 text-[10px] text-cyan-300">
                  <Terminal className="h-3 w-3 text-cyan-400" />
                  <span className="font-semibold">Tools Executed:</span>
                  {m.toolsUsed.map((t) => (
                    <span key={t} className="font-mono rounded bg-slate-900 px-1.5 py-0.5 border border-slate-700">
                      {t}()
                    </span>
                  ))}
                </div>
              )}

              {/* Message text with basic markdown support */}
              <div className="whitespace-pre-wrap leading-relaxed text-xs">
                {m.text}
              </div>

              <div className={`mt-2 text-[10px] text-right ${m.sender === 'user' ? 'text-cyan-200' : 'text-slate-500'}`}>
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 max-w-md animate-pulse">
            <div className="h-5 w-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            <div className="text-xs text-slate-400">
              Executing analytical database queries & synthesizing response...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts Pill Container */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 p-3 px-6">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
          <HelpCircle className="h-3 w-3" />
          <span>Recommended Analytical Inquiries:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SUGGESTED_PROMPTS.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(sp)}
              className="shrink-0 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-500/50 hover:text-white transition-colors"
            >
              {sp}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Input Field */}
      <div className="border-t border-slate-800 bg-slate-950 p-4 px-6 flex items-center gap-3">
        <input
          type="text"
          placeholder="Ask an urban operations or dataset question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          disabled={loading}
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
