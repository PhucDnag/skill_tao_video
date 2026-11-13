# 🎬 Video Story Director — AI 2D Cartoon Video Generator

Công cụ tự động hóa tạo video hoạt hình 2D nghệ thuật chuẩn 100% phong cách kênh TikTok **@phatbieulungtung** (kể chuyện triết lý, tự sự sâu lắng), kết hợp giọng đọc AI ấm áp và phụ đề Karaoke chạy chữ chính xác theo từng từ.

---

## ✨ Điểm Nổi Bật

- **Phong cách Hoạt hình 2D Vector**: Nét viền đen đậm dứt khoát, gam màu pastel và hoài niệm ấm áp.
- **Không Lặp Lại Hình Ảnh (Anti-Repetition)**: Mỗi kịch bản sở hữu một chuỗi phân cảnh và tạo hình nhân vật hoàn toàn mới lạ.
- **Hệ Thống 16+ Bối Cảnh Độc Bản**:
  - Quán cà phê ngày mưa (`rain_cafe`), Công viên mùa thu lá rơi (`park_autumn`).
  - Ngã rẽ cuộc đời (`crossroads`), Bàn làm việc công sở đêm (`office_desk`).
  - Phòng ngủ đêm trăng sao (`bedroom_night`), Sân thượng ngắm sao băng (`rooftop_stars`).
  - Đồi cỏ & Cây đại thụ (`nature_hill`), Bờ biển hoàng hôn (`beach_sunset`).
  - Vòng xoay thời gian (`clock_time`), Bếp ăn gia đình ấm cúng (`cozy_kitchen`).
  - Toa tàu điện ngầm (`subway_window`), Cầu vượt đại lộ (`overpass_night`), Cửa sổ đón bình minh (`window_sunrise`).
- **Tùy Biến Nhân Vật Sống Động**:
  - Kiểu tóc: Gai nhọn anime (`spiky`), rẽ ngôi ngắn mượt (`smooth`), nữ tóc dài (`female_long`), tóc đuôi ngựa (`female_ponytail`), tóc xoăn (`curly`), mũ lưỡi trai (`cap`).
  - Trang phục: Hoodie thể thao, áo len dệt kim, sơ mi cà vạt, áo khoác quàng khăn, áo phông.
  - Phụ kiện & Tư thế: Kính cận, cầm ly cà phê bốc khói, cầm điện thoại, bước đi, ngồi ghế công viên.
- **Giọng Đọc AI & Phụ Đề Karaoke**:
  - Giọng đọc clone offline sâu lắng, truyền cảm (ZeroTTS).
  - Phụ đề in hoa ở đáy màn hình, từ đang đọc được bôi vàng `#ffd600` khớp chính xác từng mili-giây qua Faster-Whisper.
- **Xuất MP4 Siêu Tốc**: Tận dụng mã hóa phần cứng đồ họa (NVIDIA NVENC).

---

## 🛠️ Yêu Cầu Cài Đặt

1. **Node.js** (phiên bản 18 trở lên).
2. **Python** (phiên bản 3.10 trở lên).
3. **FFmpeg** (đã thêm vào PATH hệ thống).
4. **Google Chrome / Chromium** (dùng cho Puppeteer render Canvas).

### Cài đặt thư viện:
```bash
# Cài đặt Node dependencies
npm install

# Cài đặt Python dependencies (ZeroTTS, Whisper, Librosa)
pip install -r requirements.txt
```

---

## 🚀 Hướng Dẫn Sử Dụng Nhanh

### 1. Render Video từ File Cấu Hình Dự Án
```bash
node cli.js render --project projects/lang_phi_thoi_gian.json --output output/lang_phi_thoi_gian.mp4
```
> Video thành phẩm sẽ được lưu trong thư mục `output/` với độ phân giải chuẩn 16:9 (1280x720) hoặc 9:16 (1080x1920).

### 2. Nhân Bản Giọng Đọc Mới (Voice Clone)
Bạn có thể tách lọc và nhân bản bất kỳ giọng đọc nào từ file video/audio mẫu (.mp4, .mp3, .wav):
```bash
node cli.js clone-voice --audio path/to/sample.mp4 --name ten_giong_moi
```
> Gói giọng mới sẽ được tối ưu và lưu vào thư mục `voices/ten_giong_moi/`.

### 3. Kiểm Tra & Chạy Test Tự Động
```bash
npm test
```

---

## 📁 Cấu Trúc Thư Mục

```text
├── cli.js                  # Giao diện dòng lệnh chính (render, clone-voice, validate)
├── SKILL.md                # Hướng dẫn chi tiết kỹ năng và quy tắc đạo diễn video
├── projects/               # Định nghĩa kịch bản và phân cảnh video (.json)
├── voices/                 # Các gói dữ liệu giọng đọc mẫu (.npz, meta.json)
├── src/
│   ├── agent/              # Bộ phân tích phân cảnh và kiểm tra tính hợp lệ kịch bản
│   ├── renderer/           # Engine vẽ Canvas 2D (illustratedStory.js) & Puppeteer xuất MP4
│   └── tts/                # Bộ máy tạo âm thanh giọng đọc và căn chỉnh phụ đề Whisper
├── references/             # Tài liệu đặc tả schema đối tượng và phong cách đồ họa
└── tests/                  # Bộ kiểm thử tự động (Unit test, Render test, Subtitle test)
```

---

## 💡 Tạo Video Với Chủ Đề Mới

Chỉ cần gửi kịch bản hoặc chủ đề bạn muốn thực hiện, hệ thống sẽ:
1. Tự động phân tích ngữ nghĩa và cảm xúc chủ đạo.
2. Thiết kế nhân vật và chuỗi bối cảnh tương ứng (không trùng lặp video cũ).
3. Khởi tạo file dự án tại `projects/<chu_de>.json`.
4. Render xuất xưởng video MP4 chất lượng cao.

