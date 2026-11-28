import { useEffect, useRef, useState } from 'react';
import { Backdrop, Pastry, WhiskMark } from '../art/art';
import { IS_MOCK, asApiError, pad2, request, type ApiError } from '../shared/api';
import type { AdminDetail, AdminList, AdminSlot, RevisionSummary } from '../shared/types';
import { Announcer, Awning, Icon, MockBadge, Notice } from '../shared/ui';

const MAX_FILES = 5;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;

const ERRORS: Record<string, [string, string]> = {
  network: ['Không kết nối được máy chủ', 'Kiểm tra mạng rồi thử lại.'],
  unauthorized: ['Cần đăng nhập admin', 'Phiên đăng nhập đã hết hoặc sai tài khoản. Tải lại trang để nhập lại tài khoản admin.'],
  forbidden_origin: ['Yêu cầu bị chặn', 'Trang admin phải mở từ đúng địa chỉ của CramAI. Mở lại trang từ địa chỉ chính thức.'],
  unsupported_file: ['File không phải PDF', 'Chỉ nhận file PDF. Chọn lại file có đuôi .pdf.'],
  invalid_document: ['PDF không đọc được', 'File có thể bị mã hoá, hỏng, hoặc chỉ có ảnh scan không có lớp chữ. Xuất lại PDF có chữ chọn được rồi tải lên lại. Bản đã xuất bản không bị ảnh hưởng.'],
  too_large: ['File quá lớn', 'Mỗi file tối đa 20 MB, tổng mỗi lần upload tối đa 50 MB. Tách hoặc nén PDF rồi tải lên lại.'],
  stale_draft: ['Bản nháp đã thay đổi', 'Có người vừa tải bản nháp khác cho bộ này. Bản nháp mới đã được tải lại, hãy kiểm tra trước khi xuất bản.'],
  invalid_input: ['Yêu cầu không hợp lệ', 'Tải lại trang rồi thử lại.'],
  internal_error: ['Máy chủ gặp lỗi', 'Thử lại sau ít phút. Nếu vẫn lỗi, báo Lâm kèm mã yêu cầu.'],
};

const ADMIN_STORE_KEY = 'cramai.admin.selected.v1';

function loadSelected(): number | null {
  try {
    const n = Number(localStorage.getItem(ADMIN_STORE_KEY));
    return Number.isInteger(n) && n >= 1 && n <= 14 ? n : null;
  } catch {
    return null;
  }
}

function saveSelected(n: number | null) {
  try {
    if (n === null) localStorage.removeItem(ADMIN_STORE_KEY);
    else localStorage.setItem(ADMIN_STORE_KEY, String(n));
  } catch {
    /* storage unavailable: selection just isn't remembered */
  }
}

type Flash = { kind: 'success' | 'error'; title: string; body: string } | null;

function errorFlash(err: ApiError): Flash {
  const [title, body] = ERRORS[err.code] ?? ERRORS.internal_error;
  return { kind: 'error', title, body: body + (err.requestId ? ` Mã yêu cầu ${err.requestId}.` : '') };
}

const shortId = (id?: string) => (id ? id.slice(0, 8) : '');
const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
const hasNewDraft = (s: AdminSlot) => !!s.draft && (!s.published || s.draft.revision_id !== s.published.revision_id);

function slotState(s: AdminSlot) {
  if (hasNewDraft(s)) return { label: 'Chờ xuất bản', cls: 'bg-apricot text-cocoa' };
  if (s.published) return { label: 'Đã xuất bản', cls: 'bg-mint text-cocoa' };
  return { label: 'Chưa có nguồn', cls: 'bg-white text-cocoa-soft ring-2 ring-cocoa-line' };
}

export function AdminApp() {
  const [slots, setSlots] = useState<AdminSlot[] | null>(null);
  const [listError, setListError] = useState<ApiError | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminDetail | null>(null);
  const [detailError, setDetailError] = useState<ApiError | null>(null);
  const [flash, setFlash] = useState<Flash>(null);
  const [announcement, setAnnouncement] = useState('');
  const titleRef = useRef<HTMLHeadingElement>(null);

  const announce = (t: string) => {
    setAnnouncement('');
    setTimeout(() => setAnnouncement(t), 30);
  };

  const loadSlots = () => {
    setListError(null);
    setSlots(null);
    request<AdminList>('GET', '/admin/slides').then(
      (d) => setSlots(d.slides),
      (e) => setListError(asApiError(e)),
    );
  };
  useEffect(() => {
    loadSlots();
    const saved = loadSelected();
    if (saved !== null) select(saved, false, false);
  }, []);

  const select = (n: number, keepFlash = false, focus = true) => {
    setSelected(n);
    saveSelected(n);
    if (!keepFlash) setFlash(null);
    setDetail(null);
    setDetailError(null);
    request<AdminDetail>('GET', '/admin/slides/' + n).then(
      (d) => {
        setDetail(d);
        if (!focus) return;
        requestAnimationFrame(() => {
          const title = titleRef.current;
          if (!title) return;
          title.focus({ preventScroll: true });
          // On one-column layouts the detail sits below the list.
          if (window.innerWidth < 1024) title.scrollIntoView({ block: 'start' });
        });
      },
      (e) => setDetailError(asApiError(e)),
    );
  };

  const applyDetail = (d: AdminDetail) => {
    setDetail(d);
    setSlots((prev) => prev?.map((s) => (s.slide_number === d.slot.slide_number ? d.slot : s)) ?? prev);
  };

  const published = slots?.filter((s) => s.published).length ?? 0;

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only-focusable fixed left-3 top-3 z-50 rounded-pill bg-white px-4 py-2 font-bold shadow-lift">
        Bỏ qua tới nội dung
      </a>
      <Awning />
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-3 sm:px-6">
        <div className="flex items-center gap-2 rounded-pill bg-white py-1.5 pl-2 pr-4 shadow-plate ring-1 ring-cocoa-line/60">
          <WhiskMark className="h-8 w-8" />
          <span className="font-display text-xl font-extrabold">CramAI</span>
          <span className="rounded-pill bg-cream px-2 py-0.5 text-sm font-bold">Bếp bánh</span>
        </div>
        {IS_MOCK && <MockBadge />}
      </header>

      <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 outline-none sm:px-6">
        <div className="mb-6 max-w-3xl">
          <h1 className="text-4xl font-extrabold">Quản lý 14 bộ slide nguồn</h1>
          <p className="mt-2 text-lg text-cocoa-soft">
            Tải PDF vào bản nháp, xem đoạn trích rồi xuất bản. Học viên chỉ nhận đề từ bản đã xuất bản.
            {slots && ` ${published}/14 bộ đã xuất bản. Đề giữa kỳ mở khi đủ 14 bộ.`}
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <section aria-labelledby="slots-title" className="plate p-3 sm:p-4">
            <h2 id="slots-title" className="sr-only">
              Danh sách bộ slide
            </h2>
            {listError && (
              <Notice
                kind="error"
                title={(ERRORS[listError.code] ?? ERRORS.internal_error)[0]}
                actions={
                  <button type="button" className="btn btn-secondary" onClick={loadSlots}>
                    <Icon name="refresh" /> Tải lại
                  </button>
                }
              >
                {(ERRORS[listError.code] ?? ERRORS.internal_error)[1]}
              </Notice>
            )}
            {!slots && !listError && <p className="p-4 text-cocoa-soft">Đang tải danh sách…</p>}
            {slots && (
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-1.5">
                {slots.map((s, i) => {
                  const st = slotState(s);
                  const active = selected === s.slide_number;
                  return (
                    <li key={s.slide_number}>
                      <button
                        type="button"
                        aria-current={active ? 'true' : undefined}
                        onClick={() => select(s.slide_number)}
                        className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors ${
                          active ? 'bg-blush-soft ring-2 ring-strawberry' : 'hover:bg-cream-soft'
                        }`}
                      >
                        <span className="h-11 w-12 shrink-0 rounded-xl bg-cream-soft">
                          <Pastry index={i} covered={!s.published} className="h-full w-full" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-sm font-bold text-cocoa-soft">Slide {pad2(s.slide_number)}</span>
                          <span className="block truncate font-bold">{s.title}</span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <span className={`rounded-pill px-2.5 py-0.5 text-xs font-bold ${st.cls}`}>{st.label}</span>
                          <span className="text-xs text-cocoa-soft">{s.published ? `${s.published.passage_count} đoạn` : '—'}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="detail-title" className="plate min-h-[320px] p-5 sm:p-7 lg:sticky lg:top-6">
            {flash && (
              <div className="mb-5">
                <Notice kind={flash.kind} title={flash.title}>
                  {flash.body}
                </Notice>
              </div>
            )}
            {selected === null && (
              <div className="grid h-full place-items-center py-10 text-center">
                <div>
                  <h2 id="detail-title" className="sr-only">
                    Chi tiết bộ slide
                  </h2>
                  <Pastry index={1} className="mx-auto h-28 w-36" />
                  <p className="mt-3 text-lg text-cocoa-soft">Chọn một bộ slide trong danh sách để tải PDF, xem bản nháp và xuất bản.</p>
                </div>
              </div>
            )}
            {selected !== null && !detail && !detailError && <p className="text-cocoa-soft">Đang tải Slide {pad2(selected)}…</p>}
            {detailError && (
              <Notice kind="error" title={(ERRORS[detailError.code] ?? ERRORS.internal_error)[0]}>
                {(ERRORS[detailError.code] ?? ERRORS.internal_error)[1]}
              </Notice>
            )}
            {detail && (
              <Detail
                key={detail.slot.slide_number + ':' + (detail.slot.draft?.revision_id ?? '')}
                detail={detail}
                titleRef={titleRef}
                onUploaded={(d) => {
                  applyDetail(d);
                  setFlash({ kind: 'success', title: 'Đã tải bản nháp', body: `${d.slot.draft!.documents.length} file, ${d.slot.draft!.passage_count} đoạn. Kiểm tra đoạn trích rồi xuất bản.` });
                  announce('Đã tải bản nháp.');
                }}
                onPublished={(d) => {
                  applyDetail(d);
                  setFlash({ kind: 'success', title: `Đã xuất bản Slide ${pad2(d.slot.slide_number)}`, body: `Phiên bản ${shortId(d.slot.published?.revision_id)} đang được dùng để tạo đề.` });
                  announce('Đã xuất bản.');
                }}
                onError={(err) => {
                  setFlash(errorFlash(err));
                  if (err.code === 'stale_draft') select(detail.slot.slide_number, true);
                }}
              />
            )}
          </section>
        </div>
      </main>
      <Backdrop />
      <Announcer text={announcement} />
    </div>
  );
}

function Facts({ rev }: { rev: RevisionSummary }) {
  return (
    <>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        {[
          ['Phiên bản', shortId(rev.revision_id)],
          ['Số file', String(rev.documents.length)],
          ['Số đoạn', String(rev.passage_count)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-cream-soft p-3">
            <dt className="text-sm text-cocoa-soft">{k}</dt>
            <dd className="font-display text-lg font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-3 grid gap-1.5">
        {rev.documents.map((d) => (
          <li key={d.file_name} className="flex items-center gap-2 rounded-xl px-2 py-1.5 ring-1 ring-cocoa-line">
            <Icon name="file" className="h-4 w-4 shrink-0 text-strawberry-ink" />
            <span className="min-w-0 flex-1 break-all">{d.file_name}</span>
            <span className="shrink-0 text-sm text-cocoa-soft">{d.page_count} trang</span>
          </li>
        ))}
      </ul>
    </>
  );
}

interface DetailProps {
  detail: AdminDetail;
  titleRef: React.RefObject<HTMLHeadingElement>;
  onUploaded: (d: AdminDetail) => void;
  onPublished: (d: AdminDetail) => void;
  onError: (e: ApiError) => void;
}

function Detail({ detail, titleRef, onUploaded, onPublished, onError }: DetailProps) {
  const slot = detail.slot;
  const n = pad2(slot.slide_number);
  const fresh = hasNewDraft(slot);
  return (
    <div>
      <h2 id="detail-title" ref={titleRef} tabIndex={-1} className="text-3xl font-extrabold outline-none">
        Slide {n} · {slot.title}
      </h2>
      <p className="mt-1 text-cocoa-soft">{slot.published ? 'Đang dùng để tạo đề.' : 'Chưa có nguồn nên học viên chưa chọn được bộ này.'}</p>

      {slot.published && (
        <section className="mt-6">
          <h3 className="text-xl font-bold">Bản đang xuất bản</h3>
          <Facts rev={slot.published} />
        </section>
      )}

      <section className="mt-6">
        <h3 className="text-xl font-bold">{fresh ? 'Thay bản nháp' : 'Tải bản nháp mới'}</h3>
        <Upload slot={slot} onUploaded={onUploaded} onError={onError} />
      </section>

      {fresh && slot.draft && (
        <section className="mt-6">
          <h3 className="text-xl font-bold">Bản nháp chờ xuất bản</h3>
          <Facts rev={slot.draft} />
          <h4 className="mt-5 font-display text-lg font-bold">Đoạn trích đại diện</h4>
          {detail.draft_preview.length ? (
            <ul className="mt-2 grid gap-2">
              {detail.draft_preview.map((p) => (
                <li key={p.citation.source_id} className="flex gap-3 rounded-2xl bg-milk p-3 ring-1 ring-cocoa-line">
                  <span aria-hidden="true" className="grid h-12 w-11 shrink-0 place-items-center rounded-lg bg-mint font-display text-xs font-extrabold leading-tight ring-2 ring-cocoa">
                    tr.
                    <br />
                    {p.citation.page}
                  </span>
                  <div className="min-w-0">
                    <p>{p.text}</p>
                    <p className="mt-1 break-all text-sm text-cocoa-soft">
                      {p.citation.file_name}, trang {p.citation.page} · {p.citation.source_id}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-cocoa-soft">Không có đoạn đại diện để xem trước.</p>
          )}
          <Publish slot={slot} onPublished={onPublished} onError={onError} />
        </section>
      )}
    </div>
  );
}

function Upload({ slot, onUploaded, onError }: { slot: AdminSlot; onUploaded: (d: AdminDetail) => void; onError: (e: ApiError) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputId = `pdf-input-${slot.slide_number}`;

  const total = files.reduce((s, f) => s + f.size, 0);
  const badFile = (f: File) => (!/\.pdf$/i.test(f.name) && f.type !== 'application/pdf' ? 'không phải PDF' : f.size > MAX_FILE_BYTES ? 'quá 20 MB' : null);
  const problems = [
    ...files.filter(badFile).map((f) => `${f.name}: ${badFile(f)}`),
    ...(files.length > MAX_FILES ? [`Chọn tối đa 5 file, đang chọn ${files.length}.`] : []),
    ...(total > MAX_TOTAL_BYTES ? [`Tổng dung lượng ${mb(total)}, vượt 50 MB mỗi lần upload.`] : []),
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length || problems.length) return;
    let body: unknown = files;
    if (!IS_MOCK) {
      const form = new FormData();
      files.forEach((f) => form.append('files', f, f.name));
      body = form;
    }
    setBusy(true);
    request<AdminDetail>('PUT', `/admin/slides/${slot.slide_number}/draft`, body, true).then(
      (d) => {
        setBusy(false);
        setFiles([]);
        onUploaded(d);
      },
      (err) => {
        setBusy(false);
        onError(asApiError(err));
      },
    );
  };

  return (
    <form
      onSubmit={submit}
      onDragEnter={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (e.dataTransfer?.files) setFiles(Array.from(e.dataTransfer.files));
      }}
      className={`mt-3 rounded-blob border-[3px] border-dashed p-5 transition-colors ${over ? 'border-strawberry bg-blush-soft' : 'border-cocoa-line bg-cream-soft'}`}
    >
      <p className="font-display text-lg font-bold">PDF cho Slide {pad2(slot.slide_number)}</p>
      <p id={`${inputId}-hint`} className="mt-1 text-sm text-cocoa-soft">
        Kéo file vào đây hoặc bấm Chọn file PDF. Tối đa 5 file có lớp chữ, mỗi file ≤ 20 MB, tổng mỗi lần upload ≤ 50 MB. Bản nháp mới thay bản nháp cũ; bản đang xuất
        bản giữ nguyên.
      </p>
      <input
        id={inputId}
        type="file"
        name="files"
        accept="application/pdf,.pdf"
        multiple
        aria-describedby={`${inputId}-hint`}
        className="peer sr-only"
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
      />
      <div className="mt-4 flex flex-wrap gap-3">
        <label htmlFor={inputId} className="btn btn-secondary cursor-pointer peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-mint-deep">
          <Icon name="file" /> Chọn file PDF
        </label>
        <button type="submit" className="btn btn-primary" disabled={!files.length || problems.length > 0 || busy}>
          <Icon name="upload" /> {busy ? 'Đang kiểm tra PDF…' : 'Tải lên bản nháp'}
        </button>
      </div>
      {files.length > 0 && (
        <ul aria-live="polite" className="mt-4 grid gap-1.5">
          {files.map((f) => (
            <li key={f.name} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-1.5">
              <span className="min-w-0 break-all">{f.name}</span>
              <span className={`shrink-0 text-sm ${badFile(f) ? 'font-bold text-strawberry-ink' : 'text-cocoa-soft'}`}>{badFile(f) ?? mb(f.size)}</span>
            </li>
          ))}
          {problems
            .filter((p) => !p.includes(': '))
            .map((p) => (
              <li key={p} className="font-bold text-strawberry-ink">
                {p}
              </li>
            ))}
        </ul>
      )}
    </form>
  );
}

function Publish({ slot, onPublished, onError }: { slot: AdminSlot; onPublished: (d: AdminDetail) => void; onError: (e: ApiError) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);
  const draftId = slot.draft!.revision_id;

  const publish = () => {
    setBusy(true);
    request<AdminDetail>('POST', `/admin/slides/${slot.slide_number}/publish`, { revision_id: draftId }).then(
      (d) => {
        setBusy(false);
        setConfirming(false);
        onPublished(d);
      },
      (err) => {
        setBusy(false);
        setConfirming(false);
        onError(asApiError(err));
      },
    );
  };

  return (
    <div className="mt-6 rounded-blob bg-mint-soft p-5 ring-2 ring-mint/60">
      {!confirming ? (
        <>
          <p>
            {slot.published
              ? `Xuất bản sẽ thay phiên bản ${shortId(slot.published.revision_id)} bằng bản nháp ${shortId(draftId)}.`
              : `Xuất bản để học viên chọn được Slide ${pad2(slot.slide_number)}.`}
          </p>
          <button type="button" className="btn btn-mint mt-3" onClick={() => setConfirming(true)}>
            <Icon name="publish" /> Xuất bản bản nháp…
          </button>
        </>
      ) : (
        <div role="group" aria-labelledby="confirm-text">
          <p id="confirm-text" className="font-bold">
            Xuất bản bản nháp {shortId(draftId)} cho Slide {pad2(slot.slide_number)}? Đề mới sẽ dùng nguồn này ngay. Bài học viên đang làm vẫn chấm theo
            bản cũ.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button ref={confirmRef} type="button" className="btn btn-primary" disabled={busy} onClick={publish}>
              <Icon name="publish" /> {busy ? 'Đang xuất bản…' : 'Xuất bản'}
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setConfirming(false)}>
              Huỷ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
