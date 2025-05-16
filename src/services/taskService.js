/**
 * Service for handling Task-related operations
 */

// Task table fields with visibility information
const taskFields = [
  { name: "Name", visibility: "Updateable" },
  { name: "Tags", visibility: "Updateable" },
  { name: "Owner", visibility: "Updateable" },
  { name: "CreatedOn", visibility: "System" },
  { name: "CreatedBy", visibility: "System" },
  { name: "ModifiedOn", visibility: "System" },
  { name: "ModifiedBy", visibility: "System" },
  { name: "title", visibility: "Updateable" },
  { name: "completed", visibility: "Updateable" },
  { name: "priority", visibility: "Updateable" }
];

// Get the fields we can update (for create/update operations)
const updateableFields = taskFields
  .filter(field => field.visibility === "Updateable")
  .map(field => field.name);

// Get all fields (for fetch operations)
const allFields = taskFields.map(field => field.name);

// Initialize the Apper client
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

/**
 * Fetch all tasks with optional filtering
 * @param {Object} options - Search and filter options
 * @returns {Promise<Array>} Array of task objects
 */
export const fetchTasks = async (options = {}) => {
  const { searchTerm = '', filterStatus = 'all', priority = '' } = options;
  
  try {
    const apperClient = getApperClient();
    
    // Build query parameters
    const params = {
      fields: allFields,
      orderBy: [
        {
          field: "ModifiedOn",
          direction: "DESC"
        }
      ],
      pagingInfo: {
        limit: 100,
        offset: 0
      }
    };
    
    // Add search term filter if provided
    if (searchTerm) {
      params.where = [
        {
          fieldName: "title",
          operator: "Contains",
          values: [searchTerm]
        }
      ];
    }

    // Add completed status filter if not "all"
    if (filterStatus !== 'all') {
      const completedValue = filterStatus === 'completed';
      params.where = params.where || [];
      params.where.push({
        fieldName: "completed",
        operator: "ExactMatch",
        values: [completedValue]
      });
    }
    
    // Add priority filter if provided
    if (priority) {
      params.where = params.where || [];
      params.where.push({
        fieldName: "priority",
        operator: "ExactMatch",
        values: [priority]
      });
    }
    
    const response = await apperClient.fetchRecords('task2', params);
    return response.data || [];
    
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

/**
 * Get task statistics (count of completed tasks, etc)
 * @returns {Promise<Object>} Statistics object
 */
export const getTaskStats = async () => {
  try {
    const apperClient = getApperClient();
    
    // Get total tasks
    const tasksResponse = await apperClient.fetchRecords('task2', {
      fields: ["completed"],
      pagingInfo: {
        limit: 1000,
        offset: 0
      }
    });
    
    const tasks = tasksResponse.data || [];
    const tasksCompleted = tasks.filter(task => task.completed).length;
    
    // Get high priority count
    const priorityResponse = await apperClient.fetchRecords('task2', {
      fields: ["priority"],
      where: [
        {
          fieldName: "priority",
          operator: "ExactMatch",
          values: ["high"]
        }
      ],
      pagingInfo: {
        limit: 1000,
        offset: 0
      }
    });
    
    const highPriorityTasks = priorityResponse.data || [];
    
    // Calculate productivity (just a sample calculation)
    const totalTasks = tasks.length;
    const productivity = totalTasks > 0 
      ? Math.round((tasksCompleted / totalTasks) * 100) 
      : 0;
    
    return {
      tasksCompleted,
      highPriorityCount: highPriorityTasks.length,
      totalTasks,
      productivity
    };
    
  } catch (error) {
    console.error("Error fetching task statistics:", error);
    throw error;
  }
};

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @returns {Promise<Object>} Created task
 */
export const createTask = async (taskData) => {
  try {
    const apperClient = getApperClient();
    
    // Filter out fields that are not updateable
    const filteredData = {};
    updateableFields.forEach(field => {
      if (taskData[field] !== undefined) {
        filteredData[field] = taskData[field];
      }
    });
    
    const response = await apperClient.createRecord('task2', {
      records: [filteredData]
    });
    
    if (response && response.results && response.results[0] && response.results[0].success) {
      return response.results[0].data;
    } else {
      throw new Error(response?.results?.[0]?.message || "Failed to create task");
    }
    
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

/**
 * Update an existing task
 * @param {Object} taskData - Task data including Id
 * @returns {Promise<Object>} Updated task
 */
export const updateTask = async (taskData) => {
  if (!taskData.Id) {
    throw new Error("Task ID is required for update");
  }
  
  try {
    const apperClient = getApperClient();
    
    // Filter out fields that are not updateable
    const filteredData = { Id: taskData.Id };
    updateableFields.forEach(field => {
      if (taskData[field] !== undefined) {
        filteredData[field] = taskData[field];
      }
    });
    
    const response = await apperClient.updateRecord('task2', {
      records: [filteredData]
    });
    
    if (response && response.results && response.results[0] && response.results[0].success) {
      return response.results[0].data;
    } else {
      throw new Error(response?.results?.[0]?.message || "Failed to update task");
    }
    
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {number} taskId - Task ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteTask = async (taskId) => {
  try {
    const apperClient = getApperClient();
    
    const response = await apperClient.deleteRecord('task2', {
      RecordIds: [taskId]
    });
    
    return response && response.success;
    
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};