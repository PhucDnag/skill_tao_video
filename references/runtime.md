# Chạy skill

Thư mục chứa SKILL.md là runtime root; các đường dẫn lệnh bên dưới tương đối với root. Giữ nguyên toàn bộ runtime khi đóng gói skill. Cần Node.js, Python 3, Chrome hoặc Edge, FFmpeg và ffprobe trong PATH. Có thể đặt `VIDEO_BROWSER_PATH` trỏ executable trình duyệt. Không cần web app, tài khoản Studio hay API server công khai; renderer mở HTTP chỉ trên loopback, cổng tạm thời và đóng khi xong.

```powershell
npm ci
python -m pip install -r requirements.txt
node cli.js help
node cli.js validate --project examples/gap-go.json
node cli.js render --project examples/gap-go.json --output output/gap-go.mp4
```

Edge-TTS cần mạng. Voice packs hiện có tại `voices/`; nhánh ZeroTTS/clone cần thêm thư viện và model tương ứng (xem import trong `src/tts/voice_cloner.py`, `tts_engine.py`), không cần cài cho Edge-TTS. Không chạy clone nếu chỉ muốn học phong cách hình ảnh. `--voice`, `--rate`, `--pitch`, `--title`, `--watermark` ghi đè project; `--maxSegments 2` dùng thử đoạn ngắn.

AI viết dự án mới vào `projects/<ten-chu-de>.json` và xuất MP4 tương ứng. `examples/` chứa mẫu nhỏ để học schema, `projects/` giữ các kịch bản đã có, `voices/` giữ dữ liệu giọng. Không xóa các dữ liệu này như cache. `output/.work_<ten>/` là audio/timeline cache để chỉnh hình không cần gọi TTS lại; có thể xóa khi không cần.

`--script` là bộ phân loại từ khóa 3D cũ kèm dịch mạng, không phải semantic AI director; không dùng làm luồng chính cho video mới. Không có `--topic` gọi LLM. Dùng khả năng lập luận của AI để viết project rõ ràng rồi CLI render.

Kiểm tra: `npm test` dùng timeline/audio tổng hợp cục bộ để kiểm tra transport, cảnh 2D, cảnh 3D và MP4. Không đánh giá chất lượng giọng TTS. `ffprobe -v error -show_streams -show_format output/gap-go.mp4` xác minh codec/kích thước/thời lượng. Xem khung hình và nghe video riêng để QA nội dung.
