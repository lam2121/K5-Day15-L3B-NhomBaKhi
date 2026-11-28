import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Backdrop, TeaPour, TeacupMark } from '../art/art';
import { IS_MOCK, asApiError, pad2, request, type ApiError } from '../shared/api';
import type { AttemptResponse, CatalogExam, SubmissionResponse } from '../shared/types';
import { Announcer, Awning, Icon, MockBadge, Notice } from '../shared/ui';
import { Catalog } from './Catalog';
import { Quiz, type BarState } from './Quiz';
import { Result } from './Result';
import { RETRYABLE, errorCopy, examFromId, examTitle, loadSession, saveSession, type Session } from './session';

type View =
  | { name: 'catalog' }
  | { name: 'generating'; exam: CatalogExam }
  | { name: 'generate-error'; exam: CatalogExam; error: ApiError }
  | { name: 'quiz' }
  | { name: 'result' };

function initialView(session: Session | null): View {
  if (!session) return { name: 'catalog' };
  return session.result ? { name: 'result' } : { name: 'quiz' };
}

export function App() {
  const [session, setSessionState] = useState<Session | null>(() => loadSession());
  const [view, setView] = useState<View>(() => initialView(session));
  const [bar, setBar] = useState<BarState>({ kind: 'idle' });
  const [announcement, setAnnouncement] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const catalogRef = useRef<CatalogExam[] | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const setSession = useCallback((next: Session | null) => {
    setSessionState(next);
    saveSession(next);
  }, []);

  const announce = (text: string) => {
    setAnnouncement('');
    setTimeout(() => setAnnouncement(text), 30);
  };

  const focusMain = () => {
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  };

  /* ----- timer ----- */
  const timing = view.name === 'quiz' && session && !session.result && !session.expired;
  useEffect(() => {
    if (!timing) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timing]);

  const secondsLeft = session ? Math.round((Date.parse(session.attempt.expires_at) - now) / 1000) : 0;
  useEffect(() => {
    if (!timing || !session) return;
    if (secondsLeft <= 0) {
      setSession({ ...session, expired: true });
      setBar({ kind: 'idle' });
      announce('Lượt làm bài đã hết giờ.');
      focusMain();
    } else if (secondsLeft === 300) announce('Còn 5 phút.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, timing]);

  /* ----- titles ----- */
  useEffect(() => {
    if (view.name === 'catalog') document.title = 'CramAI · Tiệc trà';
    else if (view.name === 'generating') document.title = 'Đang pha đề · CramAI';
    else if (view.name === 'result' && session?.result) document.title = `Kết quả ${session.result.correct_count}/${session.result.total_questions} · CramAI`;
    else if (session?.expired) document.title = 'Hết giờ · CramAI';
    else if (session) document.title = session.title + ' · CramAI';
  }, [view, session]);

  /* ----- actions ----- */
  const goHome = () => {
    if (session && (session.result || session.expired)) setSession(null);
    setBar({ kind: 'idle' });
    setView({ name: 'catalog' });
    focusMain();
  };

  const start = (exam: CatalogExam) => {
    setBar({ kind: 'idle' });
    setView({ name: 'generating', exam });
    focusMain();
    announce('Đang tạo đề.');
    request<AttemptResponse>('POST', '/attempts', { exam_id: exam.exam_id }).then(
      (attempt) => {
        setSession({ attempt, title: examTitle(exam), answers: {}, current: 0, result: null });
        setView({ name: 'quiz' });
        setNow(Date.now());
        focusMain();
      },
      (err) => {
        setView({ name: 'generate-error', exam, error: asApiError(err) });
        focusMain();
      },
    );
  };

  const newAttempt = () => {
    if (!session) return;
    const exam = examFromId(session.attempt.exam_id, catalogRef.current);
    setSession(null);
    start(exam);
  };

  const choose = (qid: string, optionId: string) => {
    if (!session || session.expired || session.result) return;
    if (session.answers[qid]) return; // mỗi câu chỉ được chọn một lần
    setSession({ ...session, answers: { ...session.answers, [qid]: optionId }, missing: session.missing?.filter((id) => id !== qid) });
    if (bar.kind === 'confirm' || bar.kind === 'error') setBar({ kind: 'idle' });
  };

  const go = (index: number) => {
    if (!session || index < 0 || index >= session.attempt.questions.length) return;
    setSession({ ...session, current: index });
    if (bar.kind === 'confirm') setBar({ kind: 'idle' });
    window.scrollTo(0, 0);
  };

  const requestSubmit = () => {
    if (!session) return;
    const missing = session.attempt.questions.filter((q) => !session.answers[q.question_id]).map((q) => q.question_id);
    if (missing.length) {
      const first = session.attempt.questions.findIndex((q) => q.question_id === missing[0]);
      setSession({ ...session, missing, current: first });
      setBar({ kind: 'idle' });
      announce(`Còn ${missing.length} câu chưa trả lời. Đã chuyển đến câu ${first + 1}.`);
      return;
    }
    setBar({ kind: 'confirm' });
  };

  const submit = () => {
    if (!session) return;
    const answers = session.attempt.questions.map((q) => ({ question_id: q.question_id, option_id: session.answers[q.question_id] }));
    setBar({ kind: 'sending' });
    request<SubmissionResponse>('POST', '/submissions', { attempt_id: session.attempt.attempt_id, answers }).then(
      (result) => {
        setSession({ ...session, result });
        setBar({ kind: 'idle' });
        setView({ name: 'result' });
        focusMain();
        announce(`Đã chấm: ${result.correct_count} trên ${result.total_questions} câu đúng.`);
      },
      (raw) => {
        const err = asApiError(raw);
        if (err.code === 'quiz_unavailable') {
          setSession({ ...session, expired: true });
          setBar({ kind: 'idle' });
          announce('Lượt làm bài không còn.');
          focusMain();
          return;
        }
        const [title, body] = errorCopy(err.code);
        const action = err.code === 'already_submitted' ? 'home' : err.code === 'network' || err.code === 'internal_error' ? 'retry' : 'submit';
        setBar({ kind: 'error', title, body, action });
      },
    );
  };

  /* ----- keyboard: A-D choose, arrows move ----- */
  useEffect(() => {
    if (view.name !== 'quiz' || !session || session.result || session.expired) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'radio')) return;
      const q = session.attempt.questions[session.current];
      const key = event.key.toLowerCase();
      if (['a', 'b', 'c', 'd'].includes(key) && q.options.some((o) => o.option_id === key)) {
        choose(q.question_id, key);
        document.getElementById(`opt-${q.question_id}-${key}`)?.focus();
      } else if (event.key === 'ArrowRight' && (target as HTMLInputElement)?.type !== 'radio') go(session.current + 1);
      else if (event.key === 'ArrowLeft' && (target as HTMLInputElement)?.type !== 'radio') go(session.current - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  /* ----- header meta ----- */
  let meta: React.ReactNode = null;
  if (view.name === 'quiz' && session) {
    if (session.expired) meta = <Pill tone="warn">Hết giờ</Pill>;
    else {
      const left = Math.max(0, secondsLeft);
      meta = (
        <Pill tone={left <= 300 ? 'low' : 'calm'} label={`Còn ${Math.floor(left / 60)} phút`}>
          <Icon name="clock" className="h-4 w-4" />
          còn {pad2(Math.floor(left / 60))}:{pad2(left % 60)}
        </Pill>
      );
    }
  } else if (view.name === 'result') meta = <Pill tone="mint">Đã nộp</Pill>;

  const showTitle = view.name !== 'catalog' ? (view.name === 'generating' || view.name === 'generate-error' ? examTitle(view.exam) : session?.title) : null;
  const resumable = session && !session.result && !session.expired && Date.parse(session.attempt.expires_at) > Date.now() ? session.title : null;

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only-focusable fixed left-3 top-3 z-50 rounded-pill bg-white px-4 py-2 font-bold shadow-lift">
        Bỏ qua tới nội dung
      </a>
      <div className="sticky top-0 z-30">
        <Awning />
      </div>
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 pt-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <a
            href="./"
            onClick={(e) => {
              e.preventDefault();
              goHome();
            }}
            className="flex items-center gap-2 rounded-pill bg-white py-1.5 pl-2 pr-4 shadow-plate ring-1 ring-cocoa-line/60 transition-transform hover:-translate-y-0.5"
          >
            <TeacupMark className="h-8 w-8" />
            <span className="font-display text-xl font-extrabold">CramAI</span>
          </a>
          {showTitle && <p className="hidden truncate font-display text-lg font-bold text-cocoa-soft md:block">{showTitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {IS_MOCK && <MockBadge />}
          {meta}
        </div>
      </header>

      <main id="main" ref={mainRef} tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8 outline-none sm:px-6 sm:py-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {view.name === 'catalog' && (
              <Catalog
                resumeTitle={resumable}
                onResume={() => {
                  setView({ name: 'quiz' });
                  setNow(Date.now());
                  focusMain();
                }}
                onStart={start}
                onLoaded={(exams) => (catalogRef.current = exams)}
              />
            )}
            {view.name === 'generating' && <Generating exam={view.exam} />}
            {view.name === 'generate-error' && (
              <div className="mx-auto max-w-2xl">
                <Notice
                  kind={['insufficient_evidence', 'exam_unavailable', 'busy'].includes(view.error.code) ? 'warning' : 'error'}
                  title={errorCopy(view.error.code)[0]}
                  actions={
                    <>
                      {RETRYABLE.has(view.error.code) && (
                        <button type="button" className="btn btn-primary" onClick={() => start(view.exam)}>
                          <Icon name="refresh" /> Tạo lại đề
                        </button>
                      )}
                      <button type="button" className="btn btn-secondary" onClick={goHome}>
                        <Icon name="grid" /> Về thực đơn
                      </button>
                    </>
                  }
                >
                  {errorCopy(view.error.code)[1]}
                  {view.error.requestId && ` Mã yêu cầu ${view.error.requestId}.`}
                </Notice>
              </div>
            )}
            {view.name === 'quiz' && session && (
              <Quiz
                session={session}
                bar={bar}
                onChoose={choose}
                onGo={go}
                onRequestSubmit={requestSubmit}
                onConfirm={submit}
                onCancelConfirm={() => setBar({ kind: 'idle' })}
                onRetrySend={submit}
                onHome={goHome}
                onNewAttempt={newAttempt}
              />
            )}
            {view.name === 'result' && session?.result && <Result session={session} onRetake={newAttempt} onHome={goHome} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Backdrop />
      <Announcer text={announcement} />
    </div>
  );
}

function Pill({ tone, label, children }: { tone: 'calm' | 'low' | 'warn' | 'mint'; label?: string; children: React.ReactNode }) {
  const cls = {
    calm: 'bg-apricot text-cocoa',
    low: 'bg-strawberry text-cocoa animate-wiggle',
    warn: 'bg-cream text-cocoa ring-2 ring-apricot',
    mint: 'bg-mint text-cocoa',
  }[tone];
  return (
    <span role={label ? 'timer' : undefined} aria-label={label} className={`inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 font-display font-bold tabular-nums ${cls}`}>
      {children}
    </span>
  );
}

function Generating({ exam }: { exam: CatalogExam }) {
  return (
    <section aria-busy="true" aria-labelledby="gen-title" className="mx-auto max-w-xl py-6 text-center">
      <TeaPour className="mx-auto w-64" />
      <h1 id="gen-title" className="mt-4 text-3xl font-extrabold">
        Đang pha đề {exam.question_count} câu…
      </h1>
      <p className="mt-2 text-lg text-cocoa-soft">
        CramAI đọc các slide đã duyệt và chỉ giữ câu có căn cứ. Việc này thường mất vài giây đến nửa phút, đủ để rót một tách trà.
      </p>
    </section>
  );
}
