import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import './ManageProjects.css';

const ManageProjects = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(null); // projectId or null
  const [showWithdrawModal, setShowWithdrawModal] = useState(null); // projectId or null
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [withdrawMessage, setWithdrawMessage] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentUser) {
        setProjects([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const q = query(collection(db, 'projects'), where('creatorId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(data);
      } catch (err) {
        setError('Không thể tải danh sách dự án.');
      }
      setLoading(false);
    };
    fetchProjects();
  }, [currentUser]);

  // Thanh tiến độ
  const getProgressPercent = (project) => {
    const raised = parseFloat(project.raisedAmount) || 0;
    const goal = parseFloat(project.fundingGoal) || 1;
    return Math.min(100, Math.round((raised / goal) * 100));
  };

  // Cập nhật trạng thái dự án
  const handleUpdateStatus = async (projectId) => {
    setStatusLoading(true);
    setStatusMessage('');
    try {
      await updateDoc(doc(db, 'projects', projectId), { status: 'Đã kết thúc' });
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'Đã kết thúc' } : p));
      setStatusMessage('Cập nhật trạng thái thành công!');
      setTimeout(() => setShowStatusModal(null), 1000);
    } catch (err) {
      setStatusMessage('Có lỗi khi cập nhật trạng thái.');
    }
    setStatusLoading(false);
  };

  // Kết nối ví và rút tiền (giả lập)
  const handleWithdraw = async (project) => {
    setWithdrawLoading(true);
    setWithdrawMessage('');
    // TODO: Thực hiện logic kết nối ví và gọi smart contract thực tế ở đây
    setTimeout(() => {
      setWithdrawLoading(false);
      setWithdrawMessage('Yêu cầu rút tiền đã được gửi (giả lập).');
      setTimeout(() => setShowWithdrawModal(null), 1200);
    }, 1200);
  };

  if (!currentUser) {
    return (
      <div className="manage-projects-page">
        <div className="not-logged-in">Vui lòng đăng nhập để quản lý dự án của bạn.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="manage-projects-page">
        <div className="loading">Đang tải danh sách dự án...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-projects-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="manage-projects-page">
      <h1>Quản lý dự án của bạn</h1>
      {projects.length === 0 ? (
        <div className="no-projects">
          <p>Bạn chưa tạo dự án nào.</p>
          <p>Hãy tạo dự án mới để bắt đầu gây quỹ!</p>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map(project => (
            <div className="project-card" key={project.id}>
              <img src={project.image} alt={project.title} className="project-image" />
              <div className="project-info">
                <h2>{project.title}</h2>
                <p><strong>Quỹ:</strong> {project.fundName}</p>
                <p><strong>Mục tiêu:</strong> {project.fundingGoal}</p>
                <p><strong>Đã nhận:</strong> {project.raisedAmount}</p>
                <p><strong>Trạng thái:</strong> {project.status || 'Đang gây quỹ'}</p>
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: getProgressPercent(project) + '%' }} />
                  </div>
                  <span className="progress-percent">{getProgressPercent(project)}%</span>
                </div>
                <div className="manage-actions">
                  <button className="button update-btn" onClick={() => setShowStatusModal(project.id)} disabled={project.status === 'Đã kết thúc'}>
                    Kết thúc dự án
                  </button>
                  <button className="button withdraw-btn" onClick={() => setShowWithdrawModal(project.id)}>
                    Rút tiền
                  </button>
                </div>
                {showStatusModal === project.id && (
                  <div className="modal-overlay">
                    <div className="modal">
                      <h3>Kết thúc dự án?</h3>
                      <p>Bạn có chắc muốn kết thúc dự án này? Sau khi kết thúc, dự án sẽ không thể nhận thêm tiền.</p>
                      <div className="modal-actions">
                        <button className="button" onClick={() => handleUpdateStatus(project.id)} disabled={statusLoading}>
                          {statusLoading ? 'Đang cập nhật...' : 'Xác nhận kết thúc'}
                        </button>
                        <button className="button cancel-btn" onClick={() => setShowStatusModal(null)} disabled={statusLoading}>
                          Hủy
                        </button>
                      </div>
                      {statusMessage && <div className="modal-message">{statusMessage}</div>}
                    </div>
                  </div>
                )}
                {showWithdrawModal === project.id && (
                  <div className="modal-overlay">
                    <div className="modal">
                      <h3>Rút tiền từ dự án</h3>
                      <p>Kết nối ví (MetaMask) để xác nhận rút tiền.</p>
                      <input
                        type="number"
                        min="0"
                        max={project.raisedAmount}
                        placeholder="Số tiền muốn rút"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        className="withdraw-input"
                        disabled={withdrawLoading}
                      />
                      <div className="modal-actions">
                        <button className="button" onClick={() => handleWithdraw(project)} disabled={withdrawLoading || !withdrawAmount}>
                          {withdrawLoading ? 'Đang xử lý...' : 'Xác nhận rút'}
                        </button>
                        <button className="button cancel-btn" onClick={() => setShowWithdrawModal(null)} disabled={withdrawLoading}>
                          Hủy
                        </button>
                      </div>
                      {withdrawMessage && <div className="modal-message">{withdrawMessage}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageProjects; 