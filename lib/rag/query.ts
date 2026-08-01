export type RetrievalHistoryMessage = {
  role: "user" | "assistant";
  content: string;
  sourceTitles?: string[];
};

const FOLLOW_UP =
  /^(这个|这个项目|该项目|它|其|上述|刚才|还有|再说|具体|展开|为什么|怎么|如何|难点|优势|局限|流程|成果|结果|用了什么|用到什么)/i;

const QUERY_EXPANSIONS: Array<{ pattern: RegExp; terms: string }> = [
  {
    pattern: /(语音|说话|口述).{0,8}(建模|rhino)|voice.{0,8}rhino/i,
    terms: "Voice-Aided Rhino Modeling 语音建模 Rhino Python ASR 错误修复",
  },
  {
    pattern: /(全景|360|室内改造|接缝|拼接|panorama)/i,
    terms: "EditPanorama 全景图 360 室内改造 接缝 遮罩 局部重绘 inpainting",
  },
  {
    pattern: /(体量|体块|文本生成建筑|massing)/i,
    terms: "AI-Assisted Building Massing Text to Massing 体量生成 Rhino Python 建筑设计约束",
  },
  {
    pattern: /(多智能体|智能体|agent).{0,10}(规划|城市|更新|居民|专家)|城市更新.{0,10}(智能体|agent)/i,
    terms: "AI Multi-Agent Preliminary Planning 多智能体 城市更新 虚拟居民 专家咨询 LLM VLM",
  },
  {
    pattern: /(街景|视频生成|street.view|video generation)/i,
    terms: "AI-Driven Street-View Video Generation 街景视频 深度图 ControlNet AIGC video",
  },
  {
    pattern: /(建筑图像|分析图|bim|ifc|立面|渲染图)/i,
    terms: "AI-Assisted Architectural Image Analysis and Generation BIM IFC 建筑图像 分析图 渲染",
  },
  {
    pattern: /(实习|运营|产品经验|工作经历|小红书|微信)/i,
    terms: "Product and operations experience 产品运营 产品助理 实习 Figma Codex 小红书 微信",
  },
];

function previousUserQuestion(history: readonly RetrievalHistoryMessage[]): string {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const item = history[index];
    if (item.role === "user" && item.content.trim()) return item.content.trim();
  }
  return "";
}

function previousSourceTitles(history: readonly RetrievalHistoryMessage[]): string {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const item = history[index];
    if (item.role === "assistant" && item.sourceTitles?.length) {
      return item.sourceTitles.join(" ");
    }
  }
  return "";
}

export function buildRetrievalQuery(
  message: string,
  history: readonly RetrievalHistoryMessage[] = [],
): string {
  const current = message.trim();
  const isFollowUp = FOLLOW_UP.test(current);
  const previous = isFollowUp ? previousUserQuestion(history) : "";
  const sourceTitles = isFollowUp ? previousSourceTitles(history) : "";
  const conversationalContext = sourceTitles || previous;
  const base = [conversationalContext, current].filter(Boolean).join(" ");
  const expansions = QUERY_EXPANSIONS.filter(({ pattern }) => pattern.test(base)).map(
    ({ terms }) => terms,
  );

  return [base, ...new Set(expansions)].join(" ");
}
