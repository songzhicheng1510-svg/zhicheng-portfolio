import type { RetrievedChunk } from "./types";

export type QueryPlan = {
  intent: string;
  rewrittenQuery: string;
  subqueries: string[];
  requiresComparison: boolean;
  riskLevel: "low" | "high";
  inScope: boolean;
};

const COMPARISON = /(比较|区别|共同|哪个|哪一个|最能|更适合|优先|compare|difference|best|most)/i;
const HIGH_RISK =
  /(姓名|学校|学历|教育|论文|奖项|获奖|日期|时间|数据|数量|粉丝|实习|工作经历|name|school|education|paper|award|date|metric|internship)/i;

function extractJson(value: string): unknown {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(value.slice(start, end + 1));
  } catch {
    return null;
  }
}

function cleanString(value: unknown, limit: number): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export function fallbackQueryPlan(message: string): QueryPlan {
  return {
    intent: "portfolio question",
    rewrittenQuery: message.trim(),
    subqueries: [],
    requiresComparison: COMPARISON.test(message),
    riskLevel: HIGH_RISK.test(message) ? "high" : "low",
    inScope: true,
  };
}

export function parseQueryPlan(value: string, message: string): QueryPlan {
  const fallback = fallbackQueryPlan(message);
  const parsed = extractJson(value);
  if (!parsed || typeof parsed !== "object") return fallback;
  const record = parsed as Record<string, unknown>;
  const rewrittenQuery = cleanString(record.rewrittenQuery, 300);
  const rawSubqueries = Array.isArray(record.subqueries) ? record.subqueries : [];
  const subqueries = rawSubqueries
    .map((item) => cleanString(item, 200))
    .filter(Boolean)
    .filter((item, index, items) => items.indexOf(item) === index)
    .slice(0, 4);

  return {
    intent: cleanString(record.intent, 100) || fallback.intent,
    rewrittenQuery: rewrittenQuery || fallback.rewrittenQuery,
    subqueries,
    requiresComparison:
      record.requiresComparison === true || fallback.requiresComparison,
    riskLevel:
      record.riskLevel === "high" || fallback.riskLevel === "high"
        ? "high"
        : "low",
    inScope: record.inScope !== false,
  };
}

export function mergeRetrievedGroups(
  groups: readonly RetrievedChunk[][],
  limit = 12,
): RetrievedChunk[] {
  const merged = new Map<string, RetrievedChunk>();
  for (const group of groups) {
    group.forEach((chunk, rank) => {
      const rankBoost = 4 / (rank + 1);
      const previous = merged.get(chunk.id);
      if (previous) {
        previous.score += chunk.score + rankBoost;
      } else {
        merged.set(chunk.id, { ...chunk, score: chunk.score + rankBoost });
      }
    });
  }
  return [...merged.values()]
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

export function parseSelectedIds(
  value: string,
  allowedIds: ReadonlySet<string>,
  limit = 5,
): string[] {
  const parsed = extractJson(value);
  if (!parsed || typeof parsed !== "object") return [];
  const record = parsed as Record<string, unknown>;
  const rawIds = Array.isArray(record.selectedIds) ? record.selectedIds : [];
  return rawIds
    .filter((id): id is string => typeof id === "string" && allowedIds.has(id))
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .slice(0, limit);
}

export function selectChunksById(
  candidates: readonly RetrievedChunk[],
  selectedIds: readonly string[],
  limit = 5,
): RetrievedChunk[] {
  const byId = new Map(candidates.map((chunk) => [chunk.id, chunk]));
  const selected = selectedIds
    .map((id) => byId.get(id))
    .filter((chunk): chunk is RetrievedChunk => Boolean(chunk));
  return (selected.length > 0 ? selected : candidates).slice(0, limit);
}
