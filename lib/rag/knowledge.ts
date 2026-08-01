import curatedData from "@/knowledge/curated.json";
import pdfData from "@/knowledge/pdf-pages.json";
import { BM25Index } from "./bm25";
import { buildRetrievalQuery, type RetrievalHistoryMessage } from "./query";
import type { KnowledgeChunk, RetrievedChunk } from "./types";

const knowledge = [...curatedData, ...pdfData] as KnowledgeChunk[];
const index = new BM25Index(knowledge);
const MIN_RELEVANCE_SCORE = 6;
const RELATIVE_SCORE_RATIO = 0.55;

const GENERAL_PROFILE_IDS = new Set(["profile-education", "profile-skills"]);
const PROFILE_INTENT =
  /(你是谁|叫什么|名字|姓名|个人介绍|教育背景|学校|硕士|研究方向|技能|会什么|擅长|who are you|your name|education|school|skills?)/i;
const PROJECT_OVERVIEW =
  /(哪些|主要|介绍|概览|汇总).{0,8}(项目|作品)|^(项目|作品).{0,6}(有哪些|概览|汇总)|\b(main|which|what|overview|summarize)\b.{0,24}\b(projects?|portfolio|work)\b/i;

export function retrieveKnowledge(
  message: string,
  limit = 5,
  history: readonly RetrievalHistoryMessage[] = [],
): RetrievedChunk[] {
  const query = buildRetrievalQuery(message, history);
  if (PROJECT_OVERVIEW.test(message)) {
    const overview = knowledge.find((chunk) => chunk.id === "portfolio-overview");
    return overview ? [{ ...overview, score: 100 }] : [];
  }
  if (PROFILE_INTENT.test(message)) {
    return knowledge
      .filter((chunk) => GENERAL_PROFILE_IDS.has(chunk.id))
      .slice(0, Math.min(2, limit))
      .map((chunk) => ({ ...chunk, score: 100 }));
  }
  const results = index.search(query, limit);
  if (results.length > 0) {
    const threshold = Math.max(
      MIN_RELEVANCE_SCORE,
      results[0].score * RELATIVE_SCORE_RATIO,
    );
    return results.filter((result) => result.score >= threshold);
  }

  return [];
}

export function knowledgeStats() {
  return {
    chunks: knowledge.length,
    projects: new Set(knowledge.map((chunk) => chunk.title)).size,
  };
}

export function knowledgeCatalog(): string[] {
  return [...new Set(knowledge.map((chunk) => chunk.title))];
}
