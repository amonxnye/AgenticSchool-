"use client";

import { useState } from "react";
import { AGENTS, BEAT_AGENT } from "@/content/agents";
import type { LearnerProfile, Lesson, Session } from "@/content/types";
import type { ChatMessage } from "@/lib/gateway";
import AgentChat from "./AgentChat";
import Curriculum from "./Curriculum";
import ProfileBar from "./ProfileBar";
import TeachingTeam from "./TeachingTeam";
import WatchBeat from "./WatchBeat";

const DEFAULT_PROFILE: LearnerProfile = { profession: "", level: "some" };

const PLACEHOLDER: Record<string, string> = {
  explain: "Ask a question about this…",
  check: "Type your answer…",
  do: "Paste your agent spec here…",
  apply: "Write your reflection here…",
};

export default function LessonRuntime({ session, lesson }: { session: Session; lesson: Lesson }) {
  const [profile, setProfile] = useState<LearnerProfile>(DEFAULT_PROFILE);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<string[]>([]);
  const [transcripts, setTranscripts] = useState<Record<string, ChatMessage[]>>({});

  const beat = lesson.beats[index];
  const agent = AGENTS[BEAT_AGENT[beat.type]];
  const messages = transcripts[beat.id] ?? [];
  const isLast = index === lesson.beats.length - 1;
  const canContinue = beat.type === "watch" || messages.some((m) => m.role === "assistant");

  function complete() {
    setDone((d) => (d.includes(beat.id) ? d : [...d, beat.id]));
    if (!isLast) setIndex(index + 1);
  }

  const finished = done.length === lesson.beats.length;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 p-6 lg:grid-cols-[260px_minmax(0,1fr)_260px]">
      <Curriculum lesson={lesson} index={index} done={done} onSelect={setIndex} />

      <main className="flex min-w-0 flex-col gap-5">
        <div className="text-xs text-zinc-500">{session.title}</div>
        <ProfileBar profile={profile} onChange={setProfile} />
        <h1 className="text-2xl font-semibold">{beat.title}</h1>

        {beat.type === "watch" ? (
          <WatchBeat beat={beat} />
        ) : (
          <>
            {beat.type === "do" && <p className="text-sm">{beat.task}</p>}
            {beat.type === "apply" && <p className="text-sm">{beat.prompt}</p>}
            <AgentChat
              key={beat.id}
              agent={agent}
              context={{ sessionId: session.id, lessonId: lesson.id, beatId: beat.id, profile }}
              autoStart={beat.type === "explain" || beat.type === "check"}
              placeholder={PLACEHOLDER[beat.type]}
              messages={messages}
              onChange={(m) => setTranscripts((t) => ({ ...t, [beat.id]: m }))}
            />
          </>
        )}

        <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <span className="text-xs text-zinc-500">
            Beat {index + 1} of {lesson.beats.length}
          </span>
          {finished && isLast ? (
            <span className="text-sm font-medium">Lesson complete.</span>
          ) : (
            <button
              type="button"
              onClick={complete}
              disabled={!canContinue}
              className="rounded-lg border border-zinc-900 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-zinc-100"
            >
              {isLast ? "Finish lesson" : "Continue"}
            </button>
          )}
        </div>
      </main>

      <TeachingTeam active={agent.id} />
    </div>
  );
}
