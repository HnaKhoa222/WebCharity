import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useInterest } from "../../contexts/InterestContext";
import "./Navbar.css";
import logo from "../Assets/logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, logout } = useAuth();
  const { getInterestCount } = useInterest();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={logo} alt="Logo" />
        </Link>

        <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Trang chủ
          </Link>
          <Link to="/projects" className="nav-link" onClick={closeMenu}>
            Dự án
          </Link>
          <Link to="/interests" className="nav-link interests-link" onClick={closeMenu}>
            Quan tâm
            {getInterestCount() > 0 && (
              <span className="interest-badge">{getInterestCount()}</span>
            )}
          </Link>
          <Link to="/guide" className="nav-link" onClick={closeMenu}>
            Hướng dẫn
          </Link>
        </div>

        <div className="navbar-auth">
          {currentUser ? (
            <div className="user-menu">
              <span className="user-name">
                Xin chào, {currentUser.displayName || currentUser.email}
              </span>
              <Link to="/create" className="create-btn">
                Tạo dự án
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/auth" className="auth-btn">
              Đăng nhập
            </Link>
          )}
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
