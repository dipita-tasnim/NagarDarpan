import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-emerald-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold tracking-wide">
            ⚙️NagarDarpan
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-3 text-sm">
            {user ? (
              <>
                <Link to="/report" className="hover:text-emerald-200 transition whitespace-nowrap">Report</Link>
                <Link to="/my-problems" className="hover:text-emerald-200 transition whitespace-nowrap">My Reports</Link>
                <Link to="/problems" className="hover:text-emerald-200 transition whitespace-nowrap">All Problems</Link>
                <Link to="/problem-map" className="hover:text-emerald-200 transition whitespace-nowrap">Map</Link>
                
                <Link to="/area-stats" className="hover:text-emerald-200 transition whitespace-nowrap">Stats</Link>
                <Link to="/track" className="hover:text-emerald-200 transition whitespace-nowrap">Track</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-yellow-300 font-bold hover:text-yellow-100 transition whitespace-nowrap">Admin</Link>
                )}
                <span className="text-emerald-200 text-xs whitespace-nowrap">Hi, {user.name}</span>
                <button onClick={handleLogout} className="bg-emerald-800 hover:bg-emerald-900 px-3 py-1.5 rounded text-xs transition whitespace-nowrap">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-emerald-200 transition">Login</Link>
                <Link to="/signup" className="bg-white text-emerald-700 px-4 py-1.5 rounded font-medium hover:bg-emerald-50 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-emerald-800 px-4 pb-4 space-y-2">
          {user ? (
            <>
              <Link to="/report" onClick={() => setOpen(false)} className="block py-2 hover:text-emerald-200">Report Problem</Link>
              <Link to="/problems" onClick={() => setOpen(false)} className="block py-2 hover:text-emerald-200">All Problems</Link>
              <Link to="/problem-map" onClick={() => setOpen(false)} className="block py-2 hover:text-emerald-200">🗺️ Map</Link>
              <Link to="/my-problems" onClick={() => setOpen(false)} className="block py-2 hover:text-emerald-200">My Reports</Link>
              <Link to="/area-stats" onClick={() => setOpen(false)} className="block py-2 hover:text-emerald-200">📊 Area Statistics</Link>
              <Link to="/track" onClick={() => setOpen(false)} className="block py-2 hover:text-emerald-200">Track Issue</Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setOpen(false)} className="block py-2 text-yellow-300 font-bold hover:text-yellow-100">Admin Panel</Link>
              )}
              <button onClick={() => { handleLogout(); setOpen(false); }} className="block py-2 text-red-300">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block py-2">Login</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="block py-2">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
