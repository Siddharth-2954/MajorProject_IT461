import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import ProfileSidebar from './ProfileSidebar';
import { AuthContext } from '../../AuthContext';

export default function AdminAnnouncements() {
  const { user } = useContext(AuthContext);
  const displayName = user ? (user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email) : '';
  const email = user ? user.email || '' : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-4 gap-6">

        <main className="col-span-1 md:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Announcements (Admin)</h2>
            <p className="text-sm text-gray-500 mb-4">Quick links to announcement sections.</p>

            <div className="space-y-3">
              <Link to="/admin/announcements/lms" className="block px-4 py-3 border rounded hover:bg-gray-50">LMS Announcements</Link>
              <Link to="/admin/announcements/exam" className="block px-4 py-3 border rounded hover:bg-gray-50">Examination Announcements</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
