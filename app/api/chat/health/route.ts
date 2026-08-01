import { knowledgeStats } from "@/lib/rag/knowledge";
import { publicJson, publicOptions } from "@/lib/rag/http";

export function OPTIONS() {
  return publicOptions();
}

export async function GET() {
  const stats = knowledgeStats();
  try {
    const response = await fetch("http://127.0.0.1:11434/api/tags", {
      signal: AbortSignal.timeout(3_000),
    });
    const data = (await response.json()) as {
      models?: Array<{ name?: string }>;
    };
    return publicJson({
      ok: response.ok,
      model: "qwen3.5:9b",
      modelAvailable:
        data.models?.some((model) => model.name === "qwen3.5:9b") ?? false,
      knowledge: stats,
    });
  } catch {
    return publicJson(
      { ok: false, model: "qwen3.5:9b", modelAvailable: false, knowledge: stats },
      { status: 503 },
    );
  }
}
