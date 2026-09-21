import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Mail, Clock, ChevronLeft, Eye, X, CheckCircle2 } from 'lucide-react';

interface AdminEmailsProps {
  onNavigate: (path: string) => void;
}

export const AdminEmails: React.FC<AdminEmailsProps> = ({ onNavigate }) => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; data: any[] }>('/admin/emails');
      setEmails(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <button
            onClick={() => onNavigate('/admin')}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Admin Overview
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">System Email Dispatch Log</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time delivery records for booking confirmations, tax receipts, and schedule changes.
          </p>
        </div>

        <button
          onClick={fetchEmails}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
        >
          Refresh Logs
        </button>
      </div>

      <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-500">Loading email records...</div>
        ) : emails.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">
            No emails logged yet. Confirm a booking to trigger an email confirmation.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {emails.map((m) => (
              <div
                key={m.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-850 transition-colors text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-bold text-white text-sm">{m.subject}</span>
                  </div>
                  <p className="text-zinc-400">
                    To: <strong className="text-zinc-200">{m.to}</strong>
                    {m.receiptId && (
                      <span className="ml-2 font-mono text-emerald-400">
                        ({m.receiptId})
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Dispatched: {new Date(m.sentAt).toLocaleTimeString()} • {new Date(m.sentAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    Delivered
                  </span>
                  <button
                    onClick={() => setSelectedEmail(m)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview HTML</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HTML Email Preview Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedEmail.subject}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Recipient: {selectedEmail.to}</p>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 rounded-2xl bg-zinc-950 border border-zinc-800"
              dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
