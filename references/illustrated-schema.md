# Schema illustrated-story (Hoạt hình 2D Vector)

Chế độ `layoutMode: "illustrated-story"` cho phép AI đạo diễn tạo ra các video hoạt hình 2D hoàn chỉnh, chuẩn 100% phong cách video mẫu kênh **@phatbieulungtung**, kết hợp các công nghệ từ 5 mã nguồn mở (Pexo Skills, OpenEdit, Hypit, FFmpeg Skill, VideoDB Skills) với khả năng sáng tạo không giới hạn để **mỗi video mỗi chủ đề đều có hình ảnh và diễn biến hoàn toàn khác nhau**.

---

## 1. Cấu trúc Project Cấp Cao

```json
{
  "title": "TIÊU ĐỀ VIDEO",
  "layoutMode": "illustrated-story",
  "style": "phatbieulungtung",
  "watermark": "",
  "voice": "giong_mau",
  "rate": "+0%",
  "width": 1280,
  "height": 720,
  "fps": 30,
  "fadeInDuration": 0.45,
  "fadeOutDuration": 0.8,
  "pauseBetweenSegments": 0.12,
  "outroDuration": 2.5,
  "segments": [...]
}
```

* `style`: Đặt `"phatbieulungtung"` để tự động kích hoạt nét vẽ nhân vật 2D chibi viền đen đậm sạch sẽ.
* `watermark`: Để `""` (chuỗi rỗng) để không hiển thị watermark; hoặc điền chuỗi text nếu cần.
* `width` & `height`: 1280x720 (16:9 ngang) hoặc 1080x1920 (9:16 dọc TikTok/Shorts).
* `voice`: `"giong_mau"` (ZeroTTS offline clone) hoặc voice có sẵn.

---

## 2. Bảng Tra Cứu Nhân Vật (`person`)

| Thuộc tính | Kiểu dữ liệu | Giá trị hỗ trợ | Mô tả |
| :--- | :--- | :--- | :--- |
| `hair` | `string` | `"spiky"`, `"smooth"`, `"female_long"`, `"female_ponytail"`, `"curly"`, `"cap"` | Kiểu tóc nhân vật (nam gai nhọn, tóc mượt, nữ tóc dài, nữ đuôi ngựa, tóc xoăn, mũ lưỡi trai). |
| `hairColor` | `string` | Hex color (vd: `"#2d221e"`, `"#34495e"`) | Màu tóc nhân vật. |
| `gender` | `string` | `"male"`, `"female"` | Giới tính (female thêm lông mi mềm và ửng hồng má). |
| `outfit` | `string` | `"coat_scarf"`, `"hoodie"`, `"sweater"`, `"shirt_tie"`, `"tshirt"` | Kiểu trang phục (áo dạ, hoodie có túi & dây rút, áo len dệt kim, sơ mi cà vạt công sở, áo thun hè). |
| `clothesColor` | `string` | Hex color (vd: `"#57606f"`, `"#20bf6b"`, `"#4b7bec"`) | Màu áo chính. |
| `scarf` | `boolean` \| `string` | `false`, `"#eb3b5a"`, `"#fed330"`, `"#20bf6b"`, `"#4b7bec"` | Khăn quàng cổ: có thể tắt hẳn (`false`) hoặc đổi màu tùy ý. |
| `accessory` | `string` | `"glasses"`, `"headphones"` | Phụ kiện đeo (kính gọng tròn, tai nghe chụp tai). |
| `pose` | `string` | `"stand"`, `"walk"`, `"sit_bench"`, `"sit_bus"`, `"sit_desk"`, `"sit_bed"`, `"lean_rail"`, `"hold_coffee"`, `"hold_phone"`, `"wave"`, `"backview"`, `"ghost"` | Tư thế nhân vật (đứng, bước đi vung chân tay, ngồi ghế, ngồi giường, tựa lan can, cầm cốc cà phê bốc khói, cầm điện thoại, vẫy tay, nhìn từ sau đầu, bóng ma ký ức). |
| `mood` | `string` | `"tired"`, `"closed"`, `"smile"`, `"happy"`, `"sad"`, `"tear"`, `"surprised"`, `"determined"`, `"backview"` | Biểu cảm khuôn mặt (mệt mỏi mí sụp, nhắm mắt tĩnh lặng, mỉm cười rạng rỡ, buồn bã, rơi lệ trên má, kinh ngạc, kiên định, nhìn từ phía sau). |

---

## 3. Kho Bối Cảnh Toàn Khung (16+ Môi Trường Hoạt Họa 2D)

| kind | Tên bối cảnh | Chi tiết hình ảnh & Diễn hoạt | Phù hợp chủ đề |
| :--- | :--- | :--- | :--- |
| `rain_cafe` | Quán cà phê ngày mưa | Vệt mưa chảy trên kính cửa sổ, đèn thả trần ấm áp, cốc cà phê gốm bốc khói nghi ngút, phản chiếu neon mờ ảo. | Chữa lành, chiêm nghiệm, tâm trạng ngày mưa, hoài niệm. |
| `park_autumn` | Công viên mùa thu | Bầu trời hoàng hôn sắc thu, cây phong lá đỏ vàng, lá rơi lả tả theo gió, ghế gỗ công viên, đèn đường vintage. | Sống chậm lại, thời gian trôi, nhớ về người xưa, bình yên. |
| `crossroads` | Ngã ba đường / Ngã rẽ | Con đường tách làm 2 ngả hướng về dãy núi xa, biển chỉ dẫn gỗ hai chiều, hạt bồ công anh bay trong gió. | Lựa chọn cuộc đời, dấn thân, ngã rẽ sự nghiệp, can đảm thử. |
| `bedroom_night` | Phòng ngủ đêm cô đơn | Phòng ngủ ánh sáng xanh tối, trăng khuyết & sao trời ngoài cửa sổ, giường êm, đồng hồ điện tử hiển thị `02:15`. | Thao thức đêm khuya, buông bỏ, đối diện khoảng trống nội tâm. |
| `rooftop_stars` | Sân thượng & Ngắm sao | Bầu trời đêm sâu thẳm rực rỡ ngàn sao, trăng sáng, vệt sao băng lướt qua chân trời, ánh đèn thành phố phía xa. | Ước mơ, hy vọng, khát vọng vươn xa, niềm tin tương lai. |
| `nature_hill` | Đồi cỏ & Cây đại thụ | Đồi cỏ xanh trải dài, một cây cổ thụ sum suê đứng giữa trời xanh, mây trắng lơ lửng, hoa cỏ li ti, chim bay chữ V. | Tự do, thiên nhiên, trưởng thành bền bỉ ("cây lớn theo năm tháng"). |
| `beach_sunset` | Biển chiều hoàng hôn | Bầu trời tím cam rực rỡ, mặt trời lặn trên mặt nước phản chiếu ánh vàng, sóng vỗ bờ cát trắng, cánh buồm xa xăm. | "Dòng sông chạm đến đại dương", buông bỏ muộn phiền, bao dung. |
| `office_desk` | Bàn làm việc tăng ca | Căn phòng cao ốc đêm, laptop sáng màn hình đang chạy mã/biểu đồ, chồng hồ sơ giấy tờ, ly cà phê mang đi, view thành phố. | Áp lực công việc, guồng quay mưu sinh, nỗ lực tuổi trẻ. |
| `cozy_kitchen` | Gian bếp gia đình | Ánh đèn vàng rọi xuống bàn ăn gỗ, bát canh/nồi cơm bốc khói nghi ngút, kệ bếp ấm cúng của mẹ. | Gia đình, biết ơn cha mẹ, bữa cơm sum họp, chốn về bình yên. |
| `clock_time` | Vòng xoay thời gian | Mặt đồng hồ La Mã cổ đại trong suốt quay kim, đồng hồ cát phát sáng, những trang lịch bay theo chiều gió. | Thời gian vô giá, tuổi trẻ trôi mau, nghịch lý đời người. |
| `city_street` | Phố xá đô thị | Dãy nhà phố pastel, cột đèn vàng, cây khô lá đỏ, xe đạp, người đi đường. | Nhịp sống thường nhật, bước đi giữa dòng đời. |
| `subway_window` | Toa tàu điện ngầm | Cửa sổ nhìn skyline thành phố lướt nhanh, vệt sáng đỏ, tay vịn xe, ghế ngồi xanh. | Đi làm, suy tư trên đường về, hoài niệm về người từng đi cùng. |
| `overpass_night` | Cầu vượt đại lộ đêm | Lan can kim loại nhìn dòng xe chạy phát sáng trắng đỏ liên tục, nhà cao tầng phía xa. | Lạc lõng giữa thành phố lớn, dòng đời hối hả. |
| `desk_room` | Phòng đọc sách tĩnh lặng | Đèn cây tỏa vầng sáng vàng ấm, bàn học, laptop, cánh cửa hé mở. | Tĩnh tâm đọc sách, suy ngẫm một mình, tìm lại phương hướng. |
| `party_night` | Lễ hội / Dây đèn tròn | Dây đèn treo lung linh, cây đèn sao, tranh triển lãm, bong bóng suy nghĩ. | "Một mình giữa đám đông", lạc lõng trong những cuộc vui ồn ào. |
| `window_sunrise` | Cửa sổ đón bình minh | Khung cửa sổ 4 ô nhìn ra đồi núi và mặt trời bình minh rạng rỡ tỏa nan quạt ánh sáng. | Kết thúc có hậu, niềm tin ngày mai, bắt đầu lại. |

---

## 4. Quy Tắc Sáng Tạo: Chống Lặp Lại Hình Ảnh

Để bảo đảm **mỗi video tạo ra đều có hình ảnh MỚI LẠ**:
1. Không lặp lại cùng một nhân vật chính giữa các video kế tiếp. Luân phiên giữa nam thanh niên, cô gái tóc dài/đuôi ngựa, nhân viên văn phòng, học sinh.
2. Không sao chép cùng một chuỗi bối cảnh. Mỗi kịch bản phải sở hữu một kịch bản phân cảnh (storyboard) riêng biệt với ít nhất 4–6 bối cảnh độc đáo.
3. Luôn tận dụng các tư thế hành động (`walk`, `hold_coffee`, `sit_bench`) và chi tiết sống động (khói bốc, mưa rơi, lá bay, sao băng).
