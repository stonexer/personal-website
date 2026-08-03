export const languages = {
  en: 'EN',
  zh: '中文',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';

export const ui = {
  en: {
    'site.title': 'SToneX',
    'home.intro.before': "Hi, I'm Tianxin Shi (SToneX). I'm building a few AI products, such as ",
    'home.intro.and': ' and ',
    'home.intro.sep': ', ',
    'home.intro.after':
      ". I'm also constantly exploring the best ways to use AI, feel free to reach out anytime.",
    'home.building': 'Current projects',
    'home.since': 'since',
    'home.latest': 'Latest',
    'home.writing': 'Writing',
    'home.keepReading': 'Keep reading →',
    'post.readMore': 'Read',
    'post.backToHome': '← All writing',
    'post.updated': 'Updated',
    'post.empty': 'Nothing here yet.',
    'post.readingTime': 'minute read',
    'footer.follow': 'Get in touch',
    'footer.followNote': '',
    'footer.email': 'Email',
    'theme.toggle': 'Toggle dark mode',
  },
  zh: {
    'site.title': 'SToneX',
    'home.intro.before': 'Hi，我是石天鑫（SToneX）。我正在做一些 AI 相关的产品，比如 ',
    'home.intro.and': ' 和 ',
    'home.intro.sep': '、',
    'home.intro.after': '。同时我也一直在探索使用 AI 的最佳实践，欢迎随时交流。',
    'home.building': '正在做的项目',
    'home.since': '始于',
    'home.latest': '最新',
    'home.writing': '写作',
    'home.keepReading': '继续读 →',
    'post.readMore': '阅读',
    'post.backToHome': '← 全部文章',
    'post.updated': '更新于',
    'post.empty': '这里还什么都没有。',
    'post.readingTime': '分钟',
    'footer.follow': '欢迎联系',
    'footer.followNote': '',
    'footer.email': '邮件',
    'theme.toggle': '切换深色模式',
  },
} as const;

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

const dateLocale: Record<Lang, string> = {
  en: 'en-US',
  zh: 'zh-CN',
};

export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(dateLocale[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    // Front matter dates are bare days parsed as UTC midnight; without this a
    // negative-offset reader would see the day before.
    timeZone: 'UTC',
  }).format(date);
}

/** "2019 · 06", the compact stamp used down the left of the writing list. */
export function formatStamp(date: Date): string {
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${date.getUTCFullYear()} · ${month}`;
}
