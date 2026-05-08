import { Award, Home, Plus, UserRound, Waves } from "lucide-react";
import Link from "next/link";

type MobileNavProps = {
  pathname: string;
};

const mobileItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/sessions/new", label: "Nova", icon: Plus, featured: true },
  { href: "/picos", label: "Picos", icon: Waves },
  { href: "/badges", label: "Badges", icon: Award },
  { href: "/profile", label: "Perfil", icon: UserRound },
];

export function MobileNav({ pathname }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-ink-950/92 px-2 pb-3 pt-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-black transition ${
                item.featured
                  ? "bg-tide-400 text-ink-950"
                  : isActive
                    ? "bg-white text-ink-950"
                    : "text-sand-100/62 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
