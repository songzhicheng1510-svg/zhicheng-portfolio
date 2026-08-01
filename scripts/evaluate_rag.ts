import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { retrieveKnowledge } from "../lib/rag/knowledge";
import { directResponseFor } from "../lib/rag/intent";
import type { RetrievalHistoryMessage } from "../lib/rag/query";

type EvaluationCase = {
  name: string;
  question: string;
  history?: RetrievalHistoryMessage[];
  expectedTitles?: string[];
  expectReject?: boolean;
  expectDirect?: boolean;
};

const casesPath = fileURLToPath(
  new URL("../tests/rag-retrieval-cases.json", import.meta.url),
);
const cases = JSON.parse(await readFile(casesPath, "utf8")) as EvaluationCase[];

let passed = 0;
for (const testCase of cases) {
  const directAnswer = directResponseFor(testCase.question);
  const results = retrieveKnowledge(testCase.question, 5, testCase.history ?? []);
  const titles = [...new Set(results.map((result) => result.title))];
  const didReject = results.length === 0;
  const matchedExpected =
    testCase.expectedTitles?.some((title) => titles.includes(title)) ?? false;
  const success = testCase.expectDirect
    ? Boolean(directAnswer)
    : !directAnswer && (testCase.expectReject ? didReject : !didReject && matchedExpected);
  if (success) passed += 1;

  const topScore = results[0]?.score.toFixed(2) ?? "-";
  console.log(
    `${success ? "PASS" : "FAIL"}  ${testCase.name.padEnd(12)} score=${topScore}  ${directAnswer ? "DIRECT" : titles.join(" | ") || "REJECT"}`,
  );
}

console.log(`\nRAG retrieval evaluation: ${passed}/${cases.length} passed`);
if (passed !== cases.length) process.exitCode = 1;
