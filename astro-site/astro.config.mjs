import { defineConfig } from 'astro/config';

const getBasePath = () => {
  if (process.env.BASE_PATH !== undefined) return process.env.BASE_PATH;
  if (process.env.GITHUB_ACTIONS && process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    return repo ? `/${repo}` : undefined;
  }
  return undefined;
};

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://www.opportunity-painting.com',
  base: getBasePath(),
  build: {
    format: 'file'
  }
});

