import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pastry, TieredCake } from '../art/art';
import { asApiError, pad2, request, type ApiError } from '../shared/api';
import type { CatalogExam, CatalogResponse } from '../shared/types';
import { Icon, Notice } from '../shared/ui';
import { errorCopy } from './session';

interface Props {
  resumeTitle: string | null;
  onResume: () => void;
  onStart: (exam: CatalogExam) => void;
  onLoaded: (exams: CatalogExam[]) => void;
}

export function Catalog({ resumeTitle, onResume, onStart, onLoaded }: Props) {
  const [exams, setExams] = useState<CatalogExam[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    setError(null);
    setExams(null);
    request<CatalogResponse>('GET', '/catalog').then(
      (data) => {
        if (!live) return;
        setExams(data.exams);
        onLoaded(data.exams);
      },
      (err) => live && setError(asApiError(err)),
    );
    return () => {
      live = false;
    };
    // onLoaded is stable enough for this page; reload only on retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const slides = exams?.filter((e) => e.exam_id !== 'midterm') ?? [];
  const midterm = exams?.find((e) => e.exam_id === 'midterm');

  return (
    <div className="space-y-10">
      <header className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
        <div className="max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-pill bg-white px-3 py-1 text-sm font-bold text-strawberry-ink ring-2 ring-blush">
            <Icon name="heart" className="h-4 w-4" /> Tiệc trà ôn thi L3
          </p>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Hôm nay bạn muốn ôn món nào?</h1>
          <p className="mt-3 text-lg text-cocoa-soft">
            Mỗi món bánh là một bộ slide. Chọn một món để nhận đề 5 câu trắc nghiệm do AI tạo từ slide đã duyệt. Đáp án và trang slide hiện sau khi
            nộp bài.
          </p>
        </div>
      </header>

      {resumeTitle && (
        <Notice
          kind="info"
          title={`Bạn đang làm dở ${resumeTitle}`}
          actions={
            <button type="button" className="btn btn-primary" onClick={onResume}>
              Tiếp tục làm bài
            </button>
          }
        >
          Các lựa chọn đã được giữ trong tab này.
        </Notice>
      )}

      {error && (
        <Notice
          kind="error"
          title={errorCopy(error.code)[0]}
          actions={
            <button type="button" className="btn btn-secondary" onClick={() => setTick((t) => t + 1)}>
              <Icon name="refresh" /> Tải lại thực đơn
            </button>
          }
        >
          {errorCopy(error.code)[1]}
          {error.requestId && ` Mã yêu cầu ${error.requestId}.`}
        </Notice>
      )}

      {!exams && !error && (
        <ol aria-busy="true" aria-label="Đang tải thực đơn" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <li key={i} className="plate h-56 animate-pulse bg-cream-soft" />
          ))}
        </ol>
      )}

      {exams && (
        <>
          <section aria-labelledby="menu-title">
            <h2 id="menu-title" className="mb-4 text-2xl font-bold">
              14 bộ slide
            </h2>
            <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {slides.map((exam, i) => (
                <motion.li
                  key={exam.exam_id}
                  className="flex"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <PastryCard exam={exam} index={i} onStart={onStart} />
                </motion.li>
              ))}
            </ol>
          </section>

          {midterm && <Midterm exam={midterm} slides={slides} onStart={onStart} />}
        </>
      )}

      <p className="text-sm text-cocoa-soft">
        Đề do AI tạo chỉ dùng để tự ôn, không phải điểm thi. Kiểm lại đáp án với tên file và số trang trước khi tin.
      </p>
    </div>
  );
}

function PastryCard({ exam, index, onStart }: { exam: CatalogExam; index: number; onStart: (e: CatalogExam) => void }) {
  const n = pad2(exam.slide_number ?? 0);
  const reasonId = `reason-${exam.exam_id}`;
  return (
    <button
      type="button"
      disabled={!exam.available}
      aria-describedby={exam.available ? undefined : reasonId}
      onClick={() => onStart(exam)}
      className="plate group flex w-full flex-col p-3 text-left transition-[transform,box-shadow] duration-200 enabled:hover:-translate-y-1 enabled:hover:shadow-lift enabled:active:translate-y-0 disabled:cursor-not-allowed disabled:bg-cream-soft"
    >
      <span className="relative block rounded-[1.4rem] bg-cream-soft px-2 pt-3 group-enabled:group-hover:bg-blush-soft">
        <Pastry index={index} covered={!exam.available} className="mx-auto h-24 w-full transition-transform duration-300 group-enabled:group-hover:-rotate-3 group-enabled:group-hover:scale-105" />
        <span className="absolute left-2 top-2 rounded-pill bg-white px-2.5 py-0.5 font-display text-sm font-bold ring-2 ring-cocoa-line">Slide {n}</span>
      </span>
      <span className="mt-3 block px-1 font-display text-[1.05rem] font-bold leading-snug">{exam.title}</span>
      <span className="mt-auto flex items-center justify-between gap-2 px-1 pt-2 text-sm">
        {exam.available ? (
          <>
            <span className="text-cocoa-soft">{exam.question_count} câu</span>
            <span className="font-bold text-strawberry-ink group-hover:underline">Ôn ngay</span>
          </>
        ) : (
          <span className="rounded-pill bg-white px-2.5 py-0.5 font-bold text-cocoa-soft ring-2 ring-cocoa-line">Chưa mở</span>
        )}
      </span>
      {!exam.available && (
        <span id={reasonId} className="mt-1 px-1 text-sm text-cocoa-soft">
          {exam.reason || 'Chưa xuất bản.'}
        </span>
      )}
    </button>
  );
}

function Midterm({ exam, slides, onStart }: { exam: CatalogExam; slides: CatalogExam[]; onStart: (e: CatalogExam) => void }) {
  const ready = slides.map((s) => s.available);
  const readyCount = ready.filter(Boolean).length;
  return (
    <section aria-labelledby="midterm-title" className="plate relative overflow-hidden bg-gradient-to-br from-white via-white to-blush-soft p-6 sm:p-8">
      <div className="grid items-center gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
        <TieredCake ready={ready} className="mx-auto w-full max-w-[320px]" />
        <div>
          <p className="font-display text-lg font-bold text-mint-deep">Tổng hợp cả khoá</p>
          <h2 id="midterm-title" className="text-3xl font-extrabold sm:text-4xl">
            {exam.title}: bánh 14 quả dâu
          </h2>
          <p className="mt-2 max-w-xl text-lg text-cocoa-soft">
            {exam.available
              ? `${exam.question_count} câu, mỗi bộ slide góp một câu. Làm trong 60 phút.`
              : `${exam.reason || 'Cần đủ 14 bộ slide đã xuất bản.'} Mỗi quả dâu trên bánh là một bộ đã sẵn sàng: ${readyCount}/14.`}
          </p>
          <div className="mt-5">
            {exam.available ? (
              <button type="button" className="btn btn-primary btn-lg" onClick={() => onStart(exam)}>
                Làm đề giữa kỳ
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-pill bg-white px-4 py-2 font-bold text-cocoa-soft ring-2 ring-cocoa-line">
                <Icon name="lock" className="h-4 w-4" /> Chưa mở
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
