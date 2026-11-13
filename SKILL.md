---
name: video-story-director
description: Đạo diễn video hoạt hình 2D (chuẩn 100% phong cách @phatbieulungtung) hoặc 3D tiếng Việt từ chủ đề, kịch bản hoặc video tham chiếu; tích hợp tinh hoa từ 5 mã nguồn mở (Pexo Skills, OpenEdit, Hypit, FFmpeg Skill, VideoDB Skills); thiết kế nhân vật, biểu cảm và bối cảnh khác biệt theo từng chủ đề; chống lặp lại hình ảnh tuyệt đối; đồng bộ giọng đọc AI và phụ đề Karaoke rồi xuất MP4 chất lượng cao. Dùng cho tạo video, không phải website.
---

# Video Story Director

## 1. Tinh hoa kết hợp từ 5 Mã Nguồn Mở Hàng Đầu

Skill này được thiết kế và mở rộng dựa trên các nguyên lý cốt lõi từ 5 hệ thống mã nguồn mở:
1. **Pexo Skills (`pexoai/pexo-skills`)**: **Semantic Storyboard Decomposition** — Tự động phân rã chủ đề và kịch bản thành các shot hoạt cảnh có ý nghĩa trực quan. Mỗi câu nói là một hành động và không gian cụ thể, bảo đảm **mỗi video mỗi chủ đề sẽ ra hình ảnh và bối cảnh hoàn toàn khác nhau**, không bao giờ lặp lại một template đơn điệu.
2. **OpenEdit (`veedstudio/open-edit` by VEED)**: **Multi-Layer Procedural Animation Engine** — Hệ thống render Canvas nhiều lớp tách biệt: Lớp nền trời & kiến trúc đô thị, Lớp nhân vật vector rigged đa biểu cảm, Lớp đạo cụ/nội thất, Lớp hiệu ứng ánh sáng (radial glow, dust motes, traffic trails) và Lớp chữ/phụ đề.
3. **Hypit (`hypit-ai/hypit`)**: **Reference-Video Style Cloning** — Khả năng trích xuất và tái tạo chuẩn xác 100% phong cách thẩm mỹ của kênh tham chiếu (chibi viền đen đậm, biểu cảm mắt mí sụp mệt mỏi, bóng ma ký ức mờ ảo, cảnh vật hoài niệm, watermark bong bóng rỗng).
4. **FFmpeg Skill (`kajisho5/ffmpeg-skill`)**: **Local Accelerated Video Pipeline** — Tự động tối ưu hóa mã hóa phần cứng (NVIDIA NVENC), xử lý âm thanh (ZeroTTS clone + Faster-Whisper alignment), và trích xuất khung hình kiểm thử (QA Visual Validation) từ chính file MP4 xuất xưởng.
5. **VideoDB Skills (`video-db/skills`)**: **Contextual Topic-to-Visual Taxonomy** — Phân loại ngữ cảnh chủ đề sang bảng phối cảnh hoạt họa tương ứng (tình cảm, áp lực công việc, hoài niệm tuổi thơ, lòng can đảm, gia đình...).

---

## 2. Tiêu chuẩn Thẩm mỹ Hoạt hình 2D (@phatbieulungtung) & Khả năng Đa dạng Hóa

Khi tạo video hoạt hình 2D, phong cách viền đen đậm nét vector, gam màu ấm áp giàu cảm xúc được giữ chuẩn 100%, nhưng **nhân vật và bối cảnh PHẢI biến đổi linh hoạt theo từng kịch bản**:

### A. Hệ thống Nhân vật Đa dạng (`person`)
* **Kiểu tóc (`hair`)**:
  - `spiky`: Tóc gai nhọn anime đặc trưng (nam chính quen thuộc).
  - `smooth`: Tóc rẽ ngôi ngắn mượt bo tròn (như người bạn đồng hành).
  - `female_long`: Mái tóc dài thướt tha nữ tính qua vai.
  - `female_ponytail`: Tóc buộc đuôi ngựa cao năng động với chun buộc màu.
  - `curly`: Tóc xoăn uốn lượn phong cách nghệ thuật.
  - `cap`: Đội mũ lưỡi trai cá tính / mũ len.
* **Trang phục (`outfit`)**:
  - `coat_scarf`: Áo khoác mùa đông cúc trắng kèm khăn quàng.
  - `hoodie`: Áo nỉ hoodie có túi trước bụng và dây rút thể thao.
  - `sweater`: Áo len dệt kim bo cổ ấm áp.
  - `shirt_tie`: Áo sơ mi công sở thắt cà vạt.
  - `tshirt`: Áo phông ngắn tay mùa hè năng động.
* **Khăn quàng (`scarf`)**: Tùy chỉnh màu (`#eb3b5a`, `#fed330`, `#20bf6b`, `#4b7bec`) hoặc tắt hẳn (`scarf: false`).
* **Phụ kiện (`accessory`)**: `glasses` (kính gọng tròn trí thức), `headphones` (tai nghe chụp tai), `coffee` (cốc cà phê), `phone` (điện thoại phát sáng).
* **Tư thế (`pose`)**: `stand`, `walk` (chân và tay vung bước đi tự nhiên), `sit_bench` (ngồi ghế công viên), `sit_bus`, `sit_desk`, `sit_bed`, `lean_rail`, `hold_coffee` (cầm tách cà phê tỏa khói nghi ngút), `hold_phone` (cầm smartphone), `wave`, `backview`, `ghost`.
* **Biểu cảm (`mood`)**: `tired` (mí sụp, thâm mắt), `closed` (nhắm mắt tĩnh tại), `smile` / `happy` (mắt cười rạng rỡ), `sad` (buồn bã), `tear` (giọt lệ lấp lánh trên má), `surprised` (kinh ngạc tròn mắt), `determined` (mày cau kiên nghị), `backview`.

### B. Kho Bối cảnh Phong phú (16+ Môi trường 2D)
1. `rain_cafe`: Quán cà phê ngày mưa, vệt mưa chảy trên kính, đèn thả trần vàng ấm, tách cà phê tỏa khói.
2. `park_autumn`: Công viên mùa thu lá vàng/đỏ rơi lả tả theo gió, ghế gỗ công viên, đèn đường cổ điển, lối đi uốn lượn.
3. `crossroads`: Ngã ba đường rẽ hai ngả hướng về núi xa, biển chỉ dẫn gỗ hai chiều, hạt bồ công anh bay trong gió.
4. `bedroom_night`: Phòng ngủ đêm tĩnh mịch, trằn trọc nhìn trăng sao qua cửa sổ, đồng hồ điện tử dạ quang phát sáng.
5. `rooftop_stars`: Sân thượng lộng gió ngắm bầu trời sao bao la, trăng khuyết và vệt sao băng lướt qua thành phố đêm.
6. `nature_hill`: Đồi cỏ xanh trải dài, một cây cổ thụ sum suê đứng sừng sững trên đỉnh đồi, mây trắng bồng bềnh.
7. `beach_sunset`: Bờ biển hoàng hôn tím đỏ rực rỡ, mặt trời lặn trên sóng nước phản chiếu ánh vàng, sóng vỗ bờ cát.
8. `office_desk`: Bàn làm việc công sở đêm khuya, laptop sáng đèn, chồng tài liệu, ly cà phê giấy, view nhà chọc trời.
9. `cozy_kitchen`: Gian bếp gia đình ấm áp, nồi canh/bát cơm bốc khói nghi ngút dưới ánh đèn bàn ăn, gợi nhớ về mẹ và bữa cơm nhà.
10. `clock_time`: Mặt đồng hồ La Mã khổng lồ quay chuyển, đồng hồ cát phát sáng, những tờ lịch bay theo năm tháng.
11. `city_street`: Dãy nhà phố pastel, cột đèn vàng, cây khô lá đỏ, xe đạp, người đi đường.
12. `subway_window` / `bus_window`: Cửa sổ toa tàu điện ngắm nhìn thành phố lướt qua trong đêm.
13. `overpass_night`: Cầu vượt nhìn đại lộ đêm với dòng đèn xe trắng đỏ chạy liên tục.
14. `desk_room`: Phòng tối tĩnh lặng có đèn cây tỏa quầng sáng ấm, laptop, cánh cửa hé mở.
15. `party_night`: Lễ hội đêm, dây đèn tròn treo lung linh, bóng người dập dìu.
16. `window_sunrise`: Cửa sổ nan quạt đón ánh mặt trời bình minh rạng rỡ trên dãy đồi.

---

## 3. Quy Tắc Bắt Buộc: Chống Lặp Lại Hình Ảnh (Anti-Repetition Rules)

Để bảo đảm **mỗi video tạo ra đều có hình ảnh MỚI LẠ, KHÔNG LẶP LẠI**:

1. **Khác biệt hóa Nhân vật chính (Protagonist Differentiation)**:
   - Tuyệt đối không dùng lặp lại nhân vật nam quàng khăn đỏ cho mọi video!
   - Video về tình cảm / cô đơn: Có thể là cô gái tóc dài (`female_long`) mặc áo len vàng ấm, hoặc chàng trai áo hoodie xanh.
   - Video về sự nghiệp / áp lực: Nhân viên công sở sơ mi thắt cà vạt đeo kính cận (`shirt_tie`, `glasses`), hoặc sinh viên ngồi bên laptop.
   - Video về gia đình / hồi ức: Chàng trai/cô gái tóc mượt áo len, hoặc hình ảnh hai người bạn bước đi cùng nhau.
2. **Khác biệt hóa Chuỗi Phân cảnh (Scene Sequence Differentiation)**:
   - Tuyệt đối không sao chép lại chuỗi cảnh `[city_street -> subway_window -> desk_room -> card -> window_sunrise]`.
   - Mỗi video phải chọn **4–6 bối cảnh độc đáo** gắn chặt với nội dung văn học của kịch bản:
     - *Kịch bản về Chậm lại / Bình yên*: `park_autumn` (ngồi ghế ngắm lá rơi) $\rightarrow$ `rain_cafe` (nhâm nhi cà phê ngày mưa) $\rightarrow$ `nature_hill` (ngắm cây lớn trên đồi) $\rightarrow$ `beach_sunset` (dòng sông ra biển lớn).
     - *Kịch bản về Vết thương / Chữa lành*: `rain_cafe` $\rightarrow$ `bedroom_night` $\rightarrow$ `subway_window` (bóng ma ký ức) $\rightarrow$ `crossroads` (chọn bước tiếp) $\rightarrow$ `rooftop_stars` (sao băng hy vọng).
     - *Kịch bản về Dám thử / Vượt qua thất bại*: `office_desk` (mệt mỏi đêm khuya) $\rightarrow$ `overpass_night` (dòng đời hối hả) $\rightarrow$ `crossroads` (đứng trước ngã rẽ) $\rightarrow$ `nature_hill` (bước đi trên đồi cao) $\rightarrow$ `window_sunrise` (đón bình minh).
3. **Phối màu & Ánh sáng theo Cảm xúc (Emotional Color Tuning)**:
   - Mỗi video chọn một tông màu chủ đạo: Tông Thu hoài niệm (`#f8a5c2`, `#f7d794`), Tông Mưa sâu lắng (`#2c3e50`, `#74b9ff`), Tông Biển hoàng hôn (`#581c87`, `#f97316`), Tông Đêm huyền ảo (`#090a0f`, `#1b1b2f`).
4. **Không gắn watermark thừa**: Nếu người dùng không yêu cầu watermark, luôn để `"watermark": ""`.
5. **Kiểm tra trực quan (Visual QA)**: Luôn trích xuất các khung hình thực tế từ file MP4 xuất xưởng và dùng `read_file` để kiểm chứng độ mới lạ và phong phú của hình ảnh trước khi bàn giao.

---

## 4. Tài liệu Tham khảo Đi kèm

* Đọc [schema hoạt hình 2D](references/illustrated-schema.md) để tra cứu toàn bộ thuộc tính đối tượng.
* Đọc [tham chiếu phong cách @phatbieulungtung](references/reference-style.md) để xem phân tích chi tiết từ video mẫu gốc.
* Đọc [tiêu chuẩn sản xuất hoạt hình](references/animation-production.md) để kiểm tra chất lượng trước khi bàn giao.
