import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

// Import icon component
const HomeIcon = getIcon('Home');
const AlertTriangleIcon = getIcon('AlertTriangle');

export default function NotFound() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
        className="bg-red-100 dark:bg-red-900/30 p-5 rounded-full mb-6"
      >
        <AlertTriangleIcon size={48} className="text-red-500" />
      </motion.div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <Link 
        to="/"
        className="btn btn-primary rounded-full px-6 py-3 text-base md:text-lg flex items-center space-x-2 shadow-soft"
      >
        <HomeIcon size={20} />
        <span>Back to Home</span>
      </Link>
    </motion.div>
  );
}