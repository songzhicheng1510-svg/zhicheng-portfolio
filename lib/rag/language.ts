export type SupportedLanguage = "zh" | "en";

export function languageFor(message: string): SupportedLanguage {
  if (/[㐀-鿿]/.test(message)) return "zh";
  if (/[a-z]/i.test(message)) return "en";
  return "zh";
}

export function unknownAnswerFor(message: string): string {
  return languageFor(message) === "en"
    ? "Sorry, the current portfolio does not contain enough information to answer that accurately. You can ask about Song Zhicheng's AI projects, architectural research, product experience, or technical skills."
    : "抱歉，现有作品集资料中没有这方面的信息，因此我无法准确回答。你可以询问宋志诚的 AI 项目、建筑设计研究、产品实践或技术能力。";
}
