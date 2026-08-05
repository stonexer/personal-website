# personal-website

The source of [sitixi.com](https://sitixi.com) - a bilingual (English / 中文) writing
home built with [Astro](https://astro.build), React islands and Tailwind CSS.

## Project structure

```text
/
├── public/
│   ├── _redirects          # Netlify rules, incl. the 301 from "/" to "/en/"
│   ├── audio/
│   └── favicon.svg
├── src/
│   ├── components/         # .astro layout pieces + React islands for /desktop
│   ├── content/blog/       # posts as <lang>/<slug>/index.md, paired by `slug`
│   ├── content.config.ts   # the blog collection schema
│   ├── data/projects.ts    # the "Current projects" list on the homepage
│   ├── i18n/               # UI strings, post helpers, date formatting
│   ├── layouts/
│   ├── pages/              # file-based routes, incl. the [lang] dynamic routes
│   └── styles/global.css
├── astro.config.mjs
└── tailwind.config.mjs
```

Posts live under `src/content/blog/<lang>/<slug>/index.md`. A post's front matter
carries `title`, `description`, `pubDate`, `slug`, and optionally `updatedDate`,
`tags` and `draft`. Translations of the same piece share one `slug`, which is how
the language switcher finds its counterpart.

`/desktop` is an unlinked easter egg holding the original retro-desktop homepage.

## Commands

All commands are run from the root of the project:

| Command          | Action                                           |
| :--------------- | :----------------------------------------------- |
| `pnpm install`   | Install dependencies                             |
| `pnpm dev`       | Start the local dev server at `localhost:4321`   |
| `pnpm build`     | Build the production site to `./dist/`           |
| `pnpm preview`   | Preview the build locally, before deploying      |
| `pnpm astro ...` | Run CLI commands like `astro add`, `astro check` |
