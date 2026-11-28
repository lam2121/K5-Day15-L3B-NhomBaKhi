import type { ReactNode } from 'react';

const PATHS = {
  clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  cross: 'M6 6l12 12M18 6 6 18',
  alert: 'M12 8v5m0 3.5v.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  info: 'M12 11v6m0-9.5v.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  left: 'M19 12H5m6-6-6 6 6 6',
  right: 'M5 12h14m-6-6 6 6-6 6',
  refresh: 'M20 11a8 8 0 0 0-14.9-3.9M4 4v4h4m-4 5a8 8 0 0 0 14.9 3.9M20 20v-4h-4',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  upload: 'M12 16V4m-5 5 5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
  publish: 'M5 12l4 4 10-10M5 20h14',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',
  heart: 'M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
      <path d={PATHS[name]} />
    </svg>
  );
}

type NoticeKind = 'info' | 'warning' | 'error' | 'success';
const NOTICE_STYLE: Record<NoticeKind, { box: string; icon: IconName; iconBox: string }> = {
  info: { box: 'bg-mint-soft ring-mint/50', icon: 'info', iconBox: 'bg-mint' },
  success: { box: 'bg-mint-soft ring-mint/50', icon: 'check', iconBox: 'bg-mint' },
  warning: { box: 'bg-cream-soft ring-apricot', icon: 'alert', iconBox: 'bg-apricot' },
  error: { box: 'bg-blush-soft ring-strawberry/60', icon: 'alert', iconBox: 'bg-strawberry' },
};

export function Notice({ kind, title, children, actions }: { kind: NoticeKind; title: string; children?: ReactNode; actions?: ReactNode }) {
  const s = NOTICE_STYLE[kind];
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`flex gap-4 rounded-blob p-5 ring-2 ${s.box}`}>
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-cocoa ${s.iconBox}`}>
        <Icon name={s.icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-bold">{title}</h2>
        {children && <div className="mt-1 text-cocoa-soft">{children}</div>}
        {actions && <div className="mt-4 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  );
}

/** Striped awning across the top of every page, the tea-shop canopy. */
export function Awning() {
  return (
    <div aria-hidden="true" className="pointer-events-none h-6 w-full">
      <div
        className="scallop-bottom h-full w-full"
        style={{ background: 'repeating-linear-gradient(90deg, #F28076 0 24px, #FAE0C7 24px 48px)' }}
      />
    </div>
  );
}

export function MockBadge() {
  return (
    <span className="rounded-pill bg-apricot px-3 py-1 text-sm font-bold text-cocoa" title="Câu hỏi và tên file trong chế độ này là dữ liệu mẫu, không lấy từ slide thật.">
      Dữ liệu mẫu
    </span>
  );
}

export function Announcer({ text }: { text: string }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {text}
    </div>
  );
}
