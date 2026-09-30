import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { findMaterial, getQuestions, todaysFocus, user } from "@/data/prototype";
import { dayKey, formatDuration, needsReview, streak, summarize, useActivity } from "@/lib/activity";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fundamental. — Your daily question drill" },
      {
        name: "description",
        content:
          "Fundamental. is a calm, focused drilling app for SKD, UTBK, TPA and more. Pick a topic, answer questions, understand every explanation.",
      },
      { property: "og:title", content: "Fundamental. — Your daily question drill" },
      {
        property: "og:description",
        content: "Less interface. More learning. A serious study tool that gets out of your way.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const data = useActivity();
  const attempts = data?.attempts ?? [];
  const reviewCount = needsReview(attempts).length;
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const key = dayKey(date);
    return { key, label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], count: attempts.filter((a) => dayKey(new Date(a.answeredAt)) === key).length, isToday: key === dayKey(today) };
  });
  const ws = summarize(attempts.filter((a) => weekDays.some((d) => d.key === dayKey(new Date(a.answeredAt)))));
  const days = streak(attempts);
  const max = Math.max(1, ...weekDays.map((d) => d.count));
  const lastSession = data?.sessions.at(-1);
  const focusMaterial = lastSession
    ? findMaterial(lastSession.examId, lastSession.subtestId, lastSession.materialId)
    : undefined;
  const focus = lastSession && focusMaterial
    ? { examId: lastSession.examId, subtestId: lastSession.subtestId, materialId: lastSession.materialId, name: focusMaterial.name }
    : todaysFocus;
  const qCount = getQuestions().length;
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Screen>
      <header className="mb-6">
        <p className="text-[15px] font-semibold tracking-[-0.02em]">Fundamental<span className="text-primary">.</span></p>
        <h1 className="mt-4 text-[27px] font-semibold tracking-[-0.02em]" suppressHydrationWarning>
          {greeting}, {user.name}.
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Preparing for {user.target}</p>
      </header>

      <section className="mb-5 flex min-h-11 items-center justify-between gap-3 border-y border-border py-2.5" aria-label="Streak">
        <p className="flex shrink-0 items-center gap-1.5 text-[14px] font-medium">
          <Flame aria-hidden="true" className="size-4 text-primary" />{days ? `${days} day${days === 1 ? "" : "s"} streak` : "No streak yet"}
        </p>
        <p className="text-right text-[13px] text-muted-foreground">{days ? "Keep it going!" : "Start today."}</p>
      </section>

      <section className="rounded-lg border border-border bg-surface p-4 shadow-soft" aria-label="This Week">
        <div className="flex items-baseline justify-between">
          <p className="label-xs">This Week</p>
          <Link to="/progress" className="text-[13px] text-primary">View details</Link>
        </div>
        {ws.total > 0 ? (
          <>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Stat value={String(ws.total)} label="Questions" />
            <Stat value={`${ws.accuracy}%`} label="Accuracy" />
            <Stat value={formatDuration(ws.timeMs)} label="Study time" />
          </div>
          <div className="mt-4 flex items-end justify-between gap-2">
            {weekDays.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="tabular text-[10px] text-muted-foreground">{d.count || ""}</span>
                <div
                  className={`w-full rounded-sm ${d.count ? "bg-primary" : "bg-border"}`}
                  style={{ height: `${d.count ? 6 + (d.count / max) * 42 : 3}px` }}
                />
                <span className={`text-[11px] ${d.isToday ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
          </>
        ) : (
          <div className="mt-4">
            <p className="text-[14px] font-medium">No activity yet</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Start practicing to see your weekly activity.</p>
            <div className="mt-4 grid grid-cols-7 gap-1 border-t border-border pt-3">
              {weekDays.map((d) => (
                <span key={d.key} className={`text-center text-[11px] ${d.isToday ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{d.label}</span>
              ))}
            </div>
          </div>
        )}
      </section>

      <Link to="/review" className="tap mt-4 block border-b border-border py-3.5">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium tracking-[-0.01em]">Needs Review</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {reviewCount ? `${reviewCount} topic${reviewCount === 1 ? "" : "s"} need${reviewCount === 1 ? "s" : ""} another look` : "All caught up · No items yet"}
            </p>
          </div>
          {reviewCount > 0 ? <span className="rounded-lg border border-border-strong px-3 py-1.5 text-[13px] font-medium">Review</span> : <span className="text-muted-foreground/60">›</span>}
        </div>
      </Link>

      <section className="mt-4 rounded-xl border border-border bg-surface p-4 shadow-soft">
        <p className="label-xs">{lastSession ? "Continue" : "Suggested start"}</p>
        <p className="mt-2 text-lg font-medium tracking-[-0.015em]">{focus.name}</p>
        <p className="tabular mt-0.5 text-[13px] text-muted-foreground">{qCount} questions</p>
        <Button asChild size="block" className="mt-4">
          <Link
            to="/practice/$examId/$subtestId/$materialId"
            params={{ examId: focus.examId, subtestId: focus.subtestId, materialId: focus.materialId }}
          >
            {lastSession ? "Continue" : "Start"}
          </Link>
        </Button>
      </section>

    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="tabular text-xl font-semibold tracking-[-0.02em]">{value}</p>
      <p className="mt-0.5 text-[12px] text-muted-foreground">{label}</p>
    </div>
  );
}
