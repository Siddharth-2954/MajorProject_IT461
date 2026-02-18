import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import { CloseOutlined } from '@ant-design/icons';
import ProfileSidebar from './ProfileSidebar';

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

export default function AccountActivity() {
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(API_BASE + '/admin/activity', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (mounted && json && json.activities) setActivities(json.activities);
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  async function handleDelete(id) {
    if (!confirm('Delete this activity entry?')) return;
    try {
      const res = await fetch(API_BASE + `/admin/activity/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setActivities(a => a.filter(x => x.id !== id));
      } else {
        alert('Failed to delete');
      }
    } catch (e) {
      alert('Network error');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        <ProfileSidebar displayName={user ? (user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : ''} email={user ? user.email : ''} />

        <main className="col-span-1 md:col-span-3">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Account Activity</h3>
            <div className="bg-white rounded-lg shadow overflow-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-sm text-gray-500">Browser</th>
                    <th className="px-4 py-2 text-sm text-gray-500">IP</th>
                    <th className="px-4 py-2 text-sm text-gray-500">Time</th>
                    <th className="px-4 py-2 text-sm text-gray-500"> </th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Loading…</td></tr>
                  )}
                  {!loading && activities.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No activity found</td></tr>
                  )}
                  {activities.map(a => (
                    <tr key={a.id} className="border-t">
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{a.browser}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{a.ip || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{new Date(a.ts).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700">
                          <CloseOutlined />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}