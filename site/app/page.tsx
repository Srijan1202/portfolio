import type { Metadata } from "next";
import { HomeContent } from "@/components/HomeContent";
import { WebGLGate } from "@/components/WebGLGate";
import { RailTracker } from "@/components/RailTracker";
import { ProjectPanel } from "@/components/ProjectPanel";
import { DeskUI } from "@/components/DeskUI";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      {/* All content is server-rendered HTML; the 3D layer mounts behind it afterwards. */}
      <WebGLGate />
      <RailTracker />
      <HomeContent mode="full" />
      <ProjectPanel />
      <DeskUI />
    </>
  );
}
