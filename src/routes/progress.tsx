import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { findSubtest } from "@/data/prototype";
import { bySubtest, formatDuration, needsReview, summarize, useActivity, weekActivity } from "@/lib/activity";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Fundamental." },
      { name: "description", content: "Questions answered, accuracy, study time and topic strength." },
      { property: "og:title", content: "Progress — Fundamental." },
      { property: "og:description", content: "Questions, accuracy, study time and topic strength." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgressScreen,
});

function ProgressScreen() {
  const data = useActivity();
  if (!data) return <Screen><PageHeader title="Progress" /></Screen>;

  if (data.attempts.length === 0) {
    return (
      <Screen>
        <PageHeader title="Progress" />
        <div className="border-y border-border py-10 text-center">
          <p className="text-[15px] font-medium">No activity yet</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Complete your first practice session to see your progress.
          </p>
          <Button asChild className="mt-5">
            <Link to="/practice">Start practicing</Link>
          </Button>
        </div>
      </Screen>
    );
  }

  const week = weekActivity(data.attempts);
  const ws = summarize(week.attempts);
  const topics = bySubtest(data.attempts);
  const review = needsReview(data.attempts);

  return (
    <Screen>
      <PageHeader title="Progress" />

      <p className="label-xs">Last 7 days</p>
      <div className="mt-2 grid grid-cols-3 gap-3 border-y border-border py-4">
        <Stat value={String(ws.total)} label="Questions" />
        <Stat value={ws.total ? `${ws.accuracy}%` : "—"} label="Accuracy" />
        <Stat value={ws.total ? formatDuration(ws.timeMs) : "—"} label="Study time" />
      </div>

      <section className="pt-5">
        <p className="label-xs">This Week</p>
        <div className="mt-3 flex justify-between">
          {week.days.map((d) => (
            <div key={d.key} className="flex flex-col items-center gap-2">
              <span className={`text-[12px] ${d.isToday ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {d.label}
              </span>
              <span className={`size-2.5 rounded-full ${d.count ? "bg-primary" : "border border-border-strong"}`} />
              <span className="tabular text-[11px] text-muted-foreground">{d.count || ""}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-6">
        <p className="label-xs">Topics · all time</p>
        <div className="mt-2 divide-y divide-border border-y border-border">
          {topics.map((t) => (
            <div key={t.subtestId} className="py-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium">
                  {findSubtestName(t.subtestId)}
                </span>
                <span className="tabular text-[14px] text-muted-foreground">
                  {t.accuracy}% · {t.total} q
                </span>
              </div>
              <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-primary/70" style={{ width: `${t.accuracy}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Link to="/review" className="tap mt-4 flex items-center justify-between border-b border-border py-4">
        <div>
          <p className="text-[15px] font-medium">Needs Review</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {review.length ? `${review.length} topic${review.length === 1 ? "" : "s"} to revisit` : "Nothing to review"}
          </p>
        </div>
        <span className="text-muted-foreground/60">›</span>
      </Link>
    </Screen>
  );
}

function findSubtestName(subtestId: string) {
  for (const exam of ["skd", "utbk", "psikotes", "tpa", "tbi"]) {
    const s = findSubtest(exam, subtestId);
    if (s) return s.name;
  }
  return subtestId;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="tabular text-xl font-semibold tracking-[-0.02em]">{value}</p>
      <p className="mt-0.5 text-[12px] text-muted-foreground">{label}</p>
    </div>
  );
}
