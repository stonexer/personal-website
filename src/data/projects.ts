import type { Lang } from '../i18n/ui';

/**
 * The "Building" section of the homepage. Edit this list to change what the
 * page says you are working on. Nothing else needs to be touched.
 */
export interface Project {
  name: string;
  url: string;
  /** Shown next to the name, e.g. "2025". */
  since: string;
  blurb: Record<Lang, string>;
}

export const projects: Project[] = [
  {
    name: 'Superdesign',
    url: 'https://superdesign.dev',
    since: '2026',
    blurb: {
      en: 'An AI product design agent. Describe an interface; get something you can actually ship.',
      zh: 'AI 产品设计 Agent。描述一个界面，拿到可以真正落地的东西。',
    },
  },
  {
    name: 'Loopany',
    url: 'https://loopany.ai',
    since: '2026',
    blurb: {
      en: 'Maybe getting an agent through a looooong task only takes a dozen scheduled jobs, working together?',
      zh: '让 Agent 完成一个很很很长的任务，也许只需要一打相互配合的定时任务？',
    },
  },
];
