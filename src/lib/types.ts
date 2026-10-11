/** アプリ内ビュー（URLは常に / のまま、状態で画面を切り替える） */
export type AppView =
  | { kind: "dashboard" }
  | { kind: "learn" }
  | { kind: "track"; trackSlug: string }
  | { kind: "lesson"; trackSlug: string; lessonSlug: string }
  | { kind: "playground"; fileId?: string };

/** クライアントとのデータ受け渡し用 DTO */

export type FileNodeDTO = {
  id: string;
  parentId: string | null;
  type: "file" | "folder";
  name: string;
  content: string;
  updatedAt: string;
};

export type LessonListItemDTO = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  kind: string;
  sortOrder: number;
  completed: boolean;
};

export type LessonDetailDTO = LessonListItemDTO & {
  content: string;
  language: string;
  starterCode: string;
  solutionCode: string;
  expectedOutput: string | null;
};

export type TrackDTO = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  sortOrder: number;
  lessonCount: number;
  completedCount: number;
  nextLessonSlug: string | null;
};

export type TrackDetailDTO = TrackDTO & {
  lessons: LessonListItemDTO[];
};
