const API_BASE_URL = 'http://localhost:5000/api';

// Tìm kiếm và lọc dự án
export const searchProjects = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);

    const response = await fetch(`${API_BASE_URL}/projects/search?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to search projects');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching projects:', error);
    throw error;
  }
};

// Lấy danh sách danh mục
export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/categories`);
    
    if (!response.ok) {
      throw new Error('Failed to get categories');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

// Lấy thống kê dự án
export const getProjectStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to get project stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting project stats:', error);
    throw error;
  }
};

// Lấy chi tiết dự án
export const getProjectById = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get project details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting project details:', error);
    throw error;
  }
};

// Lấy lịch sử giao dịch của dự án
export const getProjectTransactions = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/project-transactions/${projectId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get project transactions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting project transactions:', error);
    throw error;
  }
};

// Xác minh giao dịch blockchain
export const verifyTransaction = async (transactionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to verify transaction');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying transaction:', error);
    throw error;
  }
}; 