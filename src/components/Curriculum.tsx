import type { Lesson } from "@/content/types";

const LABEL: Record<Lesson["beats"][number]["type"], string> = {
  explain: "Explain",
  watch: "Watch",
  check: "Check",
  do: "Do",
  apply: "Apply",
};

interface Props {
  lesson: Lesson;
  index: number;
  done: string[];
  onSelect: (index: number) => void;
}

export default function Curriculum({ lesson, index, done, onSelect }: Props) {
  return (
    <nav className="flex flex-col gap-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Lesson</div>
        <h2 className="text-base font-semibold">{lesson.title}</h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{lesson.outcome}</p>
      </div>
      <ol className="flex flex-col gap-1">
        {lesson.beats.map((b, i) => {
          const isDone = done.includes(b.id);
          const current = i === index;
          const reachable = isDone || current || i === done.length;
          return (
            <li key={b.id}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onSelect(i)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm disabled:opacity-40 ${current ? "bg-zinc-200 font-medium dark:bg-zinc-800" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
              >
                <span className="w-4 text-xs text-zinc-500">{isDone ? "✓" : i + 1}</span>
                <span className="text-xs text-zinc-500">{LABEL[b.type]}</span>
                <span className="truncate">{b.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
