import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/recurring', label: 'Recurring' },
  { to: '/networth', label: 'Net Worth' },
  { to: '/goals', label: 'Goals' },
  { to: '/upload', label: 'Upload' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? 'text-indigo-600' : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600'}`;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        <span className="text-indigo-600 font-bold text-xl">FinSight</span>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClass}>{label}</NavLink>
          ))}
          <div className="flex items-center gap-3 ml-3 border-l pl-3 dark:border-gray-700">
            <NavLink to="/profile" className={linkClass}>{user?.name || user?.email}</NavLink>
            <button onClick={toggle} className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition">
              {dark ? 'Light' : 'Dark'}
            </button>
            <button onClick={logout} className="text-sm text-red-400 hover:text-red-600 transition">Logout</button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          onClick={() => setOpen((v) => !v)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t dark:border-gray-700 px-4 py-3 space-y-1 bg-white dark:bg-gray-900">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`
              }>
              {label}
            </NavLink>
          ))}
          <div className="border-t dark:border-gray-700 pt-2 mt-2 flex items-center gap-3">
            <NavLink to="/profile" onClick={() => setOpen(false)}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium">
              {user?.name || user?.email}
            </NavLink>
            <button onClick={toggle} className="text-sm text-gray-500 dark:text-gray-400">{dark ? 'Light' : 'Dark'}</button>
            <button onClick={logout} className="text-sm text-red-400 hover:text-red-600">Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
