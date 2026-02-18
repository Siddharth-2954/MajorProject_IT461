import React, { useEffect, useState, useContext } from 'react';
import ProfileSidebar from './ProfileSidebar';
import { AuthContext } from '../../AuthContext';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

export default function AdminAnnouncementsExam() {
  const { user } = useContext(AuthContext);
  const displayName = user ? (user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username) : '';
  const email = user ? user.email || '' : '';

  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(API_BASE + '/admin/announcements?type=exam', { credentials: 'include' });
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json && Array.isArray(json.announcements)) setItems(json.announcements);
      } catch (e) {}
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function handleAdd(e) {
    e && e.preventDefault();
    if (!title) return;
    try {
      const fd = new FormData();
      fd.append('type', 'exam');
      fd.append('title', title);
      fd.append('body', body || '');
      if (file) fd.append('attachment', file);
      const res = await fetch(API_BASE + '/admin/announcements', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      if (res.ok) {
        setTitle(''); setBody(''); setShowForm(false);
        const listRes = await fetch(API_BASE + '/admin/announcements?type=exam', { credentials: 'include' });
        if (listRes.ok) {
          const j = await listRes.json();
          setItems(j.announcements || []);
        }
      } else alert('Failed to add announcement');
    } catch (e) { alert('Network error'); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(API_BASE + '/admin/announcements/' + id, { method: 'DELETE', credentials: 'include' });
      if (res.ok) setItems(items.filter(i => i.id !== id));
      else alert('Failed to delete');
    } catch (e) { alert('Network error'); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        <ProfileSidebar displayName={displayName} email={email} />

        <main className="col-span-1 md:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Exam Announcements (Admin)</h2>
                <p className="text-sm text-gray-500">Manage examination announcements visible to users.</p>
              </div>
              <div>
                <button onClick={() => setShowForm(s => !s)} className="px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
                  <PlusOutlined /> Upload Exam Announcement
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {showForm && (
                <form onSubmit={handleAdd} className="space-y-3 border rounded p-4 bg-gray-50">
                  <div>
                    <label className="text-sm text-gray-700">Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-2 border rounded" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Body</label>
                    <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full mt-1 p-2 border rounded" rows={4} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Attachment (optional)</label>
                    <input type="file" onChange={e => setFile(e.target.files && e.target.files[0])} className="w-full mt-1" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Upload</button>
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded">Cancel</button>
                  </div>
                </form>
              )}

              {items.length === 0 && <div className="text-sm text-gray-500">No announcements created yet.</div>}

              {items.map(it => (
                <div key={it.id} className="border rounded p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{it.title}</div>
                      <div className="text-xs text-gray-500">{new Date(it.ts).toLocaleString()} • {it.author}</div>
                    </div>
                    <div>
                      <button onClick={() => handleDelete(it.id)} className="text-red-600 hover:text-red-800"><DeleteOutlined /></button>
                    </div>
                  </div>
                  {it.body && <div className="mt-3 text-gray-700">{it.body}</div>}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
