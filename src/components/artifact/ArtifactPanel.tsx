import { useApp } from "../../lib/store";
import ArtifactHeader from "./ArtifactHeader";
import Canvas from "../Canvas";
import MermaidView from "../MermaidView";
import DocumentationView from "../DocumentationView";
import RightPanel from "../RightPanel";

export default function ArtifactPanel() {
  const { state } = useApp();

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden border-l border-border">
      <ArtifactHeader />
      <div className="flex flex-1 overflow-hidden">
        {state.view === "diagram" && <Canvas />}
        {state.view === "mermaid" && <MermaidView />}
        {state.view === "documentation" && <DocumentationView />}
        {state.view !== "documentation" && <RightPanel />}
      </div>
    </div>
  );
}
