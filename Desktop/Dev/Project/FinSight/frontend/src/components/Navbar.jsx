import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/upload', label: 'Upload' },
];

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">
      <span className="text-indigo-600 font-bold text-xl">FinSight</span>
      <div className="flex items-center gap-6">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `text-sm font-medium transition ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`
            }
          >
            {label}
          </NavLink>
        ))}
        <div className="flex items-center gap-3 ml-4 border-l pl-4">
          <span className="text-xs text-gray-500">{user?.email}</span>
          <button onClick={logout} className="text-sm text-red-400 hover:text-red-600 transition">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
