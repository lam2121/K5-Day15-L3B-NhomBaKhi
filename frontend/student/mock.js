/* Synthetic mock API for the CramAI student UI. Loaded only with ?mock=1.
   Every question, option and citation here is SYNTHETIC demo data written for
   UI testing; it is not generated from the course slides and must not be used
   as study material. Shapes follow specs/003-cramai-exams/contracts/openapi.json.

   Scenarios (add to the URL):
     ?mock=1                 slide 07 unpublished, so the midterm is unavailable
     ?mock=1&scenario=full   all 14 slides published
   Fixed cases: slide 14 returns insufficient_evidence; slide 13 returns busy (429)
   on the first try; a 'short' scenario (?mock=1&scenario=short) makes attempts
   expire after 45 seconds. */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var scenario = params.get('scenario') || 'partial';
  var DELAY = 700;

  var TITLES = [
    'Nền tảng AI và LLM',
    'Discovery và đóng khung vấn đề',
    'Tư duy sản phẩm AI và yêu cầu',
    'Prompt engineering và tool calling',
    'ReAct và vòng lặp agent',
    'Data engineering: thu thập và lưu trữ',
    'Bài giảng ngày 7',
    'Bài giảng ngày 8',
    'Bài giảng ngày 9',
    'Bài giảng ngày 10',
    'Guardrails và an toàn AI',
    'Vòng đời phát triển AI',
    'Monitoring, logging và observability',
    'Triển khai và benchmark agent'
  ];

  // Synthetic question bank, reused across slides.
  var BANK = [
    ['Mô hình ngôn ngữ lớn sinh văn bản theo cách nào?', ['Dự đoán token tiếp theo dựa trên ngữ cảnh', 'Tra cứu câu trả lời có sẵn trong cơ sở dữ liệu', 'Ghép ngẫu nhiên các câu trong tài liệu huấn luyện', 'Chạy luật if-else do lập trình viên viết'], 'a'],
    ['Khi nào nên yêu cầu mô hình trả về JSON theo schema?', ['Khi câu trả lời cần dài và giàu cảm xúc', 'Khi kết quả được một chương trình khác đọc tiếp', 'Khi muốn giảm số token đầu vào', 'Khi người dùng hỏi bằng tiếng Việt'], 'b'],
    ['Trong vòng lặp ReAct, bước "Observation" chứa gì?', ['Kế hoạch dài hạn của agent', 'Prompt hệ thống ban đầu', 'Kết quả trả về từ công cụ vừa gọi', 'Câu trả lời cuối cho người dùng'], 'c'],
    ['Guardrail đầu vào thường dùng để làm gì?', ['Tăng tốc độ sinh token', 'Chặn yêu cầu ngoài phạm vi hoặc nguy hiểm trước khi gọi mô hình', 'Nén lịch sử hội thoại', 'Tự động chấm điểm câu trả lời'], 'b'],
    ['Chỉ số nào cho biết độ trễ mà phần lớn người dùng gặp phải?', ['Độ trễ trung bình', 'Độ trễ nhỏ nhất', 'Phân vị p95 của độ trễ', 'Tổng số request mỗi ngày'], 'c'],
    ['Vì sao cần giữ nguyên bộ câu thử giữa hai lượt đánh giá?', ['Để so sánh hai lượt một cách công bằng', 'Để giảm chi phí gọi API', 'Để mô hình học thuộc câu thử', 'Để chạy nhanh hơn'], 'a'],
    ['Discovery trong phát triển sản phẩm AI nhằm mục đích gì?', ['Chọn mô hình lớn nhất có thể', 'Kiểm chứng vấn đề có thật với người dùng trước khi xây', 'Viết toàn bộ mã nguồn trước', 'Thiết kế logo'], 'b'],
    ['Lưu dữ liệu thô trước khi làm sạch giúp ích gì?', ['Không cần làm sạch nữa', 'Giảm dung lượng lưu trữ', 'Chạy lại được quy trình xử lý khi thay đổi cách làm sạch', 'Tăng độ chính xác của mô hình'], 'c']
  ];

  var FILES = [
    'day01-ai-llm-foundation.pdf', 'ngay-02-discovery-problem-framing.pdf', 'ai-product-thinking-requirements.pdf',
    'day04-prompt-engineering-tool-calling-v2.pdf', 'day04-react-agent-loop.pdf', 'day06-data-engineering-ingestion-storage.pdf',
    'day07-lecture-slides.pdf', 'day08-lecture-slides.pdf', 'day09-lecture-slide.pdf', 'k5-day10-slide.pdf',
    'day11-guardrails-ai-safety.pdf', 'n12-ai-sdlc.pdf', 'day13-monitoring-logging-observability-v2.pdf', 'day14-deployment-benchmarking.pdf'
  ];

  var attempts = {};
  var busyOnce = {};

  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, function () { return (Math.random() * 16 | 0).toString(16); });
  }
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function available(n) { return scenario === 'full' || n !== 7; }

  function catalog() {
    var exams = [];
    for (var n = 1; n <= 14; n++) {
      exams.push({
        exam_id: 'slide-' + pad2(n), title: TITLES[n - 1], slide_number: n,
        available: available(n), reason: available(n) ? null : 'Nhóm chưa xuất bản slide của bộ này.', question_count: 5
      });
    }
    var all = exams.every(function (e) { return e.available; });
    exams.push({
      exam_id: 'midterm', title: 'Đề giữa kỳ', slide_number: null, available: all,
      reason: all ? null : 'Cần đủ 14 bộ slide đã xuất bản. Slide 07 chưa xuất bản.', question_count: 14
    });
    return { exams: exams };
  }

  function citation(slide, k) {
    var page = 3 + ((slide * 7 + k * 5) % 24);
    return {
      slide_number: slide,
      source_id: 'day' + pad2(slide) + '-d01-p' + ('00' + page).slice(-3) + '-s' + pad2(1 + (k % 4)),
      file_name: FILES[slide - 1],
      page: page
    };
  }

  function makeAttempt(examId) {
    var isMid = examId === 'midterm';
    var count = isMid ? 14 : 5;
    var slide = isMid ? 0 : Number(examId.slice(-2));
    var questions = [];
    var key = {};
    for (var i = 0; i < count; i++) {
      var b = BANK[(slide + i * 3) % BANK.length];
      var qid = 'q' + pad2(i + 1);
      questions.push({
        question_id: qid,
        prompt: b[0],
        options: ['a', 'b', 'c', 'd'].map(function (id, j) { return { option_id: id, text: b[1][j] }; })
      });
      key[qid] = { correct: b[2], citations: [citation(isMid ? i + 1 : slide, i)] };
    }
    var ttl = scenario === 'short' ? 45 * 1000 : 60 * 60 * 1000;
    var attempt = {
      request_id: uuid(), mode: 'fake', attempt_id: uuid(), exam_id: examId,
      expires_at: new Date(Date.now() + ttl).toISOString(), questions: questions
    };
    attempts[attempt.attempt_id] = { attempt: attempt, key: key, submitted: null };
    try { window.sessionStorage.setItem('cramai.mock.' + attempt.attempt_id, JSON.stringify(attempts[attempt.attempt_id])); } catch (e) { /* ok */ }
    return attempt;
  }

  function findAttempt(id) {
    if (attempts[id]) return attempts[id];
    try {
      var raw = window.sessionStorage.getItem('cramai.mock.' + id);
      if (raw) { attempts[id] = JSON.parse(raw); return attempts[id]; }
    } catch (e) { /* ok */ }
    return null;
  }

  function fail(status, code, message) {
    var err = { status: status, code: code, message: message, requestId: uuid() };
    return err;
  }

  function handle(method, path, body) {
    if (method === 'GET' && path === '/catalog') return catalog();
    if (method === 'POST' && path === '/attempts') {
      var examId = body && body.exam_id;
      var exam = catalog().exams.filter(function (e) { return e.exam_id === examId; })[0];
      if (!exam) throw fail(400, 'invalid_input', 'exam_id không hợp lệ');
      if (!exam.available) throw fail(409, 'exam_unavailable', 'Đề chưa sẵn sàng');
      if (examId === 'slide-14') throw fail(422, 'insufficient_evidence', 'Không đủ đoạn có căn cứ');
      if (examId === 'slide-13' && !busyOnce[examId]) { busyOnce[examId] = true; throw fail(429, 'busy', 'Quá nhiều yêu cầu'); }
      return makeAttempt(examId);
    }
    if (method === 'POST' && path === '/submissions') {
      var record = findAttempt(body && body.attempt_id);
      if (!record) throw fail(404, 'quiz_unavailable', 'Không tìm thấy lượt làm bài');
      if (Date.parse(record.attempt.expires_at) <= Date.now() && !record.submitted) throw fail(404, 'quiz_unavailable', 'Lượt đã hết hạn');
      var sig = JSON.stringify(body.answers);
      if (record.submitted) {
        if (record.submitted.sig === sig) return record.submitted.result;
        throw fail(409, 'already_submitted', 'Đã nộp với bộ đáp án khác');
      }
      if (!Array.isArray(body.answers) || body.answers.length !== record.attempt.questions.length) throw fail(422, 'invalid_answers', 'Thiếu đáp án');
      var correct = 0;
      var items = body.answers.map(function (a) {
        var k = record.key[a.question_id];
        var ok = k.correct === a.option_id;
        if (ok) correct++;
        return { question_id: a.question_id, selected_option_id: a.option_id, correct_option_id: k.correct, is_correct: ok, citations: k.citations };
      });
      var total = record.attempt.questions.length;
      var result = {
        request_id: uuid(), attempt_id: record.attempt.attempt_id, correct_count: correct,
        total_questions: total, score_percent: Math.round((correct / total) * 1000) / 10, items: items
      };
      record.submitted = { sig: sig, result: result };
      try { window.sessionStorage.setItem('cramai.mock.' + record.attempt.attempt_id, JSON.stringify(record)); } catch (e) { /* ok */ }
      return result;
    }
    throw fail(404, 'internal_error', 'Không có route mock');
  }

  window.CramMock = {
    request: function (method, path, body) {
      return new Promise(function (resolve, reject) {
        window.setTimeout(function () {
          try { resolve(JSON.parse(JSON.stringify(handle(method, path, body)))); }
          catch (err) { reject(err); }
        }, path === '/attempts' ? DELAY * 2 : DELAY / 2);
      });
    }
  };
})();
