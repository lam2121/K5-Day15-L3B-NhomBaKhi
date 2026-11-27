import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MiniMacaron, type MacaronState } from '../art/art';
import { Icon, Notice } from '../shared/ui';
import type { Session } from './session';

export type BarState =
  | { kind: 'idle' }
  | { kind: 'confirm' }
  | { kind: 'sending' }
  | { kind: 'error'; title: string; body: string; action: 'retry' | 'submit' | 'home' };

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
  const optionsRef = useRef<HTMLFieldSetElement>(null);

  // Move focus to the chosen or first option when the question changes.
  useEffect(() => {
    const root = optionsRef.current;
    if (!root || document.activeElement === document.body) return;
    const target = root.querySelector<HTMLInputElement>('input:checked') ?? root.querySelector<HTMLInputElement>('input');
    target?.focus({ preventScroll: true });
  }, [index]);

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
              <legend className="sr-only">Chọn một đáp án</legend>
              {q.options.map((opt) => {
                const id = `opt-${q.question_id}-${opt.option_id}`;
                const checked = session.answers[q.question_id] === opt.option_id;
                return (
                  <label
                    key={opt.option_id}
                    htmlFor={id}
                    className={`group flex cursor-pointer items-center gap-4 rounded-[1.4rem] p-3 pr-4 ring-2 transition-[background-color,transform,box-shadow] has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mint-deep has-[:disabled]:cursor-not-allowed ${
                      checked ? 'bg-blush-soft ring-strawberry shadow-[0_3px_0_#F28076]' : 'bg-white ring-cocoa-line hover:-translate-y-0.5 hover:bg-cream-soft'
                    }`}
                  >
                    <input
                      type="radio"
                      id={id}
                      name={`answer-${q.question_id}`}
                      value={opt.option_id}
                      checked={checked}
                      disabled={!!session.expired}
                      onChange={() => p.onChoose(q.question_id, opt.option_id)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-lg font-extrabold ring-2 ring-cocoa ${
                        checked ? 'bg-strawberry' : 'bg-cream group-hover:bg-apricot'
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

      {!session.expired && <ActionTray {...p} answered={answered} total={questions.length} />}
    </div>
  );
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
