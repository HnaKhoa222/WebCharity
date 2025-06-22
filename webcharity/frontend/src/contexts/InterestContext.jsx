import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const InterestContext = createContext();

export const useInterest = () => {
  const context = useContext(InterestContext);
  if (!context) {
    throw new Error('useInterest must be used within an InterestProvider');
  }
  return context;
};

export const InterestProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [interestedProjects, setInterestedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load danh sách quan tâm từ Firestore khi user đăng nhập
  useEffect(() => {
    const fetchInterests = async () => {
      if (!currentUser) {
        setInterestedProjects([]);
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'userInterests', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setInterestedProjects(docSnap.data().interestedProjects || []);
        } else {
          setInterestedProjects([]);
        }
      } catch (error) {
        console.error('Error loading interests from Firestore:', error);
        setInterestedProjects([]);
      }
      setLoading(false);
    };
    fetchInterests();
  }, [currentUser]);

  // Helper: cập nhật Firestore
  const updateFirestore = async (newInterests) => {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, 'userInterests', currentUser.uid), {
        interestedProjects: newInterests
      });
    } catch (error) {
      console.error('Error updating interests in Firestore:', error);
    }
  };

  // Thêm dự án vào danh sách quan tâm
  const addToInterests = async (project) => {
    if (!currentUser) return;
    setInterestedProjects(prev => {
      const exists = prev.find(p => p.id === project.id);
      if (!exists) {
        const updated = [...prev, project];
        updateFirestore(updated);
        return updated;
      }
      return prev;
    });
  };

  // Xóa dự án khỏi danh sách quan tâm
  const removeFromInterests = async (projectId) => {
    if (!currentUser) return;
    setInterestedProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      updateFirestore(updated);
      return updated;
    });
  };

  // Kiểm tra xem dự án có trong danh sách quan tâm không
  const isInterested = (projectId) => {
    return interestedProjects.some(p => p.id === projectId);
  };

  // Toggle trạng thái quan tâm
  const toggleInterest = async (project) => {
    if (!currentUser) return;
    if (isInterested(project.id)) {
      await removeFromInterests(project.id);
    } else {
      await addToInterests(project);
    }
  };

  // Lấy số lượng dự án quan tâm
  const getInterestCount = () => {
    return interestedProjects.length;
  };

  // Xóa tất cả dự án quan tâm
  const clearAllInterests = async () => {
    if (!currentUser) return;
    setInterestedProjects([]);
    updateFirestore([]);
  };

  const value = {
    interestedProjects,
    addToInterests,
    removeFromInterests,
    isInterested,
    toggleInterest,
    getInterestCount,
    clearAllInterests,
    loading
  };

  return (
    <InterestContext.Provider value={value}>
      {children}
    </InterestContext.Provider>
  );
}; 