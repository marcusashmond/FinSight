import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 text-center">
    <p className="text-8xl font-black text-indigo-100 dark:text-indigo-950 select-none">404</p>
    <h1 className="text-2xl font-bold mt-2 -translate-y-6">Page not found</h1>
    <p className="text-gray-400 text-sm -translate-y-4 max-w-xs">
      The page you're looking for doesn't exist or was moved.
    </p>
    <Link
      to="/"
      className="-translate-y-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
    >
      Back to Dashboard
    </Link>
  </div>
);

export default NotFound;
