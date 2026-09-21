import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Consultant } from '../types';
import {
  Users,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Star,
  ChevronLeft,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface AdminConsultantsProps {
  onNavigate: (path: string) => void;
}

export const AdminConsultants: React.FC<AdminConsultantsProps> = ({ onNavigate }) => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConsultant, setEditingConsultant] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('+91 ');
  const [formAvatar, setFormAvatar] = useState('');
  const [formDomain, setFormDomain] = useState('Full Stack Development');
  const [formBio, setFormBio] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formFee, setFormFee] = useState(999);
  const [formMinNotice, setFormMinNotice] = useState(24);
  const [formStartHour, setFormStartHour] = useState('09:00');
  const [formEndHour, setFormEndHour] = useState('18:00');

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; data: Consultant[] }>('/consultants');
      setConsultants(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('+91 98765 43210');
    setFormAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
    setFormDomain('Full Stack Development');
    setFormBio('');
    setFormSkills('React, Node.js, TypeScript, Architecture');
    setFormFee(999);
    setFormMinNotice(24);
    setFormStartHour('09:00');
    setFormEndHour('18:00');
    setIsCreating(true);
  };

  const handleOpenEdit = (c: Consultant) => {
    setEditingConsultant(c);
    setFormName(c.name);
    setFormEmail(c.email);
    setFormPhone(c.phone);
    setFormAvatar(c.avatar);
    setFormDomain(c.domain);
    setFormBio(c.bio);
    setFormSkills(c.skills.join(', '));
    setFormFee(c.fee || 999);
    setFormMinNotice(c.minNoticeHours || 24);
    setFormStartHour(c.workingHours.start || '09:00');
    setFormEndHour(c.workingHours.end || '18:00');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    const payload = {
      name: formName,
      email: formEmail,
      phone: formPhone,
      avatar: formAvatar,
      domain: formDomain,
      bio: formBio,
      skills: formSkills.split(',').map((s) => s.trim()).filter(Boolean),
      fee: Number(formFee),
      minNoticeHours: Number(formMinNotice),
      workingHours: {
        start: formStartHour,
        end: formEndHour,
      },
      workingDays: [1, 2, 3, 4, 5],
    };

    try {
      if (isCreating) {
        await apiRequest('/admin/consultants', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } else if (editingConsultant) {
        await apiRequest(`/admin/consultants/${editingConsultant._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }

      setIsCreating(false);
      setEditingConsultant(null);
      fetchConsultants();
    } catch (err: any) {
      alert(err.message || 'Save failed.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleActive = async (c: Consultant) => {
    try {
      await apiRequest(`/admin/consultants/${c._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      fetchConsultants();
    } catch (e: any) {
      alert(e.message || 'Update failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <button
            onClick={() => onNavigate('/admin')}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Consultant Management</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Maintain mentor rosters, hourly rate defaults, working hours, and minimum booking notice.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Mentor</span>
        </button>
      </div>

      {/* Consultants Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-400">Loading consultants...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {consultants.map((c) => (
            <div
              key={c._id}
              className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800/90 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-zinc-700/60"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{c.name}</h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-xs text-emerald-400 font-medium">{c.domain}</p>
                      <p className="text-[11px] text-zinc-500">{c.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleActive(c)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                      c.isActive
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
                    <span className="text-[10px] text-zinc-500 block">Working Hours</span>
                    <span className="font-semibold text-zinc-200">
                      {c.workingHours.start} – {c.workingHours.end}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
                    <span className="text-[10px] text-zinc-500 block">Advance Notice</span>
                    <span className="font-semibold text-zinc-200">{c.minNoticeHours} Hours</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {c.skills.slice(0, 4).map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700/50"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card footer */}
              <div className="pt-4 border-t border-zinc-800/70 flex items-center justify-between">
                <span className="text-xs font-bold text-white">₹{c.fee} / 1 hour</span>

                <button
                  onClick={() => handleOpenEdit(c)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Configure Settings</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Consultant Modal */}
      {(isCreating || editingConsultant) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">
              {isCreating ? 'Add New Organization Consultant' : `Edit: ${editingConsultant?.name}`}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Domain / Title</label>
                  <input
                    type="text"
                    required
                    value={formDomain}
                    onChange={(e) => setFormDomain(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  required
                  value={formAvatar}
                  onChange={(e) => setFormAvatar(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Bio / Profile Description</label>
                <textarea
                  rows={3}
                  required
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Fee (INR)</label>
                  <input
                    type="number"
                    value={formFee}
                    onChange={(e) => setFormFee(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Min Notice (Hours)</label>
                  <input
                    type="number"
                    value={formMinNotice}
                    onChange={(e) => setFormMinNotice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Start Hour</label>
                  <input
                    type="text"
                    value={formStartHour}
                    onChange={(e) => setFormStartHour(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">End Hour</label>
                  <input
                    type="text"
                    value={formEndHour}
                    onChange={(e) => setFormEndHour(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingConsultant(null);
                  }}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold disabled:opacity-50 transition-colors"
                >
                  {saveLoading ? 'Saving...' : 'Save Consultant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
