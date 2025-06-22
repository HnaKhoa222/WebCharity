import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Button from '../Button/Button';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        username: formData.username,
        email: formData.email,
        created_at: new Date().toISOString(),
      });
      setFormData({ username: '', email: '', password: '' });
      setIsLogin(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          username: user.displayName || '',
          email: user.email,
          created_at: new Date().toISOString(),
        });
      }

      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}</h1>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Đăng nhập để tiếp tục quyên góp cho các dự án' 
              : 'Đăng ký để bắt đầu quyên góp cho các dự án'}
          </p>
        </div>
        
        <div className="social-login">
          <button 
            className="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img src="/google-icon.svg" alt="Google" />
            {isLogin ? 'Đăng nhập với Google' : 'Đăng ký với Google'}
          </button>
        </div>

        <div className="divider">
          <span>hoặc</span>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Tên người dùng</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên của bạn"
                required={!isLogin}
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email của bạn"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <Button
            text={isLogin ? 'Đăng nhập' : 'Đăng ký'}
            variant="primary"
            type="submit"
            disabled={loading}
            className="submit-button"
          />
        </form>
        <p className="toggle-text">
          {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          <button 
            className="toggle-button"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? ' Đăng ký ngay' : ' Đăng nhập'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;