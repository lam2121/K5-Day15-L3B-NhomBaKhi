import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MiniMacaron, type MacaronState } from '../art/art';
import { asApiError, request } from '../shared/api';
import type { AnswerCheckResponse, ExplanationResponse, ExplanationSourcePage } from '../shared/types';
import { Icon, Notice } from '../shared/ui';
import type { Session } from './session';

export type BarState =
  | { kind: 'idle' }
  | { kind: 'confirm' }
  | { kind: 'sending' }
  | { kind: 'error'; title: string; body: string; action: 'retry' | 'submit' | 'home' };

type AnswerCheck =
  | { key: string; kind: 'checking' }
  | { key: string; kind: 'result'; isCorrect: boolean; correctOptionId: string }
  | { key: string; kind: 'error'; message: string };

interface QuizProps {
  session: Session;
  bar: BarState;
  onChoose: (qid: string, optionId: string) => void;
  onGo: (index: number) => void;
  onRequestSubmit: () => void;
  onConfirm: () => void;
  onCancelConfirm: () => void;
  onRetrySend: () => void;
  onHome: () => void;
  onNewAttempt: () => void;
}

export function MacaronStrip({ session, onPick }: { session: Session; onPick: (i: number, qid: string) => void }) {
  const byId = new Map(session.result?.items.map((it) => [it.question_id, it]) ?? []);
  return (
    <nav aria-label="Các câu hỏi" className="-mx-1 overflow-x-auto pb-1">
      <ol className="flex w-max gap-1.5 px-1">
        {session.attempt.questions.map((q, i) => {
          const item = byId.get(q.question_id);
          const answered = !!session.answers[q.question_id];
          const current = !session.result && i === session.current;
          let state: MacaronState = answered ? 'answered' : 'empty';
          if (item) state = item.is_correct ? 'correct' : 'wrong';
          else if (!answered && session.missing?.includes(q.question_id)) state = 'missing';
          const label = `Câu ${i + 1}, ${item ? (item.is_correct ? 'đúng' : 'sai') : answered ? 'đã trả lời' : 'chưa trả lời'}`;
          return (
            <li key={q.question_id}>
              <button
                type="button"
                aria-label={label}
                aria-current={current ? 'step' : undefined}
                onClick={() => onPick(i, q.question_id)}
                className={`relative flex h-14 w-12 flex-col items-center justify-end rounded-2xl pb-1 transition-transform hover:-translate-y-0.5 ${
                  current ? 'bg-white shadow-plate ring-2 ring-strawberry' : ''
                }`}
              >
                <span className="h-7 w-9">
                  <MiniMacaron state={state} />
                </span>
                <span aria-hidden="true" className={`font-display text-xs font-bold ${current ? 'text-strawberry-ink' : 'text-cocoa-soft'}`}>
                  {i + 1}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Quiz(p: QuizProps) {
  const { session } = p;
  const questions = session.attempt.questions;
  const index = Math.max(0, Math.min(session.current, questions.length - 1));
  const q = questions[index];
  const slideNumber = session.attempt.exam_id === 'midterm' ? null : session.attempt.exam_id.slice(-2);
  const answered = questions.filter((x) => !!session.answers[x.question_id]).length;
  const selectedOptionId = session.answers[q.question_id] ?? '';
  const optionsRef = useRef<HTMLFieldSetElement>(null);
  const explainButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const requestKeyRef = useRef('');
  const checkRequestKeyRef = useRef('');
  const checkSequenceRef = useRef(0);
  const lastSelectionRef = useRef({ attemptId: session.attempt.attempt_id, questionId: q.question_id, optionId: '' });
  const [answerCheck, setAnswerCheck] = useState<AnswerCheck | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState('');
  const [activeSource, setActiveSource] = useState(0);
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const requestKey = `${q.question_id}:${selectedOptionId}`;
  requestKeyRef.current = requestKey;
  const answerCheckKey = `${session.attempt.attempt_id}:${q.question_id}:${selectedOptionId}`;
  const currentAnswerCheck = answerCheck?.key === answerCheckKey ? answerCheck : null;
  checkRequestKeyRef.current = answerCheckKey;
  const currentExplanation = explanation?.question_id === q.question_id && explanation.selected_option_id === selectedOptionId ? explanation : null;
  const sourcePage = currentExplanation?.source_pages[Math.min(activeSource, currentExplanation.source_pages.length - 1)] ?? null;

  // Move focus to the chosen or first option when the question changes.
  useEffect(() => {
    const root = optionsRef.current;
    if (!root || document.activeElement === document.body) return;
    const target = root.querySelector<HTMLInputElement>('input:checked') ?? root.querySelector<HTMLInputElement>('input');
    target?.focus({ preventScroll: true });
  }, [index]);

  // A changed question or answer invalidates any explanation and closes its dialog.
  useEffect(() => {
    setExplanation(null);
    setExplanationLoading(false);
    setExplanationError('');
    setActiveSource(0);
    setImageUnavailable(false);
    if (dialogRef.current?.open) dialogRef.current.close();
    setDialogOpen(false);
  }, [q.question_id, selectedOptionId]);

  useEffect(() => {
    setImageUnavailable(false);
  }, [sourcePage?.source_id]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (dialogOpen && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLButtonElement>('[data-dialog-close]')?.focus();
    } else if (!dialogOpen && dialog.open) {
      dialog.close();
    }
  }, [dialogOpen]);

  const checkAnswer = (questionId: string, optionId: string) => {
    if (!optionId || session.expired) return;
    const key = `${session.attempt.attempt_id}:${questionId}:${optionId}`;
    const sequence = ++checkSequenceRef.current;
    checkRequestKeyRef.current = key;
    setAnswerCheck({ key, kind: 'checking' });
    request<AnswerCheckResponse>(
      'POST',
      `/attempts/${encodeURIComponent(session.attempt.attempt_id)}/questions/${encodeURIComponent(questionId)}/check`,
      { selected_option_id: optionId },
    ).then(
      (response) => {
        if (sequence !== checkSequenceRef.current || checkRequestKeyRef.current !== key) return;
        setAnswerCheck({ key, kind: 'result', isCorrect: response.is_correct, correctOptionId: response.correct_option_id });
      },
      (error) => {
        if (sequence !== checkSequenceRef.current || checkRequestKeyRef.current !== key) return;
        const apiError = asApiError(error);
        setAnswerCheck({ key, kind: 'error', message: apiError.message || 'Chưa kiểm tra được đáp án. Hãy thử lại.' });
      },
    );
  };

  // Check once when a choice changes. Navigating to another answered question
  // clears feedback but does not make a second request for the old choice.
  useEffect(() => {
    const previous = lastSelectionRef.current;
    const sameAttempt = previous.attemptId === session.attempt.attempt_id;
    const sameQuestion = sameAttempt && previous.questionId === q.question_id;
    const changedChoice = sameQuestion && previous.optionId !== selectedOptionId;
    const changedQuestionOrChoice = !sameQuestion || changedChoice;
    lastSelectionRef.current = { attemptId: session.attempt.attempt_id, questionId: q.question_id, optionId: selectedOptionId };
    if (changedQuestionOrChoice) setAnswerCheck(null);
    if (changedQuestionOrChoice && selectedOptionId && !session.expired) checkAnswer(q.question_id, selectedOptionId);
  }, [session.attempt.attempt_id, session.expired, q.question_id, selectedOptionId]);

  const loadExplanation = async () => {
    if (!selectedOptionId || session.expired || explanationLoading) return;
    if (currentExplanation) {
      setDialogOpen(true);
      return;
    }
    const sentKey = requestKey;
    setExplanationLoading(true);
    setExplanationError('');
    try {
      const response = await request<ExplanationResponse>(
        'POST',
        `/attempts/${encodeURIComponent(session.attempt.attempt_id)}/questions/${encodeURIComponent(q.question_id)}/explanation`,
        { selected_option_id: selectedOptionId },
      );
      if (requestKeyRef.current !== sentKey) return;
      setExplanation(response);
      setActiveSource(0);
      setDialogOpen(true);
    } catch (error) {
      if (requestKeyRef.current !== sentKey) return;
      const apiError = asApiError(error);
      setExplanationError(apiError.message || 'Chưa tải được lời giải. Hãy thử lại.');
    } finally {
      if (requestKeyRef.current === sentKey) setExplanationLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-36">
      {session.expired && (
        <Notice
          kind="warning"
          title="Lượt làm bài đã hết 60 phút"
          actions={
            <>
              <button type="button" className="btn btn-primary btn-lg" onClick={p.onNewAttempt}>
                <Icon name="refresh" /> Tạo lượt mới
              </button>
              <button type="button" className="btn btn-secondary btn-lg" onClick={p.onHome}>
                <Icon name="grid" /> Về thực đơn
              </button>
            </>
          }
        >
          Trà đã nguội nên lượt này không nộp được nữa. Các câu và lựa chọn của bạn vẫn hiện bên dưới để xem lại. Tạo lượt mới để nhận đề khác cho
          cùng bộ slide.
        </Notice>
      )}

      <MacaronStrip session={session} onPick={(i) => p.onGo(i)} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={q.question_id}
            aria-labelledby="q-prompt"
            className="plate p-5 sm:p-8"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            <p className="inline-flex rounded-pill bg-cream px-3 py-1 font-display font-bold">
              Câu {index + 1} trên {questions.length}
            </p>
            <h1 id="q-prompt" className="mt-4 text-2xl font-bold sm:text-3xl">
              {q.prompt}
            </h1>
            <fieldset ref={optionsRef} className="mt-6 grid gap-3">
              <legend className="sr-only">{selectedOptionId ? 'Đã chọn đáp án, không đổi được' : 'Chọn một đáp án'}</legend>
              {q.options.map((opt) => {
                const id = `opt-${q.question_id}-${opt.option_id}`;
                const checked = session.answers[q.question_id] === opt.option_id;
                const locked = !!session.expired || !!selectedOptionId;
                return (
                  <label
                    key={opt.option_id}
                    htmlFor={id}
                    className={`group flex cursor-pointer items-center gap-4 rounded-[1.4rem] p-3 pr-4 ring-2 transition-[background-color,transform,box-shadow] has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mint-deep has-[:disabled]:cursor-not-allowed ${
                      checked ? 'bg-blush-soft ring-strawberry shadow-[0_3px_0_#F28076]' : locked ? 'bg-white ring-cocoa-line opacity-60' : 'bg-white ring-cocoa-line hover:-translate-y-0.5 hover:bg-cream-soft'
                    }`}
                  >
                    <input
                      type="radio"
                      id={id}
                      name={`answer-${q.question_id}`}
                      value={opt.option_id}
                      checked={checked}
                      disabled={locked}
                      onChange={() => p.onChoose(q.question_id, opt.option_id)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-lg font-extrabold ring-2 ring-cocoa ${
                        checked ? 'bg-strawberry' : locked ? 'bg-cream' : 'bg-cream group-hover:bg-apricot'
                      }`}
                    >
                      {opt.option_id.toUpperCase()}
                    </span>
                    <span className="flex-1 text-[1.05rem]">
                      <span className="sr-only">{opt.option_id.toUpperCase()}. </span>
                      {opt.text}
                    </span>
                    {checked && <Icon name="heart" className="h-5 w-5 shrink-0 fill-strawberry text-strawberry-ink" />}
                  </label>
                );
              })}
            </fieldset>

            {selectedOptionId && currentAnswerCheck && (
              <div className="mt-4 min-h-8" aria-live="polite" aria-atomic="true">
                {currentAnswerCheck.kind === 'checking' ? (
                  <p role="status" aria-busy="true" className="font-bold text-cocoa-soft">Đang kiểm tra đáp án…</p>
                ) : currentAnswerCheck.kind === 'result' ? (
                  <div role="status" className={`rounded-xl p-3 ring-2 ${currentAnswerCheck.isCorrect ? 'bg-mint-soft text-mint-deep ring-mint' : 'bg-blush-soft text-strawberry-ink ring-strawberry/50'}`}>
                    <p className="font-display text-lg font-extrabold">{currentAnswerCheck.isCorrect ? 'Đúng' : 'Chưa đúng'}</p>
                    <p className="mt-1 font-bold">
                      Đáp án đúng: {currentAnswerCheck.correctOptionId.toUpperCase()} · {q.options.find((option) => option.option_id === currentAnswerCheck.correctOptionId)?.text ?? 'Xem trên slide'}
                    </p>
                  </div>
                ) : (
                  <div role="alert" className="flex flex-wrap items-center gap-3 text-sm font-bold text-strawberry-ink">
                    <span>{currentAnswerCheck.message}</span>
                    <button type="button" className="btn btn-quiet" onClick={() => checkAnswer(q.question_id, selectedOptionId)}>Kiểm tra lại</button>
                  </div>
                )}
              </div>
            )}

            {selectedOptionId && (
              <div className="mt-5">
                <button
                  ref={explainButtonRef}
                  type="button"
                  className="btn btn-secondary"
                  disabled={!!session.expired || explanationLoading}
                  aria-busy={explanationLoading}
                  aria-haspopup="dialog"
                  aria-controls="question-explanation-dialog"
                  onClick={loadExplanation}
                >
                  <Icon name="file" />
                  {explanationLoading ? 'Đang đọc slide và tạo lời giải…' : currentExplanation ? 'Mở lại slide và lời giải' : 'Xem slide và lời giải'}
                </button>
                <p className="mt-2 text-sm text-cocoa-soft">
                  {session.attempt.mode === 'fake'
                    ? 'Chế độ mẫu: trang nguồn và lời giải được mô phỏng để xem giao diện.'
                    : 'Khi bấm, bạn sẽ thấy trang nguồn và lời giải thích dễ hiểu do AI tạo.'}
                </p>
                {explanationError && <p role="alert" className="mt-2 text-sm font-bold text-strawberry-ink">{explanationError}</p>}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="btn btn-secondary" disabled={index === 0} onClick={() => p.onGo(index - 1)}>
                <Icon name="left" /> Câu trước
              </button>
              {index < questions.length - 1 && (
                <button type="button" className="btn btn-secondary" onClick={() => p.onGo(index + 1)}>
                  Câu tiếp <Icon name="right" />
                </button>
              )}
            </div>
            <p className="mt-4 hidden text-sm text-cocoa-soft sm:block">
              Bấm phím <Kbd>A</Kbd>–<Kbd>D</Kbd> để chọn nhanh, <Kbd>←</Kbd> <Kbd>→</Kbd> để chuyển câu. Bấm vào macaron ở trên để nhảy tới câu bất kỳ.
            </p>
          </motion.section>
        </AnimatePresence>

        <aside aria-labelledby="source-title" className="space-y-3">
          <h2 id="source-title" className="text-xl font-bold">
            Nguồn của câu này
          </h2>
          <TeaTag locked title={slideNumber ? `Slide ${slideNumber}` : 'Một trong 14 bộ slide'} page="?">
            Tên file và số trang hiện sau khi nộp bài.
          </TeaTag>
          <p className="text-sm text-cocoa-soft">Câu hỏi chỉ lấy từ slide đã được nhóm duyệt và xuất bản.</p>
        </aside>
      </div>

      <ExplanationDialog
        dialogRef={dialogRef}
        explanation={currentExplanation}
        options={q.options}
        sourcePage={sourcePage}
        activeSource={activeSource}
        imageUnavailable={imageUnavailable}
        onImageError={() => setImageUnavailable(true)}
        onSelectSource={setActiveSource}
        onClose={() => setDialogOpen(false)}
      />

      {!session.expired && <ActionTray {...p} answered={answered} total={questions.length} />}
    </div>
  );
}

function ExplanationDialog({
  dialogRef,
  explanation,
  options,
  sourcePage,
  activeSource,
  imageUnavailable,
  onImageError,
  onSelectSource,
  onClose,
}: {
  dialogRef: React.RefObject<HTMLDialogElement>;
  explanation: ExplanationResponse | null;
  options: { option_id: string; text: string }[];
  sourcePage: ExplanationSourcePage | null;
  activeSource: number;
  imageUnavailable: boolean;
  onImageError: () => void;
  onSelectSource: (index: number) => void;
  onClose: () => void;
}) {
  const questionTitle = explanation ? `Slide ${String(sourcePage?.slide_number ?? '').padStart(2, '0')} · trang ${sourcePage?.page ?? ''}` : 'Lời giải';
  const imageUrl = sourcePage?.image_url ? sameOriginUrl(sourcePage.image_url) : null;
  const correctOption = explanation?.correct_option_id;

  return (
    <dialog
      ref={dialogRef}
      id="question-explanation-dialog"
      aria-labelledby="explanation-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto border-0 bg-transparent p-3 backdrop:bg-cocoa/60 sm:p-6"
    >
      {explanation && (
        <div className="mx-auto my-2 max-w-7xl rounded-blob bg-cream p-4 shadow-lift ring-2 ring-cocoa-line sm:my-6 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex rounded-pill bg-mint px-3 py-1 font-display font-bold">Nguồn và lời giải</p>
              <h2 id="explanation-title" className="mt-2 text-2xl font-extrabold sm:text-3xl">{questionTitle}</h2>
              <p className="mt-1 text-sm text-cocoa-soft">Trang nguồn và lời giải được mở theo yêu cầu của bạn.</p>
            </div>
            <button data-dialog-close type="button" className="btn btn-secondary" onClick={onClose}>
              <Icon name="cross" /> Đóng
            </button>
          </div>

          {explanation.source_pages.length > 1 && (
            <nav aria-label="Trang nguồn của câu hỏi" className="mt-4 flex flex-wrap gap-2">
              {explanation.source_pages.map((source, index) => (
                <button
                  key={source.source_id}
                  type="button"
                  aria-pressed={activeSource === index}
                  onClick={() => onSelectSource(index)}
                  className={`rounded-pill px-4 py-2 font-bold ring-2 transition-colors ${activeSource === index ? 'bg-strawberry ring-cocoa' : 'bg-white ring-cocoa-line hover:bg-cream-soft'}`}
                >
                  Slide {String(source.slide_number).padStart(2, '0')} · trang {source.page}
                </button>
              ))}
            </nav>
          )}

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
            <section aria-labelledby="source-page-title" className="min-w-0">
              <h3 id="source-page-title" className="mb-2 text-xl font-bold">Trang slide đầy đủ · {sourcePage?.file_name ?? 'Nguồn'}</h3>
              {sourcePage && imageUrl && !imageUnavailable ? (
                <div className="max-h-[72vh] overflow-auto rounded-2xl bg-white p-2 shadow-plate ring-2 ring-cocoa-line sm:p-4">
                  <img
                    src={imageUrl}
                    alt={`Toàn bộ trang ${sourcePage.page} của ${sourcePage.file_name}`}
                    className="mx-auto h-auto max-h-[68vh] w-auto max-w-full object-contain"
                    onError={onImageError}
                  />
                </div>
              ) : sourcePage ? (
                <div className="min-h-[26rem] rounded-2xl bg-white p-5 shadow-plate ring-2 ring-cocoa-line sm:p-8">
                  <p className="mb-4 rounded-xl bg-cream-soft p-3 text-sm text-cocoa-soft">
                    {sourcePage.text_is_complete
                      ? imageUnavailable
                        ? 'Không tải được ảnh trang slide gốc. Bên dưới là toàn bộ văn bản trích xuất được của trang; bố cục và hình minh họa gốc không được hiển thị.'
                        : 'Ảnh trang slide gốc chưa có trên máy chủ. Bên dưới là toàn bộ văn bản trích xuất được của trang; bố cục và hình minh họa gốc không được hiển thị.'
                      : imageUnavailable
                        ? 'Không tải được ảnh trang slide gốc. Bên dưới chỉ có phần văn bản trích xuất hiện có; phần này có thể chưa gồm toàn bộ nội dung trang, bố cục hoặc hình minh họa.'
                        : 'Ảnh trang slide gốc chưa có trên máy chủ. Bên dưới chỉ có phần văn bản trích xuất hiện có; phần này có thể chưa gồm toàn bộ nội dung trang, bố cục hoặc hình minh họa.'}
                  </p>
                  <p className="mb-3 font-display text-lg font-bold">Slide {String(sourcePage.slide_number).padStart(2, '0')} · trang {sourcePage.page}</p>
                  <pre className="whitespace-pre-wrap break-words font-body text-base leading-relaxed text-cocoa">{sourcePage.text || 'Trang nguồn chưa có văn bản trích xuất.'}</pre>
                </div>
              ) : (
                <p className="rounded-2xl bg-white p-5 text-cocoa-soft ring-2 ring-cocoa-line">Không có trang nguồn cho câu này.</p>
              )}
              {sourcePage && <p className="mt-2 break-all text-sm text-cocoa-soft">Nguồn: {sourcePage.file_name} · trang {sourcePage.page} · {sourcePage.source_id}</p>}
            </section>

            <section aria-labelledby="explanation-title" className="rounded-blob bg-white p-5 shadow-plate ring-2 ring-cocoa-line sm:p-6">
              <h3 className="text-xl font-extrabold">Lời giải dễ hiểu</h3>
              <p className="mt-3 rounded-xl bg-mint-soft p-3 font-bold text-mint-deep">
                Đáp án đúng: {correctOption?.toUpperCase()} · {options.find((option) => option.option_id === correctOption)?.text ?? 'Xem trên trang slide'}
              </p>
              {explanation.selected_option_id !== correctOption && (
                <p className="mt-3 rounded-xl bg-blush-soft p-3 text-strawberry-ink">
                  Bạn đã chọn {explanation.selected_option_id.toUpperCase()}. Hãy đối chiếu lựa chọn này với đáp án đúng trên slide.
                </p>
              )}
              <p className="mt-4 whitespace-pre-wrap leading-relaxed text-cocoa">{explanation.explanation}</p>
            </section>
          </div>
        </div>
      )}
    </dialog>
  );
}

function sameOriginUrl(value: string): string | null {
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin ? url.toString() : null;
  } catch {
    return null;
  }
}

function ActionTray(p: QuizProps & { answered: number; total: number }) {
  const { bar, session, answered, total } = p;
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (bar.kind === 'confirm') confirmRef.current?.focus();
  }, [bar.kind]);

  const missing = session.missing?.length
    ? session.missing.map((qid) => 'câu ' + (session.attempt.questions.findIndex((q) => q.question_id === qid) + 1)).join(', ')
    : null;

  let status: React.ReactNode;
  let actions: React.ReactNode;
  if (bar.kind === 'confirm') {
    status = (
      <>
        <strong className="font-display text-lg">
          Nộp {answered}/{total} câu?
        </strong>{' '}
        Sau khi nộp không đổi được đáp án.
      </>
    );
    actions = (
      <>
        <button type="button" className="btn btn-quiet" onClick={p.onCancelConfirm}>
          Xem lại
        </button>
        <button ref={confirmRef} type="button" id="confirm-submit" className="btn btn-primary btn-lg" onClick={p.onConfirm}>
          Nộp bài
        </button>
      </>
    );
  } else if (bar.kind === 'sending') {
    status = <span aria-busy="true">Đang chấm bài…</span>;
    actions = null;
  } else if (bar.kind === 'error') {
    status = (
      <span role="alert" className="text-strawberry-ink">
        <strong>{bar.title}.</strong> {bar.body}
      </span>
    );
    actions =
      bar.action === 'home' ? (
        <button type="button" className="btn btn-primary" onClick={p.onHome}>
          Về thực đơn
        </button>
      ) : (
        <button type="button" className="btn btn-primary btn-lg" onClick={bar.action === 'retry' ? p.onRetrySend : p.onRequestSubmit}>
          {bar.action === 'retry' ? 'Gửi lại' : 'Nộp bài'}
        </button>
      );
  } else {
    status = missing ? (
      <span className="text-apricot-deep">
        <strong>Còn {session.missing!.length} câu chưa trả lời:</strong> {missing}.
      </span>
    ) : (
      <span>
        Đã trả lời <strong className="font-display text-lg">{answered}/{total}</strong>
      </span>
    );
    actions = (
      <button type="button" className="btn btn-primary btn-lg" onClick={p.onRequestSubmit}>
        Nộp bài
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 px-3 pb-3 sm:px-6 sm:pb-5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-blob bg-white/95 p-3 pl-5 shadow-lift ring-2 ring-cocoa-line backdrop-blur">
        <div className="min-w-0 flex-1">
          <p className="text-[1.02rem]">{status}</p>
          <div aria-hidden="true" className="mt-2 h-2 max-w-xs overflow-hidden rounded-pill bg-cream">
            <div className="h-full rounded-pill bg-strawberry transition-[width] duration-300" style={{ width: `${(answered / total) * 100}%` }} />
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded-md bg-white px-1.5 py-0.5 font-body text-xs font-bold shadow-[0_2px_0_#E9CDBB] ring-1 ring-cocoa-line">{children}</kbd>;
}

/** Citation drawn as a tea-bag tag on its string. */
export function TeaTag({ title, page, locked = false, children }: { title: string; page: string | number; locked?: boolean; children?: React.ReactNode }) {
  return (
    <div className="relative pl-6">
      <span aria-hidden="true" className="absolute left-[9px] top-0 h-full w-0.5 rounded bg-cocoa-line" />
      <span aria-hidden="true" className="absolute left-[3px] top-0 h-3.5 w-3.5 rounded-full bg-white ring-2 ring-cocoa" />
      <div className={`relative rounded-2xl p-4 ${locked ? 'border-2 border-dashed border-cocoa-line bg-cream-soft' : 'bg-white shadow-plate ring-2 ring-cocoa-line'}`}>
        <span
          aria-hidden="true"
          className={`absolute -left-3 top-4 grid h-12 w-10 place-items-center rounded-l-lg rounded-r-md font-display text-xs font-extrabold leading-tight ring-2 ring-cocoa ${
            locked ? 'bg-cream' : 'bg-mint'
          }`}
        >
          {locked ? <Icon name="lock" className="h-4 w-4" /> : <>tr.<br />{page}</>}
        </span>
        <div className="pl-8">
          <p className="font-display text-lg font-bold">{title}</p>
          {children && <div className="text-sm text-cocoa-soft">{children}</div>}
        </div>
      </div>
    </div>
  );
}
