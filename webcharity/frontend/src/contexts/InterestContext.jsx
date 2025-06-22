import React, { createContext, useContext, useState, useEffect } from 'react';

const InterestContext = createContext();

export const useInterest = () => {
  const context = useContext(InterestContext);
  if (!context) {
    throw new Error('useInterest must be used within an InterestProvider');
  }
  return context;
};

export const InterestProvider = ({ children }) => {
  const [interestedProjects, setInterestedProjects] = useState([]);

  // Load danh sách quan tâm từ localStorage khi component mount
  useEffect(() => {
    const savedInterests = localStorage.getItem('interestedProjects');
    if (savedInterests) {
      try {
        setInterestedProjects(JSON.parse(savedInterests));
      } catch (error) {
        console.error('Error loading interested projects:', error);
      }
    }
  }, []);

  // Lưu danh sách quan tâm vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem('interestedProjects', JSON.stringify(interestedProjects));
  }, [interestedProjects]);

  // Thêm dự án vào danh sách quan tâm
  const addToInterests = (project) => {
    setInterestedProjects(prev => {
      const exists = prev.find(p => p.id === project.id);
      if (!exists) {
        return [...prev, project];
      }
      return prev;
    });
  };

  // Xóa dự án khỏi danh sách quan tâm
  const removeFromInterests = (projectId) => {
    setInterestedProjects(prev => prev.filter(p => p.id !== projectId));
  };

  // Kiểm tra xem dự án có trong danh sách quan tâm không
  const isInterested = (projectId) => {
    return interestedProjects.some(p => p.id === projectId);
  };

  // Toggle trạng thái quan tâm
  const toggleInterest = (project) => {
    if (isInterested(project.id)) {
      removeFromInterests(project.id);
    } else {
      addToInterests(project);
    }
  };

  // Lấy số lượng dự án quan tâm
  const getInterestCount = () => {
    return interestedProjects.length;
  };

  // Xóa tất cả dự án quan tâm
  const clearAllInterests = () => {
    setInterestedProjects([]);
  };

  const value = {
    interestedProjects,
    addToInterests,
    removeFromInterests,
    isInterested,
    toggleInterest,
    getInterestCount,
    clearAllInterests
  };

  return (
    <InterestContext.Provider value={value}>
      {children}
    </InterestContext.Provider>
  );
}; 