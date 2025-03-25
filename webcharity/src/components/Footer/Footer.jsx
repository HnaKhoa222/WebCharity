import React from "react";
import "./Footer.css"; // Import file CSS riêng
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>HopeHouse</h2>
        </div>
        <div className="footer-links">
          <Link to="/">Trang chủ</Link>
          <Link to="/projects">Các dự án</Link>
          <Link to="/create">Tạo dự án</Link>
          <Link to="/guide">Hướng dẫn</Link>
        </div>
        <div className="footer-contact">
          <p>Email: support@nhom3.vn</p>
          <p>Hotline: 1900 1234</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 HopeHouse. Mọi quyền được bảo lưu.</p>
      </div>
    </footer>
  );
};

export default Footer;
