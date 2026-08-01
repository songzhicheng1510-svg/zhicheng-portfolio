export type KnowledgeChunk = {
  id: string;
  title: string;
  text: string;
  keywords: string[];
  source: string;
  page: number | null;
  href: string | null;
};

export type RetrievedChunk = KnowledgeChunk & {
  score: number;
};

export type ChatSource = {
  title: string;
  source: string;
  page: number | null;
  href: string | null;
};
