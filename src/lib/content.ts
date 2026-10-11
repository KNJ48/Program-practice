import { TRACK_SEEDS } from "@/content";
import type {
  LessonDetailDTO,
  LessonListItemDTO,
  TrackDTO,
  TrackDetailDTO,
} from "@/lib/types";

/** 進捗マップ: レッスンID → 完了フラグ（localStorageに永続化） */
export type ProgressMap = Record<string, boolean>;

/** レッスンIDは「トラック:レッスン」の固定文字列（コンテンツと同一の安定ID） */
export function lessonIdOf(trackSlug: string, lessonSlug: string): string {
  return `${trackSlug}:${lessonSlug}`;
}

export function buildTracks(progress: ProgressMap): TrackDTO[] {
  return TRACK_SEEDS.map((t, i) => {
    const completedCount = t.lessons.filter(
      (l) => progress[lessonIdOf(t.slug, l.slug)],
    ).length;
    const nextLesson =
      t.lessons.find((l) => !progress[lessonIdOf(t.slug, l.slug)]) ??
      t.lessons[0];
    return {
      id: t.slug,
      slug: t.slug,
      name: t.name,
      subtitle: t.subtitle,
      description: t.description,
      color: t.color,
      sortOrder: i,
      lessonCount: t.lessons.length,
      completedCount,
      nextLessonSlug: nextLesson?.slug ?? null,
    };
  });
}

export function buildTrackDetail(
  slug: string,
  progress: ProgressMap,
): TrackDetailDTO | null {
  const idx = TRACK_SEEDS.findIndex((t) => t.slug === slug);
  if (idx < 0) return null;
  const t = TRACK_SEEDS[idx];
  const lessons: LessonListItemDTO[] = t.lessons.map((l, i) => ({
    id: lessonIdOf(t.slug, l.slug),
    slug: l.slug,
    title: l.title,
    summary: l.summary,
    kind: l.kind,
    sortOrder: i,
    completed: !!progress[lessonIdOf(t.slug, l.slug)],
  }));
  const nextLesson = lessons.find((l) => !l.completed) ?? lessons[0];
  return {
    id: t.slug,
    slug: t.slug,
    name: t.name,
    subtitle: t.subtitle,
    description: t.description,
    color: t.color,
    sortOrder: idx,
    lessonCount: lessons.length,
    completedCount: lessons.filter((l) => l.completed).length,
    nextLessonSlug: nextLesson?.slug ?? null,
    lessons,
  };
}

export type LessonBundle = {
  lesson: LessonDetailDTO;
  track: { id: string; slug: string; name: string; color: string };
  siblings: LessonListItemDTO[];
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
};

export function buildLessonBundle(
  trackSlug: string,
  lessonSlug: string,
  progress: ProgressMap,
): LessonBundle | null {
  const t = TRACK_SEEDS.find((x) => x.slug === trackSlug);
  if (!t) return null;
  const lessonIdx = t.lessons.findIndex((l) => l.slug === lessonSlug);
  if (lessonIdx < 0) return null;
  const l = t.lessons[lessonIdx];

  const siblings: LessonListItemDTO[] = t.lessons.map((s, i) => ({
    id: lessonIdOf(t.slug, s.slug),
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    kind: s.kind,
    sortOrder: i,
    completed: !!progress[lessonIdOf(t.slug, s.slug)],
  }));

  const prevSeed = lessonIdx > 0 ? t.lessons[lessonIdx - 1] : null;
  const nextSeed =
    lessonIdx < t.lessons.length - 1 ? t.lessons[lessonIdx + 1] : null;

  return {
    lesson: {
      id: lessonIdOf(t.slug, l.slug),
      slug: l.slug,
      title: l.title,
      summary: l.summary,
      kind: l.kind,
      sortOrder: lessonIdx,
      completed: !!progress[lessonIdOf(t.slug, l.slug)],
      content: l.content,
      language: l.language,
      starterCode: l.starterCode,
      solutionCode: l.solutionCode,
      expectedOutput: l.expectedOutput ?? null,
    },
    track: { id: t.slug, slug: t.slug, name: t.name, color: t.color },
    siblings,
    prev: prevSeed ? { slug: prevSeed.slug, title: prevSeed.title } : null,
    next: nextSeed ? { slug: nextSeed.slug, title: nextSeed.title } : null,
  };
}
