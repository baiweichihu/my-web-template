# TODO

## Phase 1 - Static Personal Website Template

- [x] Clone the empty repository locally.
- [x] Scaffold a React + Vite + Bootstrap static site.
- [x] Create a data model where each personal item has visibility, section, language text, and ordering.
- [x] Build the public-facing personal website view.
- [x] Build the owner-only console gate and visibility controls.
- [x] Add language switching for Chinese and English content.
- [x] Add light and deep-blue dark theme support.
- [x] Add responsive layouts for desktop and mobile.
- [x] Add GitHub Pages build and deploy configuration.
- [x] Verify local build.

## Phase 2 - Open Template Console

- [x] Change the default console password to `password`.
- [x] Move language and theme controls into an icon-based settings panel.
- [x] Localize console labels in Chinese and English.
- [x] Convert the console into a full-screen configuration workspace.
- [x] Replace section control with tree-style content control for sections and items.
- [x] Merge section and item visibility into a tree-style visibility control.
- [x] Use custom modals for adding sections and items.
- [x] Remove section short labels and stored section numbers from the data model.
- [x] Move the console entry into the settings panel.
- [x] Make the console a separate full-screen interface instead of a homepage overlay.
- [x] Add a special homepage hero block with visibility control and portrait upload.
- [x] Replace the lightweight Markdown textarea with MDXEditor.
- [x] Keep attachments in localStorage as data URLs for now.
- [x] Move the layout tuning entry into the console and remove the top-level edit-mode toggle.
- [x] Add a clear homepage layout-tuning banner with an exit button.
- [x] Make blocks gray and text unselectable while dragging or resizing.
- [x] Add grid-based layout tuning with draggable and resizable snapped blocks.
- [x] Replace free dragging with edge-button layout tuning.
- [x] Make layout mode text unselectable at all times.
- [x] Auto-exit layout mode when leaving the console through the close button.
- [x] Add GitHub-Flavored Markdown table rendering on the public page.
- [x] Return to the unlocked console after exiting layout tuning.
- [x] Normalize layout updates to prevent overlaps while allowing floating blocks.
- [x] Match layout tuning width to the public homepage container.
- [x] Add save-current-layout and restore-default-layout buttons.

## Known Issues

- [ ] Layout tuning currently uses a fixed vertical movement unit, which makes vertical adjustments feel too rigid. A more flexible vertical sizing and movement model should be evaluated.
- [ ] Exiting layout tuning may still require re-entering the console password in some flows. The unlocked console session should be preserved consistently when returning from layout tuning.

## Later Ideas

- Add real content to replace placeholder profile, project, creative work, and timeline entries.
- Add Japanese content support after the Chinese and English versions feel stable.
- Add a guestbook when a backend or hosted comment provider is chosen.
- Add richer project detail pages if the portfolio grows.
- Add import/export for console settings so template users can persist configuration outside localStorage.
- Add a generator command that writes console changes back into `src/siteData.js`.
