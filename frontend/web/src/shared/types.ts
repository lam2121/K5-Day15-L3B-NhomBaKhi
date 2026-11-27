// Shapes from specs/003-cramai-exams/contracts/openapi.json.

export interface CatalogExam {
  exam_id: string;
  title: string;
  slide_number: number | null;
  available: boolean;
  reason: string | null;
  question_count: number;
}

export interface CatalogResponse {
  exams: CatalogExam[];
}

export interface Option {
  option_id: string;
  text: string;
}

export interface PublicQuestion {
  question_id: string;
  prompt: string;
  options: Option[];
}

export interface AttemptResponse {
  request_id: string;
  mode: string;
  attempt_id: string;
  exam_id: string;
  expires_at: string;
  questions: PublicQuestion[];
}

export interface Citation {
  slide_number: number;
  source_id: string;
  file_name: string;
  page: number;
}

export interface ScoredQuestion {
  question_id: string;
  selected_option_id: string;
  correct_option_id: string;
  is_correct: boolean;
  citations: Citation[];
}

export interface SubmissionResponse {
  request_id: string;
  attempt_id: string;
  correct_count: number;
  total_questions: number;
  score_percent: number;
  items: ScoredQuestion[];
}

export interface DocumentSummary {
  file_name: string;
  page_count: number;
}

export interface RevisionSummary {
  revision_id: string;
  documents: DocumentSummary[];
  passage_count: number;
}

export interface AdminSlot {
  slide_number: number;
  title: string;
  draft: RevisionSummary | null;
  published: RevisionSummary | null;
}

export interface AdminList {
  slides: AdminSlot[];
}

export interface DraftPreview {
  citation: Citation;
  text: string;
}

export interface AdminDetail {
  slot: AdminSlot;
  draft_preview: DraftPreview[];
}
