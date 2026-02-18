import React, { useContext, useEffect, useState } from "react";
import ProfileSidebar from './ProfileSidebar';
import { AuthContext } from "../../AuthContext";

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

export default function AdminSecuritySettings() {
  const { user } = useContext(AuthContext);
  const [saveActivity, setSaveActivity] = useState(() => {
    try {
      const v = localStorage.getItem('admin_save_activity_logs');
      return v === 'true';
    } catch (e) { return false; }
  });

  const [showChange, setShowChange] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    // on mount, try to sync preference from server (if available)
    let mounted = true;
    async function syncPref() {
      try {
        const res = await fetch(API_BASE + '/admin/me', { credentials: 'include' });
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json && json.admin && typeof json.admin.save_activity_logs !== 'undefined') {
          const sv = !!json.admin.save_activity_logs;
          setSaveActivity(sv);
          try { localStorage.setItem('admin_save_activity_logs', sv ? 'true' : 'false'); } catch (e) {}
        }
      } catch (e) {
        // ignore
      }
    }
    syncPref();

    // when opening security settings, if logging is enabled, add a login event
    try {
      if (saveActivity) {
        const key = 'admin_activity_logs';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({ event: 'login', when: new Date().toISOString(), user: user ? (user.email || user.username) : 'unknown' });
        localStorage.setItem(key, JSON.stringify(existing));
      }
    } catch (e) {
      // ignore storage errors
    }
    return () => { mounted = false; };
  }, [saveActivity, user]);

  async function toggleSave() {
    const next = !saveActivity;
    setSaveActivity(next);
    try { localStorage.setItem('admin_save_activity_logs', next ? 'true' : 'false'); } catch (e) {}

    // Persist preference to server so server-side logging respects user's choice
    try {
      await fetch(API_BASE + '/admin/save-activity', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ save: next }),
      });
    } catch (e) {
      // ignore network errors — server will continue default behavior
    }
  }

  function handleChangePassword(e) {
    e.preventDefault();
    if (!oldPass || !newPass || !confirmPass) return setStatus('Please fill all fields');
    if (newPass !== confirmPass) return setStatus('New password and confirm do not match');

    // placeholder: no backend call available here — simulate success
    setStatus('Password changed (simulated).');
    setOldPass(''); setNewPass(''); setConfirmPass(''); setShowChange(false);
  }

  const displayName = user ? (user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email) : 'Admin User';
  const email = user ? user.email || '' : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        <ProfileSidebar displayName={displayName} email={email} />

        <main className="col-span-1 md:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Security Settings</h2>
                <p className="text-sm text-gray-500">Manage security options for your admin account.</p>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Save Activity Logs Row */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Save my activity logs</div>
                    <div className="text-xs text-gray-500">When enabled, login events will be stored in local storage.</div>
                  </div>
                  <div>
                    <button
                      type="button"
                      aria-pressed={saveActivity}
                      onClick={() => {
                        console.debug('toggleSave clicked, current=', saveActivity);
                        toggleSave();
                      }}
                      className={
                        saveActivity
                          ? "w-12 h-6 flex items-center bg-blue-400 rounded-full p-1 transition-colors"
                          : "w-12 h-6 flex items-center bg-gray-400 rounded-full p-1 transition-colors"
                      }
                    >
                      <span className={"bg-white w-4 h-4 rounded-full shadow transform transition-transform " + (saveActivity ? "translate-x-6" : "translate-x-0")}></span>
                    </button>
                  </div>
                </div>

                {/* Change Password Row */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Change password</div>
                    <div className="text-xs text-gray-500">Update your account password periodically to keep your account secure.</div>
                  </div>
                  <div>
                    <button onClick={() => setShowChange(s => !s)} className="px-4 py-2 bg-blue-600 text-white rounded">Change Password</button>
                  </div>
                </div>

                {showChange && (
                  <form onSubmit={handleChangePassword} className="bg-white border rounded p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-600">Old password</label>
                        <input value={oldPass} onChange={e => setOldPass(e.target.value)} type="password" className="w-full mt-1 p-2 border rounded" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">New password</label>
                        <input value={newPass} onChange={e => setNewPass(e.target.value)} type="password" className="w-full mt-1 p-2 border rounded" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Confirm new password</label>
                        <input value={confirmPass} onChange={e => setConfirmPass(e.target.value)} type="password" className="w-full mt-1 p-2 border rounded" />
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
                        <button type="button" onClick={() => setShowChange(false)} className="px-4 py-2 border rounded">Cancel</button>
                      </div>
                      {status && <div className="text-sm text-gray-700">{status}</div>}
                    </div>
                  </form>
                )}

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
