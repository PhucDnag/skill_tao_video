# Tham chiếu phân tích video mẫu phong cách 2D Cartoon (@phatbieulungtung)

Tài liệu này ghi nhận kết quả phân tích trực tiếp từ video mẫu gốc của kênh **@phatbieulungtung** (`snaptik.vn_7704634399400283399.mp4`, thời lượng 96.5s, độ phân giải 1024x576 16:9 ngang), kết hợp các nguyên lý từ 5 hệ thống mã nguồn mở hàng đầu:
* **Pexo Skills** (`pexoai/pexo-skills`): Semantic Storyboard Decomposition (phân rã beat kịch bản thành các shot hoạt cảnh có ý nghĩa trực quan, mỗi chủ đề có bối cảnh riêng biệt).
* **OpenEdit** (`veedstudio/open-edit` by VEED): Multi-Layer Procedural Animation Engine (tách biệt nền trời, bối cảnh kiến trúc, nhân vật rigged, hiệu ứng ánh sáng/hạt và phụ đề).
* **Hypit** (`hypit-ai/hypit`): Reference-Video Style Cloning (tái tạo 100% nhận diện thẩm mỹ của kênh: nhân vật chibi viền nét đậm, mắt mí sụp mệt mỏi, người bóng mờ silhouette, bóng ma ký ức ghost, bối cảnh hoài niệm).
* **FFmpeg Skill** (`kajisho5/ffmpeg-skill`): Local Hardware-Accelerated Video Pipeline (mã hóa GPU NVENC, căn chỉnh audio Whisper karaoke, trích xuất QA frames tự động).
* **VideoDB Skills** (`video-db/skills`): Contextual Taxonomy Mapping (phân loại chủ đề tự động sang hệ thống hình ảnh tương ứng để không bao giờ có 2 video bị trùng lặp bối cảnh).

---

## 1. Thiết kế nhân vật 2D Vector đa dạng (Procedural Rigging)

* **Tỷ lệ & Nét vẽ**: Chibi cách điệu (đầu to 1:2.4 so với cơ thể), viền nét đen đậm dứt khoát (`lineWidth ~ 2–3.5px`).
* **Hệ thống Kiểu tóc (`hair`)**:
  - `spiky`: Mái tóc gai nhọn anime màu nâu đen `#2d221e`.
  - `smooth`: Mái tóc rẽ ngôi ngắn mượt (như người bạn trong video mẫu).
  - `female_long`: Mái tóc dài mềm mại qua vai của phái nữ.
  - `female_ponytail`: Tóc buộc đuôi ngựa cao năng động kèm chun buộc tóc màu.
  - `curly`: Mái tóc xoăn gợn sóng nghệ thuật.
  - `cap`: Đội mũ lưỡi trai hoặc mũ len cá tính.
* **Hệ thống Trang phục (`outfit`)**:
  - `coat_scarf`: Áo khoác dạ xám 2 hàng cúc trắng kèm khăn quàng (mặc định kinh điển).
  - `hoodie`: Áo nỉ hoodie có túi kangaroo trước bụng và dây rút thể thao.
  - `sweater`: Áo len dệt kim bo cổ ấm áp phong cách thu đông.
  - `shirt_tie`: Áo sơ mi cổ đức kèm cà vạt công sở.
  - `tshirt`: Áo thun cộc tay năng động.
* **Phụ kiện & Đạo cụ**:
  - `glasses`: Kính mắt gọng tròn trí thức.
  - `accessory: "coffee"` / `pose: "hold_coffee"`: Cốc cà phê cầm tay tỏa hơi ấm.
  - `accessory: "phone"` / `pose: "hold_phone"`: Điện thoại cầm tay phát sáng màn hình.
* **Biểu cảm (`mood`)**:
  - `tired` (mí sụp, thâm quầng), `closed` (nhắm mắt tĩnh lặng), `smile` (mỉm cười), `tear` (giọt nước mắt lăn trên má), `surprised` (tròn mắt ngạc nhiên), `determined` (mày cau kiên nghị), `backview` (nhìn từ sau gáy).

---

## 2. Thư viện 16+ bối cảnh 2D phong phú theo chủ đề (Contextual Environments)

Mỗi chủ đề sẽ ánh xạ vào các bối cảnh khác nhau, không bao giờ dùng đi dùng lại một khuôn mẫu:

1. **Quán cà phê ngày mưa (`kind: 'rain_cafe'`)**:
   - Vệt nước mưa chảy trên kính cửa sổ lớn, đèn thả trần vàng ấm tỏa ánh sáng dịu, tách cà phê gốm bốc khói, ánh đèn neon mờ ảo ngoài phố.
   - *Phù hợp*: Chiêm nghiệm, khoảng lặng tâm hồn, nỗi buồn sâu lắng, chữa lành.

2. **Công viên mùa thu (`kind: 'park_autumn'`)**:
   - Bầu trời thu hoàng hôn sắc hồng cam, cây phong lá đỏ vàng sum suê, lá rơi xào xạc theo gió, ghế gỗ công viên, đèn đường cổ điển.
   - *Phù hợp*: Sống chậm lại, thời gian trôi, hoài niệm về người xưa, sự bình yên.

3. **Ngã ba đường / Ngã rẽ (`kind: 'crossroads'`)**:
   - Con đường tách làm 2 ngả hướng về dãy núi xa, biển chỉ dẫn gỗ hai chiều, hạt bồ công anh bay trong gió.
   - *Phù hợp*: Lựa chọn cuộc đời, dấn thân, ngã rẽ sự nghiệp, can đảm thử thách.

4. **Phòng ngủ đêm cô đơn (`kind: 'bedroom_night'`)**:
   - Phòng ngủ ánh sáng xanh tối, trăng khuyết & sao trời ngoài cửa sổ, giường êm, đồng hồ điện tử hiển thị `02:15`.
   - *Phù hợp*: Thao thức đêm khuya, buông bỏ, đối diện khoảng trống nội tâm.

5. **Sân thượng & Ngắm sao (`kind: 'rooftop_stars'`)**:
   - Bầu trời đêm sâu thẳm rực rỡ ngàn sao, trăng sáng, vệt sao băng lướt qua chân trời, ánh đèn thành phố phía xa.
   - *Phù hợp*: Ước mơ, hy vọng, khát vọng vươn xa, niềm tin tương lai.

6. **Đồi cỏ & Cây đại thụ (`kind: 'nature_hill'`)**:
   - Đồi cỏ xanh trải dài, một cây cổ thụ sum suê đứng giữa trời xanh, mây trắng lơ lửng, hoa cỏ li ti, chim bay chữ V.
   - *Phù hợp*: Tự do, thiên nhiên, trưởng thành bền bỉ ("cây lớn theo năm tháng").

7. **Biển chiều hoàng hôn (`kind: 'beach_sunset'`)**:
   - Bầu trời tím cam rực rỡ, mặt trời lặn trên mặt nước phản chiếu ánh vàng, sóng vỗ bờ cát trắng, cánh buồm xa xăm.
   - *Phù hợp*: "Dòng sông chạm đến đại dương", buông bỏ muộn phiền, bao dung.

8. **Bàn làm việc tăng ca (`kind: 'office_desk'`)**:
   - Căn phòng cao ốc đêm, laptop sáng màn hình đang chạy mã/biểu đồ, chồng hồ sơ giấy tờ, ly cà phê mang đi, view thành phố.
   - *Phù hợp*: Áp lực công việc, guồng quay mưu sinh, nỗ lực tuổi trẻ.

9. **Gian bếp gia đình (`kind: 'cozy_kitchen'`)**:
   - Ánh đèn vàng rọi xuống bàn ăn gỗ, bát canh/nồi cơm bốc khói nghi ngút, kệ bếp ấm cúng của mẹ.
   - *Phù hợp*: Gia đình, biết ơn cha mẹ, bữa cơm sum họp, chốn về bình yên.

10. **Vòng xoay thời gian (`kind: 'clock_time'`)**:
    - Mặt đồng hồ La Mã cổ đại trong suốt quay kim, đồng hồ cát phát sáng, những trang lịch bay theo chiều gió.
    - *Phù hợp*: Thời gian vô giá, tuổi trẻ trôi mau, nghịch lý đời người.

11. **Dãy phố 2D Pastel (`kind: 'city_street'`)**:
    - Dãy nhà phố pastel, cột đèn vàng ấm, cây lá đỏ, xe đạp, người đi đường.
    - *Phù hợp*: Cuộc sống đời thường, bước đi giữa dòng đời.

12. **Toa tàu điện ngầm / Xe bus đêm (`kind: 'subway_window'` / `'bus_window'`)**:
    - Cửa sổ nhìn skyline thành phố lướt nhanh, vệt sáng đỏ, tay vịn xe, ghế ngồi xanh.
    - *Phù hợp*: Chuyến đi đêm, hồi tưởng ký ức.

13. **Cầu vượt ban công đêm (`kind: 'overpass_night'`)**:
    - Lan can kim loại nhìn dòng xe chạy phát sáng trắng đỏ liên tục, nhà cao tầng phía xa.
    - *Phù hợp*: Lạc lõng giữa thành phố lớn, áp lực tương lai.

14. **Phòng đọc sách tĩnh lặng (`kind: 'desk_room'`)**:
    - Đèn cây tỏa vầng sáng vàng ấm, bàn học, laptop, cánh cửa hé mở.
    - *Phù hợp*: Tĩnh tâm đọc sách, suy ngẫm một mình, tìm lại phương hướng.

15. **Lễ hội / Tiệc đêm ngoài trời (`kind: 'party_night'`)**:
    - Dây đèn tròn treo lung linh, bóng người dập dìu, tranh triển lãm.
    - *Phù hợp*: "Một mình giữa đám đông", lạc lõng trong những cuộc vui ồn ào.

16. **Cửa sổ Hoàng hôn / Bình minh (`kind: 'window_sunrise'`)**:
    - Khung cửa sổ 4 ô nhìn ra đồi núi và mặt trời bình minh rạng rỡ tỏa nan quạt ánh sáng.
    - *Phù hợp*: Kết thúc có hậu, niềm tin ngày mai, bắt đầu lại.

---

## 3. Watermark & Phụ đề chuẩn mực

* **Watermark**: Chỉ hiển thị nếu người dùng yêu cầu; mặc định để `""` (trống hoàn toàn) để khung hình sạch sẽ.
* **Phụ đề Karaoke**: Chữ in hoa đặt ở đáy màn hình, từ đang đọc được bôi vàng `#ffd600` chính xác theo nhịp phát âm của giọng đọc AI.
