import Link from "next/link";
import { AGENTS } from "@/content/agents";
import { SESSIONS } from "@/content";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-6 py-24">
      <header className="flex flex-col gap-4">
        <div className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Agentic School</div>
        <h1 className="text-4xl font-semibold leading-tight">
          Learn AI.
          <br />
          Build Agents.
          <br />
          Transform Work.
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          An AI-first school where intelligent agents teach alongside leading human experts.
        </p>
        <p className="text-lg font-medium">$100. Two weeks. One new AI capability.</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Sessions</h2>
        {SESSIONS.map((s) => (
          <div key={s.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="font-semibold">{s.title}</div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{s.outcome}</p>
            <Link
              href={`/learn/${s.id}/${s.lessons[0].id}`}
              className="mt-3 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Start lesson 1
            </Link>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Meet your AI teaching team</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {Object.values(AGENTS).map((a) => (
            <li key={a.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="font-semibold">
                {a.name} <span className="font-normal text-zinc-500">· {a.role}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{a.intro}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="text-sm text-zinc-500">Operated internationally by FMG.</footer>
    </div>
  );
}
