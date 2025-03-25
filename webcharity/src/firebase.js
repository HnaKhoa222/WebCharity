// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth'; // Thêm Authentication

// Firebase configuration từ bạn cung cấp
const firebaseConfig = {
  apiKey: "AIzaSyCZj6zlGXD-oC-nXLJ9idAyLRDBq1e_qys",
  authDomain: "webcharity-d0795.firebaseapp.com",
  projectId: "webcharity-d0795",
  storageBucket: "webcharity-d0795.firebasestorage.app",
  messagingSenderId: "578448191236",
  appId: "1:578448191236:web:9a0c9bd53ed579c25e2a51",
  measurementId: "G-QEDPWFYET7",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Analytics (tùy chọn)
const auth = getAuth(app); // Authentication

export { app, analytics, auth }; // Export để dùng ở các file khác