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
  // Wide tables scroll sideways on phones instead of widening the page.
  table: (props) => (
    <div className="table-scroll">
      <table {...props} />
    </div>
  ),
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
