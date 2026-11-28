/* Synthetic mock API for the student page, loaded only with ?mock=1.
   Every question, option and citation here is SYNTHETIC demo data written for
   UI testing; it is not generated from the course slides.

   Scenarios: ?mock=1 (slide 07 unpublished, midterm locked),
   ?mock=1&scenario=full (all 14 published), ?mock=1&scenario=short (attempts
   expire after 45 s). Slide 14 returns insufficient_evidence; slide 13 returns
   busy (429) on the first try. */
import { ApiError, pad2, type Body } from '../shared/api';
import type { AttemptResponse, CatalogExam, Citation, ExplanationResponse, SubmissionResponse } from '../shared/types';

const scenario = new URLSearchParams(window.location.search).get('scenario') || 'partial';
const DELAY = 700;

const TITLES = [
  'Nền tảng AI và LLM', 'Discovery và đóng khung vấn đề', 'Tư duy sản phẩm AI và yêu cầu',
  'Prompt engineering và tool calling', 'ReAct và vòng lặp agent', 'Data engineering: thu thập và lưu trữ',
  'Bài giảng ngày 7', 'Bài giảng ngày 8', 'Bài giảng ngày 9', 'Bài giảng ngày 10',
  'Guardrails và an toàn AI', 'Vòng đời phát triển AI', 'Monitoring, logging và observability', 'Triển khai và benchmark agent',
];

const BANK: [string, string[], string][] = [
  ['Mô hình ngôn ngữ lớn sinh văn bản theo cách nào?', ['Dự đoán token tiếp theo dựa trên ngữ cảnh', 'Tra cứu câu trả lời có sẵn trong cơ sở dữ liệu', 'Ghép ngẫu nhiên các câu trong tài liệu huấn luyện', 'Chạy luật if-else do lập trình viên viết'], 'a'],
  ['Khi nào nên yêu cầu mô hình trả về JSON theo schema?', ['Khi câu trả lời cần dài và giàu cảm xúc', 'Khi kết quả được một chương trình khác đọc tiếp', 'Khi muốn giảm số token đầu vào', 'Khi người dùng hỏi bằng tiếng Việt'], 'b'],
  ['Trong vòng lặp ReAct, bước "Observation" chứa gì?', ['Kế hoạch dài hạn của agent', 'Prompt hệ thống ban đầu', 'Kết quả trả về từ công cụ vừa gọi', 'Câu trả lời cuối cho người dùng'], 'c'],
  ['Guardrail đầu vào thường dùng để làm gì?', ['Tăng tốc độ sinh token', 'Chặn yêu cầu ngoài phạm vi hoặc nguy hiểm trước khi gọi mô hình', 'Nén lịch sử hội thoại', 'Tự động chấm điểm câu trả lời'], 'b'],
  ['Chỉ số nào cho biết độ trễ mà phần lớn người dùng gặp phải?', ['Độ trễ trung bình', 'Độ trễ nhỏ nhất', 'Phân vị p95 của độ trễ', 'Tổng số request mỗi ngày'], 'c'],
  ['Vì sao cần giữ nguyên bộ câu thử giữa hai lượt đánh giá?', ['Để so sánh hai lượt một cách công bằng', 'Để giảm chi phí gọi API', 'Để mô hình học thuộc câu thử', 'Để chạy nhanh hơn'], 'a'],
  ['Discovery trong phát triển sản phẩm AI nhằm mục đích gì?', ['Chọn mô hình lớn nhất có thể', 'Kiểm chứng vấn đề có thật với người dùng trước khi xây', 'Viết toàn bộ mã nguồn trước', 'Thiết kế logo'], 'b'],
  ['Lưu dữ liệu thô trước khi làm sạch giúp ích gì?', ['Không cần làm sạch nữa', 'Giảm dung lượng lưu trữ', 'Chạy lại được quy trình xử lý khi thay đổi cách làm sạch', 'Tăng độ chính xác của mô hình'], 'c'],
];

const FILES = [
  'day01-ai-llm-foundation.pdf', 'ngay-02-discovery-problem-framing.pdf', 'ai-product-thinking-requirements.pdf',
  'day04-prompt-engineering-tool-calling-v2.pdf', 'day04-react-agent-loop.pdf', 'day06-data-engineering-ingestion-storage.pdf',
  'day07-lecture-slides.pdf', 'day08-lecture-slides.pdf', 'day09-lecture-slide.pdf', 'k5-day10-slide.pdf',
  'day11-guardrails-ai-safety.pdf', 'n12-ai-sdlc.pdf', 'day13-monitoring-logging-observability-v2.pdf', 'day14-deployment-benchmarking.pdf',
];

interface MockRecord {
  attempt: AttemptResponse;
  key: Record<string, { correct: string; citations: Citation[] }>;
  submitted: { sig: string; result: SubmissionResponse } | null;
}

const attempts: Record<string, MockRecord> = {};
const busyOnce: Record<string, boolean> = {};
const uuid = () => crypto.randomUUID();
const available = (n: number) => scenario === 'full' || n !== 7;

function catalog(): { exams: CatalogExam[] } {
  const exams: CatalogExam[] = [];
  for (let n = 1; n <= 14; n++) {
    exams.push({
      exam_id: 'slide-' + pad2(n), title: TITLES[n - 1], slide_number: n, available: available(n),
      reason: available(n) ? null : 'Nhóm chưa xuất bản slide của bộ này.', question_count: 5,
    });
  }
  const all = exams.every((e) => e.available);
  exams.push({
    exam_id: 'midterm', title: 'Đề giữa kỳ', slide_number: null, available: all,
    reason: all ? null : 'Cần đủ 14 bộ slide đã xuất bản. Slide 07 chưa xuất bản.', question_count: 14,
  });
  return { exams };
}

function citation(slide: number, k: number): Citation {
  const page = 3 + ((slide * 7 + k * 5) % 24);
  return { slide_number: slide, source_id: `day${pad2(slide)}-d01-p${String(page).padStart(3, '0')}-s${pad2(1 + (k % 4))}`, file_name: FILES[slide - 1], page };
}

function makeAttempt(examId: string): AttemptResponse {
  const isMid = examId === 'midterm';
  const count = isMid ? 14 : 5;
  const slide = isMid ? 0 : Number(examId.slice(-2));
  const key: MockRecord['key'] = {};
  const questions = Array.from({ length: count }, (_, i) => {
    const b = BANK[(slide + i * 3) % BANK.length];
    const qid = 'q' + pad2(i + 1);
    key[qid] = { correct: b[2], citations: [citation(isMid ? i + 1 : slide, i)] };
    return { question_id: qid, prompt: b[0], options: ['a', 'b', 'c', 'd'].map((id, j) => ({ option_id: id, text: b[1][j] })) };
  });
  const ttl = scenario === 'short' ? 45_000 : 3_600_000;
  const attempt: AttemptResponse = {
    request_id: uuid(), mode: 'fake', attempt_id: uuid(), exam_id: examId,
    expires_at: new Date(Date.now() + ttl).toISOString(), questions,
  };
  attempts[attempt.attempt_id] = { attempt, key, submitted: null };
  persist(attempts[attempt.attempt_id]);
  return attempt;
}

function persist(record: MockRecord) {
  try {
    sessionStorage.setItem('cramai.mock.' + record.attempt.attempt_id, JSON.stringify(record));
  } catch {
    /* storage unavailable */
  }
}

function findAttempt(id: string): MockRecord | null {
  if (attempts[id]) return attempts[id];
  try {
    const raw = sessionStorage.getItem('cramai.mock.' + id);
    if (raw) return (attempts[id] = JSON.parse(raw));
  } catch {
    /* storage unavailable */
  }
  return null;
}

const fail = (status: number, code: string, message: string) => new ApiError(status, code, message, uuid());

function handle(method: string, path: string, body?: Body): unknown {
  if (method === 'GET' && path === '/catalog') return catalog();
  if (method === 'POST' && path === '/attempts') {
    const examId = (body as { exam_id?: string })?.exam_id ?? '';
    const exam = catalog().exams.find((e) => e.exam_id === examId);
    if (!exam) throw fail(400, 'invalid_input', 'exam_id không hợp lệ');
    if (!exam.available) throw fail(409, 'exam_unavailable', 'Đề chưa sẵn sàng');
    if (examId === 'slide-14') throw fail(422, 'insufficient_evidence', 'Không đủ đoạn có căn cứ');
    if (examId === 'slide-13' && !busyOnce[examId]) {
      busyOnce[examId] = true;
      throw fail(429, 'busy', 'Quá nhiều yêu cầu');
    }
    return makeAttempt(examId);
  }
  if (method === 'POST' && path === '/submissions') {
    const req = body as { attempt_id: string; answers: { question_id: string; option_id: string }[] };
    const record = findAttempt(req?.attempt_id);
    if (!record) throw fail(404, 'quiz_unavailable', 'Không tìm thấy lượt làm bài');
    if (Date.parse(record.attempt.expires_at) <= Date.now() && !record.submitted) throw fail(404, 'quiz_unavailable', 'Lượt đã hết hạn');
    const sig = JSON.stringify(req.answers);
    if (record.submitted) {
      if (record.submitted.sig === sig) return record.submitted.result;
      throw fail(409, 'already_submitted', 'Đã nộp với bộ đáp án khác');
    }
    if (!Array.isArray(req.answers) || req.answers.length !== record.attempt.questions.length) throw fail(422, 'invalid_answers', 'Thiếu đáp án');
    let correct = 0;
    const items = req.answers.map((a) => {
      const k = record.key[a.question_id];
      const ok = k.correct === a.option_id;
      if (ok) correct++;
      return { question_id: a.question_id, selected_option_id: a.option_id, correct_option_id: k.correct, is_correct: ok, citations: k.citations };
    });
    const total = record.attempt.questions.length;
    const result: SubmissionResponse = {
      request_id: uuid(), attempt_id: record.attempt.attempt_id, correct_count: correct,
      total_questions: total, score_percent: Math.round((correct / total) * 1000) / 10, items,
    };
    record.submitted = { sig, result };
    persist(record);
    return result;
  }
  const checkRoute = path.match(/^\/attempts\/([^/]+)\/questions\/([^/]+)\/check$/);
  if (method === 'POST' && checkRoute) {
    const [, attemptId, questionId] = checkRoute;
    const req = body as { selected_option_id?: string };
    const record = findAttempt(attemptId);
    if (!record) throw fail(404, 'quiz_unavailable', 'Không tìm thấy lượt làm bài');
    if (Date.parse(record.attempt.expires_at) <= Date.now() && !record.submitted) throw fail(404, 'quiz_unavailable', 'Lượt đã hết hạn');
    const question = record.attempt.questions.find((item) => item.question_id === questionId);
    const correct = record.key[questionId];
    const selected = req?.selected_option_id;
    if (typeof selected !== 'string' || !question || !correct || !question.options.some((option) => option.option_id === selected)) {
      throw fail(422, 'invalid_input', 'Câu hỏi hoặc lựa chọn không hợp lệ');
    }
    return {
      request_id: uuid(),
      attempt_id: attemptId,
      question_id: questionId,
      selected_option_id: selected,
      correct_option_id: correct.correct,
      is_correct: correct.correct === selected,
    };
  }
  const explanationRoute = path.match(/^\/attempts\/([^/]+)\/questions\/([^/]+)\/explanation$/);
  if (method === 'POST' && explanationRoute) {
    const [, attemptId, questionId] = explanationRoute;
    const req = body as { selected_option_id?: string };
    const record = findAttempt(attemptId);
    if (!record) throw fail(404, 'quiz_unavailable', 'Không tìm thấy lượt làm bài');
    if (Date.parse(record.attempt.expires_at) <= Date.now() && !record.submitted) throw fail(404, 'quiz_unavailable', 'Lượt đã hết hạn');
    const question = record.attempt.questions.find((item) => item.question_id === questionId);
    const correct = record.key[questionId];
    const selected = req?.selected_option_id;
    if (typeof selected !== 'string' || !question || !correct || !question.options.some((option) => option.option_id === selected)) {
      throw fail(422, 'invalid_input', 'Câu hỏi hoặc lựa chọn không hợp lệ');
    }
    const source = correct.citations[0];
    const correctText = question.options.find((option) => option.option_id === correct.correct)?.text ?? '';
    const selectedText = question.options.find((option) => option.option_id === selected)?.text ?? '';
    const result: ExplanationResponse = {
      request_id: uuid(),
      attempt_id: attemptId,
      question_id: questionId,
      selected_option_id: selected,
      correct_option_id: correct.correct,
      explanation: selected === correct.correct
        ? `Bạn chọn đúng. ${correctText} là phương án phù hợp với nội dung của trang nguồn.`
        : `Bạn chọn “${selectedText}”. Đáp án đúng là “${correctText}”, vì nội dung trang nguồn xác nhận phương án này.`,
      source_pages: [{
        ...source,
        text: `Nội dung trích xuất mô phỏng từ ${source.file_name}, trang ${source.page}. Dữ liệu trong chế độ demo là giả lập, không phải nội dung slide thật.`,
        image_url: null,
        text_is_complete: false,
      }],
    };
    return result;
  }
  throw fail(404, 'internal_error', 'Không có route mock');
}

export function mockRequest(method: string, path: string, body?: Body): Promise<unknown> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(JSON.parse(JSON.stringify(handle(method, path, body))));
      } catch (err) {
        reject(err);
      }
    }, path === '/attempts' ? DELAY * 2 : DELAY / 2);
  });
}
