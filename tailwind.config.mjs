import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        fg: 'var(--tx)',
        muted: 'var(--tx-2)',
        faint: 'var(--tx-3)',
        border: 'var(--divider)',
        surface: 'var(--ui)',
      },
      maxWidth: {
        // The reading column.
        measure: '674px',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'system-ui',
          '"Segoe UI"',
          'Helvetica',
          'Arial',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Noto Sans SC"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
        mono: ['"SF Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [typography],
};
