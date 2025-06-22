import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="protected-route">
        <div className="protected-content">
          <h2>Vui lòng đăng nhập</h2>
          <p>Bạn cần đăng nhập để truy cập trang này</p>
          <button 
            className="login-button"
            onClick={() => window.location.href = '/auth'}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute; 