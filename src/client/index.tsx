/** @deepseek-ai/dsh-board-ui — browser entry.
 *
 * Takes over the 'root' slot (priority -1 shadows the stock frame), declares
 * the slot tree the stock occupant plugins expect (sidebar / conversation /
 * details / shell.overlay) plus the kanban 'board' seat, and replaces the
 * disabled ui-layout's three contributions:
 *   1. the 'layout' panel service (LayoutController),
 *   2. the theme presenter (body data-ds-dark-theme + token projection),
 *   3. the root frame itself (BoardFrame).
 *
 * Ordering is deterministic: every stock plugin that registers into the
 * declared slots (ui-sidebar, ui-conversation, ...) injects the 'layout'
 * service, which only this apply provides — so their registrations always
 * run after the declarations below. */
import { defineStore } from "@deepseek-ai/dsh-client-runtime/client";

import tokensCss from "./theme/tokens.css";
import frameCss from "./frame/frame.css";
import boardCss from "./board/board.css";
import boardPhase2Css from "./board/board-phase2.css";
import poolCss from "./board/pool.css";
import paletteCss from "./palette/palette.css";
import activityCss from "./activity/activity.css";

import { BoardFrame } from "./frame/BoardFrame";
import { Board } from "./board/Board";
import { Palette } from "./palette/Palette";
import { ActivityPanel } from "./activity/Activity";
import { planStartedInConversation } from "./board/columns";
import { zh, en } from "./locale";

/** Re-exported for unit tests (pure column logic). */
export { buildColumns, columnOf, cardStatusOf, taskStatusOf, planStartedInConversation, workspaceViewsOf, workspaceIdOfSession, workspaceColorOf } from "./board/columns";

/** Build stamp shown in the top bar (confirms which bundle is running). */
export const BUILD_TAG = typeof __BOARD_UI_BUILD__ === "string" ? __BOARD_UI_BUILD__ : "dev";

/** Cordis services consumed by this plugin (gates apply until provided). */
export const inject = ["slots", "theme", "locale", "sessions", "workspaces"];

const clampWidth = (px, min, max) => Math.min(max, Math.max(min, px));

/** Frame panel store: nav width, details column, current theme preference. */
function createFrameStore() {
  return defineStore({
    init: () => ({
      sidebar: 280,
      details: 0,
      narrow: false,
      themePref: "system",
      drawerTab: "chat",
      drawerOpen: false,
      drawerWidth: 640,
      workspaceFilter: null
    }),
    actions: {
      setSidebar: (d, px) => {
        d.sidebar = clampWidth(px, 240, 420);
      },
      setDetails: (d, px) => {
        d.details = clampWidth(px, 300, 560);
      },
      toggleSidebar: (d) => {
        d.sidebar = d.sidebar === 0 ? 280 : 0;
      },
      openDetails: (d) => {
        if (d.details === 0) d.details = 360;
      },
      closeDetails: (d) => {
        d.details = 0;
      },
      syncTheme: (d, pref) => {
        d.themePref = pref;
      },
      setDrawerTab: (d, tab) => {
        d.drawerTab = tab;
      },
      setDrawerOpen: (d, open) => {
        d.drawerOpen = open;
      },
      setDrawerWidth: (d, px) => {
        d.drawerWidth = clampWidth(px, 420, 1100);
      },
      setWorkspaceFilter: (d, workspaceId) => {
        d.workspaceFilter = workspaceId;
      }
    }
  });
}

/** Board store: keyboard focus, workspace filter, planning-session ids, and
 * paused-session ids.
 *
 * A planning session (created from the 待执行 +) is a PLAN: it never shows in
 * the status columns — only when the user starts executing it does it leave
 * the planning set and appear in 进行中. A paused session keeps a client-side
 * ⏸ mark (see pauseSession: a real session.cancel() stops the turn while
 * queued work stays parked); the mark keeps its card in the 进行中 column with
 * the 已暂停 badge and is dropped when the projection shows the session
 * running again or blocked on the user. Both sets persist across reloads.
 *
 * NOTE: persistence rehydrates the stored value WHOLESALE over init — old v2
 * values lack `pausedIds`, so every read guards with `?? []` (the key stays
 * v2 on purpose: bumping it would orphan persisted planningIds and leak every
 * plan into the status columns on upgrade). */
function createBoardStore() {
  return defineStore({
    init: () => ({ focus: null, filter: null, planningIds: [], pausedIds: [] }),
    // v2: the v1 shape ({tasks}) is incompatible — a fresh key drops it.
    persist: "dsh.board.board.v2",
    actions: {
      setFocus: (d, id) => {
        d.focus = id;
      },
      setFilter: (d, workspaceId) => {
        d.filter = workspaceId;
      },
      markPlanning: (d, id) => {
        if (!(d.planningIds ?? []).includes(id)) d.planningIds = [...(d.planningIds ?? []), id];
      },
      unmarkPlanning: (d, id) => {
        d.planningIds = (d.planningIds ?? []).filter((x) => x !== id);
      },
      markPaused: (d, id) => {
        if (!(d.pausedIds ?? []).includes(id)) d.pausedIds = [...(d.pausedIds ?? []), id];
      },
      unmarkPaused: (d, id) => {
        d.pausedIds = (d.pausedIds ?? []).filter((x) => x !== id);
      }
    }
  });
}

/** Cross-plugin panel-action face (ctx.layout) — same surface as ui-layout's. */
class LayoutController {
  #panels;
  attachPanels(actions) {
    this.#panels = actions;
  }
  toggleSidebar() {
    this.#require().toggleSidebar();
  }
  openDetails() {
    this.#require().openDetails();
  }
  closeDetails() {
    this.#require().closeDetails();
  }
  #require() {
    if (this.#panels === void 0) throw new Error("board-ui: layout panel actions not wired (root entry not mounted)");
    return this.#panels;
  }
}

/** Body attribute selecting the dark base palette in the token stylesheets. */
const DARK_ATTRIBUTE = "data-ds-dark-theme";

/** Applies theme snapshots to the document (ui-layout's ThemePresenter role). */
class ThemePresenter {
  appliedTokens = [];
  themeColorMeta;
  constructor() {
    this.themeColorMeta = document.createElement("meta");
    this.themeColorMeta.name = "theme-color";
  }
  apply(snapshot) {
    const scheme = snapshot.active.colorScheme;
    document.documentElement.style.colorScheme = scheme;
    const body = document.body;
    if (scheme === "dark") body.setAttribute(DARK_ATTRIBUTE, "");
    else body.removeAttribute(DARK_ATTRIBUTE);
    for (const name of this.appliedTokens) body.style.removeProperty(name);
    this.appliedTokens = [];
    for (const [name, value] of Object.entries(snapshot.active.tokens)) {
      body.style.setProperty(name, value);
      this.appliedTokens.push(name);
    }
    this.themeColorMeta.content = getComputedStyle(body).backgroundColor;
    if (!this.themeColorMeta.isConnected) document.head.append(this.themeColorMeta);
  }
  dispose() {
    document.documentElement.style.removeProperty("color-scheme");
    const body = document.body;
    body.removeAttribute(DARK_ATTRIBUTE);
    for (const name of this.appliedTokens) body.style.removeProperty(name);
    this.appliedTokens = [];
    this.themeColorMeta.remove();
  }
}

const ALL_CSS = [tokensCss, frameCss, boardCss, boardPhase2Css, poolCss, paletteCss, activityCss].join("\n");

export function apply(ctx) {
  // 1. stylesheet
  ctx.effect(() => {
    const tag = document.createElement("style");
    tag.dataset.plugin = "@deepseek-ai/dsh-board-ui";
    tag.textContent = ALL_CSS;
    document.head.appendChild(tag);
    return () => tag.remove();
  }, "board-ui: css");

  // 2. locale dictionary
  ctx.effect(() => ctx.locale.register("board", { zh, en }), "board-ui: dictionaries");

  // 3. theme presenter (replaces ui-layout's)
  const presenter = new ThemePresenter();
  ctx.effect(() => {
    presenter.apply(ctx.theme.getTheme());
    const off = ctx.on("theme/change", (snapshot) => presenter.apply(snapshot));
    return () => {
      off();
      presenter.dispose();
    };
  }, "board-ui: theme presenter");

  // 4. panel service + root frame (register first, provide second — a
  //    synchronous waiter resume can then never observe the un-declared state)
  const layout = new LayoutController();
  let frameActions;
  ctx.effect(() => {
    const disposeRegistration = ctx.slots.register({
      name: "root",
      priority: -1,
      locale: "board",
      children: {
        sidebar: { kind: "single", scope: "root" },
        board: { kind: "single", scope: "root" },
        conversation: { kind: "single", scope: "session-maybe" },
        activity: { kind: "single", scope: "session" },
        details: { kind: "single", scope: "session" },
        "shell.overlay": { kind: "list", scope: "root" }
      },
      store: createFrameStore,
      inject: (actions) => {
        layout.attachPanels(actions);
        frameActions = actions;
        actions.syncTheme(ctx.theme.getTheme().preference);
        return {
          injectBuildTag: BUILD_TAG,
          cycleTheme: () => {
            const pref = ctx.theme.getTheme().preference;
            const next = pref === "light" ? "dark" : pref === "dark" ? "system" : "light";
            ctx.theme.setTheme(next);
          }
        };
      }
    }, BoardFrame);
    const disposeService = ctx.reflect.provide("layout", layout);
    return () => {
      disposeService();
      disposeRegistration();
    };
  }, "board-ui: layout service + root frame");

  // keep the frame store's theme label in sync
  ctx.effect(() => ctx.on("theme/change", (snapshot) => {
    frameActions?.syncTheme(snapshot.preference);
  }), "board-ui: theme label sync");

  // 5. kanban seat
  const EXECUTE_PROMPT = "计划已确认。请开始执行我们刚才制定的计划。";
  // TODO(acceptance): canned instruction prompts until the host exposes a
  // real review/acceptance RPC (a master-agent verify step). These send REAL
  // prompts to the REAL session agent — they never fabricate UI state.
  const RE_VERIFY_PROMPT = "请对刚才完成的执行结果进行最终验收：逐项检查各子 Agent 的产出是否满足任务要求。如发现问题请重新执行并修复；验收通过后请总结结论。";
  const RE_RUN_PROMPT = "请重新执行这个任务，完成后进行最终验收并总结结果。";
  const RETRY_PROMPT = "有子 Agent 执行失败。请重试失败的部分，继续完成任务，并完成最终验收。";
  // A planning session starts executing when the user says so IN the chat
  // (START_RE / READ_ONLY_TOOLS live next to the pure conversation check in
  // columns.ts).
  const resolveTaskWorkspace = (explicitWorkspaceId) => {
    const wsSnap = ctx.workspaces.list.getSnapshot();
    const sessSnap = ctx.sessions.list.getSnapshot();
    const currentWs = sessSnap.current === void 0 ? void 0
      : wsSnap.items.find((item) => item.sessionIds.includes(sessSnap.current))?.workspaceId;
    return explicitWorkspaceId ?? currentWs ?? wsSnap.recentWorkspaceId;
  };
  const createFreshSession = async (explicitWorkspaceId) => {
    const target = resolveTaskWorkspace(explicitWorkspaceId);
    if (target === void 0) {
      ctx.sessions.clear();
      throw new Error("no workspace available to start the task");
    }
    // sessions.create always mints a NEW session (connectWorkspace reuses an
    // existing blank one, which made the + silently skip opening a fresh chat).
    return ctx.sessions.create({ workspaceId: target });
  };
  const promptNewSession = async (sessionId, content) => {
    // The host prompt API takes an ordered content-part array, not a raw string.
    const payload = [{ type: "text", text: content }];
    const sendPlan = async () => {
      const session = ctx.sessions.binding(sessionId)?.session;
      if (session === undefined) return false;
      const result = await session.prompt(payload, "queue");
      if (!result.ok) throw new Error("session.prompt failed: " + (result.error?.code ?? "unknown") + ": " + (result.error?.message ?? ""));
      return true;
    };
    if (!(await sendPlan())) {
      // the fresh session needs a beat to reach the list projection
      for (let i = 0; i < 40; i += 1) {
        await new Promise((r) => setTimeout(r, 50));
        if (await sendPlan()) return;
      }
      throw new Error("session binding unavailable after start");
    }
  };
  // Resolve a listed session's binding (mints its scope lazily) with a brief
  // retry window, then run the behavior verb. Card actions that need the
  // session face (pause / resume / re-run) go through here.
  const withBinding = async (sessionId, run) => {
    for (let i = 0; i < 40; i += 1) {
      const binding = ctx.sessions.binding(sessionId);
      if (binding !== undefined) return run(binding.session);
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error("session binding unavailable");
  };
  const promptSession = async (sessionId, content) => {
    const result = await withBinding(sessionId, (session) => session.prompt([{ type: "text", text: content }], "queue"));
    if (!result.ok) throw new Error("session.prompt failed: " + (result.error?.code ?? "unknown") + ": " + (result.error?.message ?? ""));
  };
  ctx.slots.register({
    name: "board",
    locale: "board",
    store: createBoardStore,
    inject: (boardActions) => {
      const face = {
      openSession: (id) => {
        frameActions?.setDrawerOpen(true);
        ctx.sessions.open(id);
        // Plan review on open: a plan's conversation window loads
        // ASYNCHRONOUSLY once the session is staged, so the Board's effect
        // (keyed on the sessions list projection) may never see the start
        // signal — e.g. the user said 开始执行 or the agent already called a
        // non-read-only tool before this page loaded the history. Poll the
        // pure check briefly after open so such plans leave 待执行 promptly
        // instead of lingering as "finished tasks in the wrong column".
        const isPlan = (boardActions.getSnapshot().planningIds ?? []).includes(id);
        if (isPlan) {
          let tries = 0;
          const check = () => {
            if (tries++ >= 30) return;
            if (face.shouldLeavePool(id)) { boardActions.unmarkPlanning(id); return; }
            setTimeout(check, 100);
          };
          setTimeout(check, 200);
        }
      },
      collapseDrawer: () => {
        frameActions?.setDrawerOpen(false);
      },
      renameSession: async (id, title) => {
        const session = ctx.sessions.binding(id)?.session;
        if (session === undefined) throw new Error(`unknown session "${id}"`);
        const result = await session.rename(title);
        if (!result.ok) throw new Error(result.error?.message ?? "rename failed");
      },
      forkSession: (id) => {
        ctx.sessions.fork({ sessionId: id, increaseTitle: true }).then((childId) => {
          ctx.sessions.open(childId);
        }).catch(() => {});
      },
      archiveSession: async (id) => {
        await ctx.workspaces.archiveSession(id);
      },
      reorderSession: async (workspaceId, sessionId, beforeSessionId) => {
        await ctx.workspaces.insertSessionBefore(workspaceId, sessionId, beforeSessionId);
      },
      startTaskPlanning: async () => {
        const sessionId = await createFreshSession(null);
        boardActions.markPlanning(sessionId);
        ctx.sessions.open(sessionId);
        frameActions?.setDrawerOpen(true);
      },
      executePlan: async (sessionId) => {
        boardActions.unmarkPlanning(sessionId);
        await promptNewSession(sessionId, EXECUTE_PROMPT);
      },
      // ⏸ 暂停 — a real session.cancel() (the running turn stops, queued work
      // stays parked in FIFO) plus a client-side mark that keeps the card in
      // 进行中 with the 已暂停 badge. Resume re-prompts the session.
      pauseSession: async (sessionId) => {
        boardActions.markPaused(sessionId);
        try {
          const result = await withBinding(sessionId, (session) => session.cancel());
          if (!result.ok) throw new Error(result.error?.message ?? "cancel failed");
        } catch (err) {
          boardActions.unmarkPaused(sessionId);
          throw err;
        }
      },
      resumeSession: async (sessionId) => {
        boardActions.unmarkPaused(sessionId);
        await promptSession(sessionId, "请继续执行。");
      },
      reVerifySession: (sessionId) => promptSession(sessionId, RE_VERIFY_PROMPT),
      reRunSession: (sessionId) => promptSession(sessionId, RE_RUN_PROMPT),
      retrySession: (sessionId) => promptSession(sessionId, RETRY_PROMPT),
      openActivity: (sessionId) => {
        frameActions?.setDrawerOpen(true);
        frameActions?.setDrawerTab("activity");
        ctx.sessions.open(sessionId);
      },
      // Pure check (runs inside the Board effect over the STORE's planningIds,
      // which includes persisted plans — an apply-level Set missed those).
      shouldLeavePool: (id) => {
        const summary = ctx.sessions.list.getSnapshot().byId[id];
        // a live approval (or plan review) wait means the user's attention is
        // required NOW — the plan has effectively started and belongs in
        // 需要处理, not parked in 待执行
        if (summary?.pendingInteraction === "approval" || summary?.pendingInteraction === "plan-review") return true;
        const session = ctx.sessions.binding(id)?.session;
        if (session === undefined) return false;
        const nodes = session.conversation?.snapshot("chat")?.legacy?.nodes ?? [];
        return planStartedInConversation(nodes);
      },
      };
      return face;
    }
  }, Board);

  // 6. command palette (floats over everything)
  ctx.slots.register({
    name: "shell.overlay",
    id: "board-palette",
    order: 1000,
    locale: "board",
    inject: () => ({
      openSession: (id) => {
        frameActions?.setDrawerOpen(true);
        ctx.sessions.open(id);
      }
    })
  }, Palette);

  // 7. drawer activity tab
  ctx.slots.register({
    name: "activity",
    locale: "board",
    inject: () => ({
      switchToChat: () => {
        frameActions?.setDrawerTab("chat");
      }
    })
  }, ActivityPanel);
}
