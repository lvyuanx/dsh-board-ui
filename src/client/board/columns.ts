/** Status column derivation for the task board — pure functions over the
 * sessions list projection (runtime's byId shape: id / displayTitle / running /
 * completed / pendingInteraction / blank / updatedAt / parentId / origin) plus
 * the subagent catalog (subagentsByParent) for authoritative per-card agent
 * execution totals.
 *
 * Task lifecycle (six columns — 待执行 / 进行中 / 需要处理 / 验收中 / 失败 / 已完成):
 *
 *   待执行 ──开始执行──▶ 进行中 ──全部 Agent 完成──▶ 验收中 ──验收通过──▶ 已完成
 *                        │  ▲                        │
 *                需要人工 │  │ 处理完成               │ 验收失败
 *                        ▼  │                        ▼
 *                    需要处理 ──────────────────▶ 失败 ──重试──▶ 进行中
 *
 * 需要处理 is a BRANCH state, not a mandatory hop; 暂停 remains a card-level
 * operation state shown in the 进行中 column.
 *
 * State mapping on the runtime projection (no backend changes — the host has
 * no acceptance/review state today, so 验收中 is a front-end mapping, see
 * taskStatusOf): the runtime itself treats a pending user interaction
 * (approval / plan-review / question) as PRIMARY, outranking live running
 * (dsh-client-ui-workspace renders the amber warning before the running
 * indicator), so a session blocked on the user belongs in 需要处理 even while
 * its turn is technically open.
 *
 * Workspace mapping rides the workspaces list projection (workspace views
 * carry a sessionIds array — runtime's workspace.list shape). */

export type TaskStatus =
  | "pending"          // 待执行 — created, not started
  | "running"          // 进行中 — turn open, agent(s) executing
  | "paused"           // ⏸ 已暂停 — client-side pause mark; stays in the running column
  | "action_required"  // 需要处理 — user interaction blocking the agent
  | "reviewing"        // 验收中 — execution finished, final acceptance pending
  | "failed"           // 失败 — a stopped task has one or more failed agents
  | "completed";       // 已完成 — accepted

/** Column keys — every status except the card-level "paused" pseudo-state. */
export type ColumnKey = Exclude<TaskStatus, "paused">;

export const COLUMNS: { key: ColumnKey; dot: string }[] = [
  { key: "pending", dot: "var(--bb-brand)" },
  { key: "running", dot: "var(--bb-col-running)" },
  { key: "action_required", dot: "var(--bb-col-pending)" },
  { key: "reviewing", dot: "var(--bb-brand)" },
  { key: "failed", dot: "var(--bb-col-failed)" },
  { key: "completed", dot: "var(--bb-col-done)" }
];

/** Full task lifecycle status for one session; null hides it (blank drafts).
 *
 * Priority: 需要处理 (live user-blocking interaction — the runtime's own
 * presentation gives it precedence over running) → 进行中 (turn open) →
 * paused (client pause mark; the card stays in the 进行中 column) → 失败
 * (stopped task with failed agents) → 验收中 → 已完成.
 *
 * The host's `completed` flag is only a transient “unseen finished” hint
 * and is cleared when a session is opened. Therefore the board persists two
 * explicit client-side decisions: `awaitingReview` keeps an agent task in
 * 验收中 after its result is viewed, and `accepted` moves it to 已完成 only
 * after the user chooses 通过验收. Replace these with a real acceptance RPC
 * when the backend grows one. */
export function taskStatusOf(session, paused = false, failed = false, awaitingReview = false, accepted = false) {
  if (session.blank) return null;
  if (session.pendingInteraction) return "action_required";
  if (session.running) return "running";
  if (paused) return "paused";
  if (failed) return "failed";
  if (awaitingReview || session.completed === true) return accepted ? "completed" : "reviewing";
  return "completed";
}

/** Column a session card belongs to; null hides it (blank drafts). */
export function columnOf(session, paused = false, failed = false, awaitingReview = false, accepted = false) {
  const status = taskStatusOf(session, paused, failed, awaitingReview, accepted);
  return status === null ? null : status === "paused" ? "running" : status;
}

/** Card badge status for a rendered card (blank sessions never render). */
export function cardStatusOf(session, paused = false, failed = false, awaitingReview = false, accepted = false) {
  return taskStatusOf(session, paused, failed, awaitingReview, accepted) ?? "completed";
}

/** Direct-children index: parentId -> child session ids (one pass). */
export function childrenMapOf(ids, byId) {
  const childrenOf = new Map();
  for (const id of ids) {
    const parentId = byId[id]?.parentId;
    if (parentId === undefined) continue;
    const list = childrenOf.get(parentId) ?? [];
    list.push(id);
    childrenOf.set(parentId, list);
  }
  return childrenOf;
}

/** Per-card sub-agent execution totals — never fabricated, always real data.
 *
 * Two honest sources, merged:
 *  - the sessions list: every session whose parentId is the card id (always
 *    available) supplies running vs done vs waiting via the child's live
 *    running bit and the runtime's `completed` flag;
 *  - the subagent catalog (subagentsByParent), once its pull settled
 *    (state === "ready"): the authoritative direct-child catalog. Its
 *    activity bit overrides the list bit, its diagnostic rows (corrupt /
 *    unsupported / unavailable) count as failed (✕), and children it knows
 *    that already left the list are still counted.
 * Without a settled catalog the counts fold from the list alone and failed
 * stays 0.
 *
 * TODO(agent-state): the runtime reports no durable queued/failed outcome for
 * children (the subagent catalog exposes only running/inactive — see
 * dsh-client-ui-subagent's own "the catalog has no durable outcome" note).
 * A child counts as waiting (○) only while its parent session is executing
 * and the runtime has NOT flagged its completion — the honest reading of the
 * flags; replace with the real per-child queue state once the host reports
 * one. */
export function agentStatsOf(parentId, byId, childrenOf, subagentsByParent) {
  const childIds = childrenOf.get(parentId) ?? [];
  const catalog = subagentsByParent?.[parentId];
  const ready = catalog != null && catalog.state === "ready" && Array.isArray(catalog.entries);
  const failedIds = new Set();
  const activityOf = new Map();
  if (ready) {
    for (const entry of catalog.entries) {
      if (entry.kind === "diagnostic") failedIds.add(entry.id);
      else activityOf.set(entry.id, entry.activity === "running");
    }
  }
  // A child can only be genuinely queued while its parent is executing.
  const parentLive = byId[parentId]?.running === true;
  let running = 0;
  let done = 0;
  let waiting = 0;
  let failed = 0;
  for (const kid of childIds) {
    const child = byId[kid];
    if (child === undefined || child.blank) continue;
    if (failedIds.has(kid)) { failed += 1; continue; }
    const live = activityOf.get(kid);
    if (live !== undefined ? live : child.running) { running += 1; continue; }
    if (parentLive && child.completed !== true) waiting += 1;
    else done += 1;
  }
  if (ready) {
    for (const entry of catalog.entries) {
      if (childIds.includes(entry.id)) continue;
      if (entry.kind === "diagnostic") failed += 1;
      else if (entry.activity === "running") running += 1;
      else done += 1; // catalog-only child past its list lifetime — done
    }
  }
  return {
    agentRunning: running,
    agentDone: done,
    agentWaiting: waiting,
    agentFailed: failed,
    agentTotal: running + done + waiting + failed
  };
}

/** Split the list projection into column item lists, newest activity first.
 * Only MAIN tasks become cards (subagent sessions carry parentId and are
 * aggregated into per-card agent counts instead); planning sessions (plans)
 * are excluded — they live in the 待执行 column until executed. Paused ids
 * (board store) keep their cards in the 进行中 column with the ⏸ badge.
 * mainErrors (board store) — a session whose MAIN turn ended in an LLM/API
 * error (e.g. server_is_overloaded) even though its sub-agents all succeeded:
 * the host list projection exposes no main-session failure, so the board
 * records the last turn/end error reason read from the opened conversation
 * and treats it as a task failure too (agentFailed OR mainError → 失败). */
export function buildColumns(ids, byId, jobsBySession, planningIds, subagentsByParent, pausedIds, mainErrors, reviewPendingIds, acceptedIds, acceptedAtById) {
  const planning = new Set(planningIds ?? []);
  const paused = new Set(pausedIds ?? []);
  const reviewPending = new Set(reviewPendingIds ?? []);
  const accepted = new Set(acceptedIds ?? []);
  const buckets = { pending: [], running: [], action_required: [], reviewing: [], failed: [], completed: [] };
  const childrenOf = childrenMapOf(ids, byId);
  for (const id of ids) {
    const session = byId[id];
    if (session === undefined) continue;
    if (session.parentId !== undefined) continue; // subagent session — not a card
    if (planning.has(id)) continue; // plan — stays in the 待执行 column
    const stats = agentStatsOf(id, byId, childrenOf, subagentsByParent);
    const mainError = mainErrors?.[id] ?? null;
    let status = taskStatusOf(session, paused.has(id), stats.agentFailed > 0 || mainError !== null, reviewPending.has(id), accepted.has(id));
    if (status === null) continue;
    // 验收中 requires actual agent work — a plain Q&A session has no
    // acceptance step and goes straight to 已完成 (see taskStatusOf TODO).
    if (status === "reviewing" && stats.agentTotal === 0) status = "completed";
    const key = status === "paused" ? "running" : status;
    const jobs = Array.isArray(jobsBySession?.[id]) ? jobsBySession[id].length : 0;
    buckets[key].push({ id, session, jobs, status, mainError, acceptedAt: acceptedAtById?.[id], ...stats });
  }
  for (const list of Object.values(buckets)) {
    list.sort((a, b) => (b.session.updatedAt ?? 0) - (a.session.updatedAt ?? 0));
  }
  return buckets;
}

/** Host workspace views (workspaceId / title / path / sessionIds) from the
 * workspaces list store. The list items ARE the raw host views (the official
 * workspace browser reads item.sessionIds directly — no getSnapshot wrapper). */
export function workspaceViewsOf(list) {
  const views = [];
  for (const item of list?.items ?? []) {
    if (item !== null && typeof item === "object" && item.workspaceId !== undefined) {
      views.push(item);
    }
  }
  return views;
}

/** Stable per-workspace accent colors (tower.im-style project labels). */
export const WORKSPACE_COLORS = [
  "#4176e6",
  "#1da565",
  "#e08800",
  "#d64545",
  "#8b5cf6",
  "#0e9aa7",
  "#e35db0",
  "#6b7280"
];

/** Workspace accent color, stable across workspace reordering. */
export function workspaceColorOf(views, workspaceId) {
  if (!views.some((v) => v.workspaceId === workspaceId)) return "var(--bb-text-3)";
  let hash = 2166136261;
  for (const ch of String(workspaceId)) {
    hash ^= ch.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return WORKSPACE_COLORS[(hash >>> 0) % WORKSPACE_COLORS.length];
}

/** Workspace owning a session; "" means ungrouped (no workspace claims it). */
export function workspaceIdOfSession(views, sessionId) {
  for (const view of views) {
    if (Array.isArray(view.sessionIds) && view.sessionIds.includes(sessionId))
      return view.workspaceId;
  }
  return "";
}

/** Apply archive visibility and the workspace filter to a flat session id list. */
export function filterSessionsByWorkspace(ids, byId, views, filter, archivedSessionIds = []) {
  const archived = new Set(archivedSessionIds);
  if (filter == null) return ids.filter((id) => !archived.has(id));
  const allowed = new Set(views.find((v) => v.workspaceId === filter)?.sessionIds ?? []);
  return ids.filter((id) => !archived.has(id) && allowed.has(id));
}

/** Compact relative time for a card footer. */
export function relativeTime(updatedAt, t) {
  if (!updatedAt) return "";
  const diff = Date.now() - updatedAt;
  const min = Math.floor(diff / 60000);
  if (min < 1) return t("card.now");
  if (min < 60) return min + " " + t("card.min");
  const hour = Math.floor(min / 60);
  if (hour < 24) return hour + " " + t("card.hour");
  const day = Math.floor(hour / 24);
  if (day < 30) return day + " " + t("card.day");
  const d = new Date(updatedAt);
  return (d.getMonth() + 1) + "/" + d.getDate();
}

/** A planning session starts executing when the user says so IN the chat. */
export const START_RE = /^(开始执行|开始任务|执行计划|执行吧|开始吧|请开始|start|execute)/i;
/** Read-only inspection tools a planning conversation may legitimately use;
 * any OTHER tool call means the session is actually executing work (非plan) —
 * it leaves the 待执行 column and flows into the normal status columns. */
export const READ_ONLY_TOOLS = new Set([
  "read", "read_image", "view_image", "grep", "glob", "web_search", "fetch", "skill",
  "list_agents", "get_goal", "job_list", "job_output"
]);

/** Remove quoted strings and comments before scanning wrapper source. This is
 * deliberately a lexer, not a JS parser; template interpolation stays opaque
 * and therefore takes the conservative execution path. */
function executableCodeOnly(source) {
  let output = "";
  let mode = "code";
  let opaque = false;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    if (mode === "code") {
      if (ch === "/" && next === "/") { mode = "line-comment"; output += "  "; i += 1; continue; }
      if (ch === "/" && next === "*") { mode = "block-comment"; output += "  "; i += 1; continue; }
      if (ch === "'") { mode = "single"; output += " "; continue; }
      if (ch === '"') { mode = "double"; output += " "; continue; }
      if (ch.charCodeAt(0) === 96) { mode = "template"; output += " "; continue; }
      output += ch;
      continue;
    }
    if (mode === "line-comment") {
      if (ch === "\n") { mode = "code"; output += "\n"; } else output += " ";
      continue;
    }
    if (mode === "block-comment") {
      if (ch === "*" && next === "/") { mode = "code"; output += "  "; i += 1; }
      else output += ch === "\n" ? "\n" : " ";
      continue;
    }
    if (ch === "\\") { output += "  "; i += 1; continue; }
    if (mode === "template" && ch === "$" && next === "{") opaque = true;
    const closes = mode === "single" ? ch === "'" : mode === "double" ? ch === '"' : ch.charCodeAt(0) === 96;
    if (closes) mode = "code";
    output += ch === "\n" ? "\n" : " ";
  }
  return { source: output, opaque: opaque || mode !== "code" };
}

/** Whether one tool call proves execution has started. run_code is a wrapper in
 * current Harness builds, so inspect its explicit nested tool calls instead of
 * treating every read-only wrapper as a write. Dynamic/opaque code stays
 * conservative and counts as execution. */
export function toolCallStartsExecution(block, readOnlyTools = READ_ONLY_TOOLS) {
  if (block?.kind !== "tool-call" || typeof block.name !== "string" || block.name === "") return false;
  if (readOnlyTools.has(block.name)) return false;
  if (block.name !== "run_code") return true;
  let code;
  try {
    const args = JSON.parse(block.argsRaw ?? "");
    code = typeof args?.code === "string" ? args.code : undefined;
  } catch {
    return true;
  }
  if (code === undefined) return true;
  const executable = executableCodeOnly(code);
  if (executable.opaque) return true;
  const nested = [];
  const callRe = /tools(?:\.([A-Za-z_$][\w$]*)|\[\s*["']([^"']+)["']\s*\])\s*\(/g;
  for (const match of executable.source.matchAll(callRe)) nested.push(match[1] ?? match[2]);
  return nested.length === 0 || nested.some((name) => !readOnlyTools.has(name));
}

/** Fold the last closed turn into the board's persisted main-session issue.
 * undefined means no closed turn is loaded; null means a clean completion. */
export function mainIssueOfTurns(turns) {
  if (turns === undefined || turns === null) return undefined;
  const closed = [...turns].filter((turn) => turn?.end !== undefined).sort((a, b) => (b.turn ?? 0) - (a.turn ?? 0));
  if (closed.length === 0) return undefined;
  const reason = closed[0].end?.data?.reason;
  if (reason?.kind === "completed") return null;
  if (reason?.kind === "error") {
    const failure = reason.error ?? {};
    return {
      kind: "error",
      message: typeof failure.message === "string" && failure.message !== "" ? failure.message : "turn failed",
      ...(failure.code !== undefined ? { code: failure.code } : {})
    };
  }
  if (reason?.kind === "max-tokens") return { kind: "max-tokens", code: "max-tokens", message: "output token limit reached" };
  if (reason?.kind === "interrupted") return { kind: "interrupted", code: "interrupted", message: "execution was interrupted" };
  if (reason?.kind === "blocked") return { kind: "blocked", code: "blocked", message: "execution is blocked" };
  if (reason?.kind === "aborted") {
    const cause = reason.reason?.kind ?? "unknown";
    return { kind: "aborted", code: "aborted:" + cause, message: cause === "user" ? "execution was stopped" : "execution was aborted" };
  }
  return { kind: "unknown", code: reason?.kind ?? "unknown", message: "execution ended unexpectedly" };
}

/** Did a planning conversation actually START executing? Two real signals,
 * read off the runtime conversation nodes (ConversationNode shapes):
 *  - the user's LAST text message matches a start command (开始执行 etc.);
 *  - any assistant step carried a non-read-only tool call (writing files,
 *    running commands, spawning subagents — real execution actions).
 * Node shapes are the runtime's own: user nodes carry a top-level
 * `content: ContentBlock[]` (`{type:"text",text}` blocks), assistant nodes a
 * top-level `blocks: AssistantBlock[]` (`{kind:"tool-call",name}` blocks). */
export function planStartedInConversation(nodes, readOnlyTools = READ_ONLY_TOOLS) {
  if (!Array.isArray(nodes)) return false;
  const userNodes = nodes.filter((n) => n.kind === "user");
  const last = userNodes[userNodes.length - 1];
  const text = Array.isArray(last?.content)
    ? last.content.filter((c) => c?.type === "text" && typeof c.text === "string").map((c) => c.text).join(" ").trim()
    : "";
  if (START_RE.test(text)) return true;
  for (const node of nodes) {
    if (node.kind !== "assistant" || !Array.isArray(node.blocks)) continue;
    if (node.blocks.some((block) => toolCallStartsExecution(block, readOnlyTools))) return true;
  }
  return false;
}
