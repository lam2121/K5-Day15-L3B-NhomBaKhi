import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import '../shared/index.css';
import { IS_MOCK, setMockHandler } from '../shared/api';
import { AdminApp } from './AdminApp';

async function boot() {
  // The synthetic mock is a separate chunk, fetched only with ?mock=1.
  if (IS_MOCK) setMockHandler((await import('./mock')).mockRequest);
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MotionConfig reducedMotion="user">
        <AdminApp />
      </MotionConfig>
    </StrictMode>,
  );
}

boot();
