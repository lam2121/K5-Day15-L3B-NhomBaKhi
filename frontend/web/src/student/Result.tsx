import { ScoreCake } from '../art/art';
import { pad2 } from '../shared/api';
import { Icon } from '../shared/ui';
import { MacaronStrip, TeaTag } from './Quiz';
import type { Session } from './session';

interface Props {
  session: Session;
  onRetake: () => void;
  onHome: () => void;
}

function jumpTo(qid: string) {
  const target = document.getElementById('review-' + qid);
  if (!target) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  target.focus({ preventScroll: true });
}

export function Result({ session, onRetake, onHome }: Props) {
  const result = session.result!;
  const questions = new Map(session.attempt.questions.map((q) => [q.question_id, q]));
  const wrong = result.total_questions - result.correct_count;
  const percent = Math.round(result.score_percent);

  return (
    <div className="space-y-8">
      <section aria-labelledby="score-title" className="plate relative overflow-hidden p-6 sm:p-8">
        <div className="grid items-center gap-6 md:grid-cols-[220px_1fr]">
          <ScoreCake results={result.items.map((i) => i.is_correct)} className="mx-auto w-full max-w-[220px]" />
          <div>
            <p className="font-display text-6xl font-extrabold leading-none text-strawberry-ink">
              {result.correct_count}
              <span className="text-3xl text-cocoa-soft">/{result.total_questions}</span>
            </p>
            <h1 id="score-title" className="mt-2 text-3xl font-extrabold">
              {percent}% câu đúng
            </h1>
            <p className="mt-2 max-w-xl text-lg text-cocoa-soft">
              {wrong === 0
                ? `Trọn chiếc bánh! Bạn đúng cả ${result.total_questions} câu. Mỗi câu vẫn kèm trang slide để bạn đọc lại.`
                : `Mỗi miếng bánh có dâu là một câu đúng. ${wrong} câu sai được đánh dấu bên dưới, kèm đáp án đúng và trang slide để đọc lại.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="btn btn-primary btn-lg" onClick={onRetake}>
                <Icon name="refresh" /> Làm đề mới cùng bộ
              </button>
              <button type="button" className="btn btn-secondary btn-lg" onClick={onHome}>
                <Icon name="grid" /> Chọn đề khác
              </button>
            </div>
          </div>
        </div>
      </section>

      <MacaronStrip session={session} onPick={(_, qid) => jumpTo(qid)} />

      <ol aria-label="Đáp án từng câu" className="space-y-5">
        {result.items.map((item, i) => {
          const q = questions.get(item.question_id);
          if (!q) return null;
          return (
            <li
              key={item.question_id}
              id={'review-' + item.question_id}
              tabIndex={-1}
              className={`plate grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_300px] ${item.is_correct ? '' : 'ring-2 ring-strawberry'}`}
            >
              <div>
                <p
                  className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 font-display font-bold ${
                    item.is_correct ? 'bg-mint-soft text-mint-deep' : 'bg-blush-soft text-strawberry-ink'
                  }`}
                >
                  <Icon name={item.is_correct ? 'check' : 'cross'} className="h-4 w-4" />
                  Câu {i + 1} · {item.is_correct ? 'đúng' : 'sai'}
                </p>
                <h2 className="mt-3 text-xl font-bold sm:text-2xl">{q.prompt}</h2>
                <ul className="mt-4 grid gap-2">
                  {q.options.map((opt) => {
                    const isKey = opt.option_id === item.correct_option_id;
                    const isPicked = opt.option_id === item.selected_option_id;
                    const tag = isKey && isPicked ? 'Bạn chọn, đúng' : isKey ? 'Đáp án đúng' : isPicked ? 'Bạn chọn' : null;
                    return (
                      <li
                        key={opt.option_id}
                        className={`flex items-center gap-3 rounded-2xl p-2.5 pr-3 ring-2 ${
                          isKey ? 'bg-mint-soft ring-mint' : isPicked ? 'bg-blush-soft ring-strawberry' : 'bg-white ring-cocoa-line/60'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display font-extrabold ring-2 ring-cocoa ${
                            isKey ? 'bg-mint' : isPicked ? 'bg-strawberry' : 'bg-cream'
                          }`}
                        >
                          {opt.option_id.toUpperCase()}
                        </span>
                        <span className="flex-1">
                          <span className="sr-only">{opt.option_id.toUpperCase()}. </span>
                          {opt.text}
                        </span>
                        {tag && (
                          <span className={`shrink-0 rounded-pill px-2.5 py-0.5 text-sm font-bold ${isKey ? 'bg-white text-mint-deep' : 'bg-white text-strawberry-ink'}`}>
                            {tag}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold">{item.citations.length > 1 ? `Nguồn (${item.citations.length})` : 'Nguồn'}</h3>
                {item.citations.map((c) => (
                  <TeaTag key={c.source_id} title={`Slide ${pad2(c.slide_number)}, trang ${c.page}`} page={c.page}>
                    <p className="break-all">{c.file_name}</p>
                    <p className="break-all">Mã đoạn {c.source_id}</p>
                  </TeaTag>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="text-sm text-cocoa-soft">Điểm chỉ để tự ôn. Mã yêu cầu {result.request_id}.</p>
    </div>
  );
}
