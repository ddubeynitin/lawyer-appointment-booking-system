import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Bot, Sparkles, User, X } from "lucide-react";
import { API_URL } from "../../utils/api";

const READY_PROMPTS = [
  "How do I book an appointment?",
  "How can a lawyer approve requests?",
  "How do I search for a lawyer?",
  "What is IPC 420?",
  "How do I file an FIR?",
  "What should be in a basic contract?",
];

const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "bot",
      text: "Hello. I can help with legal questions and JustifAi platform tasks like booking appointments, searching lawyers, and managing requests.",
    },
  ]);
  const messagesRef = useRef(null);
  const chipsScrollerRef = useRef(null);
  const chipsResumeTimerRef = useRef(null);
  const isChipsPausedRef = useRef(false);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const scroller = chipsScrollerRef.current;

    if (!isOpen || !scroller) return undefined;

    let animationFrameId = null;
    let lastTimestamp = 0;
    let direction = 1;
    const speed = 0.10;

    const tick = (timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const elapsed = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (!isChipsPausedRef.current) {
        const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;

        if (maxScrollLeft > 0) {
          const nextScrollLeft = scroller.scrollLeft + direction * speed * elapsed;

          if (nextScrollLeft >= maxScrollLeft) {
            scroller.scrollLeft = maxScrollLeft;
            direction = -1;
          } else if (nextScrollLeft <= 0) {
            scroller.scrollLeft = 0;
            direction = 1;
          } else {
            scroller.scrollLeft = nextScrollLeft;
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(tick);
    };

    animationFrameId = window.requestAnimationFrame(tick);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      if (chipsResumeTimerRef.current) {
        window.clearTimeout(chipsResumeTimerRef.current);
      }
    };
  }, [isOpen]);

  const sendMessage = async () => {
    const prompt = input.trim();

    if (!prompt || isLoading) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      { id: Date.now(), from: "user", text: prompt },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/ai/generate`, {
        prompt: `You are the JustifAi assistant. Answer clearly and concisely. You can explain platform features and provide general legal information, but you must not present yourself as a lawyer or as a substitute for professional legal advice.\n\nUser question: ${prompt}`,
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          from: "bot",
          text:
            response.data?.text ||
            "I could not generate a response right now. Please try again.",
        },
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          from: "bot",
          text:
            error.response?.data?.error ||
            "The AI assistant is unavailable right now. Please try again shortly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-label="Open AI assistant"
          className="flex lg:h-20 lg:w-20 h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-600 via-cyan-500 to-teal-500 text-white shadow-2xl transition hover:scale-105 animate-bounce"
        >
          <Sparkles size={26} /> <span className="text-3xl font-barlow font-bold">Ai</span>
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="fixed bottom-0 right-0 border border-amber-300 flex h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl lg:bottom-5 lg:right-5 lg:h-167.5 lg:w-107.5 lg:rounded-3xl font-barlow">
            <div className="flex items-center justify-between bg-linear-to-r from-slate-900 via-blue-900 to-slate-800 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-2">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">JustifAi Assistant</h3>
                  <p className="text-xs text-blue-100">
                    General legal guidance and app support
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 transition hover:bg-white/10"
                aria-label="Close AI assistant"
              >
                <X size={18} />
              </button>
            </div>

            <div
              ref={messagesRef}
              className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-5"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.from === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.from === "user"
                        ? "rounded-br-md bg-linear-to-br from-blue-600 to-blue-700 text-white"
                        : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
                      {message.from === "user" ? (
                        <>
                          <User size={12} />
                          <span>You</span>
                        </>
                      ) : (
                        <>
                          <Bot size={12} />
                          <span>JustifAi</span>
                        </>
                      )}
                    </div>

                    {message.from === "bot" ? (
                      <AiMessageContent text={message.text} />
                    ) : (
                      <p className="whitespace-pre-wrap wrap-break-word">
                        {message.text}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      <Bot size={12} />
                      <span>JustifAi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white p-4">
              <p className="mb-3 text-xs text-slate-500">
                This assistant provides general information, not formal legal advice.
              </p>
              <div className="mb-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Ready Prompts
                </p>
                <div
                  ref={chipsScrollerRef}
                  onMouseEnter={() => {
                    isChipsPausedRef.current = true;
                  }}
                  onMouseLeave={() => {
                    isChipsPausedRef.current = false;
                  }}
                  onTouchStart={() => {
                    isChipsPausedRef.current = true;
                  }}
                  onTouchEnd={() => {
                    isChipsPausedRef.current = false;
                  }}
                  onWheel={() => {
                    isChipsPausedRef.current = true;

                    if (chipsResumeTimerRef.current) {
                      window.clearTimeout(chipsResumeTimerRef.current);
                    }

                    chipsResumeTimerRef.current = window.setTimeout(() => {
                      isChipsPausedRef.current = false;
                    }, 1200);
                  }}
                  className="hide-scrollbar overflow-x-auto overflow-y-hidden"
                >
                  <div className="flex w-max flex-nowrap gap-2 pr-6">
                    {READY_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setInput(prompt)}
                        className="shrink-0 whitespace-nowrap rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask a legal or appointment question..."
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AiMessageContent = ({ text }) => {
  const sections = text
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3">
      {sections.map((section, sectionIndex) => {
        const lines = section
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        const isBulletBlock =
          lines.length > 1 &&
          lines.every((line) => /^([-*•]|\d+\.)\s+/.test(line));

        if (isBulletBlock) {
          return (
            <ul
              key={`${section}-${sectionIndex}`}
              className="space-y-2 rounded-xl bg-slate-50 px-3 py-3 text-slate-700"
            >
              {lines.map((line, lineIndex) => (
                <li
                  key={`${line}-${lineIndex}`}
                  className="flex gap-2 wrap-break-word"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <span>{line.replace(/^([-*•]|\d+\.)\s+/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (lines.length === 1 && /:$/.test(lines[0])) {
          return (
            <h4
              key={`${section}-${sectionIndex}`}
              className="text-sm font-semibold text-slate-900"
            >
              {lines[0]}
            </h4>
          );
        }

        return (
          <p
            key={`${section}-${sectionIndex}`}
            className="whitespace-pre-wrap wrap-break-word text-[14px] leading-7 text-slate-700"
          >
            {section}
          </p>
        );
      })}
    </div>
  );
};

export default AiChatWidget;
