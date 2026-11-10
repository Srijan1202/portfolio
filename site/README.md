# srijansri.tech

3D portfolio for Srijan Srivastava, built from `../master.md`. A single Next.js 16 app (App Router, TypeScript, Tailwind v4, Cache Components). All content is server-rendered HTML; a React Three Fiber "workbench" scene mounts behind it on capable devices.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
```

## Where things live

| What | File |
|---|---|
| Project data: cards, 3D labels, detail-page headers, open items | `content/projects.ts` |
| Case-study copy | `content/projects/<slug>.mdx` |
| Bio, experience, skills, leadership, contact | `content/site.ts` |
| Diagrams and the TDAS chart used in MDX | `components/mdx/Diagrams.tsx`, registered in `mdx-components.tsx` |
| Home page content (shared by `/` and `/lite`) | `components/HomeContent.tsx` |
| HTML controls for the station interactions | `components/StationControls.tsx` |
| Shared state between the HTML and the 3D scene | `lib/store.ts` (zustand) |
| Illustrative models behind the animations | `lib/sim.ts` |
| WebGL / low-end / reduced-motion / slow-device gate | `components/WebGLGate.tsx` |
| Scroll → camera mapping and ← → keyboard navigation | `components/RailTracker.tsx`, `components/three/CameraRail.tsx` |
| The scene | `components/three/Workbench.tsx`, `Desk.tsx`, `stations/*.tsx` |

## Filling in the open items

Every unconfirmed fact from master.md §9 shows on the site as an amber **"needs input"** note, so nothing unverified ships silently.

- **Per project:** edit `openItems` in `content/projects.ts`. Delete an item once you've filled it and its note disappears.
- **Inside case studies:** search the MDX files for `<Todo` and `<MediaSlot`.
- **Resume:** `public/resume.pdf`. Replace the file to update it. It includes the phone number, by choice.
- **Media:** images in `public/images/<project>/`, video in `public/videos/`. In MDX, use `<Photo>`, `<Screens>` and `<Video>` (see `fitos.mdx`). Web video is H.264 MP4 with a poster frame, re-encoded with ffmpeg (the 60 MB source became 1.3 MB).
- **3D phone screen:** `SCREENSHOTS` in `stations/Phone.tsx` maps a feature to a real screenshot. Features without one (Running, AI Coach) use the drawn screen.

## Local builds on this machine

Windows Application Control (Smart App Control) blocks Tailwind's native binary (`@tailwindcss/oxide-win32-x64-msvc`). Tailwind then falls back to its WASI build, which can't read the project files, so **local builds compile with no utility classes and look unstyled**. Vercel builds on Linux and is unaffected. To check a change, deploy a preview with `npx vercel deploy` (not `--prod`) and open the URL it prints.

## How the 3D layer behaves

- Content first. The scene is loaded with `next/dynamic` and `ssr: false`, then fades in after the HTML has painted.
- Every element with `data-rail="<stop>"` is a camera stop: 0 hero, 1–4 projects, 5 overview (about/skills/leadership), 6 contact.
- **Fallbacks:**
  - no WebGL → HTML only, with a link to `/lite`
  - low-end device → off by default
  - phones → "low" quality: no bloom, lower DPR
  - `prefers-reduced-motion` → the camera cuts between stops instead of gliding, and idle animations freeze
- **Frame guard** (`FrameGuard` in `Workbench.tsx`): if frames average over 70 ms, the scene drops to low quality. If it's still slow, or hopeless (over 400 ms, e.g. software rendering), it turns itself off for the session. A manual "3D scene: on" click overrides the guard.
- **Honesty rule:** animations are illustrations (`lib/sim.ts`). Measured numbers appear only in HTML, with sources.
- **Perf debugging:** open any page with `?debug3d` to expose the R3F state as `window.__r3f`, e.g. `__r3f.gl.info.programs.length`.

### Lighting budget

Every dynamic light makes every lit material's shader bigger. On Windows/ANGLE a slow first compile can stall the page, or even reset the GPU. Keep the scene at roughly one point light (currently the Pi's heat glow) and use emissive materials plus bloom for glows. Avoid `transmission` materials: they render the whole scene a second time every frame.

## Deviations from master.md

- **Camera rail:** driven by native window scroll instead of drei `ScrollControls`, so the HTML content stays in normal document flow (accessibility, anchors, find-in-page). Damping uses `THREE.MathUtils.damp` instead of GSAP.
- **2D panel transitions:** CSS instead of Framer Motion (one less dependency).
- **No-WebGL visitors on `/`:** they get the same HTML page without the canvas, rather than a redirect to `/lite`. The content is identical and there's no layout jump. `/lite` still exists as a standalone 2D page.
- **Detail-page header model** (`components/ProjectModel.tsx` → `three/StationPreview.tsx`): reuses the station component on a transparent canvas, desktop and tablet only. It follows the same on/off rules as the home scene (`lib/webgl.ts`), pauses when scrolled out of view, and switches off if frames average over 70 ms.

## Extras

| Feature | Where | Notes |
|---|---|---|
| 60-second tour | `components/Tour.tsx` | Scrolls stop to stop with captions; any scroll, key or touch stops it. |
| Role filter | `components/SkillsGrid.tsx`, `roles` in `content/site.ts` | Highlights the skill groups and projects behind each kind of role. |
| Plain-English summary | `plain` on each project in `content/projects.ts` | Shown as a toggle on the case study. |
| Print one-pager | `components/PrintButton.tsx`, print rules in `app/globals.css` | |
| "Now" line | `profile.now` in `content/site.ts` | Update it as things change. |
| Terminal | `components/Terminal.tsx` | `help` lists commands; `lamp`, `sound`, `coffee` drive the 3D desk. |
| Ask my portfolio | `app/api/ask/route.ts` | Uses Gemini's free tier. **Off until `GEMINI_API_KEY` is set in the Vercel project** (`GEMINI_MODEL` overrides the default `gemini-3.8-flash`). On the free tier Google may use questions to improve its products. Rate limits are per server instance. |
| Sticky notes | `content/notes.ts`, `components/three/Extras.tsx`, `components/DeskUI.tsx` | Every note's fact must also be in a case study. |
| Lamp, daylight, mug steam, photo mode, sounds, tilt | `components/three/Extras.tsx`, `Desk.tsx`, `lib/sound.ts`, `CameraRail.tsx` | Room light follows the visitor's local time. Sound is off by default. Tilt is Android only. |
