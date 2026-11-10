"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { projects, type Project } from "@/content/projects";
import { education, experience, profile, skills } from "@/content/site";
import { useSite } from "@/lib/store";
import { play } from "@/lib/sound";

/**
 * A small working terminal on the Contact card. Plain HTML, so it works with
 * the 3D scene off, on phones and with screen readers. Its last lines are
 * mirrored on the 3D terminal at the end of the desk.
 */

type Kind = "in" | "out" | "err";
type Line = { id: number; kind: Kind; text: string; node?: ReactNode };
type Out = { text: string; node?: ReactNode; kind?: Kind };

const PROMPT = "srijan@desk:~$";
const MAX_LINES = 200;

const ALIASES: Record<string, string> = {
  "1": "fitos",
  fitos: "fitos",
  "2": "thermal-aware-job-ordering",
  tdas: "thermal-aware-job-ordering",
  thermal: "thermal-aware-job-ordering",
  pi: "thermal-aware-job-ordering",
  "3": "emotion-detection",
  emotion: "emotion-detection",
  esp32: "emotion-detection",
  "4": "l2-escape-bench",
  l2: "l2-escape-bench",
  escape: "l2-escape-bench",
  blockchain: "l2-escape-bench",
};

function findProject(arg: string): Project | undefined {
  const a = arg.trim().toLowerCase();
  return projects.find((p) => p.slug === a || p.slug === ALIASES[a]);
}

const ext = (href: string, label: string) => (
  <a href={href} className="text-[#7ee2a8] underline underline-offset-2 hover:text-white">
    {label}
  </a>
);

const COMMANDS: { name: string; args?: string; about: string }[] = [
  { name: "help", about: "list commands" },
  { name: "whoami", about: "who's behind the desk" },
  { name: "projects", about: "the four stations (alias: ls)" },
  { name: "open", args: "<project>", about: "open a case study, e.g. open fitos" },
  { name: "cat", args: "<project>", about: "headline numbers, e.g. cat l2" },
  { name: "skills", about: "skills, and the project that proves each" },
  { name: "experience", about: "internships" },
  { name: "education", about: "degree" },
  { name: "contact", about: "email, GitHub, LinkedIn" },
  { name: "resume", about: "open the resume (PDF)" },
  { name: "ask", args: "<question>", about: "ask about my work (AI; don't type anything private)" },
  { name: "lamp", args: "on|off", about: "switch the desk lamp" },
  { name: "sound", args: "on|off", about: "interface sounds" },
  { name: "coffee", about: "refill the mug" },
  { name: "neofetch", about: "system info, sort of" },
  { name: "history", about: "commands you've typed" },
  { name: "clear", about: "clear the screen (Ctrl+L)" },
];

const COMPLETIONS = [
  ...COMMANDS.map((c) => c.name),
  "ls",
  "sudo hire srijan",
  ...projects.map((p) => `open ${Object.keys(ALIASES).find((k) => ALIASES[k] === p.slug && !/^\d$/.test(k))}`),
];

const QUICK = ["help", "projects", "whoami", "sudo hire srijan"];

export function Terminal() {
  const router = useRouter();
  const inputId = useId();
  const [lines, setLines] = useState<Line[]>([
    { id: 0, kind: "out", text: "Welcome to the desk. Type `help` to see what it can do." },
  ]);
  const [value, setValue] = useState("");
  const [past, setPast] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(1);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const touched = useRef(false);

  // Keep the newest line in view (scrolls the terminal box only, never the page).
  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  // Mirror onto the 3D screen once the visitor has typed something.
  useEffect(() => {
    if (!touched.current) return;
    useSite.getState().set({
      termScreen: lines.slice(-8).map((l) => (l.kind === "in" ? `$ ${l.text}` : l.text)),
    });
  }, [lines]);

  const run = (raw: string): { out: Out[]; clear?: boolean; go?: string } => {
    const cmd = raw.trim();
    const [head = "", ...rest] = cmd.split(/\s+/);
    const name = head.toLowerCase();
    const arg = rest.join(" ");

    switch (name) {
      case "":
        return { out: [] };
      case "help":
        return {
          out: [
            ...COMMANDS.map((c) => ({ text: `  ${`${c.name}${c.args ? ` ${c.args}` : ""}`.padEnd(16)} ${c.about}` })),
            { text: "Tip: ↑/↓ for history, Tab to complete." },
          ],
        };
      case "whoami":
        return {
          out: [
            { text: profile.name },
            { text: profile.tagline },
            { text: `${profile.status}${profile.lookingFor ? ` · ${profile.lookingFor}` : ""}` },
          ],
        };
      case "ls":
      case "projects":
        return {
          out: [
            ...projects.map((p, i) => ({
              text: `  0${i + 1}  ${p.shortTitle.padEnd(18)} ${p.status}`,
            })),
            { text: "Try: open 1   or   cat tdas" },
          ],
        };
      case "cd":
      case "open": {
        if (!arg) return { out: [{ kind: "err", text: `usage: ${name} <project>   (fitos, tdas, emotion, l2)` }] };
        if (arg.toLowerCase().startsWith("resume")) return { out: [{ text: "opening resume.pdf…" }], go: profile.resume };
        const p = findProject(arg);
        if (!p) return { out: [{ kind: "err", text: `${name}: no such station: ${arg}. Try: projects` }] };
        return { out: [{ text: `opening ${p.shortTitle}…` }], go: `/projects/${p.slug}` };
      }
      case "cat": {
        if (!arg) return { out: [{ kind: "err", text: "usage: cat <project>" }] };
        if (arg.toLowerCase().startsWith("resume")) return { out: [{ text: "opening resume.pdf…" }], go: profile.resume };
        const p = findProject(arg);
        if (!p) return { out: [{ kind: "err", text: `cat: ${arg}: No such file or directory` }] };
        return {
          out: [
            { text: `# ${p.title}` },
            { text: p.oneLiner },
            ...p.stats.map((s) => ({ text: `  • ${s.value}  ${s.label}` })),
            {
              text: `→ open ${p.slug}`,
              node: (
                <>
                  →{" "}
                  <Link href={`/projects/${p.slug}`} className="text-[#7ee2a8] underline underline-offset-2 hover:text-white">
                    read the case study
                  </Link>
                </>
              ),
            },
          ],
        };
      }
      case "skills":
        return {
          out: skills.map((g) => ({
            text: `  ${g.group}: ${g.skills.join(", ")}  [${g.provenBy.map((b) => b.label).join(", ")}]`,
          })),
        };
      case "experience":
        return { out: experience.map((x) => ({ text: `  ${x.dates.padEnd(16)} ${x.role}, ${x.org}` })) };
      case "education":
        return { out: [{ text: `${education.degree}, ${education.school}` }, { text: education.detail }] };
      case "contact":
      case "email":
      case "github":
      case "linkedin":
        return {
          out: [
            { text: `email     ${profile.email}`, node: <>email{"     "}{ext(`mailto:${profile.email}`, profile.email)}</> },
            { text: "github    github.com/srijan1202", node: <>github{"    "}{ext(profile.github, "github.com/srijan1202")}</> },
            {
              text: "linkedin  linkedin.com/in/srijansrivastava1202",
              node: <>linkedin{"  "}{ext(profile.linkedin, "linkedin.com/in/srijansrivastava1202")}</>,
            },
          ],
        };
      case "resume":
        return { out: [{ text: "opening resume.pdf…" }], go: profile.resume };
      case "neofetch":
        return {
          out: [
            { text: "  srijan@desk" },
            { text: "  -----------" },
            { text: "  OS        B.Tech CSE, VIT Vellore" },
            { text: "  Uptime    4th year, graduating July 2027" },
            { text: `  Packages  ${projects.length} projects, 1 preregistered negative result` },
            { text: "  Shell     TypeScript, Python, C, Dart" },
            { text: "  GPU       a Raspberry Pi that throttles at 80.8 °C" },
          ],
        };
      case "history":
        return { out: past.length ? past.map((h, i) => ({ text: `  ${String(i + 1).padStart(3)}  ${h}` })) : [{ text: "(empty)" }] };
      case "clear":
        return { out: [], clear: true };
      case "sudo":
        if (/^hire\s+srijan/i.test(arg)) {
          return {
            out: [
              { text: "[sudo] password for recruiter: ********" },
              { text: "Access granted." },
              { text: "Drafting offer letter… done." },
              {
                text: `Send it: ${profile.email}`,
                node: (
                  <>
                    Send it:{" "}
                    {ext(`mailto:${profile.email}?subject=${encodeURIComponent("Let's talk")}`, profile.email)}
                  </>
                ),
              },
            ],
          };
        }
        return { out: [{ kind: "err", text: "recruiter is not in the sudoers file. This incident will be reported." }, { text: "(psst: sudo hire srijan)" }] };
      case "hi":
      case "hello":
        return { out: [{ text: "Hi! I'm Srijan's desk. Type `help`." }] };
      case "pwd":
        return { out: [{ text: "/home/srijan/desk" }] };
      case "date":
        return { out: [{ text: new Date().toString() }] };
      case "echo":
        return { out: [{ text: arg }] };
      case "coffee":
        useSite.getState().set({ steam: useSite.getState().steam + 1 });
        return { out: [{ text: "Brewing… done. The mug on the desk (near the start) is steaming." }] };
      case "lamp": {
        const want = arg.toLowerCase();
        if (want !== "on" && want !== "off") return { out: [{ kind: "err", text: "usage: lamp on|off" }] };
        useSite.getState().set({ lampOn: want === "on" });
        return { out: [{ text: `Desk lamp ${want}.` }] };
      }
      case "sound": {
        const want = arg.toLowerCase();
        if (want !== "on" && want !== "off") return { out: [{ kind: "err", text: "usage: sound on|off" }] };
        useSite.getState().set({ sound: want === "on" });
        return { out: [{ text: `Sound ${want}.` }] };
      }
      case "exit":
        return { out: [{ text: "There's no exit from this desk. There is an escape hatch, though: open l2" }] };
      case "rm":
        return { out: [{ kind: "err", text: "rm: permission denied. This desk was preregistered." }] };
      default:
        return { out: [{ kind: "err", text: `command not found: ${head}. Type \`help\`.` }] };
    }
  };

  const push = (added: Omit<Line, "id">[]) =>
    setLines((prev) => [...prev, ...added.map((l) => ({ ...l, id: nextId.current++ }))].slice(-MAX_LINES));

  const ask = async (question: string) => {
    if (!question) return push([{ kind: "err", text: "usage: ask <question>   e.g. ask what did the TDAS study find?" }]);
    setBusy(true);
    push([{ kind: "out", text: "thinking…" }]);
    let text = "";
    let kind: Kind = "out";
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = (await res.json()) as { answer?: string; error?: string; max?: number };
      if (data.answer) text = data.answer;
      else {
        kind = "err";
        text =
          data.error === "off"
            ? "ask isn't switched on yet. Try: projects, cat tdas, skills"
            : data.error === "rate-limited"
              ? "Too many questions for now. Try again in a minute."
              : data.error === "too-long"
                ? `Keep it under ${data.max ?? 300} characters.`
                : "Couldn't get an answer just now. Try again.";
      }
    } catch {
      kind = "err";
      text = "Couldn't reach the server. Check your connection.";
    }
    setBusy(false);
    // Replace the "thinking…" line with the answer.
    setLines((prev) => {
      const i = prev.findLastIndex((l) => l.text === "thinking…");
      const next = i >= 0 ? prev.filter((_, j) => j !== i) : prev;
      return [...next, { id: nextId.current++, kind, text }].slice(-MAX_LINES);
    });
  };

  const submit = (raw: string) => {
    touched.current = true;
    play("key");
    if (busy) return;
    const askMatch = raw.trim().match(/^ask(?:\s+([\s\S]*))?$/i);
    if (askMatch) {
      setPast((p) => [...p.slice(-49), raw.trim()]);
      setCursor(-1);
      setValue("");
      push([{ kind: "in", text: raw }]);
      void ask((askMatch[1] ?? "").trim());
      return;
    }
    const { out, clear, go } = run(raw);
    if (raw.trim()) setPast((p) => [...p.slice(-49), raw.trim()]);
    setCursor(-1);
    setValue("");
    setLines((prev) => {
      if (clear) return [];
      const added: Line[] = [
        { id: nextId.current++, kind: "in", text: raw },
        ...out.map((o) => ({ id: nextId.current++, kind: o.kind ?? "out", text: o.text, node: o.node })),
      ];
      return [...prev, ...added].slice(-MAX_LINES);
    });
    if (go) {
      if (go.endsWith(".pdf")) window.location.href = go;
      else router.push(go);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit(value);
    } else if (e.key === "ArrowUp") {
      if (!past.length) return;
      e.preventDefault();
      const i = cursor === -1 ? past.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setValue(past[i]);
    } else if (e.key === "ArrowDown") {
      if (cursor === -1) return;
      e.preventDefault();
      const i = cursor + 1;
      if (i >= past.length) {
        setCursor(-1);
        setValue("");
      } else {
        setCursor(i);
        setValue(past[i]);
      }
    } else if (e.key === "Tab" && value.trim()) {
      const hits = COMPLETIONS.filter((c) => c.startsWith(value.toLowerCase()));
      if (hits.length === 1) {
        e.preventDefault();
        // Full commands ("open fitos") complete as-is; bare commands get a trailing space for the argument.
        setValue(hits[0].includes(" ") ? hits[0] : `${hits[0]} `);
      } else if (hits.length > 1) {
        e.preventDefault();
        setLines((prev) => [...prev, { id: nextId.current++, kind: "out" as const, text: hits.join("   ") }].slice(-MAX_LINES));
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <section aria-label="Interactive terminal" className="overflow-hidden rounded-xl border border-line bg-[#06110c] font-mono">
      <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="ml-2 text-[11px] text-white/30">~/desk</span>
      </div>
      {/* Clicking anywhere in the screen focuses the prompt, unless text is being selected. */}
      <div
        ref={log}
        onClick={() => {
          if (!window.getSelection()?.toString()) input.current?.focus({ preventScroll: true });
        }}
        className="h-60 overflow-y-auto px-3 py-2 text-[12.5px] leading-relaxed text-[#d6f5e3] sm:h-64"
      >
        {/* Only the output is announced; the prompt sits outside the live region. */}
        <div role="log" aria-live="polite" aria-label="Terminal output">
        {lines.map((l) => (
          <div
            key={l.id}
            className={`whitespace-pre-wrap break-words ${l.kind === "err" ? "text-[#ff9b8a]" : ""}`}
          >
            {l.kind === "in" ? (
              <>
                <span className="text-[#7ee2a8]">{PROMPT}</span> {l.text}
              </>
            ) : (
              (l.node ?? l.text)
            )}
          </div>
        ))}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={inputId} className="shrink-0 text-[#7ee2a8]">
            {PROMPT}
          </label>
          <input
            id={inputId}
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            aria-label="Terminal command"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            style={{ outline: "none" }}
            className="min-w-0 flex-1 bg-transparent text-[16px] text-white caret-[#7ee2a8] outline-none sm:text-[12.5px]"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-white/5 px-3 py-2">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => submit(q)}
            className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-white/60 transition-colors hover:border-[#7ee2a8]/50 hover:text-white"
          >
            {q}
          </button>
        ))}
      </div>
    </section>
  );
}
