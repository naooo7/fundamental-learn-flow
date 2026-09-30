import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, PageHeader, ListRow } from "@/components/app-shell";
import { exams } from "@/data/prototype";

export const Route = createFileRoute("/practice/")({
  head: () => ({
    meta: [
      { title: "Practice — Fundamental." },
      {
        name: "description",
        content: "Choose an exam to practice: SKD, UTBK, Psikotes, TPA or TBI.",
      },
      { property: "og:title", content: "Practice — Fundamental." },
      { property: "og:description", content: "Pick what you want to drill today." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Practice,
});

function Practice() {
  return (
    <Screen>
      <PageHeader title="Practice" caption="Choose what you want to work on." />
      <div className="divide-y divide-border border-y border-border">
        {exams.map((exam) => (
          <Link key={exam.id} to="/practice/$examId" params={{ examId: exam.id }} className="tap block">
            <ListRow title={exam.name} caption={exam.caption} />
          </Link>
        ))}
      </div>
    </Screen>
  );
}
