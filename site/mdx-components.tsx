import type { MDXComponents } from "mdx/types";
import {
  Callout,
  EmotionPipeline,
  FitosArchitecture,
  ForcedInclusionPath,
  MediaSlot,
  Photo,
  Screens,
  TdasLatencyChart,
  TdasOrderingResult,
  Terminal,
  Video,
} from "@/components/mdx/Diagrams";
import { Todo } from "@/components/OpenItems";

const components: MDXComponents = {
  Callout,
  EmotionPipeline,
  FitosArchitecture,
  ForcedInclusionPath,
  MediaSlot,
  Photo,
  Screens,
  TdasLatencyChart,
  TdasOrderingResult,
  Terminal,
  Todo,
  Video,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
