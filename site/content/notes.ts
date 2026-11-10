/**
 * Sticky notes on the 3D desk: short true stories from building the projects.
 * Every fact here is also in the matching case study.
 */
export type Note = { id: string; slug: string; title: string; text: string };

export const notes: Note[] = [
  {
    id: "r8",
    slug: "fitos",
    title: "The crash that only happened in release",
    text: "R8 code shrinking broke WorkManager in FITOS release builds only, so it never showed up in testing. Found, fixed and shipped as a hotfix the same day.",
  },
  {
    id: "blind-spot",
    slug: "thermal-aware-job-ordering",
    title: "The tool that saw nothing",
    text: "Linux's scaling_cur_freq showed a steady 1800 MHz in every one of 6,894 samples while the firmware was throttling the chip to 1629 MHz. The throttling had to be read from the firmware clock instead.",
  },
  {
    id: "watchdog",
    slug: "thermal-aware-job-ordering",
    title: "The safety monitor was the problem",
    text: "Random stalls in the Pi experiment traced back to the safety watchdog itself: 8 of 8 stalls lined up with its checks. It was rewritten to start no new processes.",
  },
  {
    id: "clone",
    slug: "emotion-detection",
    title: "A chip that lies about itself",
    text: "The clone MPU6050 motion sensor answers WHO_AM_I with 0x70 instead of the expected value, so the driver had to be taught to accept it.",
  },
  {
    id: "selector",
    slug: "l2-escape-bench",
    title: "The bug nothing could reach",
    text: "The harness called forceInclude, a function that doesn't exist (the real one is forceInclusion). It survived code review and a 100-run campaign because that code path can't run on a healthy chain. It was found by reading the deployed contract.",
  },
];
