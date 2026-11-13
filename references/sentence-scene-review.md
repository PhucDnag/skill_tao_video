# Đối chiếu từng câu với hình

Lập bảng trong ghi chú project trước render: lời nguyên văn → chủ thể/ngữ cảnh → hành động nhìn thấy → trạng thái đầu/cuối → cue trong audio → cách kiểm tra. `visualClaim` mô tả hình thực sự render, không chỉ ý muốn làm. Bảng này là tài liệu đạo diễn; renderer không tự hiểu nghĩa hoặc kiểm chứng nó.

## Các lỗi cụ thể phải tránh

- “Thức dậy theo chuông báo thức, lao vào dòng xe, làm việc tám tiếng”: tách ba beat ở phòng ngủ, đường đi và bàn làm việc; không dùng cảnh họp cho cả câu. Cho thấy tắt báo thức/rời giường, di chuyển, thao tác công việc và thời gian trôi. Không bịa các hành động đã có trong scene nếu code không hỗ trợ.
- “Không có niềm vui rõ rệt, cũng chẳng có nỗi buồn”: hình hai người đứng ngoài phố với biển nhà sách/tiệm hoa không giải thích trạng thái này. Chọn nhân vật phản ứng thờ ơ trước một tình huống, ánh mắt/tư thế thiếu sinh khí hoặc montage thói quen lặp; không cho nhân vật cười vui mặc định, không thay bằng đau khổ dữ dội.
- “Lặp lại từng ngày như một cỗ máy”: thể hiện cùng chuỗi hành động lặp qua các ngày với dấu thời gian; đứng yên hoặc camera pan không phải hành động lặp của câu.
- “Lắng nghe người khác”: thể hiện một người nói và một người hướng về họ, dừng việc riêng để nghe; thẻ chữ “lắng nghe” đơn độc chỉ là nhãn, chưa phải minh họa đầy đủ.

## Không tái chế cả video

Đọc những project gần nhất liên quan trong `projects/` nếu có. So sánh chuỗi bối cảnh, hành động và cách kết; tránh dùng lại nguyên chuỗi phòng ngủ → văn phòng → phố neon → bình minh chỉ vì chúng có sẵn. Tái sử dụng asset nhân vật/đạo cụ được, nhưng bố cục và hoạt cảnh phải xuất phát từ câu mới. Không ép mọi chủ đề vào 2D, 3D hay thẻ chữ; lựa chọn theo nội dung và yêu cầu người dùng.

Scene enum cũ chỉ được chọn sau khi kiểm tra hành động nó thực sự có. Nếu không có cảnh phù hợp, sáng tác bằng primitive/asset được hỗ trợ hoặc mở rộng runtime trong phạm vi được cho phép; không chọn scene gần nhất rồi coi như xong. Nếu chưa thể thực hiện, báo phần thiếu thay vì tuyên bố đã dựng đúng câu.

## QA trước khi giao

1. Đọc từng câu và xem hình không tiếng: hình có truyền đạt chủ thể, hành động, sắc thái/quan hệ nhân quả không?
2. So timestamp từ với hành động: chuẩn bị trước cue nhẹ, hành động chính khi nói tới, kết quả không reveal sai thời điểm.
3. Chụp khung ở giữa hai từ liên tiếp: vùng vàng phải chuyển sang từ đang đọc, không tô nguyên câu hay giữ từ cũ qua khoảng lặng.
4. Kiểm tra sub IN HOA đủ dấu, ở phía dưới, không trùng caption cũ phía trên, không che mặt/đạo cụ; giữ bối cảnh sáng và rõ ở kích thước điện thoại.
5. Sửa mọi câu sai ngữ cảnh trước full render. Kiểm thử kỹ thuật không chứng minh video đúng nghĩa; không tự báo đạt semantic QA chỉ vì MP4 xuất thành công.
