/**
 * Service for handling Workflow-related operations
 */

// Workflow table fields with visibility information
const workflowFields = [
  { name: "Name", visibility: "Updateable" },
  { name: "Tags", visibility: "Updateable" },
  { name: "Owner", visibility: "Updateable" },
  { name: "CreatedOn", visibility: "System" },
  { name: "CreatedBy", visibility: "System" },
  { name: "ModifiedOn", visibility: "System" },
  { name: "ModifiedBy", visibility: "System" },
  { name: "active", visibility: "Updateable" }
];

// Get the fields we can update (for create/update operations)
const updateableFields = workflowFields
  .filter(field => field.visibility === "Updateable")
  .map(field => field.name);

// Get all fields (for fetch operations)
const allFields = workflowFields.map(field => field.name);

// Initialize the Apper client
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

/**
 * Fetch all workflows with optional filtering
 * @param {Object} options - Search and filter options
 * @returns {Promise<Array>} Array of workflow objects
 */
export const fetchWorkflows = async (options = {}) => {
  const { searchTerm = '', activeOnly = false } = options;
  
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
          fieldName: "Name",
          operator: "Contains",
          values: [searchTerm]
        }
      ];
    }

    // Add active status filter if requested
    if (activeOnly) {
      params.where = params.where || [];
      params.where.push({
        fieldName: "active",
        operator: "ExactMatch",
        values: [true]
      });
    }
    
    const response = await apperClient.fetchRecords('workflow1', params);
    return response.data || [];
    
  } catch (error) {
    console.error("Error fetching workflows:", error);
    throw error;
  }
};

/**
 * Get count of active workflows
 * @returns {Promise<number>} Count of active workflows
 */
export const getActiveWorkflowCount = async () => {
  try {
    const apperClient = getApperClient();
    
    const response = await apperClient.fetchRecords('workflow1', {
      fields: ["Id"],
      where: [
        {
          fieldName: "active",
          operator: "ExactMatch",
          values: [true]
        }
      ],
      pagingInfo: {
        limit: 1000,
        offset: 0
      }
    });
    
    return (response.data || []).length;
    
  } catch (error) {
    console.error("Error getting active workflow count:", error);
    throw error;
  }
};

/**
 * Create a new workflow
 * @param {Object} workflowData - Workflow data
 * @returns {Promise<Object>} Created workflow
 */
export const createWorkflow = async (workflowData) => {
  try {
    const apperClient = getApperClient();
    
    // Filter out fields that are not updateable
    const filteredData = {};
    updateableFields.forEach(field => {
      if (workflowData[field] !== undefined) {
        filteredData[field] = workflowData[field];
      }
    });
    
    const response = await apperClient.createRecord('workflow1', {
      records: [filteredData]
    });
    
    if (response && response.results && response.results[0] && response.results[0].success) {
      return response.results[0].data;
    } else {
      throw new Error(response?.results?.[0]?.message || "Failed to create workflow");
    }
    
  } catch (error) {
    console.error("Error creating workflow:", error);
    throw error;
  }
};