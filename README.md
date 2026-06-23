# My Web Template

A configurable personal website template built with React, Vite, Bootstrap, and GitHub Pages.

It ships with a lightweight local console for language, theme, content management, visibility control, Markdown editing, and grid-based edit mode.

## Local Development

```bash
npm install
npm run dev
```

The console is intentionally lightweight because this is a static GitHub Pages site.
The default console password is `password` and is defined in `src/main.jsx`.

## Editing Content

Most public content lives in `src/siteData.js`.

- Add, remove, or edit entries in `defaultContentItems`.
- Change default section names and ordering in `defaultSections`.
- Use `visible: true` or `visible: false` to choose the default public state.
- Put Chinese text under `zh` and English text under `en`.
- Run `npm run build` after edits to verify the site still builds.

The browser console controls are saved in `localStorage`, so they only affect the current browser unless you also update `src/siteData.js`.
To change what everyone sees on GitHub Pages by default, edit `src/siteData.js` and redeploy.

## Editing Experience

- The settings button opens language, theme, and console controls.
- The console is a separate full-screen interface instead of an overlay on the homepage.
- The homepage hero is a special block with visibility control and portrait upload.
- Content editing and content sorting are separated; sorting uses draggable section and item rows.
- Item descriptions support Markdown rendering and a reusable MDXEditor modal.
- MDXEditor attachments are stored in `localStorage` as data URLs for now.
- Layout tuning is entered from the console and uses `react-moveable` for pointer-based drag and resize with snapping guides.
- Exiting layout tuning returns to the unlocked console view.
- Layout saving is blocked when blocks overlap, and overlap warnings are shown persistently after drag or resize.
- Layout changes are edited as a draft and are committed only after the save check passes.
- The layout tuning action bar stays sticky near the top while editing.
- Layout tuning uses the same container width as the public homepage.
- Layout tuning uses a finer vertical grid for less rigid height adjustment.
- The unlocked console session is preserved in `sessionStorage` for the current browser session.
- Layout tuning includes save-current-layout and restore-default-layout buttons.
- GitHub-Flavored Markdown tables are rendered on the public page.

## Build

```bash
npm run build
```

The site is configured for GitHub Pages under the `/my-web/` base path.
