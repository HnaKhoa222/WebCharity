const express = require('express');
const axios = require('axios');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors()); 
app.use(express.json());

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const vietQRConfig = {
  bankCode: 'VCB',
  accountNumber: '1019249370',
  accountName: 'HUYNH NGUYEN ANH KHOA',
};

async function generateVietQR(amount, projectId) {
  const qrData = `https://img.vietqr.io/image/${vietQRConfig.bankCode}-${vietQRConfig.accountNumber}-compact.png?amount=${amount}&addInfo=${encodeURIComponent('Ung ho Quy Nhom 3')}`;

  const transactionRef = db.collection('transactions').doc();
  const transactionData = {
    amount,
    projectId,
    qrCodeUrl: qrData,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    donorName: 'Anonymous', 
  };

  await transactionRef.set(transactionData);

  const projectRef = db.collection('projects').doc(projectId);
  const projectDoc = await projectRef.get();
  
  if (projectDoc.exists()) {
    const projectData = projectDoc.data();
    const currentAmount = parseInt(projectData.raisedAmount.replace(/[^0-9]/g, ''));
    const newAmount = currentAmount + amount;
    const fundingGoal = parseInt(projectData.fundingGoal.replace(/[^0-9]/g, ''));
    const raisedPercent = `${Math.round((newAmount / fundingGoal) * 100)}%`;

    await projectRef.update({
      raisedAmount: `${newAmount.toLocaleString()} VNĐ`,
      raisedPercent: raisedPercent,
      transactions: admin.firestore.FieldValue.arrayUnion({
        donorName: 'Anonymous',
        amount: `${amount.toLocaleString()} VNĐ`,
        date: new Date().toLocaleDateString('vi-VN'),
        transactionId: transactionRef.id
      })
    });
  }

  return { 
    qrCodeUrl: qrData, 
    transactionId: transactionRef.id,
    message: 'Đã tạo mã QR và cập nhật thông tin dự án'
  };
}

async function checkTransactionStatus(transactionId) {
  const transactionRef = db.collection('transactions').doc(transactionId);
  const transactionDoc = await transactionRef.get();

  if (!transactionDoc.exists()) {
    throw new Error('Không tìm thấy giao dịch');
  }

  const transactionData = transactionDoc.data();
  
  if (transactionData.status === 'completed') {
    return { status: 'completed', message: 'Giao dịch đã hoàn thành' };
  }

  const isCompleted = Math.random() > 0.5;

  if (isCompleted) {
    const { projectId, amount } = transactionData;
    
    await transactionRef.update({
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (projectDoc.exists()) {
      const projectData = projectDoc.data();
      const currentAmount = parseInt(projectData.raisedAmount.replace(/[^0-9]/g, ''));
      const newAmount = currentAmount + amount;
      const fundingGoal = parseInt(projectData.fundingGoal.replace(/[^0-9]/g, ''));
      const raisedPercent = `${Math.round((newAmount / fundingGoal) * 100)}%`;

      await projectRef.update({
        raisedAmount: `${newAmount.toLocaleString()} VNĐ`,
        raisedPercent: raisedPercent,
        transactions: admin.firestore.FieldValue.arrayUnion({
          donorName: 'Anonymous',
          amount: `${amount.toLocaleString()} VNĐ`,
          date: new Date().toLocaleDateString('vi-VN'),
          transactionId: transactionId
        })
      });
    }

    return { status: 'completed', message: 'Giao dịch đã hoàn thành' };
  }

  return { status: 'pending', message: 'Đang chờ xác nhận giao dịch' };
}

app.post('/generate-vietqr', async (req, res) => {
  const { amount, projectId } = req.body;

  try {
    const result = await generateVietQR(amount, projectId);
    res.json(result);
  } catch (error) {
    console.error('Lỗi khi tạo VietQR:', error);
    res.status(500).json({ error: 'Không thể tạo mã VietQR' });
  }
});

app.get('/check-transaction/:transactionId', async (req, res) => {
  const { transactionId } = req.params;

  try {
    const result = await checkTransactionStatus(transactionId);
    res.json(result);
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái giao dịch:', error);
    res.status(500).json({ error: 'Không thể kiểm tra trạng thái giao dịch' });
  }
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});