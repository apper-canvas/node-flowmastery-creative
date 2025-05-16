import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';
import { toast } from 'react-toastify'; 
import { getTaskStats } from '../services/taskService';
import { getActiveWorkflowCount } from '../services/workflowService';

// Import needed icons
const CheckCircleIcon = getIcon('CheckCircle');
const ListChecksIcon = getIcon('ListChecks');
const BarChart2Icon = getIcon('BarChart2');

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [statsData, setStatsData] = useState({
    tasksCompleted: 0,
    workflows: 0,
    productivity: 0
  });

  const fetchStats = async () => {
    try {
      // Get task statistics
      const taskStats = await getTaskStats();
      
      // Get active workflow count
      const workflowCount = await getActiveWorkflowCount();
      
      setStatsData({
        tasksCompleted: taskStats.tasksCompleted,
        workflows: workflowCount,
        productivity: taskStats.productivity
      });
      
      setIsLoaded(true);
      
      toast.success("Dashboard updated successfully", {
        icon: "📊"
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Failed to load dashboard data");
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchStats(), 800);
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="space-y-8">
      <section className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-8"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Optimize Your Workflow with FlowMastery
          </h1>
          <p className="text-surface-600 dark:text-surface-300 text-lg">
            Create, manage, and optimize your tasks and workflows in one powerful platform.
          </p>
        </motion.div>
        
        {isLoaded ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div 
              variants={itemVariants}
              className="card flex flex-col items-center p-6 text-center neu-shadow-light dark:neu-shadow-dark"
            >
              <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full mb-4">
                <CheckCircleIcon size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{statsData.tasksCompleted}</h3>
              <p className="text-surface-600 dark:text-surface-400">Tasks Completed</p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="card flex flex-col items-center p-6 text-center neu-shadow-light dark:neu-shadow-dark"
            >
              <div className="bg-secondary/10 dark:bg-secondary/20 p-3 rounded-full mb-4">
                <ListChecksIcon size={24} className="text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{statsData.workflows}</h3>
              <p className="text-surface-600 dark:text-surface-400">Active Workflows</p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="card flex flex-col items-center p-6 text-center neu-shadow-light dark:neu-shadow-dark"
            >
              <div className="bg-accent/10 dark:bg-accent/20 p-3 rounded-full mb-4">
                <BarChart2Icon size={24} className="text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{statsData.productivity}%</h3>
              <p className="text-surface-600 dark:text-surface-400">Productivity</p>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card flex flex-col items-center p-6">
                <div className="w-12 h-12 rounded-full bg-surface-200 dark:bg-surface-700 animate-pulse mb-4"></div>
                <div className="h-6 w-16 bg-surface-200 dark:bg-surface-700 animate-pulse mb-2 rounded"></div>
                <div className="h-4 w-24 bg-surface-200 dark:bg-surface-700 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <MainFeature />
    </div>
  );
}