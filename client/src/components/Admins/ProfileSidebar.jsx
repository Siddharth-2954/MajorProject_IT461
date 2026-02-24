import React from 'react';
import { Link } from 'react-router-dom';

export default function ProfileSidebar({ displayName, email }) {
  return (
    <aside className="col-span-1 bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold mr-4">
            {displayName ? displayName.split(' ').map(n => n[0]).join('').slice(0,2) : 'AB'}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{displayName}</div>
            <div className="text-sm text-gray-500">{email}</div>
          </div>
        </div>
      </div>

      <div className="py-2">
        <Link to="/admin/profile" className="block">
          <div className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-l-4 border-purple-500 bg-purple-50">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center mr-3">
                <span className="text-purple-600 text-sm">👤</span>
              </div>
              <span className="text-purple-600 font-medium">Personal Information</span>
            </div>
            <span className="text-gray-400">›</span>
          </div>
        </Link>

        <Link to="/admin/profile/account-activity" className="block">
          <div className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center mr-3">
                <span className="text-gray-600 text-sm">📊</span>
              </div>
              <span className="text-gray-700">Account Activity</span>
            </div>
            <span className="text-gray-400">›</span>
          </div>
        </Link>

        <Link to="/admin/security-settings" className="block">
          <div className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center mr-3">
                <span className="text-gray-600 text-sm">🔒</span>
              </div>
              <span className="text-gray-700">Security Settings</span>
            </div>
            <span className="text-gray-400">›</span>
          </div>
        </Link>

        <Link to="/admin/study-materials" className="block">
          <div className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center mr-3">
                <span className="text-gray-600 text-sm">📚</span>
              </div>
              <span className="text-gray-700">Study Materials</span>
            </div>
            <span className="text-gray-400">›</span>
          </div>
        </Link>
      </div>

      <div className="p-6 border-t border-gray-100 mt-auto">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Last Login</div>
        <div className="text-sm text-gray-700 mb-3">
          {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}{' '}
          {new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }).toLowerCase()}
        </div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Login IP</div>
        <div className="text-sm text-gray-700">192.168.1.1</div>
      </div>
    </aside>
  );
}
