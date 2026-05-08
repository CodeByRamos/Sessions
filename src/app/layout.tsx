import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sessions | Diário social de surf",
  description: "Diário cinematográfico de surf, evolução pessoal e conexão local.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        <main className="pb-24 pt-16 md:pb-0 md:pt-[76px]">{children}</main>
      </body>
    </html>
  );
}
