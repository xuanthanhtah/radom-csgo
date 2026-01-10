### Sử dụng supabase để xử lý dữ liệu

### Thành phần chính:

- Giao diện **React UI** mô phỏng hiệu ứng quay hòm CSGO.
- Hiển thị danh sách user từ db lên. (mặc định)
- Input nhập tên người chơi cho trường hợp các user thêm bất thường, sử dụng ảnh mặt định làm avatar cho các user bất thường.
- Các user bất thường không cần lưu thông tin user vào db. tỷ lệ thắng của user bất thường luôn là mặc định. không áp dụng cơ chế giảm tỷ lệ.
- Áp dụng **luật giảm tỉ lệ trúng nếu người chơi đã thắng trong tuần**.
- Lưu **lịch sử quay theo từng ngày trong tuần**.
- Hiển thị **bảng lịch sử quay tuần hiện tại**.
- **Xóa lịch sử tuần** khi bắt đầu tuần mới (Thứ 2).
- **Nút xóa lịch sử thủ công** khi quay lỗi (ví dụ: nhập thiếu người chơi).

---

## 3. Yêu cầu nghiệp vụ (Business Requirements)

### 3.2. Giao diện quay hòm CSGO

- UI mô phỏng **hiệu ứng visual giống mở hòm CSGO**:
  - Danh sách avatar chạy ngang khi quay.
  - Chậm dần rồi dừng tại người chiến thắng.
- Giao diện trực quan, màu sắc tương tự game **CSGO**.

### 3.3. Quy tắc chọn người chiến thắng

- Random từ danh sách người chơi.
- **Luật giảm tỉ lệ trong tuần (Thứ 2 → CN):**

  - Ban đầu tỷ lệ trúng của các người chơi là như nhau.
  - Nếu người chơi đã trúng **1 lần trong tuần** → tỉ lệ trúng các lần tiếp theo **giảm 80%**.
  - Nếu người chơi đã trúng vẫn trúng tiếp thì tiếp tục giảm 80% từ số % còn lại:

    - ví dụ: giảm 80%/100% > giảm 80%/20% > tiếp tục....

  - Giảm tỉ lệ áp dụng cho **toàn bộ lượt quay còn lại trong tuần đó**.
  - Mỗi tuần bắt đầu từ **Thứ 2 đến CN** (Chủ Nhật).

### 3.4. Lịch sử quay

- Lưu mỗi kết quả sau khi quay vào database, gồm:
- Lịch sử tuần hiện tại được hiển thị trên giao diện:
  - Danh sách dạng **bảng hoặc list**
  - Sắp xếp theo **thời gian mới nhất lên trước**

### 3.5. Reset dữ liệu tuần

- Khi ứng dụng **khởi động** hoặc **rollover sang Thứ 2**:
  - Xóa toàn bộ lịch sử tuần trước.
  - Tỉ lệ trúng của tất cả người chơi được reset lại mặc định có tỷ lệ như nhau.

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

### sử dụng supabase để lưu, xóa, thêm thông tin.

API:
get all user:

let { data: User, error } = await supabase
.from('User')
.select('\*')

get all histories:

let { data: Histories, error } = await supabase
.from('Histories')
.select('\*')

delete histories:

const { error } = await supabase
.from('Histories')
.delete()
.eq('some_column', 'someValue')

insert histories:

const { data, error } = await supabase
.from('Histories')
.insert([
{ some_column: 'someValue', other_column: 'otherValue' },
])
.select()

// nếu thiếu API nào thì liên hệ để cung cấp thêm
