// @ts-check
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://sitixi.com',
	i18n: {
		locales: ['en', 'zh'],
		defaultLocale: 'en',
		routing: {
			prefixDefaultLocale: true,
			// Astro's own root redirect is a meta refresh with a 2 second delay.
			// Turning it off lets src/pages/index.astro handle "/" instantly, and
			// lets public/_redirects issue a real 301 on Netlify.
			redirectToDefaultLocale: false,
		},
	},
	markdown: {
		shikiConfig: {
			// Two themes, no baked-in default: Shiki emits both as CSS variables
			// and global.css picks one, so code follows the site's light/dark.
			themes: {
				light: 'vitesse-light',
				dark: 'vitesse-dark',
			},
			defaultColor: false,
			wrap: false,
		},
	},
	integrations: [react(), tailwind()],
});
