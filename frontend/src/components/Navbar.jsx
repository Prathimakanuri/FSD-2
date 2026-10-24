import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Home, Film, CalendarCheck } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-bg-primary text-text-primary shadow-md h-16 flex items-center px-6">
      <div className="container flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gradient">
          CineBook
        </Link>
        <div className="flex items-center space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'text-violet-light' : 'hover:text-violet-light'
            }
          >
            <Home size={20} />
          </NavLink>
          <NavLink
            to="/movies"
            className={({ isActive }) =>
              isActive ? 'text-violet-light' : 'hover:text-violet-light'
            }
          >
            <Film size={20} />
          </NavLink>
          {user && (
            <NavLink
              to="/my-bookings"
              className={({ isActive }) =>
                isActive ? 'text-violet-light' : 'hover:text-violet-light'
              }
            >
              <CalendarCheck size={20} />
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? 'text-violet-light' : 'hover:text-violet-light'
              }
            >
              Admin
            </NavLink>
          )}
          {user ? (
            <button onClick={handleLogout} className="flex items-center space-x-1 hover:text-violet-light">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? 'text-violet-light' : 'hover:text-violet-light'
              }
            >
              <User size={20} />
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
