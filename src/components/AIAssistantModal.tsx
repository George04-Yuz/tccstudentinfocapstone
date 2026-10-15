import React, { useState } from 'react';
import { Sparkles, RefreshCw, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai/analyze-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: [
            { name: 'Lucas Cruz', gpa: 3.85, attendance: 96, risk: 'Optimal' },
            { name: 'Ethan Walker', gpa: 2.35, attendance: 74, risk: 'Critical' },
            { name: 'David Tan', gpa: 2.15, attendance: 72, risk: 'Critical' },
            { name: 'Gabriel Reyes', gpa: 2.75, attendance: 81, risk: 'Watchlist' },
          ],
          department: 'College-Wide Inquiry',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResponse(data.analysis);
      } else {
        setResponse('Unable to execute query: ' + data.error);
      }
    } catch (err: any) {
      setResponse('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-900 dark:text-slate-100 relative transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold p-1 text-sm rounded-lg"
        >
          ✕
        </button>

        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold mb-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Torres Capitol Gemini AI Academic Advisor</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Ask Gemini AI for student performance recommendations, retention strategies, or accreditation narratives.
        </p>

        <form onSubmit={handleAskAi} className="space-y-3 mb-4">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Provide a retention strategy for 2nd year Engineering students with GPA < 2.5..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading || !prompt}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{loading ? 'Consulting Gemini Model...' : 'Submit Academic Query'}</span>
          </button>
        </form>

        {response && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {response}
          </div>
        )}
      </div>
    </div>
  );
};
