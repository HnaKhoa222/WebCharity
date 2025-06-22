import React, { useState, useEffect } from "react";
import { db, collection, getDocs } from "../firebase"; // Import Firestore
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar/SearchBar";
import { processProjects } from "../utils/searchUtils";
import { useInterest } from "../contexts/InterestContext";
import "./Projects.css";

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { toggleInterest, isInterested } = useInterest();
  const [allProjects, setAllProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedQr, setSelectedQr] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu từ Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllProjects(projectsData);
        setFilteredProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Xử lý tìm kiếm
  useEffect(() => {
    const processed = processProjects(allProjects, searchTerm, 'newest');
    setFilteredProjects(processed);
  }, [allProjects, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleInterestToggle = (project) => {
    toggleInterest(project);
  };

  const toggleQrCode = (projectLink) => {
    setSelectedQr(selectedQr === projectLink ? null : projectLink);
  };

  if (loading) {
    return (
      <div className="projects-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dự án...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Dự án đang gây quỹ</h1>
        <p>Hãy lựa chọn đồng hành cùng dự án mà bạn quan tâm</p>
      </div>

      {/* Search */}
      <div className="search-filter-section">
        <SearchBar onSearch={handleSearch} placeholder="Tìm kiếm dự án, quỹ từ thiện..." />
      </div>

      {/* Kết quả tìm kiếm */}
      <div className="search-results">
        <div className="results-info">
          <p>
            Tìm thấy <strong>{filteredProjects.length}</strong> dự án
            {searchTerm && (
              <span> cho từ khóa "<strong>{searchTerm}</strong>"</span>
            )}
          </p>
        </div>
      </div>

      {/* Danh sách dự án */}
      <div className="project-list">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div key={project.id} className="project-item">
              <img
                src={project.image}
                alt={project.title}
                className="project-image"
              />

              <h3>{project.fundName}</h3>
              <h2>{project.title}</h2>

              <button
                onClick={() => handleInterestToggle(project)}
                className={`interest-btn ${
                  isInterested(project.id) ? "interested" : ""
                }`}
                title={isInterested(project.id) ? "Bỏ quan tâm" : "Thêm vào danh sách quan tâm"}
              >
                <span className="interest-icon">
                  {isInterested(project.id) ? "✓" : "+"}
                </span>
              </button>

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

              <div className="project-actions">
                <div className="action-buttons">
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="button details-btn"
                  >
                    Xem chi tiết
                  </button>
                  <a href="https://www.google.com/" className="button fund-btn">
                    Kiểm tra sao kê
                  </a>
                  <button
                    onClick={() => toggleQrCode(project.projectLink)}
                    className="button qr-btn"
                  >
                    {selectedQr === project.projectLink ? "Đóng QR" : "Mở QR"}
                  </button>
                </div>
              </div>

              {selectedQr === project.projectLink && (
                <div className="qr-code">
                  <img
                    src={project.fundAvatar}
                    alt={`QR Code for ${project.title}`}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-results">
            <div className="no-results-content">
              <svg className="no-results-icon" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <h3>Không tìm thấy dự án nào</h3>
              <p>
                {searchTerm 
                  ? `Không có dự án nào phù hợp với từ khóa "${searchTerm}"`
                  : "Không có dự án nào"
                }
              </p>
              <button 
                className="button clear-search-btn"
                onClick={() => setSearchTerm("")}
              >
                Xóa tìm kiếm
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredProjects.length > 0 && (
        <div className="view-all">
          <button className="button view-all-btn">Xem tất cả</button>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
