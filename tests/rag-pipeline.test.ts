import assert from "node:assert/strict";
import test from "node:test";
import {
  fallbackQueryPlan,
  mergeRetrievedGroups,
  parseQueryPlan,
  parseSelectedIds,
} from "../lib/rag/pipeline";
import { directResponseFor } from "../lib/rag/intent";
import { languageFor, unknownAnswerFor } from "../lib/rag/language";
import type { RetrievedChunk } from "../lib/rag/types";
import { createAdmissionGate } from "../lib/rag/admission";

function chunk(id: string, title: string, score: number): RetrievedChunk {
  return {
    id,
    title,
    score,
    text: `${title} evidence`,
    keywords: [title],
    source: "test",
    page: null,
    href: null,
  };
}

test("parses a model query plan and limits subqueries", () => {
  const plan = parseQueryPlan(
    '```json\n{"intent":"compare projects","rewrittenQuery":"compare Rhino and EditPanorama","subqueries":["Rhino","EditPanorama","workflow","product loop","extra"],"requiresComparison":true,"riskLevel":"low"}\n```',
    "哪个项目更能体现产品思维？",
  );
  assert.equal(plan.requiresComparison, true);
  assert.equal(plan.subqueries.length, 4);
  assert.equal(plan.rewrittenQuery, "compare Rhino and EditPanorama");
  assert.equal(plan.inScope, true);
});

test("query plan can reject an out-of-scope request", () => {
  const plan = parseQueryPlan(
    '{"intent":"weather","rewrittenQuery":"北京天气","subqueries":[],"requiresComparison":false,"riskLevel":"low","inScope":false}',
    "今天北京天气怎么样？",
  );
  assert.equal(plan.inScope, false);
});

test("fallback plan detects comparison and high-risk facts", () => {
  const plan = fallbackQueryPlan("比较教育经历和获奖情况");
  assert.equal(plan.requiresComparison, true);
  assert.equal(plan.riskLevel, "high");
});

test("multi-query retrieval boosts evidence found by several queries", () => {
  const merged = mergeRetrievedGroups([
    [chunk("voice", "Voice Rhino", 10), chunk("panorama", "EditPanorama", 9)],
    [chunk("voice", "Voice Rhino", 8)],
  ]);
  assert.equal(merged[0].id, "voice");
  assert.equal(merged.length, 2);
});

test("reranker output only accepts candidate IDs", () => {
  const selected = parseSelectedIds(
    '{"selectedIds":["voice","unknown","voice","panorama"]}',
    new Set(["voice", "panorama"]),
  );
  assert.deepEqual(selected, ["voice", "panorama"]);
});

test("English input receives English direct and refusal copy", () => {
  assert.equal(languageFor("hallo"), "en");
  assert.match(directResponseFor("hallo") ?? "", /^Hello,/);
  assert.match(unknownAnswerFor("What is the weather today?"), /^Sorry,/);
});

test("GPU admission allows one active request and rejects the next", () => {
  const gate = createAdmissionGate(1);
  const first = gate.acquire();
  assert.ok(first);
  assert.equal(gate.activeCount(), 1);
  assert.equal(gate.acquire(), null);

  first.release();
  assert.equal(gate.activeCount(), 0);
  assert.ok(gate.acquire());
});
