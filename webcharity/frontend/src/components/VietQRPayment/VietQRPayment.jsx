import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './VietQRPayment.css';

const VietQRPayment = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('pending');
  const [checkingInterval, setCheckingInterval] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
          setProject(projectSnap.data());
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Không thể tải thông tin dự án');
      }
    };

    fetchProject();
  }, [projectId]);

  useEffect(() => {
    // Cleanup interval when component unmounts
    return () => {
      if (checkingInterval) {
        clearInterval(checkingInterval);
      }
    };
  }, [checkingInterval]);

  const handleAmountChange = (e) => {
    if (e.target.value === 'custom') {
      setAmount('');
    } else {
      setAmount(e.target.value);
      setCustomAmount('');
    }
  };

  const checkTransactionStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/check-transaction/${transactionId}`);
      setTransactionStatus(response.data.status);
      
      if (response.data.status === 'completed') {
        clearInterval(checkingInterval);
        setCheckingInterval(null);
        alert('Cảm ơn bạn đã quyên góp!');
        navigate(`/projects/${projectId}`);
      }
    } catch (err) {
      console.error('Error checking transaction status:', err);
      setError('Lỗi khi kiểm tra trạng thái giao dịch');
    }
  };

  const handleGenerateQR = async () => {
    const finalAmount = amount === '' ? customAmount : amount;
    if (!finalAmount || finalAmount < 1000) {
      setError('Vui lòng nhập số tiền hợp lệ (tối thiểu 1.000 VNĐ)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/generate-vietqr', {
        amount: parseInt(finalAmount),
        projectId: projectId
      });
      setQrCodeUrl(response.data.qrCodeUrl);
      setTransactionId(response.data.transactionId);
      
      // Bắt đầu kiểm tra trạng thái giao dịch mỗi 5 giây
      const interval = setInterval(checkTransactionStatus, 5000);
      setCheckingInterval(interval);
    } catch (err) {
      setError('Lỗi khi tạo mã QR. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return <div className="vietqr-payment">Đang tải thông tin dự án...</div>;
  }

  return (
    <div className="vietqr-payment">
      <h2>Quyên góp cho dự án: {project.title}</h2>
      <p className="project-description">{project.description}</p>
      
      <div className="project-info">
        <p>Mục tiêu: {project.fundingGoal}</p>
        <p>Đã quyên góp: {project.raisedAmount}</p>
      </div>

      {!qrCodeUrl ? (
        <>
          <label htmlFor="amount">Chọn số tiền (VNĐ):</label>
          <select id="amount" value={amount} onChange={handleAmountChange}>
            <option value="">Chọn số tiền</option>
            <option value="10000">10.000</option>
            <option value="20000">20.000</option>
            <option value="50000">50.000</option>
            <option value="100000">100.000</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
          
          {amount === 'custom' && (
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Nhập số tiền (VNĐ)"
              min="1000"
              className="custom-amount"
            />
          )}
          
          <button onClick={handleGenerateQR} disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo mã QR'}
          </button>
        </>
      ) : (
        <div className="qr-code">
          <img src={qrCodeUrl} alt="Mã VietQR" />
          <p>Quét mã bằng ứng dụng ngân hàng để chuyển khoản</p>
          <p className="status-message">
            {transactionStatus === 'pending' 
              ? 'Đang chờ xác nhận giao dịch...' 
              : 'Giao dịch đã hoàn thành!'}
          </p>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default VietQRPayment;