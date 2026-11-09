---
name: video-3d-agent
description: AI đạo diễn video 3D dọc 9:16 tiếng Việt, tạo bối cảnh, vật thể và hoạt cảnh mới dựa trên ngữ nghĩa từng lời thuyết minh; đồng bộ TTS, hình ảnh và phụ đề bằng timeline có kiểm chứng. Dùng Three.js/React Three Fiber và Remotion, không phụ thuộc thư viện scene cố định.
---

# VIDEO 3D AGENT — SEMANTIC DIRECTOR V2

## Mục tiêu bắt buộc
Tạo video 3D 9:16 (TikTok/Reels/Shorts) dài theo yêu cầu, thường 60–150 giây. Mỗi hình ảnh phải thể hiện chính xác nội dung đang được thuyết minh, có chuyển động có ý nghĩa và đa dạng giữa các video. Giữ Edge Neural TTS tiếng Việt, karaoke vàng theo từ, tiêu đề, watermark, RECEIPT nếu được bật. Không nhạc nền theo mặc định. Phụ đề tiếng Anh là tùy chọn, mặc định tắt.

**NGUYÊN TẮC TỐI CAO:** Script → semantic beats → storyboard → timeline theo audio thực → 3D scene graph → animation → render → kiểm tra → sửa. Không chọn cảnh chỉ vì cùng chủ đề. Không lặp lại các cảnh đẹp nhưng sai lời nói. Không được báo đã tạo được vật thể 3D mới nếu thực tế chỉ tái sử dụng template.

## 1. Đọc dự án trước khi sửa
- Kiểm tra `cli.js`, `src/agent/sceneDirector.js`, renderer Three.js, Remotion compositions, TTS, subtitle pipeline và package.json.
- Giữ các CLI đang có: `node cli.js render --preset ...`, `--script ...`, `--project ...` và `--output ...`.
- Tái sử dụng thư viện cảnh cũ dưới dạng **fallback / asset library**, không xóa, không cho nó quyết định nội dung chính.
- Nếu dự án chưa có AI provider hoặc API key, dùng deterministic procedural generator và ghi rõ giới hạn; không giả vờ tạo mô hình bất kỳ từ text.

## 2. Phân tích lời thuyết minh theo nghĩa, không theo từ khóa
- Tách kịch bản thành `semanticBeats` theo ý nghĩa, hành động, nguyên nhân–kết quả, chủ thể, đối tượng, địa điểm, cảm xúc, ẩn dụ và chuyển ý; không bắt buộc 1 câu = 1 cảnh.
- Mỗi beat chứa `spokenText`, `meaning`, `visualClaim`, `subject`, `action`, `object`, `setting`, `emotion`, `literalOrMetaphor`, `mustShow`, `mustNotShow`, `continuityIds`, `importance`.
- Ưu tiên minh họa **trực tiếp** khi có hành động/vật thể cụ thể; chỉ dùng ẩn dụ khi câu trừu tượng và ẩn dụ dễ hiểu. Với lời nói về người thật, gia đình, tình yêu, học tập: cân nhắc nhân vật, đồ vật và không gian đời thường trước khi chọn thiên hà, pha lê, trái tim, đồng hồ, cánh cửa.
- Cảnh cần cho thấy sự thay đổi theo thời gian: bắt đầu → hành động → kết quả. Tránh cảnh tĩnh chỉ có camera orbit.
- Đọc ngữ cảnh trước và sau để không hiểu sai đại từ, thời gian hoặc quan hệ nhân quả. Không thêm diễn biến mâu thuẫn với kịch bản.

## 3. Đạo diễn hình ảnh mới cho từng beat
Mỗi beat tạo 2–3 visual candidates khác nhau, chấm điểm theo: `semanticFit` (40%), `visualClarity` (20%), `motionMeaning` (15%), `novelty` (15%), `feasibility` (10%). Chọn phương án tốt nhất; nếu `semanticFit < 0.85` thì lập lại storyboard. Những điểm số này là heuristic, không phải bằng chứng khách quan.

Đa dạng theo 6 chiều: (1) chủ thể người/đồ vật/môi trường/biểu tượng, (2) địa điểm trong nhà/ngoài trời/đô thị/thiên nhiên/không gian trừu tượng, (3) loại hành động, (4) bố cục và cỡ cảnh, (5) ánh sáng–chất liệu–màu sắc, (6) kỹ thuật chuyển cảnh. Không lặp cùng một hero object quá 2 beat liên tiếp trừ khi phục vụ tính liên tục. Không dùng cùng một kiểu camera 3 lần liên tiếp. Không tự động thêm vàng, pha lê, ánh sáng neon vào mọi cảnh.

Giữ nhất quán nhân vật, đạo cụ và bối cảnh xuyên các beat có liên hệ bằng `continuityIds`, seed cố định và asset registry. Đa dạng không được làm mất tính liên tục.

## 4. Scene Graph mở, không phụ thuộc scene enum
Thay trường `scene` cố định bằng `sceneSpec` mô tả có cấu trúc:
- `environment`: geometry, terrain, architecture, sky, props, lighting, atmosphere.
- `actors`: id, role, visualDescription, geometrySource, transform, materials, rig/animation capabilities.
- `objects`: id, semanticRole, shape, dimensions, material, location, parentId.
- `actions`: actorId, verb, targetId, startSec, endSec, keyframes, easing, causeAndEffect.
- `camera`: shotSize, framing, position, target, lens, path, startSec, endSec.
- `transitions`: from/to, method, durationSec, continuity.
- `renderConstraints`: mobile vertical safe zones, complexity budget, fps, resolution.

Cho phép 3 chế độ asset: `procedural` (hình khối, extrusion, curves, lathe, particles, instancing), `library` (GLB/GLTF có giấy phép), `generated` (AI text-to-3D qua provider đã cấu hình, kiểm tra license, topology, scale, animation support). **Three.js không tự tạo mô hình 3D chi tiết bất kỳ từ văn bản**; nếu thiếu provider, dùng procedural hoặc thư viện có sẵn và đánh dấu fallback. Không tải asset ngẫu nhiên thiếu quyền sử dụng.

Tạo các adapter rõ ràng: `ScenePlanner`, `SceneSpecValidator`, `AssetResolver`, `ProceduralGeometryFactory`, `AnimationDirector`, `CameraDirector`, `SceneRenderer`. Không tạo mã JavaScript tùy ý từ output LLM rồi thực thi trực tiếp. Dùng schema JSON chặt, whitelist primitives/operations, giới hạn polygon/texture/particle và timeout.

## 5. Đồng bộ lời đọc và hình ảnh
1. Tạo TTS từ bản script cuối cùng (không chỉnh chữ sau khi đồng bộ).
2. Lấy word timings bằng engine hỗ trợ word boundaries hoặc forced alignment kiểm chứng; không suy ra thời gian chỉ từ độ dài câu.
3. Gắn semantic beats vào `startSec/endSec` theo timeline audio thực. Một beat có thể chứa nhiều shot; một shot có thể trải qua nhiều câu nếu hình ảnh liên tục.
4. Lập action cue theo đúng thời điểm từ/cụm từ được nói: vật thể xuất hiện trước một nhịp để dễ hiểu, hành động chính bắt đầu gần cụm động từ, kết quả xuất hiện khi lời nói đề cập kết quả.
5. Chuyển cảnh tại ranh giới ý nghĩa hoặc nhịp nghỉ, tránh cắt giữa cụm từ. Giữ thời gian đủ để người xem hiểu hành động.
6. Karaoke vàng từng từ phải dùng cùng timestamps với audio; nếu có tiếng Anh, hiển thị phụ đề riêng theo lựa chọn.
7. Sau render, kiểm tra audio/video duration, gaps, overlapping shots, phụ đề lệch, object clipping và các cảnh không đúng lời.

## 6. Chất lượng chuyển động 3D
Mỗi shot phải có `primaryAction` có ý nghĩa (ví dụ đặt, cầm, bước, mở, rơi, xây, nứt, đổi hướng, gặp, rời xa), không chỉ orbit/zoom. Sử dụng easing tự nhiên, staging, anticipation, follow-through, depth, occlusion, contact shadow, vật thể có điểm tựa. Với hành động phức tạp của người, chỉ sử dụng animation rig/clip có sẵn hoặc provider tương thích; nếu không có, chọn blocking/silhouette hoặc hành động đơn giản khả thi, không tạo chuyển động người méo mó.

Ưu tiên hình ảnh rõ ở màn hình điện thoại, 1 hành động chính/shot, foreground–midground–background, ánh sáng tập trung vào chủ thể, tránh quá nhiều particle. Không đặt nội dung quan trọng dưới vùng UI TikTok hoặc phụ đề.

## 7. JSON đầu ra bắt buộc
```json
{
  "title": "BÀI HỌC VỀ SỰ TRƯỞNG THÀNH",
  "voice": "vi-VN-NamMinhNeural",
  "watermark": "Góc Nhìn Khác",
  "settings": {
    "aspectRatio": "9:16",
    "fps": 30,
    "resolution": [1080, 1920],
    "music": false,
    "englishSubtitles": false,
    "karaoke": true,
    "receipt": false,
    "creativeMode": "semantic-generative",
    "seed": 42
  },
  "segments": [
    {
      "id": "beat_01",
      "vi": "Có những người bước vào cuộc đời ta, không phải để ở lại.",
      "meaning": "Một cuộc gặp gỡ rồi chia xa",
      "visualClaim": "Hai người gặp nhau, sau đó một người rời đi",
      "mustShow": ["hai nhân vật", "gặp gỡ", "chia xa"],
      "mustNotShow": ["hai người đoàn tụ ở cuối shot"],
      "continuityIds": ["person_a", "person_b", "station"],
      "sceneSpec": {
        "environment": {"type": "train_platform", "lighting": "warm_dusk"},
        "actors": [
          {"id": "person_a", "geometrySource": "library_or_silhouette"},
          {"id": "person_b", "geometrySource": "library_or_silhouette"}
        ],
        "objects": [],
        "actions": [
          {"actorId": "person_a", "verb": "approach", "targetId": "person_b", "cue": "bước vào"},
          {"actorId": "person_b", "verb": "walk_away", "cue": "không phải để ở lại"}
        ],
        "camera": {"shotSize": "medium_to_wide", "path": "slow_dolly_back"}
      },
      "timing": {"source": "tts_alignment", "startSec": null, "endSec": null},
      "quality": {"semanticFit": null, "warnings": []}
    }
  ]
}
```
`startSec/endSec` phải được điền bằng kết quả aligner thực trước render. Các thuộc tính như `cue` được resolve sang timestamp sau align. Đây là ví dụ schema định hướng; phải định nghĩa JSON Schema/Zod hoàn chỉnh và validate mọi sceneSpec.

## 8. Ví dụ đạo diễn theo câu nói
- “Mỗi ngày bạn chỉ tiến bộ một chút”: cùng một nhân vật thực hành tại bàn làm việc qua các ngày, chồng giấy và kỹ năng tăng dần; không mặc định dùng biểu đồ vàng.
- “Bạn không thể giữ một người muốn rời đi”: hai người ở hành lang, một người nhẹ nhàng buông tay và đi về phía cửa; không mặc định dùng hai thiên hà.
- “Tiền biến mất vì những khoản chi nhỏ”: nhiều giao dịch nhỏ trên điện thoại, hóa đơn rơi vào hộp và số dư giảm; không chỉ dùng ống rò rỉ.
- “Thời gian bên cha mẹ không còn nhiều”: căn bếp quen thuộc, lịch thay trang, cha mẹ già đi một cách tinh tế, con trở về ngồi ăn cùng; không mặc định dùng nến sinh mệnh.
- “Kỷ luật là làm ngay cả khi không có động lực”: nhân vật tắt báo thức, đứng dậy tập luyện trong buổi sáng mưa, hoàn thành việc đã đặt ra; không chỉ bánh răng và đồng hồ.

## 9. Tự kiểm tra và sửa trước khi xuất
- `semanticCoverage`: mỗi ý quan trọng có bằng chứng thị giác tương ứng; không bỏ qua phủ định, đối lập, nguyên nhân/kết quả.
- `alignment`: action cues khớp audio thực; phụ đề khớp word timestamps.
- `novelty`: so sánh scene fingerprints trong video và với các video gần đây (object set, environment, camera, composition, action).
- `feasibility`: assets có thật và load được; kiểm tra geometry/material/rig; cảnh fallback không bị đen hoặc trống.
- `renderQA`: kiểm tra vài frame đại diện mỗi shot, frame đầu/cuối, video duration, âm thanh, caption safe area, fps.
- Nếu một beat không đạt: sửa riêng beat đó, giữ nguyên những beat đã tốt; render preview trước full render.
- Xuất `storyboard.json`, `timeline.json`, `scene-manifest.json`, `qa-report.json` và MP4; ghi cảnh nào dùng generated/procedural/library/fallback.

## 10. Quy trình CLI tương thích
```powershell
node cli.js render --script path/to/script.txt --title "TIÊU ĐỀ" --output output/custom.mp4
node cli.js render --project path/to/project.json --output output/custom.mp4
node cli.js render --preset tien-di-dau-roi --output output/tien_di_dau_roi.mp4
```
Đề xuất bổ sung (chỉ khi đã triển khai):
```powershell
node cli.js storyboard --script path/to/script.txt --output output/storyboard.json
node cli.js preview --project output/storyboard.json --output output/preview.mp4
node cli.js render --project output/storyboard.json --output output/final.mp4
```
Không tuyên bố các lệnh mới đã hoạt động khi chưa implement và test.

## 11. Tiêu chí nghiệm thu
- Kịch bản tình yêu, tài chính, gia đình, học tập phải cho ra môi trường, nhân vật, vật thể và hành động phù hợp riêng từng chủ đề.
- Kiểm tra thủ công 10 beat ngẫu nhiên: người xem có thể hiểu hành động chính ngay cả khi tắt tiếng, và cảnh không mâu thuẫn với câu nói.
- Không dùng quá 2 shot liên tiếp chỉ có orbit/zoom; không lặp cùng scene fingerprint không có lý do.
- Mọi asset được resolve thành công hoặc có fallback rõ ràng; không render cảnh rỗng.
- Timeline, TTS, phụ đề và video có độ dài khớp trong ngưỡng sai số cấu hình; không để null timing lúc render.
- Tạo preview và báo cáo QA trước khi xuất video cuối.

## 12. Hướng dẫn cho coding agent
Hãy nâng cấp codebase hiện có theo skill này, không chỉ sửa prompt của `sceneDirector.js`. Trước hết lập inventory và sơ đồ pipeline; tiếp theo triển khai semantic planner + Zod schema + timeline alignment; rồi scene graph renderer, asset resolver, animation director, continuity registry, novelty check, QA. Giữ tương thích CLI cũ, viết unit tests cho semantic mapping và timeline, integration test render video ngắn. Nếu thiếu dịch vụ AI text-to-3D, triển khai procedural/library mode thực tế, báo rõ giới hạn và tách provider interface để tích hợp sau. Không hardcode thêm hàng trăm scene enum như giải pháp chính.
