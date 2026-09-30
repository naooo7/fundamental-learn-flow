import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { endSession, recordAttempt, startSession } from "@/lib/activity";
import { Button } from "@/components/ui/button";
import { findMaterial, getQuestions } from "@/data/prototype";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/session/$examId/$subtestId/$materialId")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search["mode"] as string) ?? "drill",
  }),
  head: () => ({
    meta: [
      { title: "Question — Fundamental." },
      { name: "description", content: "One question at a time, with a clear explanation." },
      { property: "og:title", content: "Question — Fundamental." },
      { property: "og:description", content: "One question at a time, with a clear explanation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SessionScreen,
});

function SessionScreen() {
  const { examId, subtestId, materialId } = Route.useParams();
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const material = findMaterial(examId, subtestId, materialId);
  const questions = getQuestions();

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const sessionId = useRef<string | null>(null);
  const questionStart = useRef<number>(0);

  useEffect(() => {
    if (!material) return;
    sessionId.current = startSession({ examId, subtestId, materialId, materialName: material.name, mode });
    questionStart.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, subtestId, materialId]);

  if (!material) throw notFound();

  const q = questions[index]!;
  const isCorrect = selected === q.answer;
  const last = index === questions.length - 1;

  function submit() {
    if (!selected || !sessionId.current) return;
    const correct = selected === q.answer;
    if (correct) setCorrectCount((c) => c + 1);
    recordAttempt({
      sessionId: sessionId.current,
      examId,
      subtestId,
      materialId,
      materialName: material!.name,
      questionId: q.id,
      selected,
      correct,
      // cap idle time per question at 10 min
      durationMs: Math.min(Date.now() - questionStart.current, 10 * 60_000),
    });
    setRevealed(true);
  }

  function next() {
    if (last) {
      if (sessionId.current) endSession(sessionId.current);
      navigate({
        to: "/result",
        search: {
          correct: correctCount,
          total: questions.length,
          material: material!.name,
          examId,
          subtestId,
          sessionId: sessionId.current ?? "",
        },
      });
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
    questionStart.current = Date.now();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5 pb-8 pt-4">
        <div className="flex items-center gap-4">
          <Link
            to="/practice/$examId/$subtestId/$materialId"
            params={{ examId, subtestId, materialId }}
            className="tap -ml-1 text-lg text-muted-foreground"
            aria-label="Leave session"
          >
            ←
          </Link>
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${((index + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
          <span className="tabular text-[13px] text-muted-foreground">
            {index + 1} / {questions.length}
          </span>
        </div>

        <div key={q.id} className="screen-in mt-7 flex-1">
          <p className="text-[17px] leading-[1.55] tracking-[-0.01em]">{q.prompt}</p>

          <div className="mt-6 space-y-2">
            {q.choices.map((c) => {
              const chosen = selected === c.key;
              const showCorrect = revealed && c.key === q.answer;
              const showWrong = revealed && chosen && !isCorrect;
              return (
                <button
                  key={c.key}
                  disabled={revealed}
                  onClick={() => setSelected(c.key)}
                  className={cn(
                    "tap flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left",
                    showCorrect
                      ? "border-success bg-success/[0.08]"
                      : showWrong
                        ? "border-destructive bg-destructive/[0.07]"
                        : chosen
                          ? "border-primary bg-primary/[0.06]"
                          : "border-border bg-surface",
                  )}
                >
                  <span className="tabular w-4 shrink-0 pt-px text-[13px] font-semibold text-muted-foreground">
                    {c.key}
                  </span>
                  <span className="text-[15px] leading-[1.45]">{c.text}</span>
                </button>
              );
            })}
          </div>

          {revealed ? (
            <div className="screen-in mt-6 border-t border-border pt-5">
              <p
                className={cn(
                  "text-[15px] font-semibold",
                  isCorrect ? "text-success" : "text-destructive",
                )}
              >
                {isCorrect ? "✓ Correct" : "✕ Incorrect"}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Correct answer: {q.answer}
              </p>

              <p className="label-xs mt-5">Explanation</p>
              <p className="mt-2 text-[15px] leading-[1.6]">{q.explanation.why}</p>
              <ol className="mt-3 space-y-2">
                {q.explanation.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="tabular w-12 shrink-0 text-[12px] font-semibold text-muted-foreground">
                      Step {i + 1}
                    </span>
                    <span className="text-[14px] leading-[1.55]">{s}</span>
                  </li>
                ))}
              </ol>
              {mode === "learn" ? (
                <p className="mt-4 text-[12px] text-muted-foreground">Learn mode · full steps shown</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 -mx-5 mt-6 bg-background/90 px-5 pb-[env(safe-area-inset-bottom)] pt-3 backdrop-blur-xl">
          {revealed ? (
            <Button size="block" onClick={next}>
              {last ? "See result" : "Next question"}
            </Button>
          ) : (
            <Button size="block" onClick={submit} disabled={!selected}>
              Answer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
