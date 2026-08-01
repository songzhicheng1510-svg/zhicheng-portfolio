import type { KnowledgeChunk, RetrievedChunk } from "./types";

const ENGLISH_TOKEN = /[a-z0-9][a-z0-9+#.\-]*/g;
const CHINESE_SEQUENCE = /[\u3400-\u9fff]+/g;

export function tokenize(value: string): string[] {
  const normalized = value.normalize("NFKC").toLowerCase();
  const tokens = normalized.match(ENGLISH_TOKEN) ?? [];
  const chineseSequences = normalized.match(CHINESE_SEQUENCE) ?? [];

  for (const sequence of chineseSequences) {
    const characters = Array.from(sequence);
    for (let index = 0; index < characters.length - 1; index += 1) {
      tokens.push(characters[index] + characters[index + 1]);
    }
    for (let index = 0; index < characters.length - 2; index += 1) {
      tokens.push(characters[index] + characters[index + 1] + characters[index + 2]);
    }
  }

  return tokens.filter((token) => token.length > 0);
}

type IndexedDocument = {
  chunk: KnowledgeChunk;
  frequencies: Map<string, number>;
  length: number;
};

export class BM25Index {
  private readonly documents: IndexedDocument[];
  private readonly documentFrequency = new Map<string, number>();
  private readonly averageLength: number;
  private readonly k1 = 1.5;
  private readonly b = 0.75;

  constructor(chunks: KnowledgeChunk[]) {
    this.documents = chunks.map((chunk) => {
      const searchable = `${chunk.title} ${chunk.title} ${chunk.keywords.join(" ")} ${chunk.keywords.join(" ")} ${chunk.text}`;
      const tokens = tokenize(searchable);
      const frequencies = new Map<string, number>();
      for (const token of tokens) {
        frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
      }
      for (const token of frequencies.keys()) {
        this.documentFrequency.set(
          token,
          (this.documentFrequency.get(token) ?? 0) + 1,
        );
      }
      return { chunk, frequencies, length: tokens.length };
    });

    this.averageLength =
      this.documents.reduce((total, document) => total + document.length, 0) /
        Math.max(1, this.documents.length) || 1;
  }

  search(query: string, limit = 5): RetrievedChunk[] {
    const queryTokens = tokenize(query);
    const queryFrequency = new Map<string, number>();
    for (const token of queryTokens) {
      queryFrequency.set(token, (queryFrequency.get(token) ?? 0) + 1);
    }

    const totalDocuments = this.documents.length;
    return this.documents
      .map(({ chunk, frequencies, length }) => {
        let score = 0;
        for (const [token, queryCount] of queryFrequency) {
          const termFrequency = frequencies.get(token) ?? 0;
          if (termFrequency === 0) continue;
          const matchingDocuments = this.documentFrequency.get(token) ?? 0;
          const inverseDocumentFrequency = Math.log(
            1 +
              (totalDocuments - matchingDocuments + 0.5) /
                (matchingDocuments + 0.5),
          );
          const saturation =
            (termFrequency * (this.k1 + 1)) /
            (termFrequency +
              this.k1 *
                (1 - this.b + this.b * (length / this.averageLength)));
          score += inverseDocumentFrequency * saturation * Math.min(2, queryCount);
        }
        return { ...chunk, score };
      })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
