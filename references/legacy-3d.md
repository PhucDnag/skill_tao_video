# Chế độ 3D đã có

Phụ đề hiện dùng `subtitles.js` chung: IN HOA phía dưới, vàng theo `words` thật. `caption`, `captionBeats`, `captionY` cũ không còn thay thế lời đọc. Nền/ánh sáng mặc định sáng hơn (`visualTheme: "bright"`); đặt `dark` chỉ khi được yêu cầu. Đổi presentation không tự sửa ý nghĩa scene: phải đạo diễn lại từng câu theo `sentence-scene-review.md`.

Các project cũ trong `projects/` vẫn sử dụng được với `node cli.js render --project ... --output ...`.

- `classic-letterbox`: cảnh Three.js ngang trong khung dọc, receipt và phụ đề song ngữ nếu có dữ liệu.
- `neon-story-stage`: sân khấu tràn khung, nhân vật procedural, caption ngắn. Ví dụ `projects/noi_so_dam_dong_neon_stage.json`.
- Scene/camera thật nằm trong `src/renderer/assets/js/scene3d.js`, phần neon mở rộng trong `scene3d_neon_story.js`. Tra các tên đã đăng ký trước khi tác giả project; không tự phát minh enum.
- TTS bảo toàn metadata segment. Những field như `stageMood`, `voidMode` chỉ hoạt động nếu scene đọc chúng; `captionBeats` cũ không dùng cho sub mới. Kiểm tra code trước khi dùng.

Không có Remotion, React Three Fiber, scene graph 3D tổng quát hay text-to-3D provider. Chỉ dùng 3D khi hình ảnh thể hiện đúng lời. Không ép chủ đề mới vào preset tài chính vì dễ chạy. Luồng `--script` hiện chỉ tạo bản nháp theo từ khóa, cần AI biên tập và kiểm tra.
