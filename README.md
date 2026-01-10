### 1. Tổng quan
Đây là một ứng dụng web dạng **"Vòng quay may mắn" (Random Picker)** được thiết kế theo phong cách **mở hòm (Case Opening)** giống trong game CS:GO. Mục đích chính là để chọn ngẫu nhiên một người trong nhóm (ví dụ: chọn người trả tiền ăn trưa, trực nhật, v.v.) một cách công bằng và vui vẻ.
 
### 2. Công nghệ sử dụng
*   **Frontend**: React, Vite, TypeScript.
*   **UI Library**: Ant Design (các nút, modal, danh sách), Tailwind CSS (styling, layout).
*   **Backend/Database**: Supabase (lưu trữ người dùng và lịch sử quay).
 
### 3. Các chức năng chính
 
#### A. Quản lý người chơi (User Management)
*   **Nguồn dữ liệu**: Danh sách người chơi được tải từ bảng `User` trên Supabase (chỉ lấy những người có trạng thái `inActive: true`).
*   **Thêm người chơi tạm**: Người dùng có thể nhập tên để thêm người chơi mới ngay trên giao diện.
    *   Hệ thống sẽ cố gắng lưu người này vào database.
    *   Nếu lỗi, nó sẽ tạo một người chơi "tạm thời" (local) với ảnh meme mặc định để vẫn có thể quay được.
*   **Chọn người tham gia**: Có giao diện lưới (Grid) hiển thị avatar và tên. Bạn có thể click để chọn/bỏ chọn từng người hoặc dùng nút "Chọn tất cả" / "Bỏ chọn". Chỉ những người được chọn (có viền sáng) mới xuất hiện trong vòng quay.
 
#### B. Cơ chế quay thưởng (The "Case Opener")
Đây là tính năng cốt lõi nằm trong file CaseOpener.tsx và CaseStrip.tsx.
 
1.  **Thuật toán chọn người thắng (Weighted Random)**:
    *   Không phải ngẫu nhiên hoàn toàn 50/50. Hệ thống tính toán **trọng số (weight)** dựa trên lịch sử thắng trong tuần hiện tại.
    *   **Cơ chế cân bằng**: Người nào đã thắng nhiều lần trong tuần thì tỉ lệ thắng tiếp sẽ bị giảm đi cực mạnh (cụ thể: mỗi lần thắng, trọng số nhân với `0.1`, tức giảm 10 lần). Điều này giúp chia đều cơ hội cho mọi người.
2.  **Hiệu ứng hình ảnh**:
    *   Tạo ra một dải băng (`strip`) chứa danh sách người chơi lặp lại nhiều lần.
    *   Khi bấm "Mở hòm", hệ thống tính toán vị trí pixel chính xác để dải băng trượt (bằng CSS `transform`) và dừng lại đúng ngay giữa ô của người thắng cuộc sau 4 giây.
    *   Có hiệu ứng pháo hoa (fireworks) và modal chúc mừng khi có kết quả.
 
#### C. Lịch sử và Thống kê (History)
*   **Lưu trữ**: Kết quả quay được lưu vào bảng `Histories` trên Supabase.
*   **Phạm vi hiển thị**: Chỉ hiển thị lịch sử của **tuần hiện tại** (từ Thứ 2 đến Thứ 6/Chủ nhật).
*   **Tự động dọn dẹp**: Mỗi khi tải trang, hệ thống tự động ẩn (soft-delete) các lịch sử cũ hơn tuần hiện tại để danh sách luôn mới.
*   **Thao tác**:
    *   Có thể xóa từng dòng lịch sử (nếu quay nhầm).
    *   Có thể xóa toàn bộ lịch sử tuần.
 
### 4. Luồng hoạt động (Flow)
1.  **Khởi động**: Tải danh sách User và History từ Supabase.
2.  **Chuẩn bị**: Người dùng tích chọn những ai sẽ tham gia quay.
3.  **Quay**:
    *   Bấm "Mở hòm".
    *   Hệ thống tính toán người thắng dựa trên thuật toán giảm tỉ lệ người hay thắng.
    *   Chạy animation trượt băng chuyền.
4.  **Kết thúc**:
    *   Dừng lại ở người thắng.
    *   Hiện popup kết quả.
    *   Lưu kết quả vào History để tính toán tỉ lệ cho lần sau.
 
### Tóm lại
Trang web này là một công cụ chọn người ngẫu nhiên thông minh, có tính năng **"chống đen đủi"** (ai bị chọn rồi sẽ khó bị chọn lại ngay) và giao diện trực quan, sinh động.


### Hướng dẫn chạy code
Yêu cầu: 

- Node.js >= 16

Hướng dẫn (PowerShell - pwsh.exe):

1. Cài đặt dependencies

```powershell
npm install
```

2. Chạy dev server

```powershell
npm run dev
```
