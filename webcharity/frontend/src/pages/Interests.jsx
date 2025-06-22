import React from "react";
import { useNavigate } from "react-router-dom";
import { useInterest } from "../contexts/InterestContext";
import "./Interests.css";

const InterestsPage = () => {
  const navigate = useNavigate();
  const { interestedProjects, removeFromInterests, clearAllInterests, getInterestCount } = useInterest();

  const handleRemoveInterest = (projectId) => {
    removeFromInterests(projectId);
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả dự án quan tâm?")) {
      clearAllInterests();
    }
  };

  return (
    <div className="interests-page">
      <div className="interests-header">
        <h1>Dự án quan tâm</h1>
        <p>Danh sách các dự án bạn đã thêm vào quan tâm</p>
      </div>

      {getInterestCount() > 0 && (
        <div className="interests-actions">
          <button 
            className="clear-all-btn"
            onClick={handleClearAll}
          >
            Xóa tất cả
          </button>
        </div>
      )}

      {interestedProjects.length > 0 ? (
        <div className="interests-list">
          {interestedProjects.map((project) => (
            <div key={project.id} className="interest-item">
              <img
                src={project.image}
                alt={project.title}
                className="interest-image"
              />

              <div className="interest-content">
                <h3>{project.fundName}</h3>
                <h2>{project.title}</h2>
                
                <div className="progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: project.raisedPercent }}
                    />
                  </div>
                  <p className="amount">Đã nhận: {project.raisedAmount}</p>
                  <p className="target">Mục tiêu: {project.fundingGoal}</p>
                </div>

                <div className="interest-actions">
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="button details-btn"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => handleRemoveInterest(project.id)}
                    className="button remove-btn"
                  >
                    Bỏ quan tâm
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-interests">
          <div className="empty-content">
            <svg className="empty-icon" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h3>Chưa có dự án quan tâm</h3>
            <p>Hãy khám phá các dự án và thêm vào danh sách quan tâm của bạn</p>
            <button 
              className="button explore-btn"
              onClick={() => navigate('/projects')}
            >
              Khám phá dự án
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestsPage; 