export type LessonSeed = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  language: string;
  kind: "practice" | "read";
  starterCode: string;
  solutionCode: string;
  expectedOutput?: string;
};

export type TrackSeed = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  lessons: LessonSeed[];
};
