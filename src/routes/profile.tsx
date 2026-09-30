import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Screen } from "@/components/app-shell";
import { user } from "@/data/prototype";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Fundamental." },
      { name: "description", content: "Your target institution, appearance and settings." },
      { property: "og:title", content: "Profile — Fundamental." },
      { property: "og:description", content: "Your target institution, appearance and settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfileScreen,
});

const items = ["Edit Profile", "Target Institution", "Settings"];

function ProfileScreen() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme(next: boolean) {
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <Screen>
      <div className="mb-6 flex items-center gap-4 pt-2">
        <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-lg font-semibold">
          {user.name.charAt(0)}
        </div>
        <div>
          <p className="text-[19px] font-semibold tracking-[-0.02em]">{user.name}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Target: {user.target}</p>
        </div>
      </div>

      <div className="divide-y divide-border border-y border-border">
        <div className="flex items-center justify-between py-3.5">
          <div>
            <p className="text-[15px] font-medium">Appearance</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {dark ? "Dark" : "Light"} theme
            </p>
          </div>
          <div className="flex rounded-lg border border-border p-0.5">
            {(["Light", "Dark"] as const).map((t) => {
              const active = (t === "Dark") === dark;
              return (
                <button
                  key={t}
                  onClick={() => toggleTheme(t === "Dark")}
                  className={cn(
                    "tap rounded-md px-3 py-1.5 text-[13px] font-medium",
                    active ? "bg-secondary text-foreground" : "text-muted-foreground",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        {items.map((label) => (
          <button key={label} className="tap flex w-full items-center justify-between py-3.5 text-left">
            <span className="text-[15px] font-medium">{label}</span>
            <span className="text-muted-foreground/60">›</span>
          </button>
        ))}
      </div>

      <p className="mt-6 text-[12px] text-muted-foreground">Fundamental. · Prototype v0.1</p>
    </Screen>
  );
}
