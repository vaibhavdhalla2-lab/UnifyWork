import { useApp } from "./lib/store";
import Sidebar from "./components/shared/Sidebar";
import ChatPanel from "./components/chat/ChatPanel";
import LandingScreen from "./components/landing/LandingScreen";
import ArtifactPanel from "./components/artifact/ArtifactPanel";
import PlanView from "./components/PlanView";
import BuildProgress from "./components/BuildProgress";
import ModifyPreviewModal from "./components/ModifyPreviewModal";
import EvidencePanel from "./components/EvidencePanel";
import Toasts from "./components/Toasts";

export default function App() {
  const { state } = useApp();

  if (!state.hydrated) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-canvas">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 overflow-hidden">
        {state.model ? (
          <>
            <ChatPanel />
            <ArtifactPanel />
          </>
        ) : (
          <LandingScreen />
        )}
      </div>

      <PlanView />
      <BuildProgress />
      <ModifyPreviewModal />
      <EvidencePanel />
      <Toasts />
    </div>
  );
}
