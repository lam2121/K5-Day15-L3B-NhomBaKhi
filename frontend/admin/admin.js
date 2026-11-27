/* CramAI admin UI (feature 003, T006).
   Same-origin API /api/v1/admin/* per specs/003-cramai-exams/contracts/openapi.json.
   The backend guards this page and the admin API with HTTP Basic; this file never
   holds credentials. Add ?mock=1 to run against synthetic data in mock.js.
   Text from PDFs and the API is inserted as text nodes only. */
(function () {
  'use strict';

  var API_BASE = '/api/v1';
  var MAX_FILES = 5;
  var MAX_FILE_BYTES = 10 * 1024 * 1024;
  var MAX_TOTAL_BYTES = 25 * 1024 * 1024;
  var MOCK = new URLSearchParams(window.location.search).has('mock');

  var $slots = document.getElementById('slots');
  var $detail = document.getElementById('detail');
  var $announcer = document.getElementById('announcer');

  var state = { slots: [], selected: null, detail: null, flash: null, confirming: false, busy: false };

  /* ---------- helpers ---------- */

  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (key) {
      var v = attrs[key];
      if (v === null || v === undefined || v === false) return;
      if (key === 'class') node.className = v;
      else if (key === 'text') node.textContent = v;
      else if (key.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(key.slice(2), v);
      else if (v === true) node.setAttribute(key, '');
      else node.setAttribute(key, String(v));
    });
    for (var i = 2; i < arguments.length; i++) add(node, arguments[i]);
    return node;
  }
  function add(node, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { add(node, x); }); return; }
    node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function shortId(id) { return id ? id.slice(0, 8) : ''; }
  function mb(bytes) { return (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB'; }
  function announce(t) { $announcer.textContent = ''; window.setTimeout(function () { $announcer.textContent = t; }, 30); }

  var ICONS = {
    alert: 'M12 8v5m0 3.5v.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
    check: 'm5 12.5 4.5 4.5L19 7.5',
    upload: 'M12 16V4m-5 5 5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
    publish: 'M5 12l4 4 10-10M5 20h14',
    refresh: 'M20 11a8 8 0 0 0-14.9-3.9M4 4v4h4m-4 5a8 8 0 0 0 14.9 3.9M20 20v-4h-4'
  };
  function icon(name) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(ns, 'path'); p.setAttribute('d', ICONS[name]); svg.appendChild(p);
    return svg;
  }

  /* ---------- API ---------- */

  function request(method, path, body, isForm) {
    if (MOCK && window.CramAdminMock) return window.CramAdminMock.request(method, path, body);
    var init = { method: method, headers: { Accept: 'application/json' }, credentials: 'same-origin' };
    if (body !== undefined) {
      if (isForm) init.body = body;
      else { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(body); }
    }
    return window.fetch(API_BASE + path, init).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        if (res.ok) return data;
        var err = data && data.error ? data.error : {};
        throw { status: res.status, code: err.code || (res.status === 413 ? 'too_large' : res.status === 401 ? 'unauthorized' : 'internal_error'), message: err.message || '', requestId: data && data.request_id };
      });
    }, function () { throw { status: 0, code: 'network', message: '' }; });
  }

  var ERRORS = {
    network: ['Không kết nối được máy chủ', 'Kiểm tra mạng rồi thử lại.'],
    unauthorized: ['Cần đăng nhập admin', 'Phiên đăng nhập đã hết hoặc sai tài khoản. Tải lại trang để nhập lại tài khoản admin.'],
    forbidden_origin: ['Yêu cầu bị chặn', 'Trang admin phải mở từ đúng địa chỉ của CramAI. Mở lại trang từ địa chỉ chính thức.'],
    unsupported_file: ['File không phải PDF', 'Chỉ nhận file PDF. Chọn lại file có đuôi .pdf.'],
    invalid_document: ['PDF không đọc được', 'File có thể bị mã hoá, hỏng, hoặc chỉ có ảnh scan không có lớp chữ. Xuất lại PDF có chữ chọn được rồi tải lên lại. Bản đã xuất bản không bị ảnh hưởng.'],
    too_large: ['File quá lớn', 'Mỗi file tối đa 10 MB, tổng tối đa 25 MB. Tách hoặc nén PDF rồi tải lên lại.'],
    stale_draft: ['Bản nháp đã thay đổi', 'Có người vừa tải bản nháp khác cho bộ này. Bản nháp mới đã được tải lại, hãy kiểm tra trước khi xuất bản.'],
    invalid_input: ['Yêu cầu không hợp lệ', 'Tải lại trang rồi thử lại.'],
    internal_error: ['Máy chủ gặp lỗi', 'Thử lại sau ít phút. Nếu vẫn lỗi, báo Lâm kèm mã yêu cầu.']
  };
  function errorNotice(err) {
    var copy = ERRORS[err && err.code] || ERRORS.internal_error;
    var body = copy[1] + (err && err.requestId ? ' Mã yêu cầu ' + err.requestId + '.' : '');
    return notice('error', copy[0], body);
  }
  function notice(kind, title, body) {
    return el('div', { class: 'notice notice-' + kind, role: kind === 'error' ? 'alert' : 'status' },
      icon(kind === 'success' ? 'check' : 'alert'),
      el('div', null, el('strong', { text: title }), body ? el('span', { text: body }) : null));
  }

  /* ---------- Slots table ---------- */

  function loadSlots() {
    clear($slots);
    $slots.appendChild(el('p', { class: 'cell-muted', text: 'Đang tải danh sách…' }));
    return request('GET', '/admin/slides').then(function (data) {
      state.slots = data.slides;
      drawSlots();
    }, function (err) {
      clear($slots);
      $slots.appendChild(errorNotice(err));
      $slots.appendChild(el('button', { class: 'btn btn-secondary', type: 'button', onclick: loadSlots }, icon('refresh'), 'Tải lại'));
    });
  }

  function slotState(slot) {
    if (slot.draft && (!slot.published || slot.draft.revision_id !== slot.published.revision_id)) return ['state-draft', 'Chờ xuất bản'];
    if (slot.published) return ['state-live', 'Đã xuất bản'];
    return ['state-none', 'Chưa có nguồn'];
  }

  function drawSlots() {
    clear($slots);
    var body = el('tbody');
    state.slots.forEach(function (slot) {
      var st = slotState(slot);
      var open = function () { select(slot.slide_number); };
      var row = el('tr', { class: state.selected === slot.slide_number ? 'is-selected' : '', onclick: open },
        el('th', { scope: 'row' },
          el('span', { class: 'slot-cell' },
            el('span', { class: 'mini-frame' + (slot.published ? '' : ' is-empty'), 'aria-hidden': 'true', text: pad2(slot.slide_number) }),
            el('span', { class: 'slot-name' },
              el('button', { class: 'row-link', type: 'button', 'aria-label': 'Mở Slide ' + pad2(slot.slide_number) + ', ' + slot.title, onclick: function (e) { e.stopPropagation(); open(); } }, slot.title)))),
        el('td', null, el('span', { class: 'state ' + st[0] }, el('span', { class: 'dot', 'aria-hidden': 'true' }), st[1])),
        el('td', { class: 'cell-muted col-passages', text: slot.published ? slot.published.passage_count + ' đoạn' : '—' }),
        el('td', { class: 'cell-muted col-draft', text: slot.draft ? slot.draft.passage_count + ' đoạn' : '—' })
      );
      body.appendChild(row);
    });
    var published = state.slots.filter(function (s) { return s.published; }).length;
    $slots.appendChild(el('table', null,
      el('caption', { class: 'sr-only', text: published + ' trên 14 bộ đã xuất bản' }),
      el('thead', null, el('tr', null,
        el('th', { scope: 'col', text: 'Bộ slide' }),
        el('th', { scope: 'col', text: 'Trạng thái' }),
        el('th', { scope: 'col', class: 'col-passages', text: 'Đang dùng' }),
        el('th', { scope: 'col', class: 'col-draft', text: 'Bản nháp' }))),
      body));
    $slots.appendChild(el('p', { class: 'cell-muted', style: 'margin-top: var(--space-3)', text: published + '/14 bộ đã xuất bản. Đề giữa kỳ mở khi đủ 14 bộ.' }));
  }

  /* ---------- Detail ---------- */

  function drawEmptyDetail() {
    clear($detail);
    $detail.appendChild(el('div', { class: 'empty-detail' },
      el('div', null,
        el('h2', { id: 'detail-title', class: 'sr-only', text: 'Chi tiết bộ slide' }),
        el('p', { text: 'Chọn một bộ slide trong bảng để tải PDF, xem bản nháp và xuất bản.' }))));
  }

  function select(n) {
    state.selected = n;
    state.flash = null;
    state.confirming = false;
    drawSlots();
    clear($detail);
    $detail.appendChild(el('p', { class: 'cell-muted', text: 'Đang tải Slide ' + pad2(n) + '…' }));
    request('GET', '/admin/slides/' + n).then(function (detail) {
      state.detail = detail;
      drawDetail(true);
    }, function (err) {
      clear($detail);
      $detail.appendChild(errorNotice(err));
    });
  }

  function revisionFacts(rev) {
    return el('dl', { class: 'facts' },
      el('dt', { text: 'Phiên bản' }), el('dd', { text: shortId(rev.revision_id) }),
      el('dt', { text: 'Số file' }), el('dd', { text: String(rev.documents.length) }),
      el('dt', { text: 'Số đoạn' }), el('dd', { text: String(rev.passage_count) }));
  }

  function docList(rev) {
    return el('ul', { class: 'docs' }, rev.documents.map(function (d) {
      return el('li', null, el('span', { class: 'name', text: d.file_name }), el('span', { class: 'cell-muted', text: d.page_count + ' trang' }));
    }));
  }

  function drawDetail(moveFocus) {
    var d = state.detail;
    var slot = d.slot;
    var hasNewDraft = slot.draft && (!slot.published || slot.draft.revision_id !== slot.published.revision_id);
    clear($detail);

    if (state.flash) $detail.appendChild(state.flash);

    var title = el('h2', { id: 'detail-title', tabindex: '-1', text: 'Slide ' + pad2(slot.slide_number) + ' · ' + slot.title });
    $detail.appendChild(title);
    $detail.appendChild(el('p', { class: 'lead', text: slot.published ? 'Đang dùng để tạo đề.' : 'Chưa có nguồn nên học viên chưa chọn được bộ này.' }));

    if (slot.published) {
      $detail.appendChild(el('h3', { text: 'Bản đang xuất bản' }));
      $detail.appendChild(revisionFacts(slot.published));
      $detail.appendChild(docList(slot.published));
    }

    $detail.appendChild(el('h3', { text: hasNewDraft ? 'Bản nháp' : 'Tải bản nháp mới' }));
    $detail.appendChild(uploadForm(slot));

    if (hasNewDraft) {
      $detail.appendChild(el('h3', { text: 'Bản nháp chờ xuất bản' }));
      $detail.appendChild(revisionFacts(slot.draft));
      $detail.appendChild(docList(slot.draft));
      $detail.appendChild(el('h3', { text: 'Đoạn trích đại diện' }));
      if (d.draft_preview.length) {
        $detail.appendChild(el('ul', { class: 'preview' }, d.draft_preview.map(function (p) {
          return el('li', { class: 'excerpt' },
            el('span', { class: 'excerpt-frame', 'aria-hidden': 'true' }, pad2(p.citation.slide_number), el('span', { text: 'tr. ' + p.citation.page })),
            el('div', null,
              el('p', { text: p.text }),
              el('small', { text: p.citation.file_name + ', trang ' + p.citation.page + ' · ' + p.citation.source_id })));
        })));
      } else {
        $detail.appendChild(el('p', { class: 'cell-muted', text: 'Không có đoạn đại diện để xem trước.' }));
      }
      $detail.appendChild(publishZone(slot));
    }
    if (moveFocus) title.focus();
  }

  function uploadForm(slot) {
    var picked = el('ul', { class: 'picked', 'aria-live': 'polite' });
    var input = el('input', { type: 'file', id: 'pdf-input', name: 'files', class: 'sr-only', accept: 'application/pdf,.pdf', multiple: true, 'aria-describedby': 'pdf-hint' });
    var submit = el('button', { class: 'btn btn-primary', type: 'submit', disabled: true }, icon('upload'), 'Tải lên bản nháp');
    var zone = el('form', { class: 'upload' },
      el('p', { class: 'upload-title', text: 'PDF cho Slide ' + pad2(slot.slide_number) }),
      el('p', { class: 'hint', id: 'pdf-hint', text: 'Kéo file vào đây hoặc bấm Chọn file PDF. Tối đa 5 file có lớp chữ, mỗi file ≤ 10 MB, tổng ≤ 25 MB. Bản nháp mới thay bản nháp cũ; bản đang xuất bản giữ nguyên.' }),
      input,
      el('label', { class: 'btn btn-secondary file-btn', for: 'pdf-input' }, 'Chọn file PDF'),
      picked,
      el('div', { class: 'row' }, submit));

    function check() {
      var files = Array.prototype.slice.call(input.files || []);
      clear(picked);
      var problems = [];
      var total = 0;
      files.forEach(function (f) {
        total += f.size;
        var bad = null;
        if (!/\.pdf$/i.test(f.name) && f.type !== 'application/pdf') bad = 'không phải PDF';
        else if (f.size > MAX_FILE_BYTES) bad = 'quá 10 MB';
        if (bad) problems.push(f.name + ': ' + bad);
        picked.appendChild(el('li', null, el('span', { text: f.name }), el('span', { class: bad ? 'bad' : 'cell-muted', text: bad || mb(f.size) })));
      });
      if (files.length > MAX_FILES) problems.push('Chọn tối đa 5 file, đang chọn ' + files.length + '.');
      if (total > MAX_TOTAL_BYTES) problems.push('Tổng dung lượng ' + mb(total) + ', vượt 25 MB.');
      if (files.length > MAX_FILES || total > MAX_TOTAL_BYTES) picked.appendChild(el('li', { class: 'bad', text: problems[problems.length - 1] }));
      submit.disabled = !files.length || problems.length > 0 || state.busy;
      return problems;
    }
    input.addEventListener('change', check);

    ['dragenter', 'dragover'].forEach(function (t) { zone.addEventListener(t, function (e) { e.preventDefault(); zone.classList.add('is-over'); }); });
    ['dragleave', 'drop'].forEach(function (t) { zone.addEventListener(t, function () { zone.classList.remove('is-over'); }); });
    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files) { input.files = e.dataTransfer.files; check(); }
    });

    zone.addEventListener('submit', function (e) {
      e.preventDefault();
      if (check().length || !input.files.length) return;
      var form = new FormData();
      Array.prototype.forEach.call(input.files, function (f) { form.append('files', f, f.name); });
      state.busy = true;
      submit.disabled = true;
      clear(submit); add(submit, [icon('upload'), 'Đang kiểm tra PDF…']);
      request('PUT', '/admin/slides/' + slot.slide_number + '/draft', MOCK ? Array.prototype.slice.call(input.files) : form, true).then(function (detail) {
        state.busy = false;
        state.detail = detail;
        state.confirming = false;
        state.flash = notice('success', 'Đã tải bản nháp', detail.slot.draft.documents.length + ' file, ' + detail.slot.draft.passage_count + ' đoạn. Kiểm tra đoạn trích rồi xuất bản.');
        replaceSlot(detail.slot);
        drawDetail(false);
        announce('Đã tải bản nháp.');
      }, function (err) {
        state.busy = false;
        state.flash = errorNotice(err);
        drawDetail(false);
      });
    });
    return zone;
  }

  function publishZone(slot) {
    var zone = el('div', { class: 'publish-zone' });
    if (!state.confirming) {
      zone.appendChild(el('p', { text: slot.published
        ? 'Xuất bản sẽ thay phiên bản ' + shortId(slot.published.revision_id) + ' bằng bản nháp ' + shortId(slot.draft.revision_id) + '.'
        : 'Xuất bản để học viên chọn được Slide ' + pad2(slot.slide_number) + '.' }));
      zone.appendChild(el('button', { class: 'btn btn-secondary', type: 'button', onclick: function () { state.confirming = true; drawDetail(false); var b = document.getElementById('confirm-publish'); if (b) b.focus(); } }, icon('publish'), 'Xuất bản bản nháp…'));
      return zone;
    }
    zone.appendChild(el('div', { class: 'confirm', role: 'group', 'aria-labelledby': 'confirm-text' },
      el('p', { id: 'confirm-text', text: 'Xuất bản bản nháp ' + shortId(slot.draft.revision_id) + ' cho Slide ' + pad2(slot.slide_number) + '? Đề mới sẽ dùng nguồn này ngay. Bài học viên đang làm vẫn chấm theo bản cũ.' }),
      el('div', { class: 'row' },
        el('button', { class: 'btn btn-primary', type: 'button', id: 'confirm-publish', onclick: function (e) { publish(slot, e.currentTarget); } }, icon('publish'), 'Xuất bản'),
        el('button', { class: 'btn btn-quiet', type: 'button', onclick: function () { state.confirming = false; drawDetail(false); } }, 'Huỷ'))));
    return zone;
  }

  function publish(slot, button) {
    button.disabled = true;
    request('POST', '/admin/slides/' + slot.slide_number + '/publish', { revision_id: slot.draft.revision_id }).then(function (detail) {
      state.detail = detail;
      state.confirming = false;
      state.flash = notice('success', 'Đã xuất bản Slide ' + pad2(slot.slide_number), 'Phiên bản ' + shortId(detail.slot.published.revision_id) + ' đang được dùng để tạo đề.');
      replaceSlot(detail.slot);
      drawDetail(false);
      announce('Đã xuất bản.');
    }, function (err) {
      state.confirming = false;
      state.flash = errorNotice(err);
      if (err.code === 'stale_draft') { select(slot.slide_number); state.flash = errorNotice(err); return; }
      drawDetail(false);
    });
  }

  function replaceSlot(slot) {
    state.slots = state.slots.map(function (s) { return s.slide_number === slot.slide_number ? slot : s; });
    drawSlots();
  }

  /* ---------- boot ---------- */

  function boot() {
    drawEmptyDetail();
    loadSlots();
  }
  if (MOCK) {
    document.getElementById('mock-badge').hidden = false;
    var s = document.createElement('script');
    s.src = 'mock.js';
    s.onload = boot;
    s.onerror = function () { MOCK = false; boot(); };
    document.head.appendChild(s);
  } else {
    boot();
  }
})();
