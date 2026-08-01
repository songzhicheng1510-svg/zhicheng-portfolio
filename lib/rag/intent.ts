import { languageFor } from "./language";

const GREETING = /^(你好|您好|嗨|哈喽|hi|hello|hallo|hey)[！!。,.，\s]*$/i;
const THANKS = /^(谢谢|感谢|多谢|辛苦了|thanks|thank you)[！!。,.，\s]*$/i;
const ASSISTANT_IDENTITY =
  /^(你是谁|你叫什么(?:名字)?|你是做什么的|who are you|what are you|what(?:'s| is) your name)[？?！!。,.，\s]*$/i;
const HELP =
  /^(你能做什么|可以问什么|我能问什么|怎么提问|如何提问|如何使用|帮助|help|what can i ask)[？?！!。,.，\s]*$/i;

export function directResponseFor(message: string): string | null {
  const normalized = message.trim();
  const english = languageFor(normalized) === "en";
  if (ASSISTANT_IDENTITY.test(normalized)) {
    return english
      ? "I am Song Zhicheng's portfolio assistant. I can answer questions about his AI projects, architectural research, product experience, and technical skills using the available portfolio materials."
      : "我是宋志诚的作品集问答助手，可以根据现有资料介绍宋志诚的 AI 项目、建筑设计研究、产品实践和技术能力。";
  }
  if (GREETING.test(normalized)) {
    return english
      ? "Hello, I am Song Zhicheng's portfolio assistant. You can ask about his AI projects, architectural research, product experience, or technical skills."
      : "你好，我是宋志诚的作品集问答助手。你可以询问 AI 项目、建筑设计研究、产品实践或技术能力。";
  }
  if (THANKS.test(normalized)) {
    return english
      ? "You're welcome. You can continue by asking about a project's workflow, technical approach, or outcomes."
      : "不客气。如果你还想了解某个项目的流程、技术方法或成果，可以继续提问。";
  }
  if (HELP.test(normalized)) {
    return english
      ? "You can ask about Song Zhicheng's AI projects, architectural research, product experience, technical tools, and current master's-level studies. You can also ask follow-up questions about the previous answer."
      : "你可以询问宋志诚的 AI 项目、建筑设计研究、产品实践、技术工具和当前硕士阶段信息，也可以针对上一轮回答继续追问。";
  }
  return null;
}
