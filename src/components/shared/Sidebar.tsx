import { useState } from "react";
import { useApp } from "../../lib/store";
import { useFlowActions } from "../../lib/actions";
import { IconPlus, IconSearch, IconHexagon, IconClock, IconUser, IconRestore } from "../icons";

export default function Sidebar() {
  const { state } = useApp();
  const actions = useFlowActions();
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <aside className="relative flex w-16 shrink-0 flex-col items-center gap-1 border-r border-black/20 bg-sidebar py-4">
      <span className="mb-4 grid h-8 w-8 place-items-center rounded-full bg-sidebar-2 text-sidebar-ink">
        <span className="h-2.5 w-2.5 rounded-full bg-current" />
      </span>

      <RailButton
        label="New process"
        onClick={() => {
          if (!state.model || confirm("Start a new process? Your saved data stays until you reload.")) {
            actions.newProcess();
          }
        }}
      >
        <IconPlus className="h-4 w-4" />
      </RailButton>

      <RailButton label="Search" disabled>
        <IconSearch className="h-4 w-4" />
      </RailButton>

      <div className="relative">
        <RailButton label="Version history" onClick={() => setHistoryOpen((v) => !v)} disabled={state.history.length === 0}>
          <IconClock className="h-4 w-4" />
        </RailButton>
        {historyOpen && state.history.length > 0 && (
          <div className="absolute left-full top-0 z-40 ml-2 w-64 rounded-xl border border-border bg-surface p-1.5 text-ink shadow-lg animate-pop">
            <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Version History</p>
            <div className="max-h-72 space-y-0.5 overflow-y-auto scrollbar-none">
              {state.history
                .map((h, i) => ({ ...h, i }))
                .slice()
                .reverse()
                .map(({ label, i }) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm ${i === state.historyIndex ? "bg-brand-soft" : "hover:bg-surface-2"}`}
                  >
                    <button onClick={() => actions.previewVersion(i)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${i === state.historyIndex ? "bg-brand text-white" : "bg-surface-2 text-ink-soft"}`}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                    </button>
                    {i !== state.historyIndex && (
                      <button onClick={() => actions.restoreVersion(i)} title="Restore" className="shrink-0 rounded p-1 text-ink-faint hover:bg-surface-2 hover:text-brand-deep">
                        <IconRestore className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <RailButton label="Templates" disabled>
        <IconHexagon className="h-4 w-4" />
      </RailButton>

      <div className="flex-1" />

      <button className="grid h-8 w-8 place-items-center rounded-full bg-sidebar-2 text-xs font-semibold text-sidebar-ink hover:bg-sidebar-ink/20" title="Account">
        <IconUser className="h-4 w-4" />
      </button>
    </aside>
  );
}

function RailButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-lg text-sidebar-ink transition hover:bg-sidebar-2 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
