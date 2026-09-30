import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { findMaterial, getQuestions, todaysFocus, user } from "@/data/prototype";
import { formatDuration, needsReview, streak, summarize, useActivity, weekActivity } from "@/lib/activity";

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
  const week = weekActivity(attempts);
  const ws = summarize(week.attempts);
  const days = streak(attempts);
  const max = Math.max(1, ...week.days.map((d) => d.count));
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
        <p className="text-[15px] font-semibold tracking-[-0.02em]">Fundamental.</p>
        <h1 className="mt-4 text-[27px] font-semibold tracking-[-0.02em]" suppressHydrationWarning>
          {greeting}, {user.name}.
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Preparing for {user.target}</p>
      </header>

      <section className="rounded-xl border border-border bg-surface p-4 shadow-soft">
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

      {data && attempts.length > 0 ? (
        <>
          <div className="mt-4 flex items-center justify-between border-b border-border pb-4">
            <p className="text-[15px]">
              <span className="tabular font-semibold">{days} day</span> streak
            </p>
            <div className="flex gap-1">
              {week.days.map((d) => (
                <span key={d.key} className={`h-1.5 w-4 rounded-full ${d.count ? "bg-primary" : "bg-border-strong"}`} />
              ))}
            </div>
          </div>

          <Link to="/review" className="tap block border-b border-border py-4">
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium tracking-[-0.01em]">Needs Review</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {reviewCount ? `${reviewCount} topic${reviewCount === 1 ? "" : "s"} need${reviewCount === 1 ? "s" : ""} another look` : "Nothing to review"}
                </p>
              </div>
              <span className="rounded-lg border border-border-strong px-3 py-1.5 text-[13px] font-medium">Review</span>
            </div>
          </Link>

          <section className="pt-5">
            <div className="flex items-baseline justify-between">
              <p className="label-xs">This Week</p>
              <Link to="/progress" className="text-[13px] text-primary">Details</Link>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <Stat value={String(ws.total)} label="Questions" />
              <Stat value={ws.total ? `${ws.accuracy}%` : "—"} label="Accuracy" />
              <Stat value={ws.total ? formatDuration(ws.timeMs) : "—"} label="Study time" />
            </div>
            <div className="mt-4 flex items-end justify-between gap-2">
              {week.days.map((d) => (
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
          </section>
        </>
      ) : data ? (
        <section className="mt-6 border-y border-border py-8 text-center">
          <p className="text-[15px] font-medium">No activity yet</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Complete your first practice session to see your progress.
          </p>
        </section>
      ) : null}
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
