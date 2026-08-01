"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, RotateCcw, X } from "lucide-react";
import type { ChatSource } from "@/lib/rag/types";
import { languageFor } from "@/lib/rag/language";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  error?: boolean;
  language?: "zh" | "en";
};

type PortfolioChatProps = {
  open: boolean;
  onClose: () => void;
};

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "你好，我是宋志诚的作品集问答助手。Hi, I am Song Zhicheng's portfolio assistant. You can ask me in Chinese or English.",
};

const suggestions = [
  "介绍一下语音 Rhino 建模系统",
  "EditPanorama 如何保持空间连续性？",
  "你有哪些 AI 产品与建筑交叉经验？",
  "How does AI-assisted building massing work?",
  "How are multi-agent systems used in urban renewal?",
];

const chatApiUrl =
  process.env.NEXT_PUBLIC_CHAT_API_URL?.trim() || "/api/chat";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function PortfolioChat({ open, onClose }: PortfolioChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<"zh" | "en">("zh");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isLoading, messages]);

  useEffect(() => {
    return () => requestRef.current?.abort();
  }, []);

  const resetConversation = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setIsLoading(false);
    setMessages([welcomeMessage]);
    setInput("");
    inputRef.current?.focus();
  };

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
      language: languageFor(trimmed),
    };
    setActiveLanguage(userMessage.language ?? "zh");
    const history = messages
      .filter((message) => !message.error && message.id !== "welcome")
      .map(({ role, content, sources }) => ({
        role,
        content,
        sourceTitles: sources?.map((source) => source.title),
      }));

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const response = await fetch(chatApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
        signal: controller.signal,
      });
      const result = (await response.json()) as {
        answer?: string;
        error?: string;
        sources?: ChatSource[];
        language?: "zh" | "en";
      };
      if (!response.ok || !result.answer) {
        throw new Error(
          result.error ||
            (userMessage.language === "en"
              ? "Unable to answer right now. Please try again shortly."
              : "暂时无法获得回答，请稍后重试。"),
        );
      }
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: result.answer as string,
          sources: result.sources,
          language: result.language ?? userMessage.language,
        },
      ]);
    } catch (error) {
      if (controller.signal.aborted) return;
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : userMessage.language === "en"
                ? "Unable to answer right now. Please try again shortly."
                : "暂时无法获得回答，请稍后重试。",
          error: true,
          language: userMessage.language,
        },
      ]);
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
      setIsLoading(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(input);
  };

  if (!open) return null;

  return (
    <aside
      className="portfolio-chat"
      id="portfolio-chat"
      role="dialog"
      aria-modal="false"
      aria-labelledby="portfolio-chat-title"
    >
      <header className="portfolio-chat-header">
        <div>
          <h2 id="portfolio-chat-title">Ask about the work</h2>
          <p>作品集资料问答 / Portfolio-grounded answers</p>
        </div>
        <div className="portfolio-chat-actions">
          <button type="button" onClick={resetConversation} aria-label="清空对话" title="清空对话">
            <RotateCcw aria-hidden="true" size={16} strokeWidth={1.6} />
          </button>
          <button type="button" onClick={onClose} aria-label="关闭项目助手" title="关闭">
            <X aria-hidden="true" size={18} strokeWidth={1.6} />
          </button>
        </div>
      </header>

      <div
        className="portfolio-chat-transcript"
        ref={transcriptRef}
        aria-live="polite"
        aria-busy={isLoading}
      >
        {messages.map((message) => (
          <div
            className={`portfolio-chat-message ${message.role}${message.error ? " error" : ""}`}
            key={message.id}
          >
            <p>{message.content}</p>
            {message.sources && message.sources.length > 0 && (
              <div className="portfolio-chat-sources" aria-label="回答来源">
                {message.sources.map((source) => {
                  const label = source.page
                    ? message.language === "en"
                      ? `${source.title}, p. ${source.page}`
                      : `${source.title}，第 ${source.page} 页`
                    : source.title;
                  return source.href ? (
                    <a href={source.href} key={`${source.title}-${source.page ?? "web"}`}>
                      {label}
                    </a>
                  ) : (
                    <span key={`${source.title}-${source.page ?? "pdf"}`}>{label}</span>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {messages.length === 1 && (
          <div className="portfolio-chat-suggestions" aria-label="推荐问题">
            {suggestions.map((suggestion) => (
              <button type="button" key={suggestion} onClick={() => void ask(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <p className="portfolio-chat-status" role="status">
            {activeLanguage === "en"
              ? "Searching the portfolio and preparing an answer"
              : "正在查找资料并组织回答"}
          </p>
        )}
      </div>

      <form className="portfolio-chat-form" onSubmit={submit}>
        <label htmlFor="portfolio-chat-input">向作品集助手提问 / Ask the portfolio assistant</label>
        <div className="portfolio-chat-input-row">
          <textarea
            id="portfolio-chat-input"
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value.slice(0, 600))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (input.trim()) void ask(input);
              }
            }}
            placeholder="输入问题 / Ask a question"
            rows={1}
            maxLength={600}
            disabled={isLoading}
          />
          <button
            type="submit"
            aria-label="发送问题"
            disabled={isLoading || !input.trim()}
          >
            <ArrowUp aria-hidden="true" size={18} strokeWidth={1.7} />
          </button>
        </div>
      </form>
    </aside>
  );
}
