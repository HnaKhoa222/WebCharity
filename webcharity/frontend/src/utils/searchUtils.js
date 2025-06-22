// Hàm tìm kiếm dự án theo từ khóa
export const searchProjects = (projects, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return projects;
  }

  const term = searchTerm.toLowerCase().trim();
  
  return projects.filter(project => {
    // Tìm kiếm trong tiêu đề dự án
    if (project.title && project.title.toLowerCase().includes(term)) {
      return true;
    }
    
    // Tìm kiếm trong tên quỹ
    if (project.fundName && project.fundName.toLowerCase().includes(term)) {
      return true;
    }
    
    // Tìm kiếm trong mô tả
    if (project.description && project.description.toLowerCase().includes(term)) {
      return true;
    }
    
    // Tìm kiếm trong danh mục
    if (project.category && project.category.toLowerCase().includes(term)) {
      return true;
    }
    
    // Tìm kiếm trong địa điểm
    if (project.location && project.location.toLowerCase().includes(term)) {
      return true;
    }
    
    return false;
  });
};

// Hàm sắp xếp dự án
export const sortProjects = (projects, sortBy) => {
  const sortedProjects = [...projects];

  switch (sortBy) {
    case 'newest':
      return sortedProjects.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.timestamp || 0);
        const dateB = new Date(b.createdAt || b.timestamp || 0);
        return dateB - dateA;
      });

    case 'popular':
      return sortedProjects.sort((a, b) => {
        const supportersA = a.supporters || a.donors || 0;
        const supportersB = b.supporters || b.donors || 0;
        return supportersB - supportersA;
      });

    case 'deadline':
      return sortedProjects.sort((a, b) => {
        const deadlineA = new Date(a.deadline || a.endDate || 0);
        const deadlineB = new Date(b.deadline || b.endDate || 0);
        return deadlineA - deadlineB;
      });

    case 'amount':
      return sortedProjects.sort((a, b) => {
        const amountA = parseFloat(a.raisedAmount?.replace(/[^\d.]/g, '') || 0);
        const amountB = parseFloat(b.raisedAmount?.replace(/[^\d.]/g, '') || 0);
        return amountB - amountA;
      });

    default:
      return sortedProjects;
  }
};

// Hàm kết hợp tìm kiếm và sắp xếp
export const processProjects = (projects, searchTerm, sortBy) => {
  let processedProjects = [...projects];

  // 1. Tìm kiếm
  processedProjects = searchProjects(processedProjects, searchTerm);

  // 2. Sắp xếp
  processedProjects = sortProjects(processedProjects, sortBy);

  return processedProjects;
};

// Hàm highlight từ khóa tìm kiếm
export const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// Hàm tính toán số lượng kết quả theo từng bộ lọc
export const getFilterCounts = (projects) => {
  const counts = {
    total: projects.length,
    categories: {
      education: 0,
      children: 0,
      environment: 0
    }
  };

  projects.forEach(project => {
    // Đếm theo danh mục
    const category = project.category;
    if (category && counts.categories.hasOwnProperty(category)) {
      counts.categories[category]++;
    }
  });

  return counts;
};

// Hàm chuyển đổi tên danh mục sang key
export const getCategoryKey = (categoryName) => {
  const categoryMap = {
    'Giáo dục': 'education',
    'Trẻ em': 'children',
    'Môi trường': 'environment'
  };
  return categoryMap[categoryName] || '';
};

// Hàm chuyển đổi key danh mục sang tên hiển thị
export const getCategoryDisplayName = (categoryKey) => {
  const displayMap = {
    'education': 'Giáo dục',
    'children': 'Trẻ em',
    'environment': 'Môi trường'
  };
  return displayMap[categoryKey] || categoryKey;
}; 