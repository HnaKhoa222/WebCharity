import { Link } from "react-router-dom";
import './Navbar.css'
import Button from "../Button/Button";


const Navbar = () => {
  return (
    <div className="navbar">
      <h1 className="logo">HopeHouse</h1>
      <div className="nav-links">
        <Link to="/">Trang chủ</Link>
        <Link to="/projects">Dự án</Link>
        <Link to="/verify">Xác minh</Link>
        <Link to="/guide">Hướng dẫn</Link>
      </div>
      <div>
        <Button text="Đăng nhập" onClick={() => alert("Clicked!")} />
        <Button text="Đăng ký" onClick={() => alert("Clicked!")} />
      </div>
    </div>
  );
};

export default Navbar
