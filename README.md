# WebCharity - Nền tảng kết nối các dự án từ thiện
https://webcharity-d0795.web.app/

## Thành viên nhóm:
- **Huỳnh Nguyễn Anh Khoa** - 21522221  
- **Đồng Tài Đức** - 22520265  
- **Đặng Bảo Sơn** - 22521247  

## Giảng viên hướng dẫn:
- **ThS. Trần Tuấn Dũng**

## Mô tả sản phẩm:
_Đây là một hệ thống quản lý vốn từ thiện giúp theo dõi, quản lý các khoản quyên góp và phân phối một cách minh bạch và hiệu quả._

## Công nghệ sử dụng:
- **Design UI/UX:** ReactJS
- **Backend:** Nodejs
- **Database:** Firebase

## Mô tả chức năng

WebCharity là một nền tảng web giúp kết nối các dự án từ thiện với cộng đồng, hỗ trợ quản lý, đóng góp và theo dõi các dự án một cách minh bạch, tiện lợi. Các chức năng chính bao gồm:

- **Trang chủ (Home):** Giới thiệu tổng quan về nền tảng và các dự án nổi bật.
- **Đăng nhập/Đăng ký (Auth):** Hệ thống xác thực người dùng.
- **Danh sách dự án (Projects):** Xem tất cả các dự án từ thiện đang hoạt động.
- **Chi tiết dự án:** Xem thông tin chi tiết, tiến độ, và các khoản đóng góp của từng dự án.
- **Đóng góp qua Web3 (Web3Payment):** Hỗ trợ đóng góp bằng ví điện tử, blockchain.
- **Đóng góp truyền thống (VietQR):** Hỗ trợ đóng góp qua mã QR ngân hàng.
- **Tạo dự án mới (Create):** Người dùng được phân quyền có thể tạo dự án mới.
- **Quản lý dự án (ManageProjects):** Quản lý các dự án do mình tạo, chỉnh sửa, cập nhật tiến độ.
- **Hướng dẫn sử dụng (Guide):** Trang hướng dẫn sử dụng nền tảng cho người mới.
- **Tìm kiếm, lọc dự án:** Hỗ trợ tìm kiếm, lọc dự án theo sở thích, lĩnh vực.
- **Quan tâm dự án:** Đưa dự án vào danh sách quan tâm cho người dùng theo dõi.
- **Bảo vệ route (ProtectedRoute):** Một số chức năng chỉ dành cho người dùng đã đăng nhập.

## Phân công công việc nhóm
  - Huỳnh Nguyễn Anh Khoa:
    + Thiết kế cấu trúc đồ án
    + Homepage
    + smart contract, quản lý dự án
    + bảo vệ Route
  - Đặng Bảo Sơn:
    + Tạo dự án
    + Hiển thị dự án
    + Hướng dẫn
    + responsive
  - Đồng Tài Đức:
    + Tìm kiếm, lọc dự án
    + Quan tâm dự án
  - Thiết kế giao diện: cả nhóm

## Cài đặt và chạy dự án local
### Clone repository này về máy:
```sh
git clone https://github.com/HnaKhoa222/WebCharity.git
```

### Khởi động trang web:
1. Cài đặt dependencies:
```sh
npm install
```
2. Chạy ứng dụng ở thực mục frontend và backend :
```sh
npm start
```

## Tổng kết:
_Ứng dụng giúp quản lý vốn từ thiện minh bạch, dễ sử dụng và triển khai dễ dàng._
