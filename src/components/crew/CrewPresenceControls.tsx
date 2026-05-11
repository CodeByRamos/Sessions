"use client";

import { useState } from "react";
import { MessageCircle, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CrewSessionStatus } from "@/types/circuit";

type CrewPresenceControlsProps = {
  crewSessionId: string;
  status: CrewSessionStatus;
  currentUserId?: string;
  joined: boolean;
  isCreator: boolean;
};

export function CrewPresenceControls({
  crewSessionId,
  status,
  currentUserId,
  joined,
  isCreator,
}: CrewPresenceControlsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  async function updatePresence(action: "join" | "leave") {
    setLoading(action);
    setError("");

    const response = await fetch(`/api/crew/${crewSessionId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Não foi possível atualizar sua presença.");
      setLoading("");
      return;
    }

    setLoading("");
    router.refresh();
  }

  async function cancelCrew() {
    if (!window.confirm("Cancelar essa Crew? Quem confirmou presença não verá mais o chat aberto.")) {
      return;
    }

    setLoading("cancel");
    setError("");

    const response = await fetch(`/api/crew/${crewSessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Não foi possível cancelar a Crew.");
      setLoading("");
      return;
    }

    setLoading("");
    router.refresh();
  }

  if (!currentUserId) {
    return (
      <Link href="/sign-in" className="primary-button w-full justify-center sm:w-auto">
        <Users className="h-4 w-4" />
        entrar para confirmar
      </Link>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {joined ? (
          <>
            <a href="#crew-chat" className="primary-button px-4 py-2.5">
              <MessageCircle className="h-4 w-4" />
              abrir chat
            </a>
            {!isCreator ? (
              <button
                type="button"
                onClick={() => updatePresence("leave")}
                disabled={loading === "leave" || status === "cancelled"}
                className="secondary-button px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                {loading === "leave" ? "saindo..." : "cancelar presença"}
              </button>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            onClick={() => updatePresence("join")}
            disabled={loading === "join" || status !== "open"}
            className="primary-button px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Users className="h-4 w-4" />
            {loading === "join" ? "entrando..." : "confirmar presença"}
          </button>
        )}

        {isCreator && status !== "cancelled" ? (
          <button
            type="button"
            onClick={cancelCrew}
            disabled={loading === "cancel"}
            className="secondary-button px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            {loading === "cancel" ? "cancelando..." : "cancelar Crew"}
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-coral-400/25 bg-coral-400/10 p-3 text-sm font-bold text-coral-400">
          {error}
        </div>
      ) : null}
    </div>
  );
}
