import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ProcessNode } from "../types";
import { systemTagOf } from "../lib/layout";
import { useApp } from "../lib/store";
import { IconPaperclip, IconComment, IconUser, IconDatabase } from "./icons";

const TYPE_STYLES: Record<ProcessNode["type"], { bg: string; border: string; text: string; accent: string }> = {
  start: { bg: "bg-success-soft", border: "border-success/40", text: "text-success", accent: "bg-success" },
  end: { bg: "bg-ink/5", border: "border-ink-faint/40", text: "text-ink-soft", accent: "bg-ink-faint" },
  process: { bg: "bg-brand-soft", border: "border-brand/30", text: "text-ink", accent: "bg-brand" },
  decision: { bg: "bg-warn-soft", border: "border-warn/40", text: "text-warn", accent: "bg-warn" },
  io: { bg: "bg-surface-2", border: "border-ink-faint/40", text: "text-ink-soft", accent: "bg-ink-faint" },
};

const EXCEPTION_STYLE = { bg: "bg-exception-soft", border: "border-exception/50", text: "text-exception", accent: "bg-exception" };

export interface FlowNodeData extends Record<string, unknown> {
  node: ProcessNode;
  isException: boolean;
}

const hiddenHandle = { opacity: 0, width: 1, height: 1, pointerEvents: "none" as const, border: "none", background: "transparent" };

function Handles() {
  return (
    <>
      <Handle type="target" position={Position.Top} style={hiddenHandle} />
      <Handle type="source" position={Position.Bottom} style={hiddenHandle} />
    </>
  );
}

export default function FlowNode({ data, selected }: NodeProps & { data: FlowNodeData }) {
  const { dispatch } = useApp();
  const { node, isException } = data;
  const style = isException && node.type === "process" ? EXCEPTION_STYLE : TYPE_STYLES[node.type];
  const systemTag = systemTagOf(node);

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "SELECT_NODE", id: node.id });
  };

  if (node.type === "start" || node.type === "end") {
    return (
      <div
        onClick={onClick}
        className={`flex h-full w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full border-2 px-3 text-center shadow-sm transition ${style.bg} ${
          selected ? "border-brand ring-4 ring-brand/15" : style.border
        }`}
      >
        <Handles />
        <span className={`text-[13px] font-semibold ${style.text}`}>{node.label}</span>
        <span className="text-[10px] uppercase tracking-wide text-ink-faint">{node.type}</span>
      </div>
    );
  }

  if (node.type === "decision") {
    return (
      <div onClick={onClick} className="relative h-full w-full cursor-pointer" style={{ overflow: "visible" }}>
        <Handles />
        <div
          className={`h-full w-full border-2 shadow-sm transition ${style.bg} ${selected ? "border-brand ring-4 ring-brand/15" : style.border}`}
          style={{ clipPath: "polygon(50% 2%, 98% 50%, 50% 98%, 2% 50%)" }}
        />
        <div className="absolute inset-[22%] flex flex-col items-center justify-center gap-1 text-center">
          <span className="line-clamp-3 text-[11.5px] font-semibold leading-tight text-ink">{node.label}</span>
        </div>
        {(node.sources.length > 0 || node.comments.length > 0) && (
          <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1">
            {node.sources.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "SET_EVIDENCE_NODE", id: node.id });
                }}
                className="flex items-center gap-1 rounded-full border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink-soft shadow-sm hover:bg-surface-2"
              >
                <IconPaperclip className="h-2.5 w-2.5" /> {node.sources.length}
              </button>
            )}
            {node.comments.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "SET_COMMENTS_TARGET", target: { scope: "node", nodeId: node.id } });
                  dispatch({ type: "SET_RIGHT_PANEL_MODE", mode: "comments" });
                }}
                className="flex items-center gap-1 rounded-full border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink-soft shadow-sm hover:bg-surface-2"
              >
                <IconComment className="h-2.5 w-2.5" /> {node.comments.length}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const isIo = node.type === "io";

  return (
    <div
      onClick={onClick}
      className={`relative flex h-full w-full cursor-pointer flex-col justify-center gap-1 overflow-hidden border shadow-sm transition ${style.bg} ${
        selected ? "border-brand ring-4 ring-brand/15" : style.border
      } ${isIo ? "px-7 py-2" : "rounded-xl py-2 pl-4 pr-3"}`}
      style={isIo ? { clipPath: "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)" } : undefined}
    >
      <Handles />
      {!isIo && <span className={`absolute inset-y-0 left-0 w-1 ${style.accent}`} />}
      <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-ink">{node.label}</p>
      {(node.actor || systemTag) && (
        <div className="flex flex-wrap items-center gap-1">
          {node.actor && (
            <span className="flex items-center gap-1 truncate rounded-full bg-surface px-1.5 py-0.5 text-[10.5px] font-medium text-ink-soft">
              <IconUser className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">{node.actor}</span>
            </span>
          )}
          {systemTag && (
            <span className="flex items-center gap-1 truncate rounded-full bg-surface px-1.5 py-0.5 text-[10.5px] font-medium text-ink-soft">
              <IconDatabase className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">{systemTag}</span>
            </span>
          )}
        </div>
      )}
      <div className="mt-0.5 flex items-center gap-2">
        {node.sources.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: "SET_EVIDENCE_NODE", id: node.id });
            }}
            className="flex items-center gap-1 rounded-full bg-surface-2 px-1.5 py-0.5 text-[10.5px] font-medium text-ink-soft hover:bg-border-soft"
          >
            <IconPaperclip className="h-2.5 w-2.5" /> {node.sources.length}
          </button>
        )}
        {node.comments.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: "SET_COMMENTS_TARGET", target: { scope: "node", nodeId: node.id } });
              dispatch({ type: "SET_RIGHT_PANEL_MODE", mode: "comments" });
            }}
            className="flex items-center gap-1 rounded-full bg-surface-2 px-1.5 py-0.5 text-[10.5px] font-medium text-ink-soft hover:bg-border-soft"
          >
            <IconComment className="h-2.5 w-2.5" /> {node.comments.length}
          </button>
        )}
      </div>
    </div>
  );
}
