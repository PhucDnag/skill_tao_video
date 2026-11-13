# Video skill workspace

For video creation or editing, read `SKILL.md` and the relevant linked references first. This repository is the complete `video-story-director` skill runtime, not a website. Author a topic-specific project and use the CLI to render it. Do not restore a Web Studio or public API unless requested.

Keep authored `projects/` and `voices/` data. Generated media and temporary QA artifacts belong in ignored `output/`. After runtime edits, run `npm test`; after skill edits, run the skill-creator validator with Python UTF-8 mode if available. Do not describe keyword-based `--script` as an AI semantic director.

User presentation requirements apply to ALL layouts, including `neon-story-stage` and `style: phatbieulungtung`: bright backgrounds, bottom uppercase subtitles, current spoken word yellow. Legacy `caption`, `captionBeats`, and `captionY` must not restore top captions. Only explicit user preference for a dark theme permits `visualTheme: dark`; never infer it from scene/layout names. Do not modify shared rendering code to match outdated reference styling while creating a video. Run the legacy-metadata regression test and inspect frames extracted from the actual exported MP4 before delivery. Topic-specific action/storyboarding remains necessary: a palette/subtitle change alone does not fix a mismatched scene.

For finished 2D/3D cartoon videos, read `references/animation-production.md`. Primitive mannequins, wireframe rooms, static cards, and repeated idle bobbing are blocking assets, not the requested final animation quality. Establish a consistent character/environment design and complete a representative acting shot before full production. Do not claim that skill instructions alone implemented missing rigs, assets, or rendering capabilities.
