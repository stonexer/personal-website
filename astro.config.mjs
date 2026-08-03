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
