/** BoardFrame — the kanban shell. Registered into 'root' at priority -1,
 * shadowing (replacing) the stock three-column AppFrame. Declares the same
 * child slot names the stock occupant plugins target (sidebar / conversation /
 * details / shell.overlay) plus the board seat.
 *
 * The right drawer FLOATS over the board (never squeezes the middle column)
 * and its left edge is a drag handle for free width adjustment. The details
 * column lives INSIDE the drawer as a secondary pane.
 *
 * Props: the standard kit (useStore / useSessions / renderSlot / t) plus the
 * inject face (cycleTheme). Pure component — no cordis imports. */
import { useEffect, useMemo, useRef, useState } from "react";

import { workspaceViewsOf, workspaceColorOf } from "../board/columns";

const NAV_DEFAULT = 280;
const DRAWER_MIN = 420;
const DRAWER_MAX = 1100;

/** Topbar workspace switcher (tower.im-style project dropdown). */
function WorkspaceSwitcher({ filter, onFilterChange, views, t }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onDown = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  const current = filter === null ? null : views.find((v) => v.workspaceId === filter);
  return (
    <div className="bb-switcher">
      <button
        type="button"
        className="bb-switcher-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span
          className="bb-ws-dot"
          style={{ background: current ? workspaceColorOf(views, current.workspaceId) : "var(--bb-text-3)" }}
        />
        <span className="bb-switcher-label">{current ? current.title : t("filter.all")}</span>
        <span className="bb-switcher-caret" aria-hidden>▾</span>
      </button>
      {open && (
        <div className="bb-switcher-menu" role="menu" onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            role="menuitem"
            className={"bb-switcher-item" + (filter === null ? " is-selected" : "")}
            onClick={() => { onFilterChange(null); setOpen(false); }}
          >
            <span className="bb-ws-dot" style={{ background: "var(--bb-text-3)" }} />
            {t("filter.all")}
          </button>
          {views.map((v) => (
            <button
              key={v.workspaceId}
              type="button"
              role="menuitem"
              className={"bb-switcher-item" + (filter === v.workspaceId ? " is-selected" : "")}
              onClick={() => { onFilterChange(v.workspaceId); setOpen(false); }}
            >
              <span className="bb-ws-dot" style={{ background: workspaceColorOf(views, v.workspaceId) }} />
              {v.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Left-edge drag handle: pointer capture, clamps via the store action. */
function DrawerHandle({ width, onResize }) {
  const [dragging, setDragging] = useState(false);
  const base = useRef(0);
  const startX = useRef(0);
  const onPointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    base.current = width;
    startX.current = e.clientX;
    setDragging(true);
  };
  const onPointerMove = (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    onResize(Math.min(Math.max(base.current + (startX.current - e.clientX), DRAWER_MIN), DRAWER_MAX));
  };
  const onPointerUp = (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };
  return (
    <div
      className="bb-drawer-handle"
      data-dragging={dragging || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}

export function BoardFrame({ useStore, useSessions, useWorkspaces, actions, renderSlot, t, cycleTheme, injectBuildTag, openSession }) {
  const panels = useStore((s) => s);
  const current = useSessions((s) => s.current);
  const currentBlank = useSessions((s) => {
    const c = s.current;
    return c !== undefined ? s.byId[c]?.blank !== false : false;
  });
  // Children are real sessions with parentId. Keep the parent as the tab root
  // while a child is active, so selecting a subagent never loses the tab strip.
  const conversationTabs = useSessions((s) => {
    if (s.current === undefined) return { rootId: undefined, entries: [] };
    const rootId = s.byId[s.current]?.parentId ?? s.current;
    const catalog = s.subagentsByParent?.[rootId]?.entries ?? [];
    const childIds = new Set(catalog.filter((entry) => entry.kind === "child").map((entry) => entry.id));
    for (const [id, session] of Object.entries(s.byId)) {
      if (session?.parentId === rootId) childIds.add(id);
    }
    const entries = [...childIds]
      .map((id) => {
        const catalogEntry = catalog.find((entry) => entry.kind === "child" && entry.id === id);
        const session = s.byId[id];
        if (session?.blank) return null;
        return { id, label: session?.displayTitle ?? catalogEntry?.label ?? id, running: catalogEntry?.activity === "running" || session?.running === true };
      })
      .filter((entry) => entry !== null)
      .sort((a, b) => a.label.localeCompare(b.label));
    return { rootId, entries };
  });

  // Narrow viewport: the nav shrinks to the stock 56px rail (collapsed mode).
  const [narrow, setNarrow] = useState(() => window.innerWidth < 1100);
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 1100);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const navCollapsed = panels.sidebar === 0;
  const navW = narrow ? 56 : navCollapsed ? 0 : panels.sidebar || NAV_DEFAULT;
  const wsList = useWorkspaces((s) => s);
  const views = useMemo(() => workspaceViewsOf(wsList), [wsList]);
  const drawerOpen = current !== undefined && panels.drawerOpen;
  const drawerW = panels.drawerWidth || 640;
  const detailsW = panels.details > 0 ? panels.details : 0;
  // The drawer keeps its width while closed (slides off-screen via CSS),
  // so the conversation stays mounted and streaming.
  const drawerContentW = current !== undefined ? drawerW + detailsW : 0;

  // Drawer stays collapsed on load; a session change after mount opens it
  // (board card clicks open explicitly via their inject face).
  const initialCurrent = useRef(current);
  useEffect(() => {
    if (current !== initialCurrent.current) {
      initialCurrent.current = current;
      actions.setDrawerOpen(true);
    }
  }, [current, actions]);

  const drawerTab = panels.drawerTab ?? "chat";
  const liveJobs = useSessions((s) => {
    const c = s.current;
    if (c === undefined) return 0;
    return (s.jobsBySession?.[c] ?? []).filter((j) => j.status === "running" || j.status === "stopping").length;
  });
  const hasPending = useSessions((s) => {
    const c = s.current;
    // pendingInteraction is a kind string ("approval" | "plan-review" |
    // "question") — any defined value means the session is blocked on the user.
    return c !== undefined ? s.byId[c]?.pendingInteraction !== undefined : false;
  });
  const actBadge = liveJobs + (hasPending ? 1 : 0);

  const themeLabel =
    panels.themePref === "light" ? t("theme.light")
      : panels.themePref === "dark" ? t("theme.dark")
        : t("theme.system");

  const buildTag = injectBuildTag ?? "dev";

  return (
    <div className="bb-frame" data-drawer-open={drawerOpen || undefined}>
      <header className="bb-topbar">
        <div className="bb-brand">
          <span className="bb-brand-dot" />
          board_ui
          <span className="bb-build-tag">{buildTag}</span>
        </div>
        <WorkspaceSwitcher
          filter={panels.workspaceFilter}
          onFilterChange={(id) => actions.setWorkspaceFilter(id)}
          views={views}
          t={t}
        />
        <button
          type="button"
          className="bb-search"
          onClick={() => window.dispatchEvent(new CustomEvent("bb:palette-open"))}
        >
          <span aria-hidden>⌕</span>
          <span>{t("search.placeholder")}</span>
          <kbd>Ctrl K</kbd>
        </button>
        <div className="bb-topbar-right">
          <button type="button" className="bb-theme-btn" onClick={cycleTheme} title={t("theme.cycle")}>
            {themeLabel}
          </button>
        </div>
      </header>

      <div
        className="bb-main"
        style={{ gridTemplateColumns: navW + "px minmax(0, 1fr)" }}
      >
        <nav className="bb-nav">
          {renderSlot("sidebar", { collapsed: narrow || navCollapsed, width: navW || NAV_DEFAULT })}
        </nav>
        <main className="bb-board">
          {renderSlot("board", {
            filter: panels.workspaceFilter,
            onFilterChange: (id) => actions.setWorkspaceFilter(id)
          })}
        </main>

        {/* floating drawer (overlay, drag-resizable) */}
        <aside className="bb-drawer" style={{ width: drawerContentW }}>
          {drawerContentW > 0 && (
            <DrawerHandle width={drawerW} onResize={(px) => actions.setDrawerWidth(px)} />
          )}
          <div className="bb-drawer-inner">
            <div className="bb-drawer-tabs">
              <button
                type="button"
                className={"bb-drawer-tab" + (drawerTab === "chat" ? " is-active" : "")}
                onClick={() => actions.setDrawerTab("chat")}
              >
                {t("drawer.chat")}
              </button>
              <button
                type="button"
                className={"bb-drawer-tab" + (drawerTab === "activity" ? " is-active" : "")}
                onClick={() => actions.setDrawerTab("activity")}
              >
                {t("drawer.activity")}
                {actBadge > 0 && <span className="bb-drawer-tab-badge">{actBadge}</span>}
              </button>
              <button
                type="button"
                className="bb-drawer-close"
                title={t("drawer.close")}
                aria-label={t("drawer.close")}
                onClick={() => actions.setDrawerOpen(false)}
              >
                ✕
              </button>
            </div>
            {conversationTabs.rootId !== undefined && conversationTabs.entries.length > 0 && (
              <div className="bb-conversation-tabs" role="tablist" aria-label={t("drawer.conversationTabs")}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={current === conversationTabs.rootId}
                  className={"bb-conversation-tab" + (current === conversationTabs.rootId ? " is-active" : "")}
                  onClick={() => { actions.setDrawerTab("chat"); openSession?.(conversationTabs.rootId); }}
                >
                  <span className="bb-conversation-tab-kind">{t("drawer.mainSession")}</span>
                  <span className="bb-conversation-tab-label">{t("drawer.chat")}</span>
                </button>
                {conversationTabs.entries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    role="tab"
                    aria-selected={current === entry.id}
                    className={"bb-conversation-tab" + (current === entry.id ? " is-active" : "")}
                    title={entry.label}
                    onClick={() => { actions.setDrawerTab("chat"); openSession?.(entry.id); }}
                  >
                    <span className="bb-conversation-tab-kind">{t("drawer.subagent")}</span>
                    {entry.running && <span className="bb-conversation-tab-live" aria-label={t("act.running")} />}
                    <span className="bb-conversation-tab-label">{entry.label}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="bb-drawer-pane" data-hidden={drawerTab !== "chat" || undefined}>
              {renderSlot("conversation", {})}
            </div>
            <div className="bb-drawer-pane" data-hidden={drawerTab !== "activity" || undefined}>
              {renderSlot("activity", {})}
            </div>
          </div>
          <aside className="bb-details" style={{ width: detailsW }}>
            {renderSlot("details", {})}
          </aside>
        </aside>

        <div className="bb-overlay-host">{renderSlot("shell.overlay", {})}</div>
      </div>
    </div>
  );
}
