# Sản xuất hình ảnh theo hướng phim hoạt hình

Áp dụng khi tạo video mới hoặc nâng cấp video theo yêu cầu hoạt hình 2D/3D. Giữ yêu cầu câu–cảnh, nền sáng và sub IN HOA phía dưới của SKILL.md. Không áp phong cách cũ chỉ vì preset có sẵn. Các mô tả dưới đây là yêu cầu đạo diễn và sản xuất, không phải field JSON được engine tự hiểu.

## Chọn một hướng hình ảnh cho toàn video

Nếu người dùng chọn 2D hoặc 3D, giữ lựa chọn đó. Nếu chỉ nói “2D, 3D”, chọn một hướng hợp nội dung và công cụ khả dụng, nêu lựa chọn ngắn gọn rồi làm; không cần ghép cả hai. Dùng 2D cho diễn xuất cách điệu, hình vẽ có nét và màu giàu cảm xúc; dùng 3D khi diễn biến cần không gian, thay góc máy hoặc tương tác vật thể có chiều sâu. Không chọn chỉ vì hướng đó render nhanh hơn.

Trước storyboard, ghi art direction ngắn trong ghi chú sản xuất:

- Hình dáng nhân vật, tỷ lệ đầu/thân, silhouette, trang phục, bảng biểu cảm, màu nhận diện.
- Chất hình: nét vẽ và mảng sáng tối của 2D; hình khối, vật liệu và mức độ cách điệu của 3D.
- Bảng màu có màu chủ đạo, màu nhấn và màu nền; ánh sáng theo thời gian/địa điểm.
- Quy tắc cỡ cảnh, cách chuyển động camera và nhịp diễn xuất.
- Asset thực sự có, asset cần tạo và phần engine cần hỗ trợ. Giữ cùng thiết kế khi đổi shot.

Không dùng một bộ nhân vật tóc nâu/quàng khăn đỏ cho mọi chủ đề theo mặc định. Có thể tái dùng nhân vật khi video thuộc cùng series, nhưng phải dựng hành động và bối cảnh mới phù hợp câu.

## Hoạt hình 2D

- Nhân vật có đường nét sạch, silhouette rõ, khuôn mặt đọc được ở kích thước điện thoại. Chuẩn bị các góc/pose cần dùng, không kéo giãn một hình đứng thẳng cho mọi động tác.
- Khuôn mặt cần mắt, chân mày, hướng nhìn và miệng thay đổi theo cảm xúc. Nụ cười mặc định không được đi cùng câu vô cảm, hối tiếc hoặc sợ hãi. Giữ nét và tỷ lệ nhất quán giữa các pose.
- Bối cảnh có tiền cảnh, lớp hoạt động và hậu cảnh khi phù hợp; dùng hình khối, màu, bóng và chồng lớp tạo chiều sâu. Đồ vật đời thường phải đọc được chức năng, không chỉ là khung chữ nhật có nhãn.
- Dùng pose chính rõ, chuyển động theo cung, nhịp chậm/nhanh có chủ ý. Parallax chỉ bổ trợ; một tranh tĩnh zoom qua lại không thay thế nhân vật diễn xuất.
- Có thể dùng vector, cutout có khớp, sprite nhiều pose hoặc vẽ từng frame tùy công cụ thực có. Nếu dùng asset bitmap, bảo đảm đủ độ phân giải, viền alpha sạch và các lớp tách đúng; không gọi ảnh nguyên tấm là rig.
- Thẻ chữ, biểu tượng và infographic chỉ dùng ở câu giải thích cần chúng; không biến mọi cảnh kể chuyện thành slide.

## Hoạt hình 3D

- Model cách điệu phải có hình khối hoàn thiện: tay/chân có cấu trúc, mắt và miệng không bị chìm, tóc/quần áo có volume. Primitive có thể dùng để xây model nhưng không để kết quả giống mannequin ghép vài khối hộp.
- Cảnh có sàn, tường, cửa, nội thất hoặc cảnh quan hợp ngữ cảnh, với vật liệu có phân biệt. Nhà cửa wireframe, đạo cụ lơ lửng và sân khấu trống chỉ là blocking nếu không có chủ ý nghệ thuật rõ ràng.
- Chân tiếp xúc mặt đất, bàn tay tiếp xúc vật cầm, đồ vật không xuyên nhau; bóng tiếp xúc giúp chủ thể đứng vững trong không gian. Điều chỉnh pivot/khớp trước khi animate để tránh tay chân xoay sai chỗ.
- Ánh sáng chính mềm, ánh sáng bù vừa đủ, có thể thêm viền nhẹ tách chủ thể. Nền sáng không đồng nghĩa với làm trắng mọi bề mặt: giữ tương phản sáng tối, màu da và chi tiết vùng sáng. Tránh spotlight sân khấu cho cảnh đời thường, bloom quá mức và emissive phủ mọi vật.
- Dùng roughness/material khác nhau cho da, vải, gỗ, kim loại; giữ cùng ngôn ngữ cách điệu. Bóng mềm, anti-aliasing và độ phân giải phù hợp giúp giảm cảm giác mô hình thử nghiệm. Không tự bật hiệu ứng mà runtime chưa hỗ trợ.
- Rig/clip hoặc hệ khớp procedural cần thực hiện được động tác đang kể. Walk cycle phải phù hợp quãng đường để chân không trượt. Chuyển động cơ thể cần chuyển trọng tâm và follow-through; bob lên xuống không phải đi bộ hay diễn xuất.

## Diễn xuất trước hiệu ứng

Mỗi shot có một hành động chính và diễn tiến **chuẩn bị → hành động → phản ứng/kết quả**. Hướng mắt dẫn chú ý trước khi đầu/thân chuyển động; tay với tới rồi mới chạm/cầm; thân đổi trọng tâm khi đứng dậy; có nhịp giữ pose để người xem hiểu cảm xúc. Chỉ cường điệu đủ để đọc được ý, không áp squash/stretch mạnh cho mọi vật liệu.

Lời thuyết minh ngoài cảnh không yêu cầu mọi nhân vật mấp máy miệng. Chỉ lip-sync người đang trực tiếp nói khi có dữ liệu/điều khiển tương ứng; không giả lip-sync bằng đóng mở miệng ngẫu nhiên. Chớp mắt, thở và chuyển động phụ phải nhẹ, không che mất hành động chính.

Ví dụ “chỉ tiếc cơ hội không nắm lấy”: nhân vật ngập ngừng trước một lời mời cụ thể, đưa tay rồi rút lại; cơ hội đi qua, nhân vật nhìn theo và hạ vai. Không thay bằng nhân vật vui vẻ đứng giữa sân khấu có pháo giấy. Chọn một tình huống dễ hiểu phù hợp phần trước/sau, không tự thêm nội dung làm sai lời kể.

Ví dụ “bắt đầu dù vẫn còn sợ”: cận tay do dự trên tay nắm cửa → trung cảnh hít thở, chỉnh tư thế → toàn cảnh bước qua ngưỡng cửa. Thời điểm bước qua phải theo cue trong lời. Không dùng cùng chuyển động vẫy tay cho cả sợ hãi, quyết tâm và thành công.

## Góc máy và dựng

Dùng toàn cảnh để thiết lập địa điểm, trung cảnh cho hành động/tương tác, cận cảnh cho quyết định và biểu cảm. Không đổi cỡ cảnh máy móc; mỗi lần cắt phải đưa thông tin hoặc cảm xúc mới. Giữ hướng nhìn, hướng chuyển động và trục hành động khi chuyển góc.

Camera ổn định, chuyển động có điểm bắt đầu/kết thúc và mục đích rõ. Tránh orbit liên tục, zoom vô cớ, méo góc rộng sát mặt và chuyển cảnh lòe loẹt. Chuyển cảnh theo nhịp lời hoặc hành động; giữ đủ thời gian để kết quả được nhìn thấy. Kiểm tra khung dọc/ngang riêng; không để mặt, tay hoặc đạo cụ quan trọng vào vùng sub 80–97% chiều cao.

## Từ thiết kế đến render thật

1. Đọc code/schema, kiểm tra asset và công cụ đang có. Không coi yêu cầu hoạt hình là bằng chứng đã có Blender, rig loader, mô hình sinh video hay API trả phí.
2. Chọn shot tiêu biểu 3–6 giây có nhân vật, bối cảnh và hành động khó nhất cần thể hiện. Làm blocking để kiểm tra nghĩa và bố cục, rồi hoàn thiện thiết kế/ánh sáng/diễn xuất của chính shot đó.
3. Nếu runtime hiện tại chỉ tạo được hình đơn giản, xác định phần thiếu cụ thể. Khi phạm vi cho phép, bổ sung asset và bộ điều khiển cần thiết rồi kiểm thử. Với asset sinh từ công cụ ngoài, phải có bước nhập và animate được kiểm chứng; prompt đẹp chưa tạo ra video. Không thêm field vào project mà không có consumer trong code.
4. Kiểm tra shot thử ở cả khung tĩnh và chuyển động. Tự sửa đến khi không còn lỗi lớn dưới đây, rồi áp thiết kế nhất quán cho các shot còn lại. Không tự đặt vòng xin duyệt bắt buộc.
5. Căn audio và sub trên timeline thực; xuất MP4 cuối. Trích khung từ MP4 theo từng beat, xem chuyển động ở các tương tác quan trọng và kiểm tra audio nếu có công cụ. Ghi phần chưa kiểm chứng.

Đầu ra 1080×1920 hoặc 1920×1080 khi phù hợp yêu cầu, 24 hoặc 30 fps có chủ ý. Không upscale bản nháp thấp rồi gọi là hoàn thiện. Giảm độ phân giải cho preview được, nhưng shot design và animation vẫn phải được đánh giá trước render dài.

## Điều kiện phải sửa trước khi giao bản hoàn thiện

| Hạng mục | Chưa đạt khi | Cần sửa |
|---|---|---|
| Nghĩa của câu | Cảnh chỉ cùng chủ đề; biểu cảm hoặc kết quả trái lời | Viết lại hành động/shot đúng ngữ cảnh |
| Nhân vật | Mặt vô hồn, cười mặc định, tỷ lệ thay đổi giữa shot | Hoàn thiện thiết kế, pose và biểu cảm |
| Bối cảnh | Nền trống/khung dây dù lời kể cần địa điểm cụ thể | Dựng môi trường, đạo cụ và chiều sâu |
| Chuyển động | Chỉ bob/orbit, chân trượt, tay xuyên vật | Sửa key pose, khớp, tiếp xúc và timing |
| Ánh sáng | Nền tối trái yêu cầu, trắng cháy, bóng đen bệt | Cân lại ánh sáng/material, giữ tương phản |
| Tính liên tục | Đổi quần áo, màu, kích thước hoặc hướng vô cớ | Đồng bộ asset và trạng thái giữa shot |
| Phụ đề | Nằm trên mặt, không viết hoa, vàng sai từ | Dùng subtitle contract và timing đã kiểm tra |

Các mục này là kiểm tra bằng hình/video, không phải điểm số AI tự chấm để thay bằng chứng. Một lỗi nặng ở shot chính cần sửa, không lấy các shot đẹp khác bù. Nếu thiếu công cụ/asset và không thể hoàn thiện, báo rõ đó là bản nháp cùng giới hạn; không gọi nó “đẹp như phim hoạt hình” chỉ vì đã xuất MP4.
