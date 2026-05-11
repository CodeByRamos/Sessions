"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Lock, MessageCircle, Send } from "lucide-react";
import type { User } from "@/types/user";

type CrewChatMessage = {
  id: string;
  crewSessionId: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender: Pick<User, "id" | "name" | "avatarUrl"> | null;
};

type CrewChatProps = {
  crewSessionId: string;
  canChat: boolean;
  currentUser?: Pick<User, "id" | "name" | "avatarUrl">;
  initialMessages: CrewChatMessage[];
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CrewChat({
  crewSessionId,
  canChat,
  currentUser,
  initialMessages,
}: CrewChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function refreshMessages() {
    const response = await fetch(`/api/crew/${crewSessionId}/messages`);

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as { messages?: CrewChatMessage[] };
    setMessages(data.messages ?? []);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setError("Escreva uma mensagem antes de enviar.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch(`/api/crew/${crewSessionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmedMessage }),
    });
    const data = (await response.json()) as {
      error?: string;
      message?: Omit<CrewChatMessage, "sender">;
    };

    const sentMessage = data.message;

    if (!response.ok || !sentMessage) {
      setError(data.error ?? "Não foi possível enviar a mensagem.");
      setLoading(false);
      return;
    }

    setMessages((current) => [
      ...current,
      {
        ...sentMessage,
        sender: currentUser ?? null,
      },
    ]);
    setMessage("");
    setLoading(false);
    await refreshMessages();
  }

  if (!canChat) {
    return (
      <section id="crew-chat" className="surface rounded-[18px] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-sand-100 ring-1 ring-white/10">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="section-kicker">chat da Crew</p>
            <h2 className="mt-2 text-2xl font-black text-white">Confirme presença para conversar</h2>
            <p className="mt-2 text-sm leading-6 text-sand-100/62">
              O chat abre para quem vai cair junto. Combine ponto de encontro,
              horário, câmera e detalhes da session.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="crew-chat" className="surface rounded-[18px] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tide-300/12 text-tide-300 ring-1 ring-tide-300/20">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="section-kicker">chat da Crew</p>
          <h2 className="mt-2 text-2xl font-black text-white">Combinar a queda</h2>
          <p className="mt-2 text-sm leading-6 text-sand-100/62">
            Fale com quem confirmou presença e deixe a session redonda antes de chegar no pico.
          </p>
        </div>
      </div>

      <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {messages.length ? (
          messages.map((item) => {
            const isOwn = item.senderId === currentUser?.id;

            return (
              <div
                key={item.id}
                className={`flex gap-3 ${isOwn ? "justify-end" : "justify-start"}`}
              >
                {!isOwn ? (
                  <div
                    className="h-9 w-9 shrink-0 rounded-full bg-cover bg-center ring-2 ring-white/10"
                    style={{
                      backgroundImage: `url(${item.sender?.avatarUrl ?? ""})`,
                    }}
                    aria-hidden="true"
                  />
                ) : null}
                <div
                  className={`max-w-[82%] rounded-2xl border p-3 ${
                    isOwn
                      ? "border-tide-300/20 bg-tide-300/12"
                      : "border-white/10 bg-white/[0.045]"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-black text-white">
                      {item.sender?.name ?? "Surfista"}
                    </span>
                    <span className="text-sand-300/55">{formatTime(item.createdAt)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-sand-100/78">
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm leading-6 text-sand-100/62">
            Ainda ninguém mandou mensagem. Combine o ponto de encontro, horário ou quem leva a câmera.
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <textarea
          className="field min-h-14 flex-1 resize-none leading-6"
          maxLength={500}
          placeholder="Escreva no chat da Crew..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="primary-button justify-center px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {loading ? "enviando..." : "enviar"}
        </button>
      </form>

      {error ? (
        <div className="mt-3 rounded-2xl border border-coral-400/25 bg-coral-400/10 p-3 text-sm font-bold text-coral-400">
          {error}
        </div>
      ) : null}
    </section>
  );
}
