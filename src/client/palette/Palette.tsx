/** Palette — Ctrl+K session launcher, registered into 'shell.overlay'.
 * Opens via the global shortcut or the custom 'bb:palette-open' window event
 * (dispatched by the top-bar search trigger). */
import { useEffect, useMemo, useState } from "react";

export function Palette({ useSessions, t, openSession }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setSel(0);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpenEvent = () => {
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

  const snap = useSessions((s) => s);
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = snap.ids
      .map((id) => snap.byId[id])
      .filter((s) => s !== undefined && !s.blank);
    const filtered = q
      ? list.filter((s) => s.displayTitle.toLowerCase().includes(q))
      : list;
    return filtered.slice(0, 8).map((s) => ({
      id: s.id,
      label: s.displayTitle,
      sub: s.running ? t("pal.running") : s.completed ? t("pal.done") : t("pal.idle")
    }));
  }, [query, snap, t]);

  if (!open) return null;

  const pick = (id) => {
    setOpen(false);
    openSession(id);
  };

  return (
    <div className="bb-palette-backdrop" onMouseDown={() => setOpen(false)}>
      <div className="bb-palette" onMouseDown={(e) => e.stopPropagation()}>
        <input
          autoFocus
          className="bb-palette-input"
          placeholder={t("pal.placeholder")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((s) => Math.min(s + 1, items.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((s) => Math.max(s - 1, 0));
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
