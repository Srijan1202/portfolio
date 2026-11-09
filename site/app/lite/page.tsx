import type { Metadata } from "next";
import { HomeContent } from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "2D version",
  description: "The full portfolio without the 3D scene: projects, experience, skills and contact.",
  alternates: { canonical: "/" },
};

export default function LitePage() {
  return <HomeContent mode="lite" />;
}
