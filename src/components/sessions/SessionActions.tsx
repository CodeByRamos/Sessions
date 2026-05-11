"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SessionActionsProps = {
  sessionId: string;
};

export function SessionActions({ sessionId }: SessionActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function deleteSession() {
    if (!window.confirm("Excluir esta session? Essa ação não pode ser desfeita.")) {
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch(`/api/sessions/${sessionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Não foi possível excluir a session.");
      setLoading(false);
      return;
    }

    router.push("/my-sessions");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Link href={`/sessions/${sessionId}/edit`} className="secondary-button px-3 py-2 text-xs">
          <Pencil className="h-4 w-4" />
          editar
        </Link>
        <button
          type="button"
          disabled={loading}
          onClick={deleteSession}
          className="secondary-button px-3 py-2 text-xs text-coral-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {loading ? "excluindo..." : "excluir"}
        </button>
      </div>
      {error ? (
        <div className="rounded-2xl border border-coral-400/25 bg-coral-400/10 p-3 text-xs font-bold text-coral-400">
          {error}
        </div>
      ) : null}
    </div>
  );
}
