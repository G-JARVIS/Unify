import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, MessageSquare, Send, Sparkles, X } from "lucide-react";
import { apiPost } from "@/lib/api";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
};

const suggestions = [
  "How does company matching work?",
  "How do I post a collaboration?",
  "Where can I find government tenders?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (value: string) => {
    const text = value.trim();
    if (!text || sending) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const history = [...messages.filter((message) => !message.error), userMessage]
      .slice(-19)
      .map(({ role, content }) => ({ role, content }));
    setInput("");
    setMessages((current) => [...current, userMessage]);
    setSending(true);

    try {
      const response = await apiPost<{ content: string }>("/assistant/chat", { messages: history });
      setMessages((current) => [...current, { role: "assistant", content: response.content }]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Please try again.";
      setMessages((current) => [
        ...current,
        { role: "assistant", content: `I couldn't reach the assistant: ${detail}`, error: true },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close UNIFY Assistant" : "Open UNIFY Assistant"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl transition-transform hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {open && (
        <section
          aria-label="UNIFY Assistant"
          className="fixed bottom-24 right-6 z-50 flex h-[min(560px,calc(100vh-8rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
        >
          <header className="flex items-center gap-3 border-b border-border bg-primary/10 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">UNIFY Assistant</h2>
              <p className="text-[11px] text-muted-foreground">Ask about the platform</p>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex min-h-full flex-col items-center justify-center text-center">
                <Bot className="mb-3 h-8 w-8 text-primary" />
                <p className="text-sm font-semibold">How can I help?</p>
                <p className="mb-5 mt-1 text-xs text-muted-foreground">Ask about matching, collaborations, or tenders.</p>
                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void sendMessage(suggestion)}
                      disabled={sending}
                      className="block w-full rounded-lg border border-border px-3 py-2 text-left text-xs hover:bg-muted disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={`${index}-${message.role}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <p className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : message.error
                        ? "rounded-tl-sm border border-destructive/30 bg-destructive/10 text-destructive"
                        : "rounded-tl-sm bg-muted"
                  }`}>
                    {message.content}
                  </p>
                </div>
              ))
            )}
            {sending && <p className="text-xs text-muted-foreground">Assistant is thinking…</p>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask UNIFY Assistant…"
              maxLength={8000}
              aria-label="Message the UNIFY Assistant"
              className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
