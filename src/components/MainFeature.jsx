import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';
import { toast } from 'react-toastify';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskService';

// Import needed icons
const PlusIcon = getIcon('Plus');
const SearchIcon = getIcon('Search');
const CheckIcon = getIcon('Check');
const TrashIcon = getIcon('Trash');
const EditIcon = getIcon('Edit');
const FilterIcon = getIcon('Filter');

export default function MainFeature() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    // Load tasks from API
    loadTasks();
  }, [searchTerm, filterStatus]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const options = {
        searchTerm: searchTerm,
        filterStatus: filterStatus
      };
      
      const fetchedTasks = await fetchTasks(options);
      
      // Transform API data format to component format
      const transformedTasks = fetchedTasks.map(task => ({
        id: task.Id,
        title: task.title || task.Name,
        completed: task.completed || false,
        priority: task.priority || 'medium'
      }));
      
      setTasks(transformedTasks);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async () => {
    if (newTask.trim() === '') {
      toast.error('Task cannot be empty');
      return;
    }

    try {
      const taskData = {
        Name: newTask,
        title: newTask,
        completed: false,
        priority: 'medium'
      };
      
      const createdTask = await createTask(taskData);
      
      // Add the new task to the list
      const newTaskObject = {
        id: createdTask.Id,
        title: newTask,
        completed: false,
        priority: 'medium'
      };
      
      setTasks([...tasks, newTaskObject]);
      setNewTask('');
      toast.success('Task added successfully');
    } catch (error) {
      toast.error('Failed to add task');
      console.error('Error adding task:', error);
    }
  };
  
  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
      toast.info('Task removed');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };
  const toggleComplete = async (id) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      const updatedTaskData = {
        Id: id,
        completed: !task.completed
      };
      
      await updateTask(updatedTaskData);
      
      const updatedTasks = tasks.map(t => {
        if (t.id === id) {
          return { ...t, completed: !t.completed };
        }
        return t;
      });
      
      setTasks(updatedTasks);
      toast.success(task.completed ? 'Task marked as incomplete' : 'Task completed!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const startEditing = (task) => {
    setEditingTask({ ...task });
  };
  const saveEdit = async () => {
    if (editingTask.title.trim() === '') {
      toast.error('Task title cannot be empty');
      return;
    }
    try {
      const updatedTaskData = {
        Id: editingTask.id,
        title: editingTask.title,
        priority: editingTask.priority
      };
      
      await updateTask(updatedTaskData);
      
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id ? editingTask : task
      );
      
      setTasks(updatedTasks);
      setEditingTask(null);
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  // Filter tasks based on search and filter status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && !task.completed) || 
      (filterStatus === 'completed' && task.completed);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-surface-800 rounded-xl p-6 neu-shadow-light dark:neu-shadow-dark"
    >
      <h2 className="text-xl font-bold mb-4">Task Management</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow relative">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new task..."
            className="w-full p-3 pl-4 pr-12 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-700 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
          />
          <button
            onClick={addTask}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors"
            aria-label="Add task"
          >
            <PlusIcon size={16} />
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <SearchIcon size={16} className="text-surface-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 p-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-700 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-surface-600 dark:text-surface-300 whitespace-nowrap flex items-center gap-2">
            <FilterIcon size={14} /> Filter:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-700 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-surface-100 dark:bg-surface-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-surface-500 dark:text-surface-400">
          {searchTerm || filterStatus !== 'all' 
            ? 'No tasks match your search or filter' 
            : 'No tasks yet. Add your first task to get started!'}
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredTasks.map(task => (
            <li 
              key={task.id}
              className={`p-4 rounded-lg border ${
                task.completed 
                  ? 'bg-surface-50 dark:bg-surface-800/50 border-surface-200 dark:border-surface-700' 
                  : 'bg-white dark:bg-surface-700 border-surface-200 dark:border-surface-600'
              } flex items-center justify-between group transition-all`}
            >
              {editingTask && editingTask.id === task.id ? (
                <div className="flex w-full gap-2">
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                    className="flex-grow p-2 rounded-lg border border-surface-200 dark:border-surface-700 focus:ring-2 focus:ring-primary focus:border-primary dark:bg-surface-800 dark:text-white"
                    autoFocus
                  />
                  <button 
                    onClick={saveEdit}
                    className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <CheckIcon size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-grow">
                    <button
                      onClick={() => toggleComplete(task.id)}
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        task.completed 
                          ? 'bg-green-500 text-white' 
                          : 'border-2 border-surface-300 dark:border-surface-500'
                      }`}
                      aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {task.completed && <CheckIcon size={12} />}
                    </button>
                    <span className={task.completed ? 'line-through text-surface-400 dark:text-surface-500' : ''}>
                      {task.title}
                    </span>
                    {task.priority === 'high' && (
                      <span className="px-2 py-1 text-xs rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                        High priority
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditing(task)}
                      className="p-2 hover:bg-surface-100 dark:hover:bg-surface-600 rounded-full"
                      aria-label="Edit task"
                    >
                      <EditIcon size={16} className="text-surface-500 dark:text-surface-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 hover:bg-surface-100 dark:hover:bg-surface-600 rounded-full"
                      aria-label="Delete task"
                    >
                      <TrashIcon size={16} className="text-red-500" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}