import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const data = projectSnap.data();
          setProject(data);
          // Lấy danh sách giao dịch từ donations
          if (data.donations) {
            setTransactions(data.donations);
          }
        } else {
          console.log('Không tìm thấy dự án!');
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu dự án:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const toggleTransactions = () => {
    setShowTransactions(!showTransactions);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (loading) return <p className="loading">Đang tải...</p>;
  if (!project) return <p className="error">Không tìm thấy dự án!</p>;

  return (
    <div className="project-details">
      <h1 className="project-title">{project.title}</h1>
      <img src={project.image} alt={project.title} className="project-image" />
      <p className="project-info"><strong>Danh mục:</strong> {project.category}</p>
      <p className="project-info"><strong>Quỹ:</strong> {project.fundName}</p>
      <p className="project-info"><strong>Số tiền đã quyên góp:</strong> {project.raisedAmount} ({project.raisedPercent})</p>
      <p className="project-info"><strong>Mục tiêu:</strong> {project.fundingGoal}</p>
      <button 
        className="donate-button" 
        onClick={() => {
          if (project.projectLink) {
            window.open(project.projectLink, '_blank');
          } else {
            navigate(`/projects/${projectId}/payment`);
          }
        }}
      >
        Quyên góp ngay
      </button>

      <div className="transactions-section">
        <button 
          className="toggle-transactions-button"
          onClick={toggleTransactions}
        >
          {showTransactions ? 'Ẩn giao dịch' : 'Xem giao dịch'} 
          <span className={`toggle-icon ${showTransactions ? 'up' : 'down'}`}>▼</span>
        </button>

        {showTransactions && (
          <div className="transactions-container">
            <h3 className="project-subtitle">Danh sách giao dịch:</h3>
            {transactions && transactions.length > 0 ? (
              <div className="transaction-list">
                {transactions.map((tx, index) => (
                  <div key={index} className="transaction-item">
                    <div className="transaction-info">
                      <div className="transaction-details">
                        <span className="donor-address">
                          Người quyên góp: {shortenAddress(tx.donorAddress)}
                        </span>
                        <span className="transaction-amount">
                          Số tiền: {tx.amount} ETH
                        </span>
                        <span className="transaction-date">
                          Thời gian: {formatDate(tx.timestamp)}
                        </span>
                      </div>
                      {tx.transactionHash && (
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transaction-link"
                        >
                          Xem trên Etherscan
                        </a>
                      )}
                      <span className={`transaction-status ${tx.status}`}>
                        {tx.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-transactions">Chưa có giao dịch nào.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;