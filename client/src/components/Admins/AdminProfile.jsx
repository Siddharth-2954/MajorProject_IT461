import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import ProfileSidebar from './ProfileSidebar';
import { CameraOutlined, EditOutlined } from '@ant-design/icons';

export default function AdminProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Close the dropdown when the route changes (prevents it staying open on other pages)
  useEffect(() => {
    setMenuOpen(false);
    // show confirmation message when route changes
    setStatusMessage('Done — the three-dots menu will now automatically close when the route changes');
    const t = setTimeout(() => setStatusMessage(''), 4000);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // Simple display values (from server-provided `user` only)
  const displayName = user ? (user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || user.email) : "Admin User";
  const username = user ? user.username || "-" : "-";
  const email = user ? user.email || "" : "";
  const phone = user ? user.phone || "" : "";
  const dobRaw = user ? user.dob || "" : "";
  function formatDob(d) {
    if (!d) return "";
    // expect YYYY-MM-DD or ISO string
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  const dob = formatDob(dobRaw);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        <ProfileSidebar displayName={displayName} email={email} />

        {/* Main content */}
        <main className="col-span-1 md:col-span-3">
          <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Personal Information</h2>
                <p className="text-sm text-gray-500">Basic info, like your name and address, that you use on LMS Platform.</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                ✏️
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Basics
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">Full Name</div>
                    <div className="font-medium text-gray-900">{displayName || "Not provided"}</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">Display Name</div>
                    <div className="font-medium text-gray-900">{displayName ? displayName.split(' ')[0] : "Not provided"}</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium text-gray-900">{email || "Not provided"}</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">Phone Number</div>
                    <div className="font-medium text-gray-900">{phone || "Not provided"}</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">Date of Birth</div>
                    <div className="font-medium text-gray-900">{dob || "Not provided"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
