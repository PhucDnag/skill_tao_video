---
name: video-3d-agent
description: Đạo diễn và tạo video 3D dọc theo sát lời thoại/phụ đề, với hình ảnh đẹp, phong phú, có ý nghĩa và chuyển động đồng bộ; phù hợp nội dung tài chính, kiến thức, gia đình, tình cảm, phát triển bản thân và các chủ đề khác.
---

# Skill đạo diễn video 3D theo lời thoại

## Mục tiêu

Biến kịch bản và lời đọc thành video dọc 9:16 có hình ảnh 3D đẹp, dễ hiểu ngay cả khi tắt tiếng. Mỗi shot phải minh họa đúng ý đang được nói, đồng bộ với phụ đề và có một thay đổi/hành động nhìn thấy được. Đa dạng hóa nhân vật, đồ vật, bối cảnh, bố cục, màu sắc, chất liệu, ánh sáng và chuyển động; không để video nào cũng là pha lê vàng, neon, biểu đồ, đồng hồ hay camera orbit.

Giữ tương thích với renderer, scene và CLI thực tế của dự án. Không mô tả hay hứa rằng một asset, chuyển động, aligner, AI provider hoặc lệnh đã tồn tại nếu chưa kiểm tra thấy trong code. Khi engine chưa hỗ trợ cảnh mới, diễn đạt cảnh bằng tổ hợp hình khối/asset có sẵn phù hợp nhất và ghi rõ giới hạn; chỉ mở rộng renderer khi người dùng yêu cầu sửa phần mềm.

## Quy trình đạo diễn

1. Đọc script hoàn chỉnh và kiểm tra pipeline tạo cảnh, TTS, timing phụ đề, renderer và các scene/camera thực sự được hỗ trợ. Giữ nguyên nội dung, giọng điệu và ý nghĩa câu nói.
2. Chia lời thành các **nhịp ý nghĩa** (*beats*), không mặc định một câu là một cảnh. Ghi cho mỗi beat: câu thoại/phụ đề nguyên văn, ý chính, chủ thể, hành động, đối tượng, cảm xúc, nguyên nhân–kết quả, điều bắt buộc phải thấy và điều tuyệt đối không được minh họa sai.
3. Chọn minh họa trực tiếp trước: nếu lời nhắc đến người, vật, hành động hoặc nơi chốn cụ thể, hãy cho người xem thấy điều đó. Với khái niệm trừu tượng, dùng ẩn dụ thị giác đơn giản, dễ đọc và chỉ dùng khi nó làm ý rõ hơn. Bám các từ phủ định, so sánh, chuyển ý và kết quả; không chỉ bắt từ khóa chủ đề.
4. Lập storyboard theo nhịp lời: xác định shot, hành động chính, khung hình/góc máy, thiết kế ánh sáng–màu–chất liệu, chuyển cảnh và liên tục nhân vật/đạo cụ giữa các beat liên quan. Mỗi shot tập trung vào một ý hoặc hành động chính.
5. Thiết kế đường dây cảm xúc của toàn video: mở bằng câu hỏi, hình ảnh lạ hoặc một hành động đang dang dở phù hợp nội dung; tăng dần quy mô/nhịp ở phần phát triển; dành reveal hoặc khoảnh khắc mạnh nhất cho ý then chốt; kết bằng hình ảnh/cảm xúc đọng lại hoặc lời kêu gọi nếu script có. Không tự thêm lời thoại, dữ kiện hay cú twist làm sai thông điệp.
6. Đạo diễn cách đọc theo sắc thái từng beat và toàn kịch bản; không để giọng đều đều từ đầu đến cuối. Ghi rõ cảm xúc, cường độ, tốc độ, điểm nhấn và chỗ ngắt cho mỗi beat trước khi tạo TTS hoặc thu âm.
7. Căn timing với audio/subtitle thực tế. Dùng word timing/alignment nếu pipeline cung cấp; nếu không, dùng timing segment hiện có và đánh dấu độ chính xác giới hạn. Không tự nhận đã đồng bộ từng từ khi chưa có timestamps từng từ.
8. Nghe lại audio cùng preview hình; sửa những chỗ lời đọc thiếu tự nhiên, nhấn sai ý, đều giọng hoặc không ăn với biểu cảm/chuyển động. Render file cuối bằng đúng quy trình của dự án.

## Quy tắc bám lời phụ đề và nhịp hình

- Mỗi beat có một `visualClaim`: một câu mô tả điều người xem sẽ thấy xảy ra, khớp chính xác lời thoại. Đối chiếu storyboard với từng câu phụ đề trước khi render.
- Đưa chủ thể vào khung ngay khi ý được nêu; bắt đầu hành động gần cụm động từ; thể hiện kết quả đúng lúc lời nói nêu kết quả. Có thể cho hình chuẩn bị trước lời một nhịp ngắn để người xem nhận biết, nhưng không tiết lộ kết quả quá sớm.
- Chuyển cảnh ở ranh giới ý, nhịp nghỉ hoặc đổi chủ thể; tránh cắt giữa một cụm ý. Một hình liên tục có thể kéo qua vài câu nếu vẫn minh họa đúng; một câu dài có thể chia thành vài shot nếu ngữ nghĩa đổi.
- Phụ đề karaoke và lời đọc phải dùng chung nguồn timing. Không chia đều thời lượng câu để giả làm word alignment. Giữ phụ đề đọc được, đúng chính tả, có tương phản và không đè lên hành động quan trọng.
- Với phủ định/đối lập, cho thấy rõ hai trạng thái hoặc hành động cần tránh; không dùng hình ảnh khẳng định ngược câu nói. Với lời khuyên, minh họa hành động cụ thể thay vì chỉ hiện một biểu tượng chung chung.
- Shot không được chỉ orbit/zoom: phải có hành động, biến đổi, tương tác, hoặc reveal giúp truyền đạt nội dung. Camera hỗ trợ kể chuyện, không thay thế hành động.
- Mở đầu cần tạo tò mò bằng nội dung của chính kịch bản: bắt đầu ngay ở chi tiết, câu hỏi, hệ quả hoặc lựa chọn gây chú ý; tránh intro logo dài, fly-through chung chung và cảnh đẹp nhưng chưa liên quan.
- Điều tiết nhịp dựng theo giọng đọc và mức độ quan trọng: shot ngắn hơn cho liệt kê/đối lập nhanh, shot dài hơn cho cảm xúc, thao tác cần quan sát hoặc ý cần suy ngẫm. Dùng thay đổi cỡ cảnh, hướng chuyển động, âm khoảng lặng của voice (nếu có) hoặc reveal để tạo nhịp; không cắt nhanh liên tục chỉ để tạo cảm giác sôi động.
- Dùng chuyển cảnh có động cơ thị giác: match cut theo hình dạng/chuyển động, che ống kính bằng vật thể trong cảnh, chuyển nét/ánh sáng, hoặc cắt thẳng tại nhịp lời. Hạn chế hiệu ứng chuyển cảnh trang trí lặp lại.

## Đạo diễn giọng đọc có cảm xúc

- Đọc hiểu ý và quan hệ giữa các câu trước khi chọn sắc thái. Với từng beat, ghi `emotion`, `intensity` (nhẹ/vừa/mạnh), `pace` (chậm/vừa/nhanh), `emphasis` (từ/cụm ý cần nhấn), và `pauseAfter`/`pauseBefore` nếu cần. Các nhãn này là chỉ dẫn đạo diễn; chỉ truyền vào TTS khi API/schema thực sự hỗ trợ.
- Tạo đường cong cảm xúc tự nhiên: mở đầu rõ và gợi tò mò; phần giải thích bình tĩnh, dễ nghe; ý quan trọng nhấn chắc; đoạn xúc động ấm và chân thành; đoạn cảnh báo nghiêm nhưng không quát; kết luận có điểm rơi. Điều chỉnh theo kịch bản, không áp một mẫu đọc cho mọi video.
- Dùng ngắt nghỉ có chủ đích ở ranh giới ý, trước reveal, sau câu hỏi tu từ hoặc sau câu cần người xem suy ngẫm. Không chèn pause dài sau mọi câu và không thay dấu câu để đổi nghĩa hay sửa nội dung.
- Nhấn bằng ngữ điệu và nhịp, không chỉ tăng âm lượng/tốc độ. Tránh đọc kiểu quảng cáo quá phấn khởi cho nội dung buồn, giật gân cho kiến thức trung tính, hoặc bi lụy quá mức cho lời khuyên nhẹ nhàng. Bảo đảm phát âm rõ, âm lượng ổn định và không làm mất khả năng hiểu.
- Nếu có nhiều lựa chọn voice, chọn chất giọng phù hợp tuổi/cảm xúc/thể loại và giữ nhất quán trong video. Không đổi voice giữa các beat nếu không có chủ ý truyện kể.
- Kiểm tra năng lực TTS thực tế trước khi thiết kế điều khiển biểu cảm. Trong pipeline hiện tại, các trường `voice`, `rate`, `pitch` có thể được cấu hình; không mặc định tồn tại emotion/style tags hoặc điều khiển prosody từng đoạn. Nếu engine chỉ có rate/pitch, dùng script segmentation, dấu câu và khoảng nghỉ mà pipeline hỗ trợ; ghi nhận giới hạn biểu cảm. Không tuyên bố TTS đã diễn cảm như người thật nếu chưa nghe kiểm tra. Khi cần diễn xuất tinh tế mà engine không đáp ứng, đề xuất thu âm người thật hoặc tích hợp engine có expressive controls như một thay đổi riêng.
- Để giọng và hình cùng diễn: câu dịu dùng chuyển động mềm và ít cắt; câu dứt khoát dùng pose rõ/cắt gọn; câu ngạc nhiên có thể reveal đúng lúc; câu trầm lắng giữ shot đủ lâu. Hình hỗ trợ cảm xúc chứ không cường điệu trái nội dung.

## Đa dạng hình ảnh có chủ đích

Chọn phong cách hợp chủ đề và cảm xúc thay vì áp một preset thẩm mỹ cho cả video. Có thể kết hợp phong cách hoạt hình nhân vật, miniature/maquette, clay, low-poly tinh tế, vật liệu thủy tinh/gốm/gỗ/vải/kim loại, diorama đời thường, kiến trúc cách điệu, thiên nhiên hoặc biểu tượng trừu tượng. Ưu tiên hình khối rõ, bề mặt có chiều sâu, ánh sáng tạo khối, màu có phân cấp, nền gọn và chủ thể nổi bật trên màn hình điện thoại.

Mỗi video cần một **art direction** ngắn trước storyboard: chủ đề/cảm xúc, loại hình khối và chất liệu chủ đạo, bảng màu 3–5 màu, kiểu ánh sáng, thiết kế nhân vật (nếu có), độ tương phản và mức độ cách điệu. Ví dụ: câu chuyện gia đình có thể dùng gỗ, vải, ánh sáng cửa sổ ấm; nội dung khoa học có thể dùng mô hình cutaway, nhựa mờ và ánh sáng phòng thí nghiệm; chủ đề căng thẳng có thể bắt đầu với bố cục chật, tương phản mạnh rồi mở dần không gian khi được giải quyết. Đây là định hướng linh hoạt, không phải preset bắt buộc.

Tạo điểm nhấn thị giác bằng phân cấp: một focal point chính, một yếu tố phụ hỗ trợ và nền ít chi tiết hơn. Dùng cận cảnh cho cảm xúc/chi tiết, trung cảnh cho tương tác, toàn cảnh cho quy mô hoặc chuyển biến; phối cảnh và độ sâu trường ảnh chỉ dùng khi giúp chủ thể rõ hơn. Thiết kế silhouette dễ nhận ra, biểu cảm/pose đọc được ở kích thước nhỏ, vật liệu có khác biệt rõ. Tránh chữ giả trong hình 3D, logo/watermark không được yêu cầu, vật thể méo khó nhận ra, highlight cháy sáng, nền quá bận và palette neon đồng loạt.

Trước khi chốt storyboard, xem lại các shot liền kề và chủ động thay đổi ít nhất hai yếu tố khi chúng bị lặp: chủ thể/đạo cụ, địa điểm, cỡ cảnh/bố cục, góc máy/chuyển động, bảng màu, chất liệu hoặc kiểu chuyển cảnh. Không lặp cùng một hero object quá hai beat liên tiếp trừ khi cần continuity; không dùng một kiểu camera ba shot liên tiếp. Sự đa dạng phải xuất phát từ thay đổi ý nghĩa trong lời, không phải đổi màu tùy tiện.

Giữ continuity cho nhân vật, quần áo, đạo cụ, thời gian và hướng di chuyển trong cùng một mạch truyện. Dùng một bảng màu chủ đạo cho mỗi mạch; có thể đổi ánh sáng hoặc màu nhấn để diễn tả biến chuyển cảm xúc. Giới hạn particle/glow và chi tiết nền để không làm rối chủ thể, câu chữ hay vùng phụ đề.

Đa dạng giữa các video bằng cách thay đổi cách kể phù hợp kịch bản, không chỉ đổi màu hoặc thay một đạo cụ: có thể chọn chuyện nhân vật xuyên suốt, chuỗi vignette, hành trình qua không gian, đối chiếu hai lựa chọn, time-lapse biến đổi hoặc khám phá mô hình/cấu trúc bên trong. Chỉ dùng một cấu trúc kể chuyện khi nó làm thông điệp dễ hiểu hơn. Nếu có lịch sử video trước, tránh lặp art direction và chuỗi shot đặc trưng gần đây; nếu không có dữ liệu, không tuyên bố đã đối chiếu lịch sử.

## Chọn scene và tính khả thi

- Kiểm tra scene/camera đã đăng ký trong code và preset trước khi dùng. Thư viện scene cũ là lựa chọn khả thi/fallback, không phải lý do để ép mọi kịch bản vào hình ống tiền, bánh răng hoặc pha lê.
- Nếu project hỗ trợ `sceneSpec`/scene graph, mô tả có cấu trúc environment, actors, objects, actions, camera và transitions; chỉ dùng geometry, rig, materials và animation mà asset resolver/renderer thực sự hỗ trợ.
- Nếu chỉ hỗ trợ `scene` enum, chọn enum phù hợp nhất hiện có. Không phát minh enum/camera rồi tuyên bố renderer sẽ hiểu; nêu cảnh mong muốn như storyboard khi cần để người dùng quyết định mở rộng engine.
- Ưu tiên hành động thực hiện được: bước đi, đặt/cầm, mở/đóng, rơi, trao/nhận, xây, nứt, lớn lên, đổi hướng, gặp rồi rời đi. Hoạt ảnh phức tạp của người cần rig/clip hợp lệ; nếu không có, dùng silhouette, blocking đơn giản hoặc vật thể thay thế.
- Chỉ dùng asset thư viện có nguồn và quyền sử dụng rõ. Không tuyên bố tạo model 3D tùy ý từ text nếu dự án không có provider tương ứng. Ghi rõ asset nào là procedural, library, generated hoặc fallback khi pipeline hỗ trợ metadata này.

## Timeline và cấu trúc dữ liệu

Giữ schema project hiện có và các trường bắt buộc để tương thích. Khi được hỗ trợ, mỗi segment nên chứa:

```json
{
  "id": "beat_01",
  "vi": "Lời thoại nguyên văn",
  "meaning": "Ý nghĩa của nhịp",
  "visualClaim": "Hành động/hình ảnh cụ thể cần thấy",
  "mustShow": ["chủ thể", "hành động", "kết quả nếu có"],
  "mustNotShow": ["diễn biến mâu thuẫn lời thoại"],
  "continuityIds": ["nhân vật hoặc đạo cụ xuyên cảnh"],
  "scene": "scene hợp lệ của dự án",
  "camera": "camera hợp lệ của dự án",
  "actions": [{"verb": "hành động nhìn thấy được", "cue": "cụm từ kích hoạt nếu có timing"}],
  "timing": {"source": "tts_alignment hoặc segment_timing", "startSec": null, "endSec": null}
}
```

Đây là gợi ý storyboard, không được thêm field không tương thích vào project đang render. Thời gian cuối phải được lấy từ audio/TTS pipeline ngay trước render; không để `null` trong timeline render nếu renderer yêu cầu timestamps. Nếu chỉ có timing theo câu, giữ beat theo segment và không bịa mốc từ.

## Kiểm tra chất lượng

Trước khi xuất, rà từng beat theo checklist:

- **Đúng lời:** xem tắt tiếng vẫn đoán được ý chính; hình không trái với phủ định, chủ thể, cảm xúc hay quan hệ nguyên nhân–kết quả.
- **Đúng nhịp:** hành động quan trọng xuất hiện khi cụm từ tương ứng được đọc; subtitle và lời đọc không bị lệch theo khả năng kiểm chứng của pipeline.
- **Đẹp và rõ:** chủ thể nổi bật, phối màu có chủ đích, ánh sáng/material tạo chiều sâu, bố cục đọc được trên màn hình nhỏ, không che phụ đề.
- **Có chuyển động:** shot có hành động/biến đổi/reveal; không lạm dụng orbit hoặc zoom.
- **Đa dạng và liên tục:** cảnh liền kề khác nhau có chủ đích nhưng các nhân vật/đạo cụ liên quan vẫn nhất quán.
- **Thu hút và có nhịp:** 1–3 giây đầu liên quan trực tiếp đến hook; có biến đổi hình ảnh theo tiến trình nội dung; cao trào/reveal phục vụ đúng ý chính; kết thúc không bị cụt giữa hành động.
- **Có art direction:** style, palette, ánh sáng và chất liệu nhất quán trong từng mạch; mỗi shot có phân cấp điểm nhìn; không dùng hiệu ứng chỉ để trang trí.
- **Giọng có diễn biến:** sắc thái, điểm nhấn và khoảng nghỉ phù hợp từng ý; nhịp hình đồng hành với giọng; mọi giới hạn của TTS được nói rõ.
- **Render khả thi:** asset resolve được, không có cảnh trống/đen, vật thể không bị cắt khung; duration và audio/video khớp trong giới hạn công cụ.

Nếu không thể xác minh một tiêu chí bằng công cụ sẵn có, ghi rõ đó là kiểm tra chưa thực hiện thay vì báo đạt. Chỉ xuất storyboard/manifest/QA report nếu pipeline có hỗ trợ hoặc người dùng yêu cầu.

## Ví dụ chọn hình theo lời

- “Mỗi ngày bạn chỉ tiến bộ một chút”: cùng nhân vật luyện tập tại bàn qua các ngày, thao tác dần thành thạo; đổi ánh sáng/thời tiết để thể hiện thời gian. Biểu đồ chỉ dùng nếu câu thực sự nói về số liệu.
- “Bạn không thể giữ một người muốn rời đi”: hai người buông tay ở hành lang, một người bước về phía cửa; không kết thúc bằng đoàn tụ.
- “Tiền biến mất vì những khoản chi nhỏ”: nhân vật chạm điện thoại, vài hóa đơn/giao dịch nhỏ lần lượt trừ khỏi số dư; không mặc định dùng ống rò rỉ.
- “Thời gian bên cha mẹ không còn nhiều”: bữa cơm gia đình, lịch thay trang và nhân vật trở về ngồi cạnh cha mẹ; không biến lời nhắc thành cảnh bi lụy nếu giọng kể nhẹ nhàng.
- “Kỷ luật là làm ngay cả khi không có động lực”: nhân vật tắt báo thức, rời giường và bắt đầu buổi tập dù trời mưa; không chỉ quay bánh răng/đồng hồ.
- “Tự chịu trách nhiệm cho cuộc đời mình”: nhân vật buông bỏ những mũi tên đổ lỗi, tự tay nắm chặt bánh lái vượt sóng, cầm chiếc chìa khóa vàng mở cổng tương lai và từng bước xếp gạch xây cầu vận mệnh.
- “Chiến thắng bản thân là chiến thắng vĩ đại nhất”: nhân vật đối diện cái bóng lười biếng, tắt chuông báo thức rời giường ấm lúc bình minh, chọn trang sách và quả tạ thay vì màn hình lướt vô định, tôi luyện viên kim cương ý chí đón cổng khải hoàn.

## Chế độ Phong cách `neon-story-stage` (Học từ `@phatbieulungtung/video/7706865970740022535`)

Ngoài chế độ `classic-letterbox` truyền thống (9:16 hai dải đen + thẻ RECEIPT + Karaoke vàng song ngữ), engine hiện đã hỗ trợ trực tiếp chế độ **`neon-story-stage`** (Full-Bleed kiến trúc Neon-Wireframe tối giản trên nền `#0D0F18`–`#151827`).

### 1. Cấu hình JSON cho `neon-story-stage`
Đặt ở root project JSON:
```json
{
  "title": "TIÊU ĐỀ",
  "watermark": "PHAT BIEU LUNG TUNG",
  "layoutMode": "neon-story-stage",
  "style": "phatbieulungtung",
  "width": 1280,
  "height": 720,
  "fps": 30,
  "fadeInDuration": 0.45,
  "fadeOutDuration": 1.0,
  "crossfadeDuration": 0.18,
  "outroDuration": 3.0,
  "outroScene": "sunrise_ocean_horizon",
  "outroCamera": "sunrise_backview_horizon",
  "outroHideCaption": true
}
```
*(Có thể đổi `"width": 1080, "height": 1920` nếu muốn xuất dọc 9:16 Full-Bleed; các trường mới hoạt động đồng nhất trên cả 16:9 và 9:16).*

### 2. Quy chuẩn Hình ảnh & Phụ đề Rút gọn (`overlay2d.js`)
- **Top Watermark viền trắng rỗng ruột**: Khi `"watermark"` có chữ, hiển thị cố định căn giữa sát mép trên (`y ≈ 0.04`), chữ in hoa bo tròn ruột tối viền trắng sắc nét (không chạy marquee).
- **Topic Pill Badge**: Truyền `"topicBadge": "NỖI SỢ ĐÁM ĐÔNG"` trên segment để hiện thẻ viên thuốc phát sáng viền neon hồng `#FF5CA8` ở vùng `y ≈ 0.21–0.24`.
- **Condensed Kinetic Captions**: Dùng `"caption"` (3–8 từ rút gọn ý chính) hoặc `"captionBeats": [{"text": "...", "startRatio": 0, "endRatio": 0.5}]` để đổi cụm chữ mỗi 2–3 giây. Chữ **Bold Italic** trắng tinh 1 dòng duy nhất (không bôi vàng karaoke, không tiếng Anh), đặt an toàn ở khoảng trống **trên–giữa (`y ≈ 0.28–0.44`)**, tuyệt đối không đặt dưới đáy (`y > 0.78`) để tránh bị giao diện TikTok che.
- **Outro tĩnh lặng không chữ**: Đặt `"hideCaption": true` hoặc `"outroHideCaption": true` ở 2–3 giây cuối (cảnh bình minh nhìn từ sau gáy) để người xem lắng đọng cảm xúc.

### 3. Thư viện 9 Bối cảnh Neon-Wireframe & Camera Ken Burns (`scene3d.js`)
Tất cả các scene dưới đây tự động tắt lưới sàn cũ (`floorMesh`) và sử dụng Ken Burns camera drift mượt:
- `neon_wireframe_bedroom` + `ken_burns_bedroom_static`: Phòng ngủ đêm nét wireframe phát sáng (giá sách cầu vồng, cửa sổ sao vàng, bàn laptop, giường xanh ngọc, dây đèn fairy lights), nhân vật khăn quàng đỏ cầm điện thoại với **3 bong bóng chat xếp tầng** (`haha`, `chuẩn luôn`, `đỉnh thật`) và phong thư bay.
- `neon_theater_stage` + `ken_burns_stage_pullback` / `ken_burns_stage_pushin`: Sân khấu rèm nhung đỏ rượu (`#54202D`) viền vàng, spotlight nón từ trần, hàng khán giả tiền cảnh. Tùy biến qua:
  - `"crowdMode"`: `"pink_eyes"` (mắt chấm hồng soi mói) | `"neutral"` (dịu nhẹ) | `"friendly_smile"` (một mặt cười vàng `:)` rực sáng giữa khán giả) | `"confetti"` (pháo giấy chấm màu).
  - `"stageMood"`: `"solo"` (đứng run) | `"mic"` (micro đứng) | `"breathing"` (vòng tròn cyan hít thở lan tỏa) | `"notecard"` (thẻ ghi chú viền vàng 3 gạch đầu dòng) | `"confetti"`.
- `neon_emotional_void` + `ken_burns_void_drift`: Không gian tâm lý tối sâu đổi biểu tượng qua `"voidMode"`:
  - `"symptoms"`: Nhân vật nheo mắt căng thẳng + tia giật mình vàng `\|/` + tim đỏ neon đập mạnh + trang tài liệu xanh bay mất.
  - `"zipper"`: Nhân vật **khóa kéo xanh bịt miệng** (chọn im lặng).
  - `"empathy_bubbles"`: Trái tim hồng phát sáng trên đầu + 3 bong bóng lo âu xếp tầng (`sợ nói sai`, `sợ làm phiền`, `sợ người khác thất vọng`).
  - `"equalizer_vs_fear"`: **7 cột equalizer xanh lá dâng cao** đối trọng với **khối nỗi sợ tím mắt đỏ thu nhỏ dần**.
- `neon_classroom_stage` + `ken_burns_classroom_pan`: Lớp học bảng xanh viền neon xanh lá kép, 5 bàn học tiền cảnh (`"stageMood": "shy" | "confident"`).
- `neon_party_room` + `ken_burns_party_corner`: Phòng tiệc tụ tập 4 NPC dưới đèn nón ấm, nhân vật chính né góc khuất.
- `neon_office_meeting` + `ken_burns_office_push`: Văn phòng cửa sổ cao ốc đêm, bảng biểu đồ vàng, sếp áo xanh ngọc (`"stageMood": "rushed"` bong bóng nói vội `"dạ-em-làm-xong-rồi-ạ"` | `"confident"` `"em có ý này..."`).
- `neon_night_park_crush` + `ken_burns_park_couple`: Công viên đêm trăng tròn, cây anh đào wireframe, bạn nữ cardigan hồng + **bong bóng rối rắm nguệch ngoạc màu hồng**.
- `neon_city_street_home` + `ken_burns_street_walk`: Phố đêm biển hiệu neon (`NHÀ SÁCH`, `QUÁN NHẬU`, `TIỆM HOA`, `HOME`), tùy biến `"stageMood"`: `"nervous_walk"` (`ờ... à...`) | `"lightbulb_home"` (bóng đèn ý tưởng vàng) | `"confident_greet"` (`chào bạn!`).
- `sunrise_ocean_horizon` + `sunrise_backview_horizon`: Bờ biển bình minh cát ấm & sóng biển phản chiếu mặt trời mọc vàng cam, góc máy over-the-shoulder nhìn từ phía sau đầu nhân vật.

### 4. Công thức Kể chuyện 4 Hồi & Rapid Callback Montage
1. **Hồi 1 — Hook gần gũi & Triệu chứng**: Mở bằng tương phản ở nhà tự tin -> ra đám đông nghẹn lời (`neon_wireframe_bedroom` -> `neon_theater_stage` + `pink_eyes` -> `neon_emotional_void` + `symptoms`).
2. **Hồi 2 — Kịch bản đời thực & Im lặng**: Lần lượt qua lớp học (`shy`), phòng tiệc, văn phòng (`rushed`), công viên (`crush`), phố đêm (`nervous_walk`) rồi kết bằng khóa kéo bịt miệng (`zipper`).
3. **Hồi 3 — Tái định khung, Mẹo hành động & Rapid Callback Montage**: Chuyển sang đồng cảm (`empathy_bubbles`), đưa mẹo thở chậm & nhớ 3 ý chính (`breathing`, `notecard`, `friendly_smile`), rồi cắt nhanh **~1.5s/cảnh qua đúng 3 bối cảnh cũ** (`neon_classroom_stage` confident -> `neon_city_street_home` confident_greet -> `neon_office_meeting` confident).
4. **Hồi 4 — Kết cảm xúc & Bình minh không chữ**: Giọng vững dần (`equalizer_vs_fear`) -> ăn mừng can đảm (`confetti`) -> cắt êm sang `sunrise_ocean_horizon` không chữ + fade-to-black `1.0s`.

## Sử dụng trong dự án

Khi tạo video, dùng các lệnh đang được hỗ trợ:

```powershell
node cli.js render --preset tien-di-dau-roi --output output/tien_di_dau_roi.mp4
node cli.js render --script path/to/script.txt --title "TIÊU ĐỀ" --output output/custom.mp4
node cli.js render --project path/to/project.json --output output/custom.mp4
```

Kiểm tra `cli.js` và cấu trúc input thực tế trước khi chạy; các lệnh ví dụ có thể không áp dụng nếu phiên bản dự án đã đổi. Giữ tương thích CLI/preset cũ khi sửa code. Skill này hướng dẫn đạo diễn; không coi các đề xuất như semantic planner mới, schema validator, aligner hay renderer tổng quát là tính năng đã triển khai nếu chưa thấy trong code.
