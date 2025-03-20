import React from "react";
import "./Footer.css"; // Import file CSS riêng

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>HopeHouse</h2>
        </div>
        <div className="footer-links">
          <a href="#">Trang chủ</a>
          <a href="#">Dự án</a>
          <a href="#">Xác thực</a>
          <a href="#">Hướng dẫn</a>
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
