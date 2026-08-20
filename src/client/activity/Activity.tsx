/** ActivityPanel — the drawer's second tab (session-scoped entry in the
 * 'activity' slot): pending-interaction banner, main-session failure,
 * background jobs, subagents. Reads root-scope list projections
 * (jobsBySession / subagentsByParent) via useSessions; switchToChat and
 * mainErrorOf come from the inject face. */
import { useEffect, useState } from "react";

function durationOf(job, t) {
  if (!job.startedAt) return "";
  const end = job.status === "running" || job.status === "stopping" ? Date.now() : (job.finishedAt ?? job.startedAt);
  const sec = Math.max(0, Math.round((end - job.startedAt) / 1000));
  if (sec < 60) return sec + "s";
  const min = Math.floor(sec / 60);
  if (min < 60) return min + "m " + (sec % 60) + "s";
  return Math.floor(min / 60) + "h " + (min % 60) + "m";
}

export function ActivityPanel({ sessionId, useSessions, t, switchToChat, mainErrorOf }) {
  const snap = useSessions((s) => s);
  // Main-session turn failure (LLM/API error): read off the opened
  // conversation's last closed turn. The window loads asynchronously, so poll
  // briefly after mount (same pattern as the board's openSession sync).
  const [mainError, setMainError] = useState(null);
  useEffect(() => {
    if (mainErrorOf === undefined) return;
    let cancelled = false;
    let tries = 0;
    const check = () => {
      if (cancelled) return;
      const err = mainErrorOf(sessionId);
      if (err === undefined) {
        if (tries++ < 40) setTimeout(check, 100);
        return;
      }
      setMainError(err);
    };
    const timer = setTimeout(check, 150);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [sessionId, mainErrorOf]);

  const jobs = snap.jobsBySession?.[sessionId] ?? [];
  // healthy children plus catalog diagnostic rows (✕ failed — surfaced
  // instead of silently dropped so the failure legend stays truthful)
  const subagents = (snap.subagentsByParent?.[sessionId]?.entries ?? [])
    .filter((entry) => entry.kind === "child" || entry.kind === "diagnostic");
  // pendingInteraction is a kind string ("approval" | "plan-review" |
  // "question") — any defined value means the session is blocked on the user.
  const pending = snap.byId[sessionId]?.pendingInteraction !== undefined;
  const live = jobs.filter((j) => j.status === "running" || j.status === "stopping").length;

  return (
    <div className="bb-act">
      {mainError !== null && mainError !== undefined && (
        <div className="bb-act-error">
          <div className="bb-act-error-head">
            <span aria-hidden>⚠</span>
            <span>{t("act.mainError")}</span>
          </div>
          <div className="bb-act-error-msg">{mainError.message}</div>
          {mainError.code !== void 0 && <code className="bb-act-error-code">{mainError.code}</code>}
        </div>
      )}
      {pending && (
        <div className="bb-act-banner">
          <span className="bb-act-banner-text">{t("act.pending")}</span>
          <button type="button" className="bb-act-banner-btn" onClick={switchToChat}>{t("act.backToChat")}</button>
        </div>
      )}

      <section className="bb-act-section">
        <div className="bb-act-section-title">{t("act.jobs")}</div>
        {jobs.length === 0 && <div className="bb-act-empty">{t("act.noJobs")}</div>}
        {jobs.map((job) => (
          <div key={job.id} className="bb-act-row">
            <span className={"bb-act-dot " + (job.status === "running" || job.status === "stopping" ? "run" : "done")} />
            <span className="bb-act-kind">{job.kind}</span>
            <span className="bb-act-label">{job.label}</span>
            <span className="bb-act-detail">{job.detail ?? durationOf(job, t)}</span>
          </div>
        ))}
      </section>

      <section className="bb-act-section">
        <div className="bb-act-section-title">{t("act.subagents")}</div>
        {subagents.length === 0 && <div className="bb-act-empty">{t("act.noSubagents")}</div>}
        {subagents.map((child) => (
          <div key={child.id} className="bb-act-row">
            {child.kind === "diagnostic" ? (
              <>
                <span className="bb-act-dot fail" />
                <span className="bb-act-label">{t("act.subagentFailed")}</span>
                <span className="bb-act-detail">{child.reason}</span>
              </>
            ) : (
              <>
                <span className={"bb-act-dot " + (child.activity === "running" ? "run" : "done")} />
                <span className="bb-act-label">{child.label ?? child.id}</span>
                <span className="bb-act-detail">{child.activity === "running" ? t("act.running") : ""}</span>
              </>
            )}
          </div>
        ))}
      </section>

      {jobs.length === 0 && subagents.length === 0 && !pending && (
        <div className="bb-act-empty">{t("act.nothing")}</div>
      )}
    </div>
  );
}
