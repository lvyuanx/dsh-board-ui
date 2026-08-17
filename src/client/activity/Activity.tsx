/** ActivityPanel — the drawer's second tab (session-scoped entry in the
 * 'activity' slot): pending-interaction banner, background jobs, subagents.
 * Reads root-scope list projections (jobsBySession / subagentsByParent) via
 * useSessions; switchToChat comes from the inject face. */

function durationOf(job, t) {
  if (!job.startedAt) return "";
  const end = job.status === "running" || job.status === "stopping" ? Date.now() : (job.finishedAt ?? job.startedAt);
  const sec = Math.max(0, Math.round((end - job.startedAt) / 1000));
  if (sec < 60) return sec + "s";
  const min = Math.floor(sec / 60);
  if (min < 60) return min + "m " + (sec % 60) + "s";
  return Math.floor(min / 60) + "h " + (min % 60) + "m";
}

export function ActivityPanel({ sessionId, useSessions, t, switchToChat }) {
  const snap = useSessions((s) => s);
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
