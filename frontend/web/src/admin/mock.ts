/* Synthetic mock admin API, loaded only with ?mock=1.
   Slot titles, file names, page counts and excerpts are SYNTHETIC demo data.
   Fixed cases: slide 07 has no source yet; slide 03 has a draft waiting;
   a file whose name contains "scan" fails as invalid_document. */
import { ApiError, pad2, type Body } from '../shared/api';
import type { AdminDetail, AdminSlot, DraftPreview, RevisionSummary } from '../shared/types';

const TITLES = [
  'Nền tảng AI và LLM', 'Discovery và đóng khung vấn đề', 'Tư duy sản phẩm AI và yêu cầu',
  'Prompt engineering và tool calling', 'ReAct và vòng lặp agent', 'Data engineering: thu thập và lưu trữ',
  'Bài giảng ngày 7', 'Bài giảng ngày 8', 'Bài giảng ngày 9', 'Bài giảng ngày 10',
  'Guardrails và an toàn AI', 'Vòng đời phát triển AI', 'Monitoring, logging và observability', 'Triển khai và benchmark agent',
];
const EXCERPTS = [
  'Mô hình ngôn ngữ dự đoán token tiếp theo dựa trên toàn bộ ngữ cảnh đã có trong cửa sổ.',
  'Một guardrail đầu vào kiểm tra yêu cầu trước khi gọi mô hình và trả lời từ chối khi yêu cầu nằm ngoài phạm vi.',
  'Lưu dữ liệu thô tách khỏi dữ liệu đã làm sạch để có thể chạy lại quy trình khi thay đổi cách xử lý.',
];

const uuid = () => crypto.randomUUID();

function revision(n: number, files: string[]): RevisionSummary {
  const documents = files.map((f, i) => ({ file_name: f, page_count: 18 + ((n * 7 + i * 5) % 30) }));
  return { revision_id: uuid(), documents, passage_count: documents.reduce((s, d) => s + Math.round(d.page_count * 0.8), 0) };
}

const slots: AdminSlot[] = TITLES.map((title, i) => {
  const n = i + 1;
  const pub = n === 7 ? null : revision(n, [`day${pad2(n)}-lecture-slides.pdf`]);
  return { slide_number: n, title, draft: pub, published: pub };
});
slots[2].draft = revision(3, ['day03-product-thinking-v2.pdf', 'day03-requirements-workshop.pdf']);

function detail(slot: AdminSlot): AdminDetail {
  const preview: DraftPreview[] = [];
  const hasNew = slot.draft && (!slot.published || slot.draft.revision_id !== slot.published.revision_id);
  if (hasNew && slot.draft) {
    slot.draft.documents.slice(0, 3).forEach((d, i) => {
      const page = 3 + i * 6;
      preview.push({
        citation: { slide_number: slot.slide_number, source_id: `day${pad2(slot.slide_number)}-d${pad2(i + 1)}-p${String(page).padStart(3, '0')}-s01`, file_name: d.file_name, page },
        text: EXCERPTS[i % EXCERPTS.length],
      });
    });
    if (preview.length < 3 && slot.draft.documents.length) {
      const d0 = slot.draft.documents[0];
      preview.push({ citation: { slide_number: slot.slide_number, source_id: `day${pad2(slot.slide_number)}-d01-p012-s02`, file_name: d0.file_name, page: 12 }, text: EXCERPTS[2] });
    }
  }
  return { slot, draft_preview: preview };
}

const fail = (status: number, code: string) => new ApiError(status, code, '', uuid());

function handle(method: string, path: string, body?: Body): unknown {
  let m: RegExpMatchArray | null;
  if (method === 'GET' && path === '/admin/slides') return { slides: slots };
  if (method === 'GET' && (m = path.match(/^\/admin\/slides\/(\d+)$/))) return detail(slots[Number(m[1]) - 1]);
  if (method === 'PUT' && (m = path.match(/^\/admin\/slides\/(\d+)\/draft$/))) {
    const slot = slots[Number(m[1]) - 1];
    const files = (body as File[]) || [];
    if (files.some((f) => !/\.pdf$/i.test(f.name))) throw fail(415, 'unsupported_file');
    if (files.some((f) => /scan/i.test(f.name))) throw fail(422, 'invalid_document');
    slot.draft = revision(slot.slide_number, files.map((f) => f.name));
    return detail(slot);
  }
  if (method === 'POST' && (m = path.match(/^\/admin\/slides\/(\d+)\/publish$/))) {
    const s = slots[Number(m[1]) - 1];
    if (!s.draft || s.draft.revision_id !== (body as { revision_id: string }).revision_id) throw fail(409, 'stale_draft');
    s.published = s.draft;
    return detail(s);
  }
  throw fail(404, 'internal_error');
}

export function mockRequest(method: string, path: string, body?: Body): Promise<unknown> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(JSON.parse(JSON.stringify(handle(method, path, body))));
      } catch (err) {
        reject(err);
      }
    }, method === 'PUT' ? 900 : 300);
  });
}
