import type { AttemptResponse, CatalogExam, SubmissionResponse } from '../shared/types';
import { pad2 } from '../shared/api';

export const STORE_KEY = 'cramai.student.v1';

export interface Session {
  attempt: AttemptResponse;
  title: string;
  answers: Record<string, string>;
  current: number;
  result: SubmissionResponse | null;
  expired?: boolean;
  missing?: string[];
}

export function saveSession(session: Session | null) {
  try {
    if (session) sessionStorage.setItem(STORE_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(STORE_KEY);
  } catch {
    /* storage unavailable: the page still works for this view */
  }
}

export function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Session) : null;
    return parsed && parsed.attempt ? parsed : null;
  } catch {
    return null;
  }
}

export function examTitle(exam: CatalogExam) {
  return exam.exam_id === 'midterm' ? exam.title : `Slide ${pad2(exam.slide_number ?? 0)} · ${exam.title}`;
}

/** Rebuild a catalog entry when only the attempt is known (after a reload). */
export function examFromId(examId: string, catalog: CatalogExam[] | null): CatalogExam {
  const found = catalog?.find((e) => e.exam_id === examId);
  if (found) return found;
  const mid = examId === 'midterm';
  return {
    exam_id: examId,
    title: mid ? 'Đề giữa kỳ' : 'Slide ' + examId.slice(-2),
    slide_number: mid ? null : Number(examId.slice(-2)),
    available: true,
    reason: null,
    question_count: mid ? 14 : 5,
  };
}

export const ERRORS: Record<string, [string, string]> = {
  network: ['Không kết nối được máy chủ', 'Kiểm tra mạng rồi thử lại. Đáp án bạn đã chọn vẫn được giữ.'],
  invalid_input: ['Yêu cầu không hợp lệ', 'Tải lại trang rồi chọn đề từ thực đơn.'],
  exam_unavailable: ['Đề này chưa sẵn sàng', 'Slide của đề chưa được xuất bản. Chọn một bộ khác trong thực đơn.'],
  insufficient_evidence: ['Slide chưa đủ nội dung để ra đủ câu', 'CramAI chỉ ra câu có căn cứ trong slide, nên không tạo đề thiếu. Chọn một bộ khác hoặc thử lại sau khi slide được bổ sung.'],
  upstream_error: ['Mô hình AI không phản hồi', 'Đề chưa được tạo. Bấm Tạo lại đề khi bạn muốn thử lần nữa.'],
  busy: ['Đang có nhiều lượt tạo đề', 'Đợi khoảng một phút rồi bấm Tạo lại đề.'],
  invalid_answers: ['Đáp án gửi lên không khớp đề', 'Tải lại trang và kiểm tra mỗi câu đã có một lựa chọn.'],
  quiz_unavailable: ['Lượt làm bài không còn', 'Lượt này đã hết hạn hoặc không tồn tại. Tạo lượt mới để làm lại.'],
  already_submitted: ['Lượt này đã được nộp', 'Bài đã nộp với bộ đáp án khác. Tạo lượt mới nếu muốn làm lại.'],
  internal_error: ['Máy chủ gặp lỗi', 'Thử lại sau ít phút. Nếu vẫn lỗi, báo nhóm kèm mã yêu cầu bên dưới.'],
};

export const errorCopy = (code: string) => ERRORS[code] ?? ERRORS.internal_error;
export const RETRYABLE = new Set(['upstream_error', 'busy', 'network', 'internal_error']);
