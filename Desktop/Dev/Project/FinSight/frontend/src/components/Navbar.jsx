import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/recurring', label: 'Recurring' },
  { to: '/upload', label: 'Upload' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm border-b px-6 py-3 flex items-center justify-between">
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
        <div className="flex items-center gap-3 ml-4 border-l pl-4 dark:border-gray-700">
          <NavLink to="/profile"
            className={({ isActive }) =>
              `text-sm font-medium transition ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`
            }
          >
            {user?.name || user?.email}
          </NavLink>
          <button onClick={toggle} className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition">
            {dark ? 'Light' : 'Dark'}
          </button>
          <button onClick={logout} className="text-sm text-red-400 hover:text-red-600 transition">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
