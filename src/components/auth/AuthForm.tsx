"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LogIn, UserPlus, Waves } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("loading");

    const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Não foi possível concluir. Tente novamente.");
      setStatus("idle");
      return;
    }

    setStatus("success");
    const nextPath = new URLSearchParams(window.location.search).get("next");
    router.push(nextPath ?? "/");
    router.refresh();
  }

  return (
    <section className="grid w-full max-w-5xl overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.045] shadow-card lg:grid-cols-[1.02fr_0.98fr]">
      <div className="p-6 sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tide-400 text-ink-950">
          {isRegister ? <UserPlus className="h-7 w-7" /> : <LogIn className="h-7 w-7" />}
        </div>
        <p className="mt-8 section-kicker">{isRegister ? "cadastro" : "entrar"}</p>
        <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
          {isRegister ? "Começar a temporada" : "Voltar para o lineup"}
        </h1>
        <p className="mt-4 text-sm leading-6 text-sand-100/65">
          {isRegister
            ? "Crie sua conta para salvar perfil, sessions, badges e evolução."
            : "Acesse seu dashboard, registre sessions e acompanhe sua evolução."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {isRegister ? (
            <label className="block space-y-2">
              <span className="label">nome</span>
              <input
                className="field"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Seu nome"
                required
              />
            </label>
          ) : null}

          <label className="block space-y-2">
            <span className="label">email</span>
            <input
              type="email"
              autoComplete="email"
              className="field"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="label">senha</span>
            <input
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="field"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="mínimo 8 caracteres"
              minLength={8}
              required
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-coral-400/25 bg-coral-400/10 p-3 text-sm font-bold text-coral-400">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={status === "loading"}
            className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading"
              ? "processando..."
              : isRegister
                ? "criar conta"
                : "entrar"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {!isRegister ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-sand-100/62">
            Conta demo: <span className="font-black text-white">demo@sessions.dev</span>{" "}
            · senha <span className="font-black text-white">sessions123</span>
          </div>
        ) : null}

        <p className="mt-8 text-center text-sm text-sand-100/65">
          {isRegister ? "Já tem conta?" : "Ainda sem conta?"}{" "}
          <Link
            href={isRegister ? "/sign-in" : "/sign-up"}
            className="font-black text-tide-300"
          >
            {isRegister ? "Entrar" : "Criar cadastro"}
          </Link>
        </p>
      </div>

      <div
        className="hidden min-h-[620px] bg-cover bg-center lg:block"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(6, 16, 18, 0.08), rgba(6, 16, 18, 0.9)), url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80)",
        }}
      >
        <div className="flex h-full flex-col justify-end p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-black/25 text-tide-300 backdrop-blur">
            <Waves className="h-6 w-6" />
          </div>
        </div>
      </div>
    </section>
  );
}
