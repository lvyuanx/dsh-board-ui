/** Palette — Ctrl+K session launcher, registered into 'shell.overlay'.
 * Opens via the global shortcut or the custom 'bb:palette-open' window event
 * (dispatched by the top-bar search trigger). */
import { useEffect, useMemo, useRef, useState } from "react";

export function Palette({ useSessions, useWorkspaces, t, openSession }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) previousFocus.current = document.activeElement;
          return !o;
        });
        setQuery("");
        setSel(0);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpenEvent = () => {
      previousFocus.current = document.activeElement;
      setOpen(true);
      setQuery("");
      setSel(0);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("bb:palette-open", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("bb:palette-open", onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open || previousFocus.current === null) return;
    previousFocus.current.focus?.();
    previousFocus.current = null;
  }, [open]);

  const snap = useSessions((s) => s);
  const archivedSessionIds = useWorkspaces((s) => s.archivedSessionIds);
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const archived = new Set(archivedSessionIds);
    const list = snap.ids
      .map((id) => snap.byId[id])
      .filter((s) => s !== undefined && !s.blank && !archived.has(s.id));
    const filtered = q
      ? list.filter((s) => s.displayTitle.toLowerCase().includes(q))
      : list;
    return filtered.slice(0, 8).map((s) => ({
      id: s.id,
      label: s.displayTitle,
      sub: s.running ? t("pal.running") : s.completed ? t("pal.done") : t("pal.idle")
    }));
  }, [query, snap, archivedSessionIds, t]);

  if (!open) return null;

  const pick = (id) => {
    setOpen(false);
    openSession(id);
  };

  return (
    <div className="bb-palette-backdrop" onMouseDown={() => setOpen(false)}>
      <div
        ref={dialogRef}
        className="bb-palette"
        role="dialog"
        aria-modal="true"
        aria-label={t("search.placeholder")}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key !== "Tab") return;
          const focusable = [...dialogRef.current.querySelectorAll("input, button:not([disabled])")];
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }}
      >
        <input
          autoFocus
          className="bb-palette-input"
          placeholder={t("pal.placeholder")}
          aria-label={t("pal.placeholder")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (items.length > 0) setSel((s) => Math.min(s + 1, items.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              if (items.length > 0) setSel((s) => Math.max(s - 1, 0));
            }
            if (e.key === "Enter") {
              const item = items[sel];
              if (item !== undefined) pick(item.id);
            }
          }}
        />
        <div className="bb-palette-list">
          {items.length === 0 && <div className="bb-palette-empty">{t("pal.empty")}</div>}
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={"bb-palette-item" + (i === sel ? " is-selected" : "")}
              onMouseEnter={() => setSel(i)}
              onClick={() => pick(item.id)}
            >
              <span className="bb-palette-label">{item.label}</span>
              <span className="bb-palette-sub">{item.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
