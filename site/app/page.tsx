import { HomeContent } from "@/components/HomeContent";
import { WebGLGate } from "@/components/WebGLGate";
import { RailTracker } from "@/components/RailTracker";
import { ProjectPanel } from "@/components/ProjectPanel";

export default function Home() {
  return (
    <>
      {/* All content is server-rendered HTML; the 3D layer mounts behind it afterwards. */}
      <WebGLGate />
      <RailTracker />
      <HomeContent mode="full" />
      <ProjectPanel />
    </>
  );
}
