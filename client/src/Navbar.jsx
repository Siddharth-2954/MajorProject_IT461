import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from './AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authLoading, logout } = useContext(AuthContext);

  const isAdminUser = !!(user && (user.username || user.isAdmin || (user.registrationId && String(user.registrationId).startsWith("WRO"))));

  const isActive = (path) => {
    if (!location || !location.pathname) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/') || location.pathname === path;
  };
  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="w-full px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold text-blue-700">LMS</div>

        <div className="ml-auto flex items-center gap-6">
          {String(location.pathname || '').startsWith('/admin') && isAdminUser ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                {/** admin home: only active when exactly on /admin; on subroutes show black text */}
                <Link
                  to={'/admin'}
                  className={`text-sm ${location.pathname === '/admin' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
                >
                  Home
                </Link>
                <Link
                  to={'/admin/announcements'}
                  className={`text-sm ${isActive('/admin/announcements') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
                >
                  Announcement
                </Link>
                <button
                  type="button"
                  onClick={() => navigate('/events/lvc')}
                  className={`text-sm ${isActive('/events/lvc') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
                >
                  Schedule LVC
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/events/lvrc')}
                  className={`text-sm ${isActive('/events/lvrc') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
                >
                  Schedule LVRC
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => { try { await logout(); } catch (e) {} window.location.href = 'http://localhost:5173/admin/!login'; }}
                  className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Link to={user ? "/home" : "/"} className={`text-sm ${isActive(user ? '/home' : '/') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}>
                  Home
                </Link>
                <Link
                  to="/about"
                  className={`text-sm ${isActive('/about') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
                >
                  About Us
                </Link>
                <div className="relative group">
                  <button className="text-sm text-gray-700 hover:text-blue-600">
                    Announcements ▾
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg py-2 z-20 opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all">
                    <Link to="/announcements/lms" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">LMS Announcements</Link>
                    <Link to="/announcements/exam" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Examination Announcements</Link>
                  </div>
                </div>

                {/* LVC dropdown (click redirects to /events/lvc) */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => navigate('/events/lvc')}
                    className={`text-sm ${isActive('/events/lvc') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
                  >
                    LVC Schedule
                  </button>
                </div>

                {/* LVRC dropdown (click redirects to /events/lvrc) */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => navigate('/events/lvrc')}
                    className={`text-sm ${isActive('/events/lvrc') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
                  >
                    LVRC Schedule
                  </button>
                </div>

                <Link
                  to="/contact"
                  className={`text-sm ${isActive('/contact') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
                >
                  Contact Us
                </Link>
              </div>

              <div className="flex items-center gap-3">
                {/* show Logout when on /home, otherwise show Sign Up and Login */}
                <AuthButtons />
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const AuthButtons = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (user) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
      >
        Logout
      </button>
    );
  }

  return (
    <>
      <Link
        to="/students-login"
        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Sign Up (Students)
      </Link>

      <button
        type="button"
        onClick={() => {
          // If already on home, scroll to the student login section
          if (location.pathname === "/") {
            const el = document.getElementById("student-login");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }

          // Otherwise navigate to home with hash so Home can pick it up and scroll
          navigate("/#student-login");
        }}
        className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      >
        Login
      </button>
    </>
  );
};

export default Navbar;