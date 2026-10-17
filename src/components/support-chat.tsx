"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, RotateCcw, Send, ShieldCheck, X } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const welcome: Message = {
  role: "assistant",
  content: "Welcome to Missy Miss. I’m here to help with products, orders, delivery and our policies. How may I assist you today?",
};

const suggestions = ["Shipping & delivery", "Exchange policy", "Cash on Delivery"];

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function sendMessage(value = input) {
    const content = value.trim();
    if (!content || sending) return;
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-12) }),
      });
      const data = await response.json() as { answer?: string };
      setMessages((current) => [...current, {
        role: "assistant",
        content: data.answer || "I’m sorry, I couldn’t complete that just now. Please contact our team on WhatsApp at 9891879978.",
      }]);
    } catch {
      setMessages((current) => [...current, {
        role: "assistant",
        content: "I’m sorry, I couldn’t complete that just now. Please contact our team on WhatsApp at 9891879978.",
      }]);
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function resetChat() {
    setMessages([welcome]);
    setInput("");
  }

  return (
    <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 z-[100] flex flex-col items-end gap-2 sm:bottom-7 sm:right-7 sm:gap-3">
      {open ? (
        <section
          aria-label="Missy Miss customer support chat"
          className="flex h-[min(680px,calc(100dvh-92px-env(safe-area-inset-top)))] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-[1.4rem] border border-[color:var(--color-border-strong)] bg-[color:var(--background)] shadow-[0_28px_100px_rgba(44,44,44,.24)] sm:rounded-[1.7rem]"
          role="dialog"
          aria-modal="false"
        >
          <header className="relative overflow-hidden bg-[color:var(--color-charcoal)] px-5 pb-5 pt-5 text-white">
            <div className="absolute -right-10 -top-16 size-40 rounded-full bg-[color:var(--color-gold)]/20 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[color:var(--color-gold)]">
                  <MessageCircle className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display text-xl leading-tight">Missy Miss</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.2em] text-white/65">Customer care</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button aria-label="Start a new conversation" className="flex size-9 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold)]" onClick={resetChat} type="button">
                  <RotateCcw className="size-4" aria-hidden="true" />
                </button>
                <button aria-label="Close chat" className="flex size-9 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold)]" onClick={() => setOpen(false)} type="button">
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="relative mt-4 flex items-center gap-2 text-xs text-white/65">
              <span className="size-1.5 rounded-full bg-[color:var(--color-gold)]" />
              <span>AI assisted · Human support, 10 AM–6 PM</span>
            </div>
          </header>

          <div aria-live="polite" className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5" ref={listRef}>
            {messages.map((message, index) => (
              <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} key={`${index}-${message.role}`}>
                <p className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[13px] leading-6 ${message.role === "user" ? "rounded-br-md bg-[color:var(--color-charcoal)] text-white" : "rounded-bl-md border border-[color:var(--color-border)] bg-white text-[color:var(--color-charcoal)] shadow-sm"}`}>
                  {message.content}
                </p>
              </div>
            ))}
            {messages.length === 1 && !sending ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((suggestion) => (
                  <button className="rounded-full border border-[color:var(--color-border-strong)] bg-white px-3 py-2 text-xs font-medium text-[color:var(--color-charcoal)] transition hover:border-[color:var(--color-gold-deep)] hover:bg-[color:var(--color-paper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-deep)]" key={suggestion} onClick={() => void sendMessage(suggestion)} type="button">
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
            {sending ? (
              <div aria-label="Missy Miss is preparing a response" className="flex justify-start" role="status">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[color:var(--color-border)] bg-white px-4 py-3 shadow-sm">
                  <span className="size-1.5 animate-pulse rounded-full bg-[color:var(--color-gold-deep)]" />
                  <span className="size-1.5 animate-pulse rounded-full bg-[color:var(--color-gold-deep)] [animation-delay:120ms]" />
                  <span className="size-1.5 animate-pulse rounded-full bg-[color:var(--color-gold-deep)] [animation-delay:240ms]" />
                </div>
              </div>
            ) : null}
          </div>

          <footer className="border-t border-[color:var(--color-border)] bg-white/70 px-4 pb-4 pt-3 sm:px-5">
            <p className="mb-3 flex items-start gap-1.5 text-[10px] leading-4 text-[color:var(--color-muted-foreground)]">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[color:var(--color-gold-deep)]" aria-hidden="true" />
              Messages are processed by Google Gemini. Please don’t share passwords, OTPs, or full card details.
            </p>
            <form className="flex items-center gap-2" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="support-chat-input">Your message</label>
              <input
                autoComplete="off"
                className="h-12 min-w-0 flex-1 rounded-full border border-[color:var(--color-border)] bg-[color:var(--background)] px-4 text-sm text-[color:var(--color-charcoal)] outline-none placeholder:text-[color:var(--color-muted-foreground)] focus:border-[color:var(--color-gold-deep)] focus:ring-2 focus:ring-[color:var(--color-gold)]/20"
                id="support-chat-input"
                maxLength={1200}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask us anything…"
                ref={inputRef}
                value={input}
              />
              <button aria-label="Send message" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-gold),var(--color-gold-deep))] text-[color:var(--color-charcoal)] shadow-[0_8px_24px_rgba(200,155,60,.26)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-deep)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={sending || !input.trim()} type="submit">
                <Send className="size-4" aria-hidden="true" />
              </button>
            </form>
            <a className="mt-3 block text-center text-[11px] font-medium text-[color:var(--color-muted-foreground)] underline decoration-[color:var(--color-border-strong)] underline-offset-2 transition hover:text-[color:var(--color-charcoal)]" href="https://wa.me/919891879978" rel="noreferrer" target="_blank">
              Prefer a person? Contact us on WhatsApp
            </a>
          </footer>
        </section>
      ) : null}

      <button
        aria-expanded={open}
        aria-label={open ? "Close Missy Miss support chat" : "Chat with Missy Miss support"}
        className="group flex size-14 items-center justify-center rounded-full border border-[color:var(--color-gold-deep)] bg-[linear-gradient(135deg,var(--color-gold),var(--color-gold-deep))] px-0 text-sm font-semibold text-[color:var(--color-charcoal)] shadow-[0_16px_38px_rgba(88,66,26,.24)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(88,66,26,.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-deep)] focus-visible:ring-offset-2 sm:h-14 sm:w-auto sm:gap-3 sm:px-5"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {open ? <X className="size-5" aria-hidden="true" /> : <MessageCircle className="size-5 transition-transform group-hover:scale-105" aria-hidden="true" />}
        <span className="sr-only sm:not-sr-only">{open ? "Close" : "Chat with us"}</span>
      </button>
    </div>
  );
}
