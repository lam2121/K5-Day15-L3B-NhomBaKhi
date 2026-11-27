/* Synthetic mock admin API for the CramAI admin UI. Loaded only with ?mock=1.
   Slot titles, file names, page counts and excerpts are SYNTHETIC demo data.
   Shapes follow specs/003-cramai-exams/contracts/openapi.json.
   Fixed cases: slide 07 has no source yet; slide 03 has a draft waiting;
   a file whose name contains "scan" fails as invalid_document. */
(function () {
  'use strict';

  var TITLES = [
    'Nền tảng AI và LLM', 'Discovery và đóng khung vấn đề', 'Tư duy sản phẩm AI và yêu cầu',
    'Prompt engineering và tool calling', 'ReAct và vòng lặp agent', 'Data engineering: thu thập và lưu trữ',
    'Bài giảng ngày 7', 'Bài giảng ngày 8', 'Bài giảng ngày 9', 'Bài giảng ngày 10',
    'Guardrails và an toàn AI', 'Vòng đời phát triển AI', 'Monitoring, logging và observability', 'Triển khai và benchmark agent'
  ];
  var EXCERPTS = [
    'Mô hình ngôn ngữ dự đoán token tiếp theo dựa trên toàn bộ ngữ cảnh đã có trong cửa sổ.',
    'Một guardrail đầu vào kiểm tra yêu cầu trước khi gọi mô hình và trả lời từ chối khi yêu cầu nằm ngoài phạm vi.',
    'Lưu dữ liệu thô tách khỏi dữ liệu đã làm sạch để có thể chạy lại quy trình khi thay đổi cách xử lý.'
  ];

  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, function () { return (Math.random() * 16 | 0).toString(16); });
  }
  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function revision(n, files) {
    var docs = files.map(function (f, i) { return { file_name: f, page_count: 18 + ((n * 7 + i * 5) % 30) }; });
    return { revision_id: uuid(), documents: docs, passage_count: docs.reduce(function (s, d) { return s + Math.round(d.page_count * 0.8); }, 0) };
  }

  var slots = [];
  for (var n = 1; n <= 14; n++) {
    var pub = n === 7 ? null : revision(n, ['day' + pad2(n) + '-lecture-slides.pdf']);
    slots.push({ slide_number: n, title: TITLES[n - 1], draft: pub, published: pub });
  }
  slots[2].draft = revision(3, ['day03-product-thinking-v2.pdf', 'day03-requirements-workshop.pdf']);

  function detail(slot) {
    var preview = [];
    var hasNew = slot.draft && (!slot.published || slot.draft.revision_id !== slot.published.revision_id);
    if (hasNew) {
      slot.draft.documents.slice(0, 3).forEach(function (d, i) {
        var page = 3 + i * 6;
        preview.push({
          citation: { slide_number: slot.slide_number, source_id: 'day' + pad2(slot.slide_number) + '-d' + pad2(i + 1) + '-p' + ('00' + page).slice(-3) + '-s01', file_name: d.file_name, page: page },
          text: EXCERPTS[i % EXCERPTS.length]
        });
      });
      if (preview.length < 3 && slot.draft.documents.length) {
        var d0 = slot.draft.documents[0];
        preview.push({ citation: { slide_number: slot.slide_number, source_id: 'day' + pad2(slot.slide_number) + '-d01-p012-s02', file_name: d0.file_name, page: 12 }, text: EXCERPTS[2] });
      }
    }
    return { slot: slot, draft_preview: preview };
  }

  function fail(status, code) { return { status: status, code: code, message: '', requestId: uuid() }; }

  function handle(method, path, body) {
    var m;
    if (method === 'GET' && path === '/admin/slides') return { slides: slots };
    if (method === 'GET' && (m = path.match(/^\/admin\/slides\/(\d+)$/))) return detail(slots[Number(m[1]) - 1]);
    if (method === 'PUT' && (m = path.match(/^\/admin\/slides\/(\d+)\/draft$/))) {
      var slot = slots[Number(m[1]) - 1];
      var files = body || [];
      if (files.some(function (f) { return !/\.pdf$/i.test(f.name); })) throw fail(415, 'unsupported_file');
      if (files.some(function (f) { return /scan/i.test(f.name); })) throw fail(422, 'invalid_document');
      slot.draft = revision(slot.slide_number, files.map(function (f) { return f.name; }));
      return detail(slot);
    }
    if (method === 'POST' && (m = path.match(/^\/admin\/slides\/(\d+)\/publish$/))) {
      var s = slots[Number(m[1]) - 1];
      if (!s.draft || s.draft.revision_id !== body.revision_id) throw fail(409, 'stale_draft');
      s.published = s.draft;
      return detail(s);
    }
    throw fail(404, 'internal_error');
  }

  window.CramAdminMock = {
    request: function (method, path, body) {
      return new Promise(function (resolve, reject) {
        window.setTimeout(function () {
          try { resolve(JSON.parse(JSON.stringify(handle(method, path, body)))); } catch (e) { reject(e); }
        }, method === 'PUT' ? 900 : 300);
      });
    }
  };
})();
