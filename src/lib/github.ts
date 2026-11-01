import { siteConfig, featuredCopy } from '../config';

type GithubRepo = {
  name: string; full_name: string; html_url: string; description: string | null;
  pushed_at: string; fork: boolean;
  archived?: boolean; disabled?: boolean;
  readmeDescription?: string;
};

const api = 'https://api.github.com';
const headers: HeadersInit = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(import.meta.env.GITHUB_TOKEN ? { Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}` } : {}),
};

export async function getGithubRepos(): Promise<GithubRepo[]> {
  try {
    const repos: GithubRepo[] = [];
    let url: string | null = `${api}/users/${siteConfig.githubUser}/repos?type=public&sort=pushed&direction=desc&per_page=100`;
    while (url) {
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`GitHub repos returned ${response.status}`);
      repos.push(...((await response.json()) as GithubRepo[]));
      url = response.headers.get('Link')?.match(/<([^>]+)>;\s*rel="next"/)?.[1] ?? null;
    }
    return repos;
  } catch (error) {
    console.warn('GitHub repo fetch unavailable; showing featured case-study copy only.', error);
    return [];
  }
}

async function readmeDescription(repo: GithubRepo): Promise<string> {
  try {
    const response = await fetch(`${api}/repos/${repo.full_name}/readme`, { headers });
    if (!response.ok) return '';
    const data = await response.json() as { content?: string; encoding?: string };
    if (!data.content || data.encoding !== 'base64') return '';
    const markdown = atob(data.content.replace(/\s/g, ''));
    const blocks = markdown.split(/\r?\n\s*\r?\n/);
    const cleanText = (part: string) => part
      .replace(/<!--([\s\S]*?)-->/g, '')
      .replace(/[`*_>#\[\]]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const summary = blocks
      .map(cleanText)
      .find((part) => part && part.split(' ').length > 3 && !/^(?:!|<|[-*+])/.test(part));
    return (summary || blocks.map(cleanText).find((part) => part && !part.startsWith('#') && !part.startsWith('![')) || '').slice(0, 320);
  } catch {
    return '';
  }
}

export async function getFeatured(repos: GithubRepo[]) {
  return await Promise.all(siteConfig.featuredRepos.map(async (name) => {
    const copy = featuredCopy[name] ?? { title: name, problem: '', contribution: '', fallback: '', status: 'open source' };
    const repo = repos.find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (!repo || name === 'edQorta') {
      return { ...copy, name, repo: null, description: copy.fallback };
    }
    const description = await readmeDescription(repo);
    return { ...copy, name, repo, description: description || copy.fallback };
  }));
}

export async function getRecentRepos(repos: GithubRepo[]) {
  const featured = new Set(siteConfig.featuredRepos.map((name) => name.toLowerCase()));
  const excluded = /^(0xdfinity|profile|readme|template|hello-world|test|playground|archive)(-|$)/i;
  const selected = repos
    .filter((repo) => !repo.fork && !repo.archived && !repo.disabled && !featured.has(repo.name.toLowerCase()) && !excluded.test(repo.name));
  const withReadmes = await Promise.all(selected.map(async (repo) => ({ ...repo, readmeDescription: await readmeDescription(repo) })));
  return withReadmes.filter((repo) => repo.readmeDescription).slice(0, 6);
}
