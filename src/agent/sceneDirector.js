const https = require('https');

/**
 * Built-in Presets including the 1:1 exact reconstruction of the user's sample video
 * ("TIỀN ĐI ĐÂU RỒI !?") plus additional 3D metaphor templates.
 */
const PRESETS = {
  'tien-di-dau-roi': {
    id: 'tien-di-dau-roi',
    name: 'TIỀN ĐI ĐÂU RỒI !? (Chuẩn Video Mẫu 100%)',
    title: 'TIỀN ĐI ĐÂU RỒI !?',
    watermark: 'Nội dung thuộc hệ sinh thái kênh A&BMoney',
    voice: 'vi-VN-NamMinhNeural',
    rate: '+8%',
    pitch: '+0Hz',
    outroDuration: 3.8,
    outroScene: 'tank_outro',
    outroCamera: 'final_tank_zoom',
    segments: [
      {
        vi: 'Cuối tháng nhìn vào tài khoản ngân hàng còn vài trăm nghìn,',
        en: 'At the end of the month, you check your bank account, only a few hundred thousand left,',
        receipt: '',
        scene: 'tank_intro',
        camera: 'orbit_tank_close'
      },
      {
        vi: 'và bạn lại thở dài tự hỏi:',
        en: 'and you sigh and ask yourself:',
        receipt: '',
        scene: 'tank_to_pipe',
        camera: 'pan_tank_to_pipe'
      },
      {
        vi: 'tiền của mình đã đi đâu mất rồi?',
        en: 'Where did my money go?',
        receipt: 'Tiền của mình đã đi đâu?',
        scene: 'pipe_flow',
        camera: 'track_pipe_forward'
      },
      {
        vi: 'Đừng đổ lỗi cho giá cả đắt đỏ hay mức lương chưa cao!',
        en: "Don't blame high prices or a low salary!",
        receipt: '',
        scene: 'pipe_flow',
        camera: 'track_pipe_wide'
      },
      {
        vi: 'Sự thật cay đắng là:',
        en: 'The bitter truth is:',
        receipt: '',
        scene: 'pipe_flow_leaks',
        camera: 'approach_leak_valve'
      },
      {
        vi: 'tài chính của bạn đang bị rò rỉ âm thầm mỗi ngày mà chính bạn cũng không hề hay biết.',
        en: "Your finances are leaking quietly every day, and you don't even know it.",
        receipt: 'Rò rỉ âm thầm',
        scene: 'leak_closeup',
        camera: 'under_pipe_leak'
      },
      {
        vi: 'Kiếm mười triệu tiêu hết mười triệu,',
        en: 'Earn ten million, spend ten million,',
        receipt: 'Kiếm mười triệu tiêu hết',
        scene: 'pipe_flow_leaks',
        camera: 'track_pipe_medium'
      },
      {
        vi: 'lên lương hai mươi triệu thì đến cuối tháng tài khoản vẫn về số không!',
        en: "get a raise to twenty million, and by month's end the account still hits zero!",
        receipt: 'Lên lương hai mươi triệu | Vẫn về số không',
        scene: 'pipe_flow_leaks',
        camera: 'track_pipe_reverse'
      },
      {
        vi: 'Nếu bạn đang muốn chặn đứng ngay điểm rò rỉ này,',
        en: 'If you want to stop this leak right now,',
        receipt: '',
        scene: 'pipe_flow_leaks',
        camera: 'closeup_pipe_rings'
      },
      {
        vi: 'mở link bio lấy tài liệu hướng dẫn để kiểm soát lại từng đồng tiền của mình!',
        en: 'open the Bio link and get the guide to take control of every single coin!',
        receipt: 'Link ở Bio ↓',
        scene: 'pipe_flow',
        camera: 'closeup_pipe_smooth'
      },
      {
        vi: 'Bẫy tài chính nguy hiểm nhất không nằm ở những khoản chi lớn,',
        en: 'The most dangerous financial trap is not the big expenses,',
        receipt: '',
        scene: 'leak_particles_heavy',
        camera: 'low_angle_red_leaks'
      },
      {
        vi: 'mà nằm ở hàng trăm khoản chi tiêu vô hình mỗi ngày.',
        en: 'but hundreds of invisible daily expenses.',
        receipt: 'Chi tiêu vô hình',
        scene: 'leak_particles_heavy',
        camera: 'pan_red_leaks'
      },
      {
        vi: 'Một ly trà sữa tiện tay, vài đơn hàng săn sale vô thức, những dịch vụ đăng ký rồi bỏ quên…',
        en: 'One casual bubble tea, a few mindless sale orders, subscriptions you signed up for and forgot...',
        receipt: 'Ly trà sữa tiện tay | Đơn săn sale vô thức | Đăng ký bị bỏ quên',
        scene: 'pipe_flow_leaks',
        camera: 'closeup_tumbling_coins'
      },
      {
        vi: 'tất cả đang âm thầm gặm nhấm tương lai của bạn từng giờ một.',
        en: 'All of it quietly eating away your future hour by hour.',
        receipt: 'Gặm nhấm từng giờ',
        scene: 'leak_cutters',
        camera: 'closeup_red_blades'
      },
      {
        vi: 'Tôi đã lập sẵn bản đồ định vị dòng tiền và cách dọn dẹp chi tiêu rác trong tài liệu ngay tại link bio, mở xem ngay!',
        en: 'I have already built a money-flow map and a way to clear out junk spending in the guide right at the Bio link, open it now!',
        receipt: 'Bản đồ định vị dòng tiền | Dọn chi tiêu rác | Link ở Bio ↓',
        scene: 'leak_pins_map',
        camera: 'high_angle_map'
      },
      {
        vi: 'Muốn làm chủ cuộc đời, trước tiên phải làm chủ dòng tiền.',
        en: 'If you want to run your life, you must first run your cash flow.',
        receipt: 'Làm chủ dòng tiền',
        scene: 'golden_helm',
        camera: 'hero_helm_front'
      },
      {
        vi: 'Đừng tiếp tục biến mồ hôi công sức của mình thành những thứ vô giá trị chỉ sau vài cú chạm màn hình!',
        en: 'Stop turning your hard-earned sweat into worthless things after just a few taps on a screen!',
        receipt: 'Vài cú chạm màn hình',
        scene: 'phone_tap',
        camera: 'macro_phone_screen'
      },
      {
        vi: 'Tỉnh táo lại ngay! Mở trực tiếp link bio lúc này, nhận tài liệu và cầm lại chiếc bánh lái tài chính của chính bạn!',
        en: 'Wake up right now! Open the Bio link right now, get the guide and take back the steering wheel of your own finances!',
        receipt: 'Tỉnh táo lại ngay | Link ở Bio ↓ | Cầm lại bánh lái',
        scene: 'helm_phone_combo',
        camera: 'helm_and_phone_wide'
      },
      {
        vi: 'Mọi nội dung chỉ mang tính tham khảo, không phải lời khuyên tài chính cá nhân.',
        en: 'All content is for reference only, and is not personal financial advice.',
        receipt: '',
        disclaimer: 'Mọi nội dung chỉ mang tính tham khảo, không phải lời\nkhuyên tài chính cá nhân.',
        scene: 'pipe_overview',
        camera: 'wide_pullback_pipe'
      }
    ]
  },

  'lai-kep-thoi-gian': {
    id: 'lai-kep-thoi-gian',
    name: 'SỨC MẠNH LÃI KÉP & THỜI GIAN (Biểu Đồ 3D & Bánh Răng)',
    title: 'BÍ MẬT CỦA LÃI KÉP !?',
    watermark: 'Nội dung thuộc hệ sinh thái kênh A&BMoney',
    voice: 'vi-VN-NamMinhNeural',
    rate: '+8%',
    pitch: '+0Hz',
    outroDuration: 3.0,
    outroScene: 'vault_safe',
    outroCamera: 'orbit_vault',
    segments: [
      {
        vi: 'Tại sao cùng một mức thu nhập nhưng sau mười năm có người tự do tài chính, có người vẫn trắng tay?',
        en: 'Why do some achieve financial freedom after ten years on the same income while others have nothing?',
        receipt: 'Sau 10 năm trắng tay?',
        scene: 'balance_scale',
        camera: 'orbit_scale'
      },
      {
        vi: 'Khác biệt không nằm ở số tiền bạn kiếm được hôm nay, mà nằm ở cỗ máy thời gian và lãi kép.',
        en: 'The difference is not what you earn today, but the engine of time and compound interest.',
        receipt: 'Cỗ máy thời gian',
        scene: 'time_gears',
        camera: 'orbit_gears'
      },
      {
        vi: 'Mỗi đồng tiền tiết kiệm được đưa vào dòng chảy đầu tư sẽ tự sinh sôi mỗi ngày.',
        en: 'Every saved coin placed into the investment stream multiplies on its own every single day.',
        receipt: 'Dòng chảy đầu tư',
        scene: 'pipe_flow',
        camera: 'track_pipe_forward'
      },
      {
        vi: 'Khi bạn kiên trì tích lũy, biểu đồ tài sản sẽ bứt phá dựng đứng theo cấp số nhân!',
        en: 'When you accumulate consistently, your wealth chart skyrockets exponentially!',
        receipt: 'Bứt phá cấp số nhân',
        scene: 'growth_chart',
        camera: 'orbit_chart_rise'
      },
      {
        vi: 'Hãy bắt đầu cầm lại bánh lái tài chính và xây dựng két sắt thịnh vượng ngay hôm nay tại link bio!',
        en: 'Take back the financial helm and build your wealth vault today at the Bio link!',
        receipt: 'Link ở Bio ↓',
        scene: 'golden_helm',
        camera: 'hero_helm_front'
      },
      {
        vi: 'Mọi nội dung chỉ mang tính tham khảo, không phải lời khuyên tài chính cá nhân.',
        en: 'All content is for reference only, and is not personal financial advice.',
        receipt: '',
        disclaimer: 'Mọi nội dung chỉ mang tính tham khảo, không phải lời\nkhuyên tài chính cá nhân.',
        scene: 'vault_safe',
        camera: 'orbit_vault'
      }
    ]
  },

  'tu-duy-dai-han': {
    id: 'tu-duy-dai-han',
    name: 'TƯ DUY DÀI HẠN (Phân cảnh 3D mới • Không Watermark)',
    title: 'TƯ DUY DÀI HẠN',
    watermark: '',
    voice: 'giong_mau',
    rate: '+0%',
    pitch: '+0Hz',
    outroDuration: 3.5,
    outroScene: 'vault_safe',
    outroCamera: 'vault_zoom_outro',
    segments: [
      {
        vi: 'Tại sao phần lớn mọi người đều khao khát thành công,',
        en: 'Why do most people crave success,',
        receipt: '',
        scene: 'hourglass_time',
        camera: 'orbit_hourglass_close'
      },
      {
        vi: 'nhưng lại dễ dàng bỏ cuộc chỉ sau vài tháng ngắn ngủi?',
        en: 'yet easily give up after just a few short months?',
        receipt: 'Bỏ cuộc quá sớm',
        scene: 'two_paths_bridge',
        camera: 'fork_two_paths'
      },
      {
        vi: 'Bởi vì não bộ con người luôn bị cám dỗ bởi những phần thưởng tức thời,',
        en: 'Because the human brain is always tempted by instant rewards,',
        receipt: 'Cám dỗ tức thời',
        scene: 'phone_tap',
        camera: 'macro_phone_screen'
      },
      {
        vi: 'mà quên mất rằng mọi giá trị vĩ đại đều cần thời gian để tích lũy.',
        en: 'forgetting that every great value takes time to compound.',
        receipt: 'Thời gian tích lũy',
        scene: 'hourglass_time',
        camera: 'hourglass_top_down'
      },
      {
        vi: 'Người có tư duy ngắn hạn chỉ nhìn thấy sự mệt mỏi của ngày hôm nay,',
        en: 'Short-term thinkers only see the exhaustion of today,',
        receipt: 'Tư duy ngắn hạn',
        scene: 'balance_scale',
        camera: 'orbit_scale'
      },
      {
        vi: 'còn người có tư duy dài hạn nhìn thấy cả một hệ thống đang âm thầm vận hành.',
        en: 'while long-term thinkers see an entire system quietly at work.',
        receipt: 'Tầm nhìn hệ thống',
        scene: 'time_gears',
        camera: 'orbit_gears'
      },
      {
        vi: 'Hãy nhìn vào hiệu ứng domino trong cuộc sống và sự nghiệp của bạn:',
        en: 'Look at the domino effect in your life and career:',
        receipt: 'Hiệu ứng Domino',
        scene: 'domino_chain',
        camera: 'track_domino_arc'
      },
      {
        vi: 'một thói quen nhỏ lặp lại mỗi ngày có vẻ chẳng tạo ra khác biệt ngay lập tức,',
        en: 'one small habit repeated daily seems to make no immediate difference,',
        receipt: 'Thói quen nhỏ mỗi ngày',
        scene: 'domino_chain',
        camera: 'low_angle_domino_giant'
      },
      {
        vi: 'nhưng sau ba năm, năm năm, nó tạo ra sức bật khổng lồ không gì cản nổi!',
        en: 'but after three or five years, it creates unstoppable momentum!',
        receipt: 'Sức bật khổng lồ | Sau 3 - 5 năm',
        scene: 'growth_chart',
        camera: 'chart_low_hero'
      },
      {
        vi: 'Đừng đánh đổi tương lai vững chắc chỉ để lấy vài phút thoả mãn ngắn hạn.',
        en: 'Never trade a solid future for a few minutes of fleeting gratification.',
        receipt: 'Đừng đánh đổi tương lai',
        scene: 'two_paths_bridge',
        camera: 'climb_golden_bridge'
      },
      {
        vi: 'Hãy kiên nhẫn gieo hạt, giữ vững bánh lái trước những biến động nhất thời,',
        en: 'Plant seeds patiently and hold the wheel steady through temporary storms,',
        receipt: 'Giữ vững bánh lái',
        scene: 'golden_helm',
        camera: 'hero_helm_front'
      },
      {
        vi: 'để dòng chảy kỷ luật mỗi ngày bồi đắp nên thành quả bền vững cho chính bạn!',
        en: 'so the daily stream of discipline builds lasting prosperity for you!',
        receipt: 'Kỷ luật mỗi ngày | Thành quả bền vững',
        scene: 'growth_chart',
        camera: 'orbit_chart_rise'
      }
    ]
  },

  'bo-me-se-gia-di': {
    id: 'bo-me-se-gia-di',
    name: 'MỘT NGÀY NÀO ĐÓ, BỐ MẸ SẼ GIÀ ĐI (Giọng Mẫu Clone • Cảnh 3D Mới)',
    title: 'MỘT NGÀY NÀO ĐÓ, BỐ MẸ SẼ GIÀ ĐI',
    watermark: '',
    voice: 'giong_mau',
    rate: '+0%',
    pitch: '+0Hz',
    outroDuration: 3.5,
    outroScene: 'calendar_tree_leaves',
    outroCamera: 'tree_outro_warm',
    segments: [
      {
        vi: 'Chúng ta thường mải miết chạy theo ước mơ và sự nghiệp ngoài kia,',
        en: 'We are often so busy chasing dreams and careers out there,',
        receipt: '',
        scene: 'time_gears',
        camera: 'orbit_gears'
      },
      {
        vi: 'mà quên mất rằng ở quê nhà, có hai người đang âm thầm già đi mỗi ngày.',
        en: 'forgetting that back home, two people are quietly growing older every day.',
        receipt: 'Âm thầm già đi',
        scene: 'lifeline_candles',
        camera: 'orbit_candles_warm'
      },
      {
        vi: 'Khi bạn ngày càng trưởng thành, mạnh mẽ và vươn cao,',
        en: 'As you grow more mature, stronger, and reach higher,',
        receipt: 'Khi bạn trưởng thành',
        scene: 'lifeline_candles',
        camera: 'candles_closeup_flame'
      },
      {
        vi: 'cũng là lúc mái tóc bố thêm bạc, đôi mắt mẹ thêm mờ và bước chân dần chậm lại.',
        en: "father's hair turns grayer, mother's eyes dimmer, and their steps slower.",
        receipt: 'Tóc bố thêm bạc | Mắt mẹ thêm mờ',
        scene: 'hourglass_time',
        camera: 'orbit_hourglass_close'
      },
      {
        vi: 'Một năm bạn về thăm nhà được mấy lần? Nếu mỗi năm chỉ về dịp Tết,',
        en: 'How many times a year do you visit home? If only once every New Year,',
        receipt: 'Một năm về mấy lần?',
        scene: 'calendar_tree_leaves',
        camera: 'orbit_golden_tree'
      },
      {
        vi: 'thì thời gian thực sự bạn ở bên bố mẹ chỉ còn tính bằng vài chục ngày ngắn ngủi!',
        en: 'the real time you have left with your parents is only a few dozen short days!',
        receipt: 'Vài chục ngày ngắn ngủi',
        scene: 'calendar_tree_leaves',
        camera: 'low_angle_tree_leaves'
      },
      {
        vi: 'Đằng sau câu nói bố mẹ vẫn khoẻ, con cứ yên tâm làm việc đi,',
        en: "Behind the words 'We are fine, just focus on your work,'",
        receipt: 'Bố mẹ vẫn khoẻ',
        scene: 'empty_home_table',
        camera: 'orbit_home_table'
      },
      {
        vi: 'là những bữa cơm chiều vắng lặng và chiếc ghế trống luôn chờ con trở về.',
        en: 'are quiet evening meals and an empty chair always waiting for you to come home.',
        receipt: 'Bữa cơm chiều vắng lặng | Chiếc ghế trống chờ con',
        scene: 'empty_home_table',
        camera: 'pullback_lonely_table'
      },
      {
        vi: 'Chúng ta có thể kiên nhẫn với cả thế giới chỉ sau vài cú chạm màn hình,',
        en: 'We can be patient with the whole world behind a phone screen,',
        receipt: 'Kiên nhẫn với thế giới',
        scene: 'phone_tap',
        camera: 'macro_phone_screen'
      },
      {
        vi: 'nhưng đôi khi lại vô tình cáu gắt trước những câu hỏi lặp đi lặp lại của đấng sinh thành.',
        en: "yet unintentionally impatient with our parents' repeated questions.",
        receipt: 'Vô tình cáu gắt',
        scene: 'balance_scale',
        camera: 'orbit_scale'
      },
      {
        vi: 'Tiền bạc mất đi còn có thể kiếm lại, nhưng thời gian của bố mẹ thì không bao giờ quay đầu.',
        en: "Lost money can be earned back, but our parents' time never turns around.",
        receipt: 'Thời gian không quay đầu',
        scene: 'hourglass_time',
        camera: 'hourglass_top_down'
      },
      {
        vi: 'Đừng đợi đến khi thành đạt mới báo hiếu, hãy gọi về nhà khi còn có người bắt máy chờ con!',
        en: "Don't wait until success to care—call home while someone is still there to answer!",
        receipt: 'Đừng đợi quá muộn | Hãy gọi về nhà ngay',
        scene: 'lifeline_candles',
        camera: 'orbit_candles_warm'
      }
    ]
  }
};

/**
 * Translate Vietnamese text to English using free Google Translate endpoint with graceful fallback.
 */
function translateViToEn(viText) {
  return new Promise((resolve) => {
    if (!viText || !viText.trim()) return resolve('');
    const encoded = encodeURIComponent(viText.trim());
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=en&dt=t&q=${encoded}`;

    const req = https.get(url, { timeout: 4000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
            const translated = parsed[0].map((item) => item[0]).join('');
            return resolve(translated);
          }
        } catch (err) {
          // ignore and fallback
        }
        resolve('');
      });
    });

    req.on('error', () => resolve(''));
    req.on('timeout', () => {
      req.destroy();
      resolve('');
    });
  });
}

/**
 * Analyze a Vietnamese sentence and pick the best 3D metaphor scene, camera preset, and receipt callout.
 */
function classifySegmentMetaphor(text, index, total) {
  const lower = text.toLowerCase();

  // Check for disclaimer
  if (lower.includes('tham khảo') && lower.includes('lời khuyên')) {
    return {
      scene: 'pipe_overview',
      camera: 'wide_pullback_pipe',
      receipt: '',
      disclaimer: 'Mọi nội dung chỉ mang tính tham khảo, không phải lời\nkhuyên tài chính cá nhân.'
    };
  }

  // Check for Link in Bio / CTA
  const isBioCta = lower.includes('link bio') || lower.includes('link ở bio') || lower.includes('tài liệu');

  // Detect specific metaphors by keywords
  if (lower.includes('bánh lái') || lower.includes('làm chủ dòng tiền') || lower.includes('làm chủ cuộc đời')) {
    if (lower.includes('tỉnh táo') || isBioCta) {
      return {
        scene: 'helm_phone_combo',
        camera: 'helm_and_phone_wide',
        receipt: isBioCta ? 'Tỉnh táo lại ngay | Link ở Bio ↓ | Cầm lại bánh lái' : 'Làm chủ dòng tiền'
      };
    }
    return {
      scene: 'golden_helm',
      camera: 'hero_helm_front',
      receipt: 'Làm chủ dòng tiền'
    };
  }

  if (lower.includes('chạm màn hình') || lower.includes('điện thoại') || lower.includes('lướt')) {
    return {
      scene: 'phone_tap',
      camera: 'macro_phone_screen',
      receipt: 'Vài cú chạm màn hình'
    };
  }

  if (lower.includes('bản đồ') || lower.includes('định vị') || lower.includes('dọn dẹp')) {
    return {
      scene: 'leak_pins_map',
      camera: 'high_angle_map',
      receipt: isBioCta ? 'Bản đồ định vị dòng tiền | Link ở Bio ↓' : 'Bản đồ định vị dòng tiền'
    };
  }

  if (lower.includes('biểu đồ') || lower.includes('tăng trưởng') || lower.includes('lãi kép') || lower.includes('cấp số nhân')) {
    return {
      scene: 'growth_chart',
      camera: 'orbit_chart_rise',
      receipt: extractShortReceipt(text, isBioCta)
    };
  }

  if (lower.includes('cân bằng') || lower.includes('thu nhập') || lower.includes('so sánh') || lower.includes('đánh đổi')) {
    return {
      scene: 'balance_scale',
      camera: 'orbit_scale',
      receipt: extractShortReceipt(text, isBioCta)
    };
  }

  if (lower.includes('thời gian') || lower.includes('bánh răng') || lower.includes('tuổi trẻ') || lower.includes('năm tháng')) {
    return {
      scene: 'time_gears',
      camera: 'orbit_gears',
      receipt: extractShortReceipt(text, isBioCta)
    };
  }

  if (lower.includes('két sắt') || lower.includes('dự phòng') || lower.includes('bảo vệ') || lower.includes('tích lũy')) {
    return {
      scene: 'vault_safe',
      camera: 'orbit_vault',
      receipt: extractShortReceipt(text, isBioCta)
    };
  }

  if (lower.includes('rò rỉ') || lower.includes('vô hình') || lower.includes('gặm nhấm') || lower.includes('trà sữa') || lower.includes('săn sale')) {
    const camOptions = ['under_pipe_leak', 'low_angle_red_leaks', 'pan_red_leaks', 'closeup_red_blades'];
    const sceneOptions = ['leak_closeup', 'leak_particles_heavy', 'leak_cutters'];
    return {
      scene: sceneOptions[index % sceneOptions.length],
      camera: camOptions[index % camOptions.length],
      receipt: extractShortReceipt(text, isBioCta)
    };
  }

  if (index === 0 || (lower.includes('cuối tháng') && lower.includes('tài khoản'))) {
    return {
      scene: 'tank_intro',
      camera: 'orbit_tank_close',
      receipt: ''
    };
  }

  if (index === 1 && total > 4) {
    return {
      scene: 'tank_to_pipe',
      camera: 'pan_tank_to_pipe',
      receipt: extractShortReceipt(text, isBioCta)
    };
  }

  // Default flowing pipe scenes with varied camera angles
  const pipeCameras = [
    'track_pipe_forward',
    'track_pipe_wide',
    'track_pipe_medium',
    'track_pipe_reverse',
    'closeup_pipe_rings',
    'closeup_tumbling_coins'
  ];
  return {
    scene: index % 2 === 0 ? 'pipe_flow' : 'pipe_flow_leaks',
    camera: pipeCameras[index % pipeCameras.length],
    receipt: extractShortReceipt(text, isBioCta)
  };
}

/**
 * Extract a punchy 3-5 word phrase for the top-left RECEIPT card.
 */
function extractShortReceipt(text, isBioCta) {
  if (isBioCta) return 'Link ở Bio ↓';
  const cleaned = text
    .replace(/[!?.…:;"]/g, '')
    .trim();
  const clauses = cleaned.split(',').map((s) => s.trim()).filter(Boolean);
  const target = clauses[0] || cleaned;
  const words = target.split(/\s+/);
  if (words.length <= 5) return target;
  return words.slice(0, 4).join(' ');
}

/**
 * Automatically convert any raw Vietnamese script into a complete 3D Storyboard Project.
 */
async function autoDirectFromScript(rawScript, options = {}) {
  const title = options.title || 'TƯ DUY DÀI HẠN';
  const watermark = options.watermark !== undefined ? options.watermark : '';
  const voice = options.voice || 'vi-VN-NamMinhNeural';
  const rate = options.rate || '+8%';

  // Split script by lines or sentences
  const rawLines = rawScript
    .split(/\r?\n|(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const segments = [];
  for (let i = 0; i < rawLines.length; i++) {
    const vi = rawLines[i];
    const meta = classifySegmentMetaphor(vi, i, rawLines.length);
    const en = await translateViToEn(vi);
    segments.push({
      vi,
      en: en || '',
      receipt: meta.receipt || '',
      disclaimer: meta.disclaimer || '',
      scene: meta.scene,
      camera: meta.camera
    });
  }

  return {
    id: 'custom-' + Date.now(),
    name: title,
    title,
    watermark,
    voice,
    rate,
    pitch: '+0Hz',
    outroDuration: 3.5,
    outroScene: 'tank_outro',
    outroCamera: 'final_tank_zoom',
    segments
  };
}

module.exports = {
  PRESETS,
  autoDirectFromScript,
  translateViToEn
};

