import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  MarkerType,
  PanOnScrollMode,
  useReactFlow,
  useViewport,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useApp } from "../lib/store";
import { computeLayout } from "../lib/layout";
import { canvasElRef, canvasSizeRef } from "../lib/canvasRef";
import FlowNode, { type FlowNodeData } from "./FlowNode";
import EmptyState from "./EmptyState";
import { IconMinus, IconPlus, IconFit } from "./icons";

const nodeTypes = { flowNode: FlowNode };

const MINIMAP_COLORS: Record<string, string> = {
  start: "var(--color-success)",
  end: "var(--color-ink-faint)",
  process: "var(--color-brand)",
  decision: "var(--color-warn)",
  io: "var(--color-ink-faint)",
};

function CanvasInner() {
  const { state, dispatch } = useApp();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rf = useReactFlow();

  const layout = useMemo(() => (state.model ? computeLayout(state.model) : null), [state.model]);
  const exceptionNodeIds = useMemo(() => {
    const ids = new Set<string>();
    if (state.model) {
      for (const e of state.model.edges) {
        if (e.label && /exception|reject|fail|escalat/i.test(e.label)) ids.add(e.to);
      }
    }
    return ids;
  }, [state.model]);

  useEffect(() => {
    if (layout) canvasSizeRef.current = { width: layout.width, height: layout.height };
  }, [layout]);

  useEffect(() => {
    canvasElRef.current = wrapperRef.current?.querySelector(".react-flow__viewport") ?? null;
  }, [layout]);

  const resetZoom = useCallback(() => {
    if (!layout || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const topPadding = 48;
    const panY = layout.height <= rect.height ? (rect.height - layout.height) / 2 : topPadding;
    rf.setViewport({ x: (rect.width - layout.width) / 2, y: panY, zoom: 1 }, { duration: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  // Center at 100% zoom the first time a diagram appears, top-anchored for tall diagrams.
  const hasCentered = useRef(false);
  useEffect(() => {
    if (state.model && layout && !hasCentered.current) {
      hasCentered.current = true;
      requestAnimationFrame(resetZoom);
    }
    if (!state.model) hasCentered.current = false;
  }, [state.model, layout, resetZoom]);

  const nodes: Node<FlowNodeData>[] = useMemo(() => {
    if (!state.model || !layout) return [];
    return state.model.nodes.map((n) => {
      const ln = layout.nodes.get(n.id)!;
      return {
        id: n.id,
        type: "flowNode",
        position: { x: ln.x - ln.w / 2, y: ln.y - ln.h / 2 },
        data: { node: n, isException: exceptionNodeIds.has(n.id) },
        selected: state.selectedNodeId === n.id,
        draggable: false,
        connectable: false,
        style: { width: ln.w, height: ln.h },
        width: ln.w,
        height: ln.h,
      };
    });
  }, [state.model, layout, state.selectedNodeId, exceptionNodeIds]);

  const edges: Edge[] = useMemo(() => {
    if (!state.model) return [];
    return state.model.edges.map((e) => {
      const selected = state.selectedEdgeId === e.id;
      const color = selected ? "var(--color-brand)" : "var(--color-ink-faint)";
      return {
        id: e.id,
        source: e.from,
        target: e.to,
        label: e.label,
        type: "smoothstep",
        selected,
        style: { stroke: color, strokeWidth: selected ? 2.5 : 1.75 },
        labelStyle: { fill: selected ? "var(--color-brand-deep)" : "var(--color-ink-soft)", fontWeight: 600, fontSize: 11.5 },
        labelBgStyle: { fill: "var(--color-surface)" },
        labelBgPadding: [4, 2] as [number, number],
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
      };
    });
  }, [state.model, state.selectedEdgeId]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => dispatch({ type: "SELECT_NODE", id: node.id }),
    [dispatch],
  );
  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => dispatch({ type: "SELECT_EDGE", id: edge.id }),
    [dispatch],
  );
  const onPaneClick = useCallback(() => dispatch({ type: "SELECT_NODE", id: null }), [dispatch]);

  if (!state.model || !layout) {
    return (
      <div className="relative flex-1 overflow-hidden bg-canvas">
        <EmptyState />
      </div>
    );
  }

  const selectedEdge = state.selectedEdgeId ? state.model.edges.find((e) => e.id === state.selectedEdgeId) : null;

  return (
    <div ref={wrapperRef} className="relative flex-1 overflow-hidden bg-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        minZoom={0.15}
        maxZoom={2}
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Free}
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="var(--color-border)" />
        <MiniMap
          pannable
          zoomable
          position="bottom-right"
          className="!m-4 !overflow-hidden !rounded-xl !border !border-border !bg-surface !shadow-md"
          maskColor="rgba(20, 32, 26, 0.06)"
          nodeColor={(n) => MINIMAP_COLORS[(n.data as unknown as FlowNodeData)?.node?.type ?? "process"] ?? "var(--color-ink-faint)"}
          nodeStrokeWidth={0}
        />
      </ReactFlow>

      {selectedEdge && (
        <div className="absolute left-4 top-4 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-ink-soft shadow-sm">
          Connection: <span className="font-medium text-ink">{state.model.nodes.find((n) => n.id === selectedEdge.from)?.label}</span>
          {" → "}
          <span className="font-medium text-ink">{state.model.nodes.find((n) => n.id === selectedEdge.to)?.label}</span>
          {selectedEdge.label && <span className="ml-1 rounded bg-surface-2 px-1.5 py-0.5">{selectedEdge.label}</span>}
        </div>
      )}

      <ZoomBar onFit={() => rf.fitView({ padding: 0.08, duration: 200 })} onReset={resetZoom} />
    </div>
  );
}

function ZoomBar({ onFit, onReset }: { onFit: () => void; onReset: () => void }) {
  const rf = useReactFlow();
  const { zoom } = useViewport();

  return (
    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-surface px-1.5 py-1.5 shadow-md">
      <button onClick={() => rf.zoomOut({ duration: 150 })} className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface-2" title="Zoom out">
        <IconMinus />
      </button>
      <span className="w-12 text-center text-xs font-semibold text-ink-soft">{Math.round(zoom * 100)}%</span>
      <button onClick={() => rf.zoomIn({ duration: 150 })} className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface-2" title="Zoom in">
        <IconPlus />
      </button>
      <div className="mx-1 h-5 w-px bg-border" />
      <button onClick={onFit} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface-2" title="Fit to screen">
        <IconFit /> Fit
      </button>
      <button onClick={onReset} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface-2" title="Reset to 100%">
        Reset
      </button>
    </div>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
