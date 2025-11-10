# Business Requirements Document (BRD)

**Project:** Hệ thống quay random chọn người chiến thắng – Giao diện mở hòm CSGO

---

## 1. Mục tiêu dự án

Xây dựng một hệ thống quay random nhằm chọn ra người chiến thắng theo cách **trực quan, hấp dẫn**, mô phỏng giao diện **“mở hòm CSGO”**.  
Hệ thống tự động tải avatar từ cơ sở dữ liệu, áp dụng **quy tắc giảm tỉ lệ nếu người chơi đã chiến thắng trong tuần**, lưu toàn bộ **lịch sử quay** và cho phép **quản lý dữ liệu tuần**.

---

## 2. Phạm vi dự án

⚠️ **Lưu ý:** Không sử dụng backend. Toàn bộ dữ liệu (avatar, lịch sử quay, tỉ lệ trúng, v.v.) sẽ được lưu và xử lý **ở frontend bằng DB**.

### Thành phần chính:

- Giao diện **React UI** mô phỏng hiệu ứng quay hòm CSGO.
- Input nhập tên người chơi trước khi quay.
- Tự động tải avatar người chơi từ database.
- Nếu người chơi không có avatar → sử dụng avatar mặc định: `default.png`.
- Áp dụng **luật giảm tỉ lệ trúng nếu người chơi đã thắng trong tuần**.
- Lưu **lịch sử quay theo từng ngày trong tuần**.
- Hiển thị **bảng lịch sử quay tuần hiện tại**.
- **Xóa lịch sử tuần** khi bắt đầu tuần mới (Thứ 2).
- **Nút xóa lịch sử thủ công** khi quay lỗi (ví dụ: nhập thiếu người chơi).

---

## 3. Yêu cầu nghiệp vụ (Business Requirements)

### 3.1. Quản lý người chơi

- Người dùng nhập **tên một hoặc nhiều người chơi** vào input.
- Hệ thống kiểm tra trong DB:
  - Nếu có avatar → hiển thị avatar tương ứng.
  - Nếu không có avatar → dùng `default.png`.

### 3.2. Giao diện quay hòm CSGO

- UI mô phỏng **hiệu ứng visual giống mở hòm CSGO**:
  - Danh sách avatar chạy ngang khi quay.
  - Chậm dần rồi dừng tại người chiến thắng.
- Giao diện trực quan, màu sắc tương tự game **CSGO**.

### 3.3. Quy tắc chọn người chiến thắng

- Random từ danh sách người chơi truyền vào.
- **Luật giảm tỉ lệ trong tuần (Thứ 2 → Thứ 6):**
  - Nếu người chơi đã trúng **1 lần trong tuần** → tỉ lệ trúng các lần tiếp theo **giảm 80%**.
  - Cách tính:
    - Tạo mảng các “slots” dựa trên **weight**.
    - Người bình thường: 10 slots.
    - Người bị giảm 80%: 2 slots.
  - Ví dụ:
    ```
    A → 10 slots
    B → 2 slots (đã bị giảm còn 20%)
    C → 10 slots
    → Random index trong mảng để chọn người thắng.
    ```
  - Giảm tỉ lệ áp dụng cho **toàn bộ lượt quay còn lại trong tuần đó**.
  - Mỗi tuần bắt đầu từ **Thứ 2 đến Thứ 6**.

### 3.4. Lịch sử quay

- Lưu mỗi kết quả sau khi quay vào database, gồm:
  - Tên người chơi
  - Avatar (đường dẫn)
  - Ngày giờ quay
- Lịch sử tuần hiện tại được hiển thị trên giao diện:
  - Danh sách dạng **bảng hoặc list**
  - Sắp xếp theo **thời gian mới nhất**

### 3.5. Reset dữ liệu tuần

- Khi ứng dụng **khởi động** hoặc **rollover sang Thứ 2**:
  - Xóa toàn bộ lịch sử tuần trước.
  - Tỉ lệ trúng của tất cả người chơi được reset lại mặc định.

### 3.6. Xóa lịch sử bằng tay

- Có nút **“Xóa lịch sử”** để admin dùng trong các trường hợp:
  - Nhập thiếu người chơi.
  - Quay sai người.
  - Kiểm thử hệ thống.
- Hai hình thức xóa:
  1. **Xóa từng lần quay:** Admin chọn 1 bản ghi cụ thể trong lịch sử tuần và xóa.
  2. **Xóa toàn bộ lịch sử tuần:** Dùng khi cần reset toàn bộ kết quả tuần.

### 3.7. Lưu kết quả tự động

Sau khi quay xong, hệ thống:

- Xác định người chiến thắng.
- Áp dụng luật giảm tỉ lệ (nếu cần).
- Lưu kết quả vào database **ngay lập tức**.

---

## 4. Yêu cầu kỹ thuật (Technical Requirements)

### 4.1. Frontend (ReactJS – không backend)

- Dùng **ReactJS** để xử lý toàn bộ logic.
- Lịch sử quay được lưu bằng **DB (LocalStorage / IndexedDB)**.
- Avatar người chơi lưu trong thư mục `/img`.
- Danh sách người chơi + số lần trúng trong tuần → lưu **LocalStorage**.
- Khi sang tuần mới (Thứ 2) → front-end **tự xóa dữ liệu cũ**.

### 4.2. Tính năng random không backend

Frontend xử lý trực tiếp:

- Load danh sách người chơi từ input.
- Tự kiểm tra số lần thắng trong tuần.
- Tự điều chỉnh weight theo rule giảm 80%.
- Random trực tiếp trong browser.

### 4.3. Avatar

- Avatar load trực tiếp từ thư mục `/img` của frontend.
- Nếu không có → sử dụng `default.png`.

---

## 5. Thành phần giao diện (UI Components)

- Ô input nhập tên người chơi.
- Khung preview avatar.
- Animation reel mở hòm CSGO.
- Bảng lịch sử quay.
- Nút “Xóa lịch sử”.
- Nút “Quay”.

---

## 6. KPI thành công

- Giao diện quay **mượt, đẹp, đúng phong cách CSGO**.
- **Thời gian quay < 3 giây.**
- **Lưu và load lịch sử trong < 200ms.**
- **Rule giảm tỉ lệ hoạt động chính xác.**
