/** Board — the kanban seat registered into the 'board' slot.
 *
 * Six lifecycle columns: 待执行 (planning sessions — plans never run until
 * the user starts them) → 进行中 / 需要处理 / 验收中 / 失败 / 已完成, derived
 * from the runtime projection in columns.ts. Failed agent diagnostics are kept
 * separate from successful completion; 暂停 remains a card-level state.
 *
 * Other interactions: workspace filter, right-click menu, inline rename,
 * drag-to-reorder within a column, blank-click drawer collapse, j/k keyboard
 * navigation. Each card shows ONE primary action plus a ⋯ menu. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  COLUMNS, buildColumns, agentStatsOf, childrenMapOf, relativeTime,
  workspaceViewsOf, workspaceIdOfSession, workspaceColorOf, filterSessionsByWorkspace
} from "./columns";

const MENU_NONE = { kind: null, id: null, x: 0, y: 0, trigger: null };
const TASK_DRAG = "text/board-task";
/** Stable empty-array fallback: persisted v2 store values may lack the
 * pausedIds field, but a `?? []` inside a selector would mint a fresh array
 * every render and trip the Object.is snapshot equality (render loop). */
const EMPTY_IDS = [];
/** The 待执行 column is rendered specially (plan cards + create button);
 * the six execution columns come from COLUMNS. */
const STATUS_COLUMNS = COLUMNS.filter((c) => c.key !== "pending");

/** Status badge vocabulary — light background + dark text, one color per
 * lifecycle state: blue 待执行, green ● 进行中, orange ⚠ 需要处理, blue ◐
 * 验收中, red ✕ 失败, gray ⏸ 已暂停, green ✓ 已完成. */
const STATUS_LABEL_KEY = {
  pending: "card.statusPending",
  running: "card.statusRunning",
  paused: "card.statusPaused",
  action_required: "card.statusActionRequired",
  reviewing: "card.statusReviewing",
  failed: "card.statusFailed",
  completed: "card.statusDone"
};
const STATUS_GLYPH = { running: "●", paused: "⏸", action_required: "⚠", reviewing: "◐", failed: "✕", completed: "✓" };

function StatusBadge({ status, t }) {
  const glyph = STATUS_GLYPH[status];
  return (
    <span className="bb-status-badge" data-kind={status}>
      {glyph !== undefined && <span className="bb-status-glyph" aria-hidden>{glyph}</span>}
      {t(STATUS_LABEL_KEY[status] ?? "card.statusPending")}
    </span>
  );
}

/** Sub-agent execution summary — the card's core: running (green ●) / done
 * (neutral ✓) / waiting (gray ○) / failed (red ✕) counts plus aggregate
 * progress. Agents are never rendered as users — marks only, no avatars. */
function AgentStatsRow({ running, done, waiting, failed, total, showBar, t }) {
  return (
    <div className="bb-card-agents">
      <span className="bb-card-agents-label">{t("card.subagents")}</span>
      <span className="bb-agent-stat" data-kind={running > 0 ? "running" : "running-zero"}>
        <span className="bb-agent-mark" aria-hidden>{running > 0 ? "●" : "○"}</span>
        <span className="bb-agent-num">{running}</span>
        <span className="bb-agent-word">{t("card.agentsRunning")}</span>
      </span>
      <span className="bb-agent-stat" data-kind="done">
        <span className="bb-agent-mark" aria-hidden>✓</span>
        <span className="bb-agent-num">{done}</span>
        <span className="bb-agent-word">{t("card.agentsDone")}</span>
      </span>
      {waiting > 0 && (
        <span className="bb-agent-stat" data-kind="waiting">
          <span className="bb-agent-mark" aria-hidden>○</span>
          <span className="bb-agent-num">{waiting}</span>
          <span className="bb-agent-word">{t("card.agentsWaiting")}</span>
        </span>
      )}
      {failed > 0 && (
        <span className="bb-agent-stat" data-kind="failed">
          <span className="bb-agent-mark" aria-hidden>✕</span>
          <span className="bb-agent-num">{failed}</span>
          <span className="bb-agent-word">{t("card.agentsFailed")}</span>
        </span>
      )}
      {total > 0 && (
        <div className="bb-card-progress">
          <span className="bb-card-progress-text">{t("card.progress", { done, total })}</span>
          {showBar && (
            <span
              className="bb-card-progress-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={done}
            >
              <span style={{ width: Math.round((done / total) * 100) + "%" }} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Status hint line: why the card sits where it sits — the concrete pending
 * reason (需要处理), the acceptance note (验收中), the failure alert with
 * 重试/查看错误 (any status), or the acceptance meta (已完成). */
function HintLine({ status, session, acceptedAt, failed, mainError, t, onRetry, onViewError }) {
  const lines = [];
  const mainIssueText = mainError === null ? ""
    : mainError.kind === "max-tokens" ? t("card.maxTokensHint")
      : mainError.kind === "interrupted" ? t("card.interruptedHint")
        : mainError.kind === "blocked" ? t("card.blockedHint")
          : mainError.kind === "aborted" ? t("card.abortedHint")
            : t("card.mainErrorHint", { message: mainError.message });
  if (status === "action_required") {
    const reason = session.pendingInteraction === "approval"
      ? t("card.reasonApproval")
      : session.pendingInteraction === "plan-review"
        ? t("card.reasonPlanReview")
        : t("card.reasonQuestion");
    lines.push(
      <div key="reason" className="bb-card-hint" data-kind="action">{reason}</div>
    );
  } else if (status === "reviewing") {
    lines.push(
      <div key="reviewing" className="bb-card-hint" data-kind="reviewing">{t("card.reviewingHint")}</div>
    );
  }
  if (failed > 0 || mainError !== null) {
    lines.push(
      <div key="failed" className="bb-card-hint" data-kind="failed">
        <span aria-hidden>⚠</span>
        <span className="bb-card-hint-msg">{failed > 0 ? t("card.failedHint", { n: failed }) : mainIssueText}</span>
        <span className="bb-card-hint-actions">
          <button
            type="button"
            className="bb-card-hint-btn"
            onClick={(e) => { e.stopPropagation(); onRetry(); }}
          >
            {t("task.restart")}
          </button>
          <button
            type="button"
            className="bb-card-hint-btn"
            onClick={(e) => { e.stopPropagation(); onViewError(); }}
          >
            {t("task.viewError")}
          </button>
        </span>
      </div>
    );
  }
  if (status === "completed" && failed === 0 && mainError === null && (acceptedAt ?? session.updatedAt)) {
    lines.push(
      <div key="accepted" className="bb-card-hint" data-kind="done">
        {t("card.acceptedMeta", { time: relativeTime(acceptedAt ?? session.updatedAt, t) })}
      </div>
    );
  }
  return <>{lines}</>;
}

/** Task card (plans + sessions share one anatomy): head → title → status
 * badge → hint → agent stats → progress → one primary action + ⋯ menu. */
function TaskCard({ item, wsColor, wsTitle, animIndex, current, focused, editing, draft, primaryLabel, busy, t, onOpen, onPrimary, onMenu, onStartRename, onDraft, onCommitRename, onDragStart, onRetry, onViewError }) {
  const { session, status, acceptedAt, agentRunning, agentDone, agentWaiting, agentFailed, agentTotal, mainError } = item;
  if (editing) {
    return (
      <div className="bb-card bb-card-editing">
        <input
          autoFocus
          className="bb-rename-input"
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); onCommitRename(); }
            if (e.key === "Escape") onCommitRename(true);
          }}
          onBlur={() => onCommitRename(true)}
        />
      </div>
    );
  }
  return (
    <div
      className={"bb-card" + (current ? " is-current" : "") + (focused ? " is-focused" : "")}
      style={{ "--i": animIndex, "--bb-workspace": wsColor }}
      data-status={status}
      data-session={session.id}
      tabIndex={0}
      role="group"
      aria-label={t("card.projectTask", { project: wsTitle, title: session.displayTitle })}
      draggable={!busy}
      aria-busy={busy || undefined}
      onDragStart={(e) => { onDragStart(e, session.id); }}
      onClick={onOpen}
      onDoubleClick={() => onStartRename()}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) { e.preventDefault(); onOpen(); }
      }}
      onContextMenu={(e) => { e.preventDefault(); onMenu(e); }}
    >
      <div className="bb-card-head">
        <span className="bb-ws-badge" title={wsTitle}>
          <span className="bb-ws-dot" aria-hidden />
          <span className="bb-ws-label">{t("card.project")}</span>
          <span className="bb-ws-title">{wsTitle}</span>
        </span>
        <span className="bb-card-time">{relativeTime(session.updatedAt, t)}</span>
      </div>
      <div className="bb-card-title">{session.displayTitle}</div>
      <div className="bb-card-status">
        <StatusBadge status={status} t={t} />
      </div>
      <HintLine
        status={status}
        session={session}
        acceptedAt={acceptedAt}
        failed={agentFailed}
        mainError={mainError ?? null}
        t={t}
        onRetry={onRetry}
        onViewError={onViewError}
      />
      <AgentStatsRow
        running={agentRunning}
        done={agentDone}
        waiting={agentWaiting}
        failed={agentFailed}
        total={agentTotal}
        showBar={status === "running"}
        t={t}
      />
      <div className="bb-card-foot" draggable={false}>
        <button type="button" className="bb-card-primary" disabled={busy} onClick={(e) => { e.stopPropagation(); onPrimary(); }}>
          {primaryLabel}
        </button>
        <button
          type="button"
          className="bb-card-more"
          title={t("menu.more")}
          aria-label={t("menu.more")}
          aria-haspopup="menu"
          disabled={busy}
          onClick={(e) => { e.stopPropagation(); onMenu(e); }}
        >
          ⋯
        </button>
      </div>
    </div>
  );
}

const EMPTY_ERRORS = {};

export function Board({ useStore, useSessions, useWorkspaces, actions, t, filter, onFilterChange, openSession, openActivity, collapseDrawer, renameSession, forkSession, archiveSession, reorderSession, startTaskPlanning, executePlan, pauseSession, resumeSession, acceptSession, reVerifySession, reRunSession, retrySession, shouldLeavePool, mainErrorOf }) {
  const focus = useStore((s) => s.focus);
  const planningIds = useStore((s) => s.planningIds) ?? EMPTY_IDS;
  const pausedIds = useStore((s) => s.pausedIds) ?? EMPTY_IDS;
  const reviewPendingIds = useStore((s) => s.reviewPendingIds) ?? EMPTY_IDS;
  const acceptedIds = useStore((s) => s.acceptedIds) ?? EMPTY_IDS;
  const acceptedAtById = useStore((s) => s.acceptedAtById) ?? EMPTY_ERRORS;
  const mainErrors = useStore((s) => s.mainErrors) ?? EMPTY_ERRORS;
  const snap = useSessions((s) => s);
  const wsList = useWorkspaces((s) => s);
  const views = useMemo(() => workspaceViewsOf(wsList), [wsList]);
  const archivedSessionIds = wsList.archivedSessionIds ?? EMPTY_IDS;

  const ids = useMemo(
    () => filterSessionsByWorkspace(snap.ids, snap.byId, views, filter, archivedSessionIds),
    [snap.ids, snap.byId, views, filter, archivedSessionIds]
  );
  const buckets = useMemo(
    () => buildColumns(ids, snap.byId, snap.jobsBySession, planningIds, snap.subagentsByParent, pausedIds, mainErrors, reviewPendingIds, acceptedIds, acceptedAtById),
    [ids, snap.byId, snap.jobsBySession, planningIds, snap.subagentsByParent, pausedIds, mainErrors, reviewPendingIds, acceptedIds, acceptedAtById]
  );

  // planning sessions (待执行 cards), newest activity first, grouped by
  // workspace and honoring the board filter
  const plans = useMemo(() => {
    const archived = new Set(archivedSessionIds);
    return planningIds
      .map((id) => snap.byId[id])
      .filter((s) => s !== undefined && !s.blank && !archived.has(s.id))
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }, [planningIds, snap.byId, archivedSessionIds]);
  const shownPlans = useMemo(() => {
    if (filter === null) return plans;
    return plans.filter((s) => workspaceIdOfSession(views, s.id) === filter);
  }, [plans, views, filter]);
  const wsTitleOf = (wsId) => {
    if (wsId === "") return t("pool.ungrouped");
    return views.find((v) => v.workspaceId === wsId)?.title ?? t("pool.ungrouped");
  };

  // Per-plan sub-agent totals (plans never enter the status columns, so
  // buildColumns skips them — fold the same real stats here).
  const planStats = useMemo(() => {
    const childrenOf = childrenMapOf(snap.ids, snap.byId);
    const map = new Map();
    for (const id of planningIds) {
      map.set(id, agentStatsOf(id, snap.byId, childrenOf, snap.subagentsByParent));
    }
    return map;
  }, [snap.ids, snap.byId, planningIds, snap.subagentsByParent]);

  // Column header sub-line: task counts ride the badge, agent counts are a
  // separate figure — never conflate the two.
  const colSubText = (key, items) => {
    if (key === "pending") return t("col.pending.sub");
    if (key === "running") return t("col.running.sub", { n: items.reduce((sum, it) => sum + it.agentRunning, 0) });
    if (key === "action_required") return t("col.action_required.sub");
    if (key === "reviewing") return t("col.reviewing.sub");
    if (key === "failed") return t("col.failed.sub");
    return t("col.completed.sub");
  };

  // Capture the host's one-shot completed hint before it disappears when the
  // task is opened. This makes viewing a result non-destructive: the card stays
  // in 验收中 until the user explicitly accepts it.
  useEffect(() => {
    const childrenOf = childrenMapOf(snap.ids, snap.byId);
    for (const id of ids) {
      const session = snap.byId[id];
      if (session?.completed !== true || session.parentId !== undefined) continue;
      const stats = agentStatsOf(id, snap.byId, childrenOf, snap.subagentsByParent);
      if (stats.agentTotal > 0) actions.markReviewPending(id);
    }
  }, [ids, snap, actions]);

  // stale pause marks: a pause mark is set optimistically while the cancel
  // RPC is in flight (the projection still says running). Only clear it once
  // the session was OBSERVED stopped while marked and is now running again
  // (user resumed from the chat) or blocked on the user (需要处理 takes over).
  const pausedStopped = useRef(new Map()); // id -> observed stopped while marked
  useEffect(() => {
    for (const id of pausedIds) {
      const s = snap.byId[id];
      if (s === undefined) continue;
      if (s.pendingInteraction) { pausedStopped.current.delete(id); actions.unmarkPaused(id); continue; }
      if (s.running) {
        if (pausedStopped.current.get(id) === true) {
          pausedStopped.current.delete(id);
          actions.unmarkPaused(id);
        }
        continue;
      }
      pausedStopped.current.set(id, true);
    }
    for (const id of [...pausedStopped.current.keys()]) {
      if (!pausedIds.includes(id)) pausedStopped.current.delete(id);
    }
  }, [pausedIds, snap]);

  // Main-session turn failures: the host list projection never reports a
  // main-session error, so for every OPENED session we read the last closed
  // turn's end reason off the conversation (mainErrorOf) and mirror it into
  // the board store. Reading only happens while a conversation window exists
  // (opened sessions); never-opened sessions keep whatever was last recorded
  // (persisted), and sessions whose last closed turn ended cleanly clear the
  // record (the card then falls back to its projection-based status).
  useEffect(() => {
    if (mainErrorOf === undefined) return;
    const seen = new Set();
    for (const id of Object.keys(mainErrors)) {
      const err = mainErrorOf(id);
      if (err === undefined) continue; // conversation not loaded — keep the record
      seen.add(id);
      if (err === null) actions.clearMainError(id);
      else actions.setMainError(id, err);
    }
    for (const id of ids) {
      if (seen.has(id)) continue;
      const err = mainErrorOf(id);
      if (err === undefined) continue;
      if (err === null) actions.clearMainError(id);
      else actions.setMainError(id, err);
    }
  }, [ids, mainErrors, mainErrorOf, actions]);

  // 待执行 → status-column transitions, driven by the STORE planningIds so
  // persisted plans are covered, re-evaluated on every sessions change:
  //  - shouldLeavePool: approval/plan-review waits + conversation signals
  //    (user start command / non-read-only tool calls — the runtime
  //    conversation nodes, see planStartedInConversation);
  //  - OR the plan already spawned subagents — the durable list-projection
  //    signal that the plan is REALLY executing (works even after a reload,
  //    when conversation windows are empty until a session is opened).
  useEffect(() => {
    if (planningIds.length === 0) return;
    const childrenOf = childrenMapOf(snap.ids, snap.byId);
    for (const id of planningIds) {
      if (shouldLeavePool(id) || (childrenOf.get(id)?.length ?? 0) > 0) actions.unmarkPlanning(id);
    }
  }, [planningIds, snap]);

  const [menu, setMenu] = useState(MENU_NONE);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [busyIds, setBusyIds] = useState(() => new Set());
  const busyRef = useRef(new Set());
  const [operationError, setOperationError] = useState(null);
  const dragId = useRef(null);
  const taskDragId = useRef(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const menuRef = useRef(null);
  const boardRef = useRef(null);
  const keyboardNav = useRef(false);

  const closeMenu = (restoreFocus = false) => {
    setMenu((currentMenu) => {
      if (restoreFocus) currentMenu.trigger?.focus?.();
      return MENU_NONE;
    });
  };

  useEffect(() => {
    const onDown = () => closeMenu(false);
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeMenu(true);
        setEditing(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useLayoutEffect(() => {
    if (menu.kind === null || menuRef.current === null) return;
    const rect = menuRef.current.getBoundingClientRect();
    const x = Math.max(8, Math.min(menu.x, window.innerWidth - rect.width - 8));
    const y = Math.max(8, Math.min(menu.y, window.innerHeight - rect.height - 8));
    if (x !== menu.x || y !== menu.y) {
      setMenu((currentMenu) => ({ ...currentMenu, x, y }));
      return;
    }
    menuRef.current.querySelector("button")?.focus();
  }, [menu.kind, menu.x, menu.y]);

  useEffect(() => {
    if (!keyboardNav.current || focus === null) return;
    keyboardNav.current = false;
    const selector = '[data-session="' + CSS.escape(focus) + '"]';
    const card = boardRef.current?.querySelector(selector);
    card?.focus({ preventScroll: true });
    card?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [focus]);

  const runAction = async (id, label, run) => {
    if (busyRef.current.has(id)) return;
    busyRef.current.add(id);
    setBusyIds((current) => new Set(current).add(id));
    setOperationError(null);
    try {
      await run();
    } catch (error) {
      console.warn("board-ui: " + label + " failed:", error);
      setOperationError({ id, label, message: error instanceof Error ? error.message : String(error) });
    } finally {
      busyRef.current.delete(id);
      setBusyIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  const openMenu = (kind, id, event) => {
    setMenu({ kind, id, x: event.clientX, y: event.clientY, trigger: event.currentTarget });
  };

  const startRename = (item) => {
    setEditing(item.id);
    setDraft(item.session.title ?? item.session.displayTitle ?? "");
    closeMenu(false);
  };
  const commitRename = (cancel) => {
    const id = editing;
    setEditing(null);
    if (cancel || id === null || draft.trim() === "") return;
    void runAction(id, "rename", () => renameSession(id, draft.trim()));
  };

  const onDragStart = (e, id) => {
    dragId.current = id;
    taskDragId.current = null;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/board-session", id);
  };
  const onPlanDragStart = (e, id) => {
    taskDragId.current = id;
    dragId.current = null;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(TASK_DRAG, id);
  };

  const onColumnDrop = (colKey, e) => {
    e.preventDefault();
    setDragOverCol(null);
    const planId = taskDragId.current;
    if (planId !== null) {
      taskDragId.current = null;
      // dragging a plan onto 进行中 starts it (the lifecycle hop 待执行 → 进行中)
      if (colKey === "running") {
        void runAction(planId, "execute", () => executePlan(planId));
      }
      return;
    }
    const id = dragId.current;
    if (id === null) return;
    const cards = e.currentTarget.querySelectorAll(".bb-card");
    let beforeId;
    const y = e.clientY;
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      if (y < rect.top + rect.height / 2) { beforeId = card.dataset.session; break; }
    }
    const item = buckets[colKey].find((it) => it.id === id);
    if (item !== undefined && beforeId !== id) {
      const workspaceId = workspaceIdOfSession(views, id);
      if (workspaceId === "") {
        setOperationError({ id, label: "reorder", message: t("error.ungroupedReorder") });
      } else {
        void runAction(id, "reorder", () => reorderSession(workspaceId, id, beforeId));
      }
    }
  };

  const flat = STATUS_COLUMNS.flatMap((c) => buckets[c.key]);
  const navList = [...shownPlans.map((s) => ({ id: s.id, kind: "plan" })), ...flat.map((it) => ({ id: it.id, kind: "session" }))];
  const onKeyDown = (e) => {
    if (e.target instanceof Element && e.target.closest("input, textarea, select, button, a, [contenteditable='true']")) return;
    if (e.key !== "j" && e.key !== "k" && e.key !== "Enter") return;
    if (navList.length === 0) return;
    const idx = navList.findIndex((item) => item.id === focus);
    let next = idx;
    if (e.key === "j") next = idx === -1 ? 0 : Math.min(idx + 1, navList.length - 1);
    if (e.key === "k") next = idx === -1 ? 0 : Math.max(idx - 1, 0);
    if (next !== idx) {
      e.preventDefault();
      keyboardNav.current = true;
      actions.setFocus(navList[next].id);
    } else if (e.key === "Enter" && idx !== -1) {
      openSession(navList[idx].id);
    }
  };

  const menuItem = (label, onClick, danger) => (
    <button
      key={label}
      type="button"
      role="menuitem"
      className={"bb-menu-item" + (danger ? " is-danger" : "")}
      onClick={onClick}
    >
      {label}
    </button>
  );

  // Blank-area click clears keyboard selection and collapses the drawer.
  const onBlankClick = (e) => {
    const target = e.target;
    if (target instanceof Element && target.closest(".bb-card, .bb-menu, .bb-filter, button, input, select, textarea, a")) return;
    actions.setFocus(null);
    collapseDrawer();
  };

  const openFrom = (id) => {
    // The runtime clears its completed hint as soon as the task is opened.
    // Latch review first so viewing the result cannot imply acceptance.
    if (buckets.reviewing.some((item) => item.id === id)) actions.markReviewPending(id);
    actions.setFocus(id);
    openSession(id, planningIds.includes(id));
  };

  // One primary action per status (section 十六); the rest live in ⋯.
  const primaryOf = (item) => {
    const id = item.id;
    if (item.status === "running") return { label: t("task.pause"), run: () => void runAction(id, "pause", () => pauseSession(id)) };
    if (item.status === "paused") return { label: t("task.resume"), run: () => void runAction(id, "resume", () => resumeSession(id)) };
    if (item.status === "action_required") return { label: t("task.handle"), run: () => openFrom(id) };
    if (item.status === "reviewing") return { label: t("task.accept"), run: () => acceptSession(id) };
    if (item.status === "failed") return { label: t("task.restart"), run: () => void runAction(id, "retry", () => retrySession(id)) };
    return { label: t("task.viewResult"), run: () => openFrom(id) };
  };

  const sessionMenu = (item) => {
    const id = item.id;
    const items = [];
    if (item.status === "running" || item.status === "paused") {
      items.push(
        { label: t("menu.open"), run: () => { closeMenu(false); openSession(id); } },
        { label: t("task.viewDetails"), run: () => { closeMenu(false); openActivity(id); } }
      );
    } else if (item.status === "action_required") {
      items.push({ label: t("task.viewReason"), run: () => { closeMenu(false); openActivity(id); } });
    } else if (item.status === "reviewing") {
      items.push(
        { label: t("task.viewReview"), run: () => { closeMenu(false); openFrom(id); } },
        { label: t("task.reviewAgain"), run: () => { closeMenu(false); void runAction(id, "re-review", () => reVerifySession(id)); } }
      );
    } else if (item.status === "failed") {
      items.push(
        { label: t("task.restart"), run: () => { closeMenu(false); void runAction(id, "retry", () => retrySession(id)); } },
        { label: t("task.viewError"), run: () => { closeMenu(false); openActivity(id); } }
      );
    } else {
      items.push({ label: t("task.reRun"), run: () => { closeMenu(false); void runAction(id, "re-run", () => reRunSession(id)); } });
    }
    items.push(
      { label: t("menu.rename"), run: () => { const it = flat.find((x) => x.id === id); closeMenu(false); if (it) startRename(it); } },
      { label: t("menu.fork"), run: () => { closeMenu(false); void runAction(id, "fork", () => forkSession(id)); } },
      { label: t("menu.archive"), run: () => { closeMenu(false); void runAction(id, "archive", () => archiveSession(id)); }, danger: true }
    );
    return items;
  };

  return (
    <div ref={boardRef} className="bb-board-root" onKeyDown={onKeyDown} onClick={onBlankClick}>
      <div className="bb-board-head">
        <span className="bb-board-title">{t("board.title")}</span>
        <span className="bb-board-sub">{t("board.sub")}</span>
        <select
          className="bb-filter"
          value={filter ?? ""}
          onChange={(e) => onFilterChange(e.target.value === "" ? null : e.target.value)}
          aria-label={t("filter.label")}
        >
          <option value="">{t("filter.all")}</option>
          {views.map((v) => (
            <option key={v.workspaceId} value={v.workspaceId}>{v.title}</option>
          ))}
        </select>
      </div>

      {operationError !== null && (
        <div className="bb-operation-error" role="alert">
          <span>{t("error.action", { action: operationError.label, message: operationError.message })}</span>
          <button type="button" aria-label={t("error.dismiss")} onClick={() => setOperationError(null)}>×</button>
        </div>
      )}

      <div className="bb-cols">
        {/* 待执行 — plans only, nothing executes until started */}
        <section className="bb-col bb-col-pending" data-col="pending">
          <div className="bb-col-head">
            <span className="bb-col-dot" style={{ background: "var(--bb-brand)" }} />
            <div className="bb-col-main">
              <div className="bb-col-title-row">
                <span className="bb-col-title">{t("col.pending")}</span>
                <span className="bb-col-count">{shownPlans.length}</span>
              </div>
              <span className="bb-col-sub">{t("col.pending.sub")}</span>
            </div>
            <button type="button" className="bb-pool-add" title={t("pool.add")} aria-label={t("pool.add")} disabled={busyIds.has("__new__")} onClick={() => void runAction("__new__", "start planning", startTaskPlanning)}>+</button>
          </div>
          <div className="bb-col-cards">
            {shownPlans.length === 0 && <div className="bb-col-empty">{t("pool.empty")}</div>}
            {shownPlans.map((session, i) => {
              const stats = planStats.get(session.id) ?? { agentRunning: 0, agentDone: 0, agentWaiting: 0, agentFailed: 0, agentTotal: 0 };
              const item = { id: session.id, session, status: "pending", ...stats };
              return (
                <TaskCard
                  key={session.id}
                  item={item}
                  animIndex={Math.min(i, 12)}
                  current={session.id === snap.current}
                  focused={session.id === focus}
                  editing={editing === session.id}
                  draft={draft}
                  primaryLabel={t("task.execute")}
                  busy={busyIds.has(session.id)}
                  t={t}
                  wsColor={workspaceColorOf(views, workspaceIdOfSession(views, session.id))}
                  wsTitle={wsTitleOf(workspaceIdOfSession(views, session.id))}
                  onOpen={() => openFrom(session.id)}
                  onPrimary={() => void runAction(session.id, "execute", () => executePlan(session.id))}
                  onMenu={(e) => openMenu("plan", session.id, e)}
                  onStartRename={() => startRename(item)}
                  onDraft={setDraft}
                  onCommitRename={commitRename}
                  onDragStart={onPlanDragStart}
                  onRetry={() => void runAction(session.id, "retry", () => retrySession(session.id))}
                  onViewError={() => openActivity(session.id)}
                />
              );
            })}
          </div>
        </section>

        {STATUS_COLUMNS.map((col) => {
          const items = buckets[col.key];
          return (
            <section
              key={col.key}
              className={"bb-col" + (dragOverCol === col.key ? " is-dragover" : "")}
              data-col={col.key}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key); }}
              onDragLeave={() => setDragOverCol((c) => (c === col.key ? null : c))}
              onDrop={(e) => onColumnDrop(col.key, e)}
            >
              <div className="bb-col-head">
                <span className="bb-col-dot" style={{ background: col.dot }} />
                <div className="bb-col-main">
                  <div className="bb-col-title-row">
                    <span className="bb-col-title">{t("col." + col.key)}</span>
                    <span className="bb-col-count">{items.length}</span>
                  </div>
                  <span className="bb-col-sub">{colSubText(col.key, items)}</span>
                </div>
              </div>
              <div className="bb-col-cards">
                {items.length === 0 && <div className="bb-col-empty">—</div>}
                {items.map((item, i) => {
                  const primary = primaryOf(item);
                  return (
                    <TaskCard
                      key={item.id}
                      item={item}
                      animIndex={Math.min(i, 12)}
                      current={item.id === snap.current}
                      focused={item.id === focus}
                      editing={editing === item.id}
                      draft={draft}
                      primaryLabel={primary.label}
                      busy={busyIds.has(item.id)}
                      t={t}
                      wsColor={workspaceColorOf(views, workspaceIdOfSession(views, item.id))}
                      wsTitle={wsTitleOf(workspaceIdOfSession(views, item.id))}
                      onOpen={() => openFrom(item.id)}
                      onPrimary={primary.run}
                      onMenu={(e) => openMenu("session", item.id, e)}
                      onStartRename={() => startRename(item)}
                      onDraft={setDraft}
                      onCommitRename={commitRename}
                      onDragStart={onDragStart}
                      onRetry={() => void runAction(item.id, "retry", () => retrySession(item.id))}
                      onViewError={() => openActivity(item.id)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {menu.kind !== null && (
        <div ref={menuRef} className="bb-menu" role="menu" style={{ left: menu.x, top: menu.y }} onMouseDown={(e) => e.stopPropagation()}>
          {menu.kind === "plan" ? (
            <div>
              {menuItem(t("pool.open"), () => { closeMenu(false); openSession(menu.id, true); })}
              {menuItem(t("pool.unplan"), () => { closeMenu(false); actions.unmarkPlanning(menu.id); }, true)}
            </div>
          ) : (
            <div>
              {sessionMenu(flat.find((it) => it.id === menu.id) ?? { id: menu.id, status: "completed" }).map((m) => menuItem(m.label, m.run, m.danger))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
