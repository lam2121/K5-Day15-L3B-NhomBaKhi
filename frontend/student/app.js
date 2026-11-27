/* CramAI student UI (feature 003, T008).
   Talks to the same-origin API at /api/v1 (specs/003-cramai-exams/contracts/openapi.json).
   Add ?mock=1 to run against synthetic data in mock.js without a backend.
   All text from the API or the model is inserted as text nodes, never as HTML. */
(function () {
  'use strict';

  var API_BASE = '/api/v1';
  var STORE_KEY = 'cramai.student.v1';
  var params = new URLSearchParams(window.location.search);
  var MOCK = params.has('mock');

  var $main = document.getElementById('main');
  var $shellTitle = document.getElementById('shell-title');
  var $strip = document.getElementById('deck-strip');
  var $meta = document.getElementById('shell-meta');
  var $bar = document.getElementById('actionbar');
  var $announcer = document.getElementById('announcer');

  var state = {
    catalog: null,
    session: null,      // { attempt, title, answers: {qid: optionId}, current, result, confirming }
    timerId: null
  };

  /* ---------- DOM helpers ---------- */

  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value === null || value === undefined || value === false) return;
        if (key === 'class') node.className = value;
        else if (key === 'text') node.textContent = value;
        else if (key.slice(0, 2) === 'on' && typeof value === 'function') node.addEventListener(key.slice(2), value);
        else if (value === true) node.setAttribute(key, '');
        else node.setAttribute(key, String(value));
      });
    }
    for (var i = 2; i < arguments.length; i++) append(node, arguments[i]);
    return node;
  }

  function append(node, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(node, c); }); return; }
    node.appendChild(typeof child === 'string' || typeof child === 'number' ? document.createTextNode(String(child)) : child);
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  var ICONS = {
    clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    lock: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z',
    check: 'm5 12.5 4.5 4.5L19 7.5',
    cross: 'M6 6l12 12M18 6 6 18',
    alert: 'M12 8v5m0 3.5v.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
    info: 'M12 11v6m0-9.5v.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    arrowLeft: 'M19 12H5m6-6-6 6 6 6',
    arrowRight: 'M5 12h14m-6-6 6 6-6 6',
    refresh: 'M20 11a8 8 0 0 0-14.9-3.9M4 4v4h4m-4 5a8 8 0 0 0 14.9 3.9M20 20v-4h-4',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'
  };

  function icon(name) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', ICONS[name]);
    svg.appendChild(path);
    return svg;
  }

  function announce(text) {
    $announcer.textContent = '';
    window.setTimeout(function () { $announcer.textContent = text; }, 30);
  }

  function focusMain() {
    $main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function examLabel(examId) {
    if (examId === 'midterm') return 'Đề giữa kỳ';
    return 'Slide ' + examId.slice(-2);
  }

  /* ---------- Storage (per-tab convenience only) ---------- */

  function save() {
    try {
      if (state.session) window.sessionStorage.setItem(STORE_KEY, JSON.stringify(state.session));
      else window.sessionStorage.removeItem(STORE_KEY);
    } catch (e) { /* storage unavailable: the page still works for this view */ }
  }

  function load() {
    try {
      var raw = window.sessionStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  /* ---------- API ---------- */

  function ApiError(status, code, message, requestId) {
    this.status = status;
    this.code = code;
    this.message = message;
    this.requestId = requestId;
  }

  function request(method, path, body) {
    if (MOCK && window.CramMock) return window.CramMock.request(method, path, body);
    var init = { method: method, headers: { Accept: 'application/json' }, credentials: 'same-origin' };
    if (body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    return window.fetch(API_BASE + path, init).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        if (res.ok) return data;
        var err = data && data.error ? data.error : {};
        var code = err.code || (res.status === 429 ? 'busy' : res.status === 404 ? 'quiz_unavailable' : 'internal_error');
        throw new ApiError(res.status, code, err.message || '', data && data.request_id);
      });
    }, function () {
      throw new ApiError(0, 'network', '');
    });
  }

  var ERRORS = {
    network: ['Không kết nối được máy chủ', 'Kiểm tra mạng rồi thử lại. Đáp án bạn đã chọn vẫn được giữ.'],
    invalid_input: ['Yêu cầu không hợp lệ', 'Tải lại trang rồi chọn đề từ danh mục.'],
    exam_unavailable: ['Đề này chưa sẵn sàng', 'Slide của đề chưa được xuất bản. Chọn một bộ khác trong danh mục.'],
    insufficient_evidence: ['Slide chưa đủ nội dung để ra đủ câu', 'CramAI chỉ ra câu có căn cứ trong slide, nên không tạo đề thiếu. Chọn một bộ khác hoặc thử lại sau khi slide được bổ sung.'],
    upstream_error: ['Mô hình AI không phản hồi', 'Đề chưa được tạo. Bấm Tạo lại đề khi bạn muốn thử lần nữa.'],
    busy: ['Đang có nhiều lượt tạo đề', 'Đợi khoảng một phút rồi bấm Tạo lại đề.'],
    invalid_answers: ['Đáp án gửi lên không khớp đề', 'Tải lại trang và kiểm tra mỗi câu đã có một lựa chọn.'],
    quiz_unavailable: ['Lượt làm bài không còn', 'Lượt này đã hết hạn hoặc không tồn tại. Tạo lượt mới để làm lại.'],
    already_submitted: ['Lượt này đã được nộp', 'Bài đã nộp với bộ đáp án khác. Tạo lượt mới nếu muốn làm lại.'],
    internal_error: ['Máy chủ gặp lỗi', 'Thử lại sau ít phút. Nếu vẫn lỗi, báo nhóm kèm mã yêu cầu bên dưới.']
  };

  function errorCopy(err) {
    return ERRORS[err && err.code] || ERRORS.internal_error;
  }

  /* ---------- Shell ---------- */

  function setShell(title, meta) {
    $shellTitle.textContent = title || '';
    $meta.textContent = '';
    $meta.classList.remove('is-low');
    if (meta) append($meta, meta);
  }

  function hideStrip() { $strip.hidden = true; clear($strip); }

  function setBar(content) {
    clear($bar);
    if (!content) { $bar.hidden = true; return; }
    $bar.hidden = false;
    $bar.appendChild(el('div', { class: 'actionbar-inner' }, content));
  }

  function stopTimer() {
    if (state.timerId) { window.clearInterval(state.timerId); state.timerId = null; }
  }

  function startTimer() {
    stopTimer();
    var tick = function () {
      var session = state.session;
      if (!session || session.result) { stopTimer(); return; }
      var left = Math.round((Date.parse(session.attempt.expires_at) - Date.now()) / 1000);
      if (left <= 0) { stopTimer(); renderExpired(); return; }
      var minutes = Math.floor(left / 60);
      $meta.textContent = '';
      append($meta, [icon('clock'), 'còn ' + pad2(minutes) + ':' + pad2(left % 60)]);
      $meta.setAttribute('aria-label', 'Còn ' + minutes + ' phút');
      $meta.classList.toggle('is-low', left <= 300);
      if (left === 300) announce('Còn 5 phút.');
    };
    tick();
    state.timerId = window.setInterval(tick, 1000);
  }

  /* ---------- Catalog ---------- */

  function renderCatalog() {
    stopTimer();
    hideStrip();
    setShell('', null);
    setBar(null);
    clear($main);
    document.title = 'CramAI · Ôn đề từ slide';

    var head = el('div', { class: 'page-head' },
      el('h1', { text: 'Chọn bộ slide để ôn' }),
      el('p', { text: 'Mỗi bộ cho đề 5 câu trắc nghiệm do AI tạo từ slide đã duyệt. Đề giữa kỳ gom cả 14 bộ, mỗi bộ một câu. Đáp án và trang slide hiện sau khi nộp.' })
    );
    $main.appendChild(head);

    var saved = state.session;
    if (saved && !saved.result && !saved.expired && Date.parse(saved.attempt.expires_at) > Date.now()) {
      $main.appendChild(notice('info', 'Bạn đang làm dở ' + saved.title,
        'Các lựa chọn đã được giữ trong tab này.',
        [el('button', { class: 'btn btn-primary', type: 'button', onclick: function () { renderQuiz(); } }, 'Tiếp tục làm bài')]));
    }

    var holder = el('div', { 'aria-busy': 'true' }, el('p', { class: 'q-hint', text: 'Đang tải danh mục…' }));
    $main.appendChild(holder);

    request('GET', '/catalog').then(function (data) {
      state.catalog = data.exams;
      clear(holder);
      holder.removeAttribute('aria-busy');
      holder.appendChild(catalogView(data.exams));
    }, function (err) {
      clear(holder);
      holder.removeAttribute('aria-busy');
      holder.appendChild(errorNotice(err, [el('button', { class: 'btn btn-secondary', type: 'button', onclick: renderCatalog }, icon('refresh'), 'Tải lại danh mục')]));
    });

    $main.appendChild(el('p', { class: 'foot', text: 'Đề do AI tạo chỉ dùng để tự ôn, không phải điểm thi. Kiểm lại đáp án với tên file và số trang trước khi tin.' }));
  }

  function catalogView(exams) {
    var wrap = el('div');
    var slides = exams.filter(function (e) { return e.exam_id !== 'midterm'; });
    var midterm = exams.filter(function (e) { return e.exam_id === 'midterm'; })[0];

    var deck = el('ol', { class: 'deck', 'aria-label': '14 bộ slide' });
    slides.forEach(function (exam) {
      var number = pad2(exam.slide_number);
      var card = el('button', {
        class: 'slide-card', type: 'button', disabled: !exam.available,
        'aria-describedby': exam.available ? null : 'reason-' + exam.exam_id,
        onclick: function () { startAttempt(exam); }
      },
        el('span', { class: 'frame' },
          el('span', { class: 'frame-number', text: number }),
          el('span', { class: 'frame-corner', text: exam.question_count + ' câu' })
        ),
        el('span', { class: 'card-title', text: exam.title })
      );
      var item = el('li', null, card);
      if (!exam.available) {
        card.appendChild(el('span', { class: 'stamp' }, 'Chưa mở'));
        card.appendChild(el('span', { class: 'card-meta', id: 'reason-' + exam.exam_id, text: exam.reason || 'Chưa xuất bản.' }));
      }
      deck.appendChild(item);
    });
    wrap.appendChild(deck);

    if (midterm) {
      var mosaic = el('div', { class: 'midterm-mosaic', 'aria-hidden': 'true' });
      slides.forEach(function (exam) { mosaic.appendChild(el('i', { class: exam.available ? '' : 'is-off', text: pad2(exam.slide_number) })); });
      var action = midterm.available
        ? el('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: function () { startAttempt(midterm); } }, 'Làm đề giữa kỳ')
        : el('span', { class: 'stamp' }, 'Chưa mở');
      wrap.appendChild(el('h2', { class: 'section-title', text: 'Tổng hợp cả khoá' }));
      wrap.appendChild(el('section', { class: 'midterm', 'aria-labelledby': 'midterm-title' },
        mosaic,
        el('div', null,
          el('h2', { id: 'midterm-title', text: midterm.title }),
          el('p', { text: midterm.available
            ? midterm.question_count + ' câu, mỗi bộ slide góp một câu. Làm trong 60 phút.'
            : (midterm.reason || 'Cần đủ 14 bộ slide đã xuất bản.') }),
          action
        )
      ));
    }
    return wrap;
  }

  /* ---------- Generating ---------- */

  function startAttempt(exam) {
    stopTimer();
    hideStrip();
    setBar(null);
    var title = exam.exam_id === 'midterm' ? exam.title : 'Slide ' + pad2(exam.slide_number) + ' · ' + exam.title;
    setShell(title, null);
    clear($main);
    document.title = 'Đang tạo đề · CramAI';

    $main.appendChild(el('section', { class: 'generating', 'aria-busy': 'true' },
      el('div', { class: 'projector', 'aria-hidden': 'true' },
        el('span', { class: 'frame-number', text: exam.exam_id === 'midterm' ? '01–14' : pad2(exam.slide_number) })),
      el('h1', { text: 'Đang tạo đề ' + exam.question_count + ' câu' }),
      el('p', { text: 'CramAI đọc các slide đã duyệt và chỉ giữ câu có căn cứ. Việc này thường mất vài giây đến nửa phút.' })
    ));
    focusMain();
    announce('Đang tạo đề.');

    request('POST', '/attempts', { exam_id: exam.exam_id }).then(function (attempt) {
      state.session = { attempt: attempt, title: title, answers: {}, current: 0, result: null, confirming: false };
      save();
      renderQuiz();
    }, function (err) {
      clear($main);
      var actions = [el('button', { class: 'btn btn-secondary', type: 'button', onclick: renderCatalog }, icon('grid'), 'Về danh mục')];
      if (err.code === 'upstream_error' || err.code === 'busy' || err.code === 'network' || err.code === 'internal_error') {
        actions.unshift(el('button', { class: 'btn btn-primary', type: 'button', onclick: function () { startAttempt(exam); } }, icon('refresh'), 'Tạo lại đề'));
      }
      $main.appendChild(errorNotice(err, actions));
      focusMain();
    });
  }

  /* ---------- Quiz ---------- */

  function renderQuiz() {
    var session = state.session;
    if (!session) { renderCatalog(); return; }
    if (session.result) { renderResult(); return; }
    if (session.expired || Date.parse(session.attempt.expires_at) <= Date.now()) { renderExpired(); return; }

    setShell(session.title, null);
    document.title = session.title + ' · CramAI';
    startTimer();
    drawQuestion(true);
  }

  function drawQuestion(moveFocus) {
    var session = state.session;
    var questions = session.attempt.questions;
    var index = Math.max(0, Math.min(session.current, questions.length - 1));
    var q = questions[index];

    drawStrip();
    clear($main);

    var group = el('fieldset', { class: 'options' },
      el('legend', { class: 'sr-only', text: 'Chọn một đáp án' }));
    q.options.forEach(function (opt) {
      var id = 'opt-' + q.question_id + '-' + opt.option_id;
      var input = el('input', {
        type: 'radio', name: 'answer-' + q.question_id, id: id, value: opt.option_id,
        checked: session.answers[q.question_id] === opt.option_id,
        onchange: function () { choose(q.question_id, opt.option_id); }
      });
      group.appendChild(el('label', { class: 'option', for: id },
        input,
        el('span', { class: 'option-body' },
          el('span', { class: 'option-key', 'aria-hidden': 'true', text: opt.option_id.toUpperCase() }),
          el('span', null, el('span', { class: 'sr-only', text: opt.option_id.toUpperCase() + '. ' }), opt.text)
        )
      ));
    });

    var prev = el('button', { class: 'btn btn-secondary', type: 'button', disabled: index === 0, onclick: function () { go(index - 1); } }, icon('arrowLeft'), 'Câu trước');
    var next = index < questions.length - 1
      ? el('button', { class: 'btn btn-secondary', type: 'button', onclick: function () { go(index + 1); } }, 'Câu tiếp', icon('arrowRight'))
      : null;

    var slideNumber = session.attempt.exam_id === 'midterm' ? null : session.attempt.exam_id.slice(-2);

    $main.appendChild(el('div', { class: 'quiz' },
      el('section', { 'aria-labelledby': 'q-prompt' },
        el('p', { class: 'q-number', text: 'Câu ' + (index + 1) + ' trên ' + questions.length }),
        el('h1', { class: 'q-prompt', id: 'q-prompt', text: q.prompt }),
        group,
        el('div', { class: 'q-nav' }, prev, next),
        el('p', { class: 'q-hint' }, 'Bấm phím ', el('kbd', { text: 'A' }), '–', el('kbd', { text: 'D' }), ' để chọn nhanh. Bấm vào ô số trên thanh trên cùng để nhảy tới câu bất kỳ.')
      ),
      el('aside', { class: 'source', 'aria-labelledby': 'source-title' },
        el('h2', { id: 'source-title', text: 'Nguồn của câu này' }),
        el('div', { class: 'source-card' },
          el('div', { class: 'source-frame is-locked' },
            el('span', { class: 'frame-number', text: slideNumber ? slideNumber : '01–14' }),
            icon('lock'),
            el('span', { class: 'page', text: 'tr. ?' })
          ),
          el('p', { class: 'source-name', text: slideNumber ? 'Slide ' + slideNumber : 'Một trong 14 bộ slide' }),
          el('p', { class: 'source-id', text: 'Tên file và số trang hiện sau khi nộp bài.' })
        ),
        el('p', { class: 'source-note', text: 'Câu hỏi chỉ lấy từ slide đã được nhóm duyệt và xuất bản.' })
      )
    ));

    if (session.expired) {
      $main.insertBefore(expiredHeader(), $main.firstChild);
      $main.querySelectorAll('.option input').forEach(function (input) { input.disabled = true; });
      setBar(null);
    } else {
      drawBar();
    }
    if (moveFocus) focusMain();
  }

  function drawStrip() {
    var session = state.session;
    clear($strip);
    $strip.hidden = false;
    var result = session.result;
    var byId = {};
    if (result) result.items.forEach(function (item) { byId[item.question_id] = item; });

    session.attempt.questions.forEach(function (q, i) {
      var answered = !!session.answers[q.question_id];
      var cls = 'thumb';
      var label = 'Câu ' + (i + 1);
      var mark = null;
      if (result) {
        var item = byId[q.question_id];
        cls += item && item.is_correct ? ' is-correct' : ' is-wrong';
        label += item && item.is_correct ? ', đúng' : ', sai';
        mark = icon(item && item.is_correct ? 'check' : 'cross');
      } else {
        if (answered) cls += ' is-answered';
        else if (session.missing && session.missing.indexOf(q.question_id) >= 0) cls += ' is-missing';
        if (i === session.current) cls += ' is-current';
        label += answered ? ', đã trả lời' : ', chưa trả lời';
      }
      $strip.appendChild(el('button', {
        class: cls, type: 'button', 'aria-label': label,
        'aria-current': !result && i === session.current ? 'step' : null,
        onclick: function () { result ? jumpToReview(q.question_id) : go(i); }
      }, mark, el('span', { 'aria-hidden': 'true', text: String(i + 1) })));
    });
  }

  function countAnswered() {
    var session = state.session;
    return session.attempt.questions.filter(function (q) { return !!session.answers[q.question_id]; }).length;
  }

  function drawBar() {
    var session = state.session;
    var total = session.attempt.questions.length;
    var answered = countAnswered();

    if (session.confirming) {
      setBar([
        el('p', { class: 'status' }, el('strong', { text: 'Nộp ' + answered + '/' + total + ' câu?' }), ' Sau khi nộp không đổi được đáp án.'),
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn-quiet', type: 'button', onclick: function () { session.confirming = false; drawBar(); } }, 'Xem lại'),
          el('button', { class: 'btn btn-primary btn-lg', type: 'button', id: 'confirm-submit', onclick: submit }, 'Nộp bài')
        )
      ]);
      var btn = document.getElementById('confirm-submit');
      if (btn) btn.focus();
      return;
    }

    var status = el('p', { class: 'status' }, 'Đã trả lời ', el('strong', { text: answered + '/' + total }));
    if (session.missing && session.missing.length) {
      status = el('p', { class: 'status is-warning' }, 'Còn ' + session.missing.length + ' câu chưa trả lời: ' +
        session.missing.map(function (qid) { return 'câu ' + (indexOf(qid) + 1); }).join(', ') + '.');
    }
    setBar([
      status,
      el('div', { class: 'btn-row' },
        el('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: requestSubmit }, 'Nộp bài'))
    ]);
  }

  function indexOf(qid) {
    var qs = state.session.attempt.questions;
    for (var i = 0; i < qs.length; i++) if (qs[i].question_id === qid) return i;
    return -1;
  }

  function choose(qid, optionId) {
    var session = state.session;
    if (session.expired) return;
    session.answers[qid] = optionId;
    if (session.missing) session.missing = session.missing.filter(function (id) { return id !== qid; });
    session.confirming = false;
    save();
    drawStrip();
    drawBar();
  }

  function go(index) {
    var session = state.session;
    if (index < 0 || index >= session.attempt.questions.length) return;
    session.current = index;
    session.confirming = false;
    save();
    drawQuestion(false);
    var first = $main.querySelector('.option input:checked') || $main.querySelector('.option input');
    if (first) first.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function requestSubmit() {
    var session = state.session;
    var missing = session.attempt.questions
      .filter(function (q) { return !session.answers[q.question_id]; })
      .map(function (q) { return q.question_id; });
    if (missing.length) {
      session.missing = missing;
      session.current = indexOf(missing[0]);
      save();
      drawQuestion(false);
      announce('Còn ' + missing.length + ' câu chưa trả lời. Đã chuyển đến câu ' + (session.current + 1) + '.');
      var first = $main.querySelector('.option input');
      if (first) first.focus();
      return;
    }
    session.confirming = true;
    drawBar();
  }

  function submit() {
    var session = state.session;
    var answers = session.attempt.questions.map(function (q) {
      return { question_id: q.question_id, option_id: session.answers[q.question_id] };
    });
    setBar([el('p', { class: 'status', 'aria-busy': 'true', text: 'Đang chấm bài…' })]);
    $main.querySelectorAll('input').forEach(function (input) { input.disabled = true; });

    request('POST', '/submissions', { attempt_id: session.attempt.attempt_id, answers: answers }).then(function (result) {
      session.result = result;
      session.confirming = false;
      save();
      stopTimer();
      renderResult();
    }, function (err) {
      session.confirming = false;
      if (err.code === 'quiz_unavailable') { renderExpired(); return; }
      drawQuestion(false);
      var copy = errorCopy(err);
      var retry = err.code === 'network' || err.code === 'internal_error';
      setBar([
        el('p', { class: 'status is-warning', role: 'alert' }, copy[0] + '. ' + copy[1]),
        el('div', { class: 'btn-row' },
          err.code === 'already_submitted'
            ? el('button', { class: 'btn btn-primary', type: 'button', onclick: renderCatalog }, 'Về danh mục')
            : el('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: retry ? submit : requestSubmit }, retry ? 'Gửi lại' : 'Nộp bài'))
      ]);
    });
  }

  /* ---------- Expired ---------- */

  /* Expired: the quiz stays on screen, stamped and read-only. Nothing vanishes. */
  function renderExpired() {
    stopTimer();
    var session = state.session;
    if (!session) { renderCatalog(); return; }
    session.expired = true;
    session.confirming = false;
    save();
    setShell(session.title, 'Hết giờ');
    document.title = 'Hết giờ · CramAI';
    drawQuestion(true);
    announce('Lượt làm bài đã hết giờ.');
  }

  function expiredHeader() {
    var examId = state.session.attempt.exam_id;
    var exam = state.catalog ? state.catalog.filter(function (e) { return e.exam_id === examId; })[0] : null;
    return el('section', { class: 'expired-head', 'aria-labelledby': 'expired-title' },
      el('p', { class: 'expired-stamp' }, icon('clock'), 'Hết hạn'),
      el('div', null,
        el('h1', { id: 'expired-title', text: 'Lượt làm bài đã hết 60 phút' }),
        el('p', { text: 'Lượt này không nộp được nữa. Các câu và lựa chọn của bạn vẫn hiện bên dưới để xem lại. Tạo lượt mới để nhận đề khác cho cùng bộ slide.' }),
        el('div', { class: 'q-nav' },
          el('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: function () {
            state.session = null; save();
            startAttempt(exam || { exam_id: examId, title: examLabel(examId), slide_number: examId === 'midterm' ? null : Number(examId.slice(-2)), question_count: examId === 'midterm' ? 14 : 5 });
          } }, icon('refresh'), 'Tạo lượt mới'),
          el('button', { class: 'btn btn-secondary btn-lg', type: 'button', onclick: function () { state.session = null; save(); renderCatalog(); } }, icon('grid'), 'Về danh mục'))));
  }

  /* ---------- Result ---------- */

  function renderResult() {
    var session = state.session;
    var result = session.result;
    stopTimer();
    setShell(session.title, 'Đã nộp');
    document.title = 'Kết quả ' + result.correct_count + '/' + result.total_questions + ' · CramAI';
    drawStrip();
    setBar(null);
    clear($main);

    var questions = {};
    session.attempt.questions.forEach(function (q) { questions[q.question_id] = q; });
    var wrong = result.total_questions - result.correct_count;
    var percent = Math.round(result.score_percent);

    $main.appendChild(el('section', { class: 'score-head', 'aria-labelledby': 'score-title' },
      el('p', { class: 'score-figure' }, String(result.correct_count), el('small', { text: '/' + result.total_questions })),
      el('div', { class: 'score-copy' },
        el('h1', { id: 'score-title', text: percent + '% câu đúng' }),
        el('p', { text: wrong === 0
          ? 'Bạn trả lời đúng cả ' + result.total_questions + ' câu. Mỗi câu vẫn kèm trang slide để bạn đọc lại.'
          : wrong + ' câu sai được viền đỏ bên dưới, kèm đáp án đúng và trang slide để đọc lại.' })),
      el('div', { class: 'score-actions' },
        el('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: retake }, icon('refresh'), 'Làm đề mới cùng bộ'),
        el('button', { class: 'btn btn-secondary btn-lg', type: 'button', onclick: function () { state.session = null; save(); renderCatalog(); } }, icon('grid'), 'Chọn đề khác'))
    ));

    var list = el('ol', { class: 'review', 'aria-label': 'Đáp án từng câu' });
    result.items.forEach(function (item, i) {
      var q = questions[item.question_id];
      if (!q) return;
      var options = el('ul', { class: 'review-options' });
      q.options.forEach(function (opt) {
        var isKey = opt.option_id === item.correct_option_id;
        var isPicked = opt.option_id === item.selected_option_id;
        var cls = 'review-option' + (isKey ? ' is-key' : isPicked ? ' is-picked-wrong' : '');
        var tag = isKey && isPicked ? 'Bạn chọn, đúng' : isKey ? 'Đáp án đúng' : isPicked ? 'Bạn chọn' : null;
        options.appendChild(el('li', { class: cls },
          el('span', { class: 'option-key', 'aria-hidden': 'true', text: opt.option_id.toUpperCase() }),
          el('span', null, el('span', { class: 'sr-only', text: opt.option_id.toUpperCase() + '. ' }), opt.text),
          tag ? el('span', { class: 'tag', text: tag }) : null));
      });

      var sources = el('div', { class: 'source' }, el('h2', { text: item.citations.length > 1 ? 'Nguồn (' + item.citations.length + ')' : 'Nguồn' }));
      item.citations.forEach(function (c) {
        sources.appendChild(el('figure', { class: 'source-card' },
          el('div', { class: 'source-frame', 'aria-hidden': 'true' },
            el('span', { class: 'frame-number', text: pad2(c.slide_number) }),
            el('span', { class: 'laser' }),
            el('span', { class: 'page', text: 'tr. ' + c.page })),
          el('figcaption', null,
            el('p', { class: 'source-name', text: 'Slide ' + pad2(c.slide_number) + ', trang ' + c.page }),
            el('p', { class: 'source-id', text: c.file_name }),
            el('p', { class: 'source-id', text: 'Mã đoạn ' + c.source_id }))));
      });

      list.appendChild(el('li', { class: 'review-item' + (item.is_correct ? '' : ' is-wrong'), id: 'review-' + item.question_id },
        el('div', null,
          el('p', { class: 'verdict ' + (item.is_correct ? 'is-correct' : 'is-wrong') }, icon(item.is_correct ? 'check' : 'cross'), 'Câu ' + (i + 1) + (item.is_correct ? ' · đúng' : ' · sai')),
          el('h2', { class: 'review-prompt', text: q.prompt }),
          options),
        sources));
    });
    $main.appendChild(list);
    $main.appendChild(el('p', { class: 'foot', text: 'Điểm chỉ để tự ôn. Mã yêu cầu ' + result.request_id + '.' }));
    focusMain();
    announce('Đã chấm: ' + result.correct_count + ' trên ' + result.total_questions + ' câu đúng.');
  }

  function jumpToReview(qid) {
    var target = document.getElementById('review-' + qid);
    if (!target) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }

  function retake() {
    var examId = state.session.attempt.exam_id;
    var exam = state.catalog ? state.catalog.filter(function (e) { return e.exam_id === examId; })[0] : null;
    state.session = null;
    save();
    startAttempt(exam || { exam_id: examId, title: examLabel(examId), slide_number: examId === 'midterm' ? null : Number(examId.slice(-2)), question_count: examId === 'midterm' ? 14 : 5 });
  }

  /* ---------- Notices ---------- */

  function notice(kind, title, body, actions) {
    var iconName = kind === 'error' ? 'alert' : kind === 'warning' ? 'alert' : 'info';
    return el('div', { class: 'notice notice-' + kind, role: kind === 'error' ? 'alert' : null },
      icon(iconName),
      el('div', null,
        el('h2', { text: title }),
        el('p', { text: body }),
        actions && actions.length ? el('div', { class: 'actions' }, actions) : null));
  }

  function errorNotice(err, actions) {
    var copy = errorCopy(err);
    var body = copy[1];
    if (err && err.requestId) body += ' Mã yêu cầu ' + err.requestId + '.';
    var kind = err && (err.code === 'insufficient_evidence' || err.code === 'exam_unavailable' || err.code === 'busy') ? 'warning' : 'error';
    return notice(kind, copy[0], body, actions);
  }

  /* ---------- Keyboard ---------- */

  document.addEventListener('keydown', function (event) {
    var session = state.session;
    if (!session || session.result || session.expired || $strip.hidden) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    var key = event.key.toLowerCase();
    var q = session.attempt.questions[session.current];
    if (!q) return;
    if (['a', 'b', 'c', 'd'].indexOf(key) >= 0) {
      var input = document.getElementById('opt-' + q.question_id + '-' + key);
      if (input && !input.disabled) { input.checked = true; choose(q.question_id, key); input.focus(); }
    } else if (event.key === 'ArrowRight' && !(event.target && event.target.type === 'radio')) {
      go(session.current + 1);
    } else if (event.key === 'ArrowLeft' && !(event.target && event.target.type === 'radio')) {
      go(session.current - 1);
    }
  });

  document.querySelector('[data-action="home"]').addEventListener('click', function (event) {
    event.preventDefault();
    if (state.session && state.session.result) { state.session = null; save(); }
    renderCatalog();
  });

  /* ---------- Boot ---------- */

  function boot() {
    state.session = load();
    if (state.session && state.session.attempt) {
      if (state.session.result) renderResult();
      else renderQuiz();
    } else {
      state.session = null;
      renderCatalog();
    }
  }

  if (MOCK) {
    document.getElementById('mock-badge').hidden = false;
    var script = document.createElement('script');
    script.src = 'mock.js';
    script.onload = boot;
    script.onerror = function () { MOCK = false; boot(); };
    document.head.appendChild(script);
  } else {
    boot();
  }
})();
