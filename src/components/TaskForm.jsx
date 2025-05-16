import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import { createTask, updateTask } from '../services/taskService';

// Import icons
const XIcon = getIcon('X');
const CheckIcon = getIcon('Check');

export default function TaskForm({ taskToEdit = null, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    priority: 'medium',
    completed: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const isEditing = !!taskToEdit;
  
  // If editing, populate form with task data
  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        priority: taskToEdit.priority || 'medium',
        completed: taskToEdit.completed || false
      });
    }
  }, [taskToEdit]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        // Update existing task
        await updateTask({
          Id: taskToEdit.id,
          title: formData.title,
          priority: formData.priority,
          completed: formData.completed
        });
        toast.success('Task updated successfully');
      } else {
        // Create new task
        await createTask({
          Name: formData.title,
          title: formData.title,
          priority: formData.priority,
          completed: formData.completed
        });
        toast.success('Task created successfully');
      }
      
      // Call success callback
      onSuccess && onSuccess();
      
    } catch (error) {
      toast.error(isEditing ? 'Failed to update task' : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white dark:bg-surface-800 rounded-lg p-4 shadow-card"
    >
      <h3 className="text-lg font-semibold mb-4">
        {isEditing ? 'Edit Task' : 'Create New Task'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Task Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`input w-full ${errors.title ? 'border-red-500 dark:border-red-500' : ''}`}
              placeholder="Enter task title"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input w-full"
              disabled={isSubmitting}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="completed"
              name="completed"
              checked={formData.completed}
              onChange={handleChange}
              className="h-4 w-4 rounded border-surface-300 text-primary focus:ring-primary"
              disabled={isSubmitting}
            />
            <label htmlFor="completed" className="ml-2 block text-sm text-surface-700 dark:text-surface-300">
              Mark as completed
            </label>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              <XIcon size={16} className="mr-1" />
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <>
                  <CheckIcon size={16} className="mr-1" />
                  {isEditing ? 'Update Task' : 'Create Task'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}